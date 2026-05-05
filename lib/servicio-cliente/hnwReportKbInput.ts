/**
 * Base mostrada como input del informe (demo): política, filosofía y restricciones IPS.
 * Fuente para UI del diálogo y para el campo `baseDeConocimiento` en export JSON.
 */

export const HNW_REPORT_KNOWLEDGE_BASE_INPUT = {
  tituloDocumento: "Política y filosofía de inversiones · Restricciones y lineamientos",
  seccion: {
    tituloPrincipal: "1. Política y Filosofía de Inversiones",
    objetivoGeneral: {
      codigo: "1.1",
      titulo: "Objetivo General",
      texto:
        "Preservar el capital en términos reales y generar rendimientos consistentes que superen la inflación colombiana y los benchmarks del mercado monetario, con un nivel de riesgo moderado y dentro de un horizonte de inversión de 1 a 3 años. El portafolio busca equilibrar la generación de renta con la protección del capital, evitando exposiciones concentradas a activos volátiles sin cobertura adecuada.",
    },
    perfilInversor: {
      codigo: "1.2",
      titulo: "Perfil del Inversor",
      texto:
        "El señor Alejandro Martínez Reyes es un inversionista de patrimonio neto alto (HNW), con experiencia en productos financieros tradicionales. Acepta volatilidad moderada en el corto plazo con el entendimiento de que las fluctuaciones son parte de una estrategia diversificada. Su liquidez personal está cubierta fuera del portafolio de inversión, lo que le permite mantener posiciones sin necesidad de rescates urgentes. Tiene exposición previa a CDTs, fondos de deuda y pequeñas posiciones en renta variable local.",
    },
    filosofia: {
      codigo: "1.3",
      titulo: "Filosofía de Inversión",
      introduccion:
        "La filosofía de inversión de Elemento Alpha se fundamenta en cuatro pilares:",
      pilares: [
        {
          nombre: "Diversificación real",
          descripcion:
            "No solo por clase de activo, sino por moneda, geografía y sensibilidad a tasas de interés.",
        },
        {
          nombre: "Gestión activa con disciplina",
          descripcion:
            "El portafolio se revisa periódicamente y se rebalancea ante desviaciones del asset allocation objetivo.",
        },
        {
          nombre: "Control de riesgo como primera prioridad",
          descripcion:
            "La máxima pérdida esperada (drawdown) no debe exceder el -6% anual en escenario adverso.",
        },
        {
          nombre: "Transparencia y alineación",
          descripcion:
            "Los intereses del asesor están alineados con los del cliente a través de métricas claras de desempeño vs. benchmarks acordados.",
        },
      ],
    },
    restricciones: {
      codigo: "1.4",
      titulo: "Restricciones y Lineamientos",
      filas: [
        {
          restriccion: "Liquidez mínima",
          detalle: "Mínimo 15% del portafolio en activos de alta liquidez (vista/IBR hasta 3M)",
        },
        {
          restriccion: "Exposición en USD",
          detalle: "Entre 15% y 35% del portafolio total",
        },
        {
          restriccion: "Renta variable máxima",
          detalle: "Hasta 25% del portafolio (local + global)",
        },
        {
          restriccion: "Concentración por emisor",
          detalle: "Máximo 20% en un solo emisor (excl. soberano Colombia)",
        },
        {
          restriccion: "Derivados",
          detalle: "Solo para cobertura de tasa de cambio. No posiciones especulativas",
        },
        {
          restriccion: "Activos alternativos",
          detalle: "Máximo 10% en activos inmobiliarios (FICs de finca raíz)",
        },
        {
          restriccion: "Duración media del portafolio",
          detalle: "Entre 0.5 y 2.5 años (consistente con horizonte de corto plazo)",
        },
      ],
    },
  },
} as const;
