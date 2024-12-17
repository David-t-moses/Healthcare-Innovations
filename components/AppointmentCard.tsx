import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AppointmentCard({ appointment, isPatient }) {
  const supabase = createClientComponentClient();

  const handleResponse = async (status: "ACCEPTED" | "DECLINED") => {
    try {
      // Update appointment status
      await supabase
        .from("Appointment")
        .update({ status })
        .eq("id", appointment.id);

      // Notify staff
      await supabase.from("Notification").insert({
        id: crypto.randomUUID(),
        userId: appointment.userId,
        title: `Appointment ${status.toLowerCase()}`,
        message: `Patient has ${status.toLowerCase()} the appointment scheduled for ${format(
          new Date(appointment.startTime),
          "PPP"
        )}`,
        type: "APPOINTMENT_RESPONSE",
        read: false,
      });

      toast.success(`Appointment ${status.toLowerCase()} successfully`);
    } catch (error) {
      toast.error("Failed to update appointment");
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <h3>{appointment.title}</h3>
      <p>{format(new Date(appointment.startTime), "PPP p")}</p>

      {isPatient && appointment.status === "PENDING" && (
        <div className="flex gap-2 mt-4">
          <Button onClick={() => handleResponse("ACCEPTED")}>Accept</Button>
          <Button onClick={() => handleResponse("DECLINED")}>Decline</Button>
        </div>
      )}
    </div>
  );
}
