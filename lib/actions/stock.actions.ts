"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendReorderEmail } from "../email";
import { emitNotification } from "../socket";
import { cache } from "react";

// Cache staff users query
const getStaffUsers = cache(async () => {
  return await prisma.user.findMany({
    where: { role: "STAFF" },
    select: { id: true }, // Only select needed fields
  });
});

// Optimized notification creation
async function notifyAllStaff(title: string, message: string, type: string) {
  const staffUsers = await getStaffUsers();

  // Batch create notifications
  const notifications = await prisma.$transaction(
    staffUsers.map((staff) =>
      prisma.notification.create({
        data: { userId: staff.id, title, message, type },
      })
    )
  );

  // Batch emit notifications
  notifications.forEach((notification) =>
    emitNotification(notification.userId, notification)
  );
}

export async function createStockItem(data: {
  name: string;
  quantity: number;
  minimumQuantity: number;
  reorderQuantity: number;
  vendorId: string;
  status: string;
}) {
  return await prisma.$transaction(async (tx) => {
    const stockItem = await tx.stockItem.create({
      data: {
        ...data,
        reorderQuantity: Number(data.reorderQuantity),
      },
    });

    if (stockItem.quantity <= stockItem.minimumQuantity) {
      await notifyAllStaff(
        "Low Stock Alert",
        `${stockItem.name} is running low (${stockItem.quantity} remaining)`,
        "STOCK_LOW"
      );
    }

    return stockItem;
  });
}

// Cached stock items query
export const getStockItems = cache(async () => {
  return await prisma.stockItem.findMany({
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
});

export async function deleteStockItem(id: string) {
  await prisma.stockOrder.deleteMany({
    where: { stockItemId: id },
  });
  return await prisma.stockItem.delete({
    where: { id },
  });
}

export async function updateStockItem(id: string, data: any) {
  const updatedItem = await prisma.stockItem.update({
    where: { id },
    data: {
      ...data,
      reorderQuantity: Number(data.reorderQuantity),
    },
    include: {
      vendor: true,
    },
  });

  if (updatedItem.quantity <= updatedItem.minimumQuantity) {
    await notifyAllStaff(
      "Low Stock Alert",
      `${updatedItem.name} is running low (${updatedItem.quantity} remaining)`,
      "STOCK_LOW"
    );
  }

  return updatedItem;
}

export async function reorderStock(stockItemId: string) {
  const user = await getCurrentUser();
  const stockItem = await prisma.stockItem.findUnique({
    where: { id: stockItemId },
    include: { vendor: true },
  });

  const order = await prisma.stockOrder.create({
    data: {
      stockItemId,
      quantity: stockItem.reorderQuantity,
      status: "PENDING",
      vendorId: stockItem.vendorId,
      userId: user.id,
    },
  });

  await prisma.stockItem.update({
    where: { id: stockItemId },
    data: {
      quantity: {
        increment: stockItem.reorderQuantity,
      },
    },
  });

  // Get all staff users
  const staffUsers = await prisma.user.findMany({
    where: { role: "STAFF" },
  });

  // Create and emit notifications in parallel
  await Promise.all(
    staffUsers.map(async (staff) => {
      const notification = await prisma.notification.create({
        data: {
          userId: staff.id,
          title: "Stock Reorder Placed",
          message: `Reorder placed for ${stockItem.name} (${stockItem.reorderQuantity} units)`,
          type: "GENERAL",
        },
      });

      emitNotification(staff.id, notification);
    })
  );

  sendReorderEmail(stockItem);

  return { success: true, order };
}

export async function checkStockLevels() {
  const stocks = await prisma.stockItem.findMany({
    include: {
      vendor: true,
    },
  });

  const staffUsers = await prisma.user.findMany({
    where: {
      role: "STAFF",
    },
  });

  for (const stock of stocks) {
    if (stock.quantity <= stock.minimumQuantity) {
      for (const user of staffUsers) {
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: user.id,
            type: "STOCK_LOW",
            read: false,
            message: {
              contains: stock.name,
            },
          },
        });

        if (!existingNotification) {
          const notification = await prisma.notification.create({
            data: {
              title: "Low Stock Alert",
              message: `${stock.name} is running low (${stock.quantity} remaining)`,
              type: "STOCK_LOW",
              userId: user.id,
            },
          });

          emitNotification(user.id, notification);
        }
      }
    }
  }
}

export async function getRecentStock() {
  try {
    const stock = await prisma.stockItem.findMany({
      take: 3,
      orderBy: {
        id: "desc",
      },
    });
    return stock;
  } catch (error) {
    console.log("Stock fetch error:", error);
    return [];
  }
}
