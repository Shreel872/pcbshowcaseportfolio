// ─────────────────────────────────────────────────────────────
// Interactive precharge simulator — mirrors the actual LTspice
// simulation of the HV divider used on the ACU.
//
// MPPT_TAP = MPPT DC link voltage (rising)
// BAT_REF  = battery reference (constant, set by R9 / (R1_top + R9))
// VERIF_SIG = comparator output, flips HIGH when MPPT_TAP > BAT_REF
//
// Real components (matches /schematics/ACU.pdf sheet 2):
//   Top legs: 4 × 250 kΩ in series (RNCF0805BTE250K)
//   R9  = 21.3 kΩ 0.1% (RN73H1JTTD2132B25), battery bottom
//   R10 = 23.7 kΩ 1%   (RMCF0603FT23K7),    MPPT bottom
//   COMP1 = TLV3211QDCKRQ1 (push-pull rail-to-rail comparator)
// ─────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";

// ── Fixed SPICE values ──────────────────────────────────────
const R1_EACH  = 250_000;
const R1_COUNT = 4;
const R1       = R1_EACH * R1_COUNT;   // 1.0 MΩ per leg
const R9_BAT   = 21_300;               // battery divider bottom (RN73 0.1%)
const R10_MPPT = 23_700;               // MPPT divider bottom    (RMCF 1%)
const V_BAT    = 142.7;
const V_CC     = 5;
const V_MPPT_PEAK = 150;
const RAMP_END_MS = 5;
const SIM_END_MS  = 10;

// ── Derived ─────────────────────────────────────────────────
const V_REF       = (V_BAT * R9_BAT) / (R1 + R9_BAT);
const V_MPPT_TRIP = (V_REF * (R1 + R10_MPPT)) / R10_MPPT;
const T_TRIP_MS   = (V_MPPT_TRIP / V_MPPT_PEAK) * RAMP_END_MS;

// ── Power (constant battery divider) ────────────────────────
const I_BAT          = V_BAT / (R1 + R9_BAT);
const P_BAT_TOTAL    = I_BAT * V_BAT;
const P_BAT_R1_EACH  = I_BAT * I_BAT * R1_EACH;
const P_BAT_R9       = I_BAT * I_BAT * R9_BAT;

// ── Power (MPPT divider, worst-case 150 V) ───────────────────
const I_MPPT_PEAK        = V_MPPT_PEAK / (R1 + R10_MPPT);
const P_MPPT_PEAK_TOTAL  = I_MPPT_PEAK * V_MPPT_PEAK;
const P_MPPT_PEAK_R1_EACH = I_MPPT_PEAK * I_MPPT_PEAK * R1_EACH;
const P_MPPT_PEAK_R10    = I_MPPT_PEAK * I_MPPT_PEAK * R10_MPPT;
const V_PER_R1_PEAK      = I_MPPT_PEAK * R1_EACH;

// Real-time replay: 6.5 s wall clock = one 10 ms sim loop
const REAL_CYCLE_MS = 6500;

function useSimTime() {
  const [tSim, setTSim] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = () => {
      const elapsed = (performance.now() - start) % REAL_CYCLE_MS;
      setTSim((elapsed / REAL_CYCLE_MS) * SIM_END_MS);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return tSim;
}

const fmt = (v, d = 2) => v.toFixed(d);

// ── SVG ground symbol ────────────────────────────────────────
function Gnd({ cx, cy, color = "#475569" }) {
  return (
    <g>
      <line x1={cx - 12} y1={cy}     x2={cx + 12} y2={cy}     stroke={color} strokeWidth={1.8} />
      <line x1={cx - 7}  y1={cy + 4} x2={cx + 7}  y2={cy + 4} stroke={color} strokeWidth={1.4} />
      <line x1={cx - 3}  y1={cy + 8} x2={cx + 3}  y2={cy + 8} stroke={color} strokeWidth={1} />
    </g>
  );
}

// ── Voltage source circle ────────────────────────────────────
function VSrc({ cx, cy, color, label, sublabel }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill="#0f172a" stroke={color} strokeWidth={1.3} />
      <text x={cx + 14} y={cy - 4}  fill="#94a3b8" fontSize={7}  textAnchor="start">{label}</text>
      <text x={cx + 14} y={cy + 7}  fill={color}   fontSize={8}  textAnchor="start" fontFamily="monospace">{sublabel}</text>
    </g>
  );
}

