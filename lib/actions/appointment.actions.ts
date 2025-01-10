"use server";

import prisma from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";
import { format } from "date-fns";
import { emitNotification } from "../socket";
import { cache } from "react";

export async function scheduleAppointment(data) {
  // Check if the patient exists as a user
  const patientUser = await prisma.user.findFirst({
    where: {
      id: data.patientId,
      role: "PATIENT",
    },
  });

  if (!patientUser) {
    return {
      success: false,
      error:
        "This patient does not have an account. They need to register first before appointments can be scheduled.",
    };
  }

  return prisma.$transaction(async (tx) => {
    const [appointment, notification] = await Promise.all([
      tx.appointment.create({
        data: {
          title: data.title,
          startTime: data.startTime,
          endTime: data.endTime,
          notes: data.notes,
          patientId: data.patientId,
          userId: data.userId,
          status: AppointmentStatus.PENDING,
        },
        include: { patient: true },
      }),
      tx.notification.create({
        data: {
          userId: data.patientId,
          title: "New Appointment",
          message: `You have a new appointment scheduled for ${format(
            data.startTime,
            "PPP at p"
          )}`,
          type: "APPOINTMENT_REQUEST",
        },
      }),
    ]);

    emitNotification(data.patientId, {
      type: "NEW_APPOINTMENT",
      appointment,
      notification,
    });

    return { success: true, appointment };
  });
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

export const getAppointments = cache(
  async (userId: string, role: "PATIENT" | "STAFF") => {
    const baseQuery = {
      orderBy: { startTime: "desc" },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        status: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    };

    if (role === "PATIENT") {
      return prisma.appointment.findMany({
        ...baseQuery,
        where: { patientId: userId },
        select: {
          ...baseQuery.select,
          user: {
            select: { fullName: true },
          },
        },
      });
    }

    return prisma.appointment.findMany({
      ...baseQuery,
      where: { userId },
      select: {
        ...baseQuery.select,
        patient: {
          select: { name: true },
        },
      },
    });
  }
);

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
    return {
      success: false,
      error: "Failed to delete appointment, Please try again.",
    };
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
    return {
      success: false,
      error: "Failed to update appointment, Please try again",
    };
  }
}
