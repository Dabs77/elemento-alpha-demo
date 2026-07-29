"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { EntrevistaSetup as Setup } from "@/lib/entrevista/harness";

const AREAS = [
  "Operaciones",
  "Comercial",
  "Finanzas",
  "Recursos Humanos",
  "Tecnología",
  "Servicio al Cliente",
  "Otra",
];

export function EntrevistaSetup({ onStart }: { onStart: (setup: Setup) => void }) {
  const [empresa, setEmpresa] = useState("");
  const [area, setArea] = useState(AREAS[0]);
  const [rol, setRol] = useState("");

  const canStart = empresa.trim().length > 0 && rol.trim().length > 0;

  return (
    <form
      className="px-6 py-6 space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canStart) return;
        onStart({ empresa: empresa.trim(), area, rol: rol.trim() });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="entrevista-empresa">Empresa</Label>
        <Input
          id="entrevista-empresa"
          value={empresa}
          onChange={(e) => setEmpresa(e.target.value)}
          placeholder="Nombre de la empresa"
          autoComplete="off"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="entrevista-area">Área</Label>
        <NativeSelect
          className="w-full"
          id="entrevista-area"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        >
          {AREAS.map((a) => (
            <NativeSelectOption key={a} value={a}>
              {a}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <div className="space-y-2">
        <Label htmlFor="entrevista-rol">Rol de la persona entrevistada</Label>
        <Input
          id="entrevista-rol"
          value={rol}
          onChange={(e) => setRol(e.target.value)}
          placeholder="Ej. Jefe de logística"
          autoComplete="off"
        />
      </div>

      <div className="pt-1">
        <Button type="submit" disabled={!canStart} className="w-full">
          Continuar
          <ArrowRight className="w-4 h-4" />
        </Button>
        <p className="text-xs text-gray-500 mt-3 text-center">
          La entrevista se hace por voz. Se te pedirá permiso del micrófono.
        </p>
      </div>
    </form>
  );
}
