"use client";

import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { PieChartInteractive } from "./ui/piechart";
import { Skeleton } from "@/components/ui/skeleton";

interface SalesChartsProps {
  data: {
    revenueTrend: Array<{
      month: string;
      revenue: number;
    }>;
    expenseBreakdown: Array<{
      category: string;
      amount: number;
    }>;
  };
}

const SalesCharts: React.FC<SalesChartsProps> = ({ data }) => {
  const [isLoading, setIsLoading] = useState(true);

  // Determine if data is valid and complete
  useEffect(() => {
    // Check if data is loaded and valid
    const hasRevenueTrend =
      data && data.revenueTrend && data.revenueTrend.length > 0;
    const hasExpenseBreakdown =
      data && data.expenseBreakdown && data.expenseBreakdown.length > 0;

    // Set loading to false if we have valid data
    if (hasRevenueTrend || hasExpenseBreakdown) {
      // Add a small delay to show the skeleton for at least a moment
      // This makes the UI feel more responsive
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);

      return () => clearTimeout(timer);
    } else {
      setIsLoading(true);
    }
  }, [data]);

  // Ensure we have valid data for the pie chart
  const validExpenseData =
    data.expenseBreakdown && data.expenseBreakdown.length > 0
      ? data.expenseBreakdown
      : [{ category: "No Data", amount: 1 }];

  // Calculate total expenses for percentages
  const totalExpenses =
    validExpenseData.length > 0 && validExpenseData[0].category !== "No Data"
      ? validExpenseData.reduce((sum, item) => sum + item.amount, 0)
      : 0;

  // Calculate average revenue
  const avgRevenue =
    data.revenueTrend && data.revenueTrend.length > 0
      ? data.revenueTrend.reduce((sum, item) => sum + item.revenue, 0) /
        data.revenueTrend.length
      : 0;

  // Get the last month's revenue
  const lastMonthRevenue =
    data.revenueTrend && data.revenueTrend.length > 0
      ? data.revenueTrend[data.revenueTrend.length - 1].revenue
      : 0;

  // Get the previous month's revenue
  const previousMonthRevenue =
    data.revenueTrend && data.revenueTrend.length > 1
      ? data.revenueTrend[data.revenueTrend.length - 2].revenue
      : 0;

  // Calculate month-over-month change
  const revenueChange =
    previousMonthRevenue > 0
      ? ((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : 0;

  // Payment status cards data
  const statusCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(lastMonthRevenue),
      percentage:
        totalExpenses > 0
          ? ((lastMonthRevenue / totalExpenses) * 100).toFixed(1)
          : "0.0",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      color: "bg-green-50 border-green-100",
      textColor: "text-green-700",
      trend: Math.abs(revenueChange).toFixed(1),
      trendUp: revenueChange >= 0,
    },
    {
      title: "Average Revenue",
      value: formatCurrency(avgRevenue),
      percentage:
        totalExpenses > 0
          ? ((avgRevenue / totalExpenses) * 100).toFixed(1)
          : "0.0",
      icon: <Clock className="h-5 w-5 text-amber-500" />,
      color: "bg-amber-50 border-amber-100",
      textColor: "text-amber-700",
      trend: "5.2",
      trendUp: true,
    },
    {
      title: "Total Expenses",
      value: formatCurrency(totalExpenses),
      percentage: "100.0",
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      color: "bg-red-50 border-red-100",
      textColor: "text-red-700",
      trend: "2.8",
      trendUp: false,
    },
  ];

  // Skeleton components for loading state
  const ExpenseChartSkeleton = () => (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Pie Chart Skeleton */}
      <div className="w-full md:w-1/2">
        <div className="h-64 flex items-center justify-center">
          <Skeleton className="h-48 w-48 rounded-full" />
        </div>
      </div>

      {/* Status Cards Skeleton */}
      <div className="w-full md:w-1/2 flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border p-3 flex-1">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="flex flex-col items-end">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-3 w-10 mt-1.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const RevenueTrendSkeleton = () => (
    <div className="h-64 w-full">
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-end space-x-2">
          {Array(12)
            .fill(0)
            .map((_, i) => {
              const height = 20 + Math.random() * 60;
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full" style={{ height: `${height}%` }}>
                    <Skeleton className="h-full w-full" />
                  </div>
                  <Skeleton className="h-3 w-10 mt-2" />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
      {/* Expense Breakdown Chart with Payment Status Cards */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <h3 className="text-sm font-medium text-gray-800 mb-4">
          Expense Breakdown
        </h3>

        {isLoading ? (
          <ExpenseChartSkeleton />
        ) : (
          <div className="flex flex-col md:flex-row gap-4">
            {/* Pie Chart */}
            <div className="w-full md:w-1/2">
              <div className="h-64">
                <PieChartInteractive expenses={validExpenseData} />
              </div>
            </div>

            {/* Payment Status Cards */}
            <div className="w-full md:w-1/2 flex flex-col gap-3">
              {statusCards.map((card, index) => (
                <div
                  key={index}
                  className={`rounded-xl border p-3 flex-1 ${card.color}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-medium text-gray-600">
                        {card.title}
                      </p>
                      <h3
                        className={`mt-1 text-lg font-semibold ${card.textColor}`}
                      >
                        {card.value}
                      </h3>
                      <div className="flex items-center mt-1">
                        <div
                          className={`flex items-center ${
                            card.trendUp ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {card.trendUp ? (
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                          )}
                          <span className="text-xs font-medium">
                            {card.trend}%
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 ml-1.5">
                          vs last month
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="p-1.5 rounded-full bg-white shadow-sm">
                        {card.icon}
                      </div>
                      <span className="text-xs font-medium mt-1.5 text-gray-700">
                        {card.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <h3 className="text-sm font-medium text-gray-800 mb-4">
          Revenue Trend
        </h3>
        <div className="h-64">
          {isLoading ? (
            <RevenueTrendSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.revenueTrend}
                margin={{
                  top: 10,
                  right: 30,
                  left: 20,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  tickFormatter={(value) => `${value / 1000}k`}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={{ stroke: "#e2e8f0" }}
                />
                <Tooltip
                  formatter={(value) => [`${formatCurrency(value)}`, "Revenue"]}
                  labelStyle={{
                    color: "#374151",
                    fontWeight: "bold",
                    fontSize: 12,
                  }}
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "0.5rem",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                    fontSize: 12,
                  }}
                />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

// Colors for the pie chart
const COLORS = [
  "#2563eb", // blue-600
  "#3b82f6", // blue-500
  "#60a5fa", // blue-400
  "#93c5fd", // blue-300
  "#f87171", // red-400
  "#4ade80", // green-400
  "#a78bfa", // purple-400
  "#fbbf24", // amber-400
];

export default SalesCharts;
