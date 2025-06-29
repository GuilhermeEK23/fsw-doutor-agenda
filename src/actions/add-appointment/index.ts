"use server";

import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { getAvailableTimes } from "../get-available-times";
import { addAppointmentSchema } from "./schema";

export const addAppointment = actionClient
  .schema(addAppointmentSchema)
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

    const availableTimes = await getAvailableTimes({
      doctorId: parsedInput.doctorId,
      date: dayjs(parsedInput.date).format("YYYY-MM-DD"),
    });

    if (!availableTimes.data) {
      throw new Error("No available times");
    }
    const isTimeAvailable = availableTimes.data.some(
      (time) => time.value === parsedInput.time && time.available
    );

    if (!isTimeAvailable) {
      throw new Error("Time not available");
    }

    await db.insert(appointmentsTable).values({
      patientId: parsedInput.patientId,
      doctorId: parsedInput.doctorId,
      appointmentPriceInCents: parsedInput.appointmentPriceInCents,
      date: new Date(parsedInput.date),
      clinicId: session.user.clinic.id,
    });

    revalidatePath("/appointments");
  });
