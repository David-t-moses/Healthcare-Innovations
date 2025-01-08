"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar, Search, User } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "./DeleteComfirmationModal";

interface Patient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  insurance: string | null;
  status: string;
  createdAt: Date;
}

interface PatientListProps {
  onDeletePatient: (patientId: string) => Promise<void>;
}

export default function PatientList({ onDeletePatient }: PatientListProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      let query = supabase.from("Patient").select("*");

      if (searchQuery) {
        query = query.or(
          `name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query.order("createdAt", {
        ascending: false,
      });
      console.log("Fetched patients:", data);

      if (error) {
        throw error;
      }

      setPatients(data || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const channel = supabase
      .channel("patients-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Patient" },
        (payload) => {
          console.log("Realtime update:", payload);
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

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <div className="animate-pulse h-12 bg-gray-200 rounded-lg" />
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="relative max-w-md mx-auto md:mx-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          placeholder="Search patients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 text-base rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
        />
      </div>

      {patients.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
          <User className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No patients found
          </h3>
          <p className="mt-2 text-base text-gray-500">
            Get started by adding a new patient to your practice.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">
                  Name
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Email
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Phone
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Insurance
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Status
                </TableHead>
                <TableHead className="text-right font-semibold text-gray-700">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow
                  key={patient.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="font-medium text-gray-900">
                    {patient.name}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {patient.email}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {patient.phone}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {patient.insurance || "Not provided"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        patient.status === "active" ? "success" : "secondary"
                      }
                      className="font-medium capitalize"
                    >
                      {patient.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/patients/details/${patient.id}`)
                        }
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Details
                      </Button> */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/patients/schedule?patientId=${patient.id}`
                          )
                        }
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setPatientToDelete(patient)}
                        className="hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

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
