import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { emitNotification } from "@/lib/socket";

export async function POST(request: NextRequest) {
  try {
    const { userId, title, message, type } = await request.json();

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: type || "GENERAL",
        read: false,
      },
    });

    // Emit real-time notification
    emitNotification(userId, notification);

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create notification" },
      { status: 500 }
    );
  }
}