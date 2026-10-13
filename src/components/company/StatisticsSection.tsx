import { useState } from 'react'
import { ArrowUp, X } from 'lucide-react'

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"

export interface StatisticsData {
  totalTasks?: number | string
  completedProjects?: number
  inProgressProjects?: number
}

interface Props {
  stats?: StatisticsData | null
  /** Label di bawah angka besar, mis. "proyek 7 hari terakhir" */
  summaryLabel?: string
  statsTab?: 'Weekly' | 'Monthly'
  onStatsTabChange?: (tab: 'Weekly' | 'Monthly') => void
  onUpgradeClick?: () => void
}

export default function StatisticsSection({
  stats,
  summaryLabel = 'proyek terpantau',
  statsTab = 'Weekly',
  onStatsTabChange,
  onUpgradeClick,
}: Props) {
  const [brainstormActive, setBrainstormActive] = useState(true)
  const total = stats?.totalTasks ?? 0
  const completed = stats?.completedProjects ?? 0
  const inProgress = stats?.inProgressProjects ?? 0

  return (
    <div className="col-span-8 grid grid-cols-12 gap-4" style={{ fontFamily: SF }}>
      {/* 1. KIRI: Statistics */}
      <div className="col-span-7 bg-white rounded-3xl p-6 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 text-xl tracking-tight">Statistics</h3>
          <div className="bg-slate-100/80 p-1 rounded-full flex gap-1 text-xs font-semibold">
            {(['Weekly', 'Monthly'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => onStatsTabChange?.(tab)}
                className={`px-3.5 py-1 rounded-full transition-colors cursor-pointer ${
                  statsTab === tab ? 'bg-[#1c1d22] text-white shadow-2xs' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-baseline gap-2.5 my-2">
          <span className="text-5xl font-extrabold text-slate-900 tracking-tight">{total}</span>
          <span className="text-xs font-semibold text-slate-400">{summaryLabel}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {/* Project complete */}
          <div className="bg-[#f8f9fb] rounded-2xl p-4 flex flex-col items-center text-center justify-center border border-slate-100/80">
            <div className="w-10 h-10 mb-3 relative flex items-center justify-center text-slate-800">
              <div className="w-6 h-6 border-2 border-slate-800 rounded-sm bg-pink-100/60 absolute top-1 left-1" />
              <div className="w-6 h-6 border-2 border-slate-800 rounded-sm bg-white/80 absolute bottom-1 right-1" />
            </div>
            <h4 className="text-2xl font-bold text-slate-900 leading-none">{completed}</h4>
            <p className="text-[11px] text-slate-400 font-medium mt-1.5">Project complete</p>
          </div>

          {/* Project in progress */}
          <div className="bg-[#f8f9fb] rounded-2xl p-4 flex flex-col items-center text-center justify-center border border-slate-100/80">
            <div className="w-10 h-10 mb-3 relative flex items-center justify-center text-slate-800">
              <div className="w-6 h-6 border-2 border-slate-800 rounded-full bg-purple-200/60 absolute top-1 left-1" />
              <div className="w-6 h-6 border-2 border-slate-800 rounded-full bg-white/80 absolute bottom-1 right-1" />
            </div>
            <h4 className="text-2xl font-bold text-slate-900 leading-none">{inProgress}</h4>
            <p className="text-[11px] text-slate-400 font-medium mt-1.5">Project in progress</p>
          </div>
        </div>
      </div>

      {/* 2. KANAN: capsule + promo */}
      <div className="col-span-5 flex flex-col justify-between gap-4">
        {brainstormActive ? (
          <div className="bg-[#1c1d22] text-white rounded-3xl p-4 shadow-md flex items-center justify-center h-[100px] relative overflow-hidden">
            <div className="bg-white text-slate-900 rounded-full px-4 py-2.5 shadow-lg flex items-center justify-between w-full max-w-[280px]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {inProgress}
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight text-slate-900">Breakthrough Brainstorm</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">~ 2:45 pm</p>
                </div>
              </div>
              <button
                onClick={() => setBrainstormActive(false)}
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-all cursor-pointer shrink-0 ml-1"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#1c1d22] text-slate-400 rounded-3xl p-4 flex items-center justify-center text-xs h-[100px] italic">
            Session dismissed
          </div>
        )}

        {/* Promo */}
        <div className="bg-white rounded-3xl p-5 shadow-xs flex items-center justify-between gap-3 h-[200px] overflow-hidden relative">
          <div className="w-[110px] h-[170px] rounded-2xl bg-gradient-to-b from-purple-200 via-pink-100 to-indigo-200 overflow-hidden shrink-0 flex items-center justify-center relative shadow-inner">
            <div className="w-full h-full opacity-80 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-400 via-pink-300 to-indigo-300 transform rotate-45 scale-125" />
          </div>

          <div className="flex-1 flex flex-col justify-between h-full py-1">
            <div>
              <h3 className="text-xl font-bold text-slate-900 leading-snug tracking-tight">Unleash Your Potential</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Indulge in the ultimate subscription</p>
            </div>

            <button
              onClick={onUpgradeClick}
              className="bg-[#d8cbf9] hover:bg-[#c9b7f7] text-slate-900 text-xs font-bold px-4 py-2.5 rounded-full transition-all inline-flex items-center gap-2 shadow-2xs cursor-pointer w-fit mt-3"
            >
              <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center">
                <ArrowUp size={10} />
              </span>
              <span>Upgrade plan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
