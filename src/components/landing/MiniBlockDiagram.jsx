export default function MiniBlockDiagram() {
  return (
    <svg
      viewBox="0 0 360 180"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <rect width="360" height="180" fill="transparent" />

      <rect x={150} y={8} width={60} height={20} rx={4} fill="#1e293b" stroke="#6366f1" strokeWidth={1} />
      <text x={180} y={20} textAnchor="middle" fill="#e2e8f0" fontSize="6.5" fontWeight="600">ECU</text>
      <text x={180} y={27} textAnchor="middle" fill="#94a3b8" fontSize="4">monitor</text>

      <rect x={265} y={8} width={50} height={20} rx={4} fill="#1e293b" stroke="#6366f1" strokeWidth={1} />
      <text x={290} y={20} textAnchor="middle" fill="#e2e8f0" fontSize="6.5" fontWeight="600">BMU</text>

      <line x1={210} y1={18} x2={265} y2={18} stroke="#6366f1" strokeWidth={0.8} strokeDasharray="3 2" />
      <text x={237} y={14} textAnchor="middle" fill="#818cf8" fontSize="4">CAN</text>

      <line x1={85} y1={60} x2={85} y2={18} stroke="#6366f1" strokeWidth={0.8} strokeDasharray="3 2" />
      <line x1={85} y1={18} x2={150} y2={18} stroke="#6366f1" strokeWidth={0.8} strokeDasharray="3 2" />
      <text x={117} y={14} textAnchor="middle" fill="#818cf8" fontSize="4">CAN</text>

      <rect x={8} y={65} width={45} height={40} rx={4} fill="#0f172a" stroke="#3b82f6" strokeWidth={1} />
      <text x={30} y={85} textAnchor="middle" fill="#e2e8f0" fontSize="6" fontWeight="600">Solar</text>
      <text x={30} y={93} textAnchor="middle" fill="#94a3b8" fontSize="4.5">Array</text>

      <line x1={53} y1={85} x2={63} y2={85} stroke="#3b82f6" strokeWidth={1} />
      <circle cx={63} cy={85} r={2} fill="#3b82f6" />
      <line x1={63} y1={85} x2={63} y2={72} stroke="#3b82f6" strokeWidth={1} />
      <line x1={63} y1={72} x2={70} y2={72} stroke="#3b82f6" strokeWidth={1} />
      <polygon points="70,72 66,69 66,75" fill="#3b82f6" />
      <line x1={63} y1={85} x2={63} y2={98} stroke="#3b82f6" strokeWidth={1} />
      <line x1={63} y1={98} x2={70} y2={98} stroke="#3b82f6" strokeWidth={1} />
      <polygon points="70,98 66,95 66,101" fill="#3b82f6" />

      <rect x={70} y={60} width={50} height={24} rx={4} fill="#0f172a" stroke="#3b82f6" strokeWidth={1} />
      <text x={95} y={75} textAnchor="middle" fill="#e2e8f0" fontSize="6" fontWeight="600">MPPT 1</text>

      <rect x={70} y={88} width={50} height={24} rx={4} fill="#0f172a" stroke="#3b82f6" strokeWidth={1} />
      <text x={95} y={103} textAnchor="middle" fill="#e2e8f0" fontSize="6" fontWeight="600">MPPT 2</text>

      <line x1={120} y1={72} x2={135} y2={72} stroke="#3b82f6" strokeWidth={1} />
      <line x1={135} y1={72} x2={135} y2={85} stroke="#3b82f6" strokeWidth={1} />
      <line x1={120} y1={100} x2={135} y2={100} stroke="#3b82f6" strokeWidth={1} />
      <line x1={135} y1={100} x2={135} y2={85} stroke="#3b82f6" strokeWidth={1} />
      <circle cx={135} cy={85} r={2} fill="#3b82f6" />
      <line x1={135} y1={85} x2={148} y2={85} stroke="#3b82f6" strokeWidth={1} />
      <polygon points="148,85 143,82 143,88" fill="#3b82f6" />

      <rect x={148} y={42} width={75} height={120} rx={5} fill="#1a1207" stroke="#f59e0b" strokeWidth={1.5} />
      <text x={185} y={54} textAnchor="middle" fill="#f59e0b" fontSize="6.5" fontWeight="700">ACU</text>

      <rect x={156} y={60} width={58} height={12} rx={3} fill="#1e293b" stroke="#475569" strokeWidth={0.8} />
      <text x={185} y={68} textAnchor="middle" fill="#e2e8f0" fontSize="4.5">Precharge R</text>

      <rect x={156} y={76} width={58} height={12} rx={3} fill="#1e293b" stroke="#a78bfa" strokeWidth={0.8} />
      <text x={185} y={84} textAnchor="middle" fill="#e2e8f0" fontSize="4.5">RKE-2405 Iso Buck</text>

      <rect x={156} y={92} width={58} height={12} rx={3} fill="#1e293b" stroke="#22c55e" strokeWidth={0.8} />
      <text x={185} y={100} textAnchor="middle" fill="#e2e8f0" fontSize="4.5">TLV3211 @ 90%</text>

      <line x1={156} y1={108} x2={214} y2={108} stroke="#ef4444" strokeWidth={0.8} strokeDasharray="3 2" />
      <text x={185} y={116} textAnchor="middle" fill="#ef4444" fontSize="4">HV / LV Isolation</text>

      <rect x={156} y={121} width={58} height={12} rx={3} fill="#1e293b" stroke="#475569" strokeWidth={0.8} />
      <text x={185} y={129} textAnchor="middle" fill="#e2e8f0" fontSize="4.5">Opto + CMOS Inv.</text>

      <rect x={156} y={135} width={58} height={11} rx={3} fill="#1e293b" stroke="#f59e0b" strokeWidth={0.8} />
      <text x={185} y={142} textAnchor="middle" fill="#e2e8f0" fontSize="4.5">U5 BTS441 → Main</text>

      <rect x={156} y={148} width={58} height={11} rx={3} fill="#1e293b" stroke="#f59e0b" strokeWidth={0.8} />
      <text x={185} y={155} textAnchor="middle" fill="#e2e8f0" fontSize="4.5">U4 BTS441 → Pre</text>

      <line x1={223} y1={85} x2={248} y2={85} stroke="#3b82f6" strokeWidth={1} />
      <polygon points="248,85 243,82 243,88" fill="#3b82f6" />

      <rect x={248} y={65} width={55} height={40} rx={4} fill="#0f172a" stroke="#3b82f6" strokeWidth={1} />
      <text x={275} y={83} textAnchor="middle" fill="#e2e8f0" fontSize="6.5" fontWeight="600">Battery</text>
      <text x={275} y={93} textAnchor="middle" fill="#94a3b8" fontSize="4.5">~160 V</text>

      <line x1={290} y1={28} x2={290} y2={65} stroke="#6366f1" strokeWidth={0.6} strokeDasharray="3 2" />
    </svg>
  );
}
