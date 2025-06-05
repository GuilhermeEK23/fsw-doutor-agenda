"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertAppointmentSchema } from "./schema";

export const upsertAppointment = actionClient
  .schema(upsertAppointmentSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (!session.user.clinic) {
      throw new Error("Clinic not found");
    }

    if (parsedInput.id) {
      const appointment = await db.query.appointmentsTable.findFirst({
        where: eq(appointmentsTable.id, parsedInput.id),
      });

      if (!appointment) {
        throw new Error("Appointment not found");
      }

      if (appointment.clinicId !== session.user.clinic.id) {
        throw new Error("Appointment not found");
      }
    }
    await db
      .insert(appointmentsTable)
      .values({
        id: parsedInput.id,
        patientId: parsedInput.patientId,
        doctorId: parsedInput.doctorId,
        AppointmentPriceInCents: parsedInput.appointmentPriceInCents,
        date: new Date(parsedInput.date),
        clinicId: session.user.clinic.id,
      })
      .onConflictDoUpdate({
        target: [appointmentsTable.id],
        set: {
          id: parsedInput.id,
          patientId: parsedInput.patientId,
          doctorId: parsedInput.doctorId,
          AppointmentPriceInCents: parsedInput.appointmentPriceInCents,
          date: new Date(parsedInput.date),
          clinicId: session.user.clinic.id,
        },
      });

    revalidatePath("/appointments");
  });
