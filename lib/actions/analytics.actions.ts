"use server";

import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

// Get total revenue for the current month
export async function getCurrentMonthRevenue() {
  const now = new Date();
  const startOfCurrentMonth = startOfMonth(now);
  const endOfCurrentMonth = endOfMonth(now);

  try {
    const result = await prisma.paymentHistory.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        date: {
          gte: startOfCurrentMonth,
          lte: endOfCurrentMonth,
        },
        status: "paid",
      },
    });

    return {
      success: true,
      data: Number(result._sum.amount || 0),
    };
  } catch (error) {
    console.error("Error fetching current month revenue:", error);
    return { success: false, error: "Failed to fetch revenue data", data: 0 };
  }
}

// Get pending payments
export async function getPendingPayments() {
  try {
    const pendingPayments = await prisma.paymentHistory.findMany({
      where: {
        status: "pending",
      },
      select: {
        id: true,
        amount: true,
      },
    });

    const totalPending = pendingPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );

    return {
      success: true,
      data: {
        total: totalPending,
        count: pendingPayments.length,
      },
    };
  } catch (error) {
    console.error("Error fetching pending payments:", error);
    return {
      success: false,
      error: "Failed to fetch pending payments",
      data: { total: 0, count: 0 },
    };
  }
}

// Get current month expenses
export async function getCurrentMonthExpenses() {
  const now = new Date();
  const startOfCurrentMonth = startOfMonth(now);
  const endOfCurrentMonth = endOfMonth(now);

  try {
    const result = await prisma.financialRecord.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        date: {
          gte: startOfCurrentMonth,
          lte: endOfCurrentMonth,
        },
        type: "expense",
      },
    });

    return {
      success: true,
      data: Number(result._sum.amount || 0),
    };
  } catch (error) {
    console.error("Error fetching current month expenses:", error);
    return { success: false, error: "Failed to fetch expense data", data: 0 };
  }
}

// Get expense breakdown by category
export async function getExpenseBreakdown() {
  const now = new Date();
  const startOfCurrentMonth = startOfMonth(now);
  const endOfCurrentMonth = endOfMonth(now);

  try {
    const expenses = await prisma.financialRecord.groupBy({
      by: ["category"],
      _sum: {
        amount: true,
      },
      where: {
        type: "expense",
        date: {
          gte: startOfCurrentMonth,
          lte: endOfCurrentMonth,
        },
      },
    });

    return {
      success: true,
      data: expenses.map((item) => ({
        category: item.category,
        amount: Number(item._sum.amount || 0),
      })),
    };
  } catch (error) {
    console.error("Error fetching expense breakdown:", error);
    return {
      success: false,
      error: "Failed to fetch expense breakdown",
      data: [],
    };
  }
}

// Get revenue trend for the last 6 months
export async function getRevenueTrend(months = 6) {
  try {
    const now = new Date();
    const result = [];

    for (let i = 0; i < months; i++) {
      const targetMonth = subMonths(now, i);
      const start = startOfMonth(targetMonth);
      const end = endOfMonth(targetMonth);

      const monthData = await prisma.paymentHistory.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          date: {
            gte: start,
            lte: end,
          },
          status: "paid",
        },
      });

      result.unshift({
        month: format(targetMonth, "MMM yyyy"),
        revenue: Number(monthData._sum.amount || 0),
      });
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error fetching revenue trend:", error);
    return { success: false, error: "Failed to fetch revenue trend", data: [] };
  }
}

// Function to get net profit for the current month
export async function getCurrentMonthNetProfit() {
  const now = new Date();
  const startOfCurrentMonth = startOfMonth(now);
  const endOfCurrentMonth = endOfMonth(now);

  try {
    // Get revenue
    const revenueResult = await prisma.paymentHistory.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        date: {
          gte: startOfCurrentMonth,
          lte: endOfCurrentMonth,
        },
        status: "paid",
      },
    });

    // Get expenses
    const expensesResult = await prisma.financialRecord.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        date: {
          gte: startOfCurrentMonth,
          lte: endOfCurrentMonth,
        },
        type: "expense",
      },
    });

    const revenue = Number(revenueResult._sum.amount || 0);
    const expenses = Number(expensesResult._sum.amount || 0);
    const netProfit = revenue - expenses;

    return {
      success: true,
      data: {
        revenue,
        expenses,
        netProfit,
      },
    };
  } catch (error) {
    console.error("Error calculating net profit:", error);
    return {
      success: false,
      error: "Failed to calculate net profit",
      data: { revenue: 0, expenses: 0, netProfit: 0 },
    };
  }
}
