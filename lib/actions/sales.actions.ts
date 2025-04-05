"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cache } from "react";

export const getSalesData = cache(
  async ({
    page = 1,
    limit = 10,
    status = null,
    search = "",
    paymentType = null,
  }) => {
    try {
      const skip = (page - 1) * limit;

      // Build the where clause
      const where: any = {};

      // Filter by payment type if specified
      if (paymentType) {
        where.paymentType = paymentType;
      }

      // Filter by status if specified (only for incoming payments)
      if (status) {
        if (paymentType === "outgoing") {
        } else {
          where.status = status;
        }
      }

      // Search in relevant fields
      if (search) {
        where.OR = [
          { customerName: { contains: search, mode: "insensitive" } },
          { beneficiary: { contains: search, mode: "insensitive" } },
          { serviceDescription: { contains: search, mode: "insensitive" } },
        ];
      }

      // Get transactions with pagination
      const transactions = await prisma.paymentHistory.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          date: "desc",
        },
        select: {
          id: true,
          amount: true,
          date: true,
          status: true,
          customerName: true,
          beneficiary: true,
          serviceDescription: true,
          paymentMethod: true,
          paymentType: true,
          patientId: true,
          patient: {
            select: {
              name: true,
            },
          },
        },
      });

      // Get total count for pagination
      const totalCount = await prisma.paymentHistory.count({ where });

      // Format the transactions
      const formattedTransactions = transactions.map((transaction) => ({
        id: transaction.id,
        invoiceId:
          transaction.paymentType === "outgoing"
            ? `EXP-${transaction.id.substring(0, 4)}`
            : `INV-${transaction.id.substring(0, 4)}`,
        patientId: transaction.patientId,
        amount: Number(transaction.amount),
        date: transaction.date.toISOString(),
        status: transaction.status,
        customerName: transaction.customerName || "",
        beneficiary: transaction.beneficiary || "",
        serviceDescription: transaction.serviceDescription || "",
        paymentMethod: transaction.paymentMethod || "",
        paymentType: transaction.paymentType,
        patient: transaction.patient, // Keep this for backward compatibility
      }));

      return {
        success: true,
        data: {
          payments: formattedTransactions,
          pagination: {
            total: totalCount,
            page,
            limit,
            pages: Math.ceil(totalCount / limit),
          },
        },
      };
    } catch (error) {
      console.error("Error fetching sales data:", error);
      return {
        success: false,
        error: "Failed to fetch sales data",
        data: {
          payments: [],
          pagination: {
            total: 0,
            page,
            limit,
            pages: 0,
          },
        },
      };
    }
  }
);

export async function createPayment({
  customerName,
  amount,
  status = "pending",
  paymentMethod = "cash",
  description = "",
  userId,
  paymentType = "incoming",
  dueDate,
}) {
  if (!userId) {
    return {
      success: false,
      error: "User ID is required",
    };
  }

  try {
    // Create the payment with customerName stored directly
    const payment = await prisma.paymentHistory.create({
      data: {
        userId: userId,
        amount: amount,
        status: status,
        paymentMethod: paymentMethod,
        serviceDescription: description,
        customerName: customerName, // Store customer name directly
        date: new Date(),
        paymentType: paymentType,
        dueDate: dueDate,
      },
    });

    // If this is a revenue entry and status is paid, also create a financial record
    if (paymentType === "incoming" && status === "paid") {
      await prisma.financialRecord.create({
        data: {
          amount: amount,
          date: new Date(),
          type: "revenue",
          category: "Service Payment",
          description: `Payment from ${customerName} for ${
            description || "services"
          }`,
        },
      });
    } else if (paymentType === "outgoing") {
      // For outgoing payments, create an expense record
      await prisma.financialRecord.create({
        data: {
          amount: amount,
          date: new Date(),
          type: "expense",
          category: description || "Other",
          description: customerName || "Expense",
        },
      });
    }

    // Revalidate the finances page to show the new transaction
    revalidatePath("/finances");

    return {
      success: true,
      data: {
        id: payment.id,
        invoiceId:
          paymentType === "incoming"
            ? `INV-${payment.id.substring(0, 4)}`
            : `EXP-${payment.id.substring(0, 4)}`,
        amount: Number(payment.amount),
        date: payment.date.toISOString(),
        status: payment.status,
        customerName: payment.customerName, // Return customer name
        serviceDescription: payment.serviceDescription,
        paymentType: payment.paymentType,
      },
    };
  } catch (error) {
    console.error("Error creating payment:", error);
    return {
      success: false,
      error: "Failed to create payment",
    };
  }
}

