"use client";

import { getCurrentUser } from "@/lib/auth";
import PrescriptionList from "@/components/PrescriptionList";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function PrescriptionsPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handlePrescriptionAdded = (newPrescription) => {};

  if (isLoading) {
    return <LoadingSpinner message="Loading prescriptions..." />;
  }

  return (
    <div className="container mx-auto py-6">
      <PrescriptionList
        userRole={user?.role}
        onPrescriptionAdded={handlePrescriptionAdded}
      />
    </div>
  );
}
