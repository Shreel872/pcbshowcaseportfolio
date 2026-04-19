import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function ProjectCard({
  to,
  eyebrow,
  title,
  pitch,
  stats,
  preview,
  previewLabel,
  statusBadge,
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      className="h-full"
    >
      <Link
        to={to}
        className="group flex flex-col h-full rounded-xl border border-gray-800/70 bg-gray-900/20 overflow-hidden transition-all duration-300 hover:border-gray-600 hover:bg-gray-900/40 hover:-translate-y-[2px]"
      >
        <div className="relative h-60 sm:h-64 bg-gray-950/40 border-b border-gray-800/60 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">{preview}</div>
          <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded bg-gray-950/70 backdrop-blur-sm border border-gray-800/70">
            <span className="text-[9px] uppercase tracking-[0.18em] text-gray-400 font-medium">
              {previewLabel}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-5 lg:p-6">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-medium">
              {eyebrow}
            </span>
            {statusBadge && (
              <>
                <span className="text-gray-700 text-[10px]">·</span>
                <span className="px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {statusBadge}
                </span>
              </>
            )}
          </div>

          <h3 className="text-lg lg:text-xl font-semibold text-gray-100 tracking-tight mb-2 group-hover:text-white transition-colors">
            {title}
          </h3>

          <p className="text-sm text-gray-400 leading-relaxed mb-5">{pitch}</p>

          <div className="grid grid-cols-3 gap-px bg-gray-800/60 rounded-md overflow-hidden mb-5">
            {stats.map((s) => (
              <div key={s.label} className="bg-gray-950/60 px-3 py-2.5">
                <p className="text-[9px] uppercase tracking-[0.14em] text-gray-500 font-medium mb-0.5">
                  {s.label}
                </p>
                <p className="text-xs font-mono text-gray-200 leading-tight">
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 group-hover:text-gray-100 transition-colors">
            View engineering breakdown
            <svg
              className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