// ── Resistor box ─────────────────────────────────────────────
function Res({ cx, y, color, label, value }) {
  return (
    <g>
      <rect x={cx - 13} y={y} width={26} height={22} rx={2} fill="#1e293b" stroke={color} strokeWidth={1.2} />
      <text x={cx} y={y + 9}  textAnchor="middle" fill="#e2e8f0" fontSize={7}   fontWeight="600">{label}</text>
      <text x={cx} y={y + 18} textAnchor="middle" fill={color}   fontSize={6.5}>{value}</text>
    </g>
  );
}

// ── Stacked R1 block (4 × 250 kΩ) ───────────────────────────
function R1Stack({ cx, topY }) {
  const segH = 11, segW = 22, segs = [];
  for (let i = 0; i < R1_COUNT; i++) {
    const y = topY + i * (segH + 2);
    segs.push(
      <g key={i}>
        <rect x={cx - segW / 2} y={y} width={segW} height={segH} rx={2}
          fill="#1e293b" stroke="#475569" strokeWidth={1} />
        <text x={cx + segW / 2 + 3} y={y + segH / 2 + 3}
          fill="#64748b" fontSize={6} textAnchor="start">250k</text>
      </g>
    );
    if (i < R1_COUNT - 1)
      segs.push(<line key={`j${i}`} x1={cx} y1={y + segH} x2={cx} y2={y + segH + 2}
        stroke="#475569" strokeWidth={1.2} />);
  }
  return <>{segs}</>;
}

