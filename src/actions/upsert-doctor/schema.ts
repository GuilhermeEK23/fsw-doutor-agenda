import { z } from "zod";

export const upsertDoctorSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, { message: "Nome é obrigatório" }),
    availableFromWeekDay: z.number().min(0).max(6),
    availableToWeekDay: z.number().min(0).max(6),
    availableFromTime: z
      .string()
      .min(1, { message: "Hora de início é obrigatório" }),
    availableToTime: z
      .string()
      .min(1, { message: "Hora de término é obrigatório" }),
    speciality: z.string().min(1, { message: "Especialidade é obrigatório" }),
    appointmentPriceInCents: z
      .number()
      .min(0.01, { message: "Preço é obrigatório" }),
  })
  .refine(
    (data) => {
      return data.availableFromTime < data.availableToTime;
    },
    {
      message: "O horário final não pode ser anterior ao horário inicial",
      path: ["availableToTime"],
    }
  );

export type UpsertDoctorSchema = z.infer<typeof upsertDoctorSchema>;