export async function createExpense({
  amount,
  description = "",
  paymentMethod = "cash",
  userId,
  paymentType = "outgoing",
  beneficiary = "",
}) {
  if (!userId) {
    return {
      success: false,
      error: "User ID is required",
    };
  }

  try {
    // Create a payment history entry for the expense
    const payment = await prisma.paymentHistory.create({
      data: {
        userId: userId,
        amount: amount,
        status: "paid",
        paymentMethod: paymentMethod,
        serviceDescription: description, // Store description in serviceDescription
        beneficiary: beneficiary, // Store beneficiary name
        date: new Date(),
        paymentType: "outgoing",
      },
    });

    // Revalidate the finances page to show the new expense
    revalidatePath("/finances");

    return {
      success: true,
      data: {
        id: payment.id,
        invoiceId: `EXP-${payment.id.substring(0, 4)}`,
        amount: Number(payment.amount),
        date: payment.date.toISOString(),
        status: "paid",
        beneficiary: payment.beneficiary,
        serviceDescription: payment.serviceDescription,
        paymentType: "outgoing",
      },
    };
  } catch (error) {
    console.error("Error creating expense:", error);
    return {
      success: false,
      error: "Failed to create expense",
    };
  }
}

export async function updateExpense(
  expenseId: string,
  data: {
    amount?: number;
    description?: string;
    beneficiary?: string;
    paymentMethod?: string;
  }
) {
  try {
    const expense = await prisma.paymentHistory.update({
      where: { id: expenseId },
      data: {
        amount: data.amount !== undefined ? data.amount : undefined,
        serviceDescription: data.description,
        beneficiary: data.beneficiary,
        paymentMethod: data.paymentMethod,
      },
    });

    revalidatePath("/finances");

    return {
      success: true,
      data: {
        id: expense.id,
        amount: Number(expense.amount),
        serviceDescription: expense.serviceDescription,
        beneficiary: expense.beneficiary,
      },
    };
  } catch (error) {
    console.error("Error updating expense:", error);
    return {
      success: false,
      error: "Failed to update expense",
    };
  }
}

