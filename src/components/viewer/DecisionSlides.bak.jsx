import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PrechargeSimulator from "./PrechargeSimulator";

const CAT = {
  architecture: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", label: "Architecture" },
  component:    { text: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   label: "Component" },
  isolation:    { text: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    label: "Isolation" },
  power:        { text: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  label: "Power" },
  thermal:      { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", label: "Thermal" },
};

function RedesignBanner({ note }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 mb-6 rounded-lg border border-amber-500/20 bg-amber-500/5">
      <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <p className="text-xs text-amber-300/80 leading-relaxed">{note}</p>
    </div>
  );
}

function BeforeAfterStrip({ data }) {
  return (
    <div className="grid grid-cols-2 rounded-lg border border-gray-800/60 overflow-hidden mb-6 text-xs">
      <div className="p-3.5 border-r border-gray-800/60 bg-gray-900/30">
        <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-2">Before</p>
        <ul className="space-y-1.5">
          {data.removed.map((item) => (
            <li key={item} className="flex items-center gap-2 text-gray-500">
              <span className="text-red-500/50 flex-shrink-0">✕</span>{item}
            </li>
          ))}
        </ul>
      </div>
      <div className="p-3.5 bg-gray-900/30">
        <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-2">After</p>
        <ul className="space-y-1.5">
          {data.added.map((item) => (
            <li key={item} className="flex items-center gap-2 text-gray-200">
              <span className="text-green-500/70 flex-shrink-0">✓</span>{item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SlideCard({ decision, index }) {
  const [simOpen, setSimOpen] = useState(false);
  const cat = CAT[decision.category] ?? CAT.component;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: index * 0.04 }}
      className="rounded-xl border border-gray-800/60 bg-gray-900/20 overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/40">
        <span className="text-sm font-semibold text-gray-100">{decision.title}</span>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${cat.bg} ${cat.text} ${cat.border}`}>
          {cat.label}
        </span>
      </div>

      {/* Chosen */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-green-500 uppercase tracking-wide">✓ Chosen</span>
          <span className="text-xs font-semibold text-gray-200">{decision.chosen.label}</span>
        </div>
        <p className="text-xs text-gray-500 pl-0">{decision.chosen.reason}</p>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-gray-800/40" />

      {/* Rejected */}
      <div className="px-4 pt-2 pb-3 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">✕ vs.</span>
          <span className="text-xs font-medium text-gray-500">{decision.rejected.label}</span>
        </div>
        <p className="text-xs text-gray-600">{decision.rejected.reason}</p>
      </div>

      {/* SPICE sim toggle — only on marked decisions */}
      {decision.spiceSimLinked && (
        <div className="border-t border-gray-800/40">
          <button
            onClick={() => setSimOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:bg-gray-800/30 transition-colors"
          >
            <span>{simOpen ? "Hide simulation" : "View SPICE simulation"}</span>
            <motion.svg
              animate={{ rotate: simOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-4 h-4"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>
          <AnimatePresence>
            {simOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="border-t border-gray-800/40 h-[340px]">
                  <PrechargeSimulator />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

export default function DecisionSlides({ decisions, beforeAfter, redesignNote }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const usedCategories = ["all", ...new Set(decisions.map((d) => d.category))];
  const filtered = activeCategory === "all" ? decisions : decisions.filter((d) => d.category === activeCategory);

  return (
    <div className="h-full overflow-y-auto px-5 py-5">
      {redesignNote && <RedesignBanner note={redesignNote} />}
      {beforeAfter && <BeforeAfterStrip data={beforeAfter} />}

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {usedCategories.map((cat) => {
          const isActive = cat === activeCategory;
          const c = CAT[cat];
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 text-[10px] font-medium rounded-full transition-colors ${
                isActive
                  ? cat === "all"
                    ? "bg-gray-100 text-gray-900"
                    : `${c.bg} ${c.text} border ${c.border}`
                  : "text-gray-600 bg-gray-800/40 hover:text-gray-300"
              }`}
            >
              {cat === "all" ? "All" : c?.label ?? cat}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {filtered.map((d, i) => (
            <SlideCard key={d.title} decision={d} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
