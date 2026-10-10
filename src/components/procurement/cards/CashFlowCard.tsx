import { Calendar, SlidersHorizontal, ArrowUpRight } from 'lucide-react'

export function CashFlowCard() {
  return (
    <div className="flex min-h-[380px] flex-col justify-between rounded-3xl border border-gray-100/80 bg-white p-6 shadow-xs">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Cash Flow</h2>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">Monthly</span>
            <button className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100">
              <Calendar className="h-4 w-4" />
            </button>
            <button className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100">
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <p className="mb-0.5 text-xs text-gray-400">Overall balance</p>
            <p className="text-xl font-bold text-gray-900">$38.962</p>
          </div>
          <div>
            <p className="mb-0.5 text-xs text-gray-400">2 days ago</p>
            <p className="text-xl font-bold text-gray-900">$3.382</p>
          </div>
        </div>
      </div>

      {/* Monthly Bar Chart */}
      <div className="relative flex h-44 items-end justify-between px-1 pt-6">
        {/* Apr Active Badge */}
        <div className="absolute left-[39%] top-1 rounded-full bg-[#d9f99d] px-2.5 py-1 text-xs font-extrabold text-gray-900 shadow-sm">
          $ 36.962
        </div>

        {[
          { month: 'Feb', height: 'h-16', active: false },
          { month: 'Mar', height: 'h-24', active: false },
          { month: 'Apr', height: 'h-32', active: true },
          { month: 'May', height: 'h-36', active: false },
          { month: 'May', height: 'h-28', active: false },
          { month: 'Jun', height: 'h-32', active: false },
          { month: 'Jul', height: 'h-20', active: false },
        ].map((bar, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className={`w-7 ${bar.height} ${bar.active ? 'bg-striped-purple' : 'rounded-full bg-purple-100/60'} transition-all`}></div>
            <span className={`text-xs font-medium ${bar.active ? 'rounded-full bg-purple-500 px-2 py-0.5 text-white' : 'text-gray-400'}`}>
              {bar.month}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
