import { useEffect, useMemo, useState } from 'react'
import { MoreHorizontal, Pin, Pencil, Plus, Trash2, Check, X } from 'lucide-react'
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
  /** Dipanggil saat user menyimpan daftar insight (edit / tambah / hapus). */
  onSaveInsights?: (insights: LeadScoreInsight[]) => void | Promise<void>
  className?: string
}

interface InsightDraft {
  id: string
  text: string
  subtext: string
}

const defaultInsights: LeadScoreInsight[] = [
  { id: '1', text: 'Purchase timeframe is next quarter' },
  { id: '2', text: 'Purchase process is individual' },
  { id: '3', text: 'Lead is relatively new' },
  { id: '4', text: 'Estimated budget', subtext: '~ $50,000.00' },
]

function toDraft(insights: LeadScoreInsight[]): InsightDraft[] {
  return insights.map((i) => ({ id: i.id, text: i.text, subtext: i.subtext || '' }))
}

export function LeadScoreCard({
  score = 90,
  maxScore = 100,
  grade = 'Grade A',
  status = 'Steady',
  statusDirection = 'steady',
  insights = defaultInsights,
  onMoreClick,
  onPinClick,
  onSaveInsights,
  className = '',
}: LeadScoreCardProps) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [drafts, setDrafts] = useState<InsightDraft[]>(() => toDraft(insights))

  // Sinkronkan draft saat server mengirim insights terbaru (dan tidak sedang edit)
  useEffect(() => {
    if (!editing) setDrafts(toDraft(insights))
  }, [insights, editing])

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

  const canEdit = typeof onSaveInsights === 'function'

  const handleStartEdit = () => {
    if (!canEdit) return
    setDrafts(toDraft(insights))
    setEditing(true)
  }

  const handleCancelEdit = () => {
    setDrafts(toDraft(insights))
    setEditing(false)
  }

  const handleAddDraft = () => {
    setDrafts((prev) => [
      ...prev,
      { id: `new-${Date.now()}-${prev.length}`, text: '', subtext: '' },
    ])
  }

  const handleRemoveDraft = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id))
  }

  const handleChangeDraft = (id: string, field: 'text' | 'subtext', value: string) => {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)))
  }

  const handleSave = async () => {
    if (!onSaveInsights) return
    const cleaned: LeadScoreInsight[] = drafts
      .filter((d) => d.text.trim().length > 0)
      .map((d, idx) => ({
        id: d.id,
        text: d.text.trim(),
        subtext: d.subtext.trim() || undefined,
        // sortOrder diturunkan dari urutan array
        ...(idx >= 0 ? {} : {}),
      }))
    setSaving(true)
    try {
      await onSaveInsights(cleaned)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const renderedInsights = editing ? [] : insights

  return (
    <div
      className={`flex flex-col gap-4 rounded-[28px] border border-white/80 bg-white/80 p-5 font-sans shadow-xs backdrop-blur-md ${className}`}
    >
      {/* Header Card */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight text-slate-900">Lead Score</h3>
        <div className="flex items-center gap-1.5">
          {canEdit && !editing && (
            <button
              onClick={handleStartEdit}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/70 bg-white/60 text-slate-600 shadow-2xs transition-colors hover:bg-white"
              aria-label="Edit insights"
              title="Edit insights"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {editing && (
            <>
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/70 bg-white/60 text-slate-600 shadow-2xs transition-colors hover:bg-white disabled:opacity-50"
                aria-label="Cancel edit"
                title="Batal"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-teal-700 shadow-2xs transition-colors hover:bg-teal-100 disabled:opacity-50"
                aria-label="Save insights"
                title="Simpan"
              >
                <Check className="h-4 w-4" />
              </button>
            </>
          )}
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

      {/* List Insights (Bottom List) / Editor */}
      {!editing && (
        <div className="space-y-3 pt-1">
          {renderedInsights.length === 0 && (
            <p className="text-xs italic text-slate-400">Belum ada insight.</p>
          )}
          {renderedInsights.map((item) => (
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
      )}

      {editing && (
        <div className="space-y-2.5 pt-1">
          {drafts.map((d, idx) => (
            <div key={d.id} className="flex items-start gap-2">
              <div className="mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200/70 bg-white/60 text-[10px] font-bold text-slate-500">
                {idx + 1}
              </div>
              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  value={d.text}
                  onChange={(e) => handleChangeDraft(d.id, 'text', e.target.value)}
                  placeholder="Insight (wajib)"
                  className="w-full rounded-lg border border-slate-200 bg-slate-100/80 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
                />
                <input
                  type="text"
                  value={d.subtext}
                  onChange={(e) => handleChangeDraft(d.id, 'subtext', e.target.value)}
                  placeholder="Subtext (opsional)"
                  className="w-full rounded-lg border border-slate-200 bg-slate-100/80 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveDraft(d.id)}
                className="mt-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-500 transition-colors hover:bg-red-100"
                aria-label="Hapus insight"
                title="Hapus"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddDraft}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white/50 px-3 py-2 text-[11px] font-semibold text-slate-500 transition-colors hover:bg-white"
          >
            <Plus className="h-3.5 w-3.5" /> Tambah insight
          </button>
        </div>
      )}
    </div>
  )
}
