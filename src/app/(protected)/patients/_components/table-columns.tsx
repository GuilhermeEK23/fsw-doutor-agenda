"use client";

import { ColumnDef } from "@tanstack/react-table";

import { patientsTable } from "@/db/schema";

import PatientsTableActions from "./table-actions";

export const patientsTableColumns: ColumnDef<
  typeof patientsTable.$inferSelect
>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Nome",
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "phoneNumber",
    accessorKey: "phoneNumber",
    header: "Telefone",
    cell: ({ row }) => {
      const phone = row.original.phoneNumber;
      return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    },
  },
  {
    id: "gender",
    accessorKey: "gender",
    header: "Sexo",
    cell: ({ row }) => {
      return row.original.gender === "male" ? "Masculino" : "Feminino";
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      return <PatientsTableActions patient={row.original} />;
    },
  },
];
