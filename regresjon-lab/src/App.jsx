import { useState, useMemo, useCallback } from "react";

function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

function generateData(n, controls, seed = 42) {
  const rng = seededRandom(seed);
  const gauss = () => {
    let u = 0, v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };
  const data = [];
  for (let i = 0; i < n; i++) {
    const alder = 16 + Math.floor(rng() * 45);
    const utdanning = Math.min(5, Math.max(1, Math.round(1 + alder * 0.06 + gauss() * 0.8)));
    const politiskInteresse = Math.min(10, Math.max(0, Math.round(3 + utdanning * 1.2 + gauss() * 1.5)));
    const skjermtid = Math.max(0.5, 6 - alder * 0.05 + gauss() * 1.5);
    const nyhetskonsum = Math.max(0, Math.min(10, 1.5 + utdanning * 0.8 + politiskInteresse * 0.3 + alder * 0.04 + gauss() * 1.2));
    const tillit = Math.max(0, Math.min(10, 2.0 + utdanning * 0.7 + politiskInteresse * 0.2 - skjermtid * 0.3 + alder * 0.03 + gauss() * 1.0));
    const sosialemedier = Math.max(0, Math.min(10, 7 - alder * 0.08 + skjermtid * 0.5 + gauss() * 1.2));
    data.push({ alder, utdanning, politiskInteresse, skjermtid, nyhetskonsum, tillit, sosialemedier });
  }
  return data;
}

