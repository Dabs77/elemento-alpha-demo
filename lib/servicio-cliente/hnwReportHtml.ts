import {
  ACTIVE_ALERTS,
  ALLOCATION_OBJECTIVE_ROWS,
  BENCHMARK_REFERENCE_ROWS,
  CLIENT_SHEET_ROWS,
  COMPARISON_VS_BENCHMARK,
  DISTRIBUTION_BY_ASSET_TYPE,
  DISTRIBUTION_BY_CURRENCY,
  HNW_CLIENT_DEMO,
  MACRO_CONTEXT_Q1,
} from "@/lib/servicio-cliente/hnwAlejandroReport";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tableStyles(): string {
  return `
  table.tbl { width:100%; border-collapse:collapse; font-size:11px; margin-bottom:14px; }
  table.tbl th, table.tbl td { border:1px solid #ddd; padding:6px 8px; vertical-align:top; }
  table.tbl th { background:#f6faf7; text-align:left; font-weight:700; color:#2d5a3d; }
  table.tbl td.num { text-align:right; font-variant-numeric:tabular-nums; }
  h2 { font-size:13px; color:#2d5a3d; margin:18px 0 8px; border-bottom:2px solid #bbe795; padding-bottom:4px; }
  `.trim();
}

export function buildHnwReportHtml(): string {
  const rowsKv = CLIENT_SHEET_ROWS.map(
    (r) =>
      `<tr><td><strong>${escapeHtml(r.label)}</strong></td><td>${escapeHtml(r.value)}</td></tr>`
  ).join("");

  const rowsBmk = BENCHMARK_REFERENCE_ROWS.map(
    (r) =>
      `<tr><td>${escapeHtml(r.component)}</td><td class="num">${escapeHtml(r.weightPct)}</td><td class="num">${escapeHtml(r.frequency)}</td></tr>`
  ).join("");

  const rowsAlloc = ALLOCATION_OBJECTIVE_ROWS.map(
    (r) =>
      `<tr><td>${escapeHtml(r.clase)}</td><td class="num">${escapeHtml(r.objetivoPct)}</td><td class="num">${escapeHtml(r.actualPct)}</td><td>${escapeHtml(r.nota ?? "")}</td></tr>`
  ).join("");

  const rowsCmp = COMPARISON_VS_BENCHMARK.map(
    (r) =>
      `<tr><td>${escapeHtml(r.metric)}</td><td class="num">${escapeHtml(r.portfolio)}</td><td class="num">${escapeHtml(r.benchmark)}</td><td class="num">${escapeHtml(r.alpha)}</td></tr>`
  ).join("");

  const rowsAlerts = ACTIVE_ALERTS.map(
    (a) =>
      `<tr><td>${a.status === "ok" ? "✓" : "⚠"}</td><td>${escapeHtml(a.alerta)}</td><td>${escapeHtml(a.accionSugerida)}</td></tr>`
  ).join("");

  const rowsMacro = MACRO_CONTEXT_Q1.map(
    (r) =>
      `<tr><td>${escapeHtml(r.variable)}</td><td class="num">${escapeHtml(r.actual)}</td><td class="num">${escapeHtml(r.anterior)}</td><td>${escapeHtml(r.tendencia)}</td></tr>`
  ).join("");

  return `<!DOCTYPE html>
<html lang="es-CO">
<head>
<meta charset="utf-8"/>
<title>Informe cliente · ${escapeHtml(HNW_CLIENT_DEMO.nombre)} · ELEMENTO ALPHA (demo)</title>
<style>
 ${tableStyles()}
 body { font-family:Segoe UI,system-ui,sans-serif; margin:24px; color:#1a1a1a; }
 header { margin-bottom:20px; }
 .muted { font-size:10px; color:#666; }
 .deck { max-width:900px; margin:0 auto; }
 .pill { display:inline-block; padding:4px 10px; border-radius:999px; background:#f0fee6; font-size:11px; font-weight:600; color:#3f6b4c; }
</style>
</head>
<body>
<div class="deck">
<header>
  <span class="pill">Sin ejecución</span>
  <h1 style="font-size:22px;margin:12px 0 4px">Informe ejecutivo · cliente corporativo</h1>
  <p class="muted">${escapeHtml(HNW_CLIENT_DEMO.nombre)} · ${escapeHtml(HNW_CLIENT_DEMO.fechaElaboracion)} · ELEMENTO ALPHA</p>
</header>

<h2>1 · Ficha y estado del cliente</h2>
<table class="tbl">${rowsKv}</table>

<h2>1.5 · Benchmark de referencia</h2>
<table class="tbl">
<thead><tr><th>Componente</th><th>Ponderación</th><th>Frecuencia</th></tr></thead>
<tbody>${rowsBmk}</tbody>
</table>

<h2>2.1 · Asset allocation objetivo vs estado</h2>
<table class="tbl">
<thead><tr><th>Clase</th><th>Objetivo</th><th>Actual</th><th>Nota</th></tr></thead>
<tbody>${rowsAlloc}</tbody>
</table>

<h2>2.2 · Distribución</h2>
<p><strong>Por moneda:</strong> ${escapeHtml(DISTRIBUTION_BY_CURRENCY)}</p>
<p><strong>Por tipo de activo:</strong> ${escapeHtml(DISTRIBUTION_BY_ASSET_TYPE)}</p>

<h2>2.3 · Comparación vs benchmark (Q1 2026)</h2>
<table class="tbl">
<thead><tr><th>Métrica</th><th>Portafolio</th><th>Benchmark</th><th>Alpha</th></tr></thead>
<tbody>${rowsCmp}</tbody>
</table>

<h2>2.4 · Alertas activas</h2>
<table class="tbl">
<thead><tr><th></th><th>Alerta</th><th>Acción sugerida</th></tr></thead>
<tbody>${rowsAlerts}</tbody>
</table>

<h2>3.1 · Contexto macroeconómico Q1 2026</h2>
<table class="tbl">
<thead><tr><th>Variable</th><th>Dato actual</th><th>Trim. anterior</th><th>Tendencia</th></tr></thead>
<tbody>${rowsMacro}</tbody>
</table>

<p class="muted">Documento generado automáticamente para demo interna. No constituye oferta ni recomendación personalizada fuera del alcance del PILOTO.</p>
</div>
</body>
</html>`;
}
