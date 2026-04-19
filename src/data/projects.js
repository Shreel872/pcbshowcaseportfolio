export const projects = [
  {
    id: "automotive-lighting",
    title: "Automotive Lighting",
    subtitle: "5-module LED lighting family for vehicle exterior",
    description:
      "A product family of 5 PCBs designed for automotive exterior lighting applications. Covers brake lights, indicators, and daytime running lights with emphasis on thermal management and automotive voltage tolerance.",
    tags: ["Altium Designer", "LED Driver", "Thermal Management", "Automotive"],
    moduleCount: 5,
  },
  {
    id: "array-control-unit",
    title: "Array Control Unit",
    subtitle: "HV precharge controller with isolated hardware verification",
    description:
      "Solar vehicle array control unit that manages the precharge sequence between the MPPT and battery pack. Uses a precharge resistor to limit inrush current into the MPPT capacitors, with isolated ground planes for HV/LV separation and hardware-verified contactor control through optocoupled comparators.",
    tags: ["Power Electronics", "HV Isolation", "CAN Bus", "Solar Vehicle"],
    status: "in-progress",
    moduleCount: 1,
  },
];

export const getProjectById = (id) => projects.find((p) => p.id === id);
