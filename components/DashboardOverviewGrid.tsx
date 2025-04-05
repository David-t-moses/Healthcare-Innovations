"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Users,
  ShoppingBag,
  CreditCard,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Plus,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  User,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getAppointments } from "@/lib/actions/appointment.actions";
import { getSalesDashboardData } from "@/lib/actions/financesdashboard.actions";
import {
  getTotalStocks,
  getInProgressOrders,
  getRecentStock,
  getLowStockCount,
} from "@/lib/actions/stock.actions";
import { getPatients } from "@/lib/actions/sales.actions";
import { getCurrentUser } from "@/lib/auth";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  getPatientAnalytics,
  getPatientGrowth,
  getRecentPatients,
} from "@/lib/actions/patient.actions";
import Button from "./Button";

// Helper function to format date and time
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    time: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
};

const DashboardOverviewGrid: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appointmentsData, setAppointmentsData] = useState({
    today: 0,
    upcoming: 0,
    total: 0,
    recent: [] as any[],
  });
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);

  const [patientsInsightData, setPatientsInsightData] = useState({
    total: 0,
    active: 0,
    analytics: [] as any[],
    growth: 0,
  });
  const [patientsInsightLoading, setPatientsInsightLoading] = useState(true);

  const [inventoryData, setInventoryData] = useState({
    total: 0,
    lowStock: 0,
    pendingOrders: 0,
    recentItems: [] as any[],
  });
  const [inventoryLoading, setInventoryLoading] = useState(true);

  const [financesData, setFinancesData] = useState({
    revenue: 0,
    expenses: 0,
    pendingPayments: 0,
    pendingCount: 0,
    netProfit: 0,
    trend: 0,
    recentTransactions: [] as any[],
  });
  const [financesLoading, setFinancesLoading] = useState(true);

  const [directPatients, setDirectPatients] = useState([]);
  const router = useRouter();

  useEffect(() => {
    loadAppointmentsDirectly();
  }, []);

  useEffect(() => {
    loadPatientsInsightDirectly();
  }, []);

  useEffect(() => {
    loadInventoryDirectly();
  }, []);

  useEffect(() => {
    loadFinancesDirectly();
  }, []);

  useEffect(() => {
    loadPatientsDirectly();
  }, []);

  // Add these functions to load each section independently
  const loadAppointmentsDirectly = async () => {
    try {
      setAppointmentsLoading(true);
      const user = await getCurrentUser();
      if (!user) return;

      const appointmentsRes = await getAppointments(user.id, "STAFF");

      // Process appointments data
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayAppointments = appointmentsRes
        ? appointmentsRes.filter((apt) => {
            const aptDate = new Date(apt.startTime);
            return aptDate >= today && aptDate < tomorrow;
          }).length
        : 0;

      const upcomingAppointments = appointmentsRes
        ? appointmentsRes.filter((apt) => {
            const aptDate = new Date(apt.startTime);
            return aptDate > tomorrow && apt.status !== "CANCELLED";
          }).length
        : 0;

      // Get recent appointments
      let recentAppointments: any[] = [];
      if (appointmentsRes) {
        const sortedAppointments = [...appointmentsRes].sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );

        const upcoming = sortedAppointments.filter(
          (apt) =>
            new Date(apt.startTime) > new Date() && apt.status !== "CANCELLED"
        );

        if (upcoming.length > 0) {
          recentAppointments = upcoming.slice(0, 3);
        } else {
          const past = sortedAppointments
            .filter((apt) => new Date(apt.startTime) <= new Date())
            .reverse();
          recentAppointments = past.slice(0, 3);
        }

        recentAppointments = recentAppointments.map((apt) => {
          const aptDate = new Date(apt.startTime);
          const isPast = aptDate < new Date();

          return {
            ...apt,
            displayStatus: isPast ? "past" : "upcoming",
          };
        });
      }

      setAppointmentsData({
        today: todayAppointments,
        upcoming: upcomingAppointments,
        total: appointmentsRes ? appointmentsRes.length : 0,
        recent: recentAppointments,
      });
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const loadPatientsInsightDirectly = async () => {
    try {
      setPatientsInsightLoading(true);
      const [patientsRes, patientAnalyticsRes, patientGrowthRes] =
        await Promise.all([
          getPatients(),
          getPatientAnalytics(),
          getPatientGrowth(),
        ]);

      const patientAnalytics = patientAnalyticsRes?.success
        ? patientAnalyticsRes.data
        : [
            { month: "Jan", patients: 0 },
            { month: "Feb", patients: 0 },
            { month: "Mar", patients: 0 },
            { month: "Apr", patients: 0 },
            { month: "May", patients: 0 },
            { month: "Jun", patients: 0 },
          ];

      const growthPercentage = patientGrowthRes?.success
        ? patientGrowthRes.data.growthPercentage
        : 0;

      setPatientsInsightData({
        total: patientsRes.success ? patientsRes.data.length : 0,
        active: patientsRes.success
          ? patientsRes.data.filter((p: any) => p.status === "active").length
          : 0,
        analytics: patientAnalytics,
        growth: growthPercentage,
      });
    } catch (error) {
      console.error("Error loading patient insights:", error);
    } finally {
      setPatientsInsightLoading(false);
    }
  };

  const loadInventoryDirectly = async () => {
    try {
      setInventoryLoading(true);
      const [stockRes, ordersRes, recentStockRes, lowStockRes] =
        await Promise.all([
          getTotalStocks(),
          getInProgressOrders(),
          getRecentStock(),
          getLowStockCount(),
        ]);

      setInventoryData({
        total: stockRes ? stockRes.count : 0,
        lowStock: lowStockRes ? lowStockRes.count : 0,
        pendingOrders: ordersRes ? ordersRes.count : 0,
        recentItems: recentStockRes || [],
      });
    } catch (error) {
      console.error("Error loading inventory:", error);
    } finally {
      setInventoryLoading(false);
    }
  };

  const loadFinancesDirectly = async () => {
    try {
      setFinancesLoading(true);
      const financesRes = await getSalesDashboardData();

      const financesData = financesRes.success
        ? financesRes.data.summaryCards
        : {
            totalRevenue: 0,
            totalExpenses: 0,
            pendingPayments: { amount: 0, count: 0 },
            netProfit: 0,
          };

      setFinancesData({
        revenue: financesData.totalRevenue || 0,
        expenses: financesData.totalExpenses || 0,
        pendingPayments: financesData.pendingPayments?.amount || 0,
        pendingCount: financesData.pendingPayments?.count || 0,
        netProfit: financesData.netProfit || 0,
        trend: financesData.netProfit > 0 ? 1 : -1,
        recentTransactions: financesRes.success
          ? financesRes.data.recentTransactions
          : [],
      });
    } catch (error) {
      console.error("Error loading finances:", error);
    } finally {
      setFinancesLoading(false);
    }
  };

  const loadPatientsDirectly = async () => {
    try {
      const response = await getRecentPatients();
      console.log("Direct patients response:", response);
      if (response.success && response.data) {
        setDirectPatients(response.data.slice(0, 4));
      }
    } catch (error) {
      console.error("Error loading patients directly:", error);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Appointments Overview */}
      <motion.div variants={itemVariants} className="col-span-1">
        <Card className="h-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-sm font-medium text-gray-800 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-blue-600" />
              Appointments Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {appointmentsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-24" />
                <div className="flex justify-between max-md:hidden">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between max-md:hidden">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="h-px bg-gray-100 my-2" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <>
                <div className="flex items-baseline">
                  <span className="text-xl font-bold text-blue-600">
                    {appointmentsData.today}
                  </span>
                  <span className="ml-2 text-xs text-gray-600">today</span>
                </div>
                <div className="mt-2 space-y-1 max-md:hidden">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600 flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-blue-600" />
                      Upcoming
                    </span>
                    <span className="font-medium">
                      {appointmentsData.upcoming}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1 text-blue-600" />
                      Total
                    </span>
                    <span className="font-medium">
                      {appointmentsData.total}
                    </span>
                  </div>
                </div>

                {/* Recent Appointments Section */}
                <div className="mt-2">
                  <div className="h-px bg-gray-100 mb-2" />
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Recent Appointments
                  </h4>

                  {appointmentsData.recent.length > 0 ? (
                    <div className="space-y-1">
                      {appointmentsData.recent
                        .slice(0, 2)
                        .map((appointment, index) => {
                          const { date, time } = formatDateTime(
                            appointment.startTime
                          );
                          return (
                            <div
                              key={index}
                              className="flex items-center p-1 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center mr-2">
                                <Calendar className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="flex-grow">
                                <p className="text-xs font-medium text-gray-800">
                                  {appointment.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {date} at {time}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  appointment.displayStatus === "upcoming"
                                    ? "default"
                                    : "secondary"
                                }
                                className="ml-1 text-xs"
                              >
                                {appointment.displayStatus}
                              </Badge>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">
                      No upcoming appointments
                    </p>
                  )}

                  <div className="mt-2 text-right">
                    <a
                      href="/appointments"
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center justify-end"
                    >
                      View all appointments
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Financial Summary */}
      <motion.div variants={itemVariants} className="col-span-1 md:col-span-2">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-sm font-medium text-gray-800 flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2 text-blue-600" />
                Financial Summary
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-600 border-blue-100"
                >
                  Revenue: {formatCurrency(financesData.revenue)}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-600 border-red-100"
                >
                  Expenses: {formatCurrency(financesData.expenses)}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {financesLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-48 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ) : (
              <>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        {
                          month: "Jan",
                          revenue: financesData.revenue * 0.7,
                          expenses: financesData.expenses * 0.6,
                          profit:
                            financesData.revenue * 0.7 -
                            financesData.expenses * 0.6,
                        },
                        {
                          month: "Feb",
                          revenue: financesData.revenue * 0.8,
                          expenses: financesData.expenses * 0.7,
                          profit:
                            financesData.revenue * 0.8 -
                            financesData.expenses * 0.7,
                        },
                        {
                          month: "Mar",
                          revenue: financesData.revenue * 0.85,
                          expenses: financesData.expenses * 0.75,
                          profit:
                            financesData.revenue * 0.85 -
                            financesData.expenses * 0.75,
                        },
                        {
                          month: "Apr",
                          revenue: financesData.revenue * 0.95,
                          expenses: financesData.expenses * 0.9,
                          profit:
                            financesData.revenue * 0.95 -
                            financesData.expenses * 0.9,
                        },
                        {
                          month: "May",
                          revenue: financesData.revenue,
                          expenses: financesData.expenses,
                          profit: financesData.revenue - financesData.expenses,
                        },
                      ]}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 10, fill: "#64748b" }}
                        axisLine={{ stroke: "#e2e8f0" }}
                        tickLine={{ stroke: "#e2e8f0" }}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#64748b" }}
                        axisLine={{ stroke: "#e2e8f0" }}
                        tickLine={{ stroke: "#e2e8f0" }}
                        tickFormatter={(value) => `${value / 1000}k`}
                      />
                      <Tooltip
                        formatter={(value) => [`${formatCurrency(value)}`, ""]}
                        contentStyle={{
                          backgroundColor: "white",
                          borderRadius: "0.5rem",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                          fontSize: 11,
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        iconSize={8}
                        iconType="circle"
                        formatter={(value) => (
                          <span className="text-xs">{value}</span>
                        )}
                      />
                      <defs>
                        <linearGradient
                          id="colorRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorExpenses"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#ef4444"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#ef4444"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorProfit"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#colorRevenue)"
                        name="Revenue"
                        activeDot={{ r: 6 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stroke="#ef4444"
                        strokeWidth={2}
                        fill="url(#colorExpenses)"
                        name="Expenses"
                        activeDot={{ r: 6 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="profit"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#colorProfit)"
                        name="Net Profit"
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="p-2 bg-blue-50 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">Revenue</p>
                    <div className="flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">
                        {formatCurrency(financesData.revenue)}
                      </span>
                      <span className="ml-1 text-xs text-blue-600">
                        {financesData.trend > 0 ? "↑" : "↓"}
                        {Math.abs(financesData.trend)}%
                      </span>
                    </div>
                  </div>

                  <div className="p-2 bg-red-50 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">Expenses</p>
                    <div className="flex items-center justify-center">
                      <span className="text-sm font-bold text-red-600">
                        {formatCurrency(financesData.expenses)}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 bg-green-50 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">Net Profit</p>
                    <div className="flex items-center justify-center">
                      <span
                        className={`text-sm font-bold ${
                          financesData.netProfit >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(financesData.netProfit)}
                      </span>
                      <span
                        className={`ml-1 text-xs ${
                          financesData.netProfit >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {financesData.netProfit >= 0 ? (
                          <ArrowUpRight className="inline h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="inline h-3 w-3" />
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Patient Insights */}
      <motion.div variants={itemVariants} className="col-span-2">
        <Card className="h-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-sm font-medium text-gray-800 flex items-center">
              <Users className="h-4 w-4 mr-2 text-blue-600" />
              Patient Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {patientsInsightLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-24" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-28 w-full" />
              </div>
            ) : (
              <>
                {/* <div className="flex items-baseline">
                  <span className="text-xl font-bold text-blue-600">
                    {patientsInsightData.total}
                  </span>
                  <span className="ml-2 text-xs text-gray-600">patients</span>
                </div>
                <div className="mt-1 flex items-center text-xs text-gray-600">
                  <span className="mr-4">
                    Active: {patientsInsightData.active}
                  </span>
                  <span>Recent visits: {appointmentsData.total}</span>
                </div> */}

                <div className="mt-2">
                  <h3 className="text-xs font-medium text-gray-800 mb-1">
                    Patient Growth
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">
                    Patient registrations have{" "}
                    {patientsInsightData.growth >= 0
                      ? "increased"
                      : "decreased"}{" "}
                    by {Math.abs(patientsInsightData.growth)}% compared to last
                    month
                  </p>

                  <div className="h-28">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={patientsInsightData.analytics}
                        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 9, fill: "#64748b" }}
                          axisLine={{ stroke: "#e2e8f0" }}
                          tickLine={{ stroke: "#e2e8f0" }}
                        />
                        <YAxis
                          tick={{ fontSize: 9, fill: "#64748b" }}
                          axisLine={{ stroke: "#e2e8f0" }}
                          tickLine={{ stroke: "#e2e8f0" }}
                        />
                        <Tooltip
                          formatter={(value) => [
                            `${value} patients`,
                            "Registrations",
                          ]}
                          contentStyle={{
                            backgroundColor: "white",
                            borderRadius: "0.5rem",
                            border: "1px solid #e5e7eb",
                            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                            fontSize: 10,
                          }}
                        />
                        <defs>
                          <linearGradient
                            id="colorPatients"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#3b82f6"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#3b82f6"
                              stopOpacity={0.1}
                            />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="patients"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          fill="url(#colorPatients)"
                          animationDuration={1500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Inventory & Stock */}
      <motion.div variants={itemVariants} className="col-span-1">
        <Card className="h-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-sm font-medium text-gray-800 flex items-center">
              <ShoppingBag className="h-4 w-4 mr-2 text-blue-600" />
              Inventory & Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {inventoryLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-24" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="h-px bg-gray-100 my-2" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <>
                <div className="flex items-baseline">
                  <span className="text-xl font-bold text-blue-600">
                    {inventoryData.total}
                  </span>
                  <span className="ml-2 text-xs text-gray-600">items</span>
                </div>
                {/* <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
                      Low Stock
                    </span>
                    <span className="font-medium text-amber-600">
                      {inventoryData.lowStock}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600 flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-purple-500" />
                      Pending Orders
                    </span>
                    <span className="font-medium text-purple-600">
                      {inventoryData.pendingOrders}
                    </span>
                  </div>
                </div> */}

                {/* Recent Stock Items */}
                <div className="mt-2">
                  <div className="h-px bg-gray-100 mb-2" />
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Recent Stock Items
                  </h4>

                  {inventoryData.recentItems.length > 0 ? (
                    <div className="space-y-1">
                      {inventoryData.recentItems
                        .slice(0, 2)
                        .map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center p-1 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center mr-2">
                              <ShoppingBag className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-grow">
                              <p className="text-xs font-medium text-gray-800">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Qty: {item.quantity} • Min:{" "}
                                {item.minimumQuantity}
                              </p>
                            </div>
                            <Badge
                              variant={
                                item.quantity <= item.minimumQuantity
                                  ? "destructive"
                                  : "success"
                              }
                              className="ml-1 text-xs"
                            >
                              {item.quantity <= item.minimumQuantity
                                ? "Low"
                                : "In Stock"}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">
                      No recent stock items
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Patient List Section */}
      <motion.div
        variants={itemVariants}
        className="col-span-1 md:col-span-3 mt-4"
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Users className="h-4 w-4 mr-2 text-blue-600" />
            Recent Patients
          </h2>
          <a
            href="/patients"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            View all
            <ChevronRight className="ml-1 h-4 w-4" />
          </a>
        </div>

        {isLoading && directPatients.length === 0 ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">
                    Name
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Email
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Phone
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {directPatients.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-4 text-gray-500"
                    >
                      No patients found
                    </TableCell>
                  </TableRow>
                ) : (
                  directPatients.map((patient, index) => (
                    <TableRow
                      key={patient.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <TableCell className="font-medium text-gray-900">
                        {patient.name}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {patient.email || "Not provided"}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {patient.phone || "Not provided"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            patient.status === "active"
                              ? "success"
                              : "secondary"
                          }
                          className="font-medium capitalize"
                        >
                          {patient.status || "inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default DashboardOverviewGrid;
