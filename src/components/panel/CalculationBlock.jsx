import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

export default function CalculationBlock({ calculations }) {
  const rendered = useMemo(
    () =>
      calculations.map((calc) => ({
        ...calc,
        html: katex.renderToString(calc.latex, {
          throwOnError: false,
          displayMode: true,
        }),
      })),
    [calculations],
  );

  return (
    <div className="space-y-2.5">
      {rendered.map((calc) => (
        <div
          key={calc.title}
          className="p-3 bg-gray-900/60 rounded-lg border border-gray-800/60"
        >
          <p className="text-[11px] text-gray-500 mb-2 uppercase tracking-wider">
            {calc.title}
          </p>
          <div
            className="text-gray-300 overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: calc.html }}
          />
        </div>
      ))}
    </div>
  );
}
