import { useState } from "react";
import { MicIcon, ChevronLeft, Check } from "./icons";
import { useJourneyBrand } from "./brand";

type Props = { go: (n: number) => void; showToast: (msg: string) => void };

const CHANNELS = ["WhatsApp", "Correo", "SMS"] as const;

export function JourneyVinculacion({ go, showToast }: Props) {
  const brand = useJourneyBrand();
  const [fund, setFund] = useState<"a" | "c">("c");
  const [channel, setChannel] = useState(0);
  const [amount, setAmount] = useState("500.000.000");

  const sendLink = () =>
    showToast(`Link enviado a María Helena por ${CHANNELS[channel]}`);

  return (
    <>
      <div className="topbar">
        <div className="tb-left">
          <div className="back">
            <button
              onClick={() => go(2)}
              style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}
            >
              <ChevronLeft width={17} />
              Volver
            </button>
          </div>
        </div>
        <div className="tb-right">
          <div className="voice-pill" onClick={() => go(3)}>
            <MicIcon className="mic" />
            Voz
          </div>
          <div className="avatar">
            <div className="who">
              <b>Carolina Restrepo</b>
              <span>Asesora Senior · Medellín</span>
            </div>
            <div className="pic">CR</div>
          </div>
        </div>
      </div>
      <div className="txn">
        <div className="txn-head">
          <h2>Vinculación y traslado de recursos</h2>
          <p>
            Genera un link seguro para que tu cliente se vincule, contrate el
            fondo y traslade los recursos de apertura — 100% digital.
          </p>
        </div>
        <div className="txn-grid">
          <div className="form-card">
            <div className="steps-mini">
              <div className="smini done"><b>✓</b>Cliente</div>
              <div className="smini done"><b>✓</b>Fondo</div>
              <div className="smini cur"><b>3</b>Monto y envío</div>
              <div className="smini"><b>4</b>Traslado</div>
            </div>
            <div className="fc-body">
              <h3>Fondo seleccionado</h3>
              <div className="pickrow">
                <div className={`pick a${fund === "a" ? " sel" : ""}`} onClick={() => setFund("a")}>
                  <div className="pn">
                    <b>{brand.fundAbiertoShort}</b>
                    <span className="check"><Check /></span>
                  </div>
                  <p>Conservador · Liquidez vista</p>
                </div>
                <div className={`pick c${fund === "c" ? " sel" : ""}`} onClick={() => setFund("c")}>
                  <div className="pn">
                    <b>{brand.fundCxcShort}</b>
                    <span className="check"><Check /></span>
                  </div>
                  <p>Moderado · Pacto 30 días</p>
                </div>
              </div>

              <div className="frow">
                <label>Cliente</label>
                <input className="input" value="María Helena Ríos Ocampo · C.C. 43.118.902" readOnly />
              </div>
              <div className="frow">
                <label>Monto de apertura</label>
                <div className="amount">
                  <span className="cur">$</span>
                  <input className="input" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div className="hint-line">
                  <Check width={12} />
                  {`Supera el mínimo de apertura del ${brand.fundCxcShort}`}
                </div>
              </div>

              <div className="frow">
                <label>Enviar link por</label>
                <div className="send-opts">
                  {CHANNELS.map((c, i) => (
                    <div key={c} className={`sopt${channel === i ? " sel" : ""}`} onClick={() => setChannel(i)}>
                      {i === 0 && (
                        <svg viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.4 8.4 0 0 1-12 7.6L3 21l1.9-6A8.4 8.4 0 1 1 21 11.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
                      )}
                      {i === 1 && (
                        <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" /><path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                      )}
                      {i === 2 && (
                        <svg viewBox="0 0 24 24" fill="none"><rect x="6" y="3" width="12" height="18" rx="2.5" stroke="currentColor" strokeWidth="2" /><path d="M11 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                      )}
                      {c}
                    </div>
                  ))}
                </div>
              </div>

              <div className="linkbox">
                <svg viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                <span>{`${brand.vinculationHost}/vincular/cxc?t=9f2a…b7`}</span>
                <button onClick={() => showToast("Link copiado al portapapeles")}>Copiar</button>
              </div>
            </div>
            <div className="fc-foot">
              <button className="btn ghost" onClick={() => go(2)}>Cancelar</button>
              <button className="btn green" onClick={sendLink}>
                Enviar link de vinculación
                <svg viewBox="0 0 24 24" width={16} fill="none"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>

          <div>
            <div className="preview">
              <div className="pv-h">
                <svg viewBox="0 0 24 24" width={15} fill="none" style={{ color: "var(--cyan-d)" }}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /></svg>
                Lo que recibe el cliente
              </div>
              <div className="phone">
                <div className="ph-top">
                  <div className="logo lg">
                    <brand.Logo navy="#fff" style={{ width: 24, height: 21 }} />
                    <span className="name" style={{ fontSize: 14 }}>{brand.shortName}</span>
                  </div>
                  <h4>Hola María Helena 👋</h4>
                  <p>{`Carolina te invita a abrir tu inversión en el ${brand.fundCxcShort}`}</p>
                </div>
                <div className="ph-body">
                  <div className="ph-step"><span className="n">1</span>Verifica tu identidad</div>
                  <div className="ph-step"><span className="n">2</span>Firma el contrato del fondo</div>
                  <div className="ph-step"><span className="n">3</span>Traslada tus recursos (PSE)</div>
                  <div className="ph-amt">
                    <span>Monto de apertura</span>
                    <b>${amount}</b>
                  </div>
                  <div className="ph-cta">Abrir mi inversión →</div>
                </div>
              </div>
            </div>

            <div className="tracker">
              <h3>Estado de la apertura</h3>
              <div className="trk">
                <div className="tk ok">
                  <span className="d"><Check /></span>
                  <b>Link enviado por {CHANNELS[channel]}</b>
                  <span>Hoy, 10:42 a.m.</span>
                </div>
                <div className="tk now">
                  <span className="d" />
                  <b>Cliente diligenciando vinculación</b>
                  <span>KYC / SARLAFT en curso</span>
                </div>
                <div className="tk pend">
                  <span className="d" />
                  <b>Firma del contrato</b>
                  <span>Firma electrónica certificada</span>
                </div>
                <div className="tk pend">
                  <span className="d" />
                  <b>Traslado de recursos (PSE)</b>
                  <span>${amount}</span>
                </div>
                <div className="tk pend">
                  <span className="d" />
                  <b>Cuenta del fondo activa</b>
                  <span>Confirmación al asesor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