function buildPaymentWhereClause(status, search) {
  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      {
        customerName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        beneficiary: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        serviceDescription: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  return where;
}

export async function updatePaymentStatus(paymentId: string, status: string) {
  try {
    const oldPayment = await prisma.paymentHistory.findUnique({
      where: { id: paymentId },
      include: {
        patient: true,
      },
    });

    if (!oldPayment) {
      return {
        success: false,
        error: "Payment not found",
      };
    }

    const payment = await prisma.paymentHistory.update({
      where: { id: paymentId },
      data: {
        status,
      },
      include: {
        patient: true,
      },
    });

    // If status changed to paid, create a financial record
    if (oldPayment.status !== "paid" && status === "paid") {
      await prisma.financialRecord.create({
        data: {
          amount: Number(payment.amount),
          date: new Date(),
          type: "revenue",
          category: "Service Payment",
          description: `Payment from ${payment.patient.name} for ${
            payment.serviceDescription || "services"
          }`,
        },
      });
    }

    revalidatePath("/finances");

    return {
      success: true,
      data: {
        id: payment.id,
        status: payment.status,
      },
    };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return {
      success: false,
      error: "Failed to update payment status",
    };
  }
}

export async function deletePayment(
  paymentId: string,
  paymentType: string = "incoming"
) {
  try {
    // For both incoming and outgoing payments, we need to find the payment in PaymentHistory
    const payment = await prisma.paymentHistory.findUnique({
      where: { id: paymentId },
      include: {
        patient: true,
      },
    });

    if (!payment) {
      return { success: false, error: "Payment not found" };
    }

    // Delete the payment from PaymentHistory table
    await prisma.paymentHistory.delete({
      where: { id: paymentId },
    });

    // Handle financial record entries
    if (paymentType === "incoming" && payment.status === "paid") {
      // For paid incoming payments, create a reversal entry
      await prisma.financialRecord.create({
        data: {
          amount: Number(payment.amount) * -1, // Negative amount to reverse
          date: new Date(),
          type: "revenue_reversal",
          category: "Payment Reversal",
          description: payment.patient
            ? `Reversal of payment from ${payment.patient.name}`
            : `Reversal of payment from ${payment.customerName || "customer"}`,
        },
      });
    } else if (paymentType === "outgoing") {
      // For outgoing payments (expenses), create a reversal entry if needed
      // Find any related financial record for this expense
      const financialRecord = await prisma.financialRecord.findFirst({
        where: {
          description: { contains: payment.beneficiary || "" },
          amount: Number(payment.amount),
          type: "expense",
        },
      });

      if (financialRecord) {
        await prisma.financialRecord.delete({
          where: { id: financialRecord.id },
        });
      }
    }

    revalidatePath("/finances");
    return { success: true };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return { success: false, error: "Failed to delete transaction" };
  }
}

export const getPatientPaymentHistory = cache(async (patientId: string) => {
  try {
    const payments = await prisma.paymentHistory.findMany({
      where: {
        patientId: patientId,
      },
      orderBy: {
        date: "desc",
      },
      include: {
        patient: {
          select: {
            name: true,
          },
        },
      },
    });

    const formattedPayments = payments.map((payment) => ({
      id: payment.id,
      invoiceId: `INV-${payment.id.substring(0, 4)}`,
      amount: Number(payment.amount),
      date: payment.date.toISOString(),
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      serviceDescription: payment.serviceDescription,
      patient: payment.patient,
    }));

    return {
      success: true,
      data: formattedPayments,
    };
  } catch (error) {
    console.error("Error fetching patient payment history:", error);
    return {
      success: false,
      error: "Failed to fetch payment history",
    };
  }
});

export const getCustomers = cache(async () => {
  try {
    const customers = await prisma.paymentHistory.findMany({
      select: {
        customerName: true,
      },
      distinct: ["customerName"],
      where: {
        customerName: {
          not: null,
        },
      },
      orderBy: {
        customerName: "asc",
      },
    });

    return {
      success: true,
      data: customers.map((c) => c.customerName).filter(Boolean),
    };
  } catch (error) {
    console.error("Error fetching customers:", error);
    return { success: false, error: "Failed to fetch customers" };
  }
});

export const getPaymentById = cache(async (paymentId: string) => {
  try {
    const payment = await prisma.paymentHistory.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    if (!payment) {
      return { success: false, error: "Payment not found", data: null };
    }

    const serializedPayment = {
      ...payment,
      amount: Number(payment.amount),
      invoiceId: `INV-${payment.id.substring(0, 4)}`,
    };

    return { success: true, data: serializedPayment };
  } catch (error) {
    console.error("Error fetching payment details:", error);
    return {
      success: false,
      error: "Failed to fetch payment details",
      data: null,
    };
  }
});

export const getPaymentStatistics = cache(async () => {
  try {
    const totalPayments = await prisma.paymentHistory.count();

    const paidPayments = await prisma.paymentHistory.count({
      where: { status: "paid" },
    });

    const pendingPayments = await prisma.paymentHistory.count({
      where: { status: "pending" },
    });

    const overduePayments = await prisma.paymentHistory.count({
      where: {
        status: "pending",
        dueDate: {
          lt: new Date(),
        },
      },
    });

    const totalRevenue = await prisma.paymentHistory.aggregate({
      _sum: {
        amount: true,
      },
      where: { status: "paid" },
    });

    return {
      success: true,
      data: {
        totalPayments,
        paidPayments,
        pendingPayments,
        overduePayments,
        totalRevenue: Number(totalRevenue._sum.amount || 0),
        paymentRate:
          totalPayments > 0 ? (paidPayments / totalPayments) * 100 : 0,
      },
    };
  } catch (error) {
    console.error("Error fetching payment statistics:", error);
    return {
      success: false,
      error: "Failed to fetch payment statistics",
      data: {
        totalPayments: 0,
        paidPayments: 0,
        pendingPayments: 0,
        overduePayments: 0,
        totalRevenue: 0,
        paymentRate: 0,
      },
    };
  }
});

export async function createFinancialRecord(data: {
  type: string;
  amount: number;
  date: Date;
  category: string;
  description?: string;
}) {
  try {
    const record = await prisma.financialRecord.create({
      data,
    });

    const serializedRecord = {
      ...record,
      amount: Number(record.amount),
    };

    return { success: true, data: serializedRecord };
  } catch (error) {
    console.error("Error creating financial record:", error);
    return { success: false, error: "Failed to create financial record" };
  }
}

export async function updatePayment(
  paymentId: string,
  data: {
    amount?: number;
    status?: string;
    paymentMethod?: string;
    description?: string; // This should be renamed or mapped correctly
    customerName?: string;
    dueDate?: Date;
  }
) {
  try {
    const oldPayment = await prisma.paymentHistory.findUnique({
      where: { id: paymentId },
    });

    const payment = await prisma.paymentHistory.update({
      where: { id: paymentId },
      data: {
        amount: data.amount,
        status: data.status,
        paymentMethod: data.paymentMethod,
        serviceDescription: data.description, // Map to the correct field
        customerName: data.customerName,
        dueDate: data.dueDate,
      },
    });

    // If status changed to paid, create a financial record
    if (oldPayment?.status !== "paid" && data.status === "paid") {
      await prisma.financialRecord.create({
        data: {
          amount: Number(payment.amount),
          date: new Date(),
          type: "revenue",
          category: "Service Payment",
          description: `Payment from ${payment.customerName} for ${
            payment.description || "services"
          }`,
        },
      });
    }

    const serializedPayment = {
      ...payment,
      amount: Number(payment.amount),
      invoiceId: `INV-${payment.id.substring(0, 4)}`,
    };

    return { success: true, payment: serializedPayment };
  } catch (error) {
    return { success: false, error: "Failed to update payment" };
  }
}

export async function deleteFinancialRecord(recordId: string) {
  try {
    await prisma.financialRecord.delete({
      where: { id: recordId },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting financial record:", error);
    return { success: false, error: "Failed to delete record" };
  }
}

export async function updateFinancialRecord(
  recordId: string,
  data: {
    type: string;
    amount: number;
    date: Date;
    category?: string;
    description?: string;
  }
) {
  try {
    const record = await prisma.financialRecord.update({
      where: { id: recordId },
      data,
    });

    const serializedRecord = {
      ...record,
      amount: Number(record.amount),
    };

    return { success: true, record: serializedRecord };
  } catch (error) {
    console.error("Error updating financial record:", error);
    return { success: false, error: "Failed to update record" };
  }
}

export async function sendPaymentReminder(paymentId: string) {
  try {
    const payment = await prisma.paymentHistory.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return { success: false, error: "Payment not found" };
    }

    if (payment.status !== "pending") {
      return {
        success: false,
        error: "Cannot send reminder for non-pending payments",
      };
    }

    // In a real application, you would send an email here
    // For now, we'll just log it and update the payment record
    console.log(
      `Reminder sent to ${payment.customerName} for payment ${payment.id}`
    );

    // Create a notification
    await prisma.notification.create({
      data: {
        userId: payment.userId,
        title: "Payment Reminder Sent",
        message: `Reminder sent to ${
          payment.customerName
        } for payment of ${Number(payment.amount)}`,
        type: "GENERAL",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending payment reminder:", error);
    return { success: false, error: "Failed to send payment reminder" };
  }
}

export const getPatients = cache(async () => {
  try {
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    console.log(patients)

    return { success: true, data: patients };
  } catch (error) {
    console.error("Error fetching patients:", error);
    return { success: false, error: "Failed to fetch patients" };
  }
});
