// ─────────────────────────────────────────────────────────────
// Array Control Unit (ACU) Module Data
//
// Solar vehicle HV precharge controller. This is a redesign of
// the previous ACU which used an MCU + CAN through the ECU to
// drive the precharge and main contactors. The new version runs
// entirely on hardware verification, no software in the control
// loop. Reduces weight, wiring and power draw and removes the
// single point of failure in the firmware.
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

    purpose:
      "Array control unit for a solar vehicle HV system. Operates the precharge circuit to manage the inrush current into the bulk MPPT output capacitors. If the main contactor closes while the MPPT DC link sits at too low a voltage, the battery dumps a huge surge into the bulk caps. The precharge resistor limits that current and lets the DC link ramp up gradually. A comparator on the HV side watches the DC link voltage and fires once it reaches 90% of the battery voltage. That signal crosses the isolation barrier through an optocoupler, gets pulled down to logic level by a voltage divider on the LV side, and drives a small transistor that switches the PROFET gate off the 24 V rail. The PROFET closes the main +ve contactor while a P-channel MOSFET deactivates the precharge contactor at the same time. This version is a redesign of the original ACU which relied on an MCU and CAN through the ECU to operate the contactors. Moving to pure hardware verification cuts software complexity, weight and power consumption. Running HV and LV on the same board needs extra care since the HV side uses a floating ground and the LV side is referenced to chassis ground. A 24 V to 5 V isolated buck converter transfers power across the boundary for the HV-side comparator supply.",

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

    calculations: [],

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

    improvements: [],

    tradeoff: {
      title: "Pure Hardware vs. MCU-Driven Control",
      text:
        "The original ACU used an MCU that listened on CAN for BMU and MPPT voltages and drove the PROFET and precharge FET from firmware. Moving to pure hardware verification means fewer components (no MCU, no CAN transceiver on the ACU itself), less wiring, lower quiescent power draw and no firmware to maintain. The tradeoff is you lose software flexibility. Can't change the threshold without swapping resistors, no CAN diagnostics from the ACU, no graceful handling of edge cases in software. Adds cost on the HV side too since the comparator and isolated 5 V rail have to be done with discrete parts instead of an MCU ADC. For a safety-critical precharge function the simplicity wins. Fewer layers of things that can go wrong and the failure mode is always precharge-only, which is the safe state.",
    },
  },
];

export const getModuleById = (id) => modules.find((m) => m.id === id);
export default modules;
