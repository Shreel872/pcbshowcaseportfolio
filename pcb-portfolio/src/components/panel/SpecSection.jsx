export default function SpecSection({ title, children }) {
  return (
    <section className="mb-6">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        {title}
      </h3>
      {children}
    </section>
  );
}
