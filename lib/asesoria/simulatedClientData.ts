/**
 * Datos simulados de clientes para el módulo de asesoría.
 * Genera datos ficticios basados en la cédula ingresada.
 */

export interface SimulatedClientPosition {
  cedula: string;
  nombre: string;
  tipoCliente: "persona_natural" | "persona_juridica";
  fondo: "FIC Abierto" | "FIC CxC";
  posicionActual: number;
  unidadesFondo: number;
  valorUnidad: number;
  fechaVinculacion: string;
  tiempoPermanenciaMeses: number;
  /** Porcentaje del capital retirado en el periodo (0 = sin retiros) */
  retirosCapitalPct: number;
  rentabilidadObtenida: number;
  comisionAplicada: string;
  tipoParticipacion: string;
}

// Nombres colombianos simulados
const NOMBRES_PERSONA_NATURAL = [
  "Carlos Andrés Martínez López",
  "María Fernanda González Ruiz",
  "Juan Sebastián Rodríguez Gómez",
  "Ana María Hernández Castro",
  "Luis Fernando Pérez Díaz",
  "Camila Andrea Sánchez Mora",
  "Andrés Felipe Torres Vargas",
  "Valentina Ramírez Ortiz",
  "Diego Alejandro García Muñoz",
  "Laura Catalina López Jiménez",
];

const NOMBRES_PERSONA_JURIDICA = [
  "Inversiones Andinas S.A.S.",
  "Grupo Empresarial Del Valle Ltda.",
  "Corporación Industrial Bogotá S.A.",
  "Holdings Caribe S.A.S.",
  "Constructora Antioquia S.A.",
  "Agroindustrias del Pacífico Ltda.",
  "Tecnología Digital Colombia S.A.S.",
  "Servicios Financieros Cali S.A.",
  "Importadora Central S.A.S.",
  "Desarrollos Inmobiliarios Costa S.A.",
];

// Genera un hash numérico simple a partir de un string
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/** Perfiles demo con cédula fija — activan reglas de recomendación de forma predecible. */
const DEMO_CEDULA_OVERRIDES: Record<
  string,
  Partial<SimulatedClientPosition> & {
    tiempoPermanenciaMeses: number;
    retirosCapitalPct: number;
  }
> = {
  /** Regla 2: > 12 meses, retiros < 30% → traslado total CxC + aumento 20% */
  "1000077160": {
    nombre: "Carlos Andrés Martínez López",
    tiempoPermanenciaMeses: 18,
    retirosCapitalPct: 15,
    posicionActual: 100_000_000,
  },
};

function applyDemoCedulaOverride(
  client: SimulatedClientPosition,
  cleanCedula: string,
): SimulatedClientPosition {
  const override = DEMO_CEDULA_OVERRIDES[cleanCedula];
  if (!override) return client;

  const merged = { ...client, ...override, cedula: cleanCedula };
  const hoy = new Date();
  const fechaVinculacion = new Date(hoy);
  fechaVinculacion.setMonth(
    fechaVinculacion.getMonth() - merged.tiempoPermanenciaMeses,
  );
  merged.fechaVinculacion = fechaVinculacion.toISOString().split("T")[0];
  merged.unidadesFondo =
    Math.round((merged.posicionActual / merged.valorUnidad) * 100) / 100;
  merged.rentabilidadObtenida =
    Math.round(((8.5 * merged.tiempoPermanenciaMeses) / 12) * 100) / 100;

  return merged;
}

