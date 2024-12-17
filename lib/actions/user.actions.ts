"use server";

import { hash, compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/session"; // We'll need to create this

export async function signUp(formData: {
  fullName: string;
  email: string;
  password: string;
  role: "PATIENT" | "STAFF";
  phone?: string;
  dateOfBirth?: string;
  insurance?: string;
  emergencyContact?: string;
}) {
  try {
    const hashedPassword = await hash(formData.password, 10);
    const normalizedRole = formData.role.toUpperCase() as "PATIENT" | "STAFF";

    const user = await prisma.user.create({
      data: {
        fullName: formData.fullName,
        email: formData.email,
        password: hashedPassword,
        role: normalizedRole,
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

    await createSession(user.id);
    return {
      success: true,
      redirect: "/dashboard",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Something went wrong",
    };
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
      },
    });

    if (!user) {
      return { error: "Invalid credentials" };
    }

    const isValidPassword = await compare(formData.password, user.password);
    if (!isValidPassword) {
      return { error: "Invalid credentials" };
    }

    // Create session and redirect
    await createSession(user.id);

    const { password: _, ...userWithoutPassword } = user;
    return {
      success: true,
      user: userWithoutPassword,
      redirect: "/dashboard",
    };
  } catch (error) {
    console.error("Sign in error:", error);
    return { error: "Failed to sign in" };
  }
}

export async function signOut() {
  try {
    await destroySession();
    redirect("/sign-in");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}
