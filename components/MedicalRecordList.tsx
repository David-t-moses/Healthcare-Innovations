"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import EditMedicalRecordModal from "./EditMedicalRecordModal";
import {
  getMedicalRecords,
  deleteMedicalRecord,
} from "@/lib/actions/medical-record.actions";
import { format } from "date-fns";
import {
  PlusCircle,
  User,
  Stethoscope,
  Activity,
  Pill,
  FileText,
  Paperclip,
  CalendarDays,
  ClipboardList,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddMedicalRecord from "./AddMedicalRecord";

interface Props {
  onRecordAdded?: (newRecord: any) => void;
}

export default function MedicalRecordList({ userRole, onRecordAdded }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    const data = await getMedicalRecords();
    setRecords(data);
    setIsLoading(false);
  };

  const handleAddRecord = async (newRecord) => {
    setRecords((prevRecords) => [newRecord, ...prevRecords]);
    if (onRecordAdded) onRecordAdded(newRecord);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Medical Records</h2>
        {userRole === "STAFF" && (
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Medical Record
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex justify-center">
            <ClipboardList className="h-16 w-16 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No Medical Records Found
          </h3>
          <p className="mt-2 text-gray-500">
            {userRole === "STAFF"
              ? "Start by adding a new medical record for a patient."
              : "You don't have any medical records at the moment."}
          </p>
          {userRole === "STAFF" && (
            <Button
              onClick={() => setShowAddModal(true)}
              className="mt-4"
              variant="outline"
            >
              Add Your First Medical Record
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {records.map((record) => (
            <Card
              key={record.id}
              className="p-6 hover:shadow-lg transition-shadow relative"
            >
              {userRole === "STAFF" && (
                <div className="absolute top-4 right-4">
                  <DropdownMenu
                    open={openDropdownId === record.id}
                    onOpenChange={(open) =>
                      setOpenDropdownId(open ? record.id : null)
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
                          setEditingRecord(record);
                          setOpenDropdownId(null);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Record
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this record?"
                            )
                          ) {
                            deleteMedicalRecord(record.id);
                            loadRecords();
                          }
                          setOpenDropdownId(null);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Record
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              {userRole === "STAFF" && (
                <div className="flex items-center gap-2 text-blue-600 mb-4">
                  <User className="h-4 w-4" />
                  <p className="font-medium">{record.patient.name}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-red-500" />
                  <h3 className="text-lg font-semibold">{record.diagnosis}</h3>
                </div>

                <div className="grid gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-start gap-2">
                      <Activity className="h-4 w-4 text-orange-500 mt-1" />
                      <div>
                        <p className="font-medium text-sm">Symptoms</p>
                        <p className="text-gray-600">{record.symptoms}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Pill className="h-4 w-4 text-green-500 mt-1" />
                      <div>
                        <p className="font-medium text-sm">Treatment</p>
                        <p className="text-gray-600">{record.treatment}</p>
                      </div>
                    </div>

                    {record.notes && (
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-gray-500 mt-1" />
                        <div>
                          <p className="font-medium text-sm">Notes</p>
                          <p className="text-gray-600">{record.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-500 space-y-1">
                    <p className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      Recorded by:{" "}
                      {record.recordedBy?.fullName || "Unknown Staff"}
                    </p>
                    <p className="flex items-center gap-2">
                      <CalendarDays className="h-3 w-3" />
                      {format(new Date(record.recordDate), "PPP")}
                    </p>
                  </div>

                  {record.attachments && record.attachments.length > 0 && (
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Paperclip className="h-4 w-4 text-gray-500" />
                        <p className="font-medium text-sm">Attachments</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {record.attachments.map((attachment, index) => (
                          <a
                            key={index}
                            href={attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors text-sm"
                          >
                            <FileText className="h-3 w-3" />
                            Attachment {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <AddMedicalRecord
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddRecord}
      />
      <EditMedicalRecordModal
        record={editingRecord}
        open={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        onUpdate={loadRecords}
      />
    </div>
  );
}
