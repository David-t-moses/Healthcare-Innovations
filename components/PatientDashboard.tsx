"use client";

import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { getPrescriptions } from "@/lib/actions/prescription.actions";
import { getMedicalRecords } from "@/lib/actions/medical-record.actions";
import { getAppointments } from "@/lib/actions/appointment.actions";
import {
  Calendar,
  Clock,
  Pill,
  FileText,
  User,
  CalendarClock,
  ArrowRight,
} from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { useRouter } from "next/navigation";

const AppointmentSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-6 w-3/4" />
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  </div>
);

export default function PatientDashboard({ userId, searchTerm }) {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [activePrescriptions, setActivePrescriptions] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      const appointmentsData = await getAppointments(userId, "PATIENT");

      if (appointmentsData && Array.isArray(appointmentsData)) {
        const upcoming = appointmentsData
          .filter((apt) => new Date(apt.startTime) > new Date())
          .filter(
            (apt) =>
              !searchTerm ||
              apt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              apt.user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        setUpcomingAppointments(upcoming);
      } else {
        setUpcomingAppointments([]);
      }

      const prescriptionsData = await getPrescriptions();
      const filteredPrescriptions = prescriptionsData.filter(
        (prescription) =>
          !searchTerm ||
          prescription.medication
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          prescription.dosage.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setActivePrescriptions(filteredPrescriptions);

      const recordsData = await getMedicalRecords();
      const filteredRecords = recordsData.filter(
        (records) =>
          !searchTerm ||
          records.medication.toLowerCase().includes(searchTerm.toLowerCase()) ||
          records.dosage.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setRecentRecords(filteredRecords);
      setIsLoading(false);
    };

    loadDashboardData();
  }, [userId]);

  const handleViewAllMedications = () => {
    router.push("/prescriptions");
  };

  const handleViewAllRecords = () => {
    router.push("/medical-records");
  };

  return (
    <div className="p-6 ">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
        {/* Next Appointment Widget */}
        <Card className="p-6 md:col-span-2 hover:shadow-lg transition-shadow bg-white/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <CalendarClock className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                Next Appointment
              </h2>
            </div>
          </div>

          {isLoading ? (
            <AppointmentSkeleton />
          ) : upcomingAppointments[0] ? (
            <div className="space-y-3">
              <p className="text-xl font-medium">
                {upcomingAppointments[0].title}
              </p>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <p>
                  {format(new Date(upcomingAppointments[0].startTime), "PPP")}
                </p>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <p>
                  {format(new Date(upcomingAppointments[0].startTime), "p")}
                </p>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <p>Dr. {upcomingAppointments[0].user.fullName}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No upcoming appointments</p>
          )}
        </Card>

        {/* Active Medications Widget */}
        <Card className="p-6 md:col-span-2 hover:shadow-lg transition-shadow bg-white/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-green-100 p-2 rounded-lg">
                <Pill className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                Active Medications
              </h2>
            </div>
            {activePrescriptions.length > 3 && (
              <button
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                onClick={handleViewAllMedications}
              >
                View all <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="p-3 rounded-lg">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              ))
            ) : activePrescriptions.length > 0 ? (
              activePrescriptions.slice(0, 3).map((prescription) => (
                <div
                  key={prescription.id}
                  className="p-3 bg-gray-100/50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <p className="font-medium">{prescription.medication}</p>
                  <p className="text-sm text-gray-600">{prescription.dosage}</p>
                  <p className="text-xs text-gray-500">
                    Duration: {prescription.duration}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No active medications</p>
            )}
          </div>
        </Card>

        {/* Health Summary Widget */}
        <Card className="p-6 md:col-span-4 hover:shadow-lg transition-shadow bg-white/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-purple-100 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                Recent Health Updates
              </h2>
            </div>
            {recentRecords.length > 3 && (
              <button
                onClick={handleViewAllRecords}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View all <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="p-4 rounded-lg">
                  <Skeleton className="h-5 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            ) : recentRecords.length > 0 ? (
              recentRecords.slice(0, 3).map((record) => (
                <div
                  key={record.id}
                  className="p-4 bg-gray-100/50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <p className="font-medium">{record.diagnosis}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {format(new Date(record.recordDate), "PP")}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <User className="h-3 w-3" />
                    <p>Dr. {record.recordedBy.fullName}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No recent health updates</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
