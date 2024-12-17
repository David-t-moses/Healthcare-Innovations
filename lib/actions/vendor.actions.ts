"use server";

import prisma from "@/lib/prisma";

export async function createVendor(data: {
  name: string;
  email: string;
  phone: string;
  address: string;
}) {
  return await prisma.vendor.create({
    data,
  });
}

export async function getVendors() {
  return await prisma.vendor.findMany({
    include: {
      stockItems: true,
    },
  });
}

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
