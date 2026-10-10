export function FinancialManagerCard() {
  return (
    <div className="flex flex-col justify-between rounded-3xl border border-gray-100/80 bg-white p-5 shadow-xs">
      <div className="mb-3 flex items-center gap-3">
        <img
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
          alt="Josh Gomez"
          className="h-10 w-10 rounded-full object-cover"
        />
        <div>
          <h4 className="text-sm font-bold text-gray-900">Josh Gomez</h4>
          <p className="text-[11px] text-gray-400">Financial Manager</p>
        </div>
      </div>

      <p className="mb-4 text-xs leading-relaxed text-gray-600">
        You have USD 1000 pending money, it will be ready in 2 business days.
      </p>

      <button className="w-full rounded-2xl bg-[#e3d5ff] px-4 py-2.5 text-xs font-bold text-purple-950 transition active:scale-95 hover:bg-[#d4c1ff]">
        Get your money now
      </button>
    </div>
  )
}
