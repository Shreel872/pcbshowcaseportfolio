const ICONS = {
  architecture: (
    <>
      <path d="M3 7l9-4 9 4-9 4-9-4z" />
      <path d="M3 12l9 4 9-4" />
      <path d="M3 17l9 4 9-4" />
    </>
  ),
  component: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
      <path d="M9 3v3M12 3v3M15 3v3M9 18v3M12 18v3M15 18v3" />
      <path d="M3 9h3M3 12h3M3 15h3M18 9h3M18 12h3M18 15h3" />
    </>
  ),
  isolation: (
    <>
      <path d="M12 2l8 3v6c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5l8-3z" />
    </>
  ),
  power: (
    <>
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
    </>
  ),
  thermal: (
    <>
      <path d="M12 2s5 5 5 10a5 5 0 01-10 0c0-5 5-10 5-10z" />
      <path d="M12 15a2 2 0 100-4 2 2 0 000 4z" />
    </>
  ),
};

export default function CategoryIcon({ category, className = "w-3.5 h-3.5" }) {
  const paths = ICONS[category] ?? ICONS.component;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths}
    </svg>
  );
}
