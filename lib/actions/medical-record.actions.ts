"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { emitNotification } from "../socket";
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

  const notification = await prisma.notification.create({
    data: {
      userId: data.patientId,
      title: "New Medical Record",
      message: `A new medical record has been added to your profile`,
      type: "MEDICAL_RECORDS",
    },
  });

  emitNotification(data.patientId, notification);

  return record;
}

export async function deleteMedicalRecord(recordId: string) {
  try {
    // Delete related notifications first
    await prisma.notification.deleteMany({
      where: {
        AND: [{ type: "MEDICAL_RECORDS" }, { message: { contains: recordId } }],
      },
    });

    // Delete the medical record
    const deletedRecord = await prisma.medicalRecord.delete({
      where: { id: recordId },
    });

    return { success: true, record: deletedRecord };
  } catch (error) {
    console.error("Error deleting medical record:", error);
    return { success: false, error: "Failed to delete medical record" };
  }
}

export async function updateMedicalRecord(
  recordId: string,
  data: {
    diagnosis: string;
    symptoms: string;
    treatment: string;
    notes?: string;
  }
) {
  try {
    const updatedRecord = await prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        diagnosis: data.diagnosis,
        symptoms: data.symptoms,
        treatment: data.treatment,
        notes: data.notes,
      },
    });

    return { success: true, record: updatedRecord };
  } catch (error) {
    console.error("Error updating medical record:", error);
    return { success: false, error: "Failed to update medical record" };
  }
}
