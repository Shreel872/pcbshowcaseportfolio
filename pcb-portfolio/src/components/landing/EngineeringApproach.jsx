import { motion } from "framer-motion";

const principles = [
  {
    title: "Automotive Voltage Tolerance",
    desc: "All designs operate across the 9–16 V automotive range with transient awareness per ISO 7637.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
      />
    ),
  },
  {
    title: "Thermal Modelling",
    desc: "Copper pour sizing and heat-spreading analysis to manage power dissipation without external heatsinks.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
      />
    ),
  },
  {
    title: "Trace Width Calculations",
    desc: "Current density and IPC-2221 trace width sizing for reliable continuous and peak current delivery.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
      />
    ),
  },
  {
    title: "Power Dissipation Analysis",
    desc: "Worst-case power calculations at maximum input voltage for resistor and LED thermal budgets.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    ),
  },
  {
    title: "Design for Manufacturability",
    desc: "Component placement, pad sizing, and design rules optimised for standard PCB fabrication processes.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.42 15.17l-5.977-3.397M11.42 15.17l5.977-3.397M11.42 15.17V21m-5.977-3.397L3.375 16.5V10.5l2.068-1.175m5.977 5.845V21m0 0l5.977-3.397V10.5l-2.068-1.175M11.42 15.17l5.977-5.845M5.443 4.153L11.42 7.5l5.977-3.347m-11.954 0L3.375 5.325V10.5l2.068 1.175m11.954-7.522L19.625 5.325V10.5l-2.068 1.175"
      />
    ),
  },
  {
    title: "Component Selection",
    desc: "LED and passive component selection driven by datasheet parameters, availability, and automotive temperature ratings.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
      />
    ),
  },
  {
    title: "Worst-Case Analysis",
    desc: "All circuits validated at voltage and temperature extremes to guarantee operation under automotive conditions.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    ),
  },
];

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function EngineeringApproach() {
  return (
    <section className="px-6 py-16 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-2">
          Methodology
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 tracking-tight mb-10">
          Engineering Approach
        </h2>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {principles.map((p) => (
          <motion.div
            key={p.title}
            variants={item}
            className="border border-gray-800 rounded-lg p-4 bg-gray-900/30 hover:bg-gray-900/50 hover:border-gray-700 transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-500 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              {p.icon}
            </svg>
            <h3 className="text-sm font-semibold text-gray-200 mb-1.5">
              {p.title}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
