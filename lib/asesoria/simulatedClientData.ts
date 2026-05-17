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
  
  return {
    cedula: cleanCedula,
    nombre,
    tipoCliente,
    fondo,
    posicionActual: Math.round(posicionActual),
    unidadesFondo: Math.round(unidadesFondo * 100) / 100,
    valorUnidad: Math.round(valorUnidad * 100) / 100,
    fechaVinculacion: fechaVinculacion.toISOString().split("T")[0],
    tiempoPermanenciaMeses,
    rentabilidadObtenida: Math.round(rentabilidadObtenida * 100) / 100,
    comisionAplicada,
    tipoParticipacion,
  };
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
  tiempoPermanenciaMeses: 3,
  rentabilidadObtenida: 2.51,
  comisionAplicada: "1.25% E.A.",
  tipoParticipacion: "Persona Natural",
};

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
