"use client";

import { Stethoscope } from "lucide-react";
import { redirect } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface TopDoctorsProps {
  topDoctors: {
    id: string;
    name: string;
    avatarImageUrl: string | null;
    speciality: string;
    appointments: number;
  }[];
}

export default function TopDoctors({ topDoctors }: TopDoctorsProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="w-full mx-auto">
      <CardContent>
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Stethoscope className="text-muted-foreground" />
            <CardTitle className="text-base">Médicos</CardTitle>
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

        {/* Doctors List */}
        <div className="space-y-4">
          {topDoctors.map((doctor) => (
            <Card
              key={doctor.id}
              className="p-2 border-0 shadow-none transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-left">
                  <Avatar className="w-13 h-13">
                    <AvatarImage
                      src={doctor.avatarImageUrl || undefined}
                      alt={doctor.name}
                    />
                    <AvatarFallback className="font-medium">
                      {getInitials(doctor.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 text-sm">
                      {doctor.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {doctor.speciality}
                    </span>
                  </div>
                </div>
                <div className="font-medium text-xs text-muted-foreground text-right">
                  {doctor.appointments} agend.
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
