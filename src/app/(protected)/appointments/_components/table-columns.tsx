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
    accessorKey: "patient.name",
    header: "Paciente",
  },
  {
    accessorKey: "doctor.name",
    header: "Médico",
  },
  {
    accessorKey: "doctor.speciality",
    header: "Especialidade",
  },
  {
    accessorKey: "date",
    header: "Data",
    cell: ({ row }) => {
      const date = row.getValue("date") as Date;
      return format(date, "PPP 'às' HH:mm", { locale: ptBR });
    },
  },
  {
    accessorKey: "AppointmentPriceInCents",
    header: "Valor",
    cell: ({ row }) => {
      const priceInCents = row.getValue("AppointmentPriceInCents") as number;
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(priceInCents / 100);
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <AppointmentsTableActions appointment={row.original} />;
    },
  },
];
