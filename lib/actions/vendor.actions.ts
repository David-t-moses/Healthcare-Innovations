"use server";

import prisma from "@/lib/prisma";
import { cache } from "react";

export async function createVendor(data: {
  name: string;
  email: string;
  phone: string;
  address: string;
}) {
  return await prisma.$transaction(async (tx) => {
    return tx.vendor.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
      },
    });
  });
}

export const getVendors = cache(async () => {
  return await prisma.vendor.findMany({
    include: {
      stockItems: {
        select: {
          id: true,
          name: true,
          quantity: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          rejectionReason: true,
        },
      },
      orders: {
        select: {
          id: true,
          status: true,
          quantity: true,
          createdAt: true,
          updatedAt: true,
          rejectionReason: true,
        },
      },
    },
  });
});

export async function deleteVendor(id: string) {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        stockItems: {
          where: {
            status: "PENDING",
          },
        },
      },
    });

    if (!vendor) {
      throw new Error("Vendor not found");
    }

    if (vendor.stockItems.length > 0) {
      throw new Error("Cannot delete vendor with pending stock items");
    }

    const deleted = await prisma.vendor.delete({
      where: { id },
    });

    return deleted;
  } catch (error) {
    console.error("Delete vendor error:", error);
    throw error;
  }
}

export async function updateVendor(
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  }
) {
  return await prisma.vendor.update({
    where: { id },
    data,
  });
}

export async function getVendorMetricsData(vendorId: string) {
  try {
    const stockItems = await prisma.stockItem.findMany({
      where: {
        vendorId: vendorId,
      },
      select: {
        id: true,
        status: true,
        rejectionReason: true,
        createdAt: true,
      },
    });

    const orders = await prisma.stockOrder.findMany({
      where: {
        vendorId: vendorId,
      },
      select: {
        id: true,
        status: true,
        rejectionReason: true,
        createdAt: true,
      },
    });

    const totalRequested = stockItems.length;
    const processed = stockItems.filter(
      (item) => item.status === "COMPLETED"
    ).length;
    const rejected = stockItems.filter(
      (item) => item.status === "REJECTED"
    ).length;
    const pending = stockItems.filter(
      (item) => item.status === "PENDING"
    ).length;

    const successRate =
      totalRequested > 0
        ? ((processed / totalRequested) * 100).toFixed(1)
        : "0.0";

    return {
      totalRequested,
      processed,
      rejected,
      pending,
      successRate,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error("Error fetching vendor metrics:", error);
    throw error;
  }
}
