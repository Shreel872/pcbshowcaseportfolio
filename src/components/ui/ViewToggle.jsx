export default function ViewToggle({ views, activeView, onViewChange }) {
  return (
    <div className="inline-flex rounded-md bg-gray-900/80 border border-gray-800 p-0.5 gap-0.5">
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            activeView === view.id
              ? "bg-gray-700 text-gray-100"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
}
