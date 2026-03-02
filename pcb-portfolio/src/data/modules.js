// ─────────────────────────────────────────────────────────────
// Automotive Lighting PCB Module Data
//
// Each module represents one PCB in the lighting product family.
// Edit the engineering content below — the UI reads from here.
//
// modelPath   → .glb file in public/models/ (null = placeholder)
// gerberFiles → array of paths in public/gerbers/<id>/
// photoPath   → real photo of assembled PCB (null = "coming soon")
// calculations[].latex → KaTeX strings (use \\ to escape backslash)
// ─────────────────────────────────────────────────────────────

export const modules = [
  // ── 1. Central Brake (CHMSL) ─────────────────────────────
  {
    id: "central-brake",
    name: "Central Brake Light",
    shortName: "CHMSL",
    tabOrder: 0,

    modelPath: "/models/CENTBRAKE.glb",
    gerberFiles: [],
    photoPath: null,

    comparison: {
      dutyCycle: "Continuous",
      current: "350 mA",
      thermalPriority: "High",
    },

    purpose:
      "High-mount centre brake light providing clear braking indication to following vehicles. Designed for continuous duty when the brake pedal is applied, with emphasis on thermal management due to sustained current draw.",

    electrical: [
      { label: "Input Voltage", value: "12 V nominal (9–16 V)" },
      { label: "LED Forward Voltage", value: "3.2 V (typical)" },
      { label: "Target Current", value: "350 mA" },
      { label: "Duty Type", value: "Continuous DC" },
    ],

    calculations: [
      {
        title: "Resistor Sizing",
        latex:
          "R = \\frac{V_{in} - V_f}{I} = \\frac{12 - 3.2}{0.35} = 25.1\\,\\Omega",
      },
      {
        title: "Power Dissipation",
        latex:
          "P = I^2 R = (0.35)^2 \\times 25.1 = 3.07\\,\\text{W}",
      },
      {
        title: "Thermal Estimate",
        latex:
          "T_{rise} = P \\times R_{\\theta} \\approx 3.07 \\times 40 = 122.8\\,°\\text{C}",
      },
    ],

    designConsiderations: [
      "Continuous operation → thermal management dominates design",
      "Copper pour under LED pad for heat spreading",
      "Trace width sized for 350 mA continuous",
      "Automotive voltage swing (9–16 V) considered in worst-case calcs",
      "Board outline constrained by housing geometry",
    ],

    improvements: [
      "Add TVS diode for transient voltage protection",
      "Replace resistor with constant-current driver for efficiency",
      "Add reverse polarity protection (P-FET or Schottky)",
      "Thermal vias under LED for improved heat sinking",
    ],

    tradeoff: {
      title: "Simplicity vs. Efficiency",
      text:
        "Chose resistor-based current limiting due to simplicity and low component count. Efficiency trade-off acceptable at this power level (~3 W dissipation). A constant-current driver would reduce heat but adds BOM cost and layout complexity.",
    },
  },

  // ── 2. Rear Stop ─────────────────────────────────────────
  {
    id: "rear-stop",
    name: "Rear Stop Light",
    shortName: "Rear Stop",
    tabOrder: 1,

    modelPath: null,
    gerberFiles: [],
    photoPath: null,

    comparison: {
      dutyCycle: "Intermittent",
      current: "300 mA",
      thermalPriority: "Medium",
    },

    purpose:
      "Rear stop lamp activated when the brake pedal is pressed. Intermittent duty cycle allows slightly relaxed thermal requirements compared to the CHMSL.",

    electrical: [
      { label: "Input Voltage", value: "12 V nominal (9–16 V)" },
      { label: "LED Forward Voltage", value: "3.0 V (typical)" },
      { label: "Target Current", value: "300 mA" },
      { label: "Duty Type", value: "Intermittent" },
    ],

    calculations: [
      {
        title: "Resistor Sizing",
        latex:
          "R = \\frac{V_{in} - V_f}{I} = \\frac{12 - 3.0}{0.30} = 30\\,\\Omega",
      },
      {
        title: "Power Dissipation",
        latex: "P = I^2 R = (0.30)^2 \\times 30 = 2.7\\,\\text{W}",
      },
    ],

    designConsiderations: [
      "Intermittent duty reduces average thermal load",
      "Copper pour still recommended for transient peaks",
      "Shared housing footprint with tail light assembly",
      "Connector pinout matched to vehicle harness spec",
    ],

    improvements: [
      "Integrate with tail light on a single board",
      "Add current-sense feedback for diagnostics",
      "Consider ceramic substrate for better thermal performance",
    ],

    tradeoff: {
      title: "Discrete vs. Integrated",
      text:
        "Kept as a standalone module for this revision to simplify testing and assembly. Integrating with the tail light PCB in v2 would reduce connector count and overall cost.",
    },
  },

  // ── 3. Front Indicator ────────────────────────────────────
  {
    id: "front-indicator",
    name: "Front Indicator",
    shortName: "Front Ind.",
    tabOrder: 2,

    modelPath: null,
    gerberFiles: [],
    photoPath: null,

    comparison: {
      dutyCycle: "Flashing (1.5 Hz)",
      current: "120 mA",
      thermalPriority: "Low",
    },

    purpose:
      "Front turn signal indicator operating at ~1.5 Hz flash rate. Low average power due to 50% duty cycle flashing, so thermal requirements are minimal.",

    electrical: [
      { label: "Input Voltage", value: "12 V nominal (9–16 V)" },
      { label: "LED Forward Voltage", value: "2.1 V (amber)" },
      { label: "Target Current", value: "120 mA (peak)" },
      { label: "Duty Type", value: "50% flashing at 1.5 Hz" },
    ],

    calculations: [
      {
        title: "Resistor Sizing",
        latex:
          "R = \\frac{V_{in} - V_f}{I} = \\frac{12 - 2.1}{0.12} = 82.5\\,\\Omega",
      },
      {
        title: "Average Power",
        latex:
          "P_{avg} = \\frac{1}{2} \\cdot I^2 R = \\frac{1}{2} \\cdot (0.12)^2 \\times 82.5 = 0.59\\,\\text{W}",
      },
    ],

    designConsiderations: [
      "Flashing duty cycle halves average thermal dissipation",
      "Amber LED wavelength spec per ECE R6 regulation",
      "Flash rate controlled by external relay/BCM",
      "Wide input voltage range for load-dump survivability",
    ],

    improvements: [
      "Add onboard flasher IC to eliminate relay dependency",
      "Implement LED open/short fault detection",
      "Add EMC filtering for radiated emissions compliance",
    ],

    tradeoff: {
      title: "External vs. Onboard Flash Control",
      text:
        "Used external BCM flash control to keep the PCB simple and reduce BOM. Onboard flasher IC would add independence but increases component count and firmware complexity.",
    },
  },

  // ── 4. Side Indicator ─────────────────────────────────────
  {
    id: "side-indicator",
    name: "Side Indicator",
    shortName: "Side Ind.",
    tabOrder: 3,

    modelPath: null,
    gerberFiles: [],
    photoPath: null,

    comparison: {
      dutyCycle: "Flashing (1.5 Hz)",
      current: "80 mA",
      thermalPriority: "Low",
    },

    purpose:
      "Side-mounted repeater indicator for turn signal visibility from the side profile. Compact form factor with minimal power requirements.",

    electrical: [
      { label: "Input Voltage", value: "12 V nominal (9–16 V)" },
      { label: "LED Forward Voltage", value: "2.1 V (amber)" },
      { label: "Target Current", value: "80 mA (peak)" },
      { label: "Duty Type", value: "50% flashing at 1.5 Hz" },
    ],

    calculations: [
      {
        title: "Resistor Sizing",
        latex:
          "R = \\frac{V_{in} - V_f}{I} = \\frac{12 - 2.1}{0.08} = 123.75\\,\\Omega",
      },
      {
        title: "Average Power",
        latex:
          "P_{avg} = \\frac{1}{2} \\cdot I^2 R = \\frac{1}{2} \\cdot (0.08)^2 \\times 123.75 = 0.40\\,\\text{W}",
      },
    ],

    designConsiderations: [
      "Extremely compact PCB — packaging-constrained design",
      "Single LED, minimal component count",
      "Conformal coating recommended for water ingress protection",
      "Board shape follows lens cavity geometry",
    ],

    improvements: [
      "Move to flex PCB for tighter packaging",
      "Add potting for IP67 sealing",
      "Consider integrated LED+driver module",
    ],

    tradeoff: {
      title: "Rigid vs. Flex PCB",
      text:
        "Chose rigid FR4 for lower cost and simpler manufacturing. Flex PCB would allow better fit in the tight housing cavity but increases fabrication cost significantly for low volumes.",
    },
  },

  // ── 5. Daytime Running Light (DRL) ────────────────────────
  {
    id: "drl",
    name: "Daytime Running Light",
    shortName: "DRL",
    tabOrder: 4,

    modelPath: null,
    gerberFiles: [],
    photoPath: null,

    comparison: {
      dutyCycle: "Continuous",
      current: "150 mA",
      thermalPriority: "High",
    },

    purpose:
      "Continuous daytime running light for high visibility in the white spectrum. Always on when the vehicle is running, so thermal management and efficiency are critical design drivers.",

    electrical: [
      { label: "Input Voltage", value: "12 V nominal (9–16 V)" },
      { label: "LED Forward Voltage", value: "3.1 V (white)" },
      { label: "Target Current", value: "150 mA" },
      { label: "Duty Type", value: "Continuous DC" },
    ],

    calculations: [
      {
        title: "Resistor Sizing",
        latex:
          "R = \\frac{V_{in} - V_f}{I} = \\frac{12 - 3.1}{0.15} = 59.3\\,\\Omega",
      },
      {
        title: "Power Dissipation",
        latex:
          "P = I^2 R = (0.15)^2 \\times 59.3 = 1.33\\,\\text{W}",
      },
      {
        title: "Worst Case (14.4 V)",
        latex:
          "R_{14.4} = \\frac{14.4 - 3.1}{0.15} = 75.3\\,\\Omega \\quad P = (0.15)^2 \\times 75.3 = 1.69\\,\\text{W}",
      },
    ],

    designConsiderations: [
      "Continuous operation → thermal management is the primary concern",
      "Copper pour area sized to dissipate ~1.7 W at worst case",
      "Trace width sized for 150 mA continuous",
      "Automotive voltage swing considered in all calculations",
      "White LED colour temperature per ECE R87 regulation",
    ],

    improvements: [
      "Add TVS diode for transient protection",
      "Use constant-current driver for better efficiency",
      "Add reverse polarity protection",
      "Consider PWM dimming for adaptive brightness",
    ],

    tradeoff: {
      title: "Thermal vs. Cost",
      text:
        "Chose resistor-based current limiting due to simplicity and low component count. Efficiency trade-off acceptable at this power level. Copper pour area provides adequate thermal dissipation without requiring an external heatsink.",
    },
  },
];

export const getModuleById = (id) => modules.find((m) => m.id === id);
export default modules;
