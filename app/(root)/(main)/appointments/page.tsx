"use client";

import { getCurrentUser } from "@/lib/auth";
import { getAppointments } from "@/lib/actions/appointment.actions";
import AppointmentsList from "@/components/AppointmentLists";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

const AppointmentsSkeleton = () => (
  <div className="container mx-auto py-6">
    {/* Page Header */}
    <div className="mb-6">
      <Skeleton className="h-8 w-48 mb-2 bg-white" />
      <Skeleton className="h-10 w-48 bg-white" />
    </div>

    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="grid grid-cols-6 gap-4 bg-gray-50 p-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-24" />
      </div>

      {[1, 2, 3, 4, 5].map((index) => (
        <div
          key={index}
          className="grid grid-cols-6 gap-4 p-4 border-b border-gray-100"
        >
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <div className="hidden md:flex gap-2">
            <Skeleton className="hidden md:block h-8 w-8 rounded-full" />
            <Skeleton className="hidden md:block h-8 w-8 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function AppointmentsPage() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializePage = async () => {
      setIsLoading(true);
      const userData = await getCurrentUser();
      setUser(userData);

      if (userData) {
        const appointmentsData = await getAppointments(
          userData.id,
          userData.role
        );
        setAppointments(appointmentsData);
      }

      setIsLoading(false);
    };

    initializePage();
  }, []);

  if (isLoading) {
    return <AppointmentsSkeleton />;
  }

  if (!user) return null;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">My Appointments</h1>
      <AppointmentsList appointments={appointments} userRole={user.role} />
    </div>
  );
}
