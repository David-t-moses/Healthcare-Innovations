"use client";

import { getCurrentUser } from "@/lib/auth";
import PrescriptionList from "@/components/PrescriptionList";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const PrescriptionsSkeleton = () => (
  <div className="container mx-auto py-6 h-screen">
    {/* Header Section */}
    <div className="mb-8">
      <Skeleton className="h-8 w-64 mb-2 bg-white" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-40 bg-white" />
        <Skeleton className="h-10 w-32 bg-white" />
      </div>
    </div>

    {/* Prescriptions List */}
    <div className="space-y-4">
      {[1, 2, 3, 4].map((index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>

          <div className="flex gap-2 mt-4">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function PrescriptionsPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const userData = await getCurrentUser();
      setUser(userData);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handlePrescriptionAdded = (newPrescription) => {};

  if (isLoading) {
    return <PrescriptionsSkeleton bg-white />;
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
