"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PatientDetailsProps {
  patientId: string;
}

export default function PatientDetails({ patientId }: PatientDetailsProps) {
  const [patient, setPatient] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchPatientData = async () => {
      const { data: patientData } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .single();

      const { data: historyData } = await supabase
        .from("medical_history")
        .select("*")
        .eq("patient_id", patientId);

      const { data: prescriptionData } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("patient_id", patientId);

      setPatient(patientData);
      setMedicalHistory(historyData || []);
      setPrescriptions(prescriptionData || []);
    };

    fetchPatientData();
  }, [patientId]);

  if (!patient) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{patient.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p>{patient.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p>{patient.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p>{new Date(patient.dateOfBirth).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Insurance</p>
              <p>{patient.insurance}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">Medical History</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          {medicalHistory.map((record) => (
            <Card key={record.id} className="mb-4">
              <CardHeader>
                <CardTitle>{record.diagnosis}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{record.notes}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(record.date).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="prescriptions">
          {prescriptions.map((prescription) => (
            <Card key={prescription.id} className="mb-4">
              <CardHeader>
                <CardTitle>{prescription.medication}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Dosage: {prescription.dosage}</p>
                <p>Instructions: {prescription.instructions}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Prescribed: {new Date(prescription.date).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
