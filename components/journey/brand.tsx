"use client";

import { createContext, useContext, type ComponentType, type ReactNode } from "react";
import { AlphaLogoMark, LogoMark, type LogoMarkProps } from "./icons";

export type JourneyBrand = {
  id: "alianza" | "alpha";
  productName: string;
  tagline: string;
  legalName: string;
  shortName: string;
  domain: string;
  assistantName: string;
  fundAbiertoName: string;
  fundCxcName: string;
  fundAbiertoShort: string;
  fundCxcShort: string;
  fundAbiertoKind: string;
  fundCxcKind: string;
  comparativaSub: string;
  voicePrompt: string;
  loginCompareLine: string;
  sourcesLabel: string;
  vinculationHost: string;
  tokenEndpoint: string;
  Logo: ComponentType<LogoMarkProps>;
};

export const ALIANZA_BRAND: JourneyBrand = {
  id: "alianza",
  productName: "Alianza Asesor IA",
  tagline: "UNA EMPRESA DE LA ORGANIZACIÓN DELIMA",
  legalName: "Alianza Fiduciaria S.A.",
  shortName: "Alianza",
  domain: "asesor.alianza.com.co",
  assistantName: "Asistente Alianza",
  fundAbiertoName: "FIC Abierto Alianza",
  fundCxcName: "FIC CxC Alianza",
  fundAbiertoShort: "FIC Abierto",
  fundCxcShort: "FIC CxC",
  fundAbiertoKind: "Fondo de Inversión Colectiva Abierto",
  fundCxcKind: "Fondo con pacto de permanencia 30 días",
  comparativaSub: "FIC Abierto · CxC",
  voicePrompt:
    "Pregúntale al asistente sobre FIC Abierto, FIC CxC, rentabilidades o el pacto de permanencia.",
  loginCompareLine: "Compara FIC Abierto vs Fondo CxC en segundos",
  sourcesLabel: "Fuentes: prospectos Alianza",
  vinculationHost: "alianza.com.co",
  tokenEndpoint: "/api/elevenlabs-token",
  Logo: LogoMark,
};

export const ALPHA_BRAND: JourneyBrand = {
  id: "alpha",
  productName: "Fiduciaria Alpha Asesor IA",
  tagline: "FIDUCIARIA ALPHA",
  legalName: "Fiduciaria Alpha S.A.",
  shortName: "Alpha",
  domain: "asesor.fiduciariaalpha.com",
  assistantName: "Asistente Alpha",
  fundAbiertoName: "FIC Base",
  fundCxcName: "FIC Alternativo",
  fundAbiertoShort: "FIC Base",
  fundCxcShort: "FIC Alternativo",
  fundAbiertoKind: "Fondo de Inversión Colectiva Base",
  fundCxcKind: "Fondo Alternativo con pacto de permanencia 30 días",
  comparativaSub: "Base · Alternativo",
  voicePrompt:
    "Pregúntale al asistente sobre FIC Base, FIC Alternativo, rentabilidades o el pacto de permanencia.",
  loginCompareLine: "Compara FIC Base vs FIC Alternativo en segundos",
  sourcesLabel: "Fuentes: prospectos Alpha",
  vinculationHost: "fiduciariaalpha.com",
  tokenEndpoint: "/api/elevenlabs-token-calculo",
  Logo: AlphaLogoMark,
};

const JourneyBrandContext = createContext<JourneyBrand>(ALIANZA_BRAND);

export function JourneyBrandProvider({
  brand,
  children,
}: {
  brand: JourneyBrand;
  children: ReactNode;
}) {
  return (
    <JourneyBrandContext.Provider value={brand}>
      {children}
    </JourneyBrandContext.Provider>
  );
}

export function useJourneyBrand() {
  return useContext(JourneyBrandContext);
}
