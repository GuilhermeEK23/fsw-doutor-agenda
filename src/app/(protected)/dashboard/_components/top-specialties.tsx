"use client";

import {
  Activity,
  Baby,
  Bone,
  Brain,
  Eye,
  Hand,
  Heart,
  HospitalIcon,
  Stethoscope,
} from "lucide-react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import * as card from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface TopSpecialtiesProps {
  topSpecialties: {
    speciality: string;
    appointments: number;
  }[];
}

const getSpecialtyIcon = (specialty: string) => {
  const specialtyLower = specialty.toLowerCase();

  if (specialtyLower.includes("cardiolog")) return Heart;
  if (
    specialtyLower.includes("ginecolog") ||
    specialtyLower.includes("obstetri")
  )
    return Baby;
  if (specialtyLower.includes("pediatri")) return Activity;
  if (specialtyLower.includes("dermatolog")) return Hand;
  if (specialtyLower.includes("ortoped") || specialtyLower.includes("traumat"))
    return Bone;
  if (specialtyLower.includes("neurolog")) return Brain;
  if (specialtyLower.includes("oftalmolog")) return Eye;

  return Stethoscope;
};

const TopSpecialties = ({ topSpecialties }: TopSpecialtiesProps) => {
  const maxAppointments = Math.max(
    ...topSpecialties.map((specialty) => specialty.appointments)
  );

  return (
    <card.Card className="w-full mx-auto">
      <card.CardContent>
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <HospitalIcon className="text-muted-foreground" />
            <card.CardTitle className="text-base">
              Especialidades
            </card.CardTitle>
          </div>
          <Button
            variant="ghost"
            className="text-gray-500 hover:text-gray-700 p-0 h-auto font-normal"
            onClick={() => redirect("/doctors")}
          >
            Ver todos
          </Button>
        </div>

        <Separator className="my-4" />

        {/* Specialties List */}
        <div className="space-y-4">
          {topSpecialties.map((specialty) => {
            const Icon = getSpecialtyIcon(specialty.speciality);
            const progressValue =
              (specialty.appointments / maxAppointments) * 100;
            return (
              <div
                key={specialty.speciality}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="flex flex-col w-full">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span>{specialty.speciality}</span>
                    <span className="text-sm text-muted-foreground">
                      {specialty.appointments} agend.
                    </span>
                  </div>
                  <Progress value={progressValue} />
                </div>
              </div>
            );
          })}
        </div>
      </card.CardContent>
    </card.Card>
  );
};

export default TopSpecialties;
