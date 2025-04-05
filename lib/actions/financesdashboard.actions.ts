"use server";

import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { cache } from "react";

// Helper function to safely execute Prisma queries with retries
async function executePrismaQuery<T>(
  queryFn: () => Promise<T>,
  retries = 3
): Promise<T> {
  try {
    return await queryFn();
  } catch (error) {
    if (retries > 0) {
      // Wait a bit before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 100 * (4 - retries)));
      return executePrismaQuery(queryFn, retries - 1);
    }
    throw error;
  }
}

export const getSalesDashboardData = cache(async () => {
  try {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);

    const revenueResult = await executePrismaQuery(() =>
      prisma.$transaction(async (tx) => {
        return tx.paymentHistory.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            date: {
              gte: startOfCurrentMonth,
              lte: endOfCurrentMonth,
            },
            status: "paid",
            paymentType: "incoming",
          },
        });
      })
    );

    const currentMonthRevenue = Number(revenueResult._sum.amount);

    // Get pending payments
    const pendingPayments = await executePrismaQuery(() =>
      prisma.$transaction(async (tx) => {
        return tx.paymentHistory.findMany({
          where: {
            status: "pending",
          },
          select: {
            id: true,
            amount: true,
          },
        });
      })
    );

    const totalPending = pendingPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );

    const expensesResult = await executePrismaQuery(() =>
      prisma.$transaction(async (tx) => {
        return tx.paymentHistory.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            date: {
              gte: startOfCurrentMonth,
              lte: endOfCurrentMonth,
            },
            paymentType: "outgoing", // This is crucial
          },
        });
      })
    );

    const currentMonthExpenses = Number(expensesResult._sum.amount);

    // Calculate net profit
    const netProfit = currentMonthRevenue - currentMonthExpenses;

    // Get expense breakdown by category
    const expenseBreakdown = await executePrismaQuery(() =>
      prisma.$transaction(async (tx) => {
        return tx.paymentHistory.groupBy({
          by: ["serviceDescription"],
          where: {
            paymentType: "outgoing",
            date: {
              gte: startOfCurrentMonth,
              lte: endOfCurrentMonth,
            },
          },
          _sum: {
            amount: true,
          },
        });
      })
    );

    const formattedExpenseBreakdown = expenseBreakdown.map((item) => ({
      category: item.serviceDescription || "Other",
      amount: Number(item._sum.amount),
    }));

    // Get revenue trend for the last 6 months
    const revenueTrend = [];

    // Use a single transaction for all month queries to avoid connection issues
    const monthlyData = await executePrismaQuery(() =>
      prisma.$transaction(async (tx) => {
        const results = [];
        for (let i = 0; i < 6; i++) {
          const targetMonth = subMonths(now, i);
          const start = startOfMonth(targetMonth);
          const end = endOfMonth(targetMonth);

          const monthData = await tx.paymentHistory.aggregate({
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

          results.push({
            month: format(targetMonth, "MMM yyyy"),
            revenue: Number(monthData._sum.amount),
            date: targetMonth,
          });
        }
        return results;
      })
    );

    // Sort by date (oldest first)
    monthlyData.sort((a, b) => a.date.getTime() - b.date.getTime());
    const revenueTrendSorted = monthlyData.map(({ month, revenue }) => ({
      month,
      revenue,
    }));

    // Get recent transactions
    const recentTransactions = await executePrismaQuery(() =>
      prisma.$transaction(async (tx) => {
        return tx.paymentHistory.findMany({
          take: 10,
          orderBy: {
            date: "desc",
          },
          select: {
            id: true,
            amount: true,
            date: true,
            status: true,
            customerName: true,
            beneficiary: true, // Add this field
            serviceDescription: true,
            paymentMethod: true,
            paymentType: true,
          },
        });
      })
    );

    // And in the serialization
    const serializedTransactions = recentTransactions.map((payment) => ({
      id: payment.id,
      invoiceId:
        payment.paymentType === "outgoing"
          ? `EXP-${payment.id.substring(0, 4)}`
          : `INV-${payment.id.substring(0, 4)}`,
      amount: Number(payment.amount),
      date: payment.date.toISOString(),
      status: payment.status,
      customerName: payment.customerName || "",
      beneficiary: payment.beneficiary || "",
      serviceDescription: payment.serviceDescription || "",
      paymentMethod: payment.paymentMethod || "",
      paymentType: payment.paymentType || "incoming",
    }));

    return {
      success: true,
      data: {
        summaryCards: {
          totalRevenue: currentMonthRevenue,
          pendingPayments: {
            amount: totalPending,
            count: pendingPayments.length,
          },
          totalExpenses: currentMonthExpenses,
          netProfit: netProfit,
        },
        charts: {
          revenueTrend: revenueTrendSorted,
          expenseBreakdown: formattedExpenseBreakdown,
        },
        recentTransactions: serializedTransactions,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      success: false,
      error: "Failed to fetch dashboard data",
      data: {
        summaryCards: {
          totalRevenue: 0,
          pendingPayments: {
            amount: 0,
            count: 0,
          },
          totalExpenses: 0,
          netProfit: 0,
        },
        charts: {
          revenueTrend: [],
          expenseBreakdown: [],
        },
        recentTransactions: [],
      },
    };
  }
});
