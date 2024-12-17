"use client";

import { useParams } from "next/navigation";
import PatientDetails from "@/components/PatientDetails";

export default function PatientDetailsPage() {
  const params = useParams();
  const patientId = params.id as string;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <PatientDetails patientId={patientId} />
    </div>
  );
}
