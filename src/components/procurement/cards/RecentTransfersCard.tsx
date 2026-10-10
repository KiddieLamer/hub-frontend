import { Paperclip } from 'lucide-react'

const AVATARS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
]

const DAILY_BARS = [
  { day: 'Mon', send: 'h-10', recv: 'h-6' },
  { day: 'Tue', send: 'h-4', recv: 'h-12' },
  { day: 'Wed', send: 'h-8', recv: 'h-8' },
  { day: 'Thu', send: 'h-7', recv: 'h-14' },
  { day: 'Fri', send: 'h-6', recv: 'h-10' },
  { day: 'Sat', send: 'h-12', recv: 'h-6' },
  { day: 'Sun', send: 'h-10', recv: 'h-8' },
]

export function RecentTransfersCard() {
  return (
    <div className="flex min-h-[380px] flex-col justify-between rounded-3xl border border-gray-100/80 bg-white p-6 shadow-xs">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Recent Transfers</h2>
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">Weekly</span>
            <button className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100">
              <Paperclip className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2 overflow-x-auto py-1">
          <img src={AVATARS[0]} className="h-9 w-9 rounded-full object-cover ring-2 ring-purple-100" alt="u1" />
          <img src={AVATARS[1]} className="h-9 w-9 rounded-full object-cover ring-2 ring-purple-100" alt="u2" />
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-600">L</div>
          <img src={AVATARS[2]} className="h-9 w-9 rounded-full object-cover ring-2 ring-purple-100" alt="u3" />
          <img src={AVATARS[3]} className="h-9 w-9 rounded-full object-cover ring-2 ring-purple-100" alt="u4" />
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-600">M</div>
          <img src={AVATARS[4]} className="h-9 w-9 rounded-full object-cover ring-2 ring-purple-100" alt="u5" />
        </div>

        <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-4">
          <div>
            <p className="mb-0.5 text-[11px] text-gray-400">Send</p>
            <p className="text-base font-bold text-gray-900">$91.681</p>
          </div>
          <div>
            <p className="mb-0.5 text-[11px] text-gray-400">Receive</p>
            <p className="text-base font-bold text-gray-900">$24.186</p>
          </div>
          <div>
            <p className="mb-0.5 text-[11px] text-gray-400">Overall Received</p>
            <p className="text-base font-bold text-gray-900">$115.867</p>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Daily Transaction</h3>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-gray-600">
              <span className="h-2 w-2 rounded-full bg-lime-300"></span> Send
            </span>
            <span className="flex items-center gap-1 text-gray-600">
              <span className="h-2 w-2 rounded-full bg-purple-400"></span> Receive
            </span>
          </div>
        </div>

        <div className="relative flex h-28 items-end justify-between px-1 pt-4">
          <div className="absolute left-[48%] top-0 z-20 flex -translate-x-1/2 flex-col items-center rounded-md bg-gray-900 px-2 py-1 text-[10px] font-bold text-white shadow-md">
            <span>$162.80</span>
            <div className="mb-1 mt-0.5 h-1.5 w-1.5 rotate-45 bg-gray-900"></div>
          </div>

          {DAILY_BARS.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5">
              <div className="flex flex-col items-center justify-end gap-1">
                <div className={`w-5 ${item.send} rounded-full bg-[#d9f99d]`}></div>
                <div className={`w-5 ${item.recv} rounded-full bg-[#c4b5fd]`}></div>
              </div>
              <span className="text-[10px] font-medium text-gray-400">{item.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
