import { AnimatePresence, motion } from "framer-motion";
import ComparisonTable from "./ComparisonTable";
import SpecSection from "./SpecSection";
import CalculationBlock from "./CalculationBlock";
import TradeoffBox from "./TradeoffBox";

export default function EngineeringPanel({
  module: mod,
  allModules,
  activeModuleId,
  onModuleSelect,
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 z-10 bg-gray-950 border-b border-gray-800/60 p-4 pb-3">
        <ComparisonTable
          modules={allModules}
          activeModuleId={activeModuleId}
          onModuleSelect={onModuleSelect}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-5 pt-4">
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

            <SpecSection title="Key Calculations">
              <CalculationBlock calculations={mod.calculations} />
            </SpecSection>

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
