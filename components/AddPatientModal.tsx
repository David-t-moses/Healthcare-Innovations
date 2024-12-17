"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
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
      // Create patient data with UUID
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

      const { error } = await supabase
        .from("Patient")
        .insert([patientData])
        .select();

      if (error) {
        throw new Error(error.message);
      }

      // Success handling
      toast.success("Patient added successfully!");

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        insurance: "",
        emergencyContact: "",
        status: "active",
      });

      // Close modal
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add patient";
      console.error("Error adding patient:", errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
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
                  setFormData({ ...formData, emergencyContact: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Patient"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
