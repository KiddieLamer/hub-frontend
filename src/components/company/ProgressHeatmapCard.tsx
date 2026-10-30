import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"

export type ProgressModuleKey = 'projects' | 'tasks' | 'pr' | 'po' | 'gr' | 'pos'

export interface ProgressEvent {
  id: string
  module: ProgressModuleKey
  /** ISO date kejadian */
  date: string
  label: string
}

type RangeKey = 'month' | 'q1' | 'q2' | 'q3' | 'q4' | 'year'

const DAY_MS = 86_400_000
const MAX_WEEKS = 60

const WEEKDAYS_HEADER = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const WEEKDAYS_LONG = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const MONTHS_FULL_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

// Ramp intensitas ungu mengikuti aksen dashboard (kosong → #1c1d22).
const LEVEL_BG = [
  'bg-slate-100',
  'bg-[#e6ddf9]',
  'bg-[#c9b3f2]',
  'bg-[#9370db]',
  'bg-[#1c1d22]',
]
// Warna teks angka hari (view kalender) per level — level gelap butuh teks putih.
const LEVEL_TEXT = [
  'text-slate-500',
  'text-slate-600',
  'text-slate-700',
  'text-white',
  'text-white',
]

function levelOf(n: number): number {
  if (n <= 0) return 0
  if (n === 1) return 1
  if (n <= 3) return 2
  if (n <= 6) return 3
  return 4
}

function startOfWeekMon(d: Date): Date {
  const x = new Date(d)
  const diff = (x.getDay() + 6) % 7 // Senin = awal minggu
  x.setDate(x.getDate() - diff)
  x.setHours(0, 0, 0, 0)
  return x
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function relTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const m = Math.floor(ms / 60000)
  if (m < 1) return 'baru saja'
  if (m < 60) return `${m} mnt lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d} hari lalu`
  return `${Math.floor(d / 7)} mgg lalu`
}

function rangeFor(key: RangeKey, now: Date): { start: Date; end: Date; label: string } {
  const y = now.getFullYear()
  if (key === 'month') {
    return {
      start: new Date(y, now.getMonth(), 1),
      end: new Date(y, now.getMonth() + 1, 0),
      label: `${MONTHS_FULL_ID[now.getMonth()]} ${y}`,
    }
  }
  if (key === 'year') {
    return { start: new Date(y, 0, 1), end: new Date(y, 11, 31), label: `Tahun ${y}` }
  }
  const q = Number(key[1])
  return {
    start: new Date(y, (q - 1) * 3, 1),
    end: new Date(y, (q - 1) * 3 + 3, 0),
    label: `Q${q} ${y}`,
  }
}

interface Props {
  events?: ProgressEvent[]
  isLoading?: boolean
}

