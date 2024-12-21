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
} from "lucide-react";

export default function PatientDashboard({ userId, searchTerm }) {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [activePrescriptions, setActivePrescriptions] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      // Fetch patient-specific appointments
      const { appointments } = await getAppointments(userId, "PATIENT");

      const upcoming = appointments
        .filter((apt) => new Date(apt.startTime) > new Date())
        .filter(
          (apt) =>
            !searchTerm ||
            apt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setUpcomingAppointments(upcoming);

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

    };

    loadDashboardData();
  }, [userId]);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
        {/* Next Appointment Widget - Spans 2 columns */}
        <Card className="p-6 md:col-span-2 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <CalendarClock className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold">Next Appointment</h2>
          </div>
          {upcomingAppointments[0] ? (
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

        {/* Active Medications Widget - Spans 2 columns */}
        <Card className="p-6 md:col-span-2 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <Pill className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold">Active Medications</h2>
          </div>
          <div className="space-y-3">
            {activePrescriptions.length > 0 ? (
              activePrescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="p-3 bg-gray-50 rounded-lg"
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

        {/* Health Summary Widget - Spans full width */}
        <Card className="p-6 md:col-span-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-purple-100 p-2 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold">Recent Health Updates</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {recentRecords.length > 0 ? (
              recentRecords.map((record) => (
                <div key={record.id} className="p-4 bg-gray-50 rounded-lg">
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
