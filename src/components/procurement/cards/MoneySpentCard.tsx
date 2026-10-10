import { Calendar, ArrowUpRight } from 'lucide-react'
import { MoneySpentSankey } from './MoneySpentSankey'

export function MoneySpentCard() {
  return (
    <div className="flex min-h-[380px] flex-col justify-between rounded-3xl border border-gray-100/80 bg-white p-6 shadow-xs">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Money Spent</h2>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#f1ebff] px-3 py-1 text-xs font-medium text-[#7c3aed]">Yearly</span>
            <button className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100">
              <Calendar className="h-4 w-4" />
            </button>
            <button className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100">
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-2">
          <div>
            <p className="mb-0.5 text-xs text-gray-400">Total amount</p>
            <p className="text-lg font-bold text-gray-900">$456.245</p>
          </div>
          <div>
            <p className="mb-0.5 text-xs text-gray-400">Monthly</p>
            <p className="text-lg font-bold text-gray-900">$36.962</p>
          </div>
          <div>
            <p className="mb-0.5 text-xs text-gray-400">Daily</p>
            <p className="text-lg font-bold text-gray-900">$3.382</p>
          </div>
        </div>
      </div>

      <MoneySpentSankey />
    </div>
  )
}
