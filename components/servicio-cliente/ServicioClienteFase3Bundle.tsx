"use client";

import { useState } from "react";
import { AdvisorSkillsVoice } from "@/components/servicio-cliente/AdvisorSkillsVoice";
import { SimulationOutputs } from "@/components/servicio-cliente/SimulationOutputs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SkillRoleId } from "@/lib/servicio-cliente/knowledgeBase";

export function ServicioClienteFase3Bundle() {
  const [skillRole, setSkillRole] = useState<SkillRoleId>("portfolio_manager_senior");

  return (
    <div className="space-y-6">
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Simulación · revisión + consultas SKILLS</CardTitle>
          <CardDescription>
            Consulta por voz a cada perfil clave (PM, estratega, economista, banker senior), con ideas de preguntas en pantalla.
            Luego revisa salidas tipo cliente y propuesta Q2.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-2">
          <AdvisorSkillsVoice selectedRole={skillRole} onRoleChange={setSkillRole} />
          <SimulationOutputs recentSkillReply={null} skillRoleForReply={skillRole} />
        </CardContent>
      </Card>
    </div>
  );
}