export default function ProgressHeatmapCard({ events = [], isLoading = false }: Props) {
  const [range, setRange] = useState<RangeKey>('month')
  const now = new Date()
  const year = now.getFullYear()

  const { weeks, byDay, total, recent } = useMemo(() => {
    const { start, end } = rangeFor(range, now)

    const first = startOfWeekMon(start)
    const wk: Date[] = []
    for (let w = first; w.getTime() <= end.getTime() && wk.length < MAX_WEEKS; w = new Date(w.getTime() + 7 * DAY_MS)) {
      wk.push(w)
    }

    const inRange: ProgressEvent[] = []
    const map = new Map<string, ProgressEvent[]>()
    for (const ev of events) {
      const d = new Date(ev.date)
      if (d.getTime() < start.getTime() || d.getTime() > end.getTime() + DAY_MS - 1) continue
      const k = dayKey(d)
      const arr = map.get(k)
      if (arr) arr.push(ev)
      else map.set(k, [ev])
      inRange.push(ev)
    }

    const recentSorted = [...inRange]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)

    return { weeks: wk, byDay: map, total: inRange.length, recent: recentSorted }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, range])

  const { label: rangeLabel, start: rangeStart, end: rangeEnd } = rangeFor(range, now)
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const isMonthView = range === 'month'

  const cellTitle = (d: Date, evs: ProgressEvent[]): string => {
    const head = `${WEEKDAYS_LONG[(d.getDay() + 6) % 7]}, ${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`
    if (!evs || evs.length === 0) return `${head}\nTanpa aktivitas`
    const shown = evs.slice(0, 5).map((e) => e.label)
    const more = evs.length > 5 ? [`+${evs.length - 5} lainnya`] : []
    return [head, `${evs.length} aktivitas`, ...shown, ...more].join('\n')
  }

  // Label bulan gaya GitHub: tampil saat bulan berganti. Bulan milik kolom
  // ditentukan lewat Kamis minggu itu (konvensi ISO) — minggu pinggiran yang
  // mayoritasnya satu bulan tidak salah label.
  const monthLabels = weeks.map((w, i) => {
    const thursday = new Date(w.getTime() + 3 * DAY_MS)
    const prev = i === 0 ? null : new Date(weeks[i - 1].getTime() + 3 * DAY_MS)
    if (!prev || thursday.getMonth() !== prev.getMonth()) return MONTHS_ID[thursday.getMonth()]
    return ''
  })

  // Rentang panjang (tahun) → sel lebih kecil biar muat dalam satu baris.
  const compact = weeks.length > 20
  const CELL = compact ? 'w-2.5 h-2.5 rounded-[2px]' : 'w-3 h-3 rounded-[3px]'
  const GAP = compact ? 'gap-[2px]' : 'gap-[3px]'
  const COLS = `18px repeat(${weeks.length}, ${compact ? '10px' : '12px'})`

  return (
    <div className="col-span-12 @container bg-white rounded-3xl p-5 shadow-xs flex flex-col" style={{ fontFamily: SF }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-bold text-slate-900 text-base tracking-tight shrink-0">Progress Tracker</h3>
          <span className="text-[11px] text-slate-400 font-medium truncate hidden @2xl:inline">
            aktivitas modul · {rangeLabel}
          </span>
        </div>

        {/* Dropdown rentang */}
        <div className="relative shrink-0">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as RangeKey)}
            aria-label="Pilih rentang waktu"
            className="appearance-none text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors rounded-full pl-2.5 pr-6 py-1 outline-none cursor-pointer"
          >
            <option value="month">Bulan ini</option>
            <option value="q1">Q1 {year}</option>
            <option value="q2">Q2 {year}</option>
            <option value="q3">Q3 {year}</option>
            <option value="q4">Q4 {year}</option>
            <option value="year">Tahun {year}</option>
          </select>
          <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex items-start justify-between gap-x-8 gap-y-4 flex-wrap">
        {/* Kiri: heatmap + legend */}
        <div className={`flex flex-col gap-2.5 ${isMonthView ? 'w-[336px] max-w-full' : ''}`}>
          {isMonthView ? (
            /* ===== VIEW KALENDER (bulan) — 7 kolom hari, angka tanggal ===== */
            <div className="flex flex-col gap-1.5 w-full max-w-[420px]">
              <div className="grid grid-cols-7 gap-1.5">
                {WEEKDAYS_HEADER.map((wd) => (
                  <span key={wd} className="text-[10px] font-medium text-slate-400 text-center">
                    {wd}
                  </span>
                ))}
              </div>
              {weeks.map((w, wi) => (
                <div key={`w-${wi}`} className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: 7 }, (_, row) => {
                    const d = new Date(w.getTime() + row * DAY_MS)
                    const inMonth = d.getMonth() === rangeStart.getMonth() && d.getFullYear() === rangeStart.getFullYear()
                    if (!inMonth) return <span key={`d-${row}`} className="h-9" />
                    if (d.getTime() > today.getTime()) {
                      return (
                        <span key={`d-${row}`} className="h-9 rounded-lg bg-slate-50 flex items-center justify-center text-[11px] font-medium text-slate-300">
                          {d.getDate()}
                        </span>
                      )
                    }
                    if (isLoading) {
                      return <span key={`d-${row}`} className="h-9 rounded-lg bg-slate-100 animate-pulse" />
                    }
                    const evs = byDay.get(dayKey(d)) || []
                    const lvl = levelOf(evs.length)
                    const isToday = d.getTime() === today.getTime()
                    return (
                      <span
                        key={`d-${row}`}
                        title={cellTitle(d, evs)}
                        className={`h-9 rounded-lg flex items-center justify-center text-[11px] font-medium ${LEVEL_BG[lvl]} ${LEVEL_TEXT[lvl]} ${
                          isToday ? 'font-bold ring-2 ring-[#1c1d22]/15' : ''
                        }`}
                      >
                        {d.getDate()}
                      </span>
                    )
                  })}
                </div>
              ))}
            </div>
          ) : (
            /* ===== VIEW KOLOM MINGGUAN (kuartal/tahun) — gaya GitHub ===== */
            <div className={`flex flex-col ${GAP}`}>
              {/* Label bulan */}
              <div className={`grid ${GAP}`} style={{ gridTemplateColumns: COLS }}>
                <span />
                {monthLabels.map((m, i) => (
                  <span key={`m-${i}`} className="text-[9px] leading-none text-slate-400 font-medium">
                    {m}
                  </span>
                ))}
              </div>

              {/* Baris hari */}
              {WEEKDAYS_HEADER.map((wd, row) => (
                <div key={`row-${row}`} className={`grid ${GAP} items-center`} style={{ gridTemplateColumns: COLS }}>
                  <span className="text-[9px] leading-none text-slate-400 font-medium">{row % 2 === 0 ? wd : ''}</span>
                  {weeks.map((w, col) => {
                    const d = new Date(w.getTime() + row * DAY_MS)
                    const inRange =
                      d.getTime() >= rangeStart.getTime() &&
                      d.getTime() <= rangeEnd.getTime() &&
                      d.getTime() <= today.getTime()
                    if (!inRange) {
                      // Hari di luar rentang/masa depan: ghost cell — grid tetap
                      // utuh, tanpa lubang berundak di tepi.
                      return <span key={`c-${col}`} className={`${CELL} bg-slate-50`} />
                    }
                    if (isLoading) {
                      return <span key={`c-${col}`} className={`${CELL} bg-slate-100 animate-pulse`} />
                    }
                    const evs = byDay.get(dayKey(d)) || []
                    return (
                      <span
                        key={`c-${col}`}
                        title={cellTitle(d, evs)}
                        className={`${CELL} ${LEVEL_BG[levelOf(evs.length)]}`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          )}

          {/* Legend + total */}
          <div className="flex items-center gap-[3px]">
            <span className="text-[9px] font-medium text-slate-400 mr-1">Sedikit</span>
            {LEVEL_BG.map((bg, i) => (
              <span key={i} className={`w-3 h-3 rounded-[3px] ${bg}`} />
            ))}
            <span className="text-[9px] font-medium text-slate-400 ml-1">Banyak</span>
            <span className="text-[10px] font-semibold text-slate-500 ml-2 tabular-nums">
              {isLoading ? '…' : `${total} aktivitas`}
            </span>
          </div>
        </div>

        {/* Kanan: aktivitas terbaru — mengisi lebar sisa card */}
        <div className="flex-1 min-w-[220px] flex flex-col gap-2">
          <span className="text-[11px] font-medium text-slate-400">Terbaru</span>
          {isLoading ? (
            <>
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-4 rounded-md bg-slate-100 animate-pulse w-3/4" />
              ))}
            </>
          ) : recent.length === 0 ? (
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Belum ada aktivitas pada rentang ini — progres dari Projects, Tasks, Procurement, dan POS akan muncul di sini.
            </p>
          ) : (
            recent.map((ev) => (
              <div key={ev.id} className="flex items-center gap-2 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9370db] shrink-0" />
                <span className="text-[11px] font-medium text-slate-600 truncate">{ev.label}</span>
                <span className="text-[10px] text-slate-400 shrink-0 ml-auto pl-3 whitespace-nowrap">{relTime(ev.date)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
