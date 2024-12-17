"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, AlertCircle } from "lucide-react";
import { BackButton } from "./BackButton";

interface PatientDetailsProps {
  patientId: string;
}

export default function PatientDetails({ patientId }: PatientDetailsProps) {
  const [patient, setPatient] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchPatientData = async () => {
      const { data: patientData } = await supabase
        .from("Patient") // Changed from "patients"
        .select(
          `
    id,
    name,
    email,
    phone,
    dateOfBirth,
    insurance,
    emergencyContact,
    status,
    createdAt,
    lastVisit,
    medicalHistories:MedicalHistory(
      id,
      diagnosis,
      notes,
      date,
      staffId
    ),
    prescriptions:Prescription(
      id,
      medication,
      dosage,
      instructions,
      date,
      staffId
    ),
    paymentHistories:PaymentHistory(
      id,
      amount,
      date,
      status,
      paymentMethod
    )
  `
        )
        .eq("id", patientId)
        .single();
      setPatient(patientData);
    };

    fetchPatientData();

    // Set up real-time subscriptions
    const medicalHistorySubscription = supabase
      .channel("medical_history_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "MedicalHistory",
          filter: `patientId=eq.${patientId}`,
        },
        async () => {
          const { data } = await supabase
            .from("medical_history")
            .select("*")
            .eq("patient_id", patientId)
            .order("date", { ascending: false });
          setMedicalHistory(data || []);
        }
      )
      .subscribe();

    const prescriptionsSubscription = supabase
      .channel("prescriptions_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "prescriptions",
          filter: `patient_id=eq.${patientId}`,
        },
        async () => {
          const { data } = await supabase
            .from("prescriptions")
            .select("*")
            .eq("patient_id", patientId)
            .order("date", { ascending: false });
          setPrescriptions(data || []);
        }
      )
      .subscribe();

    const paymentsSubscription = supabase
      .channel("payments_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payments",
          filter: `patient_id=eq.${patientId}`,
        },
        async () => {
          const { data } = await supabase
            .from("payments")
            .select("*")
            .eq("patient_id", patientId)
            .order("date", { ascending: false });
          setPayments(data || []);
        }
      )
      .subscribe();

    // Initial data fetch
    const fetchInitialData = async () => {
      const [historyRes, prescriptionsRes, paymentsRes] = await Promise.all([
        supabase
          .from("medical_history")
          .select("*")
          .eq("patient_id", patientId)
          .order("date", { ascending: false }),
        supabase
          .from("prescriptions")
          .select("*")
          .eq("patient_id", patientId)
          .order("date", { ascending: false }),
        supabase
          .from("payments")
          .select("*")
          .eq("patient_id", patientId)
          .order("date", { ascending: false }),
      ]);

      setMedicalHistory(historyRes.data || []);
      setPrescriptions(prescriptionsRes.data || []);
      setPayments(paymentsRes.data || []);
    };

    fetchInitialData();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(medicalHistorySubscription);
      supabase.removeChannel(prescriptionsSubscription);
      supabase.removeChannel(paymentsSubscription);
    };
  }, [patientId]);

  const EmptyState = ({ message }: { message: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No Records Found
      </h3>
      <p className="text-gray-500">{message}</p>
    </motion.div>
  );

  if (!patient) return null;

  return (
    <div className="space-y-6">
      <BackButton label="Back to Patients" path="/patients" className="mb-4" />
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
              <p>{patient.insurance || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Emergency Contact</p>
              <p>{patient.emergency_contact || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="capitalize">{patient.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="history" className="w-full">
        <TabsList>
          <TabsTrigger value="history">Medical History</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <AnimatePresence>
            {medicalHistory.length > 0 ? (
              medicalHistory.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="mb-4">
                    <CardHeader>
                      <CardTitle>{record.diagnosis}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{record.notes}</p>
                      <div className="mt-4 text-sm text-gray-500">
                        <p>Treated by: {record.treatedBy}</p>
                        <p>
                          Date: {new Date(record.date).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <EmptyState message="No medical history records available for this patient." />
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="prescriptions">
          <AnimatePresence>
            {prescriptions.length > 0 ? (
              prescriptions.map((prescription, index) => (
                <motion.div
                  key={prescription.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="mb-4">
                    <CardHeader>
                      <CardTitle>{prescription.medication}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Dosage: {prescription.dosage}</p>
                      <p>Instructions: {prescription.instructions}</p>
                      <div className="mt-4 text-sm text-gray-500">
                        <p>Prescribed by: {prescription.prescribedBy}</p>
                        <p>Status: {prescription.status}</p>
                        <p>
                          Date:{" "}
                          {new Date(prescription.date).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <EmptyState message="No prescriptions have been issued for this patient." />
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="payments">
          <AnimatePresence>
            {payments.length > 0 ? (
              payments.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="mb-4">
                    <CardHeader>
                      <CardTitle>Payment - ${payment.amount}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p>{payment.status}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Method</p>
                          <p>{payment.method}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p>{new Date(payment.date).toLocaleDateString()}</p>
                        </div>
                        {payment.notes && (
                          <div className="col-span-2">
                            <p className="text-sm text-gray-500">Notes</p>
                            <p>{payment.notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <EmptyState message="No payment records found for this patient." />
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}