function linearRegression(data, xKey, yKey, controlKeys = []) {
  const n = data.length;
  if (n < 3) return { slope: 0, intercept: 0, r2: 0, coefficients: {} };
  const keys = [xKey, ...controlKeys];
  const k = keys.length;
  const X = data.map(d => [1, ...keys.map(key => d[key])]);
  const y = data.map(d => d[yKey]);
  const XtX = Array.from({ length: k + 1 }, (_, i) =>
    Array.from({ length: k + 1 }, (_, j) => X.reduce((sum, row) => sum + row[i] * row[j], 0))
  );
  const Xty = Array.from({ length: k + 1 }, (_, i) => X.reduce((sum, row, idx) => sum + row[i] * y[idx], 0));
  const aug = XtX.map((row, i) => [...row, Xty[i]]);
  const m = aug.length;
  for (let col = 0; col < m; col++) {
    let maxRow = col;
    for (let row = col + 1; row < m; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
    if (Math.abs(aug[col][col]) < 1e-10) continue;
    for (let row = 0; row < m; row++) {
      if (row === col) continue;
      const factor = aug[row][col] / aug[col][col];
      for (let j = col; j <= m; j++) aug[row][j] -= factor * aug[col][j];
    }
  }
  const beta = aug.map((row, i) => row[m] / row[i]);
  const yMean = y.reduce((a, b) => a + b, 0) / n;
  const yPred = X.map(row => row.reduce((sum, xi, i) => sum + xi * beta[i], 0));
  const ssRes = y.reduce((sum, yi, i) => sum + (yi - yPred[i]) ** 2, 0);
  const ssTot = y.reduce((sum, yi) => sum + (yi - yMean) ** 2, 0);
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
  const coefficients = {};
  keys.forEach((key, i) => { coefficients[key] = beta[i + 1]; });
  return { slope: beta[1], intercept: beta[0], r2: Math.max(0, r2), coefficients };
}

const VARIABLES = {
  sosialemedier: { label: "Sosiale medier-bruk", emoji: "📱", color: "#e84393", desc: "Timer per dag på sosiale medier" },
  tillit: { label: "Tillit til nyhetsmedier", emoji: "🛡️", color: "#0984e3", desc: "Selvrapportert tillit (0–10)" },
  alder: { label: "Alder", emoji: "🎂", color: "#6c5ce7", desc: "År" },
  utdanning: { label: "Utdanningsnivå", emoji: "🎓", color: "#00b894", desc: "1=grunnskole → 5=master+" },
  politiskInteresse: { label: "Politisk interesse", emoji: "🗳️", color: "#fdcb6e", desc: "Selvrapportert (0–10)" },
  skjermtid: { label: "Total skjermtid", emoji: "💻", color: "#e17055", desc: "Timer per dag totalt" },
  nyhetskonsum: { label: "Nyhetskonsum", emoji: "📰", color: "#00cec9", desc: "Nyhetsartikler per uke (0–10)" },
};

const SCENARIOS = [
  {
    id: "spurious", title: "Spuriøs korrelasjon",
    subtitle: "Gjør sosiale medier at folk mister tillit til nyheter?",
    x: "sosialemedier", y: "tillit",
    suggestedControls: ["alder", "utdanning"],
    explanation: (before, after) => {
      const change = Math.abs(after.slope) < Math.abs(before.slope) ? "svekkes" : "styrkes";
      return `Uten kontrollvariabler ser det ut som sosiale medier-bruk reduserer tillit til nyhetsmedier (β = ${before.slope.toFixed(2)}). Men når du kontrollerer for alder og utdanning, ${change} sammenhengen (β = ${after.slope.toFixed(2)}). Alder er en konfunderende variabel: yngre bruker mer sosiale medier OG har lavere tillit — men det betyr ikke at det ene forårsaker det andre.`;
    },
  },
  {
    id: "mediation", title: "Mediering",
    subtitle: "Påvirker utdanning nyhetskonsum — direkte eller via politisk interesse?",
    x: "utdanning", y: "nyhetskonsum",
    suggestedControls: ["politiskInteresse"],
    explanation: (before, after) => {
      return `Utdanning har en sterk sammenheng med nyhetskonsum (β = ${before.slope.toFixed(2)}). Når du kontrollerer for politisk interesse, synker effekten (β = ${after.slope.toFixed(2)}). Det tyder på at deler av effekten av utdanning medieres gjennom politisk interesse — utdanning øker politisk interesse, som igjen øker nyhetskonsum.`;
    },
  },
  {
    id: "fritt", title: "Fritt valg",
    subtitle: "Velg X og Y selv og utforsk!",
    x: "sosialemedier", y: "nyhetskonsum",
    suggestedControls: [],
    explanation: () => "Utforsk fritt hvordan ulike kontrollvariabler endrer sammenhengen mellom variablene du har valgt.",
  },
];

function ScatterPlot({ data, xKey, yKey, regression, width = 500, height = 340 }) {
  const xVar = VARIABLES[xKey];
  const yVar = VARIABLES[yKey];
  const pad = { top: 30, right: 30, bottom: 50, left: 55 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;
  const xVals = data.map(d => d[xKey]);
  const yVals = data.map(d => d[yKey]);
  const xMin = Math.min(...xVals) - 0.5;
  const xMax = Math.max(...xVals) + 0.5;
  const yMin = Math.min(...yVals) - 0.5;
  const yMax = Math.max(...yVals) + 0.5;
  const sx = v => pad.left + ((v - xMin) / (xMax - xMin)) * w;
  const sy = v => pad.top + h - ((v - yMin) / (yMax - yMin)) * h;
  const keys = Object.keys(regression.coefficients || {});
  const controlKeys = keys.filter(k => k !== xKey);
  let adjIntercept = regression.intercept;
  controlKeys.forEach(ck => {
    const mean = data.reduce((s, d) => s + d[ck], 0) / data.length;
    adjIntercept += (regression.coefficients[ck] || 0) * mean;
  });
  const adjY1 = adjIntercept + regression.slope * xMin;
  const adjY2 = adjIntercept + regression.slope * xMax;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", maxWidth: width }}>
      {Array.from({ length: 6 }, (_, i) => {
        const v = yMin + (i / 5) * (yMax - yMin);
        return <line key={`gy${i}`} x1={pad.left} x2={width - pad.right} y1={sy(v)} y2={sy(v)} stroke="#2d3436" strokeOpacity={0.15} />;
      })}
      {Array.from({ length: 6 }, (_, i) => {
        const v = xMin + (i / 5) * (xMax - xMin);
        return <line key={`gx${i}`} x1={sx(v)} x2={sx(v)} y1={pad.top} y2={pad.top + h} stroke="#2d3436" strokeOpacity={0.15} />;
      })}
      {data.map((d, i) => (
        <circle key={i} cx={sx(d[xKey])} cy={sy(d[yKey])} r={3.5}
          fill={xVar.color} fillOpacity={0.45} stroke={xVar.color} strokeOpacity={0.7} strokeWidth={0.8} />
      ))}
      <line x1={sx(xMin)} y1={sy(adjY1)} x2={sx(xMax)} y2={sy(adjY2)}
        stroke={yVar.color} strokeWidth={2.5}
        strokeDasharray={controlKeys.length > 0 ? "6,4" : "none"} />
      <line x1={pad.left} x2={width - pad.right} y1={pad.top + h} y2={pad.top + h} stroke="#636e72" strokeWidth={1.2} />
      <line x1={pad.left} x2={pad.left} y1={pad.top} y2={pad.top + h} stroke="#636e72" strokeWidth={1.2} />
      <text x={pad.left + w / 2} y={height - 6} textAnchor="middle" fontSize="12" fill="#636e72" fontFamily="'DM Sans', sans-serif">
        {xVar.emoji} {xVar.label}
      </text>
      <text x={14} y={pad.top + h / 2} textAnchor="middle" fontSize="12" fill="#636e72" fontFamily="'DM Sans', sans-serif" transform={`rotate(-90, 14, ${pad.top + h / 2})`}>
        {yVar.emoji} {yVar.label}
      </text>
      {[0, 0.5, 1].map(f => {
        const v = xMin + f * (xMax - xMin);
        return <text key={`xt${f}`} x={sx(v)} y={pad.top + h + 18} textAnchor="middle" fontSize="10" fill="#b2bec3" fontFamily="'JetBrains Mono', monospace">{v.toFixed(1)}</text>;
      })}
      {[0, 0.5, 1].map(f => {
        const v = yMin + f * (yMax - yMin);
        return <text key={`yt${f}`} x={pad.left - 8} y={sy(v) + 4} textAnchor="end" fontSize="10" fill="#b2bec3" fontFamily="'JetBrains Mono', monospace">{v.toFixed(1)}</text>;
      })}
    </svg>
  );
}

function StatBox({ label, value, sub, color }) {
  return (
    <div style={{
      background: `${color}11`, border: `1px solid ${color}33`,
      borderRadius: 10, padding: "10px 14px", minWidth: 90, textAlign: "center", flex: "1 1 90px",
    }}>
      <div style={{ fontSize: 11, color: "#636e72", fontFamily: "'DM Sans', sans-serif", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: "#b2bec3", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function RegressionExplorer() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [xVar, setXVar] = useState("sosialemedier");
  const [yVar, setYVar] = useState("tillit");
  const [controls, setControls] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [sampleSize, setSampleSize] = useState(200);

  const scenario = SCENARIOS[scenarioIdx];
  const data = useMemo(() => generateData(sampleSize, controls, 42), [sampleSize]);
  const effectiveX = scenario.id === "fritt" ? xVar : scenario.x;
  const effectiveY = scenario.id === "fritt" ? yVar : scenario.y;
  const availableControls = Object.keys(VARIABLES).filter(k => k !== effectiveX && k !== effectiveY);
  const regBase = useMemo(() => linearRegression(data, effectiveX, effectiveY, []), [data, effectiveX, effectiveY]);
  const regControlled = useMemo(() => linearRegression(data, effectiveX, effectiveY, controls), [data, effectiveX, effectiveY, controls]);

  const toggleControl = useCallback((key) => {
    setControls(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    setShowExplanation(false);
  }, []);

  const handleScenario = (idx) => {
    setScenarioIdx(idx);
    setControls([]);
    setShowExplanation(false);
    if (SCENARIOS[idx].id !== "fritt") { setXVar(SCENARIOS[idx].x); setYVar(SCENARIOS[idx].y); }
  };

  const slopeChange = regBase.slope !== 0 ? ((regControlled.slope - regBase.slope) / Math.abs(regBase.slope)) * 100 : 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(165deg, #0a0a12 0%, #141428 40%, #1a1a2e 100%)",
      color: "#dfe6e9", fontFamily: "'DM Sans', sans-serif", padding: "24px 16px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;700&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 900, margin: "0 auto 28px", textAlign: "center" }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 5vw, 38px)", fontWeight: 900,
          background: "linear-gradient(135deg, #e84393, #6c5ce7, #0984e3)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          margin: "0 0 6px", letterSpacing: "-0.5px",
        }}>Kontrollvariabel-laboratoriet</h1>
        <p style={{ color: "#b2bec3", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
          Utforsk hvordan tredje variabler endrer sammenhengen mellom to variabler i en regresjonsanalyse.
          <br />Datasettet simulerer en spørreundersøkelse om mediebruk og tillit (n={sampleSize}).
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {SCENARIOS.map((s, i) => (
            <button key={s.id} onClick={() => handleScenario(i)} style={{
              flex: 1, minWidth: 140, padding: "12px 14px",
              background: scenarioIdx === i ? "rgba(108, 92, 231, 0.2)" : "rgba(255,255,255,0.04)",
              border: scenarioIdx === i ? "1.5px solid #6c5ce7" : "1.5px solid rgba(255,255,255,0.08)",
              borderRadius: 10, color: scenarioIdx === i ? "#a29bfe" : "#b2bec3",
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13,
              fontWeight: scenarioIdx === i ? 700 : 500, textAlign: "left", transition: "all 0.2s",
            }}>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>{s.title}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>{s.subtitle}</div>
            </button>
          ))}
        </div>

        {scenario.id === "fritt" && (
          <div style={{
            display: "flex", gap: 16, marginBottom: 18, flexWrap: "wrap",
            padding: 14, background: "rgba(255,255,255,0.03)", borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={{ fontSize: 11, color: "#b2bec3", display: "block", marginBottom: 4 }}>X-variabel (uavhengig)</label>
              <select value={xVar} onChange={e => { setXVar(e.target.value); setControls(c => c.filter(k => k !== e.target.value)); }}
                style={{ width: "100%", padding: "8px 10px", background: "#1a1a2e", color: "#dfe6e9", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                {Object.entries(VARIABLES).filter(([k]) => k !== yVar).map(([k, v]) => (
                  <option key={k} value={k}>{v.emoji} {v.label}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={{ fontSize: 11, color: "#b2bec3", display: "block", marginBottom: 4 }}>Y-variabel (avhengig)</label>
              <select value={yVar} onChange={e => { setYVar(e.target.value); setControls(c => c.filter(k => k !== e.target.value)); }}
                style={{ width: "100%", padding: "8px 10px", background: "#1a1a2e", color: "#dfe6e9", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                {Object.entries(VARIABLES).filter(([k]) => k !== xVar).map(([k, v]) => (
                  <option key={k} value={k}>{v.emoji} {v.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 18, alignItems: "start", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 400px", minWidth: 0 }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              <StatBox
                label={controls.length > 0 ? "β (kontrollert)" : "β (bivariat)"}
                value={regControlled.slope.toFixed(3)}
                sub={`Effekt av ${VARIABLES[effectiveX].label.toLowerCase()}`}
                color={controls.length > 0 ? "#00b894" : "#e84393"}
              />
              <StatBox label="R²" value={regControlled.r2.toFixed(3)} sub="Forklart varians" color="#0984e3" />
              {controls.length > 0 && (
                <StatBox
                  label="Endring i β"
                  value={`${slopeChange > 0 ? "+" : ""}${slopeChange.toFixed(1)}%`}
                  sub={`Fra ${regBase.slope.toFixed(3)}`}
                  color={Math.abs(slopeChange) > 30 ? "#e17055" : "#fdcb6e"}
                />
              )}
            </div>

            <div style={{
              background: "rgba(255,255,255,0.03)", borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.06)", padding: 16, marginBottom: 14,
            }}>
              <div style={{ fontSize: 12, color: "#b2bec3", marginBottom: 8 }}>
                {controls.length === 0 ? "Bivariat regresjon" : `Kontrollert for: ${controls.map(c => VARIABLES[c].label).join(", ")}`}
              </div>
              <ScatterPlot data={data} xKey={effectiveX} yKey={effectiveY} regression={regControlled} width={560} height={320} />
            </div>

            {controls.length > 0 && (
              <div style={{
                background: "rgba(255,255,255,0.03)", borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.06)", padding: 14, marginBottom: 14, overflowX: "auto",
              }}>
                <div style={{ fontSize: 12, color: "#b2bec3", marginBottom: 8 }}>Alle koeffisienter i modellen</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                      <th style={{ textAlign: "left", padding: "6px 8px", color: "#b2bec3", fontWeight: 500 }}>Variabel</th>
                      <th style={{ textAlign: "right", padding: "6px 8px", color: "#b2bec3", fontWeight: 500 }}>β</th>
                      <th style={{ textAlign: "left", padding: "6px 8px", color: "#b2bec3", fontWeight: 500 }}>Tolkning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[effectiveX, ...controls].map(key => (
                      <tr key={key} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "6px 8px" }}>
                          <span style={{ color: VARIABLES[key].color }}>{VARIABLES[key].emoji}</span> {VARIABLES[key].label}
                        </td>
                        <td style={{
                          textAlign: "right", padding: "6px 8px",
                          fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                          color: (regControlled.coefficients[key] || 0) > 0 ? "#00b894" : "#e17055",
                        }}>
                          {(regControlled.coefficients[key] || 0).toFixed(3)}
                        </td>
                        <td style={{ padding: "6px 8px", fontSize: 11, color: "#b2bec3" }}>
                          {(regControlled.coefficients[key] || 0) > 0 ? "Positiv" : "Negativ"} sammenheng
                          {key === effectiveX ? " (hovedeffekt)" : " (kontroll)"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{
            flex: "0 0 260px", minWidth: 260,
            background: "rgba(255,255,255,0.04)", borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.08)", padding: 16,
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: "#dfe6e9" }}>Kontrollvariabler</div>
            <p style={{ fontSize: 11, color: "#b2bec3", margin: "0 0 14px", lineHeight: 1.4 }}>
              Klikk for å legge til/fjerne kontrollvariabler i regresjonsmodellen.
            </p>

            {availableControls.map(key => {
              const v = VARIABLES[key];
              const active = controls.includes(key);
              const suggested = scenario.suggestedControls.includes(key);
              return (
                <button key={key} onClick={() => toggleControl(key)} style={{
                  display: "block", width: "100%", padding: "10px 12px", marginBottom: 8,
                  background: active ? `${v.color}22` : "rgba(255,255,255,0.02)",
                  border: active ? `1.5px solid ${v.color}88` : "1.5px solid rgba(255,255,255,0.06)",
                  borderRadius: 8, color: active ? v.color : "#b2bec3",
                  cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13, transition: "all 0.15s", position: "relative",
                }}>
                  <span style={{ fontWeight: 600 }}>{v.emoji} {v.label}</span>
                  <br />
                  <span style={{ fontSize: 10, opacity: 0.7 }}>{v.desc}</span>
                  {suggested && !active && (
                    <span style={{
                      position: "absolute", top: 6, right: 8,
                      fontSize: 9, color: "#fdcb6e", background: "rgba(253, 203, 110, 0.15)",
                      padding: "2px 6px", borderRadius: 4,
                    }}>prøv denne</span>
                  )}
                  {active && (
                    <span style={{ position: "absolute", top: 6, right: 8, fontSize: 10, color: v.color }}>✓</span>
                  )}
                </button>
              );
            })}

            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <label style={{ fontSize: 11, color: "#b2bec3" }}>Utvalgsstørrelse: {sampleSize}</label>
              <input type="range" min={50} max={500} step={50} value={sampleSize}
                onChange={e => setSampleSize(Number(e.target.value))}
                style={{ width: "100%", marginTop: 4, accentColor: "#6c5ce7" }} />
            </div>

            {scenario.id !== "fritt" && controls.length > 0 && (
              <button onClick={() => setShowExplanation(v => !v)} style={{
                width: "100%", marginTop: 14, padding: "10px 14px",
                background: "linear-gradient(135deg, #6c5ce7, #0984e3)",
                border: "none", borderRadius: 8, color: "#fff",
                cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              }}>
                {showExplanation ? "Skjul forklaring" : "💡 Vis forklaring"}
              </button>
            )}
          </div>
        </div>

        {showExplanation && scenario.id !== "fritt" && (
          <div style={{
            marginTop: 16,
            background: "linear-gradient(135deg, rgba(108,92,231,0.1), rgba(9,132,227,0.1))",
            border: "1px solid rgba(108,92,231,0.3)", borderRadius: 12,
            padding: 20, lineHeight: 1.6, fontSize: 14,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 6, color: "#a29bfe" }}>💡 Hva skjer her?</div>
            {scenario.explanation(regBase, regControlled)}
          </div>
        )}

        <div style={{
          marginTop: 24, padding: 18,
          background: "rgba(255,255,255,0.02)", borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.05)",
          fontSize: 12, color: "#636e72", lineHeight: 1.6,
        }}>
          <strong style={{ color: "#b2bec3" }}>Huskeregler:</strong>{" "}
          β (beta) viser endring i Y for én enhets økning i X, kontrollert for andre variabler.
          R² viser hvor mye av variansen i Y som forklares av modellen.
          Når β endres vesentlig etter å ha lagt til en kontrollvariabel, tyder det på at den opprinnelige sammenhengen var konfundert.
        </div>
      </div>
    </div>
  );
}
