"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AddPrescriptionModal from "./AddPrescriptionModal";
import { getPrescriptions } from "@/lib/actions/prescription.actions";
import { format } from "date-fns";
import {
  PlusCircle,
  Pill,
  Clock,
  CalendarDays,
  User,
  FileText,
} from "lucide-react";

export default function PrescriptionList({ userRole }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    const data = await getPrescriptions();
    setPrescriptions(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Prescriptions</h2>
        {userRole === "STAFF" && (
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Prescription
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {prescriptions.map((prescription) => (
          <Card
            key={prescription.id}
            className="p-6 hover:shadow-lg transition-shadow"
          >
            {userRole === "STAFF" && (
              <div className="flex items-center gap-2 text-blue-600 mb-4">
                <User className="h-4 w-4" />
                <p className="font-medium">{prescription.patient.name}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-semibold">
                  {prescription.medication}
                </h3>
              </div>

              <div className="grid gap-2 text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <p>Dosage: {prescription.dosage}</p>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <p>Duration: {prescription.duration}</p>
                </div>
              </div>

              {prescription.notes && (
                <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-md">
                  <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                  <p className="text-sm text-gray-600">{prescription.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t text-sm text-gray-500 space-y-1">
                <p className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  Prescribed by: {prescription.prescribedBy.fullName}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays className="h-3 w-3" />
                  {format(new Date(prescription.createdAt), "PPP")}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AddPrescriptionModal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          loadPrescriptions();
        }}
      />
    </div>
  );
}
