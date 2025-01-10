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
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

export default function PatientList({ onDeletePatient }) {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const fetchPatients = async () => {
    try {
      let query = supabase.from("Patient").select("*");

      if (searchQuery) {
        query = query.or(
          `name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query.order("createdAt", {
        ascending: false,
      });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      toast.error("Failed to load patients");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [searchQuery, patients]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative  md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 "
          />
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No patients found
          </h3>
          <p className="mt-2 text-gray-500">
            Start by adding a new patient to your practice
          </p>
        </div>
      ) : (
        <div className=" bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="">
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
