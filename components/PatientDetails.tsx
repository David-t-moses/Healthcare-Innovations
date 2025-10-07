"use client";

import { useEffect, useState } from "react";
// Removed // Removed Supabase usage
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { BackButton } from "./BackButton";

interface PatientDetailsProps {
  patientId: string;
}

export default function PatientDetails({ patientId }: PatientDetailsProps) {
  const [patient, setPatient] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  // Removed // Removed Supabase usage

  useEffect(() => {
    const fetchPatientData = async () => {
      // Mock patient data
      const mockPatient = {
        id: patientId,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        dateOfBirth: '1990-01-01',
        insurance: 'Health Insurance Co.',
        emergencyContact: 'Jane Doe - +1234567891',
        status: 'active'
      };
      setPatient(mockPatient);
      setMedicalHistory([]);
      setPrescriptions([]);
      setPayments([]);
    };

    fetchPatientData();
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
