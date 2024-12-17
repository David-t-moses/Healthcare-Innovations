import { getCurrentUser } from "@/lib/auth";
import { getAppointments } from "@/lib/actions/appointment.actions";
import AppointmentsList from "@/components/AppointmentLists";

export default async function AppointmentsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return <div>Please login to view appointments</div>;
  }

  const { appointments } = await getAppointments(user.id, user.role);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">My Appointments</h1>
      <AppointmentsList appointments={appointments} userRole={user.role} />
    </div>
  );
}