// Genera datos simulados basados en la cédula
export function generateSimulatedClient(cedula: string): SimulatedClientPosition {
  const hash = simpleHash(cedula);
  const cleanCedula = cedula.replace(/\D/g, "");
  
  // Determinar tipo de cliente (PJ si empieza con 8 o 9, o tiene más de 10 dígitos)
  const esPJ = cleanCedula.startsWith("8") || cleanCedula.startsWith("9") || cleanCedula.length > 10;
  const tipoCliente = esPJ ? "persona_juridica" : "persona_natural";
  
  // Seleccionar nombre basado en hash
  const nombres = esPJ ? NOMBRES_PERSONA_JURIDICA : NOMBRES_PERSONA_NATURAL;
  const nombre = nombres[hash % nombres.length];
  
  // Determinar fondo (demo: FIC Abierto para todos los existentes)
  const fondo = "FIC Abierto" as const;
  
  // Generar posición simulada (entre 5M y 500M COP)
  const basePosition = 5_000_000;
  const maxPosition = 500_000_000;
  const posicionActual = basePosition + (hash % (maxPosition - basePosition));
  
  // Valor de unidad actual del FIC Abierto (aproximado)
  const valorUnidad = 10_856.23 + (hash % 100) / 100;
  const unidadesFondo = posicionActual / valorUnidad;
  
  // Tiempo de permanencia (1-36 meses)
  const tiempoPermanenciaMeses = 1 + (hash % 36);
  
  // Fecha de vinculación calculada hacia atrás
  const hoy = new Date();
  const fechaVinculacion = new Date(hoy);
  fechaVinculacion.setMonth(fechaVinculacion.getMonth() - tiempoPermanenciaMeses);
  
  // Rentabilidad obtenida (entre 5% y 12% anualizada, prorrateada)
  const rentabilidadAnual = 5 + (hash % 700) / 100;
  const rentabilidadObtenida = (rentabilidadAnual * tiempoPermanenciaMeses) / 12;
  
  // Retiros simulados (0–55% del capital)
  const retirosCapitalPct = hash % 56;

  // Tipo de participación y comisión
  let tipoParticipacion: string;
  let comisionAplicada: string;
  
  if (esPJ) {
    if (posicionActual > 20_000_000_000) {
      tipoParticipacion = "Corporativo CD";
      comisionAplicada = "0.75% E.A.";
    } else if (posicionActual > 10_000_000_000) {
      tipoParticipacion = "Corporativo CC";
      comisionAplicada = "1.02% E.A.";
    } else {
      tipoParticipacion = "Institucional";
      comisionAplicada = "0.75% E.A.";
    }
  } else {
    tipoParticipacion = "Persona Natural";
    comisionAplicada = "1.25% E.A.";
  }
  
  return normalizeSimulatedClient(
    applyDemoCedulaOverride(
      {
        cedula: cleanCedula,
        nombre,
        tipoCliente,
        fondo,
        posicionActual: Math.round(posicionActual),
        unidadesFondo: Math.round(unidadesFondo * 100) / 100,
        valorUnidad: Math.round(valorUnidad * 100) / 100,
        fechaVinculacion: fechaVinculacion.toISOString().split("T")[0],
        tiempoPermanenciaMeses,
        retirosCapitalPct,
        rentabilidadObtenida: Math.round(rentabilidadObtenida * 100) / 100,
        comisionAplicada,
        tipoParticipacion,
      },
      cleanCedula,
    ),
  );
}

// Cliente de demo predefinido (para la UI inicial)
export const DEMO_CLIENT: SimulatedClientPosition = {
  cedula: "1234567890",
  nombre: "Carlos Andrés Martínez López",
  tipoCliente: "persona_natural",
  fondo: "FIC Abierto",
  posicionActual: 30_000_000,
  unidadesFondo: 2763.42,
  valorUnidad: 10856.23,
  fechaVinculacion: "2026-02-15",
  tiempoPermanenciaMeses: 9,
  retirosCapitalPct: 0,
  rentabilidadObtenida: 2.51,
  comisionAplicada: "1.25% E.A.",
  tipoParticipacion: "Persona Natural",
};

/** Asegura campos opcionales en clientes generados antes de retirosCapitalPct. */
export function normalizeSimulatedClient(
  client: SimulatedClientPosition,
): SimulatedClientPosition {
  return {
    ...client,
    retirosCapitalPct: client.retirosCapitalPct ?? 0,
  };
}

// Formateo de moneda COP
export function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Formateo de número con separadores
export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
