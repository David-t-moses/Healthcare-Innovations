"use server";

import prisma from "@/lib/prisma";

export async function getSalesData() {
  try {
    const payments =
      (await prisma.paymentHistory.findMany({
        include: {
          patient: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      })) || [];

    const financialRecords =
      (await prisma.financialRecord.findMany({
        orderBy: {
          date: "desc",
        },
      })) || [];

    return {
      success: true,
      data: {
        payments: payments || [],
        financialRecords: financialRecords || [],
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching sales data:", error.message);
    }
    return {
      success: false,
      error: "Failed to fetch sales data",
      data: { payments: [], financialRecords: [] },
    };
  }
}

export async function getPatients() {
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
    return { success: true, data: patients };
  } catch (error) {
    console.error("Error fetching patients:", error);
    return { success: false, error: "Failed to fetch patients" };
  }
}

export async function createPayment(data: {
  patientId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  userId: string;
}) {
  try {
    // Get first staff user from database
    const staffUser = await prisma.user.findFirst({
      where: {
        role: "STAFF",
      },
    });

    const payment = await prisma.paymentHistory.create({
      data: {
        amount: data.amount,
        status: data.status,
        paymentMethod: data.paymentMethod,
        date: new Date(),
        patient: {
          connect: {
            id: data.patientId,
          },
        },
        user: {
          connect: {
            id: staffUser.id, // Use existing staff user ID
          },
        },
      },
      include: {
        patient: {
          select: {
            name: true,
          },
        },
      },
    });

    return { success: true, data: payment };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating payment:", error.message);
    }
    return {
      success: false,
      error: "Failed to create payment",
      data: null,
    };
  }
}

export async function createFinancialRecord(data: {
  type: string;
  amount: number;
  date: Date;
}) {
  try {
    const record = await prisma.financialRecord.create({
      data,
    });
    return { success: true, data: record };
  } catch (error) {
    console.error("Error creating financial record:", error);
    return { success: false, error: "Failed to create financial record" };
  }
}
