"use client";

import { getCurrentUser } from "@/lib/auth";
import StaffDashboard from "@/components/StaffDashboard";
import PatientDashboard from "@/components/PatientDashboard";
import { useSearch } from "@/components/SearchContext";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardSkeleton = () => (
  <div className="max-w-7xl mx-auto p-6 space-y-8">
    {/* Header Section */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
      <Skeleton className="h-10 w-[150px] rounded-lg" />
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Main Content */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <Skeleton className="h-6 w-[200px] mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-3 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <Skeleton className="h-6 w-[150px] mb-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-4">
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { searchTerm } = useSearch();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
      setIsLoading(true);
    };
    loadUser();
  }, []);

  if (!isLoading) {
    return <DashboardSkeleton />;
  }

  if (!user) return null;

  return user?.role === "STAFF" ? (
    <StaffDashboard searchTerm={searchTerm} userId={user?.id} />
  ) : (
    <PatientDashboard userId={user?.id} searchTerm={searchTerm} />
  );
}
