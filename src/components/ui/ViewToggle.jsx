import { useState, useRef, useEffect } from "react";

export default function ViewToggle({ views, activeView, onViewChange }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function isActive(view) {
    if (view.id === activeView) return true;
    if (view.subOptions) {
      return view.subOptions.some((sub) => sub.id === activeView);
    }
    return false;
  }

  function getDisplayLabel(view) {
    if (view.subOptions) {
      const activeSub = view.subOptions.find((sub) => sub.id === activeView);
      if (activeSub) return activeSub.label;
    }
    return view.label;
  }

  return (
    <div
      ref={containerRef}
      className="inline-flex flex-nowrap rounded-md bg-gray-900/80 border border-gray-800 p-0.5 gap-0.5"
    >
      {views.map((view) => {
        const active = isActive(view);

        // Plain button (no dropdown)
        if (!view.subOptions) {
          return (
            <button
              key={view.id}
              onClick={() => {
                onViewChange(view.id);
                setOpenDropdown(null);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                active
                  ? "bg-gray-700 text-gray-100"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {view.label}
            </button>
          );
        }

        // Dropdown button
        const isOpen = openDropdown === view.id;
        return (
          <div key={view.id} className="relative">
            <button
              onClick={() => setOpenDropdown(isOpen ? null : view.id)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                active
                  ? "bg-gray-700 text-gray-100"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {getDisplayLabel(view)}
              <svg
                className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isOpen && (
              <div className="absolute top-full right-0 mt-1 min-w-[160px] bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-50">
                {view.subOptions.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      onViewChange(sub.id);
                      setOpenDropdown(null);
                    }}
                    className={`block w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                      activeView === sub.id
                        ? "bg-gray-700 text-gray-100"
                        : "text-gray-400 hover:bg-gray-700/50 hover:text-gray-200"
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
