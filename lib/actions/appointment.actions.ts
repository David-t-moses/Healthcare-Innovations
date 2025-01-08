"use server";

import prisma from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";
import { format } from "date-fns";
import { emitNotification } from "../socket";

export async function scheduleAppointment({
  title,
  startTime,
  endTime,
  notes,
  patientId,
  userId,
}) {
  try {
    const appointment = await prisma.appointment.create({
      data: {
        title,
        startTime,
        endTime,
        notes,
        patientId,
        userId,
        status: AppointmentStatus.PENDING,
      },
      include: {
        patient: true,
      },
    });

    const notification = await prisma.notification.create({
      data: {
        userId: patientId,
        title: "New Appointment",
        message: `You have a new appointment scheduled for ${format(
          startTime,
          "PPP at p"
        )}`,
        type: "APPOINTMENT_REQUEST",
      },
    });

    emitNotification(patientId, {
      type: "NEW_APPOINTMENT",
      appointment,
      notification,
    });

    return { success: true, appointment };
  } catch (error) {
    console.error("Error scheduling appointment:", error);
    return { success: false, error: "Failed to schedule appointment" };
  }
}

export async function respondToAppointment({ appointmentId, status }) {
  try {
    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
      include: { user: true },
    });

    const notification = await prisma.notification.create({
      data: {
        userId: appointment.userId,
        title: "Appointment Response",
        message: `Patient has ${status.toLowerCase()} the appointment`,
        type: "APPOINTMENT_RESPONSE",
      },
    });

    emitNotification(appointment.userId, {
      type: "APPOINTMENT_RESPONSE",
      appointment,
      notification,
    });

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function getAppointments(
  userId: string,
  role: "PATIENT" | "STAFF"
) {
  try {
    if (role === "PATIENT") {
      const appointments = await prisma.appointment.findMany({
        where: {
          patientId: userId,
        },
        include: {
          user: {
            select: {
              fullName: true,
            },
          },
        },
        orderBy: {
          startTime: "desc",
        },
      });
      return { success: true, appointments };
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        userId: userId,
      },
      include: {
        patient: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });
    return { success: true, appointments };
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return { success: false, error: "Failed to fetch appointments" };
  }
}

export async function deleteAppointment(appointmentId: string) {
  try {
    await prisma.notification.deleteMany({
      where: {
        AND: [
          { type: "APPOINTMENT_REQUEST" },
          { message: { contains: appointmentId } },
        ],
      },
    });

    const appointment = await prisma.appointment.delete({
      where: { id: appointmentId },
    });
    return { success: true, appointment };
  } catch (error) {
    return { success: false, error: "Failed to delete appointment" };
  }
}

export async function updateAppointment(
  appointmentId: string,
  data: {
    title: string;
    startTime: Date;
    endTime: Date;
    notes?: string;
  }
) {
  try {
    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data,
    });
    return { success: true, appointment };
  } catch (error) {
    return { success: false, error: "Failed to update appointment" };
  }
}
