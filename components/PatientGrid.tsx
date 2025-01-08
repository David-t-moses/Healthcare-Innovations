"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Trash2 } from "lucide-react";
import { DeleteConfirmationModal } from "./DeleteComfirmationModal";

interface Patient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  insurance: string | null;
  status: string;
}

export default function PatientGrid({ onDeletePatient }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchPatients = async () => {
      const { data, error } = await supabase
        .from("Patient")
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Error fetching patients:", error);
        return;
      }
      setPatients(data || []);
      setIsLoading(false);
    };

    fetchPatients();

    const channel = supabase
      .channel("patients-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Patient" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setPatients((curr) => [payload.new as Patient, ...curr]);
          } else if (payload.eventType === "DELETE") {
            setPatients((curr) => curr.filter((p) => p.id !== payload.old.id));
          } else if (payload.eventType === "UPDATE") {
            setPatients((curr) =>
              curr.map((p) =>
                p.id === payload.new.id ? (payload.new as Patient) : p
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {patients.map((patient) => (
        <div
          key={patient.id}
          className="bg-white rounded-lg shadow-md p-6 space-y-4"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-semibold text-blue-600">
                {patient.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold">{patient.name}</h3>
              <p className="text-sm text-gray-500">{patient.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Phone</span>
              <span>{patient.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Insurance</span>
              <span>{patient.insurance || "Not provided"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <Badge
                variant={patient.status === "active" ? "success" : "secondary"}
              >
                {patient.status}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            {/* <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push(`/patients/details/${patient.id}`)}
            >
              <User className="w-4 h-4 mr-2" />
              Details
            </Button> */}
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                router.push(`/patients/schedule?patientId=${patient.id}`)
              }
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
            <Button
              variant="destructive"
              onClick={() => setPatientToDelete(patient)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}

      <DeleteConfirmationModal
        isOpen={!!patientToDelete}
        onClose={() => setPatientToDelete(null)}
        onConfirm={async () => {
          if (patientToDelete) {
            await onDeletePatient(patientToDelete.id);
            setPatientToDelete(null);
          }
        }}
      />
    </div>
  );
}
