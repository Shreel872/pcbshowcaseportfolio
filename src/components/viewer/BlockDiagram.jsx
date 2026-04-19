// ─────────────────────────────────────────────────────────────
// Clean SVG block diagrams for the ACU project.
// "system": high-level precharge flow (ECU is monitoring only)
// "hw-verification": isolated hardware verification
//
// Topology (redesigned, pure hardware):
//   ECU receives BMU + MPPT voltages over CAN for monitoring only
//   No ECU enable signal -control loop is fully hardware
//   HV comparator fires at V_mppt DC link >= 90% V_bat
//   Opto crosses HV/LV isolation
//   LV voltage divider scales opto output 24 V to 5 V logic
//   Transistor level-shifts logic to 24 V PROFET gate drive
//   PROFET activates main +ve contactor (24 V coil)
//   P-ch MOSFET deactivates precharge contactor simultaneously
//   24 V to 5 V isolated buck supplies HV-side comparator
//   Status LED (~100 mA) on HV 5 V rail keeps iso buck in reg
// ─────────────────────────────────────────────────────────────

function Arrow({ x1, y1, x2, y2, color = "#64748b", dashed = false }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return null;
  const ux = dx / len;
  const uy = dy / len;
  const tipLen = 8;
  const tipW = 4;
  const ex = x2 - ux * 2;
  const ey = y2 - uy * 2;

  return (
    <g>
      <line
        x1={x1} y1={y1} x2={ex} y2={ey}
        stroke={color} strokeWidth={1.5}
        strokeDasharray={dashed ? "6 3" : "none"}
      />
      <polygon
        points={`${x2},${y2} ${ex - ux * tipLen + uy * tipW},${ey - uy * tipLen - ux * tipW} ${ex - ux * tipLen - uy * tipW},${ey - uy * tipLen + ux * tipW}`}
        fill={color}
      />
    </g>
  );
}

function Block({ x, y, w, h, label, sublabel, fill = "#1e293b", stroke = "#475569", textColor = "#e2e8f0", fontSize = 11 }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={fill} stroke={stroke} strokeWidth={1.5} />
      <text
        x={x + w / 2} y={sublabel ? y + h / 2 - 6 : y + h / 2}
        textAnchor="middle" dominantBaseline="central"
        fill={textColor} fontSize={fontSize} fontWeight="600"
      >
        {label}
      </text>
      {sublabel && (
        <text
          x={x + w / 2} y={y + h / 2 + 10}
          textAnchor="middle" dominantBaseline="central"
          fill="#94a3b8" fontSize={9}
        >
          {sublabel}
        </text>
      )}
    </g>
  );
}

