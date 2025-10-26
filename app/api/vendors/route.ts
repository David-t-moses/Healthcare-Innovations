import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        stockItems: {
          select: {
            id: true,
            name: true,
            quantity: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            rejectionReason: true,
          },
        },
        orders: {
          select: {
            id: true,
            status: true,
            quantity: true,
            createdAt: true,
            updatedAt: true,
            rejectionReason: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: vendors });
  } catch (error: any) {
    console.error("GET /api/vendors error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, address } = body || {};
    if (!name || !email || !phone || !address) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const vendor = await prisma.vendor.create({
      data: { name, email, phone, address },
      select: { id: true, name: true, email: true, phone: true, address: true },
    });

    return NextResponse.json({ success: true, data: vendor });
  } catch (error: any) {
    console.error("POST /api/vendors error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create vendor" },
      { status: 500 }
    );
  }
}
