"use server";

import prisma from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";
import { pusherServer } from "../pusher";
import { Resend } from "resend";
import { format } from "date-fns";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ScheduleAppointmentParams {
  title: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
  patientId: string;
  userId: string;
}

export async function scheduleAppointment({
  title,
  startTime,
  endTime,
  notes,
  patientId,
  userId,
}: {
  title: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
  patientId: string;
  userId: string;
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

    // Create notification for patient
    await prisma.notification.create({
      data: {
        userId: patientId,
        title: "New Appointment",
        message: `You have a new appointment scheduled for ${format(
          startTime,
          "PPP at p"
        )}`,
        type: "APPOINTMENT_REQUEST", // Add this line
      },
    });

    // Trigger real-time update
    await pusherServer.trigger(`user-${patientId}`, "new-notification", {
      type: "NEW_APPOINTMENT",
      appointment,
    });

    // console.log("Patient email:", appointment.patient.email);

    // Send email notification
    // const emailResult = await resend.emails.send({
    //   from: `${process.env.SENDER_EMAIL}`,
    //   to: `${appointment.patient.email}`,
    //   subject: "New Appointment Scheduled",
    //   html: `
    //     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
    //       <div style="background-color: white; border-radius: 8px; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    //         <h1 style="color: #1e40af; margin-bottom: 24px; text-align: center;">New Appointment Scheduled</h1>

    //         <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px; margin-bottom: 24px;">
    //           <h2 style="color: #1e3a8a; margin: 0 0 8px 0;">${title}</h2>
    //           <p style="color: #64748b; margin: 0;">Please review and respond to this appointment request.</p>
    //         </div>

    //         <div style="margin-bottom: 24px;">
    //           <h3 style="color: #334155; margin-bottom: 12px;">Appointment Details:</h3>
    //           <p style="margin: 4px 0;"><strong>Date:</strong> ${format(
    //             startTime,
    //             "PPP"
    //           )}</p>
    //           <p style="margin: 4px 0;"><strong>Time:</strong> ${format(
    //             startTime,
    //             "p"
    //           )}</p>
    //           ${
    //             notes
    //               ? `<p style="margin: 4px 0;"><strong>Notes:</strong> ${notes}</p>`
    //               : ""
    //           }
    //         </div>

    //         <div style="text-align: center;">
    //           <a href="${process.env.NEXT_PUBLIC_APP_URL}/appointments"
    //              style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
    //             View Appointment
    //           </a>
    //         </div>
    //       </div>

    //       <div style="text-align: center; margin-top: 24px; color: #64748b; font-size: 14px;">
    //         <p>This is an automated message, please do not reply directly to this email.</p>
    //       </div>
    //     </div>
    //   `,
    // });

    // console.log("Email sending result:", emailResult);

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
      include: { user: true }, // Include staff details
    });

    // Create notification for staff
    await prisma.notification.create({
      data: {
        userId: appointment.userId,
        title: "Appointment Response",
        message: `Patient has ${status.toLowerCase()} the appointment`,
        type: "APPOINTMENT_RESPONSE",
      },
    });

    // Trigger real-time update via Pusher
    await pusherServer.trigger(
      `user-${appointment.userId}`,
      "new-notification",
      {
        type: "APPOINTMENT_RESPONSE",
        appointment,
      }
    );

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
    // For patients: only show their appointments
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

    // For staff: show all appointments they created
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
