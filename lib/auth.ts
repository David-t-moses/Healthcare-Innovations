"use server";

import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  console.log("Session cookie exists:", !!sessionCookie);

  try {
    const session = await getSession();
    console.log("Session after getSession:", session);

    if (!session?.userId) {
      console.log("No userId in session");
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        password: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      cookieStore.delete("session");
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
