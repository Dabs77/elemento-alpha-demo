import type { SarlaftPackage } from "./schema";
import { createEmptyPackage, createEmptyOtras14, createEmptySagrilaftPregunta } from "./schema";

const CLASIFICACION_OTRA_ACROPOLIS =
  "Empresa tecnológica: desarrollo de software empresarial e IA asistida — diseño de bases de datos, interfaces y aplicaciones web (CIIU 6201). No institución financiera al tenor de FATCA/CRS salvo clasificación oficial distinta expedida por la autoridad competente.";

/**
 * Demo Acropolis AI SAS: datos alineados a extracción “rectificada” desde RUT,
 * Certificado de Existencia y Estados Financieros (Dic. 2025).
 */
export function getDemoSarlaftPackage(): SarlaftPackage {
  const base = createEmptyPackage();

  base.formulario_1 = {
    id_formulario: "1",
    nombre_completo_razon_social: "ACROPOLIS AI SAS",
    tipo_y_numero_identificacion: "NIT 901.741.921-6",
    num_oficinas_pais: 1,
    num_oficinas_exterior: 0,
    ciudades_paises_operacion:
      "Domicilio principal: Bogotá D.C., Colombia. Operación efectiva Bogotá D.C.; informante de Beneficiarios Finales, lleva contabilidad, Régimen Simple de Tributación.",
    politicas: {
      programa_laft_documentado: {
        ...createEmptySagrilaftPregunta(
          "¿Su entidad tiene un programa/sistema LA/FT documentado y actualizado?",
          "programa"
        ),
        respuesta: "Sí",
        detalle_programa: {
          organo_aprobacion: "Órgano de administración (Junta Societaria / Representante Legal)",
          fecha_aprobacion: "2024-03-01",
        },
      },
      regulacion_gubernamental_laft: {
        ...createEmptySagrilaftPregunta("¿Su entidad está sujeta a regulación gubernamental LA/FT?", "regulacion"),
        respuesta: "Sí",
        detalle_regulacion: {
          normatividad:
            "Marco LA/FT colombiano; obligaciones tributarias declaradas ante DIAN incl. información de BF y contabilidad según objeto social societario.",
        },
      },
      oficial_cumplimiento: {
        ...createEmptySagrilaftPregunta("¿Tiene Oficial de Cumplimiento designado?", "oficial"),
        respuesta: "Sí",
        detalle_oficial: {
          nombre: "Conforme nombramiento/certificación soporte institucional (política LA/FT)",
          identificacion: "Según soporte técnico y designación institucional",
          cargo: "Oficial de Cumplimiento LA/FT",
          email: "cumplimiento@acropolisai.demo",
          telefono: "+57 601 —",
        },
      },
      operaciones_efectivo: {
        ...createEmptySagrilaftPregunta("¿Realiza operaciones en efectivo?"),
        respuesta: "No",
      },
      activos_virtuales: {
        ...createEmptySagrilaftPregunta(
          "¿Realiza transacciones o posee activos virtuales (criptomonedas)?",
          "cripto"
        ),
        respuesta: "No",
      },
      sancionada_investigada: {
        ...createEmptySagrilaftPregunta(
          "¿La entidad ha sido sancionada o investigada por procesos de lavado de activos?",
          "sancion"
        ),
        respuesta: "No",
      },
      otras_14_preguntas: createEmptyOtras14(),
    },
  };

  base.formulario_2 = {
    id_formulario: "2",
    razon_social: "ACROPOLIS AI SAS",
    identificacion_tributaria: "901.741.921-6",
    pais_constitucion_fiscal: "Colombia",
    actividad_principal: "e) Ninguna de las anteriores",
    ingresos_activos_pasivos_50: "No",
    clasificacion_fatca_crs: "Otra",
    clasificacion_otra: CLASIFICACION_OTRA_ACROPOLIS,
    ubo: {
      datos_personales:
        "David Sebastian Galeano Arias, C.C. 1.034.277.398 — Representante Legal. Beneficiario final con participación directa estimada ~25%; ejerce control político institucional en calidad directiva.",
      paises_tin: [{ pais: "Colombia", tin: "901.741.921-6" }],
      tipo_control: "Administrador (Directivo)",
    },
  };

  base.formulario_3 = {
    id_formulario: "3",
    tipo_empresa: "S.A.S.",
    cifras_financieras: {
      ingresos: 15_597_205,
      egresos: 1_838_644,
      total_activos: 14_684_561,
      total_pasivos: 646_000,
      total_patrimonio: 14_038_561,
    },
    administra_recursos_publicos: "No",
    grupo_contable_niif: "Grupo 2 (Pymes)",
    ciclo_empresa: "Joven/Crecimiento",
    liquidez: "Algo relevante",
    experiencia_inversion: "Fondos de Inversión",
    tolerancia_riesgo: "Esperar/Invertir más aprovechando precios bajos",
    objetivo_inversion:
      "Formalización/reinversión de utilidades; estados muestran utilidad del periodo cercana a COP $13.038.561.",
    representantes_ordenates:
      "Representante Legal Principal: David Sebastian Galeano Arias (C.C. 1.034.277.398). Primer suplente: Paula Sofía Torres Rodríguez. Segundo suplente: Daniel Andrés Becerra Sierra.",
    es_pep: "No",
    accionistas: [
      {
        nombre: "David Sebastian Galeano Arias",
        id: "C.C. 1.034.277.398",
        porcentaje: 25,
        cotiza_en_bolsa: "No",
      },
      {
        nombre: "Exabyte Company SAS",
        id:
          "NIT 901.529.728 — BF indirectos referidos: Juan David López Becerra (~50%); Miguel Ángel Tirado Álvarez (~50%)",
        porcentaje: 25,
        cotiza_en_bolsa: "No",
      },
      {
        nombre: "Paula Sofía Torres Rodríguez",
        id: "C.C. 1.013.104.278",
        porcentaje: 25,
        cotiza_en_bolsa: "No",
      },
      {
        nombre: "Daniel Andrés Becerra Sierra",
        id: "C.C. 1.000.077.160",
        porcentaje: 25,
        cotiza_en_bolsa: "No",
      },
    ],
    calidad_beneficiario_final: [
      "Por Titularidad (Capital / Derechos de voto)",
      "Por Control (Representante legal / Mayor autoridad)",
    ],
  };

  return base;
}
