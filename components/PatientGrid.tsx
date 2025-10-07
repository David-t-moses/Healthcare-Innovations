"use client";
import { useEffect, useState } from "react";
// Removed // Removed Supabase usage
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar, Trash2, Phone, Mail, Shield } from "lucide-react";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

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
  // Removed // Removed Supabase usage
  const router = useRouter();

  useEffect(() => {
    const fetchPatients = async () => {
      // Mock data for now
      const data: Patient[] = [];
      setPatients(data);
      setIsLoading(false);
    };

    fetchPatients();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {patients.map((patient) => (
        <div
          key={patient.id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden"
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
                <Badge
                  variant={
                    patient.status === "active" ? "success" : "secondary"
                  }
                  className="mt-1"
                >
                  {patient.status}
                </Badge>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                <span className="truncate">{patient.email || "No email"}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                <span>{patient.phone || "No phone"}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Shield className="w-4 h-4 mr-2" />
                <span>{patient.insurance || "No insurance"}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 hover:bg-gray-50"
                onClick={() =>
                  router.push(`/patients/schedule?patientId=${patient.id}`)
                }
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
              <Button
                variant="destructive"
                className="hover:bg-red-600"
                onClick={() => setPatientToDelete(patient)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
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
        title="Delete Patient"
        description="This will permanently remove the patient's records from the system."
        itemToDelete={patientToDelete?.name}
        onSuccess={() => {
          toast.success("Patient deleted successfully");
        }}
        onError={(error) => {
          toast.error(`Failed to delete patient: ${error.message}`);
        }}
        isDangerous={true}
        confirmText="Delete Patient"
        cancelText="Keep Patient"
      />
    </div>
  );
}
