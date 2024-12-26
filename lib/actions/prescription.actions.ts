"use server";

import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { getCurrentUser } from "@/lib/auth";

export async function getPrescriptions() {
  const user = await getCurrentUser();

  if (user?.role === "STAFF") {
    return await prisma.prescription.findMany({
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        prescribedBy: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  return await prisma.prescription.findMany({
    where: {
      patientId: user?.id,
    },
    include: {
      prescribedBy: {
        select: {
          fullName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createPrescription(data: {
  patientId: string;
  medication: string;
  dosage: string;
  duration: string;
  notes?: string;
}) {
  const user = await getCurrentUser();

  const prescription = await prisma.prescription.create({
    data: {
      patientId: data.patientId,
      medication: data.medication,
      dosage: data.dosage,
      duration: data.duration,
      notes: data.notes,
      prescribedById: user?.id,
    },
    include: {
      patient: true,
    },
  });

  // Notify patient
  const notification = await prisma.notification.create({
    data: {
      userId: data.patientId,
      title: "New Prescription",
      message: `You have been prescribed ${data.medication}`,
      type: "PRESCRIPTIONS",
    },
  });

  await pusherServer.trigger(
    `user-${data.patientId}`,
    "new-notification",
    notification
  );

  return prescription;
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
