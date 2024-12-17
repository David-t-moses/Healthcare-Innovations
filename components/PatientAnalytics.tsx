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

  const supabase = createClientComponentClient();

  const fetchAnalytics = async () => {
    const { data: patientCount } = await supabase
      .from("Patient")
      .select("*", { count: "exact" });

    const { data: activeCount } = await supabase
      .from("Patient")
      .select("*", { count: "exact" })
      .eq("status", "active");

    if (patientCount !== null && activeCount !== null) {
      setAnalytics((prev) => ({
        ...prev,
        totalPatients: patientCount.length,
        activePatients: activeCount.length,
      }));
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel("patient_analytics")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Patient" },
        () => {
          fetchAnalytics();
        }
      )
      .subscribe();

    fetchAnalytics();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
