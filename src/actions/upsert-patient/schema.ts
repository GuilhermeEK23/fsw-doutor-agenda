import { z } from "zod";

export const upsertPatientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phoneNumber: z.string().min(10, "Telefone é obrigatório"),
  gender: z.enum(["male", "female"], {
    required_error: "Sexo é obrigatório",
  }),
});

export type UpsertPatientSchema = z.infer<typeof upsertPatientSchema>;