// ── Schematic diagram ────────────────────────────────────────
function DividerSchematic({ vMppt, vSense, tripped }) {
  const tapColor = tripped ? "#22c55e" : "#f59e0b";

  // Layout constants
  const xCol  = 108;   // divider column x
  const compX = 308;   // comparator left edge
  const compW = 54;    // comparator triangle width
  const compH = 28;    // half-height of fixed triangle

  // ── MPPT section (top) ──────────────────────────────────
  const mpptSrcY   = 28;
  const mpptStkTop = mpptSrcY + 22;
  const mpptStkBot = mpptStkTop + R1_COUNT * 11 + (R1_COUNT - 1) * 2; // +50
  const mpptTapY   = mpptStkBot + 12;
  const mpptResY   = mpptTapY + 5;
  const mpptGndY   = mpptResY + 28;

  // ── Battery section (bottom) ─────────────────────────────
  const batSrcY    = mpptGndY + 38;
  const batStkTop  = batSrcY + 22;
  const batStkBot  = batStkTop + R1_COUNT * 11 + (R1_COUNT - 1) * 2;
  const batTapY    = batStkBot + 12;
  const batResY    = batTapY + 5;
  const batGndY    = batResY + 28;

  // ── Comparator centred between the two taps ──────────────
  const cMidY    = (mpptTapY + batTapY) / 2;
  const plusYc   = cMidY - compH;   // + input y on triangle
  const minusYc  = cMidY + compH;   // − input y on triangle
  const apexX    = compX + compW;

  // L-route turn column
  const turnX = compX - 24;

  const wire = "#334155";

  return (
    <svg viewBox="0 0 460 340" preserveAspectRatio="xMidYMid meet"
      className="w-full h-full" xmlns="http://www.w3.org/2000/svg">

      {/* ─── MPPT divider ─────────────────────────────── */}
      <VSrc cx={xCol} cy={mpptSrcY} color="#3b82f6"
        label="MPPT DC link" sublabel={`${fmt(vMppt, 1)} V  ↑`} />

      <line x1={xCol} y1={mpptSrcY - 10} x2={xCol} y2={mpptStkTop}
        stroke="#3b82f6" strokeWidth={1.2} />
      <R1Stack cx={xCol} topY={mpptStkTop} />
      <line x1={xCol} y1={mpptStkBot} x2={xCol} y2={mpptTapY}
        stroke={wire} strokeWidth={1.2} />

      {/* MPPT tap */}
      <circle cx={xCol} cy={mpptTapY} r={3} fill={tapColor} />
      <text x={xCol - 8} y={mpptTapY - 5} textAnchor="end"
        fill={tapColor} fontSize={7} fontWeight="700">MPPT tap</text>
      <text x={xCol - 8} y={mpptTapY + 6} textAnchor="end"
        fill={tapColor} fontSize={7} fontFamily="monospace">{fmt(vSense, 3)} V</text>

      <line x1={xCol} y1={mpptTapY} x2={xCol} y2={mpptResY} stroke={wire} strokeWidth={1.2} />
      <Res cx={xCol} y={mpptResY} color="#3b82f6" label="R10" value="23.7k" />
      <line x1={xCol} y1={mpptResY + 22} x2={xCol} y2={mpptGndY} stroke={wire} strokeWidth={1.2} />
      <Gnd cx={xCol} cy={mpptGndY} color="#334155" />

      {/* ─── Battery divider ──────────────────────────── */}
      <VSrc cx={xCol} cy={batSrcY} color="#6366f1"
        label="Battery" sublabel="142.7 V" />

      <line x1={xCol} y1={batSrcY - 10} x2={xCol} y2={batStkTop}
        stroke="#6366f1" strokeWidth={1.2} />
      <R1Stack cx={xCol} topY={batStkTop} />
      <line x1={xCol} y1={batStkBot} x2={xCol} y2={batTapY}
        stroke={wire} strokeWidth={1.2} />

      {/* battery tap (V_ref) */}
      <circle cx={xCol} cy={batTapY} r={3} fill="#6366f1" />
      <text x={xCol - 8} y={batTapY - 5} textAnchor="end"
        fill="#a5b4fc" fontSize={7} fontWeight="700">V_ref</text>
      <text x={xCol - 8} y={batTapY + 6} textAnchor="end"
        fill="#a5b4fc" fontSize={7} fontFamily="monospace">{fmt(V_REF, 3)} V</text>

      <line x1={xCol} y1={batTapY} x2={xCol} y2={batResY} stroke={wire} strokeWidth={1.2} />
      <Res cx={xCol} y={batResY} color="#6366f1" label="R9" value="21.3k" />
      <line x1={xCol} y1={batResY + 22} x2={xCol} y2={batGndY} stroke={wire} strokeWidth={1.2} />
      <Gnd cx={xCol} cy={batGndY} color="#334155" />

      {/* ─── L-shaped signal routing ──────────────────── */}
      {/* n005 → right → down to + input */}
      <polyline
        points={`${xCol + 3},${mpptTapY} ${turnX},${mpptTapY} ${turnX},${plusYc} ${compX},${plusYc}`}
        fill="none" stroke={tapColor} strokeWidth={1.4} strokeLinejoin="round"
      />
      {/* n004 → right → up to − input */}
      <polyline
        points={`${xCol + 3},${batTapY} ${turnX},${batTapY} ${turnX},${minusYc} ${compX},${minusYc}`}
        fill="none" stroke="#6366f1" strokeWidth={1.4} strokeLinejoin="round"
      />

      {/* ─── Comparator (TLV3211) ─────────────────────── */}
      <polygon
        points={`${compX},${plusYc} ${compX},${minusYc} ${apexX},${cMidY}`}
        fill="#0f172a" stroke="#10b981" strokeWidth={1.6}
      />
      {/* + / − labels */}
      <text x={compX + 7} y={plusYc  + 14} fill={tripped ? "#22c55e" : "#93c5fd"}
        fontSize={11} fontWeight="700">+</text>
      <text x={compX + 7} y={minusYc - 4}  fill="#a5b4fc"
        fontSize={11} fontWeight="700">−</text>
      {/* part label */}
      <text x={compX + compW / 2} y={cMidY + 4} textAnchor="middle"
        fill="#6ee7b7" fontSize={7} fontWeight="600">TLV3211</text>

      {/* Vcc pin (top of triangle) */}
      <line x1={compX + compW / 2} y1={plusYc} x2={compX + compW / 2} y2={plusYc - 16}
        stroke="#7c3aed" strokeWidth={1} />
      <text x={compX + compW / 2} y={plusYc - 20} textAnchor="middle"
        fill="#a78bfa" fontSize={7} fontFamily="monospace">Vcc 5 V</text>

      {/* Output */}
      <line x1={apexX} y1={cMidY} x2={apexX + 34} y2={cMidY}
        stroke={tripped ? "#ef4444" : "#334155"} strokeWidth={1.5} />
      <rect x={apexX + 36} y={cMidY - 10} width={36} height={20} rx={3}
        fill={tripped ? "#14532d" : "#1e293b"}
        stroke={tripped ? "#22c55e" : "#334155"} strokeWidth={1} />
      <text x={apexX + 54} y={cMidY + 4} textAnchor="middle"
        fill={tripped ? "#86efac" : "#64748b"} fontSize={8} fontFamily="monospace" fontWeight="700">
        {tripped ? "HIGH" : "LOW"}
      </text>
    </svg>
  );
}

