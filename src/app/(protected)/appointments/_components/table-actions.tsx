"use client";

import { EditIcon, MoreVerticalIcon, TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteAppointment } from "@/actions/delete-appointment";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { appointmentsTable } from "@/db/schema";

import UpsertAppointmentForm from "./upsert-appointment-form";

const AppointmentsTableActions = ({
  appointment,
}: {
  appointment: typeof appointmentsTable.$inferSelect & {
    patient: { name: string };
    doctor: { name: string; speciality: string };
  };
}) => {
  const [isUpsertAppointmentDialogOpen, setIsUpsertAppointmentDialogOpen] =
    useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { execute: executeDelete } = useAction(deleteAppointment, {
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      toast.success("Agendamento excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir agendamento");
    },
  });

  return (
    <>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <Dialog
          open={isUpsertAppointmentDialogOpen}
          onOpenChange={setIsUpsertAppointmentDialogOpen}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>
                {appointment.patient.name} - {appointment.doctor.name}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsUpsertAppointmentDialogOpen(true)}
              >
                <EditIcon className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                <TrashIcon className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <UpsertAppointmentForm
            patients={[
              {
                id: appointment.id,
                name: appointment.patient.name,
                createdAt: new Date(),
                updatedAt: null,
                clinicId: "",
                email: "",
                phoneNumber: "",
                gender: "male",
              },
            ]}
            doctors={[
              {
                id: appointment.id,
                name: appointment.doctor.name,
                speciality: appointment.doctor.speciality,
                createdAt: new Date(),
                updatedAt: null,
                clinicId: "",
                avatarImageUrl: null,
                availableFromWeekDay: 1,
                availableToWeekDay: 5,
                availableFromTime: "09:00",
                availableToTime: "18:00",
                appointmentPriceInCents: 0,
              },
            ]}
            appointment={appointment}
            onSuccess={() => setIsUpsertAppointmentDialogOpen(false)}
            isOpen={isUpsertAppointmentDialogOpen}
          />
        </Dialog>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o agendamento de{" "}
              {appointment.patient.name} com o(a) Dr(a).{" "}
              {appointment.doctor.name}? Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => executeDelete({ id: appointment.id })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AppointmentsTableActions;
