import {
  CalendarIcon,
  DollarSignIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyInCents } from "@/helpers/currency";

interface StatsCardsProps {
  totalRevenue: number | null;
  totalAppointments: number;
  totalPatients: number;
  totalDoctors: number;
}

const StatsCards = ({
  totalRevenue,
  totalAppointments,
  totalPatients,
  totalDoctors,
}: StatsCardsProps) => {
  const stats = [
    {
      title: "Faturamento",
      value: formatCurrencyInCents(totalRevenue ?? 0),
      icon: DollarSignIcon,
    },
    {
      title: "Agendamentos",
      value: totalAppointments.toString(),
      icon: CalendarIcon,
    },
    {
      title: "Pacientes",
      value: totalPatients.toString(),
      icon: UserIcon,
    },
    {
      title: "Médicos",
      value: totalDoctors.toString(),
      icon: UsersIcon,
    },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="gap-2">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                <Icon className="size-4 text-primary" />
              </div>
              <CardTitle className="text-sm text-muted-foreground font-medium">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;
