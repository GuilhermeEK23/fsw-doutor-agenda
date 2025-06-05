"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

const schema = z.object({
  id: z.string().optional(),
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  appointmentPriceInCents: z.number().min(1),
  date: z.string(),
});

export const upsertAppointment = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.clinic) {
      throw new Error("Unauthorized");
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
