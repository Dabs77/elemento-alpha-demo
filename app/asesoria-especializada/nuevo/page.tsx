import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { JourneyShell } from "@/components/journey/JourneyShell";
import "./journey.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata = {
  title: "Journey del Asesor · Alianza Asesor IA",
  description:
    "Plataforma agéntica para asesoría y ejecución de venta de fondos de Alianza Fiduciaria.",
};

export default function AsesoriaEspecializadaNuevoPage() {
  return (
    <div className={`journey-root ${inter.variable} ${jakarta.variable}`}>
      <JourneyShell />
    </div>
  );
}
