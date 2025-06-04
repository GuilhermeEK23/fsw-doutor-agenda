"use client";

import { type InferSelectModel } from "drizzle-orm";
import { Mail, Pencil, Phone } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { patientsTable } from "@/db/schema";

import UpsertPatientForm from "./upsert-patient-form";

interface PatientCardProps {
  patient: InferSelectModel<typeof patientsTable>;
}

const PatientCard = ({ patient }: PatientCardProps) => {
  const [isUpsertPatientDialogOpen, setIsUpsertPatientDialogOpen] =
    useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{patient.name}</CardTitle>
        <CardDescription>
          {patient.gender === "male" ? "Masculino" : "Feminino"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span className="text-sm">{patient.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <span className="text-sm">{patient.phoneNumber}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Dialog
          open={isUpsertPatientDialogOpen}
          onOpenChange={setIsUpsertPatientDialogOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <Pencil />
              Editar
            </Button>
          </DialogTrigger>
          <UpsertPatientForm
            patient={patient}
            onSuccess={() => setIsUpsertPatientDialogOpen(false)}
            isOpen={isUpsertPatientDialogOpen}
          />
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default PatientCard;
