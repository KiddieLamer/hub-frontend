import { useState } from 'react'
import { SlidersHorizontal, ArrowUpRight, MoreHorizontal, ChevronDown } from 'lucide-react'

export function QuickTransferCard() {
  const [amount, setAmount] = useState('116.0')

  return (
    <div className="flex flex-col justify-between rounded-3xl border border-gray-100/80 bg-white p-6 shadow-xs">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Quick Transfer</h2>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">Contacts</span>
            <button className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100">
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-4 gap-3">
          <div className="col-span-2 flex flex-col justify-between rounded-2xl bg-[#d9f99d] p-3.5 shadow-xs">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-gray-700">My Wallet</span>
              <MoreHorizontal className="h-4 w-4 cursor-pointer text-gray-700" />
            </div>
            <div className="mt-3">
              <p className="text-xl font-extrabold text-gray-900">$143.245</p>
              <p className="text-[10px] font-medium text-gray-600">Low Fee <span className="font-semibold">~ $ 10.721</span></p>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-[#e9d5ff] p-3 shadow-xs">
            <span className="text-[11px] font-bold tracking-wider text-gray-800">VISA</span>
            <p className="text-sm font-bold text-gray-900">$41.705</p>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-[#f3e8ff] p-3 shadow-xs">
            <div className="relative h-3 w-6 rounded-full bg-gray-400">
              <div className="absolute left-0 h-3 w-3 rounded-full bg-white shadow-xs"></div>
            </div>
            <p className="text-sm font-bold text-gray-900">$21.321</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="mb-2 text-center text-xs font-semibold text-gray-400">Send To</p>
          <div className="flex items-center justify-between rounded-2xl bg-[#e8fc82] p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80" alt="Alex Galler" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <h4 className="text-sm font-bold text-gray-900">Alex Galler</h4>
                <span className="rounded-full bg-purple-200/60 px-2 py-0.5 text-[10px] font-semibold text-purple-800">Added</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black tracking-wider text-gray-900">VISA</p>
              <p className="font-mono text-xs font-medium text-gray-700">6274 1212 0505 0388</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-3">
        <div className="flex flex-1 items-center justify-between rounded-2xl border border-purple-100 bg-purple-50/60 p-2.5">
          <input
            type="text"
            value={`$${amount}`}
            onChange={(e) => setAmount(e.target.value.replace('$', ''))}
            className="w-28 bg-transparent text-lg font-bold text-gray-900 outline-none"
          />
          <button className="flex items-center gap-1 rounded-xl bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 shadow-2xs">
            USD <ChevronDown className="h-3 w-3" />
          </button>
        </div>
        <button className="rounded-2xl bg-[#c4b5fd] px-6 py-3.5 text-sm font-bold text-gray-900 shadow-xs transition active:scale-95 hover:bg-[#b49aff]">
          Transfer
        </button>
      </div>
    </div>
  )
}
