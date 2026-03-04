export default function ComparisonTable({
  modules,
  activeModuleId,
  onModuleSelect,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="py-1.5 pr-3 font-medium text-gray-500 uppercase tracking-wider">
              Module
            </th>
            <th className="py-1.5 px-3 font-medium text-gray-500 uppercase tracking-wider">
              Duty
            </th>
            <th className="py-1.5 px-3 font-medium text-gray-500 uppercase tracking-wider">
              Current
            </th>
            <th className="py-1.5 pl-3 font-medium text-gray-500 uppercase tracking-wider">
              Thermal
            </th>
          </tr>
        </thead>
        <tbody>
          {modules.map((m) => {
            const isActive = m.id === activeModuleId;
            return (
              <tr
                key={m.id}
                onClick={() => onModuleSelect(m.id)}
                className={`cursor-pointer border-l-2 transition-colors ${
                  isActive
                    ? "border-gray-100 bg-gray-800/40"
                    : "border-transparent hover:bg-gray-800/30"
                }`}
              >
                <td
                  className={`py-1.5 pr-3 pl-2 font-medium ${
                    isActive ? "text-gray-100" : "text-gray-400"
                  }`}
                >
                  {m.shortName}
                </td>
                <td className="py-1.5 px-3 text-gray-500">
                  {m.comparison.dutyCycle}
                </td>
                <td className="py-1.5 px-3 text-gray-500 font-mono">
                  {m.comparison.current}
                </td>
                <td
                  className={`py-1.5 pl-3 font-medium ${
                    m.comparison.thermalPriority === "High"
                      ? "text-red-400/80"
                      : m.comparison.thermalPriority === "Medium"
                        ? "text-amber-400/80"
                        : "text-gray-400"
                  }`}
                >
                  {m.comparison.thermalPriority}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
