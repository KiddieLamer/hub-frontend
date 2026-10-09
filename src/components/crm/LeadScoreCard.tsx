import { useMemo } from 'react'
import { MoreHorizontal, Pin } from 'lucide-react'
import type { LeadScoreInsight } from './types'

export interface LeadScoreCardProps {
  score?: number
  maxScore?: number
  grade?: string
  status?: string
  statusDirection?: 'up' | 'down' | 'steady'
  insights?: LeadScoreInsight[]
  onMoreClick?: () => void
  onPinClick?: () => void
  className?: string
}

const defaultInsights: LeadScoreInsight[] = [
  { id: '1', text: 'Purchase timeframe is next quarter' },
  { id: '2', text: 'Purchase process is individual' },
  { id: '3', text: 'Lead is relatively new' },
  { id: '4', text: 'Estimated budget', subtext: '~ $50,000.00' },
]

export function LeadScoreCard({
  score = 90,
  maxScore = 100,
  grade = 'Grade A',
  status = 'Steady',
  statusDirection = 'steady',
  insights = defaultInsights,
  onMoreClick,
  onPinClick,
  className = '',
}: LeadScoreCardProps) {
  // --- Perhitungan Matematika Garis-Garis Dashed Ring (Stadium Shape) ---
  const { ticks, viewBoxWidth, viewBoxHeight } = useMemo(() => {
    const width = 290
    const height = 130
    const cx = width / 2 // 145
    const cy = height / 2 // 65

    const R = 44 // Radius lengkungan kiri & kanan
    const L = 108 // Panjang garis lurus atas & bawah
    const numTicks = 78 // Jumlah total strip garis
    const tickLength = 9.5 // Panjang strip garis

    // Total keliling bentuk stadium
    const P = 2 * L + 2 * Math.PI * R

    const tickList = Array.from({ length: numTicks }).map((_, i) => {
      const d = (i / numTicks) * P

      let x = 0
      let y = 0
      let angle = 0 // Sudut tegak lurus garis tick

      if (d <= L) {
        // 1. Garis lurus atas (bergerak dari kanan ke kiri)
        const t = d / L
        x = cx + L / 2 - t * L
        y = cy - R
        angle = -Math.PI / 2
      } else if (d <= L + Math.PI * R) {
        // 2. Lengkungan busur kiri (searah jarum jam: -90 deg ke +90 deg)
        const arcD = d - L
        const phi = -Math.PI / 2 - arcD / R
        const leftCx = cx - L / 2
        x = leftCx + R * Math.cos(phi)
        y = cy + R * Math.sin(phi)
        angle = phi
      } else if (d <= 2 * L + Math.PI * R) {
        // 3. Garis lurus bawah (bergerak dari kiri ke kanan)
        const t = (d - L - Math.PI * R) / L
        x = cx - L / 2 + t * L
        y = cy + R
        angle = Math.PI / 2
      } else {
        // 4. Lengkungan busur kanan (searah jarum jam: +90 deg ke -90 deg)
        const arcD = d - (2 * L + Math.PI * R)
        const phi = Math.PI / 2 - arcD / R
        const rightCx = cx + L / 2
        x = rightCx + R * Math.cos(phi)
        y = cy + R * Math.sin(phi)
        angle = phi
      }

      // Hitung koordinat ujung dalam dan luar garis
      const halfLen = tickLength / 2
      const x1 = x - halfLen * Math.cos(angle)
      const y1 = y - halfLen * Math.sin(angle)
      const x2 = x + halfLen * Math.cos(angle)
      const y2 = y + halfLen * Math.sin(angle)

      // Cek apakah tick ini aktif sesuai persentase score
      const tickProgress = (i / numTicks) * 100
      const isActive = tickProgress <= (score / maxScore) * 100

      return { id: i, x1, y1, x2, y2, isActive }
    })

    return { ticks: tickList, viewBoxWidth: width, viewBoxHeight: height }
  }, [score, maxScore])

  // Simbol Panah Status
  const arrowSymbol = useMemo(() => {
    if (statusDirection === 'up') return '↑'
    if (statusDirection === 'down') return '↓'
    return '→'
  }, [statusDirection])

  return (
    <div
      className={`flex flex-col gap-4 rounded-[28px] border border-white/80 bg-white/80 p-5 font-sans shadow-xs backdrop-blur-md ${className}`}
    >
      {/* Header Card */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight text-slate-900">Lead Score</h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onMoreClick}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/70 bg-white/60 text-slate-600 shadow-2xs transition-colors hover:bg-white"
            aria-label="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          <button
            onClick={onPinClick}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/70 bg-white/60 text-slate-600 shadow-2xs transition-colors hover:bg-white"
            aria-label="Pin card"
          >
            <Pin className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Dynamic Stadium Dashed Gauge Ring */}
      <div className="relative my-1 flex items-center justify-center">
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="h-auto w-full max-w-[320px]"
        >
          {ticks.map((t) => (
            <line
              key={t.id}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.isActive ? '#0fa396' : '#E2E8F0'}
              strokeWidth={2.6}
              strokeLinecap="round"
            />
          ))}
        </svg>

        {/* Center Content Inside Stadium Ring */}
        <div className="absolute inset-0 flex items-center justify-center gap-3.5 px-6">
          {/* Big Score Text */}
          <span className="text-5xl font-black leading-none tracking-tight text-slate-900 md:text-6xl">
            {score}
          </span>

          {/* Grade & Status Badge */}
          <div className="flex flex-col items-start gap-1">
            <span className="text-sm font-bold tracking-wide text-slate-800">
              {grade}
            </span>
            <div className="flex items-center gap-1 rounded-full border border-[#D0EE7C] bg-[#E2F896] px-2.5 py-0.5 text-xs font-bold text-slate-900 shadow-2xs">
              <span className="text-[11px]">{arrowSymbol}</span>
              <span>{status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* List Insights (Bottom List) */}
      <div className="space-y-3 pt-1">
        {insights.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            {/* Custom Teal Triangle Badge with Checkmark */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200/70 bg-white/60 shadow-2xs">
              <div className="relative flex h-5 w-5 items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-[#0fa396]">
                  <path d="M12 3L22 20H2L12 3Z" />
                </svg>
                <span className="absolute left-[7px] top-[8.5px] text-[8px] font-black leading-none text-white">
                  ✓
                </span>
              </div>
            </div>

            {/* Insight Text */}
            <div className="text-xs">
              <p className="font-semibold leading-snug text-slate-800">{item.text}</p>
              {item.subtext && (
                <p className="font-semibold leading-snug text-slate-800">{item.subtext}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
