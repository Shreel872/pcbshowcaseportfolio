// ─────────────────────────────────────────────────────────────
// Automotive Lighting PCB Module Data
//
// Each module represents one PCB in the lighting product family.
// Edit the engineering content below — the UI reads from here.
//
// modelPath      → .glb file in public/models/ (null = placeholder)
// gerberFiles    → array of paths in public/gerbers/<id>/
// layoutPath     → Altium copper pour screenshot in public/images/ (null = hidden)
// schematicPath  → schematic screenshot in public/images/ (null = "coming soon")
// photoPath      → real photo of assembled PCB (null = "coming soon")
// calculations[].latex → KaTeX strings (use \\ to escape backslash)
// ─────────────────────────────────────────────────────────────

export const modules = [
  // ── 1. Central Brake (CHMSL) ─────────────────────────────
  {
    id: "central-brake",
    name: "Central Brake Light",
    shortName: "CHMSL",
    tabOrder: 0,

    modelPath: "/models/central Brake Light.glb",
    gerberFiles: [
      "/gerbers/central-brake/cbl.GTL",
      "/gerbers/central-brake/cbl.GBL",
      "/gerbers/central-brake/cbl.GTO",
      "/gerbers/central-brake/cbl.GBO",
      "/gerbers/central-brake/cbl.GTS",
      "/gerbers/central-brake/cbl.GBS",
      "/gerbers/central-brake/cbl.GM1",
    ],
    layoutPath: "/images/Central Brake Altium Image.png",
    schematicPath: null,
    photoPath: null,

    comparison: {
      dutyCycle: "Continuous",
      current: "140 mA",
      thermalPriority: "Medium",
    },

    purpose:
      "High-mount centre stop lamp (UNECE Category S3) mounted inside the vehicle, providing clear braking indication to following vehicles. Designed to meet BWSC Section 2.23 lighting regulations with a luminous intensity between 25–110 cd. 5 series-connected red LEDs driven at 140 mA through a single resistor-limited branch.",

    electrical: [
      { label: "Supply Voltage", value: "13.8 V (12 V battery actual)" },
      { label: "LED", value: "JE2835ARD (2.25 V, 140 mA, 27.2 lm)" },
      { label: "Configuration", value: "5 LEDs in series, 1 branch" },
      { label: "Load Resistor", value: "18.2 Ω (E96 selected)" },
      { label: "UNECE Category", value: "S3 (25–110 cd)" },
      { label: "Duty Type", value: "Continuous DC" },
    ],

    calculations: [
      {
        title: "Lumens to Candela",
        latex:
          "\\Omega = 2\\pi(1 - \\cos\\tfrac{122°}{2}) = 2\\pi(1 - \\cos 61°) \\approx 3.238\\,\\text{sr} \\quad I_{LED} = \\frac{\\Phi}{\\Omega} = \\frac{27.2}{3.238} = 8.40\\,\\text{cd}",
      },
      {
        title: "Target Luminous Intensity",
        latex:
          "I_{target} = 1.25 \\times I_{min} \\times F = 1.25 \\times 25 \\times 1.33 = 41.56\\,\\text{cd}",
      },
      {
        title: "LEDs Required",
        latex:
          "N = \\left\\lceil \\frac{I_{target}}{I_{LED}} \\right\\rceil = \\left\\lceil \\frac{41.56}{8.40} \\right\\rceil = 5\\,\\text{LEDs}",
      },
      {
        title: "Resistor Sizing",
        latex:
          "R = \\frac{V_{supply} - N \\cdot V_f}{I_f} = \\frac{13.8 - 5 \\times 2.25}{0.14} = \\frac{2.55}{0.14} = 18.21\\,\\Omega \\;\\rightarrow\\; 18.2\\,\\Omega",
      },
      {
        title: "Total Power Dissipation",
        latex:
          "P_{total} = V_{supply} \\times I_f = 13.8 \\times 0.14 = 1.932\\,\\text{W}",
      },
      {
        title: "Resistor Power",
        latex:
          "P_R = (V_{supply} - N \\cdot V_f) \\times I_f = 2.55 \\times 0.14 = 0.357\\,\\text{W}",
      },
    ],

    designConsiderations: [
      "UNECE Category S3 — luminous intensity 25–110 cd per R148",
      "Target set at 125% of minimum with 1.33 fudge factor for optical losses",
      "5 LEDs in series on single branch — simplifies layout and current matching",
      "13.8 V actual battery voltage used for nominal calculations",
      "Copper pour under LED pads for heat spreading at 1.93 W total dissipation",
      "Board outline constrained by housing geometry",
      "Initial prototyping on FR4, production target is aluminium-backed IMS for thermal conduction",
    ],

    improvements: [
      "Migrate to aluminium IMS substrate for production thermal performance",
      "Add TVS diode for transient voltage protection",
      "Replace resistor with constant-current driver for efficiency",
      "Add reverse polarity protection (P-FET or Schottky)",
      "Thermal vias under LED pads for improved heat sinking on FR4 revision",
    ],

    tradeoff: {
      title: "FR4 vs. Aluminium IMS",
      text:
        "Initial implementation on FR4 for cost-effective bench harness prototyping. Production revision targets aluminium-backed IMS substrate to improve thermal conduction from the LED pads. Resistor-based current limiting chosen for simplicity — total dissipation of 1.93 W is manageable with copper pour on FR4, but IMS eliminates thermal risk entirely.",
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
    layoutPath: null,
    schematicPath: null,
    photoPath: null,

    comparison: {
      dutyCycle: "Intermittent",
      current: "2 × 140 mA",
      thermalPriority: "Medium",
    },

    purpose:
      "Rear stop lamp activated when the brake pedal is pressed. UNECE Category S3 compliant with luminous intensity between 25–110 cd. 10 red LEDs across 2 parallel branches of 5 series LEDs, each branch driven at 140 mA through a resistor-limited topology.",

    electrical: [
      { label: "Supply Voltage", value: "13.8 V (12 V battery actual)" },
      { label: "LED", value: "JE2835ARD (2.25 V, 140 mA, 27.2 lm)" },
      { label: "Configuration", value: "10 LEDs — 2 branches × 5 series" },
      { label: "Load Resistor", value: "18.2 Ω per branch (selected)" },
      { label: "UNECE Category", value: "S3 (25–110 cd)" },
      { label: "Duty Type", value: "Intermittent" },
    ],

    calculations: [
      {
        title: "Lumens to Candela",
        latex:
          "\\Omega = 2\\pi(1 - \\cos\\tfrac{122°}{2}) \\approx 3.238\\,\\text{sr} \\quad I_{LED} = \\frac{27.2}{3.238} = 8.40\\,\\text{cd}",
      },
      {
        title: "Target Luminous Intensity",
        latex:
          "I_{target} = 1.25 \\times I_{min} \\times F = 1.25 \\times 50 \\times 1.33 = 62.5\\,\\text{cd}",
      },
      {
        title: "LEDs Required",
        latex:
          "N = \\left\\lceil \\frac{I_{target}}{I_{LED}} \\right\\rceil = \\left\\lceil \\frac{62.5}{8.40} \\right\\rceil = 10\\,\\text{LEDs}",
      },
      {
        title: "Branch Configuration",
        latex:
          "\\text{Max LEDs/branch} = 6 \\;\\Rightarrow\\; \\text{Branches} = \\left\\lceil \\frac{10}{6} \\right\\rceil = 2 \\;\\;(5\\,\\text{LEDs each})",
      },
      {
        title: "Load Resistance (per branch)",
        latex:
          "R = \\frac{V_{supply} - N_{branch} \\cdot V_f}{I_f} = \\frac{13.8 - 5 \\times 2.25}{0.14} = 18.21\\,\\Omega \\;\\rightarrow\\; 18.2\\,\\Omega",
      },
      {
        title: "Total Power Dissipation",
        latex:
          "P_{total} = 2 \\times V_{supply} \\times I_f = 2 \\times 13.8 \\times 0.14 = 3.864\\,\\text{W}",
      },
    ],

    designConsiderations: [
      "UNECE Category S3 — luminous intensity 25–110 cd per R148",
      "Target set at 125% of minimum with 1.33 factor of safety",
      "2 parallel branches of 5 LEDs — matched current through shared resistor values",
      "Intermittent duty reduces average thermal load vs continuous CHMSL",
      "Copper pour under LED pads for transient thermal peaks",
      "Shared housing footprint with tail light assembly",
    ],

    improvements: [
      "Integrate with tail light on a single board to reduce connector count",
      "Add current-sense feedback for LED diagnostics",
      "Migrate to aluminium IMS substrate for production",
    ],

    tradeoff: {
      title: "Discrete vs. Integrated",
      text:
        "Kept as a standalone module for this revision to simplify testing and assembly. 2-branch parallel topology ensures current matching. Integrating with the tail light PCB in v2 would reduce connector count and overall BOM cost.",
    },
  },

  // ── 3. Front Indicator ────────────────────────────────────
  {
    id: "front-indicator",
    name: "Front Indicator",
    shortName: "Front Ind.",
    tabOrder: 2,

    modelPath: "/models/fdi.glb",
    gerberFiles: [
      "/gerbers/front-ind/PCB_FRONT_DIR_LIGHT.GTL",
      "/gerbers/front-ind/PCB_FRONT_DIR_LIGHT.GBL",
      "/gerbers/front-ind/PCB_FRONT_DIR_LIGHT.GTO",
      "/gerbers/front-ind/PCB_FRONT_DIR_LIGHT.GBO",
      "/gerbers/front-ind/PCB_FRONT_DIR_LIGHT.GTS",
      "/gerbers/front-ind/PCB_FRONT_DIR_LIGHT.GBS",
      "/gerbers/front-ind/PCB_FRONT_DIR_LIGHT.GM1",
    ],
    layoutPath: null,
    schematicPath: null,
    photoPath: null,

    comparison: {
      dutyCycle: "Flashing (1.5 Hz)",
      current: "3 × 350 mA",
      thermalPriority: "High",
    },

    purpose:
      "Front direction indicator (UNECE Category 1b) at any distance from headlamps, operating at ~1.5 Hz flash rate. 15 amber LEDs across 3 parallel branches of 5 series LEDs, each branch driven at 350 mA. Highest luminous intensity requirement in the lighting family at 218.75 cd target.",

    electrical: [
      { label: "Supply Voltage", value: "13.8 V (12 V battery actual)" },
      { label: "LED", value: "XPEBAM-L1 (2.2 V, 350 mA, 80.6 lm)" },
      { label: "Configuration", value: "15 LEDs — 3 branches × 5 series" },
      { label: "Load Resistor", value: "8.2 Ω per branch (selected)" },
      { label: "UNECE Category", value: "1b (175–1200 cd)" },
      { label: "Duty Type", value: "Flashing at 1.5 Hz (50% duty)" },
    ],

    calculations: [
      {
        title: "Lumens to Candela",
        latex:
          "\\Omega = 2\\pi(1 - \\cos\\tfrac{130°}{2}) = 2\\pi(1 - \\cos 65°) \\approx 3.627\\,\\text{sr} \\quad I_{LED} = \\frac{80.6}{3.627} = 22.22\\,\\text{cd}",
      },
      {
        title: "Target Luminous Intensity",
        latex:
          "I_{target} = 1.25 \\times I_{min} = 1.25 \\times 175 = 218.75\\,\\text{cd}",
      },
      {
        title: "LEDs Required",
        latex:
          "N = \\left\\lceil \\frac{I_{target}}{I_{LED}} \\right\\rceil = \\left\\lceil \\frac{218.75}{22.22} \\right\\rceil = 14 \\;\\rightarrow\\; 15\\,\\text{(3 × 5 config)}",
      },
      {
        title: "Load Resistance (per branch)",
        latex:
          "R = \\frac{V_{supply} - 5 \\times V_f}{I_f} = \\frac{13.8 - 5 \\times 2.2}{0.35} = \\frac{2.8}{0.35} = 8\\,\\Omega \\;\\rightarrow\\; 8.2\\,\\Omega",
      },
      {
        title: "Total Power",
        latex:
          "P_{total} = 3 \\times V_{supply} \\times I_f = 3 \\times 13.8 \\times 0.35 = 14.49\\,\\text{W}",
      },
    ],

    designConsiderations: [
      "UNECE Category 1b — luminous intensity 175–1200 cd per R148",
      "Highest power module in the family — 14.56 W peak across 3 branches",
      "50% flash duty cycle halves average thermal dissipation to ~7.3 W",
      "3 parallel branches of 5 LEDs — current matching via matched resistors",
      "Flash rate controlled by external relay/BCM",
      "Amber LED wavelength spec per ECE R6 regulation",
      "FR4 adequate due to intermittent duty; IMS for production margin",
    ],

    improvements: [
      "Add onboard flasher IC to eliminate relay dependency",
      "Implement LED open/short fault detection per branch",
      "Add EMC filtering for radiated emissions compliance",
      "Migrate to IMS substrate for thermal margin at peak power",
    ],

    tradeoff: {
      title: "External vs. Onboard Flash Control",
      text:
        "Used external BCM flash control to keep the PCB simple and reduce BOM. 3-branch parallel topology at 350 mA per branch demands careful trace routing for current matching. Onboard flasher IC would add independence but increases component count and firmware complexity.",
    },
  },

  // ── 4. Side Indicator ─────────────────────────────────────
  {
    id: "side-indicator",
    name: "Side Indicator",
    shortName: "Side Ind.",
    tabOrder: 3,

    modelPath: "/models/sdi.glb",
    gerberFiles: [
      "/gerbers/side-ind/SIDE_DIR_IND_PCB.GTL",
      "/gerbers/side-ind/SIDE_DIR_IND_PCB.GBL",
      "/gerbers/side-ind/SIDE_DIR_IND_PCB.GTO",
      "/gerbers/side-ind/SIDE_DIR_IND_PCB.GBO",
      "/gerbers/side-ind/SIDE_DIR_IND_PCB.GTS",
      "/gerbers/side-ind/SIDE_DIR_IND_PCB.GBS",
      "/gerbers/side-ind/SIDE_DIR_IND_PCB.GM1",
    ],
    layoutPath: null,
    schematicPath: null,
    photoPath: null,

    comparison: {
      dutyCycle: "Flashing (1.5 Hz)",
      current: "350 mA",
      thermalPriority: "Medium",
    },

    purpose:
      "Side-mounted directional indicator (UNECE Category 5, \"D\" marked) for turn signal visibility from the side profile. 2 lamps working as a pair to achieve the required luminous intensity. 4 amber LEDs in series driven at 350 mA through a single resistor-limited branch.",

    electrical: [
      { label: "Supply Voltage", value: "13.8 V (12 V battery actual)" },
      { label: "LED", value: "XPEBAM-L1 (2.2 V, 350 mA, 80.6 lm)" },
      { label: "Configuration", value: "4 LEDs in series, 1 branch" },
      { label: "Load Resistor", value: "15 Ω (selected)" },
      { label: "UNECE Category", value: "5 (50–500 cd, \"D\" paired)" },
      { label: "Duty Type", value: "Flashing at 1.5 Hz (50% duty)" },
    ],

    calculations: [
      {
        title: "Lumens to Candela",
        latex:
          "\\Omega = 2\\pi(1 - \\cos\\tfrac{130°}{2}) \\approx 3.627\\,\\text{sr} \\quad I_{LED} = \\frac{80.6}{3.627} = 22.22\\,\\text{cd}",
      },
      {
        title: "Target Luminous Intensity",
        latex:
          "I_{target} = 1.25 \\times I_{min} \\times F = 1.25 \\times 50 \\times 1.33 = 62.5\\,\\text{cd}",
      },
      {
        title: "LEDs Required",
        latex:
          "N = \\left\\lceil \\frac{I_{target}}{I_{LED}} \\right\\rceil = \\left\\lceil \\frac{62.5}{22.22} \\right\\rceil = 4\\,\\text{LEDs (per lamp)}",
      },
      {
        title: "Load Resistance",
        latex:
          "R = \\frac{V_{supply} - N \\cdot V_f}{I_f} = \\frac{13.8 - 4 \\times 2.2}{0.35} = \\frac{5.0}{0.35} = 14.29\\,\\Omega \\;\\rightarrow\\; 15\\,\\Omega",
      },
      {
        title: "Total Power",
        latex:
          "P_{total} = V_{supply} \\times I_f = 13.8 \\times 0.35 = 4.83\\,\\text{W}",
      },
    ],

    designConsiderations: [
      "UNECE Category 5 — 50–500 cd, \"D\" marked (paired operation)",
      "2 lamps per vehicle work together to achieve combined intensity",
      "Compact PCB — packaging-constrained by housing geometry",
      "Single branch of 4 LEDs keeps layout simple",
      "50% flash duty halves average dissipation to ~2.4 W",
      "Conformal coating recommended for water ingress protection",
    ],

    improvements: [
      "Move to flex PCB for tighter packaging in housing cavity",
      "Add potting for IP67 sealing",
      "Consider integrated LED+driver module for size reduction",
    ],

    tradeoff: {
      title: "Rigid vs. Flex PCB",
      text:
        "Chose rigid FR4 for lower cost and simpler manufacturing. 4.83 W peak dissipation at 350 mA is manageable on FR4 with copper pour. Flex PCB would allow better fit in the tight housing cavity but increases fabrication cost significantly for low volumes.",
    },
  },

  // ── 5. Daytime Running Light (DRL) ────────────────────────
  {
    id: "drl",
    name: "Daytime Running Light",
    shortName: "DRL",
    tabOrder: 4,

    modelPath:"/models/DRL.glb",
    gerberFiles: [
      "/gerbers/DRL/DRL_PCB.GTL",
      "/gerbers/DRL/DRL_PCB.GBL",
      "/gerbers/DRL/DRL_PCB.GTO",
      "/gerbers/DRL/DRL_PCB.GBO",
      "/gerbers/DRL/DRL_PCB.GTS",
      "/gerbers/DRL/DRL_PCB.GBS",
      "/gerbers/DRL/DRL_PCB.GM1",],
    layoutPath: null,
    schematicPath: null,
    photoPath: null,

    comparison: {
      dutyCycle: "Continuous",
      current: "1.44 A",
      thermalPriority: "High",
    },

    purpose:
      "Continuous daytime running light (UNECE Category RL) for high visibility in the white spectrum. Always on when the vehicle is running — highest sustained power dissipation in the lighting family at 20 W. 12 white LEDs across 6 parallel branches of 2 series LEDs, each branch driven at 240 mA. Thermal management and substrate selection are the primary design drivers.",

    electrical: [
      { label: "Supply Voltage", value: "13.8 V (12 V battery actual)" },
      { label: "LED", value: "JE2835APA (6.14 V, 240 mA, 148.5 lm)" },
      { label: "Configuration", value: "12 LEDs — 6 branches × 2 series" },
      { label: "Load Resistor", value: "6.8 Ω per branch (selected)" },
      { label: "UNECE Category", value: "RL (400–1200 cd)" },
      { label: "Duty Type", value: "Continuous DC" },
    ],

    calculations: [
      {
        title: "Lumens to Candela",
        latex:
          "\\Omega = 2\\pi(1 - \\cos\\tfrac{120°}{2}) = 2\\pi(1 - \\cos 60°) = \\pi \\approx 3.142\\,\\text{sr} \\quad I_{LED} = \\frac{148.5}{3.142} = 47.27\\,\\text{cd}",
      },
      {
        title: "Target Luminous Intensity",
        latex:
          "I_{target} = 1.25 \\times I_{min} \\times F = 1.25 \\times 400 \\times 1.33 = 665\\,\\text{cd}",
      },
      {
        title: "LEDs Required",
        latex:
          "N = \\left\\lceil \\frac{I_{target}}{I_{LED}} \\right\\rceil = \\left\\lceil \\frac{665}{47.27} \\right\\rceil = 12\\,\\text{LEDs}",
      },
      {
        title: "Branch Configuration",
        latex:
          "\\text{Max LEDs/branch} = 2 \\;\\Rightarrow\\; \\text{Branches} = \\frac{12}{2} = 6 \\;\\;(2\\,\\text{LEDs each})",
      },
      {
        title: "Load Resistance (per branch)",
        latex:
          "R = \\frac{V_{supply} - 2 \\times V_f}{I_f} = \\frac{13.8 - 2 \\times 6.14}{0.24} = \\frac{1.52}{0.24} = 6.33\\,\\Omega \\;\\rightarrow\\; 6.8\\,\\Omega",
      },
      {
        title: "Total Power Dissipation",
        latex:
          "P_{total} = 6 \\times V_{supply} \\times I_f = 6 \\times 13.8 \\times 0.24 = 19.87\\,\\text{W}",
      },
    ],

    designConsiderations: [
      "UNECE Category RL — luminous intensity 400–1200 cd per R148",
      "Highest continuous power in the family — 20 W sustained",
      "6 parallel branches of 2 LEDs — high branch count demands careful layout",
      "Aluminium IMS substrate essential for production thermal performance",
      "FR4 prototype requires extensive copper pour and thermal vias",
      "White LED colour temperature per ECE R87 regulation",
      "13.8 V actual battery voltage used for nominal calculations",
    ],

    improvements: [
      "Mandatory IMS substrate migration for production — 20 W on FR4 is marginal",
      "Add TVS diode for transient protection",
      "Use constant-current driver per branch for better efficiency",
      "Add reverse polarity protection",
      "Consider PWM dimming for adaptive brightness control",
    ],

    tradeoff: {
      title: "Thermal Management vs. Cost",
      text:
        "At 20 W continuous dissipation, this is the most thermally demanding module. FR4 prototype relies on maximised copper pour area and thermal vias, but production units require aluminium IMS substrate. 6-branch parallel topology with 6.8 Ω resistors per branch ensures current matching, but a constant-current LED driver would significantly improve efficiency and reduce thermal load.",
    },
  },
];

export const getModuleById = (id) => modules.find((m) => m.id === id);
export default modules;
