import { Suspense, lazy } from "react";
import Section from "../showcase/Section";
import ProjectCard from "./ProjectCard";
import MiniBlockDiagram from "./MiniBlockDiagram";
import { modules } from "../../data/modules";

const ModelViewer = lazy(() => import("../viewer/ModelViewer"));
const chmsl = modules[0];

function LightingPreview() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center bg-gray-900/60">
          <div className="w-6 h-6 border-2 border-gray-700 border-t-gray-400 rounded-full animate-spin" />
        </div>
      }
    >
      <ModelViewer
        modelPath={chmsl.modelPath}
        gerberFiles={chmsl.gerberFiles}
        interactive={false}
        autoRotate
        autoRotateSpeed={1}
        minDistance={4}
        maxDistance={12}
      />
    </Suspense>
  );
}

function ACUPreview() {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <MiniBlockDiagram />
    </div>
  );
}

export default function FeaturedProjects() {
  return (
    <Section
      eyebrow="Projects"
      title="Featured work"
      description="Two automotive electronics projects — a five-module exterior lighting family and a high-voltage precharge controller for a solar vehicle. Each breakdown covers the design decisions, calculations and trade-offs behind the board."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ProjectCard
          to="/projects/automotive-lighting"
          eyebrow="Automotive lighting"
          title="Exterior Lighting System"
          pitch="A five-module PCB family covering centre-brake, rear stop, front/side indicators and daytime running lights. Designed around automotive voltage tolerance, thermal budget and UNECE photometric limits."
          previewLabel="3D PCB Model"
          preview={<LightingPreview />}
          stats={[
            { label: "Modules", value: "5" },
            { label: "Bus", value: "9–16 V" },
            { label: "Standard", value: "UNECE" },
          ]}
          delay={0}
        />

        <ProjectCard
          to="/projects/array-control-unit"
          eyebrow="Solar vehicle"
          statusBadge="In Progress"
          title="Array Control Unit"
          pitch="HV precharge controller for a solar vehicle. A hardware comparator watches the DC link and closes the main contactor at 90% of battery voltage — no MCU, no CAN, no firmware in the safety path."
          previewLabel="System Diagram"
          preview={<ACUPreview />}
          stats={[
            { label: "HV Bus", value: "~160 V" },
            { label: "LV Rail", value: "24 V" },
            { label: "Isolation", value: "Opto" },
          ]}
          delay={0.08}
        />
      </div>
    </Section>
  );
}
