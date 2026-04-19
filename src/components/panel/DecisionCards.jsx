import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CAT = {
  architecture: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", label: "Architecture" },
  component:    { text: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   label: "Component" },
  isolation:    { text: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    label: "Isolation" },
  power:        { text: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  label: "Power" },
};

function BeforeAfterBanner({ data }) {
  return (
    <div className="mb-5 grid grid-cols-2 rounded-lg border border-gray-800/60 overflow-hidden text-xs">
      <div className="p-3 border-r border-gray-800/60">
        <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-2">Before</p>
        <ul className="space-y-1">
          {data.removed.map((item) => (
            <li key={item} className="flex items-center gap-1.5 text-gray-500">
              <span className="text-red-500/50">✕</span>{item}
            </li>
          ))}
        </ul>
      </div>
      <div className="p-3">
        <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-2">After</p>
        <ul className="space-y-1">
          {data.added.map((item) => (
            <li key={item} className="flex items-center gap-1.5 text-gray-300">
              <span className="text-green-500/70">✓</span>{item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function DecisionCard({ decision, index }) {
  const cat = CAT[decision.category] ?? CAT.component;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: index * 0.035 }}
      className="rounded-lg border border-gray-800/60 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-gray-900/30">
        <span className="text-xs font-semibold text-gray-200">{decision.title}</span>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${cat.bg} ${cat.text} ${cat.border}`}>
          {cat.label}
        </span>
      </div>
      {/* Rows */}
      <div className="divide-y divide-gray-800/40">
        <div className="flex items-baseline gap-2.5 px-3.5 py-2">
          <span className="text-[10px] font-semibold text-green-500 w-12 flex-shrink-0">Chosen</span>
          <span className="text-xs font-medium text-gray-200 flex-shrink-0">{decision.chosen.label}</span>
          <span className="text-xs text-gray-500 ml-auto pl-2 text-right">{decision.chosen.reason}</span>
        </div>
        <div className="flex items-baseline gap-2.5 px-3.5 py-2">
          <span className="text-[10px] font-semibold text-gray-600 w-12 flex-shrink-0">vs.</span>
          <span className="text-xs font-medium text-gray-500 flex-shrink-0">{decision.rejected.label}</span>
          <span className="text-xs text-gray-600 ml-auto pl-2 text-right">{decision.rejected.reason}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function DecisionCards({ decisions, beforeAfter }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const usedCategories = ["all", ...new Set(decisions.map((d) => d.category))];
  const filtered = activeCategory === "all" ? decisions : decisions.filter((d) => d.category === activeCategory);

  return (
    <div>
      {beforeAfter && <BeforeAfterBanner data={beforeAfter} />}

      <div className="flex flex-wrap gap-1.5 mb-4">
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
          className="space-y-2"
        >
          {filtered.map((d, i) => (
            <DecisionCard key={d.title} decision={d} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
