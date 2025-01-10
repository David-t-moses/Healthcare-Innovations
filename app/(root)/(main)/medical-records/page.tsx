"use client";

import { getCurrentUser } from "@/lib/auth";
import { useState, useEffect } from "react";
import MedicalRecordList from "@/components/MedicalRecordList";
import { Skeleton } from "@/components/ui/skeleton";

const MedicalRecordsSkeleton = () => (
  <div className="container mx-auto py-6">
    {/* Header Section */}
    <div className="mb-8">
      <Skeleton className="h-8 w-64 mb-2 bg-white" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-48 bg-white" />
        <Skeleton className="h-10 w-36 rounded-lg bg-white" />
      </div>
    </div>

    {/* Records List */}
    <div className="space-y-6">
      {[1, 2, 3, 4].map((index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>

          {/* Record Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full max-w-[200px]" />
              <Skeleton className="h-4 w-full max-w-[300px]" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full max-w-[250px]" />
              <Skeleton className="h-4 w-full max-w-[180px]" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function MedicalRecordsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      const userData = await getCurrentUser();
      setUser(userData);
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  const handleRecordAdded = (newRecord) => {};

  if (isLoading) {
    return <MedicalRecordsSkeleton />;
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
