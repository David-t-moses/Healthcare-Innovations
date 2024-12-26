"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AddPrescriptionModal from "./AddPrescriptionModal";
import EditPrescriptionModal from "./EditPrescriptionModal";
import {
  getPrescriptions,
  deletePrescription,
} from "@/lib/actions/prescription.actions";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlusCircle,
  Pill,
  Clock,
  CalendarDays,
  User,
  FileText,
  ClipboardX,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

export default function PrescriptionList({ userRole }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);

  const [editingPrescription, setEditingPrescription] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

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
            className="flex items-center gap-2 bg-blue-600"
          >
            <PlusCircle className="h-4 w-4" />
            Add Prescription
          </Button>
        )}
      </div>

      {prescriptions.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex justify-center">
            <ClipboardX className="h-16 w-16 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No Prescriptions Found
          </h3>
          <p className="mt-2 text-gray-500">
            {userRole === "STAFF"
              ? "Start by adding a new prescription for a patient."
              : "You don't have any prescriptions at the moment."}
          </p>
          {userRole === "STAFF" && (
            <Button
              onClick={() => setShowAddModal(true)}
              className="mt-4"
              variant="outline"
            >
              Add Your First Prescription
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {prescriptions.map((prescription) => (
            <Card
              key={prescription.id}
              className="p-6 hover:shadow-lg transition-shadow relative"
            >
              {userRole === "STAFF" && (
                <div className="absolute top-4 right-4">
                  <DropdownMenu
                    open={openDropdownId === prescription.id}
                    onOpenChange={(open) =>
                      setOpenDropdownId(open ? prescription.id : null)
                    }
                  >
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingPrescription(prescription);
                          setOpenDropdownId(null);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Prescription
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this prescription?"
                            )
                          ) {
                            deletePrescription(prescription.id);
                            loadPrescriptions();
                          }
                          setOpenDropdownId(null);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Prescription
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
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
                    <p className="text-sm text-gray-600">
                      {prescription.notes}
                    </p>
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
      )}
      <AddPrescriptionModal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          loadPrescriptions();
        }}
      />
      <EditPrescriptionModal
        prescription={editingPrescription}
        open={!!editingPrescription}
        onClose={() => setEditingPrescription(null)}
        onUpdate={loadPrescriptions}
      />
    </div>
  );
}
