"use client";

import { getCurrentUser } from "@/lib/auth";
import StaffDashboard from "@/components/StaffDashboard";
import PatientDashboard from "@/components/PatientDashboard";
import { useSearch } from "@/components/SearchContext";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const { searchTerm } = useSearch();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
    };
    loadUser();
  }, []);

  if (!user) return null;

  return user?.role === "STAFF" ? (
    <StaffDashboard searchTerm={searchTerm} />
  ) : (
    <PatientDashboard userId={user?.id} searchTerm={searchTerm} />
  );
}
