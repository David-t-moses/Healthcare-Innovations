"use server";

import prisma from "@/lib/prisma";

export async function getStaffList() {
  try {
    const staffList = await prisma.staffStatus.findMany({
      orderBy: {
        lastUpdated: "desc",
      },
    });
    return { success: true, data: staffList };
  } catch (error) {
    console.error("Error fetching staff list:", error);
    return { success: false, error: "Failed to fetch staff list" };
  }
}

export async function updateStaffStatus(staffId: string, status: string) {
  try {
    const updatedStaff = await prisma.staffStatus.update({
      where: { id: staffId },
      data: {
        status,
        lastUpdated: new Date(),
      },
    });
    return { success: true, data: updatedStaff };
  } catch (error) {
    return { success: false, error: "Failed to update staff status" };
  }
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

export async function getActiveStaff() {
  try {
    const staff = await prisma.staffStatus.findMany({
      take: 3,
      orderBy: {
        lastUpdated: "desc",
      },
    });
    console.log("Fetched staff:", staff);
    return staff;
  } catch (error) {
    console.log("Staff fetch error:", error);
    return [];
  }
}
