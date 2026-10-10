export function MoneySpentSankey() {
  return (
    <div className="relative h-[240px] w-full select-none overflow-hidden rounded-3xl bg-purple-50/20 p-4">
      {/* ---------------- 1. SVG Flow Ribbons (Sankey Paths) ---------------- */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 500 240"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Lime Flow Gradient */}
          <linearGradient id="limeFlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d9f99d" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#bef264" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#d9f99d" stopOpacity="0.85" />
          </linearGradient>

          {/* Purple Flow Gradient */}
          <linearGradient id="purpleFlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ddd6fe" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#c4b5fd" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#ddd6fe" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* --- PATH 1: Green Flow (27% Accounts -> $56.451) --- */}
        <path
          d="
            M 85,50
            C 180,50 200,140 400,140
            L 400,165
            C 200,165 170,85 85,85
            Z
          "
          fill="url(#limeFlow)"
        />

        {/* --- PATH 2: Purple Flow Top (73% -> $112.245) --- */}
        <path
          d="
            M 85,115
            C 190,115 220,40 400,40
            L 400,70
            C 230,70 180,140 85,140
            Z
          "
          fill="url(#purpleFlow)"
        />

        {/* --- PATH 3: Purple Flow Bottom (73% -> $188.429) --- */}
        <path
          d="
            M 85,150
            C 180,150 250,200 400,200
            L 400,225
            C 240,225 170,185 85,185
            Z
          "
          fill="url(#purpleFlow)"
        />
      </svg>

      {/* ---------------- 2. HTML/Tailwind Node Overlays ---------------- */}
      <div className="relative z-10 flex h-full items-center justify-between">

        {/* === SISI KIRI (Source Nodes) === */}
        <div className="flex h-full flex-col justify-between gap-2 py-1">
          {/* Top Green Node */}
          <div className="flex h-20 w-20 flex-col justify-between rounded-2xl border border-white/60 bg-[#d9f99d] p-2 shadow-xs">
            <span className="text-base font-extrabold text-gray-900">27%</span>
            <span className="text-[10px] font-medium text-gray-600">Accounts</span>
          </div>

          {/* Bottom Purple Node */}
          <div className="flex h-28 w-20 flex-col justify-between rounded-2xl border border-white/60 bg-[#ddd6fe] p-2.5 shadow-xs">
            <span className="text-[10px] font-medium text-purple-700">Essentials</span>
            <span className="text-[10px] font-medium text-purple-700">Transfers</span>
            <span className="text-base font-extrabold text-gray-900">73%</span>
            <span className="text-[10px] font-medium text-purple-700">Accounts</span>
          </div>
        </div>

        {/* === TENGAH (Intermediate Center Badge) === */}
        <div className="rounded-2xl border border-white/90 bg-white/80 px-3.5 py-2 text-center shadow-md backdrop-blur-md">
          <p className="mb-0.5 text-[10px] font-bold text-gray-500">-40%</p>
          <p className="text-xs font-black text-gray-900">$189.125</p>
        </div>

        {/* === SISI KANAN (Destination Nodes) === */}
        <div className="flex h-full flex-col items-end justify-between gap-2 py-1">
          {/* Top Right Node */}
          <div className="flex items-center gap-2 rounded-2xl border border-white/60 bg-[#e9d5ff] p-1.5 pl-3 shadow-xs">
            <span className="text-xs font-extrabold text-gray-900">$112.245</span>
            <div className="flex -space-x-1.5">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                className="h-5 w-5 rounded-full object-cover ring-1 ring-white"
                alt="user1"
              />
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=80"
                className="h-5 w-5 rounded-full object-cover ring-1 ring-white"
                alt="user2"
              />
            </div>
          </div>

          {/* Middle Right Node */}
          <div className="flex items-center gap-2 rounded-2xl border border-white/60 bg-[#d9f99d] p-1.5 pl-3 shadow-xs">
            <span className="text-xs font-extrabold text-gray-900">$56.451</span>
            <div className="flex flex-col gap-0.5">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] text-white">🏠</div>
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-400 text-[8px] text-white">🏠</div>
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[8px] text-white">🏠</div>
            </div>
          </div>

          {/* Bottom Right Node */}
          <div className="flex items-center gap-2 rounded-2xl border border-white/60 bg-[#e9d5ff] p-1.5 pl-3 shadow-xs">
            <span className="text-xs font-extrabold text-gray-900">$188.429</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-xl bg-white/80 text-xs">
              🧃
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
