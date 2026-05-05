"use client";

import { useState } from "react";
import { FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CLIENT_QA_SCRIPT,
  REBALANCE_Q2_2026_ROWS,
} from "@/lib/servicio-cliente/hnwAlejandroReport";
import { SKILL_ROLE_LABELS, type SkillRoleId } from "@/lib/servicio-cliente/knowledgeBase";

type Props = {
  /** Reservado si en el futuro se enlaza transcripción de voz a síntesis. */
  recentSkillReply: string | null;
  /** SKILL elegido en la sesión de voz (para borrador IA). */
  skillRoleForReply: SkillRoleId;
};

export function SimulationOutputs({ recentSkillReply, skillRoleForReply }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateDraft() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/servicio-cliente/synthesis-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: skillRoleForReply ?? "portfolio_manager_senior",
          recentSkillReply: recentSkillReply ?? "",
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Error");
        return;
      }
      setDraft(data.reply ?? "");
    } catch {
      setError("Fallo de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <FileText className="h-4 w-4 text-[#4a7c59]" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-[#4a7c59]">
          Salidas simuladas · reunión de revisión
        </span>
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-[#fafcf8] py-4">
          <CardTitle className="text-base">Respuestas tipo cliente (plantilla demo)</CardTitle>
          <CardDescription className="text-xs">
            Guion coherente con alertas y benchmark del informe · complementar con consultas SKILLS arriba.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          {CLIENT_QA_SCRIPT.map((block, i) => (
            <div key={i} className="rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm ring-1 ring-gray-50">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                Pregunta del cliente
              </p>
              <p className="font-medium text-[#1a1a1a]">{block.preguntaCliente}</p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-[#4a7c59]">
                Línea sugerida · asesor
              </p>
              <p className="mt-1 leading-relaxed text-gray-700">{block.respuestaAsesor}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-[#BBE795]/35 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Propuesta formal de rebalanceo — Q2 2026</CardTitle>
          <CardDescription className="text-xs">
            Borrador operativo post-revisión (demo) · filas alineadas al macro y alertas del informe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Ítem</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Propuesto</TableHead>
                <TableHead className="min-w-[10rem]">Nota estratégica</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {REBALANCE_Q2_2026_ROWS.map((row) => (
                <TableRow key={row.item}>
                  <TableCell className="font-medium">{row.item}</TableCell>
                  <TableCell className="text-right tabular-nums text-gray-600">{row.actual}</TableCell>
                  <TableCell className="text-right tabular-nums font-semibold text-[#4a7c59]">{row.propuesto}</TableCell>
                  <TableCell className="text-sm text-gray-600">{row.notaEstrategica}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-wrap items-start gap-3 rounded-xl border border-dashed border-[#BBE795]/55 bg-[#F0FEE6]/30 p-4">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#6abf1a]" aria-hidden />
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-sm font-semibold text-[#1a1a1a]">Generar borrador integrado (IA)</p>
              <p className="text-xs text-gray-600">
                Consolida el contexto del caso con el SKILL activo en la consulta por voz (
                <strong className="font-medium text-[#1a1a1a]">{SKILL_ROLE_LABELS[skillRoleForReply]}</strong>
                ). Si acabas de conversar, el modelo usa ese matiz; si no, parte solo del briefing demo (markdown).
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-lg border-[#4a7c59]/40 font-semibold text-[#3f6b4c]"
                disabled={loading}
                onClick={() => void generateDraft()}
              >
                {loading ? "Generando…" : "Generar borrador con IA"}
              </Button>
              {error && <p className="text-xs text-red-600">{error}</p>}
              {draft && (
                <div className="max-h-72 overflow-y-auto rounded-lg bg-[#1a231c]/95 p-4 text-xs leading-relaxed text-white/95 whitespace-pre-wrap">
                  {draft}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
