"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { cookies } from "next/headers";

import { hash, compare } from "bcryptjs";
import { cache } from "react";

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

export async function updateProfile(data: ProfileUpdateData) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    // Removed Supabase auth update

    // Update database
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        fullName: data.fullName,
        email: data.email,
      },
    });

    return { success: true, data: updatedUser };
  } catch (error) {
    return { success: false, error: "Failed to update profile" };
  }
}

export const getUserSettings = cache(async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      note: true,
      notificationPreferences: true,
    },
  });
});

export async function updatePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "User not authenticated" };
    }

    // Verify current password
    const isValidPassword = await compare(
      data.currentPassword,
      currentUser.password
    );
    if (!isValidPassword) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Hash and update new password
    const hashedPassword = await hash(data.newPassword, 12);
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update password" };
  }
}

export async function updateSystemPreferences(preferences: {
  calendarView: string;
  timeZone: string;
}) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error("Not authenticated");
    }

    const updated = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        systemPreferences: {
          calendarView: preferences.calendarView.toLowerCase(),
          timeZone: preferences.timeZone,
        },
      },
      select: {
        systemPreferences: true,
      },
    });

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating system preferences:", error);
    return { success: false, error: "Failed to update system preferences" };
  }
}

export const getSystemPreferences = cache(async () => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        systemPreferences: {
          calendarView: "week",
          timeZone: "UTC",
        },
      };
    }

    const preferences = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        systemPreferences: true,
      },
    });

    return (
      preferences || {
        systemPreferences: {
          calendarView: "week",
          timeZone: "UTC",
        },
      }
    );
  } catch (error) {
    return {
      systemPreferences: {
        calendarView: "week",
        timeZone: "UTC",
      },
    };
  }
});
