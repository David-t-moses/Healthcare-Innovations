"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AppointmentScheduler from "@/components/AppointmentScheduler";
import { getCurrentUser } from "@/lib/auth";
import { getPatients } from "@/lib/actions/sales.actions";
import { motion } from "framer-motion";
import { Search, UserPlus, Calendar } from "lucide-react";

export default function ScheduleAppointmentPage() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {!selectedPatient ? (
          <>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
                Select Patient
              </h1>
            </div>

            <div className="relative mb-6">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                type="text"
                placeholder="Search patients by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {patient.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Patient ID: {patient.id.slice(0, 8)}
                        </p>
                      </div>
                      <Calendar className="text-gray-400" size={24} />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </>
        ) : (
          <div>
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="outline"
                onClick={() => setSelectedPatient(null)}
                className="flex items-center gap-2"
              >
                ← Back to patients
              </Button>
              <h2 className="text-2xl font-semibold">
                Schedule for {selectedPatient.name}
              </h2>
            </div>

            <AppointmentScheduler
              patientId={selectedPatient.id}
              staffId={currentUser.id}
            />
          </div>
        )}
      </div>
    </div>
  );
}
