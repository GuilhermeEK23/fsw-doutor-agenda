"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo, useState } from "react";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { doctorsTable, patientsTable } from "@/db/schema";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  patientId: z.string().min(1, { message: "Paciente é obrigatório" }),
  doctorId: z.string().min(1, { message: "Médico é obrigatório" }),
  appointmentPriceInCents: z
    .number()
    .min(1, { message: "Preço é obrigatório" }),
  date: z.date({
    required_error: "Data é obrigatória",
  }),
  time: z.string().min(1, { message: "Hora é obrigatória" }),
});

interface UpsertAppointmentFormProps {
  onSuccess: () => void;
  isOpen: boolean;
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
}

const UpsertAppointmentForm = ({
  onSuccess,
  isOpen,
  patients,
  doctors,
}: UpsertAppointmentFormProps) => {
  const [selectedDoctor, setSelectedDoctor] = useState<{
    id: string;
    appointmentPriceInCents: number;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      appointmentPriceInCents: 0,
      time: "",
    },
  });

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
      form.reset();
      setSelectedDoctor(null);
    }
  }, [isOpen, form]);

  useEffect(() => {
    if (selectedDoctor) {
      form.setValue(
        "appointmentPriceInCents",
        selectedDoctor.appointmentPriceInCents / 100
      );
    }
  }, [selectedDoctor, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const dateTime = new Date(values.date);
    const [hours, minutes] = values.time.split(":");
    dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    upsertAppointmentAction.execute({
      ...values,
      appointmentPriceInCents: values.appointmentPriceInCents * 100,
      date: dateTime.toISOString(),
    });
  };

  const disabledDates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      before: today,
    };
  }, []);

  const canSelectDateTime = form.watch("patientId") && form.watch("doctorId");

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
                      setSelectedDoctor({
                        id: doctor.id,
                        appointmentPriceInCents: doctor.appointmentPriceInCents,
                      });
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
            name="appointmentPriceInCents"
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
                        disabled={!canSelectDateTime}
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
                      disabled={disabledDates}
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
                  disabled={!canSelectDateTime}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Manhã</SelectLabel>
                      <SelectItem value="05:00:00">05:00</SelectItem>
                      <SelectItem value="05:30:00">05:30</SelectItem>
                      <SelectItem value="06:00:00">06:00</SelectItem>
                      <SelectItem value="06:30:00">06:30</SelectItem>
                      <SelectItem value="07:00:00">07:00</SelectItem>
                      <SelectItem value="07:30:00">07:30</SelectItem>
                      <SelectItem value="08:00:00">08:00</SelectItem>
                      <SelectItem value="08:30:00">08:30</SelectItem>
                      <SelectItem value="09:00:00">09:00</SelectItem>
                      <SelectItem value="09:30:00">09:30</SelectItem>
                      <SelectItem value="10:00:00">10:00</SelectItem>
                      <SelectItem value="10:30:00">10:30</SelectItem>
                      <SelectItem value="11:00:00">11:00</SelectItem>
                      <SelectItem value="11:30:00">11:30</SelectItem>
                      <SelectItem value="12:00:00">12:00</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Tarde</SelectLabel>
                      <SelectItem value="12:30:00">12:30</SelectItem>
                      <SelectItem value="13:00:00">13:00</SelectItem>
                      <SelectItem value="13:30:00">13:30</SelectItem>
                      <SelectItem value="14:00:00">14:00</SelectItem>
                      <SelectItem value="14:30:00">14:30</SelectItem>
                      <SelectItem value="15:00:00">15:00</SelectItem>
                      <SelectItem value="15:30:00">15:30</SelectItem>
                      <SelectItem value="16:00:00">16:00</SelectItem>
                      <SelectItem value="16:30:00">16:30</SelectItem>
                      <SelectItem value="17:00:00">17:00</SelectItem>
                      <SelectItem value="17:30:00">17:30</SelectItem>
                      <SelectItem value="18:00:00">18:00</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Noite</SelectLabel>
                      <SelectItem value="18:30:00">18:30</SelectItem>
                      <SelectItem value="19:00:00">19:00</SelectItem>
                      <SelectItem value="19:30:00">19:30</SelectItem>
                      <SelectItem value="20:00:00">20:00</SelectItem>
                      <SelectItem value="20:30:00">20:30</SelectItem>
                      <SelectItem value="21:00:00">21:00</SelectItem>
                    </SelectGroup>
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
