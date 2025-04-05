"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Clock,
  DollarSign,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryCardsProps {
  data?: {
    totalRevenue: number;
    pendingPayments: {
      amount: number;
      count: number;
    };
    totalExpenses: number;
    netProfit: number;
  };
  isLoading?: boolean;
}

export default function SummaryCards({
  data,
  isLoading = false,
}: SummaryCardsProps) {
  // Card definitions with static content and dynamic data
  const cards = [
    {
      title: "Total Revenue",
      value: data?.totalRevenue,
      icon: <TrendingUp className="h-5 w-5 text-blue-600" />,
      performance: 12.5,
      positive: true,
      color: "bg-white",
      accentColor: "bg-blue-600",
      textColor: "text-gray-900",
    },
    {
      title: "Pending Payments",
      value: data?.pendingPayments?.amount,
      subtext: data ? `${data.pendingPayments.count} pending` : "",
      icon: <Clock className="h-5 w-5 text-blue-600" />,
      performance: 3.2,
      positive: false,
      color: "bg-white",
      accentColor: "bg-blue-600",
      textColor: "text-gray-900",
    },
    {
      title: "Total Expenses",
      value: data?.totalExpenses,
      icon: <DollarSign className="h-5 w-5 text-blue-600" />,
      performance: 8.4,
      positive: false,
      color: "bg-white",
      accentColor: "bg-blue-600",
      textColor: "text-gray-900",
    },
    {
      title: "Net Profit",
      value: data?.netProfit,
      icon: <PiggyBank className="h-5 w-5 text-blue-600" />,
      performance: 15.3,
      positive: true,
      color: "bg-white",
      accentColor: "bg-blue-600",
      textColor: "text-gray-900",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {cards.map((card, index) => (
        <motion.div
          key={index}
          variants={item}
          className={`rounded-xl border shadow-sm ${card.color} overflow-hidden`}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
        >
          <div className="flex">
            {/* Vertical accent line */}
            <div className={`w-1 ${card.accentColor}`}></div>

            <div className="flex-1 p-4">
              {/* First row */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  {/* Title is static, so always show it */}
                  <p className="text-xs font-medium text-gray-500">
                    {card.title}
                  </p>

                  {/* Value comes from database, so show skeleton when loading */}
                  {isLoading ? (
                    <Skeleton className="h-6 w-32 mt-1" />
                  ) : (
                    <h3 className={`text-xl font-semibold ${card.textColor}`}>
                      {card.value !== undefined
                        ? formatCurrency(card.value)
                        : "N/A"}
                    </h3>
                  )}
                </div>

                {/* Icon is static, so always show it */}
                <div className="p-2 rounded-md bg-blue-50">{card.icon}</div>
              </div>

              {/* Second row - Performance metrics */}
              <div className="flex items-center">
                {/* Performance percentage comes from calculation, show skeleton when loading */}
                {isLoading ? (
                  <Skeleton className="h-3 w-16 mr-2" />
                ) : (
                  <div
                    className={`flex items-center ${
                      card.positive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {card.positive ? (
                      <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5 mr-1" />
                    )}
                    <span className="text-xs font-medium">
                      {card.performance}%
                    </span>
                  </div>
                )}

                {/* "since last week" is static text, so always show it */}
                <span className="text-xs text-gray-500 ml-1.5">
                  since last week
                </span>

                {/* Additional subtext if available - comes from database */}
                {card.subtext && !isLoading && (
                  <span className="text-xs text-gray-500 ml-auto">
                    {card.subtext}
                  </span>
                )}
                {isLoading && index === 1 && (
                  <Skeleton className="h-3 w-20 ml-auto" />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
