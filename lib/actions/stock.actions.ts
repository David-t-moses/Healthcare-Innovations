"use server";

import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Resend } from "resend";
import { format } from "date-fns";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function createStockItem(data: {
  name: string;
  quantity: number;
  minimumQuantity: number;
  reorderQuantity: number;
  vendorId: string;
  status: string;
}) {
  const stockItem = await prisma.stockItem.create({
    data,
  });

  // Check if stock is low immediately after creation
  if (stockItem.quantity <= stockItem.minimumQuantity) {
    await createLowStockNotification(stockItem);
  }

  return stockItem;
}

export async function getStockItems() {
  return await prisma.stockItem.findMany({
    include: {
      vendor: true,
    },
  });
}

async function createLowStockNotification(stockItem: any) {
  const notification = await prisma.notification.create({
    data: {
      userId: "STAFF_ID", // You'll need to specify which staff gets notifications
      title: "Low Stock Alert",
      message: `${stockItem.name} is running low (${stockItem.quantity} remaining)`,
      type: "STOCK_LOW",
    },
  });

  await pusherServer.trigger("staff-notifications", "new-notification", {
    type: "STOCK_LOW",
    stockItem,
  });

  return notification;
}

export async function deleteStockItem(id: string) {
  return await prisma.stockItem.delete({
    where: { id },
  });
}

export async function updateStockItem(id: string, data: any) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const staffId = session?.user?.id;

  const user = await prisma.user.findFirst({
    where: {
      email: session?.user?.email,
    },
  });

  const updatedItem = await prisma.stockItem.update({
    where: { id },
    data,
    include: {
      vendor: true,
    },
  });

  if (updatedItem.quantity <= updatedItem.minimumQuantity && user) {
    const notification = await prisma.notification.create({
      data: {
        title: "Low Stock Alert",
        message: `${updatedItem.name} is running low (${updatedItem.quantity} remaining)`,
        type: "STOCK_LOW",
        userId: user.id,
      },
    });

    await pusherServer.trigger(
      `user-${user.id}`,
      "new-notification",
      notification
    );
  }

  return updatedItem;
}

export async function reorderStock(stockItemId: string) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = await prisma.user.findFirst({
    where: {
      email: session?.user?.email,
    },
  });

  const stockItem = await prisma.stockItem.findUnique({
    where: { id: stockItemId },
    include: { vendor: true },
  });

  // Create order record
  const order = await prisma.stockOrder.create({
    data: {
      stockItemId,
      quantity: stockItem.reorderQuantity,
      status: "PENDING",
      vendorId: stockItem.vendorId,
      userId: user.id,
    },
  });

  const reorderNotification = await prisma.notification.create({
    data: {
      title: "Stock Reorder Placed",
      message: `Reorder placed for ${stockItem?.name} (${stockItem?.reorderQuantity} units)`,
      type: "GENERAL",
      userId: user?.id,
    },
  });

  console.log("Triggering reorder notification:", reorderNotification);
  await pusherServer.trigger(
    `user-${user?.id}`,
    "new-notification",
    reorderNotification
  );
  // Send email to vendor
  await resend.emails.send({
    from: process.env.SENDER_EMAIL!,
    to: stockItem?.vendor.email!,
    subject: "Stock Reorder Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background-color: white; border-radius: 8px; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #1e40af; margin-bottom: 24px; text-align: center;">Stock Reorder Request</h1>
          
          <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px; margin-bottom: 24px;">
            <h2 style="color: #1e3a8a; margin: 0 0 8px 0;">Order Details</h2>
            <p style="color: #64748b; margin: 0;">Please review and process this order request.</p>
          </div>
  
          <div style="margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Item Name</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${
                  stockItem.name
                }</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Quantity</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${
                  stockItem.reorderQuantity
                } units</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Order ID</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${
                  order.id
                }</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Date</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${format(
                  new Date(),
                  "PPP"
                )}</td>
              </tr>
            </table>
          </div>
  
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Order Details
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 24px; color: #64748b; font-size: 14px;">
          <p>This is an automated message from your inventory management system.</p>
        </div>
      </div>
    `,
  });

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

          await pusherServer.trigger(
            `user-${user.id}`,
            "new-notification",
            notification
          );
        }
      }
    }
  }
}
