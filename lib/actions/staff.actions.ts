"use server";

import prisma from "@/lib/prisma";
import { cache } from "react";

export const getStaffList = cache(async () => {
  try {
    const staffList = await prisma.staffStatus.findMany({
      orderBy: { lastUpdated: "desc" },
      select: {
        id: true,
        name: true,
        role: true,
        status: true,
        email: true,
        lastUpdated: true,
      },
    });
    return { success: true, data: staffList };
  } catch (error) {
    return { success: false, error: "Failed to fetch staff list" };
  }
});

export async function updateStaffStatus(staffId: string, status: string) {
  return prisma.$transaction(async (tx) => {
    const updatedStaff = await tx.staffStatus.update({
      where: { id: staffId },
      data: { status, lastUpdated: new Date() },
      select: {
        id: true,
        status: true,
        lastUpdated: true,
      },
    });
    return { success: true, data: updatedStaff };
  });
}

export async function addStaffMember({
  name,
  email,
  role,
  status,
}: {
  name: string;
  email: string;
  role: string;
  status: string;
}) {
  try {
    const staffStatus = await prisma.staffStatus.create({
      data: {
        name,
        role,
        status,
        email,
      },
    });

    return { success: true, data: staffStatus };
  } catch (error) {
    console.error("Error adding staff member:", error);
    return { success: false, error: "Failed to add staff member" };
  }
}

export async function deleteStaff(staffId: string) {
  try {
    await prisma.staffStatus.delete({
      where: { id: staffId },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting staff:", error);
    return { success: false, error: "Failed to delete staff member" };
  }
}

export const getActiveStaff = cache(async () => {
  return prisma.staffStatus.findMany({
    take: 3,
    orderBy: { lastUpdated: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      lastUpdated: true,
    },
  });
});
