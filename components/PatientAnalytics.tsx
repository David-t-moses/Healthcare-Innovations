"use client";
import { useEffect, useState } from "react";
import { getPatientAnalytics } from "@/lib/actions/patient.actions";
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
import { Users, UserCheck, TrendingUp } from "lucide-react";

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

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const result = await getPatientAnalytics();
      if (result.success) {
        // Mock data for now
        setAnalytics((prev) => ({
          ...prev,
          totalPatients: 150,
          activePatients: 120,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold">
                {analytics.totalPatients}
              </CardTitle>
              <CardDescription>Total Patients</CardDescription>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              Overall registered patients in the system
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold">
                {analytics.activePatients}
              </CardTitle>
              <CardDescription>Active Patients</CardDescription>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              Currently active patient count
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow lg:col-span-1 md:col-span-2">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold">
                {analytics.visitTrends.datasets[0].data.reduce(
                  (a, b) => a + b,
                  0
                )}
              </CardTitle>
              <CardDescription>Total Visits</CardDescription>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              Cumulative patient visits
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Visit Trends</CardTitle>
          <CardDescription>Monthly patient visit analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar
              data={analytics.visitTrends}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
