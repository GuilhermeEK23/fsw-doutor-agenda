"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { appointmentsTable } from "@/db/schema";

import AppointmentsTableActions from "./table-actions";

export const appointmentsTableColumns: ColumnDef<
  typeof appointmentsTable.$inferSelect & {
    patient: { name: string };
    doctor: { name: string; speciality: string };
  }
>[] = [
  {
    id: "patient",
    accessorKey: "patient.name",
    header: "Paciente",
  },
  {
    id: "doctor",
    accessorKey: "doctor.name",
    header: "Médico",
  },
  {
    id: "speciality",
    accessorKey: "doctor.speciality",
    header: "Especialidade",
  },
  {
    id: "date",
    accessorKey: "date",
    header: "Data e Hora",
    cell: ({ row }) => {
      const date = row.original.date;
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    },
  },
  {
    id: "price",
    accessorKey: "AppointmentPriceInCents",
    header: "Valor",
    cell: ({ row }) => {
      const priceInCents = row.original.AppointmentPriceInCents;
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(priceInCents / 100);
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      return <AppointmentsTableActions appointment={row.original} />;
    },
  },
];
