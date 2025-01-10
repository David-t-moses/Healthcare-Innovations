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
        },
      },
    },
  });
});

export async function deleteVendor(id: string) {
  return await prisma.vendor.delete({
    where: { id },
  });
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
