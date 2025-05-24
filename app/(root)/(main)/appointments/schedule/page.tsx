"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AppointmentScheduler from "@/components/AppointmentScheduler";
import { getCurrentUser } from "@/lib/auth";
import { getPatients } from "@/lib/actions/sales.actions";
import { motion } from "framer-motion";
import { Search, UserPlus, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone } from "lucide-react";
import AddPatientModal from "@/components/AddPatientModal";

export const dynamic = "force-dynamic";

const ScheduleAppointmentSkeleton = () => (
  <div className="container mx-auto py-8 px-4">
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <Skeleton className="h-10 w-48 mb-4 md:mb-0 bg-white" />
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      {/* Patient Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-6 rounded" />
              </div>
            </div>
          ))}
      </div>
    </div>
  </div>
);

export default function ScheduleAppointmentPage() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [patientsResult, userResult] = await Promise.all([
        getPatients(),
        getCurrentUser(),
      ]);

      if (patientsResult.success) {
        setPatients(patientsResult.data);
      }

      if (userResult) {
        setCurrentUser(userResult);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePatientAdded = (newPatient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setIsAddModalOpen(false);
  };

  if (isLoading) {
    return <ScheduleAppointmentSkeleton />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {!selectedPatient ? (
          <>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 md:mb-0 tracking-tight">
                Select a Patient
              </h1>
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white hover:text-white"
              >
                <UserPlus size={18} />
                Add New Patient
              </Button>
            </div>

            <div className="relative mb-8">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                size={20}
              />
              <Input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-3 text-lg rounded-xl border-2 focus:border-primary/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {isLoading ? (
                Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-100 animate-pulse h-32 rounded-lg"
                    ></div>
                  ))
              ) : filteredPatients.length === 0 ? (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-500">No patients found</p>
                </div>
              ) : (
                filteredPatients.map((patient) => (
                  <motion.div
                    key={patient.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPatient(patient)}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer w-full"
                  >
                    <div className="p-6">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-xl font-bold text-white">
                            {patient.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {patient.name}
                          </h3>
                          <Badge variant="secondary" className="mt-1">
                            ID: {patient.id.slice(0, 8)}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          <span className="truncate">
                            {patient.email || "No email"}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <span>{patient.phone || "No phone"}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Button
                            variant="outline"
                            className="flex w-full items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white hover:text-white"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Select for scheduling
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </>
        ) : (
          <div>
            <h2 className="font-bold text-3xl text-center mb-4">
              Schedule for <br />{" "}
              <span className="text-blue-600"> {selectedPatient.name}</span>
            </h2>

            <AppointmentScheduler
              patientId={selectedPatient.id}
              staffId={currentUser.id}
            />
          </div>
        )}
      </div>
      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handlePatientAdded}
      />
    </div>
  );
}
