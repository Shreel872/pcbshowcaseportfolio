import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { modules } from "../../data/modules";
import CalculationBlock from "../panel/CalculationBlock";
import ComparisonTable from "../panel/ComparisonTable";

const ModelViewer = lazy(() => import("../viewer/ModelViewer"));

const chmsl = modules[0];

export default function FeaturedProject() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="px-6 py-16 max-w-5xl mx-auto"
    >
      <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-2">
        Featured Project
      </p>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 tracking-tight mb-3">
        Automotive Exterior Lighting System
      </h2>
      <p className="text-sm text-gray-400 leading-relaxed max-w-2xl mb-10">
        Designed and validated a 5-module automotive lighting PCB family
        including DRL, brake, indicator, and central stop light modules.
        Focused on thermal dissipation, copper current distribution, automotive
        voltage tolerance (9–16 V), and reliability.
      </p>

      {/* Tiles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* 3D PCB render tile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="border border-gray-800 rounded-lg overflow-hidden bg-gray-900/40"
        >
          <div className="px-4 pt-3 pb-2">
            <p className="text-[11px] uppercase tracking-wider text-gray-500">
              3D PCB Model
            </p>
          </div>
          <div className="h-64 sm:h-72">
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
          </div>
        </motion.div>

        {/* Thermal calculation tile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="border border-gray-800 rounded-lg p-4 bg-gray-900/40"
        >
          <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-3">
            Sample Calculation — CHMSL
          </p>
          <CalculationBlock calculations={chmsl.calculations.slice(0, 2)} />
        </motion.div>

        {/* Module comparison table tile — full width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="md:col-span-2 border border-gray-800 rounded-lg p-4 bg-gray-900/40"
        >
          <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-3">
            Module Comparison
          </p>
          <div className="pointer-events-none">
            <ComparisonTable
              modules={modules}
              activeModuleId="central-brake"
              onModuleSelect={() => {}}
            />
          </div>
        </motion.div>
      </div>

      {/* CTA */}
      <Link
        to="/projects/automotive-lighting"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-gray-100 transition-colors group"
      >
        View Full Engineering Breakdown
        <svg
          className="w-4 h-4 transition-transform group-hover:translate-x-1"
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
      </Link>
    </motion.section>
  );
}
