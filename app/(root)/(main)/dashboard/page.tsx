"use client";

import { getCurrentUser } from "@/lib/auth";
import StaffDashboard from "@/components/StaffDashboard";
import PatientDashboard from "@/components/PatientDashboard";
import { useSearch } from "@/components/SearchContext";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

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
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  if (!user) return null;

  return user?.role === "STAFF" ? (
    <StaffDashboard searchTerm={searchTerm} userId={user?.id} />
  ) : (
    <PatientDashboard userId={user?.id} searchTerm={searchTerm} />
  );
}
