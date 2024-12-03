"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User } from "lucide-react";

export default function PatientGrid() {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel("patients")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "patients" },
        () => fetchPatients()
      )
      .subscribe();

    fetchPatients();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPatients = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });
    setPatients(data || []);
    setIsLoading(false);
  };

  const handleViewDetails = (patientId: string) => {
    router.push(`/patients/details/${patientId}`);
  };

  const handleSchedule = (patientId: string) => {
    router.push(`/patients/schedule?patientId=${patientId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {patients.map((patient, index) => (
        <motion.div
          key={patient.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xl font-semibold text-blue-600">
                  {patient.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {patient.name}
                </h3>
                <p className="text-sm text-gray-500">{patient.email}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Phone</span>
                <span>{patient.phone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Insurance</span>
                <span>{patient.insurance || "Not provided"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <Badge
                  variant={
                    patient.status === "active" ? "success" : "secondary"
                  }
                >
                  {patient.status}
                </Badge>
              </div>
            </div>

            <div className="mt-6 flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleViewDetails(patient.id)}
              >
                <User className="w-4 h-4 mr-2" />
                View Details
              </Button>
              <Button
                variant="default"
                className="flex-1"
                onClick={() => handleSchedule(patient.id)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
