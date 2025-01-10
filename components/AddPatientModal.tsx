"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import Button from "./Button";

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (patient: PatientFormData) => void;
}

interface PatientFormData {
  id?: string;
  name: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  insurance: string | null;
  emergencyContact: string | null;
  status: string;
}

export default function AddPatientModal({
  isOpen,
  onClose,
  onSuccess,
}: AddPatientModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PatientFormData>({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    insurance: "",
    emergencyContact: "",
    status: "active",
  });

  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const patientData = {
        id: crypto.randomUUID(),
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        dateOfBirth: formData.dateOfBirth
          ? new Date(formData.dateOfBirth).toISOString()
          : null,
        insurance: formData.insurance || null,
        emergencyContact: formData.emergencyContact || null,
        status: formData.status,
      };

      const { data, error } = await supabase
        .from("Patient")
        .insert([patientData])
        .select();

      if (error) throw new Error(error.message);

      toast.success("Patient added successfully!");
      onSuccess(data[0]);

      setFormData({
        name: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        insurance: "",
        emergencyContact: "",
        status: "active",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to add patient, Please try again.";
      console.error("Error adding patient:", errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-2xl font-bold mb-6">Add New Patient</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label className="block text-sm font-medium">Full Name</label>
                  <input
                    className="w-full p-2 border rounded-lg"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    className="w-full p-2 border rounded-lg"
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="insurance">Insurance Details</Label>
                  <Input
                    id="insurance"
                    value={formData.insurance || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, insurance: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyContact: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                >
                  {isLoading ? <>Adding...</> : "Add Patient"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
