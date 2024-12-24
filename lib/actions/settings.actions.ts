"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { hash, compare } from "bcryptjs";

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
    const supabase = createServerComponentClient({ cookies });

    // Update Supabase auth
    await supabase.auth.updateUser({
      email: data.email,
      data: { full_name: data.fullName },
    });

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
