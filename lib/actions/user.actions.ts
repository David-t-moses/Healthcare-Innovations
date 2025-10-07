"use server";

import { hash, compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { signIn as nextAuthSignIn } from "next-auth/react";
import { sendVerificationEmail } from "@/lib/email";
import { sendPasswordResetEmail } from "@/lib/email";
import { cache } from "react";

const findUserByEmail = cache(async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      fullName: true,
    },
  });
});

export async function signUp(formData: {
  fullName: string;
  email: string;
  password: string;
  role: "STAFF" | "PATIENT";
  organizationKey?: string;
  phone?: string;
  dateOfBirth?: string;
  insurance?: string;
  emergencyContact?: string;
}) {
  try {
    // Check password length
    if (formData.password.length < 8) {
      return { error: "Password must be at least 8 characters long" };
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: formData.email },
    });

    if (existingUser) {
      return { error: "Email already registered" };
    }

    const hashedPassword = await hash(formData.password, 10);
    const normalizedRole = formData.role.toUpperCase() as "STAFF" | "PATIENT";
    const verificationToken = crypto.randomUUID();

    if (formData.role === "STAFF") {
      if (formData.organizationKey !== process.env.ORGANIZATION_KEY) {
        return { error: "Invalid organization key" };
      }
    }

    const user = await prisma.user.create({
      data: {
        fullName: formData.fullName,
        email: formData.email,
        password: hashedPassword,
        role: formData.role,
        verificationToken,
        emailVerified: false,
      },
    });

    if (normalizedRole === "PATIENT") {
      await prisma.patient.create({
        data: {
          id: user.id,
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone || null,
          dateOfBirth: formData.dateOfBirth
            ? new Date(formData.dateOfBirth)
            : null,
          insurance: formData.insurance || null,
          emergencyContact: formData.emergencyContact || null,
          status: "active",
        },
      });
    }

    // Auto-verify user (email verification disabled)
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null },
    });

    return {
      success: true,
      message: "Account created successfully!",
      user: { email: user.email, password: formData.password },
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to create account",
    };
  }
}

export async function verifyEmail(token: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return { error: "Invalid verification token" };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
      },
    });

    await createSession(user.id);

    return { success: true };
  } catch (error) {
    return { error: "Failed to verify email" };
  }
}

export async function signIn(formData: { email: string; password: string }) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: formData.email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        fullName: true,
        emailVerified: true,
      },
    });
    if (!user) return { error: "Invalid credentials" };

    const isValidPassword = await compare(formData.password, user.password);
    if (!isValidPassword) return { error: "Invalid credentials" };

    // Email verification disabled - skip check

    const { password: _, ...userWithoutPassword } = user;
    return {
      success: true,
      user: userWithoutPassword,
    };
  } catch (error) {
    console.error("Sign in error:", error);
    return { error: "Failed to sign in" };
  }
}

export async function signOut() {
  redirect("/api/auth/signout?callbackUrl=/sign-in");
}

export async function requestPasswordReset(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "No account found with this email" };
    }

    const resetToken = crypto.randomUUID();

    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: resetToken },
    });

    // Password reset email disabled
    // await sendPasswordResetEmail(email, user.fullName, resetToken);

    return { success: true, message: "Password reset functionality is currently disabled" };
  } catch (error) {
    return { error: "Failed to process request" };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { resetPasswordToken: token },
    });

    if (!user) {
      return { error: "Invalid or expired reset link" };
    }

    const hashedPassword = await hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
      },
    });

    return { success: true };
  } catch (error) {
    return { error: "Failed to reset password" };
  }
}
