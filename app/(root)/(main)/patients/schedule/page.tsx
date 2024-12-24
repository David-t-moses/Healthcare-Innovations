import AppointmentScheduler from "@/components/AppointmentScheduler";
import { getCurrentUser } from "@/lib/auth";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: { patientId?: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    return <div>Please login to schedule appointments</div>;
  }

  if (!searchParams.patientId) {
    return <div>Missing patient ID - Please select a patient first</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Schedule Appointment</h1>
      <AppointmentScheduler
        patientId={searchParams.patientId}
        staffId={user.id}
      />
    </div>
  );
}
