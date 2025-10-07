"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendBulkReorderEmail } from "../email";
import { emitNotification } from "../socket";
import { cache } from "react";
import { StockOrderStatus } from "@prisma/client";

const getStaffUsers = cache(async () => {
  return await prisma.user.findMany({
    where: { role: "STAFF" },
    select: { id: true },
  });
});
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
        status: "COMPLETED", // Changed from IN_STOCK to COMPLETED
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

export const getStockItems = cache(async () => {
  const items = await prisma.stockItem.findMany({
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      orders: {
        select: {
          quantity: true,
          status: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return items.map((item) => ({
    ...item,
    pricePerUnit: Number(item.pricePerUnit),
  }));
});

export async function bulkDeleteStockItems(ids: string[]) {
  await prisma.$transaction([
    prisma.stockOrder.deleteMany({
      where: { stockItemId: { in: ids } },
    }),
    prisma.stockItem.deleteMany({
      where: { id: { in: ids } },
    }),
  ]);
  return { success: true };
}

export async function getStockItemDetails(id: string) {
  return await prisma.stockItem.findUnique({
    where: { id },
    include: {
      vendor: true,
      orders: {
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
    },
  });
}

export async function deleteStockItem(id: string) {
  try {
    if (!id) {
      throw new Error("Stock item ID is required");
    }

    const deletedItem = await prisma.stockItem.delete({
      where: {
        id: id,
      },
    });

    return deletedItem;
  } catch (error) {
    console.error("Error deleting stock item:", error);
    throw error;
  }
}

export async function updateStockItem(id: string, data: any) {
  const updatedItem = await prisma.stockItem.update({
    where: { id },
    data: {
      ...data,
      pricePerUnit: Number(data.pricePerUnit),
      reorderQuantity: Number(data.reorderQuantity),
      quantity: Number(data.quantity),
      minimumQuantity: Number(data.minimumQuantity),
    },
    include: {
      vendor: true,
    },
  });

  const serializedItem = {
    ...updatedItem,
    pricePerUnit: Number(updatedItem.pricePerUnit),
    quantity: Number(updatedItem.quantity),
    minimumQuantity: Number(updatedItem.minimumQuantity),
    reorderQuantity: Number(updatedItem.reorderQuantity),
  };

  if (serializedItem.quantity <= serializedItem.minimumQuantity) {
    await notifyAllStaff(
      "Low Stock Alert",
      `${serializedItem.name} is running low (${serializedItem.quantity} remaining)`,
      "STOCK_LOW"
    );
  }

  return serializedItem;
}

export async function bulkReorderStock(stockItemIds: string[]) {
  try {
    const user = await getCurrentUser();
    const stockItems = await prisma.stockItem.findMany({
      where: { id: { in: stockItemIds } },
      include: { vendor: true },
    });

    const orders = await prisma.$transaction(
      stockItems.map((item) =>
        prisma.stockOrder.create({
          data: {
            stockItemId: item.id,
            quantity: item.reorderQuantity,
            status: StockOrderStatus.PENDING,
            vendorId: item.vendorId,
            userId: user?.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        })
      )
    );

    await prisma.stockItem.updateMany({
      where: { id: { in: stockItemIds } },
      data: { status: "PENDING" },
    });

    // Stock reorder email disabled
    // await sendBulkReorderEmail(
    //   stockItems,
    //   orders.map((o) => o.id)
    // );

    // Notify staff - make sure to await this
    await notifyAllStaff(
      "Bulk Stock Reorder Initiated",
      `Reorder placed for ${stockItems.length} items`,
      "REORDER_INITIATED"
    );

    return { success: true, orders };
  } catch (error) {
    console.error("Bulk reorder error:", error);
    throw error;
  }
}

export async function confirmOrder(orderId: string) {
  try {
    console.log("Starting confirmation process for order:", orderId);

    const order = await prisma.stockOrder.findUnique({
      where: { id: orderId },
      include: {
        stockItem: true,
        vendor: true,
        user: true,
      },
    });

    if (!order) {
      console.error("Order not found:", orderId);
      throw new Error(`Order ${orderId} not found`);
    }

    console.log("Found order:", {
      orderId: order.id,
      stockItemId: order.stockItemId,
      status: order.status,
    });

    // Verify order is in valid state
    if (order.status === "COMPLETED") {
      throw new Error("Order already completed");
    }

    const [updatedOrder, updatedStock] = await prisma.$transaction(
      async (tx) => {
        const orderUpdate = await tx.stockOrder.update({
          where: { id: orderId },
          data: {
            status: "COMPLETED",
            updatedAt: new Date(),
          },
        });

        const stockUpdate = await tx.stockItem.update({
          where: { id: order.stockItemId },
          data: {
            status: "COMPLETED",
            quantity: {
              increment: order.quantity,
            },
            updatedAt: new Date(),
          },
        });

        return [orderUpdate, stockUpdate];
      }
    );

    console.log("Successfully updated order and stock:", {
      orderId: updatedOrder.id,
      newOrderStatus: updatedOrder.status,
      newStockQuantity: updatedStock.quantity,
    });

    await notifyAllStaff(
      "Order Confirmed",
      `${order.stockItem.name} order has been confirmed by vendor`,
      "ORDER_CONFIRMED"
    );

    return { success: true, order: updatedOrder, stock: updatedStock };
  } catch (error) {
    console.error("Detailed confirmation error:", {
      error,
      orderId,
      message: error.message,
      stack: error.stack,
    });
    throw new Error(`Confirmation failed: ${error.message}`);
  }
}

export async function rejectOrder(orderId: string, reason: string) {
  try {
    const order = await prisma.stockOrder.findUnique({
      where: { id: orderId },
      include: {
        stockItem: true,
        vendor: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status === "COMPLETED" || order.status === "REJECTED") {
      throw new Error("Order cannot be rejected in its current state");
    }

    const [updatedOrder, updatedStock] = await prisma.$transaction([
      prisma.stockOrder.update({
        where: { id: orderId },
        data: {
          status: "REJECTED",
          rejectionReason: reason,
          updatedAt: new Date(),
        },
        include: {
          stockItem: true,
          vendor: true,
        },
      }),
      prisma.stockItem.update({
        where: { id: order.stockItemId },
        data: {
          status: "REJECTED",
          updatedAt: new Date(),
        },
      }),
    ]);

    await notifyAllStaff(
      "Order Rejected",
      `${order.stockItem.name} order was rejected. Reason: ${reason}`,
      "ORDER_REJECTED"
    );

    return { success: true, order: updatedOrder, stock: updatedStock };
  } catch (error) {
    console.error("Rejection error:", error);
    throw new Error(`Order rejection failed: ${error.message}`);
  }
}

export async function checkStockLevels() {
  const [stocks, staffUsers, expiredOrders] = await Promise.all([
    prisma.stockItem.findMany({
      include: { vendor: true },
    }),
    prisma.user.findMany({
      where: { role: "STAFF" },
    }),
    prisma.stockOrder.findMany({
      where: {
        status: "PENDING",
        expiresAt: { lte: new Date() },
      },
      include: { stockItem: true },
    }),
  ]);

  // Handle low stock notifications
  for (const stock of stocks) {
    if (stock.quantity <= stock.minimumQuantity) {
      for (const user of staffUsers) {
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: user.id,
            type: "STOCK_LOW",
            read: false,
            message: { contains: stock.name },
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

  // Handle expired orders
  for (const order of expiredOrders) {
    // Update order status
    await prisma.stockOrder.update({
      where: { id: order.id },
      data: {
        status: "REJECTED",
        rejectionReason: "Order expired - No response from vendor",
      },
    });

    // Notify staff about expired order
    for (const user of staffUsers) {
      const notification = await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Order Expired",
          message: `Order for ${order.stockItem.name} has expired without vendor response`,
          type: "ORDER_REJECTED",
        },
      });

      emitNotification(user.id, notification);
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

export const getTotalStocks = cache(async () => {
  const stocks = await prisma.stockItem.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return {
    count: stocks.length,
    lastUpdated: stocks[0]?.updatedAt || new Date(),
  };
});

export const getCompletedOrders = cache(async () => {
  const orders = await prisma.stockOrder.findMany({
    where: {
      status: StockOrderStatus.COMPLETED,
    },
    select: {
      id: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    count: orders.length,
    lastUpdated: orders[0]?.createdAt || new Date(),
  };
});

export const getInProgressOrders = cache(async () => {
  const orders = await prisma.stockOrder.findMany({
    where: {
      status: StockOrderStatus.PENDING,
    },
    select: {
      id: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return {
    count: orders.length,
    lastUpdated: orders[0]?.updatedAt || new Date(),
  };
});

export const getLowStockCount = cache(async () => {
  const lowStockItems = await prisma.stockItem.findMany({
    where: {
      quantity: {
        lte: prisma.stockItem.fields.minimumQuantity,
      },
    },
    select: {
      id: true,
    },
  });

  return {
    count: lowStockItems.length,
  };
});
