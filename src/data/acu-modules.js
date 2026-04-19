// ─────────────────────────────────────────────────────────────
// Array Control Unit (ACU) Module Data
//
// Solar vehicle HV precharge controller. Redesign of the previous
// MCU + CAN version. The new version runs entirely on hardware
// verification — no software in the control loop.
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
    schematicPath: null,
    photoPath: null,

    blockDiagrams: ["system", "hw-verification"],

    comparison: {
      dutyCycle: "Transitory",
      current: "TBD",
      thermalPriority: "TBD",
    },

    stats: [
      { label: "HV Bus", value: "142.7 V nom" },
      { label: "Trip Threshold", value: "90.3% V_bat" },
      { label: "HV Draw (peak)", value: "~42 mW" },
    ],

    purpose:
      "Redesign of the solar vehicle precharge controller — removes the MCU and CAN dependency, replacing the entire control loop with a hardware comparator. A comparator on the HV floating plane fires at 90% V_bat, crosses the isolation barrier via optocoupler, and drives a PROFET to close the main contactor while simultaneously opening the precharge path.",

    electrical: [
      { label: "HV Bus Voltage", value: "~160 V (nominal)" },
      { label: "LV System", value: "24 V (chassis ground)" },
      { label: "HV-Side 5 V Supply", value: "24 V to 5 V isolated buck" },
      { label: "Status LED Current", value: "~100 mA (HV 5 V rail)" },
      { label: "Isolation Method", value: "Optocoupler (HV to LV signal)" },
      { label: "LV Opto Divider", value: "24 V down to 5 V (resistive)" },
      { label: "PROFET Gate Drive", value: "Transistor level-shifter on 24 V" },
      { label: "Ground Separation", value: "HV floating / LV chassis (0 V)" },
      { label: "CAN Interface", value: "BMU + MPPTs to ECU (monitoring only)" },
      { label: "Precharge Resistor", value: "TBD (limits inrush into MPPT caps)" },
      { label: "Main Contactor", value: "Positive only (PROFET-driven)" },
      { label: "Precharge Contactor", value: "P-ch FET deactivated on charge" },
      { label: "Threshold", value: "V_mppt DC link >= 90% V_bat" },
    ],

    calculations: [
      {
        title: "Battery Reference (V_ref)",
        latex:
          "V_{ref} = V_{bat} \\cdot \\frac{R_4}{R_1 + R_4} = 142.7 \\cdot \\frac{21{,}200}{1{,}000{,}000 + 21{,}200} \\approx 2.962\\,\\text{V}",
      },
      {
        title: "MPPT Trip Voltage",
        latex:
          "V_{mppt,trip} = V_{ref} \\cdot \\frac{R_1 + R_3}{R_3} = 2.962 \\cdot \\frac{1{,}023{,}500}{23{,}500} \\approx 128.91\\,\\text{V}",
      },
      {
        title: "Threshold Ratio",
        latex:
          "\\frac{V_{mppt,trip}}{V_{bat}} = \\frac{128.91}{142.7} \\approx 0.903 = 90.3\\%",
      },
      {
        title: "HV Divider Current (battery leg)",
        latex:
          "I_{bat} = \\frac{V_{bat}}{R_1 + R_4} = \\frac{142.7}{1{,}021{,}200} \\approx 139.7\\,\\mu\\text{A}",
      },
      {
        title: "HV Divider Loss (peak, both legs)",
        latex:
          "P_{HV} = \\frac{V_{bat}^2}{R_1 + R_4} + \\frac{V_{mppt,peak}^2}{R_1 + R_3} \\approx 19.9 + 22.0 = 41.9\\,\\text{mW}",
      },
      {
        title: "Voltage per 250 kΩ Element (peak)",
        latex:
          "V_{per} = I_{mppt,peak} \\cdot R_{each} = 146.6\\,\\mu\\text{A} \\cdot 250{,}000 \\approx 36.6\\,\\text{V}\\;\\text{(well under 150 V part rating)}",
      },
      {
        title: "Iso-Buck Minimum Load (status LED)",
        latex:
          "P_{min} = V_{out} \\cdot I_{LED} = 5 \\cdot 0.1 = 0.5\\,\\text{W}\\;\\text{(keeps buck in regulation)}",
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
        "Hardware comparator",
        "Optocoupler isolation",
        "Isolated 24 → 5 V buck",
        "PROFET high-side driver",
        "P-ch MOSFET precharge",
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
          label: "Optocoupler",
          reason: "No galvanic path at 160 V",
        },
        rejected: {
          label: "Digital isolator (ADUM)",
          reason: "Needs matched isolated supply both sides",
        },
      },
      {
        title: "HV-Side Power Supply",
        category: "isolation",
        calcRefs: ["Iso-Buck Minimum Load (status LED)"],
        chosen: {
          label: "Isolated 24 → 5 V buck",
          reason: "Crosses boundary inside transformer",
        },
        rejected: {
          label: "Tap ~160 V bus directly",
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
          label: "Resistive divider + comparator",
          reason: "SPICE-verified, no firmware needed",
        },
        rejected: {
          label: "MCU ADC on HV plane",
          reason: "Brings firmware back into safety path",
        },
      },
      {
        title: "Main Contactor Driver",
        category: "component",
        chosen: {
          label: "PROFET",
          reason: "Built-in OC protection, single part",
        },
        rejected: {
          label: "Discrete N-ch FET + driver",
          reason: "Needs bootstrap driver + separate OC",
        },
      },
      {
        title: "Precharge Deactivation",
        category: "component",
        chosen: {
          label: "P-ch MOSFET (simultaneous)",
          reason: "Same gate node — atomic switch",
        },
        rejected: {
          label: "Second PROFET or relay",
          reason: "Sequencing window, relay bounce",
        },
      },
      {
        title: "Iso Buck Minimum Load",
        category: "power",
        calcRefs: ["Iso-Buck Minimum Load (status LED)"],
        chosen: {
          label: "Status LED (~100 mA)",
          reason: "Keeps reg, doubles as HV rail indicator",
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
          reason: "~36.6 V per part — in-spec for 0603 thick-film (75–150 V)",
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
          reason: "Floating HV and chassis LV on one board, crossed only via opto + iso buck",
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
          label: "LT1720 (2 µA bias typ)",
          reason: "1 MΩ source impedance demands low bias — layout uses guard rings",
        },
        rejected: {
          label: "Generic LM393-class comparator",
          reason: "Input bias shifts divider ratio outside tolerance at 1 MΩ",
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
        title: "LV Opto Output Scaling",
        category: "power",
        chosen: {
          label: "Resistive divider (24 V → 5 V)",
          reason: "mA-range opto current makes I²R loss negligible, saves a reg IC",
        },
        rejected: {
          label: "Dedicated 5 V linear regulator",
          reason: "Cleaner tolerance but extra BOM line for marginal gain",
        },
      },
    ],

    designConsiderations: [
      "HV and LV share the same PCB but use two separate ground planes. HV side is a floating ground referenced to the battery pack negative, LV side is chassis grounded to 0 V. Nothing galvanic can connect the two planes or the whole isolation story falls apart.",
      "Optocoupler sits on the HV/LV boundary. Emitter side lives on the HV plane with the comparator output, phototransistor side lives on the LV plane. Light across the gap is the only path for the control signal.",
      "24 V to 5 V isolated buck converter takes the LV rail and delivers 5 V onto the HV floating ground plane. This powers the comparator and supporting circuitry. Galvanic isolation is built into the converter transformer so the HV and LV grounds stay separate.",
      "Status LED hung off the HV 5 V rail pulling around 100 mA. Isolated bucks need a minimum load to stay in regulation and the LED guarantees that baseline current draw. Also doubles as a visual indicator that the HV side is powered.",
      "HV voltage divider scales the MPPT DC link voltage down into comparator input range. This divider has been SPICE-simulated to nail the ratio and confirm the threshold lands at 90% of V_bat across the expected range. Shown as an interactive simulator on the site.",
      "LV-side voltage divider drops the 24 V opto output down to around 5 V for the logic. A linear reg or level-shifter IC would be cleaner but the resistive divider is cheap and the current draw through it is small, so the I^2R loss is negligible.",
      "Transistor between the opto output and the PROFET gate. The opto gives a logic-level signal and the PROFET needs the full 24 V rail to switch properly, so a small BJT or MOSFET level-shifts it. Keeps the opto output loading low and gives a clean gate drive.",
      "PROFET (smart high-side switch) drives the main +ve contactor off the 24 V rail. Built-in overcurrent protection and diagnostic feedback, which is cleaner than discrete FET + driver.",
      "P-channel MOSFET deactivates the precharge contactor when the PROFET enables. Precharge opens as main closes, at the same time, which is why no negative contactor is needed.",
      "ECU still gets CAN data from the BMU and the MPPTs for logging and monitoring, but it no longer drives the contactors. Whole control loop is hardware, so if firmware crashes or CAN drops, the ACU still does the right thing.",
      "Precharge path is fuse, precharge resistor, precharge contactor. Resistor value picked to limit peak inrush into the MPPT bulk output capacitors while still letting the DC link ramp up in a reasonable time.",
      "If the comparator output drops back to LOW for any reason (voltage drift, sensor fault) the opto turns off, the PROFET gate loses drive, main opens and the P-ch re-activates precharge. Fail-safe state is precharge-only, no software involved.",
    ],

    improvements: [
      "Replace resistive LV opto divider with a dedicated 5 V linear reg for tighter tolerance across the 24 V rail range",
      "Add current-sense feedback on the precharge resistor to detect stuck contactors before closing main",
      "Move the status LED onto its own regulated rail so iso-buck minimum-load behaviour is independent of LED health",
      "Add a hardware watchdog retriggered by the comparator output — forces contactors open on prolonged threshold oscillation",
      "Conformal-coat the HV plane and increase creepage under the 250 kΩ stack for automotive-grade HV compliance",
      "Swap single-channel PROFET for a dual-channel variant so precharge FET and main contactor share diagnostic bus",
    ],

    tradeoff: {
      title: "Pure Hardware vs. MCU-Driven Control",
      text:
        "The original ACU drove contactors from firmware over CAN — a firmware crash left contactor state undefined. The redesign moves the entire control loop into hardware: comparator fires at 90% V_bat, opto crosses the isolation barrier, PROFET closes the main contactor. You lose threshold flexibility (resistors instead of config registers) but gain a guaranteed fail-safe with zero software dependencies.",
    },
  },
];

export const getModuleById = (id) => modules.find((m) => m.id === id);
export default modules;
