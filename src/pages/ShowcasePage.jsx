import { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProjectById } from "../data/projects";
import ModelViewer from "../components/viewer/ModelViewer";
import GerberViewer from "../components/viewer/GerberViewer";
import PhotoViewer from "../components/viewer/PhotoViewer";
import PdfViewer from "../components/viewer/PdfViewer";
import ViewToggle from "../components/ui/ViewToggle";
import EngineeringPanel from "../components/panel/EngineeringPanel";

const VIEWS = [
  { id: "3d", label: "3D Model" },
  { id: "top", label: "Top Layer" },
  { id: "layout", label: "Layout" },
  { id: "schematic", label: "Schematic" },
  { id: "photo", label: "Photo" },
];

// Map project IDs to their module data imports
const MODULE_MAP = {
  "automotive-lighting": () => import("../data/modules.js"),
};

function ModuleTabs({ modules, activeId, onSelect }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto flex-nowrap">
      {modules.map((m) => {
        const isActive = m.id === activeId;
        return (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className={`flex-shrink-0 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              isActive
                ? "bg-gray-100 text-gray-900"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/60"
            }`}
          >
            {m.shortName}
          </button>
        );
      })}
    </div>
  );
}

function ViewerArea({ mod, activeView }) {
  return (
    <div className="w-full h-full relative">
      {/* Keep ModelViewer always mounted to avoid WebGL context loss */}
      <div
        className="absolute inset-0"
        style={{ visibility: activeView === "3d" ? "visible" : "hidden" }}
      >
        <ModelViewer
          modelPath={mod.modelPath}
          gerberFiles={mod.gerberFiles}
          interactive
          autoRotate
          autoRotateSpeed={0.8}
        />
      </div>

      {activeView === "top" && (
        <GerberViewer
          gerberFiles={mod.gerberFiles}
          side="top"
          className="w-full h-full"
        />
      )}

      {activeView === "layout" && (
        <PhotoViewer
          photoPath={mod.layoutPath}
          moduleName={`${mod.name} — Altium Layout`}
          className="w-full h-full"
        />
      )}

      {activeView === "schematic" && (
        <PdfViewer
          pdfPath={mod.schematicPath}
          page={1}
          title={`${mod.name} — Schematic`}
          className="w-full h-full"
        />
      )}

      {activeView === "photo" && (
        <PhotoViewer
          photoPath={mod.photoPath}
          moduleName={mod.name}
          className="w-full h-full"
        />
      )}
    </div>
  );
}

export default function ShowcasePage() {
  const { projectId } = useParams();
  const [modules, setModules] = useState(null);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [activeView, setActiveView] = useState("3d");

  const project = getProjectById(projectId);

  // Load modules for this project
  useEffect(() => {
    const loader = MODULE_MAP[projectId];
    if (!loader) return;
    loader().then((mod) => {
      const mods = mod.modules || mod.default;
      setModules(mods);
      setActiveModuleId(mods[0].id);
    });
  }, [projectId]);

  const handleModuleSelect = useCallback((id) => {
    setActiveModuleId(id);
    setActiveView("3d");
  }, []);

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Project not found.</p>
      </div>
    );
  }

  if (!modules) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-600 border-t-gray-300 rounded-full animate-spin" />
      </div>
    );
  }

  const activeMod = modules.find((m) => m.id === activeModuleId) || modules[0];

  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-y-auto lg:overflow-hidden">
      {/* Left panel — viewer */}
      <div className="flex flex-col flex-none h-[200px] lg:h-auto lg:flex-1 lg:min-h-0 lg:w-[65%] w-full border-b lg:border-b-0 lg:border-r border-gray-800/50 overflow-hidden">
        <div className="flex-none flex flex-col lg:flex-row lg:items-center lg:justify-between gap-1.5 lg:gap-3 px-3 lg:px-5 py-2 lg:py-3 border-b border-gray-800/50">
          <div className="overflow-x-auto">
            <ModuleTabs
              modules={modules}
              activeId={activeModuleId}
              onSelect={handleModuleSelect}
            />
          </div>
          <div className="overflow-x-auto">
            <ViewToggle
              views={VIEWS}
              activeView={activeView}
              onViewChange={setActiveView}
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-gray-900/30">
          <ViewerArea mod={activeMod} activeView={activeView} />
        </div>
      </div>

      {/* Right panel — engineering specs (only this scrolls) */}
      <div className="lg:w-[35%] w-full lg:flex-1 lg:flex-none lg:min-h-0 lg:overflow-hidden bg-gray-950">
        <EngineeringPanel
          module={activeMod}
          allModules={modules}
          activeModuleId={activeModuleId}
          onModuleSelect={handleModuleSelect}
        />
      </div>
    </div>
  );
}
