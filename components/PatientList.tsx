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

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients();
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
    let query = supabase.from("patients").select("*");

    if (searchQuery) {
      query = query.or(
        `name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`
      );
    }

    const { data } = await query;
    setPatients(data || []);
    setIsLoading(false);
  };

  const handleViewDetails = (patientId: string) => {
    router.push(`/patients/${patientId}`);
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search patients by name, email, or phone..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-sm"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Insurance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow
              key={patient.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleViewDetails(patient.id)}
            >
              <TableCell className="font-medium">{patient.name}</TableCell>
              <TableCell>{patient.email}</TableCell>
              <TableCell>{patient.phone}</TableCell>
              <TableCell>{patient.insurance || "Not provided"}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    patient.status === "active" ? "success" : "secondary"
                  }
                >
                  {patient.status}
                </Badge>
              </TableCell>
              <TableCell>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/schedule?patientId=${patient.id}`);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Schedule
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
