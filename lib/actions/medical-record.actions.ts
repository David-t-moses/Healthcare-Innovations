"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

export async function getMedicalRecords() {
  const user = await getCurrentUser();

  if (user?.role === "STAFF") {
    return await prisma.medicalRecord.findMany({
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        recordedBy: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        recordDate: "desc",
      },
    });
  }

  return await prisma.medicalRecord.findMany({
    where: {
      patientId: user?.id,
    },
    include: {
      recordedBy: {
        select: {
          fullName: true,
        },
      },
    },
    orderBy: {
      recordDate: "desc",
    },
  });
}

export async function createMedicalRecord(data: {
  patientId: string;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  notes?: string;
  attachments?: string[];
}) {
  const user = await getCurrentUser();

  const record = await prisma.medicalRecord.create({
    data: {
      patientId: data.patientId,
      diagnosis: data.diagnosis,
      symptoms: data.symptoms,
      treatment: data.treatment,
      notes: data.notes,
      attachments: data.attachments,
      recordedById: user?.id,
      recordDate: new Date(),
    },
    include: {
      patient: true,
    },
  });

  // Notify patient
  const notification = await prisma.notification.create({
    data: {
      userId: data.patientId,
      title: "New Medical Record",
      message: `A new medical record has been added to your profile`,
      type: "MEDICAL_RECORDS",
    },
  });

  await pusherServer.trigger(
    `user-${data.patientId}`,
    "new-notification",
    notification
  );

  return record;
}
