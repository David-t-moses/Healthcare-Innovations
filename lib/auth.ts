"use server";

import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function getCurrentUser() {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      cookies().delete("session");
      return null;
    }

    return {
      ...user,
      role: user.role as "PATIENT" | "STAFF",
    };
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}
