"use server";

import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";

type ProfileUpdateData = {
  fullName: string;
  email: string;
  note?: string;
};

export async function updateNotificationPreferences(
  userId: string,
  preferences: {
    emailNotifications: boolean;
    appointmentReminders: boolean;
  }
) {
  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        notificationPreferences: preferences,
      },
    });
    return { success: true, data: updated };
  } catch (error) {
    return {
      success: false,
      error: "Failed to update notification preferences",
    };
  }
}

export async function updateProfile(
  currentEmail: string,
  data: ProfileUpdateData
) {
  const updateData = {
    fullName: String(data.fullName),
    email: String(data.email),
  };

  const updatedUser = await prisma.user.update({
    where: {
      email: String(currentEmail),
    },
    data: updateData,
  });

  return {
    success: true,
    data: updatedUser,
  };
}

export async function updatePassword(
  userId: string,
  data: {
    currentPassword: string;
    newPassword: string;
  }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const isValid = await compare(data.currentPassword, user.password);
    if (!isValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    const hashedPassword = await hash(data.newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update password" };
  }
}

export async function getUserSettings(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        note: true,
      },
    });
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: "Failed to fetch user settings" };
  }
}
