import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CalculationBlock from "../panel/CalculationBlock";
import CategoryIcon from "../showcase/CategoryIcon";

const CAT = {
  architecture: {
    label: "Architecture",
    text: "text-purple-300",
    textDim: "text-purple-400/70",
    accent: "bg-purple-400",
    glow: "group-hover:border-purple-500/40",
    tint: "group-hover:shadow-[0_0_0_1px_rgba(168,85,247,0.18)]",
  },
  component: {
    label: "Component",
    text: "text-sky-300",
    textDim: "text-sky-400/70",
    accent: "bg-sky-400",
    glow: "group-hover:border-sky-500/40",
    tint: "group-hover:shadow-[0_0_0_1px_rgba(56,189,248,0.18)]",
  },
  isolation: {
    label: "Isolation",
    text: "text-rose-300",
    textDim: "text-rose-400/70",
    accent: "bg-rose-400",
    glow: "group-hover:border-rose-500/40",
    tint: "group-hover:shadow-[0_0_0_1px_rgba(244,63,94,0.18)]",
  },
  power: {
    label: "Power",
    text: "text-amber-300",
    textDim: "text-amber-400/70",
    accent: "bg-amber-400",
    glow: "group-hover:border-amber-500/40",
    tint: "group-hover:shadow-[0_0_0_1px_rgba(251,191,36,0.18)]",
  },
  thermal: {
    label: "Thermal",
    text: "text-orange-300",
    textDim: "text-orange-400/70",
    accent: "bg-orange-400",
    glow: "group-hover:border-orange-500/40",
    tint: "group-hover:shadow-[0_0_0_1px_rgba(251,146,60,0.18)]",
  },
};

function RedesignBanner({ note }) {
  return (
    <div className="flex items-start gap-2.5 px-3.5 py-2.5 mb-5 rounded-md border border-amber-500/20 bg-amber-500/5">
      <svg
        className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
      <p className="text-xs text-amber-300/80 leading-relaxed">{note}</p>
    </div>
  );
}

function BeforeAfterStrip({ data }) {
  const rows = Math.max(data.removed.length, data.added.length);
  return (
    <div className="mb-5 rounded-lg border border-gray-800/60 bg-gray-900/20 overflow-hidden">
      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch">
        <div className="p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 mb-2 font-medium">
            Before
          </p>
          <ul className="space-y-1.5">
            {data.removed.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-xs text-gray-500"
              >
                <span className="text-rose-500/60 flex-shrink-0 mt-0.5">
                  ✕
                </span>
                <span className="line-through decoration-rose-500/30">
                  {item}
                </span>
              </li>
            ))}
            {Array.from({ length: rows - data.removed.length }).map((_, i) => (
              <li key={`b-${i}`} className="h-5" />
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-center px-2 border-x border-gray-800/60 bg-gray-900/40">
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.6}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 5l7 7-7 7M5 12h15"
            />
          </svg>
        </div>

        <div className="p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-400/80 mb-2 font-medium">
            After
          </p>
          <ul className="space-y-1.5">
            {data.added.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-xs text-gray-200"
              >
                <span className="text-emerald-400 flex-shrink-0 mt-0.5">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ExpandableSection({ label, children, accentText = "text-indigo-300" }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-gray-800/60">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-5 py-3 text-xs font-medium ${accentText} hover:bg-gray-800/20 transition-colors`}
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
          {open ? `Hide ${label}` : `View ${label}`}
        </span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-800/40">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DecisionBlock({ decision, index, calculations }) {
  const cat = CAT[decision.category] ?? CAT.component;
  const linkedCalcs = useMemo(() => {
    if (!decision.calcRefs || !calculations) return [];
    return calculations.filter((c) => decision.calcRefs.includes(c.title));
  }, [decision.calcRefs, calculations]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03, ease: "easeOut" }}
      className={`group relative rounded-lg border border-gray-800/60 bg-gray-900/20 overflow-hidden transition-all duration-200 hover:-translate-y-[1px] ${cat.glow} ${cat.tint}`}
    >
      {/* Category accent bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-[2px] ${cat.accent}`}
      />

      <div className="p-4 pl-5">
        {/* Eyebrow row: number + category */}
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-mono tabular-nums text-gray-600">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div
            className={`flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] ${cat.text}`}
          >
            <CategoryIcon category={decision.category} className="w-3 h-3" />
            {cat.label}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-medium mb-1.5">
          {decision.title}
        </h3>

        {/* Chosen — the dominant text */}
        <p className="text-sm lg:text-base font-semibold text-gray-50 leading-snug">
          {decision.chosen.label}
        </p>
        <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">
          {decision.chosen.reason}
        </p>

        {/* Hairline divider */}
        <div className="my-3 border-t border-gray-800/60" />

        {/* Rejected — muted secondary */}
        <div className="flex items-start gap-2">
          <span className="text-gray-600 text-xs leading-none mt-[2px]">×</span>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-gray-500 font-medium">
              vs. {decision.rejected.label}
            </p>
            <p className="text-[11px] text-gray-600 leading-relaxed mt-0.5">
              {decision.rejected.reason}
            </p>
          </div>
        </div>
      </div>

      {/* Inline calculations expandable */}
      {linkedCalcs.length > 0 && (
        <ExpandableSection label="calculations" accentText={cat.text}>
          <div className="p-5 bg-gray-950/40">
            <CalculationBlock calculations={linkedCalcs} />
          </div>
        </ExpandableSection>
      )}

    </motion.article>
  );
}

export default function DecisionSlides({
  decisions,
  beforeAfter,
  redesignNote,
  calculations,
  embedded = false,
}) {
  const wrapperClass = embedded
    ? ""
    : "h-full overflow-y-auto px-5 py-5";

  return (
    <div className={wrapperClass}>
      {redesignNote && <RedesignBanner note={redesignNote} />}
      {beforeAfter && <BeforeAfterStrip data={beforeAfter} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {decisions.map((d, i) => (
          <DecisionBlock
            key={d.title}
            decision={d}
            index={i}
            calculations={calculations}
          />
        ))}
      </div>
    </div>
  );
}
