"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import Calendar from "@/components/Calender";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

interface AppointmentSchedulerProps {
  patientId?: string;
  authToken?: string;
}

export default function AppointmentScheduler({
  patientId,
}: AppointmentSchedulerProps) {
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    setIsLoading(true);
    const currentDate = new Date().toISOString();

    const { error } = await supabase.from("appointments").insert([
      {
        patient_id: patientId,
        scheduled_for: currentDate,
        notes,
        status: "scheduled",
      },
    ]);

    setIsLoading(false);

    if (!error) {
      setShowSuccessModal(true);
      setNotes("");
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="flex items-center"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Schedule Appointment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Calendar />
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Textarea
                  placeholder="Add appointment notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-32"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading || !notes.trim()}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    "Schedule Appointment"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Appointment Scheduled!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Your appointment has been successfully scheduled for{" "}
              <span className="font-medium">
                {new Date().toLocaleDateString()} at{" "}
                {new Date().toLocaleTimeString()}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              onClick={handleCloseSuccess}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
            >
              Done
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
