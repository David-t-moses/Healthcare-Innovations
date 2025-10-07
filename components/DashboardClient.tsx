"use client";

import React from "react";
import { useSearch } from "@/components/SearchContext";
import StaffDashboard from "@/components/StaffDashboard";
import PatientDashboard from "@/components/PatientDashboard";

type User = {
  id: string;
  role: "PATIENT" | "STAFF";
};

export default function DashboardClient({ user }: { user: User | null }) {
  const { searchTerm } = useSearch();

  if (!user) return null;

  return user.role === "STAFF" ? (
    <StaffDashboard />
  ) : (
    <PatientDashboard userId={user.id} searchTerm={searchTerm} />
  );
}
