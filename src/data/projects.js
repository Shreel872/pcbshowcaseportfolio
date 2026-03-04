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
];

export const getProjectById = (id) => projects.find((p) => p.id === id);
