import { useEffect, useState } from "react";

export default function SectionNav({ sections, offset = 120, scrollRoot }) {
  const [activeId, setActiveId] = useState(sections[0]?.id);

  useEffect(() => {
    const ids = sections.map((s) => s.id);
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (els.length === 0) return;

    const root = scrollRoot?.current ?? null;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      {
        root,
        rootMargin: `-${offset}px 0px -55% 0px`,
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections, offset, scrollRoot]);

  const handleClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;

    const container = scrollRoot?.current;
    if (container) {
      const top =
        el.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop -
        offset +
        4;
      container.scrollTo({ top, behavior: "smooth" });
    } else {
      const top = el.getBoundingClientRect().top + window.scrollY - offset + 4;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <nav
      aria-label="Section navigation"
      className="flex gap-4 sm:gap-5 overflow-x-auto flex-nowrap scrollbar-none -mb-px"
    >
      {sections.map((s) => {
        const isActive = s.id === activeId;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => handleClick(e, s.id)}
            className={`flex-shrink-0 py-2 text-[11px] font-medium tracking-wide whitespace-nowrap cursor-pointer border-b-2 transition-colors ${
              isActive
                ? "text-gray-100 border-gray-100"
                : "text-gray-500 border-transparent hover:text-gray-200 hover:border-gray-700"
            }`}
          >
            {s.label}
          </a>
        );
      })}
    </nav>
  );
}
