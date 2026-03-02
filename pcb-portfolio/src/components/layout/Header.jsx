import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const isProjectPage = location.pathname.startsWith("/projects/");

  return (
    <header className="border-b border-gray-800/80 bg-gray-950 sticky top-0 z-50">
      <div className="w-full px-6 py-3.5 flex items-center">
        {isProjectPage ? (
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span className="text-sm">Back</span>
          </Link>
        ) : (
          <Link to="/" className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-100 bg-gray-800 border border-gray-700 w-8 h-8 rounded flex items-center justify-center tracking-tight">
              SP
            </span>
            <span className="text-[15px] font-semibold text-gray-100 tracking-tight">
              Shreel Patel
            </span>
          </Link>
        )}
      </div>
    </header>
  );
}
