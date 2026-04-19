import { AnimatePresence, motion } from "framer-motion";
import ComparisonTable from "./ComparisonTable";
import SpecSection from "./SpecSection";
import CalculationBlock from "./CalculationBlock";
import TradeoffBox from "./TradeoffBox";
import DecisionCards from "./DecisionCards";

export default function EngineeringPanel({
  module: mod,
  allModules,
  activeModuleId,
  onModuleSelect,
}) {
  return (
    <div className="lg:h-full flex flex-col">
      <div className="lg:sticky lg:top-0 z-10 bg-gray-950 border-b border-gray-800/60 p-2.5 lg:p-4 lg:pb-3">
        <ComparisonTable
          modules={allModules}
          activeModuleId={activeModuleId}
          onModuleSelect={onModuleSelect}
        />
      </div>

      <div className="lg:flex-1 lg:overflow-y-auto p-5 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={mod.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-base font-semibold text-gray-100 mb-0.5">
              {mod.name}
            </h2>
            <p className="text-[11px] text-gray-500 mb-5">{mod.shortName} Module</p>

            <SpecSection title="Purpose">
              <p className="text-sm text-gray-400 leading-relaxed">
                {mod.purpose}
              </p>
            </SpecSection>

            <SpecSection title="Electrical Requirements">
              <ul className="space-y-1.5">
                {mod.electrical.map((e) => (
                  <li
                    key={e.label}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="text-gray-500 flex-shrink-0 w-[140px]">
                      {e.label}
                    </span>
                    <span className="text-gray-300 font-mono text-xs bg-gray-800/50 px-1.5 py-0.5 rounded">
                      {e.value}
                    </span>
                  </li>
                ))}
              </ul>
            </SpecSection>

            {mod.calculations && mod.calculations.length > 0 && (
              <SpecSection title="Key Calculations">
                <CalculationBlock calculations={mod.calculations} />
              </SpecSection>
            )}

            {mod.decisions && mod.decisions.length > 0 ? (
              <SpecSection title="Design Decisions">
                <DecisionCards decisions={mod.decisions} beforeAfter={mod.beforeAfter} />
              </SpecSection>
            ) : (
              <SpecSection title="Design Considerations">
                <ul className="space-y-1.5">
                  {mod.designConsiderations.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="text-gray-600 mt-1.5 flex-shrink-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </SpecSection>
            )}

            {mod.improvements && mod.improvements.length > 0 && (
            <SpecSection title="What I'd Improve (v2)">
              <ul className="space-y-1.5">
                {mod.improvements.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <span className="text-gray-600 mt-1.5 flex-shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </SpecSection>
            )}

            {mod.redesignNote && (
              <div className="mb-6 flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5">
                <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-xs text-amber-300/80 leading-relaxed">{mod.redesignNote}</p>
              </div>
            )}

            {mod.bom && mod.bom.length > 0 && (
              <SpecSection title="Bill of Materials">
                <div className="rounded-lg border border-gray-800/60 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-800/60 bg-gray-900/40">
                        <th className="text-left px-3 py-2 text-gray-500 font-medium">Ref</th>
                        <th className="text-left px-3 py-2 text-gray-500 font-medium">Part</th>
                        <th className="text-right px-3 py-2 text-gray-500 font-medium">Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/40">
                      {mod.bom.map((item) => (
                        <tr key={item.ref}>
                          <td className="px-3 py-2 text-gray-500 font-mono">{item.ref}</td>
                          <td className="px-3 py-2 text-gray-300">{item.part}</td>
                          <td className="px-3 py-2 text-gray-400 text-right">{item.qty}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-gray-800/60 bg-gray-900/20">
                        <td colSpan={2} className="px-3 py-2 text-gray-600 text-xs">Total components</td>
                        <td className="px-3 py-2 text-gray-400 text-right font-semibold">
                          {mod.bom.reduce((s, i) => s + i.qty, 0)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </SpecSection>
            )}

            <div className="mt-2">
              <TradeoffBox
                title={mod.tradeoff.title}
                text={mod.tradeoff.text}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
