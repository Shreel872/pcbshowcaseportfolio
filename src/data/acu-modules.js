// ─────────────────────────────────────────────────────────────
// Array Control Unit (ACU) Module Data
//
// Solar vehicle HV precharge controller. Redesign of the previous
// MCU + CAN version. The new version runs entirely on hardware
// verification — no software in the control loop.
//
// Component reference (matches schematic Array Control Unit.pdf):
//   Sheet 1 (ACU_MAIN):
//     U1  — 4-pin optocoupler (HV → LV signal crossing)
//     U2  — RKE-2405S/H (RECOM isolated DC-DC, 24 V → 5 V, 2 W)
//     D1  — SML-D12P8WT86C status LED on HV 5 V rail
//     R15 — 140 Ω status LED current limit (≈20 mA, ~100 mW dummy load)
//     R16 — 75 Ω opto LED current limit
//     C1  — 220 µF bulk cap on LV rail
//     C3  — 100 nF decoupling on iso buck output
//     J1  — LV power input (3-pin MX34003NF1)
//     J2/J3/J4 — HV power connectors (3-pin MX34003NF1, paralleled
//                                     for current and 300 V rating)
//   Sheet 2 (HV):
//     COMP1 — TLV3211QDCKRQ1 push-pull comparator (1 mV hysteresis,
//                                                  rail-to-rail in/out)
//     R1, R3, R5, R7 — 4 × 250 kΩ in series, MPPT divider top leg
//     R2, R4, R6, R8 — 4 × 250 kΩ in series, battery divider top leg
//                      (RNCF0805BTE250K — 0.1% thin-film)
//     R9  — 21.3 kΩ 0.1% (RN73H1JTTD2132B25), battery divider bottom
//     R10 — 23.7 kΩ 1% (RMCF0603FT23K7), MPPT divider bottom
//     C2  — 100 nF comparator decoupling
//   Sheet 3 (LV):
//     U3  — CMOS inverter (single-gate)
//     U4  — BTS441TGATMA1 PROFET (precharge-side high-side switch)
//     U5  — BTS441TGATMA1 PROFET (main-contactor high-side switch)
//     R11/R12 — 12 kΩ / 51 kΩ logic divider for U5 input
//     R13/R14 — 12 kΩ / 51 kΩ logic divider for U4 input (post-inverter)
//     2× Würth 662102145021 contactor-coil output connectors
// ─────────────────────────────────────────────────────────────