// ── Waveform plot ────────────────────────────────────────────
function WaveformPlot({ tSim }) {
  const W = 520, H = 200;
  const padL = 46, padR = 12, padT = 18, padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const xAt = (t) => padL + (t / SIM_END_MS) * plotW;
  const yAt = (v) => padT + plotH - (v / V_CC) * plotH;

  // Build V_sense trace up to tSim
  const N = 100;
  const maxI = Math.floor((tSim / SIM_END_MS) * N);
  const senseTrace = [];
  for (let i = 0; i <= maxI; i++) {
    const t  = (i / N) * SIM_END_MS;
    const vm = t <= RAMP_END_MS ? (t / RAMP_END_MS) * V_MPPT_PEAK : V_MPPT_PEAK;
    const vs = (vm * R10_MPPT) / (R1 + R10_MPPT);
    senseTrace.push(`${xAt(t).toFixed(1)},${yAt(vs).toFixed(1)}`);
  }

  // Output digital trace
  const outPts = [`${xAt(0)},${yAt(0)}`];
  if (tSim < T_TRIP_MS) {
    outPts.push(`${xAt(tSim)},${yAt(0)}`);
  } else {
    outPts.push(`${xAt(T_TRIP_MS)},${yAt(0)}`);
    outPts.push(`${xAt(T_TRIP_MS)},${yAt(V_CC)}`);
    outPts.push(`${xAt(Math.min(tSim, SIM_END_MS))},${yAt(V_CC)}`);
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full"
      preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">

      {/* Plot area */}
      <rect x={padL} y={padT} width={plotW} height={plotH}
        fill="#060d1a" stroke="#1e293b" strokeWidth={1} />

      {/* Y grid */}
      {[0,1,2,3,4,5].map(v => {
        const y = yAt(v);
        return (
          <g key={v}>
            <line x1={padL} y1={y} x2={padL + plotW} y2={y}
              stroke="#1e293b" strokeWidth={0.6} />
            <line x1={padL - 3} y1={y} x2={padL} y2={y}
              stroke="#334155" strokeWidth={1} />
            <text x={padL - 5} y={y + 3} textAnchor="end"
              fill="#64748b" fontSize={7}>{v}.0V</text>
          </g>
        );
      })}

      {/* X grid */}
      {[0,1,2,3,4,5,6,7,8,9,10].map(t => {
        const x = xAt(t);
        return (
          <g key={t}>
            <line x1={x} y1={padT} x2={x} y2={padT + plotH}
              stroke="#1e293b" strokeWidth={0.6} />
            <line x1={x} y1={padT + plotH} x2={x} y2={padT + plotH + 3}
              stroke="#334155" strokeWidth={1} />
            <text x={x} y={padT + plotH + 13} textAnchor="middle"
              fill="#64748b" fontSize={7}>{t}ms</text>
          </g>
        );
      })}

      {/* V(n004) — battery reference, constant (blue) */}
      <line x1={xAt(0)} y1={yAt(V_REF)} x2={xAt(SIM_END_MS)} y2={yAt(V_REF)}
        stroke="#3b82f6" strokeWidth={1.5} />

      {/* V(n005) — MPPT sense voltage, ramping (green) */}
      {senseTrace.length > 1 &&
        <polyline points={senseTrace.join(" ")} fill="none"
          stroke="#22c55e" strokeWidth={1.8} />}

      {/* V(output) — comparator output (red) */}
      <polyline points={outPts.join(" ")} fill="none"
        stroke="#ef4444" strokeWidth={1.8} />

      {/* Trip marker */}
      <line x1={xAt(T_TRIP_MS)} y1={padT} x2={xAt(T_TRIP_MS)} y2={padT + plotH}
        stroke="#fbbf24" strokeWidth={0.8} strokeDasharray="3 3" />
      <circle cx={xAt(T_TRIP_MS)} cy={yAt(V_REF)} r={3}
        fill="#fbbf24" stroke="#060d1a" strokeWidth={1} />

      {/* Legend */}
      <line x1={padL + 8}   y1={padT - 7} x2={padL + 24}  y2={padT - 7} stroke="#22c55e" strokeWidth={2} />
      <text x={padL + 27}  y={padT - 4} fill="#86efac" fontSize={7.5} fontFamily="monospace">MPPT tap</text>

      <line x1={padL + 116} y1={padT - 7} x2={padL + 132} y2={padT - 7} stroke="#3b82f6" strokeWidth={2} />
      <text x={padL + 135} y={padT - 4} fill="#93c5fd" fontSize={7.5} fontFamily="monospace">V_ref (battery tap)</text>

      <line x1={padL + 254} y1={padT - 7} x2={padL + 270} y2={padT - 7} stroke="#ef4444" strokeWidth={2} />
      <text x={padL + 273} y={padT - 4} fill="#fca5a5" fontSize={7.5} fontFamily="monospace">VERIF_SIG</text>

      <text x={padL + plotW} y={padT - 4} textAnchor="end"
        fill="#fbbf24" fontSize={7}>trip @ {fmt(T_TRIP_MS, 2)} ms</text>
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────
export default function PrechargeSimulator() {
  const tSim = useSimTime();

  const { vMppt, vSense, tripped } = useMemo(() => {
    const vm = tSim <= RAMP_END_MS
      ? (tSim / RAMP_END_MS) * V_MPPT_PEAK
      : V_MPPT_PEAK;
    const vs = (vm * R10_MPPT) / (R1 + R10_MPPT);
    return { vMppt: vm, vSense: vs, tripped: vs >= V_REF };
  }, [tSim]);

  const i_mppt      = vMppt / (R1 + R10_MPPT);
  const p_mppt_live = i_mppt * vMppt;

  return (
    <div className="w-full h-full overflow-auto bg-gray-950 text-gray-200">
      <div className="max-w-5xl mx-auto p-4 sm:p-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-1">
              LTspice · .tran 10ms · Live Replay
            </p>
            <h3 className="text-lg font-semibold text-gray-100 mb-2">
              HV Voltage Divider + TLV3211 Comparator
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
              Reproduced from the LTspice transient run used to confirm the
              divider ratios. The <span className="font-mono text-green-400">MPPT tap</span>{" "}
              tracks the DC link voltage as it charges up;{" "}
              <span className="font-mono text-indigo-300">battery V_ref</span> is a fixed
              fraction of 142.7 V set by R9. When the MPPT tap crosses V_ref, the
              TLV3211 output (VERIF_SIG) flips HIGH, signalling that the DC link
              has reached ≈90% of battery voltage and the main contactor can close.
              The linear ramp is a test stimulus for clarity — the real DC link
              follows an RC curve through the precharge resistor, but the trip
              threshold is identical.
            </p>
          </div>
          {/* SPICE file download — drop acu-precharge.asc into /public to enable */}
          <a
            href="/acu-precharge.asc"
            download
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-700 bg-gray-900 text-gray-400 hover:text-gray-200 hover:border-gray-500 text-[11px] font-mono transition-colors"
            title="Download LTspice schematic"
          >
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
              <path d="M8 12l-4-4h2.5V3h3v5H12L8 12z"/>
              <rect x="2" y="13" width="12" height="1.5" rx="0.75"/>
            </svg>
            .asc
          </a>
        </div>

        {/* Status bar */}
        <div className={`mb-4 px-4 py-2.5 rounded border ${
          tripped
            ? "bg-green-950/40 border-green-700/40"
            : "bg-amber-950/30 border-amber-700/30"
        }`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className={`w-2 h-2 rounded-full ${
                tripped ? "bg-green-400 animate-pulse" : "bg-amber-400"
              }`} />
              <span className={`text-xs font-semibold uppercase tracking-wide ${
                tripped ? "text-green-300" : "text-amber-300"
              }`}>
                {tripped ? "Output HIGH — main contactor enable" : "Output LOW — precharging"}
              </span>
            </div>
            <span className="text-[11px] font-mono text-gray-500">
              t = {fmt(tSim, 2)} ms &nbsp;·&nbsp;
              MPPT tap = {fmt(vSense, 3)} V &nbsp;·&nbsp;
              V_ref = {fmt(V_REF, 3)} V &nbsp;·&nbsp;
              V_mppt = {fmt(vMppt, 1)} V
            </span>
          </div>
        </div>

        {/* Waveform plot */}
        <div className="border border-gray-800/60 rounded-lg bg-gray-900/30 p-3 mb-4">
          <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">
            Transient waveform
          </p>
          <div className="h-[200px] overflow-hidden">
            <WaveformPlot tSim={tSim} />
          </div>
        </div>

        {/* Schematic + component values */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4 mb-4">
          <div className="border border-gray-800/60 rounded-lg bg-gray-900/30 p-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">
              Schematic — live node voltages
            </p>
            <div className="h-[380px] overflow-hidden">
              <DividerSchematic vMppt={vMppt} vSense={vSense} tripped={tripped} />
            </div>
          </div>

          <div className="border border-gray-800/60 rounded-lg bg-gray-900/30 p-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-3">
              Component values
            </p>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-500">Battery voltage</span>
                <span className="font-mono text-indigo-300">142.7 V</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">MPPT ramp (test)</span>
                <span className="font-mono text-blue-300">0 → 150 V / 5 ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Comparator supply</span>
                <span className="font-mono text-purple-300">5 V</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">HV top (× 2 legs)</span>
                <span className="font-mono text-gray-300">1 MΩ each</span>
              </div>
              <div className="flex justify-between pl-3 border-l border-gray-800">
                <span className="text-gray-600 text-[10px]">physical</span>
                <span className="font-mono text-gray-500 text-[10px]">4 × 250 kΩ series</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">R9 — battery bottom</span>
                <span className="font-mono text-indigo-300">21.3 kΩ</span>
              </div>
              <div className="flex justify-between pl-3 border-l border-gray-800">
                <span className="text-gray-600 text-[10px]">part</span>
                <span className="font-mono text-gray-500 text-[10px]">RN73 0.1%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">R10 — MPPT bottom</span>
                <span className="font-mono text-blue-300">23.7 kΩ</span>
              </div>
              <div className="flex justify-between pl-3 border-l border-gray-800">
                <span className="text-gray-600 text-[10px]">part</span>
                <span className="font-mono text-gray-500 text-[10px]">RMCF 1%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Comparator</span>
                <span className="font-mono text-green-300">TLV3211</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-800/60 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-500">V_ref (battery tap)</span>
                <span className="font-mono text-indigo-300">{fmt(V_REF, 3)} V</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Trip at V_mppt</span>
                <span className="font-mono text-green-300">{fmt(V_MPPT_TRIP, 2)} V</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Trip time</span>
                <span className="font-mono text-green-300">{fmt(T_TRIP_MS, 3)} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Threshold / V_bat</span>
                <span className="font-mono text-amber-300">{fmt((V_MPPT_TRIP / V_BAT) * 100, 1)} %</span>
              </div>
            </div>
          </div>
        </div>

        {/* Power calculations */}
        <div className="border border-gray-800/60 rounded-lg bg-gray-900/30 p-4 mb-4">
          <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-3">
            Conductive loss calculations
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
            <div>
              <p className="text-indigo-300 font-semibold mb-2 uppercase tracking-wider text-[10px]">
                Battery divider — constant
              </p>
              <div className="font-mono text-gray-300 space-y-1 bg-gray-950/50 p-3 rounded border border-gray-800/40">
                <div>I  = 142.7 V / 1.0213 MΩ</div>
                <div className="text-indigo-300">&nbsp;&nbsp; = {fmt(I_BAT * 1e6, 2)} μA</div>
                <div className="mt-1">P_total    = {fmt(P_BAT_TOTAL * 1e3, 3)} mW</div>
                <div>P per 250k = {fmt(P_BAT_R1_EACH * 1e3, 3)} mW</div>
                <div>P on R9    = {fmt(P_BAT_R9 * 1e3, 3)} mW</div>
              </div>
            </div>
            <div>
              <p className="text-green-300 font-semibold mb-2 uppercase tracking-wider text-[10px]">
                MPPT divider — worst case 150 V
              </p>
              <div className="font-mono text-gray-300 space-y-1 bg-gray-950/50 p-3 rounded border border-gray-800/40">
                <div>I  = 150 V / 1.0237 MΩ</div>
                <div className="text-green-300">&nbsp;&nbsp; = {fmt(I_MPPT_PEAK * 1e6, 2)} μA</div>
                <div className="mt-1">P_total    = {fmt(P_MPPT_PEAK_TOTAL * 1e3, 3)} mW</div>
                <div>P per 250k = {fmt(P_MPPT_PEAK_R1_EACH * 1e3, 3)} mW</div>
                <div>P on R10   = {fmt(P_MPPT_PEAK_R10 * 1e3, 3)} mW</div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
            {[
              { label: "Total HV draw (peak)", value: `${fmt((P_BAT_TOTAL + P_MPPT_PEAK_TOTAL) * 1e3, 2)} mW` },
              { label: "V per 250 kΩ @ 150 V",  value: `${fmt(V_PER_R1_PEAK, 1)} V` },
              { label: "Max P per resistor",      value: `${fmt(P_MPPT_PEAK_R1_EACH * 1e3, 2)} mW` },
              { label: "Live P (MPPT)",           value: `${fmt(p_mppt_live * 1e3, 2)} mW` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-950/40 p-2.5 rounded border border-gray-800/40">
                <div className="text-gray-500 uppercase tracking-wider mb-1">{label}</div>
                <div className="font-mono text-gray-200 text-[13px]">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Why high R */}
        <div className="border border-gray-800/60 rounded-lg bg-gray-900/30 p-4 mb-4">
          <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-3">
            Why 4 × 250 kΩ instead of a single 1 MΩ?
          </p>
          <ul className="text-xs text-gray-400 space-y-2.5 leading-relaxed">
            <li>
              <span className="text-blue-300 font-medium">Voltage rating per part — </span>
              splitting across four series resistors drops each one to
              ≈{fmt(V_PER_R1_PEAK, 1)} V at the 150 V peak. The chosen
              RNCF0805BTE250K is a 0.1% thin-film 0805 rated to 150 V working.
              A single 1 MΩ resistor would see almost the full DC link voltage
              and would need a specialty HV part (1206/2010, 200 V+ rated).
            </li>
            <li>
              <span className="text-blue-300 font-medium">Low quiescent draw — </span>
              combined HV divider dissipation stays under{" "}
              {fmt((P_BAT_TOTAL + P_MPPT_PEAK_TOTAL) * 1e3, 1)} mW at peak.
              Matters for battery self-discharge when parked.
            </li>
            <li>
              <span className="text-blue-300 font-medium">Tiny per-resistor dissipation — </span>
              each 250 kΩ sees at most {fmt(P_MPPT_PEAK_R1_EACH * 1e3, 2)} mW
              against a 100 mW rating — ~25× margin, no heatsinking required.
            </li>
            <li>
              <span className="text-blue-300 font-medium">Redundancy — </span>
              an open in one of the four resistors pulls the divider output low,
              keeping the comparator output LOW (precharge engaged). Fail-safe
              rather than fail-open.
            </li>
            <li>
              <span className="text-blue-300 font-medium">Tradeoff — </span>
              1 MΩ source impedance makes the comparator input sensitive to bias
              current and leakage. The TLV3211 (CMOS input, ~1 pA bias typ) was
              picked specifically for this — its input current is so small that
              the 1 MΩ source impedance contributes essentially zero offset error.
              PCB layout still uses guard rings to keep surface-leakage paths
              negligible at HV.
            </li>
          </ul>
        </div>

        {/* LV divider note */}
        <div className="border border-gray-800/60 rounded-lg bg-gray-900/30 p-4 mb-4">
          <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">
            What happens to VERIF_SIG on the LV side
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            The TLV3211 output drives the optocoupler LED through R16 = 75 Ω.
            On the LV side the phototransistor pulls OPTO_OUT1 against a 24 V
            pull-up. That logic level then feeds a CMOS inverter (U3) that splits
            it into two mutually-exclusive signals — one going to U5 (BTS441
            PROFET driving the main contactor coil) and the inverted copy going
            to U4 (BTS441 driving the precharge contactor coil). Each PROFET
            input is scaled by a 12 kΩ / 51 kΩ divider so the 24 V logic stays
            inside the BTS441's input range. The HV-side 5 V rail that powers
            the comparator (V_CC in the schematic above) comes from the RKE-2405
            isolated buck, not from any LV divider.
          </p>
        </div>

        <p className="text-[10px] text-gray-700 leading-relaxed">
          The voltage ramp is a test stimulus — any rising input that crosses
          V_ref flips the comparator the same way. The real DC link charges as
          an RC curve through the precharge resistor. This simulation confirms
          the divider ratios and trip point, not the system dynamics.
        </p>
      </div>
    </div>
  );
}
