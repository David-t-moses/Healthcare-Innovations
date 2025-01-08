"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function PatientAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalPatients: 0,
    activePatients: 0,
    visitTrends: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Patient Visits",
          data: [65, 59, 80, 81, 56, 55],
          backgroundColor: "rgba(54, 162, 235, 0.5)",
        },
      ],
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClientComponentClient();

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAnalytics();

    const channel = supabase
      .channel("analytics_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Patient" },
        () => {
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [analytics]);

  const fetchAnalytics = async () => {
    const { data: patientCount } = await supabase
      .from("Patient")
      .select("*", { count: "exact" });

    const { data: activeCount } = await supabase
      .from("Patient")
      .select("*", { count: "exact" })
      .eq("status", "active");

    setAnalytics((prev) => ({
      ...prev,
      totalPatients: patientCount?.length || 0,
      activePatients: activeCount?.length || 0,
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6 w-full animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
              <div className="h-4 w-48 bg-gray-100 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-blue-200 rounded"></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
              <div className="h-4 w-48 bg-gray-100 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-green-200 rounded"></div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-[400px]">
          <CardHeader>
            <div className="h-6 w-32 bg-gray-200 rounded"></div>
            <div className="h-4 w-48 bg-gray-100 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-gray-100 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Patients</CardTitle>
            <CardDescription>Overall registered patients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {analytics.totalPatients}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Patients</CardTitle>
            <CardDescription>Currently active patients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {analytics.activePatients}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="h-[400px]">
        <CardHeader>
          <CardTitle>Visit Trends</CardTitle>
          <CardDescription>Monthly patient visits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar
              data={analytics.visitTrends}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
