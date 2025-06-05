"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { upsertAppointment } from "@/actions/upsert-appointment";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  patientId: z.string().min(1, { message: "Paciente é obrigatório" }),
  doctorId: z.string().min(1, { message: "Médico é obrigatório" }),
  appointmentPrice: z
    .number()
    .min(1, { message: "Valor da consulta é obrigatório" }),
  date: z.date({
    message: "Data é obrigatória",
  }),
  time: z.string().min(1, { message: "Hora é obrigatória" }),
});

interface UpsertAppointmentFormProps {
  isOpen: boolean;
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  onSuccess: () => void;
  appointment?: typeof appointmentsTable.$inferSelect & {
    patient: { name: string };
    doctor: { name: string; speciality: string };
  };
}

const timeSlots = [
  "05:00:00",
  "05:30:00",
  "06:00:00",
  "06:30:00",
  "07:00:00",
  "07:30:00",
  "08:00:00",
  "08:30:00",
  "09:00:00",
  "09:30:00",
  "10:00:00",
  "10:30:00",
  "11:00:00",
  "11:30:00",
  "12:00:00",
  "12:30:00",
  "13:00:00",
  "13:30:00",
  "14:00:00",
  "14:30:00",
  "15:00:00",
  "15:30:00",
  "16:00:00",
  "16:30:00",
  "17:00:00",
  "17:30:00",
  "18:00:00",
  "18:30:00",
  "19:00:00",
  "19:30:00",
  "20:00:00",
  "20:30:00",
  "21:00:00",
];

const UpsertAppointmentForm = ({
  onSuccess,
  isOpen,
  patients,
  doctors,
  appointment,
}: UpsertAppointmentFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: appointment?.patientId ?? "",
      doctorId: appointment?.doctorId ?? "",
      appointmentPrice: appointment?.AppointmentPriceInCents
        ? appointment.AppointmentPriceInCents / 100
        : 0,
      date: appointment?.date ? new Date(appointment.date) : undefined,
      time: appointment?.date
        ? format(new Date(appointment.date), "HH:mm:ss")
        : "",
    },
  });

  const selectedDoctorId = form.watch("doctorId");
  const selectedPatientId = form.watch("patientId");

  const upsertAppointmentAction = useAction(upsertAppointment, {
    onSuccess: () => {
      toast.success("Consulta agendada com sucesso");
      onSuccess();
    },
    onError: () => {
      toast.error("Erro ao agendar consulta");
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        patientId: "",
        doctorId: "",
        appointmentPrice: 0,
        date: undefined,
        time: "",
      });
    }
  }, [isOpen, form]);

  useEffect(() => {
    if (selectedDoctorId) {
      const selectedDoctor = doctors.find(
        (doctor) => doctor.id === selectedDoctorId
      );
      if (selectedDoctor) {
        form.setValue(
          "appointmentPrice",
          selectedDoctor.appointmentPriceInCents / 100
        );
      }
    }
  }, [selectedDoctorId, form, doctors]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const dateTime = new Date(values.date);
    const [hours, minutes] = values.time.split(":");
    dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    upsertAppointmentAction.execute({
      ...values,
      id: appointment?.id,
      date: dateTime.toISOString(),
      appointmentPriceInCents: values.appointmentPrice * 100,
    });
  };

  const isDateAvailable = (date: Date) => {
    if (!selectedDoctorId) return false;
    const selectedDoctor = doctors.find(
      (doctor) => doctor.id === selectedDoctorId
    );
    if (!selectedDoctor) return false;
    const dayOfWeek = date.getDay();
    return (
      dayOfWeek >= parseInt(selectedDoctor?.availableFromTime) &&
      dayOfWeek <= parseInt(selectedDoctor?.availableToTime)
    );
  };

  const isDateTimeEnabled = selectedPatientId && selectedDoctorId;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Novo agendamento</DialogTitle>
        <DialogDescription>
          Preencha os dados do agendamento abaixo.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paciente</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {patients?.map(
                      (patient: typeof patientsTable.$inferSelect) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Médico</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    const doctor = doctors?.find(
                      (d: typeof doctorsTable.$inferSelect) => d.id === value
                    );
                    if (doctor) {
                      form.setValue(
                        "appointmentPrice",
                        doctor.appointmentPriceInCents / 100
                      );
                    }
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um médico" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctors?.map(
                      (doctor: typeof doctorsTable.$inferSelect) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.speciality}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="appointmentPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço da consulta</FormLabel>
                <FormControl>
                  <NumericFormat
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value.floatValue ?? 0);
                    }}
                    decimalScale={2}
                    fixedDecimalScale
                    decimalSeparator=","
                    allowNegative={false}
                    disabled={!selectedDoctorId}
                    allowLeadingZeros={false}
                    thousandSeparator="."
                    customInput={Input}
                    prefix="R$ "
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data da consulta</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={!isDateTimeEnabled}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      locale={ptBR}
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || isDateAvailable(date)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora da consulta</FormLabel>
                <Select
                  disabled={!isDateTimeEnabled}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time.slice(0, 5)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={upsertAppointmentAction.isPending}
          >
            {upsertAppointmentAction.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Agendar consulta
          </Button>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertAppointmentForm;
