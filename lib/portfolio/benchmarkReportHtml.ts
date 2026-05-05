import { ASSET_ALLOCATION, PORTFOLIO_METRICS, type PortfolioMetrics } from "@/lib/portfolio/portfolioData";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const BRAND_PURPLE = "#5c3d91";
const BRAND_PURPLE_LIGHT = "#7b5cbf";
const ACCENT_BLUE = "#3d5a80";
const TABLE_HEADER = BRAND_PURPLE;

/** Fecha de informe DD/MM/YYYY en zona local */
function reportDateLabel(): string {
  const d = new Date();
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function fmtPct(n: number, decimals = 4): string {
  return `${n.toFixed(decimals)}%`;
}

function fmtPct2(n: number): string {
  return `${n.toFixed(2)}%`;
}

type PFKey = "portfolio32" | "portfolio33" | "portfolio36";

const PF_LABEL: Record<PFKey, string> = {
  portfolio32: "Sugerido",
  portfolio33: "Sugerido 2",
  portfolio36: "Sugerido 3",
};

function frontierSvg(): string {
  const m32 = PORTFOLIO_METRICS.portfolio32;
  const m33 = PORTFOLIO_METRICS.portfolio33;
  const m36 = PORTFOLIO_METRICS.portfolio36;

  const vols = [m32.volatility, m33.volatility, m36.volatility];
  const rets = [m32.expectedReturn, m33.expectedReturn, m36.expectedReturn];
  const minV = Math.min(...vols) - 0.08;
  const maxV = Math.max(...vols) + 0.08;
  const minR = Math.min(...rets) - 0.06;
  const maxR = Math.max(...rets) + 0.04;

  const W = 520;
  const H = 340;
  const padL = 52;
  const padR = 24;
  const padT = 36;
  const padB = 48;

  const xPx = (v: number) => padL + ((v - minV) / (maxV - minV)) * (W - padL - padR);
  const yPx = (r: number) => padT + (1 - (r - minR) / (maxR - minR)) * (H - padT - padB);

  const dots: string[] = [];
  const seed = 42;
  let rng = seed;
  const next = () => {
    rng = (rng * 1103515245 + 12345) & 0x7fffffff;
    return rng / 0x7fffffff;
  };
  for (let i = 0; i < 55; i++) {
    const t = i / 54;
    const baseV = minV + t * (maxV - minV);
    const curveR = minR + t * (maxR - minR) * 0.92 + Math.sin(t * Math.PI) * 0.025;
    const jitterV = (next() - 0.5) * 0.035;
    const jitterR = (next() - 0.5) * 0.018;
    const vx = baseV + jitterV;
    const ry = Math.min(curveR + jitterR, maxR - 0.005);
    dots.push(
      `<circle cx="${xPx(vx).toFixed(1)}" cy="${yPx(ry).toFixed(1)}" r="2.2" fill="#4a90d9" opacity="0.75" />`
    );
  }

  const highlight = [m32, m33, m36].map(
    (m) =>
      `<circle cx="${xPx(m.volatility).toFixed(1)}" cy="${yPx(m.expectedReturn).toFixed(1)}" r="6" fill="#2d8a54" stroke="#fff" stroke-width="1.5" />`
  );

  const xTicks = 5;
  const yTicks = 5;
  let grid = "";
  for (let i = 0; i <= xTicks; i++) {
    const v = minV + (i / xTicks) * (maxV - minV);
    const x = xPx(v);
    grid += `<line x1="${x}" y1="${padT}" x2="${x}" y2="${H - padB}" stroke="#e8e8e8" stroke-width="1" />`;
  }
  for (let j = 0; j <= yTicks; j++) {
    const r = minR + (j / yTicks) * (maxR - minR);
    const y = yPx(r);
    grid += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="#e8e8e8" stroke-width="1" />`;
  }

  let xLabels = "";
  for (let i = 0; i <= xTicks; i++) {
    const v = minV + (i / xTicks) * (maxV - minV);
    xLabels += `<text x="${xPx(v)}" y="${H - padB + 18}" text-anchor="middle" font-size="9" fill="#555">${v.toFixed(2)}</text>`;
  }
  let yLabels = "";
  for (let j = 0; j <= yTicks; j++) {
    const r = minR + (j / yTicks) * (maxR - minR);
    yLabels += `<text x="${padL - 8}" y="${yPx(r) + 3}" text-anchor="end" font-size="9" fill="#555">${r.toFixed(2)}%</text>`;
  }

  return `
  <svg viewBox="0 0 ${W} ${H}" width="100%" height="auto" style="max-height:340px;display:block;margin:12px auto" xmlns="http://www.w3.org/2000/svg">
    ${grid}
    <text x="${W / 2}" y="${20}" text-anchor="middle" font-size="13" fill="${ACCENT_BLUE}" font-weight="600">Frontera eficiente (demo · datos modelo)</text>
    <text x="${(padL + W - padR) / 2}" y="${H - 8}" text-anchor="middle" font-size="11" fill="#333" font-weight="600">Volatilidad esperada modelo (%)</text>
    <text transform="rotate(-90 ${padL - 42} ${(padT + H - padB) / 2})" x="${padL - 42}" y="${(padT + H - padB) / 2}" text-anchor="middle" font-size="11" fill="#333" font-weight="600">Retorno esperado (%)</text>
    ${dots.join("\n")}
    ${highlight.join("\n")}
    ${xLabels}
    ${yLabels}
  </svg>`.trim();
}

/** Rankea 1 mejor retorno esperado */
function rankingByReturn(): { key: PFKey; rank: 1 | 2 | 3 }[] {
  const keys: PFKey[] = ["portfolio32", "portfolio33", "portfolio36"];
  const sorted = [...keys].sort(
    (a, b) => PORTFOLIO_METRICS[b].expectedReturn - PORTFOLIO_METRICS[a].expectedReturn
  );
  return sorted.map((key, i) => ({ key, rank: (i + 1) as 1 | 2 | 3 }));
}

function rankColor(rank: 1 | 2 | 3): string {
  if (rank === 1) return "#2d8a54";
  if (rank === 2) return "#c9a227";
  return "#c44c4c";
}

function allocationTableRows(): string {
  const rankMap = Object.fromEntries(rankingByReturn().map((r) => [r.key, r.rank])) as Record<PFKey, 1 | 2 | 3>;

  const headerRankCells = (["portfolio32", "portfolio33", "portfolio36"] as PFKey[])
    .map((k) => {
      const rank = rankMap[k];
      return `<th style="background:${rankColor(rank)};color:#fff;font-weight:700;text-align:center;padding:8px 6px">${rank}</th>`;
    })
    .join("");

  const rows = ASSET_ALLOCATION.map((row, idx) => {
    const zebra = idx % 2 === 0 ? "#fafafa" : "#fff";
    const cells = (["portfolio32", "portfolio33", "portfolio36"] as PFKey[])
      .map((k) => `<td style="padding:8px;text-align:right;font-variant-numeric:tabular-nums">${fmtPct2(row[k])}</td>`)
      .join("");
    return `<tr style="background:${zebra}">
      <td style="padding:8px;font-size:11px">${escapeHtml(row.asset)}</td>
      ${cells}
      <td style="padding:8px;text-align:right">—</td>
      <td style="padding:8px;text-align:right">—</td>
      <td style="padding:8px;text-align:right">—</td>
      <td style="padding:8px;text-align:right;font-size:10px;color:#555">*</td>
    </tr>`;
  }).join("");

  const summaries: [string, (m: PortfolioMetrics) => string][] = [
    ["Retorno esperado", (m) => fmtPct(m.expectedReturn, 4)],
    ["Volatilidad", (m) => fmtPct(m.volatility, 4)],
    ["Max drawdown", (m) => fmtPct(m.maxDrawdown, 4)],
    ["Drawdown duración (días est.)", (m) => String(Math.round(18 + m.maxDrawdown * 2.2))],
    ["Retorno / Volatilidad", (m) => (m.expectedReturn / m.volatility).toFixed(2)],
  ];

  const sumRows = summaries
    .map(([label, fn], idx) => {
      const zebra = (ASSET_ALLOCATION.length + idx) % 2 === 0 ? "#f3f0fa" : "#ebe4f5";
      const tds = (["portfolio32", "portfolio33", "portfolio36"] as PFKey[])
        .map((k) => `<td style="padding:9px;text-align:right;font-weight:600">${fn(PORTFOLIO_METRICS[k])}</td>`)
        .join("");
      return `<tr style="background:${zebra};font-size:11px"><td style="padding:9px;font-weight:700">${label}</td>${tds}
      <td colspan="4" style="padding:9px;color:#666;font-size:10px;text-align:right">Modelo ELEMENTO ALPHA</td></tr>`;
    })
    .join("");

  return `
  <thead>
    <tr>
      <th rowspan="2" style="vertical-align:middle;background:${TABLE_HEADER};color:#fff;padding:10px 8px;text-align:left">Activo</th>
      ${headerRankCells}
      <th colspan="4" style="vertical-align:middle;background:${TABLE_HEADER};color:#fff;text-align:center;padding:8px;font-size:11px">Métricas / restricciones (demo)</th>
    </tr>
    <tr>
      <th style="background:${TABLE_HEADER};color:#fff;padding:8px">${PF_LABEL.portfolio32}</th>
      <th style="background:${TABLE_HEADER};color:#fff;padding:8px">${PF_LABEL.portfolio33}</th>
      <th style="background:${TABLE_HEADER};color:#fff;padding:8px">${PF_LABEL.portfolio36}</th>
      <th style="background:${TABLE_HEADER};color:#fff;padding:8px">Retorno hist. ref.</th>
      <th style="background:${TABLE_HEADER};color:#fff;padding:8px">Volatilidad</th>
      <th style="background:${TABLE_HEADER};color:#fff;padding:8px">Duración</th>
      <th style="background:${TABLE_HEADER};color:#fff;padding:8px">Min / Max *</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
    ${sumRows}
  </tbody>`;
}

function globalCss(): string {
  return `
  @page { size: A4 landscape; margin: 12mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1a1a1a; margin: 0; background: #fff; }
  .slide { page-break-after: always; min-height: 100%; padding: 28px 36px 40px; position: relative; }
  .slide:last-child { page-break-after: auto; }
  .footer-mini { position: absolute; bottom: 16px; left: 36px; right: 36px; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #666; border-top: 1px solid #e5e5e5; padding-top: 10px; }
  .footer-mini .mid { flex: 1; text-align: center; font-weight: 600; letter-spacing: .06em; }
  .brand-mark { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, ${BRAND_PURPLE}, ${BRAND_PURPLE_LIGHT}); display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700;font-family:Georgia,serif;}
  .title-cover { font-size: 28px; font-weight: 700; color: ${ACCENT_BLUE}; margin-top: 22vh; text-align: center; }
  .subtitle-cover { font-size: 14px; color: #555; text-align: center; margin-top: 12px; max-width: 520px; margin-left: auto; margin-right: auto; }
  .logo-stack { text-align: center; margin-top: 32px; }
  .company-name { font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 600; letter-spacing: -0.02em; margin-top: 8px;}
  .tagline { font-size: 12px; color: #555; font-style: italic; margin-top: 4px; }
  .team-row { display: flex; flex-wrap: wrap; gap: 16px 24px; justify-content: center; margin-top: 18vh; font-size: 10px; color: #444; max-width: 900px; margin-left: auto; margin-right: auto; }
  .team-row strong { display: block; color: #1a1a1a; }
  .legal { font-size: 7.5px; color: #888; line-height: 1.35; margin: 24px 48px 0; text-align: justify; }
  .h1-slide { text-align: center; font-size: 26px; font-weight: 800; color: ${BRAND_PURPLE_LIGHT}; letter-spacing: .04em; margin: 8px 0 24px; }
  .h2-slide { font-size: 14px; font-weight: 700; border-bottom: 3px solid ${ACCENT_BLUE}; display: inline-block; padding-bottom: 4px; margin-bottom: 16px;}
  ul.check { list-style: none; padding-left: 0; }
  ul.check li { margin: 12px 0; padding-left: 28px; position: relative; color: ${BRAND_PURPLE_LIGHT}; font-size: 13px;}
  ul.check li::before { content: '✓'; position: absolute; left: 0; font-weight: 800; color: ${BRAND_PURPLE_LIGHT}; }
  .scoring-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 20px;}
  .scoring-box { border: 1px solid #ddd; border-radius: 14px; padding: 14px 16px; background: #fafafa; font-size: 11px;}
  .scoring-box h3 { margin: 0 0 10px; font-size: 12px; color: #1a1a1a; }
  .scoring-box ol { margin: 0; padding-left: 18px; color: #444; line-height: 1.65;}
  table.main-table { width: 100%; border-collapse: collapse; font-size: 11px; }
  .pill-ftse { display: inline-flex; align-items:center; gap: 6px; font-size: 9px; background: #1a1a1a; color: #fff; padding: 4px 10px; border-radius: 999px; }
  `.trim();
}

/**
 * Informe multipágina tipo presentación (HTML optimizado para impresión / PDF Cloudflare).
 * Datos: `assetAllocation.json` + `portfolioMetrics.json`.
 */
export function buildBenchmarkReportHtml(): string {
  const date = reportDateLabel();
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width"/>
<title>ELEMENTO ALPHA · Propuesta BMK Ultraliquido · ${escapeHtml(date)}</title>
<style>${globalCss()}</style>
</head>
<body>

<!-- Portada -->
<section class="slide">
  <div style="display:flex;justify-content:space-between;align-items:flex-start">
    <div class="logo-stack" style="flex:1;text-align:left">
       <span class="brand-mark" aria-hidden="true">α</span>
       <div class="company-name">elementoalpha</div>
       <div class="tagline">La habilidad de tomar buenas decisiones</div>
    </div>
    <div class="pill-ftse">Powered By <strong>FTSE Russell</strong></div>
  </div>
  <div class="title-cover">Propuesta BMK Ultraliquido</div>
  <p class="subtitle-cover">Informe ejecutivo demo — generado desde métricas y asignación del proceso Front Office · Elemento Alpha</p>
  <div class="team-row">
    <div><strong>Andrés Palacios</strong>CEO y Co-Fundador<br/>apalacios@elementoalpha.com</div>
    <div><strong>Liss Castro</strong>Analista de fondos y estructuración<br/>lcastro@elementoalpha.com</div>
    <div><strong>Felipe Rincón</strong>Analista cuantitativo</div>
    <div><strong>Nicolás Rodríguez</strong>Coord. fondos · estructuración<br/>nrodriguez@elementoalpha.com</div>
  </div>
  <p class="legal">
    Confidencial. El presente documento contiene información reservada destinada únicamente al destinatario.
    Su reproducción o distribución total o parcial sin autorización está prohibida. Los escenarios cuantitativos se basan en datos modelo de la aplicación demo;
    no constituyen recomendación personalizada ni oferta de valores. ELEMENTO ALPHA S.A.S. — fines informativos (cf. Marco regulatorio aplicable incl. Decreto 2555 de 2010).
  </p>
  <div class="footer-mini">
    <span>${escapeHtml(date)} · elementoalpha.com</span>
    <span class="mid">CONFIDENCIAL Y PRIVADO</span>
    <span style="display:flex;align-items:center;gap:8px"><span class="brand-mark" style="width:22px;height:22px;font-size:11px">α</span> <span class="pill-ftse" style="font-size:8px;margin:0">FTSE Russell</span></span>
  </div>
</section>

<!-- Rebalanceo benchmark -->
<section class="slide">
  <h1 class="h1-slide">REBALANCEO BENCHMARK</h1>
  <p style="font-size:15px;font-weight:700;text-decoration:underline;margin-bottom:8px">
    Portafolios · Propuesta portafolio Ultraliquido
  </p>
  <ul class="check">
    <li>Propuesta nueva de benchmark ultraliquido coherente con la curva modelo y los tres portafolios candidatos (32, 33, 36).</li>
    <li>Validación cualitativa de riesgo y liquidez alineada a mandato institucional (demo).</li>
  </ul>
  <div class="footer-mini">
    <span>${escapeHtml(date)} · elementoalpha.com</span>
    <span class="mid">CONFIDENCIAL Y PRIVADO</span>
    <span style="display:flex;align-items:center;gap:8px"><span class="brand-mark" style="width:22px;height:22px;font-size:11px">α</span> <span class="pill-ftse" style="font-size:8px">FTSE Russell</span></span>
  </div>
</section>

<!-- Frontera -->
<section class="slide">
  <div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid ${ACCENT_BLUE};padding-bottom:8px;margin-bottom:8px">
    <span class="h2-slide" style="border:none;margin:0">Ultraliquido · Frontera y candidatos modelo</span>
    <span style="font-size:12px;color:#555">${escapeHtml(date)}</span>
  </div>
  <div style="display:flex;justify-content:flex-end;margin-bottom:4px;font-size:10px;color:#fff;background:#b8cfe8;padding:8px 12px;border-radius:6px;width:fit-content;margin-left:auto">
    <strong style="color:#1a3550;margin-right:8px">elementoalpha</strong> Ultraliquido BMKs 2026
  </div>
  ${frontierSvg()}
  <p style="font-size:9px;color:#666;line-height:1.4;margin-top:8px">
    <strong>Aviso Legal:</strong> La información contenida fue generada con datos modelo integrados en la demo web de Elemento Alpha.
    No constituye oferta ni recomendación de inversión. Los resultados pueden variar. Consulte a su asesor.
  </p>
  <div class="footer-mini">
    <span>${escapeHtml(date)} · elementoalpha.com</span>
    <span class="mid">CONFIDENCIAL Y PRIVADO</span>
    <span style="display:flex;align-items:center;gap:8px"><span class="brand-mark" style="width:22px;height:22px;font-size:11px">α</span></span>
  </div>
</section>

<!-- Scoring -->
<section class="slide">
  <h1 class="h1-slide" style="font-size:20px;color:#333">Proceso de Optimización · <span style="color:${BRAND_PURPLE};border-bottom:2px solid ${BRAND_PURPLE};padding-bottom:2px">Scoring</span></h1>
  <div class="scoring-grid">
    <div class="scoring-box"><h3>BMK Actual (20%)</h3><ol><li>Up Capture (25%)</li><li>Down Capture (20%)</li><li>Gain Ratio (20%)</li><li>Alpha (25%)</li></ol></div>
    <div class="scoring-box"><h3>Riesgo (20%)</h3><ol><li>Máx. Drawdown (30%)</li><li>Duración drawdown (20%)</li><li>Downside risk (30%)</li><li>Volatilidad (20%)</li></ol></div>
    <div class="scoring-box"><h3>Eficiencia (30%)</h3><ol><li>Retorno ajustado al riesgo (20%)</li><li>Information ratio (20%)</li><li>Sortino (20%)</li><li>Asimetría (20%)</li><li>Curtosis (20%)</li></ol></div>
    <div class="scoring-box"><h3>Desempeño (30%)</h3><ol><li>Retorno esperado (100%)</li></ol></div>
  </div>
  <div style="text-align:center;margin-top:20px;color:${BRAND_PURPLE};font-size:28px;line-height:0">●</div>
  <div class="footer-mini">
    <span>elementoalpha.com</span>
    <span class="mid">CONFIDENCIAL Y PRIVADO</span>
    <span style="display:flex;align-items:center;gap:8px"><span class="brand-mark" style="width:22px;height:22px;font-size:11px">α</span> <span class="pill-ftse" style="font-size:8px">FTSE Russell</span></span>
  </div>
</section>

<!-- Tabla asignaciones -->
<section class="slide">
  <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:10px">
    <h2 style="margin:0;font-size:17px;color:#111">Ultraliquido · Portafolios sugeridos</h2>
    <div style="text-align:right;font-size:11px;">
      ${escapeHtml(date)}<br/>
      <span style="display:inline-block;margin-top:4px;color:#fff;background:#b8cfe8;padding:4px 10px;border-radius:4px;font-size:9px;color:#1a3550;font-weight:600">
        elementoalpha · Ultraliquido BMKs 2026
      </span>
    </div>
  </div>
  <div style="overflow:auto">
    <table class="main-table" border="0">${allocationTableRows()}</table>
  </div>
  <p style="font-size:8px;color:#666;margin-top:10px;line-height:1.35;">
    <strong>Aviso Legal:</strong> Reporte producido por ELEMENTO ALPHA (demo). Pesos calculados desde JSON interno (<code>assetAllocation.json</code> / <code>portfolioMetrics.json</code>). 
    * Columnas complementarias muestran placeholder — pueden conectarse a series históricas y límites de mandato en producción.
  </p>
  <div class="footer-mini">
    <span>${escapeHtml(date)} · elementoalpha.com</span>
    <span class="mid">CONFIDENCIAL Y PRIVADO</span>
    <span style="display:flex;align-items:center;gap:8px"><span class="brand-mark" style="width:22px;height:22px;font-size:11px">α</span></span>
  </div>
</section>

</body>
</html>`;
  return html;
}
