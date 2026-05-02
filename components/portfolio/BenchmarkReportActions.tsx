"use client";

import * as React from "react";
import { FileDown, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  /** Clases del contenedor (flex / gap). */
  className?: string;
  size?: React.ComponentProps<typeof Button>["size"];
};

/**
 * Informe tipo presentación BMK Ultraliquido (HTML/CSS + PDF opcional Cloudflare).
 */
export function BenchmarkReportActions({ className = "flex flex-wrap gap-2", size = "sm" }: Props) {
  const [pdfBusy, setPdfBusy] = React.useState(false);

  const openHtml = React.useCallback(() => {
    window.open("/api/portfolio/benchmark-report?format=html", "_blank", "noopener,noreferrer");
  }, []);

  const downloadPdf = React.useCallback(async () => {
    setPdfBusy(true);
    try {
      const r = await fetch("/api/portfolio/benchmark-report?format=pdf");
      const ct = r.headers.get("content-type") ?? "";
      if (!r.ok || !ct.includes("pdf")) {
        openHtml();
        return;
      }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `elemento-alpha-informe-bmk-ultraliquido.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setPdfBusy(false);
    }
  }, [openHtml]);

  return (
    <div className={className}>
      <Button type="button" variant="outline" size={size} className="rounded-xl gap-2 font-semibold" onClick={openHtml}>
        <Presentation className="h-4 w-4 shrink-0" aria-hidden />
        Informe presentación
      </Button>
      <Button
        type="button"
        variant="outline"
        size={size}
        className="rounded-xl gap-2 font-semibold"
        disabled={pdfBusy}
        onClick={() => void downloadPdf()}
      >
        <FileDown className="h-4 w-4 shrink-0" aria-hidden />
        {pdfBusy ? "PDF…" : "Descargar PDF"}
      </Button>
      <span className="w-full basis-full text-[10px] text-gray-400 sm:w-auto sm:basis-auto">
        Si PDF falla se abre la versión HTML (Ctrl+P → guardar PDF).
      </span>
    </div>
  );
}
