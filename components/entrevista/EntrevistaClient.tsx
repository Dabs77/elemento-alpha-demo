"use client";

import { useState } from "react";
import { EntrevistaSetup } from "@/components/entrevista/EntrevistaSetup";
import { EntrevistaSession } from "@/components/entrevista/EntrevistaSession";
import type { EntrevistaSetup as Setup } from "@/lib/entrevista/harness";

export function EntrevistaClient() {
  const [setup, setSetup] = useState<Setup | null>(null);

  if (!setup) {
    return (
      <div className="max-w-md mx-auto rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-[#1a1a1a]">Antes de empezar</h2>
          <p className="text-sm text-gray-500 mt-1">
            Estos datos le dan contexto al agente para adaptar sus preguntas.
          </p>
        </div>
        <EntrevistaSetup onStart={setSetup} />
      </div>
    );
  }

  return <EntrevistaSession setup={setup} onReset={() => setSetup(null)} />;
}
