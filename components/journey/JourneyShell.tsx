"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Check } from "./icons";
import { useJourneyBrand } from "./brand";
import { JourneyLogin } from "./JourneyLogin";
import { JourneyDashboard } from "./JourneyDashboard";
import { JourneyComparativa } from "./JourneyComparativa";
import { JourneyVoz } from "./JourneyVoz";
import { JourneyVinculacion } from "./JourneyVinculacion";

const TOTAL = 5;
const PATHS = ["/ingreso", "/inicio", "/fondos/comparativa", "/asistente/voz", "/vincular/cxc"];

export function JourneyShell() {
  const brand = useJourneyBrand();
  const [cur, setCur] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const steps = [
    { title: "Ingreso", sub: "Cédula" },
    { title: "Inicio", sub: "Clientes y metas" },
    { title: "Comparativa", sub: brand.comparativaSub },
    { title: "Asistente", sub: "Interacción por voz" },
    { title: "Vinculación", sub: "Link y traslado" },
  ];

  const go = useCallback((n: number) => {
    if (n < 0 || n >= TOTAL) return;
    setCur(n);
    viewportRef.current?.scrollTo({ top: 0 });
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") setCur((c) => Math.min(c + 1, TOTAL - 1));
      if (e.key === "ArrowLeft") setCur((c) => Math.max(c - 1, 0));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="wrap">
      {/* encabezado de marca */}
      <div className="proto-head">
        <div className="proto-title">
          <div className="logo">
            <brand.Logo />
            <div>
              <span className="name">{brand.productName}</span>
              <span className="sub">{brand.tagline}</span>
            </div>
          </div>
          <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 14 }}>
            <h1>Journey del Asesor Comercial</h1>
            <p>Plataforma agéntica para asesoría y ejecución de venta de fondos</p>
          </div>
        </div>
        <Link href="/" className="tag" style={{ textDecoration: "none" }}>
          <ChevronLeft width={13} style={{ color: "var(--muted)" }} />
          Volver al inicio
        </Link>
      </div>

      {/* stepper */}
      <div className="stepper">
        {steps.map((s, i) => (
          <button
            key={s.title}
            className={`step${i === cur ? " active" : ""}${i < cur ? " done" : ""}`}
            onClick={() => go(i)}
          >
            <span className="num">{i + 1}</span>
            <span className="lab">
              <b>{s.title}</b>
              <span>{s.sub}</span>
            </span>
          </button>
        ))}
      </div>

      {/* device */}
      <div className="canvas">
        <div className="device">
          <div className="chrome">
            <div className="dots">
              <i /><i /><i />
            </div>
            <div className="url">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 11V7a4 4 0 1 1 8 0v4M5 11h14v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {brand.domain}
              <span style={{ color: "var(--ink)", fontWeight: 600 }}>{PATHS[cur]}</span>
            </div>
          </div>
          <div className="viewport" ref={viewportRef}>
            <section className={`screen${cur === 0 ? " on" : ""}`}>
              <JourneyLogin go={go} />
            </section>
            <section className={`screen${cur === 1 ? " on" : ""}`}>
              <JourneyDashboard go={go} />
            </section>
            <section className={`screen${cur === 2 ? " on" : ""}`}>
              <JourneyComparativa go={go} />
            </section>
            <section className={`screen${cur === 3 ? " on" : ""}`}>
              <JourneyVoz go={go} />
            </section>
            <section className={`screen${cur === 4 ? " on" : ""}`}>
              <JourneyVinculacion go={go} showToast={showToast} />
            </section>
          </div>

          <div className={`toast${toast ? " show" : ""}`}>
            <Check />
            <span>{toast ?? ""}</span>
          </div>
        </div>
      </div>

      {/* bottom nav */}
      <div className="nav-bar">
        <div className="legend">
          Navega el journey con <kbd>←</kbd> <kbd>→</kbd> o haz clic en los pasos
        </div>
        <div className="nav-actions">
          <button
            className="btn ghost sm"
            onClick={() => go(cur - 1)}
            style={{ visibility: cur === 0 ? "hidden" : "visible" }}
          >
            <ChevronLeft width={16} />
            Anterior
          </button>
          <button
            className="btn primary sm"
            onClick={() => go(cur + 1)}
            style={{ visibility: cur === TOTAL - 1 ? "hidden" : "visible" }}
          >
            Siguiente
            <ChevronRight width={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
