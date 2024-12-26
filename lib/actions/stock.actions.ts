"use server";

import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { Resend } from "resend";
import { getCurrentUser } from "@/lib/auth";
import { sendReorderEmail } from "../email";

const resend = new Resend(process.env.RESEND_API_KEY);

async function notifyAllStaff(title: string, message: string, type: string) {
  const staffUsers = await prisma.user.findMany({
    where: { role: "STAFF" },
  });

  for (const staff of staffUsers) {
    const notification = await prisma.notification.create({
      data: {
        userId: staff.id,
        title,
        message,
        type,
      },
    });

    await pusherServer.trigger(
      `user-${staff.id}`,
      "new-notification",
      notification
    );
  }
}

export async function createStockItem(data: {
  name: string;
  quantity: number;
  minimumQuantity: number;
  reorderQuantity: number;
  vendorId: string;
  status: string;
}) {
  const stockItem = await prisma.stockItem.create({
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
}

export async function getStockItems() {
  return await prisma.stockItem.findMany({
    include: {
      vendor: true,
    },
  });
}

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

  await notifyAllStaff(
    "Stock Reorder Placed",
    `Reorder placed for ${stockItem.name} (${stockItem.reorderQuantity} units)`,
    "GENERAL"
  );

  sendReorderEmail(stockItem);

  // const mailOptions = {
  //   from: process.env.EMAIL_USER,
  //   to: stockItem.vendor.email,
  //   subject: "🔔 New Stock Reorder Request - Urgent Action Required",
  //   html: `
  //     <!DOCTYPE html>
  //     <html>
  //       <head>
  //         <meta charset="utf-8">
  //         <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //         <title>Stock Reorder Request</title>
  //       </head>
  //       <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: Arial, sans-serif;">
  //         <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; margin: 0 auto; padding: 20px;">
  //           <tr>
  //             <td align="center" style="padding: 20px 0;">
  //               <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 2px; border-radius: 16px;">
  //                 <div style="background-color: white; border-radius: 14px; padding: 30px;">
  //                   <!-- Header -->
  //                   <div style="text-align: center; margin-bottom: 30px;">
  //                     <h1 style="color: #1e40af; font-size: 24px; margin: 0;">Stock Reorder Request</h1>
  //                     <p style="color: #6b7280; margin-top: 10px;">Order #${order.id.slice(
  //                       0,
  //                       8
  //                     )}</p>
  //                   </div>

  //                   <!-- Order Summary Box -->
  //                   <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
  //                     <table width="100%" cellpadding="0" cellspacing="0">
  //                       <tr>
  //                         <td style="padding-bottom: 15px;">
  //                           <div style="font-size: 16px; color: #1e40af; font-weight: bold;">Item Details</div>
  //                         </td>
  //                       </tr>
  //                       <tr>
  //                         <td>
  //                           <table width="100%" cellpadding="8" cellspacing="0" style="background-color: white; border-radius: 6px;">
  //                             <tr>
  //                               <td style="color: #6b7280;">Item Name:</td>
  //                               <td style="font-weight: bold; color: #1f2937; text-align: right;">${
  //                                 stockItem.name
  //                               }</td>
  //                             </tr>
  //                             <tr>
  //                               <td style="color: #6b7280;">Quantity:</td>
  //                               <td style="font-weight: bold; color: #1f2937; text-align: right;">${
  //                                 stockItem.reorderQuantity
  //                               } units</td>
  //                             </tr>
  //                             <tr>
  //                               <td style="color: #6b7280;">Order Date:</td>
  //                               <td style="font-weight: bold; color: #1f2937; text-align: right;">${format(
  //                                 new Date(),
  //                                 "PPP"
  //                               )}</td>
  //                             </tr>
  //                           </table>
  //                         </td>
  //                       </tr>
  //                     </table>
  //                   </div>

  //   //

  //                   <!-- Additional Info -->
  //                   <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
  //                     <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
  //                       This is an automated message from your inventory management system.<br>
  //                       Please process this order as soon as possible.
  //                     </p>
  //                   </div>
  //                 </div>
  //               </div>
  //             </td>
  //           </tr>
  //         </table>
  //       </body>
  //     </html>
  //   `,
  // };

  // await transporter.sendMail(mailOptions);

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
