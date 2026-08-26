import { MicIcon, ArrowRight, ChevronRight, BellIcon } from "./icons";
import { useJourneyBrand } from "./brand";

type Props = { go: (n: number) => void };

export function JourneyDashboard({ go }: Props) {
  const brand = useJourneyBrand();
  return (
    <>
      <div className="topbar">
        <div className="tb-left">
          <div className="logo">
            <brand.Logo style={{ width: 28, height: 24 }} />
            <span className="name" style={{ fontSize: 16 }}>
              {brand.productName}
            </span>
          </div>
          <nav className="tb-nav">
            <a className="cur">Inicio</a>
            <a onClick={() => go(2)}>Fondos</a>
            <a onClick={() => go(4)}>Vinculación</a>
            <a>Pipeline</a>
          </nav>
        </div>
        <div className="tb-right">
          <div className="voice-pill" onClick={() => go(3)}>
            <MicIcon className="mic" />
            Voz
          </div>
          <button className="alerts" aria-label="Alertas">
            <BellIcon />
          </button>
          <div className="avatar">
            <div className="who">
              <b>Carolina Restrepo</b>
              <span>Asesora Senior · Medellín</span>
            </div>
            <div className="pic">CR</div>
          </div>
        </div>
      </div>
      <div className="dash">
        <div className="hello">
          <div>
            <h2>
              Hola, <span>Carolina</span> 👋
            </h2>
            <p>
              Vas <b style={{ color: "var(--cxc-d)" }}>67%</b> de tu meta de
              captación. Tienes 3 clientes listos para vincular este mes.
            </p>
          </div>
          <button className="btn dark sm" onClick={() => go(2)}>
            Abrir asesoría de fondos
            <ArrowRight width={16} />
          </button>
        </div>

        <div className="kpis">
          <div className="kpi">
            <div className="top">
              <span className="ic" style={{ background: "var(--cxc-bg)" }}>
                <svg viewBox="0 0 24 24" fill="none" style={{ color: "var(--cxc-d)" }}>
                  <path d="M3 17l6-6 4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 7v5M21 7h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <span className="delta up">+12%</span>
            </div>
            <div className="val">$1.680 MM</div>
            <div className="lbl">Captación · meta $2.500 MM</div>
            <div className="bar">
              <i style={{ width: "67%", background: "var(--cxc)" }} />
            </div>
          </div>
          <div className="kpi">
            <div className="top">
              <span className="ic" style={{ background: "var(--abierto-bg)" }}>
                <svg viewBox="0 0 24 24" fill="none" style={{ color: "var(--abierto)" }}>
                  <path d="M16 18v-2a4 4 0 0 0-8 0v2M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <span className="delta up">8 / 12</span>
            </div>
            <div className="val">8</div>
            <div className="lbl">Clientes nuevos vinculados</div>
            <div className="bar">
              <i style={{ width: "67%", background: "var(--abierto)" }} />
            </div>
          </div>
          <div className="kpi">
            <div className="top">
              <span className="ic" style={{ background: "#FEF3C7" }}>
                <svg viewBox="0 0 24 24" fill="none" style={{ color: "#B45309" }}>
                  <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <span className="delta up">14 / 20</span>
            </div>
            <div className="val">14</div>
            <div className="lbl">Reuniones de cierre</div>
            <div className="bar">
              <i style={{ width: "70%", background: "var(--warn)" }} />
            </div>
          </div>
          <div className="kpi">
            <div className="top">
              <span className="ic" style={{ background: "#EAF6FC" }}>
                <svg viewBox="0 0 24 24" fill="none" style={{ color: "var(--cyan-d)" }}>
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <span className="delta up">+5 pts</span>
            </div>
            <div className="val">34%</div>
            <div className="lbl">Tasa de conversión</div>
            <div className="bar">
              <i style={{ width: "34%", background: "var(--cyan)" }} />
            </div>
          </div>
        </div>

        <div className="grid2">
          <div className="panel">
            <div className="ph">
              <h3>Mis clientes</h3>
              <a onClick={() => go(2)}>Ver todos →</a>
            </div>
            <div className="clients">
              <div className="crow" onClick={() => go(2)}>
                <div className="cname">
                  <div className="cav" style={{ background: "linear-gradient(135deg,#10B981,#059669)" }}>MR</div>
                  <div>
                    <b>María Helena Ríos</b>
                    <span>HNW · Persona Natural</span>
                  </div>
                </div>
                <div className="status st-vinc">Vinculada</div>
                <div className="cmonto">
                  $1.200 MM<span>{brand.fundCxcShort}</span>
                </div>
                <ChevronRight className="chev" />
              </div>
              <div className="crow" onClick={() => go(2)}>
                <div className="cname">
                  <div className="cav" style={{ background: "linear-gradient(135deg,#2563EB,#1D4ED8)" }}>IP</div>
                  <div>
                    <b>Inversiones El Poblado S.A.S.</b>
                    <span>Corporativo</span>
                  </div>
                </div>
                <div className="status st-perf">En perfilamiento</div>
                <div className="cmonto">
                  $800 MM<span>por definir</span>
                </div>
                <ChevronRight className="chev" />
              </div>
              <div className="crow" onClick={() => go(2)}>
                <div className="cname">
                  <div className="cav" style={{ background: "linear-gradient(135deg,#0E2A4E,#14315F)" }}>CA</div>
                  <div>
                    <b>Cooperativa de Antioquia</b>
                    <span>Institucional</span>
                  </div>
                </div>
                <div className="status st-pros">Prospecto</div>
                <div className="cmonto">
                  $3.500 MM<span>oportunidad</span>
                </div>
                <ChevronRight className="chev" />
              </div>
              <div className="crow" onClick={() => go(4)}>
                <div className="cname">
                  <div className="cav" style={{ background: "linear-gradient(135deg,#00A0DC,#0086BC)" }}>JM</div>
                  <div>
                    <b>Juan David Mejía</b>
                    <span>Persona Natural</span>
                  </div>
                </div>
                <div className="status st-kyc">KYC pendiente</div>
                <div className="cmonto">
                  $150 MM<span>listo p/ link</span>
                </div>
                <ChevronRight className="chev" />
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="ph">
              <h3>Objetivos del mes</h3>
              <span style={{ fontSize: "11.5px", color: "var(--muted)" }}>Marzo 2026</span>
            </div>
            <div className="side-card">
              <div className="obj">
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
                <div>
                  <b>Cerrar 3 vinculaciones pendientes</b>
                  <p>Juan David Mejía, Textiles Medellín y 1 más antes del cierre de mes.</p>
                </div>
              </div>
              <div className="obj">
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M3 12h4l3 8 4-16 3 8h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <b>{`Migrar tesorerías a ${brand.fundCxcShort}`}</b>
                  <p>{`2 clientes corporativos con caja >30 días: +140 pbs vs ${brand.fundAbiertoShort}.`}</p>
                </div>
              </div>
              <div className="obj">
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 2 4 6v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <b>Reperfilar Cooperativa de Antioquia</b>
                  <p>Aplicar test de idoneidad → oportunidad institucional de $3.500 MM.</p>
                </div>
              </div>
            </div>
            <div style={{ padding: "0 18px 18px" }}>
              <div className="cta-banner">
                <span className="ic">
                  <MicIcon />
                </span>
                <div>
                  <b>¿Dudas sobre un fondo?</b>
                  <p>Pregúntale al asistente por voz</p>
                </div>
                <button className="btn sm" onClick={() => go(3)}>
                  Hablar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
