// ─────────────────────────────────────────────────────────────
// Automotive Lighting PCB Module Data
//
// Each module represents one PCB in the lighting product family.
// Edit the engineering content below -the UI reads from here.
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
    schematicPath: "/schematics/CBL.pdf",
    photoPath: null,

    comparison: {
      dutyCycle: "Continuous",
      current: "140 mA",
      thermalPriority: "Medium",
    },

    stats: [
      { label: "Peak Power", value: "1.93 W" },
      { label: "Duty", value: "Continuous" },
      { label: "LEDs", value: "5 red" },
    ],

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
      "UNECE Category S3 -luminous intensity 25–110 cd per R148",
      "Target set at 125% of minimum with 1.33 fudge factor for optical losses",
      "5 LEDs in series on single branch -simplifies layout and current matching",
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

    redesignNote: "Designed for 12 V (13.8 V actual). Due for redesign — new 24 V system allows longer series strings, reducing I²R losses and simplifying topology.",

    decisions: [
      {
        title: "Current Limiting Method",
        category: "architecture",
        calcRefs: ["Resistor Sizing", "Resistor Power"],
        chosen: { label: "Series resistor", reason: "Simple, low BOM cost — adequate at 1.93 W total" },
        rejected: { label: "CC driver IC", reason: "Adds $0.50–1.50 per board, overhead not justified" },
      },
      {
        title: "Substrate",
        category: "thermal",
        calcRefs: ["Total Power Dissipation"],
        chosen: { label: "FR4 (prototype)", reason: "Copper pour handles 1.93 W at this power level" },
        rejected: { label: "Aluminium IMS", reason: "3–5× board cost, overkill below 5 W continuous" },
      },
      {
        title: "LED Count",
        category: "component",
        calcRefs: ["Lumens to Candela", "Target Luminous Intensity", "LEDs Required"],
        chosen: { label: "5 LEDs in series", reason: "Exact count to hit 41.6 cd UNECE S3 target" },
        rejected: { label: "4 LEDs + brighter bin", reason: "Narrower viewing angle, higher cost per unit" },
      },
    ],

    bom: [
      { ref: "D1–D5", description: "Red LED 2835", part: "JE2835ARD", qty: 5 },
      { ref: "R1",    description: "Current limit resistor", part: "18.2 Ω 0.5 W 1%", qty: 1 },
      { ref: "J1",    description: "2-pin power connector",  part: "JST PH 2.0 mm",   qty: 1 },
    ],

    tradeoff: {
      title: "FR4 vs. Aluminium IMS",
      text:
        "Initial implementation on FR4 for cost-effective bench harness prototyping. Production revision targets aluminium-backed IMS substrate to improve thermal conduction from the LED pads. Resistor-based current limiting chosen for simplicity -total dissipation of 1.93 W is manageable with copper pour on FR4, but IMS eliminates thermal risk entirely.",
    },
  },

  // ── 2. Rear Stop ─────────────────────────────────────────
  {
    id: "rear-stop",
    name: "Rear Stop Light",
    shortName: "Rear Stop",
    tabOrder: 1,

    modelPath: "/models/rs.glb",
        gerberFiles: [
      "/gerbers/rear-stop/Rear Stop LED PCB.GTL",
      "/gerbers/rear-stop/Rear Stop LED PCB.GBL",
      "/gerbers/rear-stop/Rear Stop LED PCB.GTO",
      "/gerbers/rear-stop/Rear Stop LED PCB.GBO",
      "/gerbers/rear-stop/Rear Stop LED PCB.GTS",
      "/gerbers/rear-stop/Rear Stop LED PCB.GBS",
      "/gerbers/rear-stop/Rear Stop LED PCB.GM1",
    ],
    layoutPath: "/images/rear stop.png",
    schematicPath: "/schematics/RSL.pdf",
    photoPath: null,

    comparison: {
      dutyCycle: "Intermittent",
      current: "280 mA",
      thermalPriority: "Medium",
    },

    stats: [
      { label: "Peak Power", value: "3.86 W" },
      { label: "Duty", value: "Intermittent" },
      { label: "LEDs", value: "10 red" },
    ],

    purpose:
      "Rear stop lamp activated when the brake pedal is pressed. UNECE Category S3 compliant with luminous intensity between 25–110 cd. 10 red LEDs across 2 parallel branches of 5 series LEDs, each branch driven at 140 mA through a resistor-limited topology.",

    electrical: [
      { label: "Supply Voltage", value: "13.8 V (12 V battery actual)" },
      { label: "LED", value: "JE2835ARD (2.25 V, 140 mA, 27.2 lm)" },
      { label: "Configuration", value: "10 LEDs -2 branches × 5 series" },
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
      {
        title: "Resistor Power (per resistor)",
        latex:
          "P_R = (V_{supply} - N_{branch} \\cdot V_f) \\times I_f = (13.8 - 5 \\times 2.25) \\times 0.14 = 2.55 \\times 0.14 = 0.357\\,\\text{W}",
      },
    ],

    designConsiderations: [
      "UNECE Category S3 -luminous intensity 25–110 cd per R148",
      "Target set at 125% of minimum with 1.33 factor of safety",
      "2 parallel branches of 5 LEDs -matched current through shared resistor values",
      "Intermittent duty reduces average thermal load vs continuous CHMSL",
      "Copper pour under LED pads for transient thermal peaks",
      "Shared housing footprint with tail light assembly",
    ],

    improvements: [
      "Integrate with tail light on a single board to reduce connector count",
      "Add current-sense feedback for LED diagnostics",
      "Migrate to aluminium IMS substrate for production",
    ],

    redesignNote: "Designed for 12 V (13.8 V actual). Due for redesign — new 24 V system; considering integration with tail light board to reduce connector count.",

    decisions: [
      {
        title: "Current Limiting Method",
        category: "architecture",
        calcRefs: ["Load Resistance (per branch)", "Resistor Power (per resistor)"],
        chosen: { label: "Series resistor per branch", reason: "Matched resistors balance 2 branches, low cost" },
        rejected: { label: "CC driver IC", reason: "Cost not justified for 3.86 W intermittent load" },
      },
      {
        title: "Substrate",
        category: "thermal",
        calcRefs: ["Total Power Dissipation"],
        chosen: { label: "FR4 (prototype)", reason: "Intermittent duty halves average thermal load to ~1.9 W" },
        rejected: { label: "Aluminium IMS", reason: "3–5× cost with no thermal necessity at this duty cycle" },
      },
      {
        title: "Board Integration",
        category: "architecture",
        chosen: { label: "Standalone module", reason: "Simplifies testing and fault isolation at prototype stage" },
        rejected: { label: "Combined with tail light", reason: "v2 plan — reduces connector count and BOM cost" },
      },
    ],

    bom: [
      { ref: "D1–D10", description: "Red LED 2835",          part: "JE2835ARD",      qty: 10 },
      { ref: "R1–R2",  description: "Current limit resistor", part: "18.2 Ω 0.5 W 1%", qty: 2 },
      { ref: "J1",     description: "2-pin power connector",  part: "JST PH 2.0 mm",  qty: 1 },
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
    layoutPath: "/images/frontind.png",
    schematicPath: "/schematics/FRI.pdf",
    photoPath: null,

    comparison: {
      dutyCycle: "Flashing (1.5 Hz)",
      current: "3 × 350 mA",
      thermalPriority: "High",
    },

    stats: [
      { label: "Peak Power", value: "14.49 W" },
      { label: "Duty", value: "Flashing 1.5 Hz" },
      { label: "LEDs", value: "15 amber" },
    ],

    purpose:
      "Front direction indicator (UNECE Category 1b) at any distance from headlamps, operating at ~1.5 Hz flash rate. 15 amber LEDs across 3 parallel branches of 5 series LEDs, each branch driven at 350 mA. Highest luminous intensity requirement in the lighting family at 218.75 cd target.",

    electrical: [
      { label: "Supply Voltage", value: "13.8 V (12 V battery actual)" },
      { label: "LED", value: "XPEBAM-L1 (2.2 V, 350 mA, 80.6 lm)" },
      { label: "Configuration", value: "15 LEDs -3 branches × 5 series" },
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
      {
        title: "Resistor Power (per resistor)",
        latex:
          "P_R = (V_{supply} - 5 \\times V_f) \\times I_f = (13.8 - 5 \\times 2.2) \\times 0.35 = 2.8 \\times 0.35 = 0.98\\,\\text{W}",
      },
    ],

    designConsiderations: [
      "UNECE Category 1b -luminous intensity 175–1200 cd per R148",
      "Highest power module in the family -14.56 W peak across 3 branches",
      "50% flash duty cycle halves average thermal dissipation to ~7.3 W",
      "3 parallel branches of 5 LEDs -current matching via matched resistors",
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

    redesignNote: "Designed for 12 V (13.8 V actual). Due for redesign — 24 V system allows longer series strings (up to 9 LEDs/branch vs 5), reducing branch count and overall trace current.",

    decisions: [
      {
        title: "Current Limiting Method",
        category: "architecture",
        calcRefs: ["Load Resistance (per branch)", "Resistor Power (per resistor)"],
        chosen: { label: "Series resistor per branch", reason: "3 matched resistors ensure branch current balance" },
        rejected: { label: "CC driver IC", reason: "$1–3 per branch × 3 branches adds meaningful BOM overhead" },
      },
      {
        title: "Substrate",
        category: "thermal",
        calcRefs: ["Total Power"],
        chosen: { label: "FR4 (prototype)", reason: "50% flash duty halves avg dissipation to ~7.3 W — manageable" },
        rejected: { label: "Aluminium IMS", reason: "Required at continuous duty; targeted for production revision" },
      },
      {
        title: "Flash Control",
        category: "architecture",
        chosen: { label: "External BCM / relay", reason: "Standard automotive integration, keeps board simple" },
        rejected: { label: "Onboard flasher IC", reason: "Adds firmware complexity — not needed for UNECE compliance" },
      },
    ],

    bom: [
      { ref: "D1–D15", description: "Amber LED XPEBAM",      part: "XPEBAM-L1-0000-00201", qty: 15 },
      { ref: "R1–R3",  description: "Current limit resistor", part: "8.2 Ω 2 W 1%",         qty: 3  },
      { ref: "J1",     description: "2-pin power connector",  part: "JST PH 2.0 mm",         qty: 1  },
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
    layoutPath: "/images/sideind.png",
    schematicPath: "/schematics/SCH_SIDEIND.pdf",
    photoPath: null,

    comparison: {
      dutyCycle: "Flashing (1.5 Hz)",
      current: "350 mA",
      thermalPriority: "Medium",
    },

    stats: [
      { label: "Peak Power", value: "4.83 W" },
      { label: "Duty", value: "Flashing 1.5 Hz" },
      { label: "LEDs", value: "4 amber (×2 lamps)" },
    ],

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
      {
        title: "Resistor Power",
        latex:
          "P_R = (V_{supply} - N \\cdot V_f) \\times I_f = (13.8 - 4 \\times 2.2) \\times 0.35 = 5.0 \\times 0.35 = 1.75\\,\\text{W}",
      },
    ],

    designConsiderations: [
      "UNECE Category 5 -50–500 cd, \"D\" marked (paired operation)",
      "2 lamps per vehicle work together to achieve combined intensity",
      "Compact PCB -packaging-constrained by housing geometry",
      "Single branch of 4 LEDs keeps layout simple",
      "50% flash duty halves average dissipation to ~2.4 W",
      "Conformal coating recommended for water ingress protection",
    ],

    improvements: [
      "Move to flex PCB for tighter packaging in housing cavity",
      "Add potting for IP67 sealing",
      "Consider integrated LED+driver module for size reduction",
    ],

    redesignNote: "Designed for 12 V (13.8 V actual). Due for redesign — 24 V rail allows 8 LEDs in series, eliminating the current limiting resistor and its 1.75 W loss entirely.",

    decisions: [
      {
        title: "Current Limiting Method",
        category: "architecture",
        calcRefs: ["Load Resistance", "Resistor Power"],
        chosen: { label: "Series resistor", reason: "1.75 W loss acceptable at 50% flash duty" },
        rejected: { label: "CC driver IC", reason: "Cost overhead exceeds benefit at 4.83 W intermittent" },
      },
      {
        title: "Substrate",
        category: "thermal",
        calcRefs: ["Total Power"],
        chosen: { label: "FR4 rigid", reason: "Adequate thermal with copper pour at flash duty" },
        rejected: { label: "Flex PCB", reason: "Better housing fit but 3–5× fabrication cost at low volume" },
      },
      {
        title: "LED Count per Board",
        category: "component",
        calcRefs: ["Lumens to Candela", "Target Luminous Intensity", "LEDs Required"],
        chosen: { label: "4 LEDs in series (paired lamps)", reason: "Two boards meet UNECE Cat 5 combined intensity" },
        rejected: { label: "8 LEDs on one board", reason: "Housing geometry constrains — insufficient space" },
      },
    ],

    bom: [
      { ref: "D1–D4", description: "Amber LED XPEBAM",      part: "XPEBAM-L1-0000-00201", qty: 4 },
      { ref: "R1",    description: "Current limit resistor", part: "15 Ω 2 W 1%",           qty: 1 },
      { ref: "J1",    description: "2-pin power connector",  part: "JST PH 2.0 mm",         qty: 1 },
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
    layoutPath: "/images/drl.png",
    schematicPath: "/schematics/DRL.pdf",
    photoPath: null,

    comparison: {
      dutyCycle: "Continuous",
      current: "1.44 A",
      thermalPriority: "High",
    },

    stats: [
      { label: "Peak Power", value: "19.87 W" },
      { label: "Duty", value: "Continuous" },
      { label: "LEDs", value: "12 white" },
    ],

    purpose:
      "Continuous daytime running light (UNECE Category RL) for high visibility in the white spectrum. Always on when the vehicle is running -highest sustained power dissipation in the lighting family at 20 W. 12 white LEDs across 6 parallel branches of 2 series LEDs, each branch driven at 240 mA. Thermal management and substrate selection are the primary design drivers.",

    electrical: [
      { label: "Supply Voltage", value: "13.8 V (12 V battery actual)" },
      { label: "LED", value: "JE2835APA (6.14 V, 240 mA, 148.5 lm)" },
      { label: "Configuration", value: "12 LEDs -6 branches × 2 series" },
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
      {
        title: "Resistor Power (per resistor)",
        latex:
          "P_R = (V_{supply} - 2 \\times V_f) \\times I_f = (13.8 - 2 \\times 6.14) \\times 0.24 = 1.52 \\times 0.24 = 0.365\\,\\text{W}",
      },
    ],

    designConsiderations: [
      "UNECE Category RL -luminous intensity 400–1200 cd per R148",
      "Highest continuous power in the family -20 W sustained",
      "6 parallel branches of 2 LEDs -high branch count demands careful layout",
      "Aluminium IMS substrate essential for production thermal performance",
      "FR4 prototype requires extensive copper pour and thermal vias",
      "White LED colour temperature per ECE R87 regulation",
      "13.8 V actual battery voltage used for nominal calculations",
    ],

    improvements: [
      "Mandatory IMS substrate migration for production -20 W on FR4 is marginal",
      "Add TVS diode for transient protection",
      "Use constant-current driver per branch for better efficiency",
      "Add reverse polarity protection",
      "Consider PWM dimming for adaptive brightness control",
    ],

    redesignNote: "Designed for 12 V (13.8 V actual). Due for redesign — 24 V system allows 3 LEDs per branch vs current 2, halving branch count from 6 to 4 and cutting resistor I²R losses significantly. IMS substrate mandatory for production at 20 W continuous.",

    decisions: [
      {
        title: "Current Limiting Method",
        category: "architecture",
        calcRefs: ["Load Resistance (per branch)", "Resistor Power (per resistor)"],
        chosen: { label: "Series resistor per branch", reason: "Losses small at 0.365 W/branch — 6 × $0.05 vs 6 × $1.50 for drivers" },
        rejected: { label: "CC driver IC per branch", reason: "$1–3 × 6 branches = significant BOM overhead at prototype stage" },
      },
      {
        title: "Substrate",
        category: "thermal",
        calcRefs: ["Total Power Dissipation"],
        chosen: { label: "FR4 + copper pour (prototype)", reason: "Feasible with maximised pour; IMS is the production target" },
        rejected: { label: "Aluminium IMS (prototype)", reason: "3–5× board cost not justified until production volumes confirmed" },
      },
      {
        title: "Branch Configuration",
        category: "component",
        calcRefs: ["Branch Configuration", "LEDs Required"],
        chosen: { label: "6 × 2 LEDs in series", reason: "VF × 2 = 12.28 V — max series at 13.8 V rail" },
        rejected: { label: "4 × 3 LEDs in series", reason: "VF × 3 = 18.42 V — exceeds 13.8 V supply" },
      },
    ],

    bom: [
      { ref: "D1–D12", description: "White LED 2835 6 V",    part: "JE2835APA",      qty: 12 },
      { ref: "R1–R6",  description: "Current limit resistor", part: "6.8 Ω 0.5 W 1%", qty: 6  },
      { ref: "J1",     description: "2-pin power connector",  part: "JST PH 2.0 mm",  qty: 1  },
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
