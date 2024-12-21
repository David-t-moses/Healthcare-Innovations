"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AddMedicalRecordModal from "./AddMedicalRecordModal";
import { getMedicalRecords } from "@/lib/actions/medical-record.actions";
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
} from "lucide-react";

export default function MedicalRecordList({ userRole }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    const data = await getMedicalRecords();
    setRecords(data);
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

      <div className="grid gap-6 lg:grid-cols-2">
        {records.map((record) => (
          <Card
            key={record.id}
            className="p-6 hover:shadow-lg transition-shadow"
          >
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
                    Recorded by: {record.recordedBy.fullName}
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

      <AddMedicalRecordModal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          loadRecords();
        }}
      />
    </div>
  );
}
