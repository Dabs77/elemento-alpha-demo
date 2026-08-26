import { MicIcon, ChevronLeft, ArrowRight, CheckCircle, BellIcon } from "./icons";
import { useJourneyBrand } from "./brand";

type Props = { go: (n: number) => void };

function Win({ side }: { side: "a" | "c" }) {
  return (
    <td className={`win ${side}`}>
      <CheckCircle />
    </td>
  );
}

export function JourneyComparativa({ go }: Props) {
  const brand = useJourneyBrand();
  return (
    <div className="cmp">
      <div className="cmp-head">
        <div className="back">
          <button onClick={() => go(1)}>
            <ChevronLeft width={17} />
            Volver
          </button>
          <h2>Asesoría Especializada de Fondos</h2>
        </div>
        <div className="actions">
          <button className="alerts" aria-label="Alertas">
            <BellIcon />
          </button>
          <div className="voice-pill" onClick={() => go(3)}>
            <MicIcon className="mic" />
            Voz
          </div>
        </div>
      </div>
      <div className="tabs">
        <button className="tabbtn">
          <svg viewBox="0 0 24 24" width={16} fill="none">
            <path d="M16 18v-2a4 4 0 0 0-8 0v2M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" strokeWidth="2" />
          </svg>
          Cliente Existente
        </button>
        <button className="tabbtn on">
          <svg viewBox="0 0 24 24" width={16} fill="none">
            <path d="M15 18v-2a4 4 0 0 0-7-2.6M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 8v6M22 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Cliente Nuevo
        </button>
      </div>

      <div className="cmp-body">
        <div className="ai-chip">
          <div className="orb" />
          <div className="tx">
            <b>Sugerencia del asistente</b>
            <p>
              Para <em>Inversiones El Poblado</em> (caja disponible a 90 días,
              perfil moderado) recomiendo <em>{brand.fundCxcShort}</em>: +140 pbs de
              rentabilidad y menos días negativos. ¿Quieres que prepare la
              propuesta?
            </p>
          </div>
        </div>

        <div className="intro">
          <h3>Comparativa de Fondos</h3>
            <p>
              {`Compare las características, rentabilidades y riesgos de ${brand.fundAbiertoShort} vs ${brand.fundCxcShort} para determinar la mejor opción según el perfil del cliente.`}
            </p>
        </div>

        <div className="funds">
          <div className="fund a">
            <div className="fh">
              <div>
                <h3>{brand.fundAbiertoName}</h3>
                <p>{brand.fundAbiertoKind}</p>
              </div>
              <span className="badge cons">Conservador</span>
            </div>
            <div className="mini">
              <div className="mtile">
                <div className="ml">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M3 17l6-6 4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  AUMs
                </div>
                <div className="mv">$8.76 billones</div>
              </div>
              <div className="mtile">
                <div className="ml">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M12 2 4 6v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
                  Calificación
                </div>
                <div className="mv">AAA / 2+</div>
              </div>
              <div className="mtile">
                <div className="ml">
                  <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  Liquidez
                </div>
                <div className="mv">Vista</div>
              </div>
              <div className="mtile">
                <div className="ml">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M4 20V8M10 20V4M16 20v-8M22 20H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  Duración
                </div>
                <div className="mv">135 días</div>
              </div>
            </div>
            <div className="sect-lbl">Rentabilidad</div>
            <div className="drow">Último Mes<b className="v-pos">10.03% E.A.</b></div>
            <div className="drow">Año Corrido<b className="v-pos">7.54% E.A.</b></div>
            <div className="drow">Últimos 3 Años<b className="v-pos">9.16% E.A.</b></div>
            <div className="sect-lbl" style={{ marginTop: 14 }}>Riesgo</div>
            <div className="drow">Volatilidad YTD<b className="v-ink">0.32%</b></div>
            <div className="drow">Días Negativos YTD<b className="v-warn">10 días</b></div>
            <div className="drow">Meses Neg. (8 años)<b className="v-warn">9 meses</b></div>
          </div>
          <div className="fund c">
            <div className="fh">
              <div>
                <h3>{brand.fundCxcName}</h3>
                <p>{brand.fundCxcKind}</p>
              </div>
              <span className="badge mod">Moderado</span>
            </div>
            <div className="mini">
              <div className="mtile">
                <div className="ml">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M3 17l6-6 4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  AUMs
                </div>
                <div className="mv">$5.55 billones</div>
              </div>
              <div className="mtile">
                <div className="ml">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M12 2 4 6v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
                  Calificación
                </div>
                <div className="mv">AAA / VrM 1</div>
              </div>
              <div className="mtile">
                <div className="ml">
                  <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  Liquidez
                </div>
                <div className="mv">30 días</div>
              </div>
              <div className="mtile">
                <div className="ml">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M4 20V8M10 20V4M16 20v-8M22 20H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  Duración
                </div>
                <div className="mv">540 días (1.48 a)</div>
              </div>
            </div>
            <div className="sect-lbl">Rentabilidad</div>
            <div className="drow">Último Mes<b className="v-pos">10.71% E.A.</b></div>
            <div className="drow">Año Corrido<b className="v-pos">9.37% E.A.</b></div>
            <div className="drow">Últimos 3 Años<b className="v-pos">10.59% E.A.</b></div>
            <div className="sect-lbl" style={{ marginTop: 14 }}>Riesgo</div>
            <div className="drow">Volatilidad YTD<b className="v-pos">0.31%</b></div>
            <div className="drow">Días Negativos YTD<b className="v-pos">6 días</b></div>
            <div className="drow">Meses Neg. (8 años)<b className="v-pos">0 meses</b></div>
          </div>
        </div>

        <div className="block">
          <div className="bh">
            <h3>Tabla Comparativa Detallada</h3>
          </div>
          <table className="cmp-tbl">
            <thead>
              <tr>
                <th>Métrica</th>
                <th className="h-a">{brand.fundAbiertoShort}</th>
                <th className="h-c">{brand.fundCxcShort}</th>
                <th>Mejor</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Estrategia</td><td>Money Market (150-300 días)</td><td>Alternativos + liquidez + RF short</td><td className="tie">—</td></tr>
              <tr><td>AUMs</td><td className="b-a">$8.76 Bn</td><td>$5.55 Bn</td><Win side="a" /></tr>
              <tr><td>Calificación Crédito</td><td>AAA (BRC)</td><td>AAA (V&amp;R)</td><td className="tie">—</td></tr>
              <tr><td>Calificación Mercado</td><td>2+</td><td className="b-c">VrM 1</td><Win side="c" /></tr>
              <tr><td>Liquidez</td><td className="b-a">Vista</td><td>Pacto 30 días</td><Win side="a" /></tr>
              <tr><td>Duración Activo</td><td>135 días</td><td>540 días</td><td className="tie">—</td></tr>
              <tr><td>Rent. Último Mes</td><td>10.03% E.A.</td><td className="b-c">10.71% E.A.</td><Win side="c" /></tr>
              <tr><td>Rent. Año Corrido</td><td>7.54% E.A.</td><td className="b-c">9.37% E.A.</td><Win side="c" /></tr>
              <tr><td>Rent. Últimos 3 Años</td><td>9.16% E.A.</td><td className="b-c">10.59% E.A.</td><Win side="c" /></tr>
              <tr><td>Volatilidad YTD</td><td>0.32%</td><td className="b-c">0.31%</td><Win side="c" /></tr>
              <tr><td>Días Negativos YTD</td><td>10 días</td><td className="b-c">6 días</td><Win side="c" /></tr>
              <tr><td>Meses Negativos (8 años)</td><td>9 meses</td><td className="b-c">0 meses</td><Win side="c" /></tr>
            </tbody>
          </table>
        </div>

        <div className="block">
          <div className="bh">
            <h3>{`Composición ${brand.fundCxcShort} · Activos Alternativos`}</h3>
            <p>
              {`El ${brand.fundCxcShort} se diferencia por su exposición a Derechos de Crédito (DCE), incluyendo libranzas y sentencias con cargo al Presupuesto General de la Nación (riesgo cuasi-soberano).`}
            </p>
          </div>
          <div className="comp-grid">
            <div>
              <div className="cl">Por tipo de activo</div>
              <div className="brow"><span className="nm">NR (No Rating)</span><span className="track"><i style={{ width: "47.9%", background: "var(--cxc)" }} /></span><span className="pct">47.9%</span></div>
              <div className="brow"><span className="nm">AAA</span><span className="track"><i style={{ width: "28.3%", background: "var(--cxc)" }} /></span><span className="pct">28.3%</span></div>
              <div className="brow"><span className="nm">Riesgo Nación</span><span className="track"><i style={{ width: "17.2%", background: "var(--cxc)" }} /></span><span className="pct">17.2%</span></div>
              <div className="brow"><span className="nm">NR Internacional</span><span className="track"><i style={{ width: "3.7%", background: "var(--cxc)" }} /></span><span className="pct">3.7%</span></div>
              <div className="brow"><span className="nm">Otros</span><span className="track"><i style={{ width: "2.9%", background: "var(--cxc)" }} /></span><span className="pct">2.9%</span></div>
            </div>
            <div>
              <div className="cl">Por sector</div>
              <div className="brow"><span className="nm">Sector Financiero</span><span className="track"><i style={{ width: "49.9%", background: "var(--warn)" }} /></span><span className="pct">49.9%</span></div>
              <div className="brow"><span className="nm">Otros (DCE)</span><span className="track"><i style={{ width: "25%", background: "var(--warn)" }} /></span><span className="pct">25.0%</span></div>
              <div className="brow"><span className="nm">Entidades Públicas</span><span className="track"><i style={{ width: "17.2%", background: "var(--warn)" }} /></span><span className="pct">17.2%</span></div>
              <div className="brow"><span className="nm">Sector Real</span><span className="track"><i style={{ width: "7.9%", background: "var(--warn)" }} /></span><span className="pct">7.9%</span></div>
            </div>
          </div>
        </div>

        <div className="stress">
          <div className="l">
            <span className="warn-ic">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <div>
              <b>Estrés Histórico</b>
              <p>8 episodios de estrés analizados (Ene 2017 – Mar 2026)</p>
            </div>
          </div>
          <div className="r">
            <span>🛡 <b className="g">6</b> Sugerido</span>
            <span style={{ color: "var(--line)" }}>|</span>
            <span><b className="b">2</b> Actual</span>
            <svg viewBox="0 0 24 24" width={18} fill="none" style={{ color: "var(--muted)" }}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
        </div>

        <div className="reco">
          <h3>Recomendación</h3>
          <div className="reco-cols">
            <div className="reco-card a">
              <h4>{`${brand.fundAbiertoShort} es ideal para:`}</h4>
              <ul>
                <li>Clientes que requieren liquidez inmediata</li>
                <li>Perfil conservador que prioriza disponibilidad</li>
                <li>Tesorería corporativa con necesidades de caja</li>
                <li>Inversionistas que no pueden comprometer plazos</li>
              </ul>
            </div>
            <div className="reco-card c">
              <h4>{`${brand.fundCxcShort} es ideal para:`}</h4>
              <ul>
                <li>Clientes que buscan mayor rentabilidad</li>
                <li>Perfil moderado con horizonte mínimo 30 días</li>
                <li>Exposición a activos alternativos (DCE)</li>
                <li>Menor volatilidad y días negativos históricos</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="cmp-foot">
          <button className="btn ghost" onClick={() => go(3)}>
            <MicIcon width={16} />
            Consultar al asistente
          </button>
          <button className="btn green" onClick={() => go(4)}>
            {`Vincular cliente a ${brand.fundCxcShort}`}
            <ArrowRight width={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
