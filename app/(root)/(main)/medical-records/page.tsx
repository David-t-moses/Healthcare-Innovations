"use client";

import { getCurrentUser } from "@/lib/auth";
import { useState, useEffect } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import MedicalRecordList from "@/components/MedicalRecordList";

export default async function MedicalRecordsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const user = await getCurrentUser();

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading Medical Records..." />;
  }

  return (
    <div className="container mx-auto py-6">
      <MedicalRecordList userRole={user?.role} />
    </div>
  );
}
