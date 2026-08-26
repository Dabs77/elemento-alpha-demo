import { useState } from "react";
import { ArrowRight } from "./icons";
import { useJourneyBrand } from "./brand";

type Props = { go: (n: number) => void };

export function JourneyLogin({ go }: Props) {
  const brand = useJourneyBrand();
  const [cedula, setCedula] = useState("1.037.652.118");

  return (
    <div className="login">
      <div className="login-art">
        <div className="logo">
          <brand.Logo navy="#fff" />
          <div>
            <span className="name">{brand.productName}</span>
            <span className="sub">{brand.tagline}</span>
          </div>
        </div>
        <div className="la-mid">
          <h2>Tu copiloto comercial para la venta de fondos</h2>
          <p>
            Asesoría especializada, comparativas en tiempo real y vinculación de
            clientes — con un agente de IA que resuelve dudas al instante.
          </p>
          <div className="la-feats">
            <div className="la-feat">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M3 12h4l3 8 4-16 3 8h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {brand.loginCompareLine}
            </div>
            <div className="la-feat">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" stroke="currentColor" strokeWidth="2" />
                  <path d="M5 10v1a7 7 0 0 0 14 0v-1M12 19v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              Pregúntale al agente por voz, manos libres
            </div>
            <div className="la-feat">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              Envía el link de vinculación y traslado de recursos
            </div>
          </div>
        </div>
        <div className="la-foot">
          Vigilada Superintendencia Financiera de Colombia · Marzo 2026
        </div>
      </div>
      <div className="login-form">
        <span className="eyebrow">Acceso asesores</span>
        <h3>Ingresa a tu plataforma</h3>
        <p className="hint">
          Identifícate con tu número de cédula para ver tus clientes y objetivos
          del mes.
        </p>
        <div className="field">
          <label htmlFor="ced">Número de cédula</label>
          <div className="with-ic">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="2" />
              <circle cx="8.5" cy="11.5" r="2" stroke="currentColor" strokeWidth="2" />
              <path d="M13 10h5M13 14h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              className="input"
              id="ced"
              inputMode="numeric"
              placeholder="1.037.652.118"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
            />
          </div>
          <div className="assist">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Asesor identificado · Oficina Medellín
          </div>
        </div>
        <button className="btn primary" onClick={() => go(1)}>
          Ingresar a la plataforma
          <ArrowRight width={17} />
        </button>
        <p className="legal">
          {`Acceso exclusivo para la fuerza comercial de ${brand.legalName} El uso del asistente de IA es de apoyo y no sustituye el criterio del asesor ni el cumplimiento de deberes de idoneidad (Circular 049 SFC).`}
        </p>
      </div>
    </div>
  );
}
