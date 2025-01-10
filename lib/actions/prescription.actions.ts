"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { emitNotification } from "@/lib/socket";
import { cache } from "react";

export const getPrescriptions = cache(async () => {
  const user = await getCurrentUser();

  const query =
    user?.role === "STAFF"
      ? {
          include: {
            patient: { select: { id: true, name: true, email: true } },
            prescribedBy: { select: { fullName: true } },
          },
        }
      : {
          where: { patientId: user?.id },
          include: {
            prescribedBy: { select: { fullName: true } },
          },
        };

  return prisma.prescription.findMany({
    ...query,
    orderBy: { createdAt: "desc" },
  });
});

export async function createPrescription(data: PrescriptionData) {
  const user = await getCurrentUser();

  return prisma.$transaction(async (tx) => {
    const [prescription, notification] = await Promise.all([
      tx.prescription.create({
        data: {
          patientId: data.patientId,
          medication: data.medication,
          dosage: data.dosage,
          duration: data.duration,
          notes: data.notes,
          prescribedById: user?.id,
        },
        include: { patient: true },
      }),
      tx.notification.create({
        data: {
          userId: data.patientId,
          title: "New Prescription",
          message: `You have been prescribed ${data.medication}`,
          type: "PRESCRIPTIONS",
        },
      }),
    ]);

    emitNotification(data.patientId, {
      type: "PRESCRIPTIONS",
      prescription,
      notification,
    });

    return prescription;
  });
}

export async function deletePrescription(prescriptionId: string) {
  try {
    await prisma.notification.deleteMany({
      where: {
        AND: [
          { type: "PRESCRIPTIONS" },
          { message: { contains: prescriptionId } },
        ],
      },
    });

    const deletedPrescription = await prisma.prescription.delete({
      where: { id: prescriptionId },
    });

    return { success: true, prescription: deletedPrescription };
  } catch (error) {
    return { success: false, error: "Failed to delete prescription" };
  }
}

export async function updatePrescription(
  prescriptionId: string,
  data: {
    medication: string;
    dosage: string;
    duration: string;
    notes?: string;
  }
) {
  try {
    const updatedPrescription = await prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        medication: data.medication,
        dosage: data.dosage,
        duration: data.duration,
        notes: data.notes,
      },
    });

    return { success: true, prescription: updatedPrescription };
  } catch (error) {
    return { success: false, error: "Failed to update prescription" };
  }
}
