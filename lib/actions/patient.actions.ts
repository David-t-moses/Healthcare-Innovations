"use server";

import prisma from "@/lib/prisma";
import { cache } from "react";

export const getPatientAnalytics = cache(async () => {
  try {
    // Get the current date
    const now = new Date();

    // Calculate date 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    // Query patients created in the last 6 months
    const patients = await prisma.patient.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Initialize monthly counts
    const monthlyData = [];
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date();
      monthDate.setMonth(now.getMonth() - 5 + i);

      const monthName = monthDate.toLocaleString("default", { month: "short" });
      monthlyData.push({
        month: monthName,
        patients: 0,
      });
    }

    // Count patients per month
    patients.forEach((patient) => {
      const patientMonth = patient.createdAt.getMonth();
      const patientYear = patient.createdAt.getFullYear();

      for (let i = 0; i < 6; i++) {
        const dataMonth = new Date();
        dataMonth.setMonth(now.getMonth() - 5 + i);

        if (
          patientMonth === dataMonth.getMonth() &&
          patientYear === dataMonth.getFullYear()
        ) {
          monthlyData[i].patients++;
          break;
        }
      }
    });

    return { success: true, data: monthlyData };
  } catch (error) {
    console.error("Error fetching patient analytics:", error);
    return { success: false, error: "Failed to fetch patient analytics" };
  }
});

export const getPatientGrowth = cache(async () => {
  try {
    // Get current month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Get previous month
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Start of current month
    const currentMonthStart = new Date(currentYear, currentMonth, 1);

    // Start of previous month
    const prevMonthStart = new Date(prevYear, prevMonth, 1);

    // End of previous month
    const prevMonthEnd = new Date(currentYear, currentMonth, 0);

    // Count patients registered in current month
    const currentMonthPatients = await prisma.patient.count({
      where: {
        createdAt: {
          gte: currentMonthStart,
        },
      },
    });

    // Count patients registered in previous month
    const prevMonthPatients = await prisma.patient.count({
      where: {
        createdAt: {
          gte: prevMonthStart,
          lte: prevMonthEnd,
        },
      },
    });

    // Calculate growth percentage
    let growthPercentage = 0;
    if (prevMonthPatients > 0) {
      growthPercentage =
        ((currentMonthPatients - prevMonthPatients) / prevMonthPatients) * 100;
    }

    return {
      success: true,
      data: {
        currentMonth: currentMonthPatients,
        previousMonth: prevMonthPatients,
        growthPercentage: Math.round(growthPercentage),
      },
    };
  } catch (error) {
    console.error("Error calculating patient growth:", error);
    return { success: false, error: "Failed to calculate patient growth" };
  }
});

export const getRecentPatients = cache(async () => {
  try {
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
    });

    console.log("Patients:", patients);

    return { success: true, data: patients };
  } catch (error) {
    console.error("Error fetching recent patients:", error);
    return { success: false, error: "Failed to fetch recent patients" };
  }
});
