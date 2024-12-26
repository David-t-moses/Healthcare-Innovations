"use client";

import { format } from "date-fns";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AppointmentStatus } from "@prisma/client";
import AppointmentResponse from "./AppointmentResponse";
import EditAppointmentModal from "./EditAppointmentModal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { deleteAppointment } from "@/lib/actions/appointment.actions";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface AppointmentsListProps {
  appointments: any[];
  userRole: "PATIENT" | "STAFF";
}

export default function AppointmentsList({
  appointments,
  userRole,
}: AppointmentsListProps) {
  const [editingAppointment, setEditingAppointment] = useState(null);

  // Sort appointments by date, most recent first
  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
  const getStatusColor = (status: AppointmentStatus) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      COMPLETED: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const router = useRouter();

  const handleDelete = async (appointmentId: string) => {
    try {
      const result = await deleteAppointment(appointmentId);
      if (result.success) {
        toast.success("Appointment deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete appointment");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the appointment");
    }
  };

  return (
    <div>
      {userRole === "STAFF" && (
        <div className="mb-6">
          <Button
            onClick={() => router.push("/appointments/schedule")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Schedule New Appointment
          </Button>
        </div>
      )}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Title</TableHead>
              <TableHead className="font-semibold">
                {userRole === "STAFF" ? "Patient" : "Doctor"}
              </TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Time</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              {userRole === "PATIENT" && (
                <TableHead className="font-semibold">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAppointments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-gray-500"
                >
                  No appointments found
                </TableCell>
              </TableRow>
            ) : (
              sortedAppointments.map((apt) => (
                <TableRow
                  key={apt.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="font-medium">{apt.title}</TableCell>
                  <TableCell>
                    {userRole === "STAFF"
                      ? apt.patient.name
                      : apt.user.fullName}
                  </TableCell>
                  <TableCell>
                    {format(new Date(apt.startTime), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(apt.startTime), "h:mm a")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${getStatusColor(
                        apt.status
                      )} px-3 py-1 rounded-full text-xs font-medium`}
                    >
                      {apt.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this appointment?"
                              )
                            ) {
                              handleDelete(apt.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Appointment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  {userRole === "PATIENT" && (
                    <TableCell>
                      <AppointmentResponse
                        appointment={apt}
                        className="w-full"
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <EditAppointmentModal
        appointment={editingAppointment}
        open={!!editingAppointment}
        onClose={() => setEditingAppointment(null)}
        onUpdate={() => router.refresh()}
      />
    </div>
  );
}