function Label({ x, y, text, color = "#94a3b8", fontSize = 9, anchor = "middle" }) {
  return (
    <text x={x} y={y} textAnchor={anchor} dominantBaseline="central" fill={color} fontSize={fontSize}>
      {text}
    </text>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SYSTEM DIAGRAM
   ECU is monitoring only in the redesigned topology.
   BMU + MPPTs still broadcast voltages on CAN so the ECU can log
   state, but the contactor control loop lives entirely inside
   the ACU hardware.
   ═══════════════════════════════════════════════════════════════ */

function SystemDiagram() {
  const acuX = 345;
  const acuW = 185;
  const acuCx = acuX + acuW / 2;

  return (
    <svg viewBox="0 0 780 410" className="w-full max-h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="780" height="410" fill="transparent" />

      <text x="390" y="22" textAnchor="middle" fill="#e2e8f0" fontSize="15" fontWeight="700">
        System-Level Precharge Block Diagram
      </text>

      {/* ── Top Row: ECU + BMU ── */}
      <Block x={370} y={38} w={130} h={44} label="ECU" sublabel="Monitoring Only" fill="#1e293b" stroke="#6366f1" />

      <Block x={590} y={38} w={130} h={44} label="BMU" sublabel="Battery Mgmt Unit" fill="#1e293b" stroke="#6366f1" />

      {/* CAN: BMU to ECU */}
      <line x1={500} y1={60} x2={590} y2={60} stroke="#6366f1" strokeWidth={1.5} strokeDasharray="6 3" />
      <Label x={545} y={50} text="CAN (V_bat)" color="#818cf8" fontSize={8} />

      {/* CAN: MPPTs to ECU (L-shaped) */}
      <line x1={215} y1={168} x2={215} y2={60} stroke="#6366f1" strokeWidth={1.5} strokeDasharray="6 3" />
      <line x1={215} y1={60} x2={370} y2={60} stroke="#6366f1" strokeWidth={1.5} strokeDasharray="6 3" />
      <polygon points="370,60 362,56 362,64" fill="#6366f1" />
      <Label x={290} y={50} text="CAN (V_mppt x2)" color="#818cf8" fontSize={8} />

      {/* ECU note -logging only */}
      <rect x={350} y={86} width={170} height={20} rx={4} fill="#0f172a" stroke="#475569" strokeWidth={1} strokeDasharray="3 2" />
      <text x={435} y={99} textAnchor="middle" fill="#94a3b8" fontSize={8} fontWeight="500">Logs voltages, no control signal</text>

      {/* ── HV Power Path ── */}

      {/* Solar Array */}
      <Block x={15} y={195} w={90} h={50} label="Solar Array" fill="#0f172a" stroke="#3b82f6" fontSize={11} />

      {/* Split to 2 MPPTs */}
      <line x1={105} y1={220} x2={130} y2={220} stroke="#3b82f6" strokeWidth={1.5} />
      <circle cx={130} cy={220} r={3} fill="#3b82f6" />

      <line x1={130} y1={220} x2={130} y2={192} stroke="#3b82f6" strokeWidth={1.5} />
      <Arrow x1={130} y1={192} x2={150} y2={192} color="#3b82f6" />

      <line x1={130} y1={220} x2={130} y2={252} stroke="#3b82f6" strokeWidth={1.5} />
      <Arrow x1={130} y1={252} x2={150} y2={252} color="#3b82f6" />

      {/* MPPTs */}
      <Block x={150} y={174} w={120} h={36} label="MPPT 1" sublabel="Boost Converter" fill="#0f172a" stroke="#3b82f6" fontSize={11} />
      <Block x={150} y={234} w={120} h={36} label="MPPT 2" sublabel="Boost Converter" fill="#0f172a" stroke="#3b82f6" fontSize={11} />

      {/* Merge from MPPTs to ACU */}
      <line x1={270} y1={192} x2={310} y2={192} stroke="#3b82f6" strokeWidth={1.5} />
      <line x1={310} y1={192} x2={310} y2={220} stroke="#3b82f6" strokeWidth={1.5} />

      <line x1={270} y1={252} x2={310} y2={252} stroke="#3b82f6" strokeWidth={1.5} />
      <line x1={310} y1={252} x2={310} y2={220} stroke="#3b82f6" strokeWidth={1.5} />

      <circle cx={310} cy={220} r={3} fill="#3b82f6" />
      <Arrow x1={310} y1={220} x2={acuX} y2={220} color="#3b82f6" />
      <Label x={328} y={212} text="DC link" color="#93c5fd" fontSize={8} />

      {/* ── ACU Box ── */}
      <rect x={acuX} y={128} width={acuW} height={210} rx={8} fill="#1a1207" stroke="#f59e0b" strokeWidth={2} />
      <text x={acuCx} y={150} textAnchor="middle" fill="#f59e0b" fontSize="14" fontWeight="700">ACU</text>
      <text x={acuCx} y={163} textAnchor="middle" fill="#fbbf24" fontSize="8" fontStyle="italic">Pure Hardware Control</text>

      <Block x={acuX + 16} y={172} w={acuW - 32} h={26} label="Fuse" fill="#1e293b" stroke="#475569" fontSize={10} />
      <Arrow x1={acuCx} y1={198} x2={acuCx} y2={208} color="#475569" />

      <Block x={acuX + 16} y={208} w={acuW - 32} h={26} label="Precharge Resistor" fill="#1e293b" stroke="#475569" fontSize={10} />
      <Arrow x1={acuCx} y1={234} x2={acuCx} y2={244} color="#475569" />

      <Block x={acuX + 16} y={244} w={acuW - 32} h={28} label="Precharge Contactor" fill="#1e293b" stroke="#f59e0b" fontSize={10} />
      <Label x={acuCx} y={278} text="P-ch MOSFET deactivates" color="#fbbf24" fontSize={7} />

      <Block x={acuX + 16} y={288} w={acuW - 32} h={28} label="Main +ve Contactor" fill="#1e293b" stroke="#f59e0b" fontSize={10} />
      <Label x={acuCx} y={323} text="PROFET activates (24 V)" color="#fbbf24" fontSize={7} />

      {/* ACU to Battery */}
      <Arrow x1={acuX + acuW} y1={220} x2={590} y2={220} color="#3b82f6" />
      <Block x={590} y={195} w={120} h={50} label="Battery Pack" sublabel="~160 V" fill="#0f172a" stroke="#3b82f6" fontSize={12} />

      {/* BMU voltage sense to battery */}
      <line x1={655} y1={82} x2={655} y2={195} stroke="#6366f1" strokeWidth={1} strokeDasharray="4 2" />
      <Label x={665} y={140} text="V_bat" color="#818cf8" fontSize={7} anchor="start" />

      {/* Note box: HV/LV comparison happens inside ACU */}
      <rect x={15} y={325} width={300} height={60} rx={6} fill="#111827" stroke="#374151" strokeWidth={1} />
      <text x={25} y={340} fill="#d1d5db" fontSize={9} fontWeight="600">Redesign Note:</text>
      <text x={25} y={354} fill="#94a3b8" fontSize={8}>Previous ACU used an MCU that listened on CAN and drove</text>
      <text x={25} y={366} fill="#94a3b8" fontSize={8}>the contactors from firmware. The new version does the 90%</text>
      <text x={25} y={378} fill="#94a3b8" fontSize={8}>comparison entirely in hardware (see HW Verification view).</text>

      {/* ── Legend ── */}
      <g transform="translate(350, 390)">
        <line x1={0} y1={0} x2={25} y2={0} stroke="#3b82f6" strokeWidth={2} />
        <Label x={30} y={0} text="HV Power Path" color="#93c5fd" fontSize={9} anchor="start" />

        <line x1={140} y1={0} x2={165} y2={0} stroke="#6366f1" strokeWidth={2} strokeDasharray="6 3" />
        <Label x={170} y={0} text="CAN (monitoring)" color="#a5b4fc" fontSize={9} anchor="start" />

        <rect x={290} y={-5} width={10} height={10} rx={2} fill="#1a1207" stroke="#f59e0b" strokeWidth={1.5} />
        <Label x={306} y={0} text="ACU (hardware only)" color="#fcd34d" fontSize={9} anchor="start" />
      </g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HW VERIFICATION DIAGRAM
   Full redesign: no ECU enable, no CMOS AND.
   Flow: HV comparator -> opto -> LV divider (24->5V) ->
         transistor -> PROFET gate (24V) -> contactors
   Power: 24V LV -> iso buck -> HV 5V rail -> comparator + status LED
   ═══════════════════════════════════════════════════════════════ */

function HWVerificationDiagram() {
  const ISO = 470;

  return (
    <svg viewBox="0 0 980 500" className="w-full max-h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="980" height="500" fill="transparent" />

      <text x={ISO} y="24" textAnchor="middle" fill="#e2e8f0" fontSize="15" fontWeight="700">
        Hardware Verification: HV / LV Isolation
      </text>

      {/* Isolation boundary */}
      <line x1={ISO} y1={40} x2={ISO} y2={400} stroke="#ef4444" strokeWidth={2} strokeDasharray="10 5" />

      {/* Zone headers */}
      <rect x={20} y={38} width={ISO - 28} height={22} rx={3} fill="#1e1e2e" />
      <text x={(20 + ISO - 8) / 2} y={52} textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="600">
        HV Side (Floating Ground -Battery Ref.)
      </text>

      <rect x={ISO + 8} y={38} width={952 - ISO} height={22} rx={3} fill="#1a2e1a" />
      <text x={(ISO + 8 + 952) / 2} y={52} textAnchor="middle" fill="#86efac" fontSize="11" fontWeight="600">
        LV Side (Chassis Ground, 0 V)
      </text>

      {/* ═══ ROW 1: Power Supply ═══ */}

      {/* 24V source on LV side */}
      <Block x={660} y={72} w={90} h={32} label="24 V Rail" sublabel="LV chassis GND" fill="#0f172a" stroke="#22c55e" fontSize={11} />

      {/* 24V feeds into iso buck */}
      <Arrow x1={660} y1={88} x2={ISO + 60} y2={88} color="#22c55e" />

      {/* 24V to 5V Iso Buck centred on isolation line */}
      <rect x={ISO - 60} y={72} width={120} height={32} rx={6} fill="#27171a" stroke="#ef4444" strokeWidth={1.5} />
      <text x={ISO} y={85} textAnchor="middle" fill="#fca5a5" fontSize={10} fontWeight="600">Iso Buck</text>
      <text x={ISO} y={98} textAnchor="middle" fill="#fca5a5" fontSize={7}>24 V to 5 V isolated</text>

      {/* 5V output into HV side */}
      <Arrow x1={ISO - 60} y1={88} x2={315} y2={88} color="#a78bfa" />
      <Label x={380} y={80} text="5 V (HV GND)" color="#c4b5fd" fontSize={9} />

      {/* HV 5V rail splits: up to status LED, down to comparator Vcc */}
      <circle cx={315} cy={88} r={3} fill="#a78bfa" />

      {/* Path to Status LED (up-right) */}
      <line x1={315} y1={88} x2={200} y2={88} stroke="#a78bfa" strokeWidth={1.5} strokeDasharray="4 2" />
      <line x1={200} y1={88} x2={200} y2={115} stroke="#a78bfa" strokeWidth={1.5} strokeDasharray="4 2" />

      {/* Status LED block */}
      <Block x={145} y={115} w={110} h={32} label="Status LED" sublabel="~100 mA baseline" fill="#1e293b" stroke="#10b981" fontSize={10} />
      <Label x={130} y={131} text="(keeps iso buck" color="#94a3b8" fontSize={7} anchor="end" />
      <Label x={130} y={141} text="in regulation)" color="#94a3b8" fontSize={7} anchor="end" />

      {/* Comparator Vcc feed */}
      <line x1={315} y1={88} x2={315} y2={215} stroke="#a78bfa" strokeWidth={1.5} strokeDasharray="4 2" />
      <Label x={322} y={165} text="Vcc" color="#c4b5fd" fontSize={9} anchor="start" />
      <Label x={322} y={178} text="HV 5 V" color="#c4b5fd" fontSize={7} anchor="start" />

      {/* 24V LV rail drops down to feed PROFET source */}
      <line x1={700} y1={104} x2={700} y2={178} stroke="#22c55e" strokeWidth={1.5} strokeDasharray="4 2" />
      <Label x={708} y={142} text="24 V" color="#86efac" fontSize={8} anchor="start" />
      <Label x={708} y={154} text="contactor coil" color="#86efac" fontSize={7} anchor="start" />

      {/* ═══ ROW 2: Signal Chain HV Side ═══ */}

      {/* Battery+ ref */}
      <Block x={25} y={195} w={95} h={40} label="Battery+" sublabel="~160 V (const)" fill="#0f172a" stroke="#3b82f6" fontSize={11} />
      <Arrow x1={120} y1={215} x2={158} y2={215} color="#3b82f6" />

      <Block x={158} y={200} w={95} h={32} label="V. Divider" sublabel="REF (90%)" fill="#1e293b" stroke="#475569" fontSize={10} />
      <Arrow x1={253} y1={216} x2={293} y2={222} color="#f59e0b" />

      {/* MPPT+ DC link */}
      <Block x={25} y={260} w={95} h={40} label="MPPT+" sublabel="DC link (rising)" fill="#0f172a" stroke="#3b82f6" fontSize={11} />
      <Arrow x1={120} y1={280} x2={158} y2={280} color="#3b82f6" />

      <Block x={158} y={265} w={95} h={32} label="V. Divider" sublabel="SPICE-sim'd" fill="#1e293b" stroke="#f59e0b" fontSize={10} />
      <Arrow x1={253} y1={281} x2={293} y2={250} color="#64748b" />
      <Label x={255} y={295} text="Scaled V_mppt" color="#94a3b8" fontSize={7} anchor="start" />

      {/* Comparator */}
      <Block x={293} y={215} w={135} h={50} label="Comparator" sublabel="V_mppt >= 90% V_bat" fill="#1e293b" stroke="#10b981" fontSize={11} />
      <circle cx={315} cy={215} r={3} fill="#a78bfa" />

      {/* Comparator output to OPTO */}
      <Arrow x1={428} y1={240} x2={ISO - 35} y2={240} color="#10b981" />
      <Label x={434} y={230} text="HIGH at 90%" color="#6ee7b7" fontSize={9} anchor="start" />

      {/* OPTO on isolation boundary */}
      <rect x={ISO - 35} y={226} width={70} height={30} rx={6} fill="#27171a" stroke="#ef4444" strokeWidth={1.5} />
      <text x={ISO} y={244} textAnchor="middle" fill="#fca5a5" fontSize={11} fontWeight="600">OPTO</text>

      {/* ═══ ROW 2 continued: LV Signal Chain ═══ */}

      {/* OPTO output to LV divider */}
      <Arrow x1={ISO + 35} y1={240} x2={545} y2={240} color="#22c55e" />
      <Label x={550} y={230} text="24 V logic" color="#86efac" fontSize={8} anchor="start" />

      {/* LV Voltage Divider */}
      <Block x={545} y={222} w={100} h={36} label="LV Divider" sublabel="24 V to 5 V" fill="#1e293b" stroke="#22c55e" fontSize={10} />

      <Arrow x1={645} y1={240} x2={680} y2={240} color="#22c55e" />
      <Label x={650} y={230} text="5 V logic" color="#86efac" fontSize={8} anchor="start" />

      {/* Transistor level-shifter */}
      <Block x={680} y={222} w={90} h={36} label="Transistor" sublabel="level-shifter" fill="#1e293b" stroke="#22c55e" fontSize={10} />

      <Arrow x1={770} y1={240} x2={800} y2={240} color="#22c55e" />
      <circle cx={800} cy={240} r={4} fill="#22c55e" />

      {/* Path A: PROFET drives main +ve */}
      <line x1={800} y1={240} x2={800} y2={195} stroke="#22c55e" strokeWidth={1.5} />
      <Arrow x1={800} y1={195} x2={830} y2={195} color="#22c55e" />

      <Block x={830} y={178} w={85} h={34} label="PROFET" sublabel="high-side" fill="#1e293b" stroke="#22c55e" fontSize={10} />
      {/* 24V enters PROFET source */}
      <line x1={700} y1={178} x2={830} y2={178} stroke="#22c55e" strokeWidth={1} strokeDasharray="4 2" />
      <Arrow x1={915} y1={195} x2={940} y2={195} color="#22c55e" />

      <Block x={940} y={178} w={35} h={34} label="Main" fill="#0f172a" stroke="#22c55e" fontSize={9} />
      <Label x={957} y={220} text="CLOSE" color="#86efac" fontSize={8} fontWeight="600" />

      {/* Path B: P-ch MOSFET deactivates precharge */}
      <line x1={800} y1={240} x2={800} y2={295} stroke="#f59e0b" strokeWidth={1.5} />
      <Arrow x1={800} y1={295} x2={830} y2={295} color="#f59e0b" />

      <Block x={830} y={278} w={85} h={34} label="P-ch FET" fill="#1e293b" stroke="#f59e0b" fontSize={10} />
      <Arrow x1={915} y1={295} x2={940} y2={295} color="#f59e0b" />

      <Block x={940} y={278} w={35} h={34} label="Pre" fill="#0f172a" stroke="#f59e0b" fontSize={9} />
      <Label x={957} y={320} text="OPEN" color="#fbbf24" fontSize={8} fontWeight="600" />

      {/* ═══ ROW 3: Switching Sequence ═══ */}

      <rect x={25} y={340} width={935} height={60} rx={6} fill="#111827" stroke="#374151" strokeWidth={1} />
      <text x={ISO} y={355} textAnchor="middle" fill="#d1d5db" fontSize={10} fontWeight="600">Switching Sequence</text>
      <text x={35} y={371} fill="#94a3b8" fontSize={8}>
        {"1. Precharge contactor closes -> MPPT DC link charges through precharge R -> V_mppt rises toward V_bat"}
      </text>
      <text x={35} y={384} fill="#94a3b8" fontSize={8}>
        {"2. V_mppt hits 90% of V_bat -> HV comparator fires -> opto crosses isolation -> LV divider scales 24 V down to 5 V logic"}
      </text>
      <text x={35} y={397} fill="#94a3b8" fontSize={8}>
        {"3. Transistor switches PROFET gate -> PROFET closes main +ve contactor + P-ch MOSFET opens precharge (simultaneous)"}
      </text>

      {/* Legend */}
      <g transform="translate(25, 430)">
        <rect x={0} y={-5} width={10} height={10} rx={2} fill="#0f172a" stroke="#3b82f6" strokeWidth={1.5} />
        <Label x={16} y={0} text="HV Sense" color="#93c5fd" fontSize={8} anchor="start" />

        <rect x={100} y={-5} width={10} height={10} rx={2} fill="#1e293b" stroke="#22c55e" strokeWidth={1.5} />
        <Label x={116} y={0} text="LV Control / 24 V" color="#86efac" fontSize={8} anchor="start" />

        <rect x={240} y={-5} width={10} height={10} rx={2} fill="#27171a" stroke="#ef4444" strokeWidth={1.5} />
        <Label x={256} y={0} text="Isolation (opto / iso buck)" color="#fca5a5" fontSize={8} anchor="start" />

        <line x1={440} y1={0} x2={455} y2={0} stroke="#a78bfa" strokeWidth={1.5} strokeDasharray="3 2" />
        <Label x={461} y={0} text="HV 5 V rail" color="#c4b5fd" fontSize={8} anchor="start" />

        <rect x={560} y={-5} width={10} height={10} rx={2} fill="#1e293b" stroke="#10b981" strokeWidth={1.5} />
        <Label x={576} y={0} text="Comparator / LED" color="#6ee7b7" fontSize={8} anchor="start" />

        <rect x={700} y={-5} width={10} height={10} rx={2} fill="#1e293b" stroke="#f59e0b" strokeWidth={1.5} />
        <Label x={716} y={0} text="Precharge ctrl" color="#fcd34d" fontSize={8} anchor="start" />
      </g>

      {/* Ground separation note */}
      <g transform="translate(25, 460)">
        <rect x={0} y={-8} width={935} height={24} rx={4} fill="#0f172a" stroke="#ef4444" strokeWidth={1} strokeDasharray="3 2" />
        <text x={10} y={6} fill="#fca5a5" fontSize={8} fontWeight="600">Ground note:</text>
        <text x={80} y={6} fill="#94a3b8" fontSize={8}>HV floating ground (battery-referenced) and LV chassis ground (0 V) share the same PCB but never touch electrically -only across opto / iso buck.</text>
      </g>
    </svg>
  );
}

export default function BlockDiagram({ diagramId }) {
  if (diagramId === "system") return <SystemDiagram />;
  if (diagramId === "hw-verification") return <HWVerificationDiagram />;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <p className="text-gray-500 text-sm">Under Development</p>
    </div>
  );
}