export const modules = [
  {
    id: "acu-precharge",
    name: "Array Control Unit",
    shortName: "ACU",
    tabOrder: 0,
    status: "in-progress",

    modelPath: null,
    gerberFiles: [],
    layoutPath: null,
    // Default schematic shown — top level ACU_MAIN sheet.
    schematicPath: "/schematics/ACU-top.pdf",
    // Block hierarchy: each entry is its own PDF so navigation is clean.
    schematicBlocks: [
      {
        id: "top",
        label: "Top Level",
        sublabel: "ACU_MAIN — power + block hierarchy",
        path: "/schematics/ACU-top.pdf",
        role: "parent",
      },
      {
        id: "hv",
        label: "HV Sub-block",
        sublabel: "U_HV — divider + TLV3211 comparator",
        path: "/schematics/ACU-HV.pdf",
        role: "child",
      },
      {
        id: "lv",
        label: "LV Sub-block",
        sublabel: "U_LV — CMOS inverter + 2× BTS441 PROFETs",
        path: "/schematics/ACU-LV.pdf",
        role: "child",
      },
    ],
    photoPath: null,

    blockDiagrams: ["system", "hw-verification"],

    comparison: {
      dutyCycle: "Transitory",
      current: "TBD",
      thermalPriority: "TBD",
    },

    stats: [
      { label: "HV Bus", value: "142.7 V nom" },
      { label: "Trip Threshold", value: "90.08% V_bat" },
      { label: "HV Draw (peak)", value: "~41.9 mW" },
    ],

    purpose:
      "Redesign of the solar vehicle precharge controller — removes the MCU and CAN dependency, replacing the entire control loop with a hardware comparator. A TLV3211 comparator on the HV floating plane fires at 90% V_bat, crosses the isolation barrier via a single optocoupler, and a CMOS inverter splits that one signal into two mutually-exclusive PROFET drives — one closes the main contactor, the other simultaneously opens the precharge contactor.",

    electrical: [
      { label: "HV Bus Voltage", value: "~142.7 V (nominal)" },
      { label: "LV System", value: "24 V (chassis ground)" },
      { label: "HV-Side 5 V Supply", value: "RKE-2405S/H isolated buck (2 W)" },
      { label: "Status LED", value: "SML-D12P8WT86C, 140 Ω limit, ~20 mA" },
      { label: "Iso Buck Min Load", value: "~100 mW (status LED)" },
      { label: "Isolation Method", value: "Optocoupler U1 (single channel, HV→LV)" },
      { label: "Comparator", value: "TLV3211QDCKRQ1 (push-pull, rail-to-rail)" },
      { label: "Contactor Drivers", value: "2× BTS441TGATMA1 PROFET" },
      { label: "Logic Splitter", value: "CMOS inverter U3 (mutually-exclusive)" },
      { label: "Ground Separation", value: "HV floating / LV chassis (0 V)" },
      { label: "CAN Interface", value: "BMU + MPPTs to ECU (monitoring only)" },
      { label: "Precharge Resistor", value: "TBD (limits inrush into MPPT caps)" },
      { label: "Main Contactor", value: "Positive only (BTS441 / U5 driven)" },
      { label: "Precharge Contactor", value: "BTS441 / U4 driven (inverted)" },
      { label: "Threshold", value: "V_mppt DC link ≥ 90% V_bat" },
    ],

    calculations: [
      {
        title: "Battery Reference (V_ref)",
        latex:
          "V_{ref} = V_{bat} \\cdot \\frac{R_9}{R_{1{\\text{-}}top} + R_9} = 142.7 \\cdot \\frac{21{,}300}{1{,}000{,}000 + 21{,}300} \\approx 2.976\\,\\text{V}",
      },
      {
        title: "MPPT Trip Voltage",
        latex:
          "V_{mppt,trip} = V_{ref} \\cdot \\frac{R_{1{\\text{-}}top} + R_{10}}{R_{10}} = 2.976 \\cdot \\frac{1{,}023{,}700}{23{,}700} \\approx 128.55\\,\\text{V}",
      },
      {
        title: "Threshold Ratio",
        latex:
          "\\frac{V_{mppt,trip}}{V_{bat}} = \\frac{128.55}{142.7} \\approx 0.9008 = 90.08\\%",
      },
      {
        title: "HV Divider Current (battery leg)",
        latex:
          "I_{bat} = \\frac{V_{bat}}{R_{1{\\text{-}}top} + R_9} = \\frac{142.7}{1{,}021{,}300} \\approx 139.7\\,\\mu\\text{A}",
      },
      {
        title: "HV Divider Loss (peak, both legs)",
        latex:
          "P_{HV} = \\frac{V_{bat}^2}{R_{1{\\text{-}}top} + R_9} + \\frac{V_{mppt,peak}^2}{R_{1{\\text{-}}top} + R_{10}} \\approx 19.93 + 21.98 = 41.91\\,\\text{mW}",
      },
      {
        title: "Voltage per 250 kΩ Element (peak)",
        latex:
          "V_{per} = I_{mppt,peak} \\cdot R_{each} = 146.5\\,\\mu\\text{A} \\cdot 250{,}000 \\approx 36.6\\,\\text{V}\\;\\text{(well under 150 V part rating)}",
      },
      {
        title: "Status LED Current Limit (R15)",
        latex:
          "R_{15} = \\frac{V_{cc} - V_f}{I_{LED}} = \\frac{5 - 2.2}{0.02} = 140\\,\\Omega \\;\\Rightarrow\\; P_{load} = 5 \\cdot 0.02 = 100\\,\\text{mW}",
      },
      {
        title: "LV Bulk Cap Sizing (C1)",
        latex:
          "C_1 = \\frac{I_{trans} \\cdot \\Delta t}{\\Delta V} = \\frac{0.1 \\cdot 0.001}{0.5} = 200\\,\\mu\\text{F} \\;\\Rightarrow\\; \\text{220 µF / 50 V (std value)}",
      },
    ],

    // ── Before / After comparison (rendered in DecisionCards) ──
    beforeAfter: {
      removed: [
        "MCU + firmware",
        "CAN transceiver on ACU",
        "ECU enable signal",
        "Software threshold",
      ],
      added: [
        "TLV3211 hardware comparator",
        "Single-channel optocoupler",
        "RKE-2405S/H isolated buck",
        "Dual BTS441 PROFETs",
        "CMOS inverter (mutex contactor split)",
      ],
    },

    // ── Design decisions (rendered as DecisionCards) ──
    decisions: [
      {
        title: "Control Loop Method",
        category: "architecture",
        chosen: {
          label: "Pure hardware comparator",
          reason: "Fail-safe without firmware",
        },
        rejected: {
          label: "MCU + CAN (original)",
          reason: "Crash leaves contactor state undefined",
        },
      },
      {
        title: "HV/LV Signal Crossing",
        category: "isolation",
        chosen: {
          label: "Optocoupler (U1)",
          reason: "No galvanic path at 142 V, single signal needs only 1 channel",
        },
        rejected: {
          label: "Digital isolator (ADUM)",
          reason: "Needs matched isolated supply both sides",
        },
      },
      {
        title: "HV-Side Power Supply",
        category: "isolation",
        calcRefs: ["Status LED Current Limit (R15)"],
        chosen: {
          label: "RKE-2405S/H isolated buck (24→5 V, 2 W)",
          reason: "Crosses boundary inside transformer, off-the-shelf",
        },
        rejected: {
          label: "Tap ~142 V bus directly",
          reason: "Huge regulation dissipation",
        },
      },
      {
        title: "HV Threshold Detection",
        category: "component",
        spiceSimLinked: true,
        calcRefs: [
          "Battery Reference (V_ref)",
          "MPPT Trip Voltage",
          "Threshold Ratio",
          "HV Divider Current (battery leg)",
          "HV Divider Loss (peak, both legs)",
          "Voltage per 250 kΩ Element (peak)",
        ],
        chosen: {
          label: "Resistive divider + TLV3211 comparator",
          reason: "Hand-verified threshold, rail-to-rail push-pull output, no firmware",
        },
        rejected: {
          label: "MCU ADC on HV plane",
          reason: "Brings firmware back into safety path",
        },
      },
      {
        title: "Contactor Drivers",
        category: "component",
        chosen: {
          label: "2× BTS441TGATMA1 PROFET",
          reason: "Built-in OC + thermal protection, single part per channel",
        },
        rejected: {
          label: "Discrete N-ch FET + driver IC",
          reason: "Needs bootstrap driver + separate OC circuit per channel",
        },
      },
      {
        title: "Precharge / Main Mutex",
        category: "component",
        chosen: {
          label: "CMOS inverter splits one opto signal",
          reason: "Inverter guarantees the two PROFETs are mutually exclusive — atomic switch with no firmware sequencing",
        },
        rejected: {
          label: "Two opto channels driven by separate logic",
          reason: "Race window between channels, plus extra opto + extra HV-side circuitry",
        },
      },
      {
        title: "Iso Buck Minimum Load",
        category: "power",
        calcRefs: ["Status LED Current Limit (R15)"],
        chosen: {
          label: "Status LED ~20 mA / 100 mW",
          reason: "Keeps RKE in regulation, doubles as HV rail indicator",
        },
        rejected: {
          label: "Dummy resistor",
          reason: "Same thermal cost, no diagnostic value",
        },
      },
      {
        title: "HV Divider Topology",
        category: "component",
        calcRefs: [
          "Voltage per 250 kΩ Element (peak)",
          "HV Divider Loss (peak, both legs)",
        ],
        chosen: {
          label: "4 × 250 kΩ in series per leg",
          reason: "~36.6 V per part — in-spec for 0805 thin-film (RNCF0805BTE250K, 150 V rated)",
        },
        rejected: {
          label: "Single 1 MΩ resistor",
          reason: "Sees ~150 V — forces specialty HV part (1206+, 200 V rated)",
        },
      },
      {
        title: "Ground Plane Strategy",
        category: "isolation",
        chosen: {
          label: "Two grounds, single PCB",
          reason: "Floating HV (battery-ref) and chassis LV on one board, crossed only via U1 opto + U2 iso buck",
        },
        rejected: {
          label: "Two physical PCBs",
          reason: "Adds inter-board connector + cost for no isolation gain",
        },
      },
      {
        title: "Comparator Selection",
        category: "component",
        chosen: {
          label: "TLV3211QDCKRQ1 (push-pull, rail-to-rail)",
          reason: "Rail-to-rail in/out spans the divider range cleanly, push-pull output drives the opto LED directly without an extra pull-up",
        },
        rejected: {
          label: "Generic open-drain comparator (LM393-class)",
          reason: "Needs external pull-up at 1 MΩ source impedance — pull-up tolerances eat margin",
        },
      },
      {
        title: "CAN Bus Role",
        category: "architecture",
        chosen: {
          label: "Keep CAN for BMU/MPPT monitoring",
          reason: "Telemetry stays, but CAN no longer gates contactor state",
        },
        rejected: {
          label: "Remove CAN entirely from ACU",
          reason: "Loses useful diagnostics — BMU/MPPT data has non-safety value",
        },
      },
      {
        title: "HV Connectors",
        category: "component",
        chosen: {
          label: "3× MX34003NF1 (J2–J4) paralleled",
          reason: "Splits VBAT / VSOL / GHV across separate 3-pin connectors so each pin stays inside the 300 V connector rating",
        },
        rejected: {
          label: "Single multi-pin HV header",
          reason: "Forces a connector rated above 300 V, larger footprint, lower availability",
        },
      },
    ],

    designConsiderations: [
      "HV and LV share the same PCB but use two separate ground planes. HV side (GHV) is a floating ground referenced to the battery pack negative, LV side (GLV) is chassis grounded to 0 V. Nothing galvanic can connect the two planes or the whole isolation story falls apart.",
      "Optocoupler U1 sits on the HV/LV boundary. Emitter side lives on the HV plane with the comparator output (driven through R16 = 75 Ω current limit), phototransistor side lives on the LV plane and sources OPTO_OUT1. Light across the gap is the only path for the control signal.",
      "U2 = RKE-2405S/H isolated buck takes the LV 24 V rail and delivers 5 V onto the HV floating ground plane to power the comparator. Galvanic isolation is built into the converter transformer so the HV and LV grounds stay separate.",
      "D1 status LED hangs off the HV 5 V rail through R15 = 140 Ω, drawing ~20 mA (~100 mW). Isolated bucks need a minimum load to stay in regulation and the LED guarantees that baseline draw. Also doubles as a visual indicator that the HV side is powered.",
      "HV voltage dividers scale MPPT and battery down into comparator input range (≈3 V). Both top legs are 4 × 250 kΩ in series (RNCF0805BTE250K, 0.1% thin-film). Bottom legs use R9 = 21.3 kΩ (battery, RN73 0.1%) and R10 = 23.7 kΩ (MPPT, RMCF 1%). Hand-calculated trip lands at 90.08% of V_bat — verified by the animated walk-through on this site.",
      "Comparator COMP1 = TLV3211QDCKRQ1. Picked for rail-to-rail input (so the ~3 V tap voltages are inside the linear range against a 5 V supply) and push-pull output (no external pull-up needed to drive the opto LED). C2 = 100 nF decoupling sits at the V+ pin.",
      "On the LV side a single CMOS inverter U3 splits OPTO_OUT1 into two mutually-exclusive logic signals — one inverted, one direct. Each signal feeds a 12 kΩ / 51 kΩ divider that scales 24 V logic down into the BTS441 IN-pin range.",
      "U5 = BTS441TGATMA1 PROFET drives the main +ve contactor coil from 24 V (active when OPTO is HIGH = post-precharge). U4 = BTS441TGATMA1 drives the precharge contactor coil (active when OPTO is LOW = precharging). The inverter guarantees these are never both on at the same time.",
      "Output to the contactor coils goes through 2-pin Würth 662102145021 connectors. Coils are external so the contactors themselves can be mounted on the chassis with their own kickback protection.",
      "ECU still gets CAN data from the BMU and the MPPTs for logging and monitoring, but it no longer drives the contactors. Whole control loop is hardware, so if firmware crashes or CAN drops, the ACU still does the right thing.",
      "Precharge path is fuse, precharge resistor, precharge contactor. Resistor value picked to limit peak inrush into the MPPT bulk output capacitors while still letting the DC link ramp up in a reasonable time.",
      "If the comparator output drops back to LOW for any reason (voltage drift, sensor fault) the opto turns off, U5 releases the main contactor, the inverter re-enables U4 and the system falls back to precharge-only. Fail-safe state is precharge-active, no software involved.",
      "C1 = 220 µF on the LV rail handles transient current draw on contactor energise (calc: 100 mA × 1 ms / 0.5 V droop = 200 µF, rounded up to 220 µF / 50 V std).",
    ],

    improvements: [
      "Add current-sense feedback on the precharge resistor to detect stuck contactors before closing main",
      "Move the status LED onto its own regulated rail so iso-buck minimum-load behaviour is independent of LED health",
      "Add a hardware watchdog retriggered by the comparator output — forces contactors open on prolonged threshold oscillation",
      "Conformal-coat the HV plane and increase creepage under the 250 kΩ stack for automotive-grade HV compliance",
      "Use a dual-channel PROFET so the two contactor channels share a diagnostic pin and one BOM line",
      "Add hysteresis externally around the TLV3211 to harden against ripple at the 90% trip point (the part has only ~1 mV internal hysteresis)",
    ],

    tradeoff: {
      title: "Pure Hardware vs. MCU-Driven Control",
      text:
        "The original ACU drove contactors from firmware over CAN — a firmware crash left contactor state undefined. The redesign moves the entire control loop into hardware: TLV3211 comparator fires at 90% V_bat, single opto crosses the isolation barrier, CMOS inverter splits the signal into a mutually-exclusive PROFET pair (U4 precharge / U5 main). You lose threshold flexibility (resistors instead of config registers) but gain a guaranteed fail-safe with zero software dependencies and an atomic precharge→main handoff that no firmware sequencer can race.",
    },
  },
];

export const getModuleById = (id) => modules.find((m) => m.id === id);
export default modules;
