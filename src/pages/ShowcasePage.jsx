import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getProjectById } from "../data/projects";
import ModelViewer from "../components/viewer/ModelViewer";
import GerberViewer from "../components/viewer/GerberViewer";
import PhotoViewer from "../components/viewer/PhotoViewer";
import PdfViewer from "../components/viewer/PdfViewer";
import BlockDiagram from "../components/viewer/BlockDiagram";
import PrechargeSimulator from "../components/viewer/PrechargeSimulator";
import DecisionSlides from "../components/viewer/DecisionSlides";
import TradeoffBox from "../components/panel/TradeoffBox";
import Section from "../components/showcase/Section";
import SectionNav from "../components/showcase/SectionNav";

const MODULE_MAP = {
  "automotive-lighting": () => import("../data/modules.js"),
  "array-control-unit": () => import("../data/acu-modules.js"),
};

// ─── Sticky module tabs ────────────────────────────────────────
function ModuleTabs({ modules, activeId, onSelect }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto flex-nowrap scrollbar-none">
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

// ─── Inline pill toggle (Board section sub-tabs) ───────────────
function PillToggle({ options, value, onChange }) {
  return (
    <div className="inline-flex gap-1 p-1 rounded-lg border border-gray-800/60 bg-gray-900/40">
      {options.map((o) => {
        const isActive = o.id === value;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap ${
              isActive
                ? "bg-gray-100 text-gray-900"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Hero ──────────────────────────────────────────────────────
function HeroSection({ mod, projectName }) {
  const cols = mod.stats?.length >= 4 ? "sm:grid-cols-4" : "sm:grid-cols-3";
  return (
    <Section id="hero" className="pt-8 lg:pt-10 pb-6" divider={false}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="flex items-center gap-2 mb-3">
          {projectName && (
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-medium">
              {projectName}
            </span>
          )}
          {projectName && (
            <span className="text-gray-700 text-xs">/</span>
          )}
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-medium">
            {mod.shortName}
          </span>
        </div>

        <h1 className="text-3xl lg:text-4xl font-semibold text-gray-50 tracking-tight leading-[1.1]">
          {mod.name}
        </h1>

        <p className="mt-4 text-sm lg:text-base text-gray-400 leading-relaxed max-w-3xl">
          {mod.purpose}
        </p>

        {mod.stats && mod.stats.length > 0 && (
          <div
            className={`mt-6 grid grid-cols-2 ${cols} gap-px bg-gray-800/60 border border-gray-800/60 rounded-lg overflow-hidden`}
          >
            {mod.stats.map((s) => (
              <div key={s.label} className="bg-gray-950 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-gray-500 mb-1">
                  {s.label}
                </p>
                <p className="text-sm lg:text-base font-semibold text-gray-100 font-mono tabular-nums">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </Section>
  );
}

// ─── Board (unified for both projects) ─────────────────────────
function BoardSection({ mod, projectId }) {
  const isACU = projectId === "array-control-unit";

  const toggles = isACU
    ? [
        { id: "system", label: "System" },
        { id: "hw-verification", label: "HW Verification" },
      ]
    : [
        mod.modelPath && { id: "3d", label: "3D Model" },
        mod.gerberFiles?.length && { id: "top", label: "Top Layer" },
        mod.layoutPath && { id: "layout", label: "Layout" },
        mod.photoPath && { id: "photo", label: "Photo" },
      ].filter(Boolean);

  const [view, setView] = useState(toggles[0]?.id || "3d");

  if (toggles.length === 0) return null;

  const eyebrow = isACU ? "System architecture" : "Physical design";
  const title = isACU ? "Topology" : "Board";

  return (
    <Section id="board" eyebrow={eyebrow} title={title}>
      <div className="mb-4">
        <PillToggle options={toggles} value={view} onChange={setView} />
      </div>

      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-lg border border-gray-800/60 bg-gray-900/30 overflow-hidden">
        {/* ACU diagrams */}
        {isACU && (view === "system" || view === "hw-verification") && (
          <div className="absolute inset-0 overflow-auto p-3 lg:p-4">
            <BlockDiagram diagramId={view} />
          </div>
        )}

        {/* Lighting: ModelViewer stays mounted to avoid WebGL context loss */}
        {!isACU && mod.modelPath && (
          <div
            className="absolute inset-0"
            style={{ visibility: view === "3d" ? "visible" : "hidden" }}
          >
            <ModelViewer
              modelPath={mod.modelPath}
              gerberFiles={mod.gerberFiles}
              interactive
              autoRotate
              autoRotateSpeed={0.8}
            />
          </div>
        )}

        {!isACU && view === "top" && (
          <GerberViewer
            gerberFiles={mod.gerberFiles}
            side="top"
            className="w-full h-full"
          />
        )}

        {!isACU && view === "layout" && (
          <PhotoViewer
            photoPath={mod.layoutPath}
            moduleName={`${mod.name} -Altium Layout`}
            className="w-full h-full"
          />
        )}

        {!isACU && view === "photo" && (
          <PhotoViewer
            photoPath={mod.photoPath}
            moduleName={mod.name}
            className="w-full h-full"
          />
        )}
      </div>
    </Section>
  );
}

// ─── Schematic ─────────────────────────────────────────────────
function SchematicSection({ mod, projectId }) {
  const hasSpice = projectId === "array-control-unit";
  const toggles = hasSpice
    ? [
        { id: "schematic", label: "Schematic" },
        { id: "spice", label: "SPICE Simulation" },
      ]
    : null;
  const [view, setView] = useState("schematic");

  return (
    <Section id="schematic" eyebrow="Circuit" title="Schematic">
      {toggles && (
        <div className="mb-4">
          <PillToggle options={toggles} value={view} onChange={setView} />
        </div>
      )}

      {view === "schematic" && (
        <div className="w-full aspect-[16/9] rounded-lg border border-gray-800/60 bg-gray-900/30 overflow-hidden">
          <PdfViewer
            pdfPath={mod.schematicPath}
            page={1}
            pageCount={mod.schematicPageCount || 1}
            title={`${mod.name} — Schematic`}
            className="w-full h-full"
          />
        </div>
      )}

      {view === "spice" && (
        <div className="w-full rounded-lg border border-gray-800/60 bg-gray-950 overflow-hidden">
          <PrechargeSimulator />
        </div>
      )}
    </Section>
  );
}

// ─── Decisions ─────────────────────────────────────────────────
function DecisionsSection({ mod }) {
  if (!mod.decisions || mod.decisions.length === 0) return null;
  return (
    <Section
      id="decisions"
      eyebrow="Trade studies"
      title="Design Decisions"
      description="What was chosen, what was rejected, why. Calculations expand inline where they justify the call."
    >
      <DecisionSlides
        decisions={mod.decisions}
        beforeAfter={mod.beforeAfter}
        redesignNote={mod.redesignNote}
        calculations={mod.calculations}
        embedded
      />
    </Section>
  );
}

// ─── Electrical specs ──────────────────────────────────────────
function SpecsSection({ mod }) {
  if (!mod.electrical || mod.electrical.length === 0) return null;
  return (
    <Section id="specs" eyebrow="Requirements" title="Electrical Specs">
      <div className="rounded-lg border border-gray-800/60 bg-gray-900/30 overflow-hidden">
        <dl className="divide-y divide-gray-800/50">
          {mod.electrical.map((e) => (
            <div
              key={e.label}
              className="grid grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] gap-4 px-4 lg:px-5 py-2.5"
            >
              <dt className="text-xs text-gray-500">{e.label}</dt>
              <dd className="text-xs text-gray-200 font-mono">
                {e.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}

// ─── Bill of Materials ─────────────────────────────────────────
function BomSection({ mod }) {
  if (!mod.bom || mod.bom.length === 0) return null;
  const total = mod.bom.reduce((s, i) => s + i.qty, 0);
  return (
    <Section id="bom" eyebrow="BOM" title="Bill of Materials">
      <div className="rounded-lg border border-gray-800/60 overflow-x-auto bg-gray-900/30">
        <table className="w-full text-xs lg:text-sm min-w-[500px]">
          <thead>
            <tr className="border-b border-gray-800/60 bg-gray-900/40">
              <th className="text-left px-4 lg:px-5 py-2.5 text-[10px] uppercase tracking-[0.14em] text-gray-500 font-medium">
                Ref
              </th>
              <th className="text-left px-4 lg:px-5 py-2.5 text-[10px] uppercase tracking-[0.14em] text-gray-500 font-medium">
                Description
              </th>
              <th className="text-left px-4 lg:px-5 py-2.5 text-[10px] uppercase tracking-[0.14em] text-gray-500 font-medium">
                Part
              </th>
              <th className="text-right px-4 lg:px-5 py-2.5 text-[10px] uppercase tracking-[0.14em] text-gray-500 font-medium">
                Qty
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {mod.bom.map((item) => (
              <tr key={item.ref}>
                <td className="px-4 lg:px-5 py-2.5 text-gray-400 font-mono text-[11px]">
                  {item.ref}
                </td>
                <td className="px-4 lg:px-5 py-2.5 text-gray-300">
                  {item.description}
                </td>
                <td className="px-4 lg:px-5 py-2.5 text-gray-400 font-mono text-[11px]">
                  {item.part}
                </td>
                <td className="px-4 lg:px-5 py-2.5 text-gray-300 text-right font-mono tabular-nums">
                  {item.qty}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-800/60 bg-gray-900/40">
              <td
                colSpan={3}
                className="px-4 lg:px-5 py-2.5 text-xs text-gray-500"
              >
                Total components
              </td>
              <td className="px-4 lg:px-5 py-2.5 text-gray-100 text-right font-semibold font-mono tabular-nums">
                {total}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Section>
  );
}

// ─── Future improvements ───────────────────────────────────────
function ImprovementsSection({ mod }) {
  if (!mod.improvements || mod.improvements.length === 0) return null;
  return (
    <Section
      id="improvements"
      eyebrow="v2 roadmap"
      title="Future Improvements"
      description="Known limitations and the specific changes planned for the next revision."
    >
      <ol className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
        {mod.improvements.map((item, i) => (
          <li
            key={i}
            className="flex gap-3 rounded-md border border-gray-800/60 bg-gray-900/30 px-4 py-2.5"
          >
            <span className="text-[11px] font-mono tabular-nums text-gray-600 flex-shrink-0 mt-0.5">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-xs lg:text-sm text-gray-300 leading-relaxed">
              {item}
            </span>
          </li>
        ))}
      </ol>
    </Section>
  );
}

// ─── Tradeoff ──────────────────────────────────────────────────
function TradeoffSection({ mod }) {
  if (!mod.tradeoff) return null;
  return (
    <Section id="tradeoff" eyebrow="Core tension" title="Key Tradeoff">
      <TradeoffBox title={mod.tradeoff.title} text={mod.tradeoff.text} />
    </Section>
  );
}

// ─── Build the section list per project ───────────────────────
function buildSections(projectId, mod) {
  const isACU = projectId === "array-control-unit";
  const hasBoard = isACU
    ? true
    : !!(mod.modelPath || mod.gerberFiles?.length || mod.layoutPath || mod.photoPath);

  const list = [
    { id: "hero", label: "Overview" },
    hasBoard && { id: "board", label: isACU ? "Topology" : "Board" },
    { id: "schematic", label: "Schematic" },
    mod.decisions?.length && { id: "decisions", label: "Decisions" },
    mod.electrical?.length && { id: "specs", label: "Specs" },
    mod.bom?.length && { id: "bom", label: "BOM" },
    mod.improvements?.length && { id: "improvements", label: "Future v2" },
    mod.tradeoff && { id: "tradeoff", label: "Tradeoff" },
  ];

  return list.filter(Boolean);
}

// ─── Page ──────────────────────────────────────────────────────
export default function ShowcasePage() {
  const { projectId } = useParams();
  const [modules, setModules] = useState(null);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const scrollRef = useRef(null);

  const project = getProjectById(projectId);

  useEffect(() => {
    const loader = MODULE_MAP[projectId];
    if (!loader) return;
    loader().then((mod) => {
      const mods = mod.modules || mod.default;
      setModules(mods);
      setActiveModuleId(mods[0].id);
    });
  }, [projectId]);

  const activeMod = useMemo(
    () => modules?.find((m) => m.id === activeModuleId) || modules?.[0],
    [modules, activeModuleId],
  );

  const handleModuleSelect = useCallback((id) => {
    setActiveModuleId(id);
    requestAnimationFrame(() => {
      const container = scrollRef.current;
      if (container) container.scrollTo({ top: 0, behavior: "smooth" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, []);

  const sections = useMemo(
    () => (activeMod ? buildSections(projectId, activeMod) : []),
    [projectId, activeMod],
  );

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Project not found.</p>
      </div>
    );
  }

  if (!modules || !activeMod) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-600 border-t-gray-300 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto bg-gray-950">
      {/* Sticky chrome: module tabs + section sub-nav */}
      <div className="sticky top-0 z-30 bg-gray-950/90 backdrop-blur-md border-b border-gray-800/60">
        <div className="max-w-5xl mx-auto px-5 lg:px-8">
          <div className="flex items-center gap-4 py-2.5 overflow-x-auto border-b border-gray-800/40">
            <ModuleTabs
              modules={modules}
              activeId={activeModuleId}
              onSelect={handleModuleSelect}
            />
          </div>
          <div className="overflow-x-auto">
            <SectionNav
              sections={sections}
              offset={110}
              scrollRoot={scrollRef}
            />
          </div>
        </div>
      </div>

      {/* Scrolling case-study content */}
      <main key={activeModuleId}>
        <HeroSection mod={activeMod} projectName={project.title} />
        <BoardSection mod={activeMod} projectId={projectId} />
        <SchematicSection mod={activeMod} projectId={projectId} />
        <DecisionsSection mod={activeMod} />
        <SpecsSection mod={activeMod} />
        <BomSection mod={activeMod} />
        <ImprovementsSection mod={activeMod} />
        <TradeoffSection mod={activeMod} />

        <div className="h-12" />
      </main>
    </div>
  );
}
