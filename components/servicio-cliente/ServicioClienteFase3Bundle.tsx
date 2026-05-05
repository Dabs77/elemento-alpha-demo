"use client";

import { useState } from "react";
import { AdvisorSkillsVoice } from "@/components/servicio-cliente/AdvisorSkillsVoice";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SkillRoleId } from "@/lib/servicio-cliente/knowledgeBase";

/** Fase 3: solo chat SKILLS (rebalanceo vive en Fase 4). */
export function ServicioClienteFase3Bundle() {
  const [skillRole, setSkillRole] = useState<SkillRoleId>("portfolio_manager_senior");

  return (
    <div className="space-y-6">
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Consultas adhoc con Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 pt-2">
          <AdvisorSkillsVoice selectedRole={skillRole} onRoleChange={setSkillRole} />
        </CardContent>
      </Card>
    </div>
  );
}
