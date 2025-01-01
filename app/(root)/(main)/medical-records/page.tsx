"use client";

import { getCurrentUser } from "@/lib/auth";
import { useState, useEffect } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import MedicalRecordList from "@/components/MedicalRecordList";

export default function MedicalRecordsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  const handleRecordAdded = (newRecord) => {};

  if (isLoading) {
    return <LoadingSpinner message="Loading Medical Records..." />;
  }

  return (
    <div className="container mx-auto py-6">
      <MedicalRecordList
        userRole={user?.role}
        onRecordAdded={handleRecordAdded}
      />
    </div>
  );
}
