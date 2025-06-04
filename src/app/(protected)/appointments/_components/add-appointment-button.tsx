"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { doctorsTable, patientsTable } from "@/db/schema";

import UpsertAppointmentForm from "./upsert-appointment-form";

interface AddAppointmentButtonProps {
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
}

const AddAppointmentButton = ({
  patients,
  doctors,
}: AddAppointmentButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar consulta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar consulta</DialogTitle>
          <DialogDescription>
            Preencha os dados da consulta abaixo.
          </DialogDescription>
        </DialogHeader>
        <UpsertAppointmentForm
          onSuccess={() => setIsOpen(false)}
          isOpen={isOpen}
          patients={patients}
          doctors={doctors}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddAppointmentButton;
