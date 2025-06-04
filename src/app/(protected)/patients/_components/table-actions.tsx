import { EditIcon, MoreVerticalIcon, TrashIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { patientsTable } from "@/db/schema";

import UpsertPatientForm from "./upsert-patient-form";

const PatientsTableActions = ({
  patient,
}: {
  patient: typeof patientsTable.$inferSelect;
}) => {
  const [isUpsertPatientDialogOpen, setIsUpsertPatientDialogOpen] =
    useState(false);

  return (
    <Dialog
      open={isUpsertPatientDialogOpen}
      onOpenChange={setIsUpsertPatientDialogOpen}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVerticalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{patient.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsUpsertPatientDialogOpen(true)}>
            <EditIcon className="h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem>
            <TrashIcon className="h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <UpsertPatientForm
        patient={patient}
        onSuccess={() => setIsUpsertPatientDialogOpen(false)}
        isOpen={isUpsertPatientDialogOpen}
      />
    </Dialog>
  );
};

export default PatientsTableActions;
