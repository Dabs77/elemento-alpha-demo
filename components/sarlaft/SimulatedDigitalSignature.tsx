"use client";

import { useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Eraser, PenLine, ShieldCheck } from "lucide-react";

export type SimulatedSignature = {
  signedAt: string;
  /** PNG data URL (trazo manual o plantilla demo) */
  dataUrl: string;
};

type Props = {
  value: SimulatedSignature | null;
  onChange: (v: SimulatedSignature | null) => void;
  disabled?: boolean;
};

const PAD_H_CSS = 120;

function primeDrawingSurface(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
  const cssW = Math.max(280, rect.width || 320);
  canvas.width = Math.floor(cssW * dpr);
  canvas.height = Math.floor(PAD_H_CSS * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 2;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, cssW, PAD_H_CSS);
  return { ctx, cssW };
}

function stampDemoTexts(ctx: CanvasRenderingContext2D, cssW: number) {
  ctx.fillStyle = "#fafafa";
  ctx.fillRect(0, 0, cssW, PAD_H_CSS);
  ctx.strokeStyle = "#BBE795";
  ctx.lineWidth = 1;
  ctx.strokeRect(8, 8, cssW - 16, PAD_H_CSS - 16);
  ctx.fillStyle = "#1a1a1a";
  ctx.font = 'italic 15px Georgia, "Times New Roman", serif';
  ctx.fillText("Firma electrónica simulada — representante legal", 14, PAD_H_CSS / 2 - 6);
  ctx.font = "12px system-ui, sans-serif";
  ctx.fillStyle = "#4a7c59";
  const ts = new Date().toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
  ctx.fillText(ts, 14, PAD_H_CSS / 2 + 16);
}

export function SimulatedDigitalSignature({ value, onChange, disabled }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasInk = useRef(false);

  const resetPad = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    primeDrawingSurface(c);
  }, []);

  useEffect(() => {
    if (value) return;
    resetPad();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => resetPad()) : null;
    const c = canvasRef.current;
    if (c && ro) ro.observe(c);
    return () => ro?.disconnect();
  }, [value, resetPad]);

  const getContext = () => canvasRef.current?.getContext("2d");

  const pos = (e: React.MouseEvent | React.TouchEvent) => {
    const c = canvasRef.current;
    if (!c) return { x: 0, y: 0 };
    const r = c.getBoundingClientRect();
    if ("touches" in e && e.touches[0]) {
      return { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top };
    }
    const me = e as React.MouseEvent;
    return { x: me.clientX - r.left, y: me.clientY - r.top };
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled || value) return;
    drawing.current = true;
    const ctx = getContext();
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const move = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current || disabled || value) return;
    const ctx = getContext();
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    hasInk.current = true;
  };

  const end = () => {
    drawing.current = false;
  };

  const clearPad = () => {
    if (disabled || value) return;
    hasInk.current = false;
    resetPad();
  };

  const confirm = () => {
    if (disabled || value) return;
    const c = canvasRef.current;
    if (!c) return;
    if (!hasInk.current) {
      const primed = primeDrawingSurface(c);
      if (primed) stampDemoTexts(primed.ctx, primed.cssW);
    }
    const dataUrl = c.toDataURL("image/png");
    onChange({ signedAt: new Date().toISOString(), dataUrl });
  };

  const autoDemo = () => {
    if (disabled || value) return;
    const c = canvasRef.current;
    if (!c) return;
    hasInk.current = false;
    const primed = primeDrawingSurface(c);
    if (!primed) return;
    stampDemoTexts(primed.ctx, primed.cssW);
    const dataUrl = c.toDataURL("image/png");
    onChange({ signedAt: new Date().toISOString(), dataUrl });
  };

  const revoke = () => {
    onChange(null);
    queueMicrotask(() => {
      hasInk.current = false;
      resetPad();
    });
  };

  const signedLabel = value
    ? new Date(value.signedAt).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })
    : null;

  return (
    <div
      className="rounded-xl border border-gray-200 bg-white p-4 space-y-3 ring-1 ring-gray-100/80"
      aria-label="Firma digital simulada"
    >
      <div className="flex items-start gap-2">
        <ShieldCheck className="w-5 h-5 text-[#4a7c59] shrink-0 mt-0.5" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-[#1a1a1a]">Firma digital (simulación)</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            Dibuja en el recuadro o usa la firma automática demo. No es un certificado real; reproduce el paso de
            aceptación antes del envío a fiduciaria.
          </p>
        </div>
      </div>

      {value ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="rounded-lg border border-[#BBE795]/60 bg-[#F0FEE6]/40 p-2 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value.dataUrl} alt="Vista previa de firma simulada" className="h-14 w-auto max-w-[220px] object-contain" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-xs font-medium text-[#4a7c59]">Documento firmado (demo)</p>
            <p className="text-xs text-gray-600">Sello horario simulado: {signedLabel}</p>
            <Button type="button" variant="outline" size="sm" className="h-8 mt-1" onClick={revoke} disabled={disabled}>
              Quitar firma y volver a firmar
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="relative rounded-lg border border-dashed border-gray-300 bg-gray-50/80 overflow-hidden touch-none">
            <canvas
              ref={canvasRef}
              className="w-full h-[120px] block cursor-crosshair"
              onMouseDown={start}
              onMouseMove={move}
              onMouseUp={end}
              onMouseLeave={end}
              onTouchStart={start}
              onTouchMove={move}
              onTouchEnd={end}
            />
            <span className="absolute bottom-2 left-2 text-[10px] text-gray-400 pointer-events-none flex items-center gap-1">
              <PenLine className="w-3 h-3" aria-hidden />
              Área de firma
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" className="h-8" onClick={clearPad} disabled={disabled}>
              <Eraser className="w-3.5 h-3.5 mr-1" />
              Limpiar
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-8" onClick={autoDemo} disabled={disabled}>
              Firma automática (demo)
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 bg-[#4a7c59] text-white hover:bg-[#3f6b4c]"
              onClick={confirm}
              disabled={disabled}
            >
              Confirmar firma simulada
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
