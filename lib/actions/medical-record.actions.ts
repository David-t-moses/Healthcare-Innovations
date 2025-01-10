"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { emitNotification } from "../socket";
import { cache } from "react";

export const getMedicalRecords = cache(async () => {
  const user = await getCurrentUser();

  const baseSelect = {
    id: true,
    diagnosis: true,
    symptoms: true,
    treatment: true,
    notes: true,
    recordDate: true,
  };

  if (user?.role === "STAFF") {
    return prisma.medicalRecord.findMany({
      select: {
        ...baseSelect,
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
      orderBy: { recordDate: "desc" },
    });
  }

  return prisma.medicalRecord.findMany({
    where: { patientId: user?.id },
    select: {
      ...baseSelect,
      recordedBy: {
        select: {
          fullName: true,
        },
      },
    },
    orderBy: { recordDate: "desc" },
  });
});

export async function createMedicalRecord(data: MedicalRecordData) {
  const user = await getCurrentUser();

  return prisma.$transaction(async (tx) => {
    const [record, notification] = await Promise.all([
      tx.medicalRecord.create({
        data: {
          ...data,
          recordedById: user?.id,
          recordDate: new Date(),
        },
        include: { patient: true },
      }),
      tx.notification.create({
        data: {
          userId: data.patientId,
          title: "New Medical Record",
          message: "A new medical record has been added to your profile",
          type: "MEDICAL_RECORDS",
        },
      }),
    ]);

    emitNotification(data.patientId, notification);
    return record;
  });
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
