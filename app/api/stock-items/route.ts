import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/stock-items -> list items
export async function GET() {
  try {
    const items = await prisma.stockItem.findMany({
      include: {
        vendor: {
          select: { id: true, name: true, email: true },
        },
        orders: {
          select: { quantity: true, status: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const serialized = items.map((item) => ({
      ...item,
      pricePerUnit: Number(item.pricePerUnit),
    }));

    return NextResponse.json({ success: true, data: serialized });
  } catch (error: any) {
    console.error("GET /api/stock-items error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stock items" },
      { status: 500 }
    );
  }
}

// POST /api/stock-items -> create item
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      quantity,
      minimumQuantity,
      reorderQuantity,
      pricePerUnit,
      vendorId,
      status,
    } = body || {};

    if (!name || !vendorId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const stockItem = await prisma.$transaction(async (tx) => {
      const created = await tx.stockItem.create({
        data: {
          name,
          quantity: Number(quantity) || 0,
          minimumQuantity: Number(minimumQuantity) || 0,
          reorderQuantity: Number(reorderQuantity) || 0,
          pricePerUnit: Number(pricePerUnit) || 0,
          vendorId,
          // keep consistent with existing logic which marks as COMPLETED
          status: "COMPLETED",
        },
      });
      return created;
    });

    const serialized = {
      ...stockItem,
      pricePerUnit: Number(stockItem.pricePerUnit),
    };

    return NextResponse.json({ success: true, data: serialized });
  } catch (error: any) {
    console.error("POST /api/stock-items error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create stock item" },
      { status: 500 }
    );
  }
}
