import { useMemo, useState } from 'react'
import { ChevronDown, Search, X, Gift, ShieldCheck, BarChart2, SlidersHorizontal, Plus } from 'lucide-react'
import type { CalendarEvent, CalendarCell, SalaryEmployee } from './types'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function idr(n: number) {
  return `Rp${n.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`
}

/** Grid kalender bulan nyata (Senin-mulai), sel di luar bulan tetap terisi. */
function buildMonthGrid(year: number, month: number): { cells: CalendarCell[] } {
  const pad = (n: number) => String(n).padStart(2, '0')
  const daysInMonth = new Date(year, month, 0).getDate()
  const lead = (new Date(year, month - 1, 1).getDay() + 6) % 7
  const prevDays = new Date(year, month - 1, 0).getDate()
  const cells: CalendarCell[] = []
  for (let i = lead - 1; i >= 0; i--) cells.push({ day: prevDays - i, outside: true, weekend: false, dateISO: '' })
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = (lead + d - 1) % 7
    cells.push({ day: d, outside: false, weekend: dow >= 5, dateISO: `${year}-${pad(month)}-${pad(d)}` })
  }
  let tail = 1
  while (cells.length % 7 !== 0) cells.push({ day: tail++, outside: true, weekend: false, dateISO: '' })
  return { cells }
}

// ============================================================================
// SALARY OVERVIEW CARD — toolbar, ringkasan jam & kalender (kolom tengah)
// ============================================================================
export default function SalaryOverviewCard({
  employee,
  searchQuery,
  setSearchQuery,
  year,
  month,
  onMonthChange,
  monthOptions,
  events,
  presentDays,
  workHours,
  truancyDays,
  vacationDays,
  onActionToast,
}: {
  employee: SalaryEmployee
  searchQuery: string
  setSearchQuery: (v: string) => void
  year: number
  month: number
  onMonthChange: (ym: string) => void
  monthOptions: Array<{ value: string; label: string }>
  events: CalendarEvent[]
  presentDays: number
  workHours: number | null
  truancyDays: number
  vacationDays: number
  onActionToast: (msg: string) => void
}) {
  const [monthOpen, setMonthOpen] = useState(false)
  const { cells } = useMemo(() => buildMonthGrid(year, month), [year, month])

  // Proporsi bar Work day / Truancy / Vacation (minimum ala referensi)
  const totalDays = presentDays + truancyDays + vacationDays
  const workPct = totalDays > 0 ? Math.max(35, Math.round((presentDays / totalDays) * 100)) : 35
  const truancyPct = totalDays > 0 ? Math.max(16, Math.round((truancyDays / totalDays) * 100)) : 16
  const vacationPct = totalDays > 0 ? Math.max(20, 100 - workPct - truancyPct) : 20

  // Sel ulang tahun karyawan (tanggal & bulan lahir cocok)
  const birthdayDay = (() => {
    if (!employee.dateOfBirth) return null
    const d = new Date(employee.dateOfBirth)
    if (Number.isNaN(d.getTime()) || d.getMonth() + 1 !== month) return null
    return d.getDate()
  })()

  return (
    <section className="flex flex-col gap-5">
      {/* Toolbar: aksi bulat + pencarian + filter + tambah */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => onActionToast('Verifikasi kehadiran aktif')}
          className="w-10 h-10 rounded-full bg-white hover:bg-neutral-50 flex items-center justify-center text-[#1E1E1E] shadow-[0_2px_10px_rgba(0,0,0,0.03)] shrink-0 transition cursor-pointer"
          title="Verification"
        >
          <ShieldCheck className="w-4 h-4 stroke-[1.75]" />
        </button>

        <button
          onClick={() => onActionToast('Statistik jam kerja ditampilkan')}
          className="w-10 h-10 rounded-full bg-white hover:bg-neutral-50 flex items-center justify-center text-[#1E1E1E] shadow-[0_2px_10px_rgba(0,0,0,0.03)] shrink-0 transition cursor-pointer"
          title="Analytics"
        >
          <BarChart2 className="w-4 h-4 stroke-[1.75]" />
        </button>

        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8A8D93] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full h-10 pl-10 pr-8 rounded-full bg-white text-[13px] text-[#1E1E1E] placeholder-[#8A8D93] shadow-[0_2px_10px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-[#F5D248]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8D93] hover:text-[#1E1E1E] cursor-pointer"
              aria-label="Bersihkan pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => onActionToast('Filter jadwal kerja')}
          className="w-10 h-10 rounded-full bg-white hover:bg-neutral-50 flex items-center justify-center text-[#1E1E1E] shadow-[0_2px_10px_rgba(0,0,0,0.03)] shrink-0 transition cursor-pointer"
          title="Filter"
        >
          <SlidersHorizontal className="w-4 h-4 stroke-[1.75]" />
        </button>

        <button
          onClick={() => onActionToast('Tambah catatan jadwal baru')}
          className="w-10 h-10 rounded-full bg-white hover:bg-neutral-50 flex items-center justify-center text-[#1E1E1E] shadow-[0_2px_10px_rgba(0,0,0,0.03)] shrink-0 transition cursor-pointer"
          title="Add Entry"
        >
          <Plus className="w-4 h-4 stroke-[1.75]" />
        </button>
      </div>

      {/* Header total jam / gaji & dropdown bulan */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div className="text-[26px] sm:text-[28px] font-normal tracking-tight text-[#1E1E1E]">
          <span>{workHours !== null ? `${workHours.toFixed(2)} hrs` : `${presentDays} hari`}</span>
          <span className="mx-2 text-[#8A8D93] font-light">/</span>
          <span>{employee.netSalary !== null ? idr(employee.netSalary) : '—'}</span>
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => setMonthOpen((v) => !v)}
            className="flex items-center gap-2 bg-white hover:bg-neutral-50 px-4 py-2 rounded-full text-[13px] font-medium text-[#1E1E1E] shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition cursor-pointer"
          >
            <span>{monthOptions.find((o) => o.value === `${year}-${String(month).padStart(2, '0')}`)?.label ?? `${month}/${year}`}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#5A5D63]" />
          </button>
          {monthOpen && (
            <div className="absolute right-0 mt-1.5 w-40 bg-white rounded-2xl shadow-lg border border-black/5 py-1.5 z-30 max-h-72 overflow-y-auto">
              {monthOptions.map((m) => (
                <button
                  key={m.value}
                  onClick={() => { onMonthChange(m.value); setMonthOpen(false) }}
                  className={`w-full text-left px-4 py-1.5 text-[13px] hover:bg-[#FAF9F6] transition cursor-pointer ${
                    m.value === `${year}-${String(month).padStart(2, '0')}` ? 'font-semibold text-[#1E1E1E]' : 'text-[#6A6D73]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bar ringkasan horizontal (Work day, Truancy, Vacation) */}
      <div className="w-full flex items-end gap-1.5">
        <div style={{ width: `${workPct}%` }} className="transition-all duration-300">
          <div className="text-[11.5px] font-medium text-[#2A2A2A] mb-1.5 pl-1">Work day</div>
          <div className="h-[36px] rounded-[13px] bg-[#F5D248] flex items-center px-3.5 text-[12px] font-medium text-[#1E1E1E]">
            {presentDays} hari
          </div>
        </div>
        <div style={{ width: `${truancyPct}%` }} className="transition-all duration-300">
          <div className="text-[11.5px] font-medium text-[#2A2A2A] mb-1.5 pl-1">Truancy</div>
          <div className="h-[36px] rounded-[13px] bg-[#222222] flex items-center px-3.5 text-[12px] font-medium text-white">
            {truancyDays} hari
          </div>
        </div>
        <div style={{ width: `${vacationPct}%` }} className="transition-all duration-300">
          <div className="text-[11.5px] font-medium text-[#2A2A2A] mb-1.5 pl-1">Vacation</div>
          <div className="h-[36px] rounded-[13px] bg-[#C4C7CE] flex items-center px-3.5 text-[12px] font-medium text-[#1E1E1E]">
            {vacationDays} hari
          </div>
        </div>
      </div>

      {/* Kalender bulanan */}
      <div className="pt-1">
        <div className="grid grid-cols-7 gap-2 mb-2.5 text-center">
          {DAY_LABELS.map((day, idx) => (
            <div key={day} className={`text-[12px] font-medium ${idx >= 5 ? 'text-[#E56B4E]' : 'text-[#2A2A2A]'}`}>{day}</div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {Array.from({ length: cells.length / 7 }, (_, rowIdx) => {
            const rowCells = cells.slice(rowIdx * 7, rowIdx * 7 + 7)
            const rowEvents = events.filter((ev) => ev.row === rowIdx)
            return (
              <div key={rowIdx} className="relative grid grid-cols-7 gap-2">
                {rowCells.map((cell: CalendarCell, colIdx) => {
                  const isBirthday = !cell.outside && birthdayDay === cell.day
                  if (isBirthday) {
                    return (
                      <div
                        key={colIdx}
                        onClick={() => onActionToast(`Ulang tahun ${employee.name.split(' ')[0]} — ${cell.day} ${MONTH_SHORT[month - 1]}`)}
                        className="relative h-[64px] rounded-[14px] bg-[#F5D248] p-2 flex flex-col justify-between cursor-pointer shadow-[0_4px_12px_rgba(245,210,72,0.35)] hover:brightness-[1.02] transition"
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-[12px] font-semibold text-[#1E1E1E]">{cell.day}</span>
                          <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-xs">
                            <Gift className="w-3 h-3 text-[#1E1E1E]" />
                          </span>
                        </div>
                        <div className="text-[10.5px] leading-[1.15] font-medium text-[#1E1E1E]">Birthday<br />{employee.name.split(' ')[0]}</div>
                      </div>
                    )
                  }
                  return (
                    <div
                      key={colIdx}
                      className={`relative h-[64px] rounded-[14px] p-2 overflow-hidden transition ${
                        cell.outside && cell.weekend
                          ? 'bg-[#F5EED8] calendar-hatch-gold'
                          : cell.outside
                          ? 'bg-[#ECEEF2] calendar-hatch-gray'
                          : 'bg-[#ECEEF2]/95'
                      }`}
                    >
                      <span className="relative z-10 text-[12px] font-medium text-[#1E1E1E]">{cell.day}</span>
                      {!cell.outside && cell.weekend && (
                        <div className="absolute inset-x-0 bottom-0 h-[28px] calendar-hatch-gold opacity-85" />
                      )}
                    </div>
                  )
                })}

                {rowEvents.map((ev) => {
                  const leftPercent = (ev.startCol / 7) * 100
                  const widthPercent = (ev.spanCols / 7) * 100
                  const dotColor = ev.type === 'vacation' ? 'bg-[#B0B4BC]' : 'bg-[#1E1E1E]'
                  return (
                    <div
                      key={ev.id}
                      style={{ left: `calc(${leftPercent}% + 2px)`, width: `calc(${widthPercent}% - 4px)` }}
                      onClick={() => onActionToast(`${ev.label}: ${ev.dateRange}`)}
                      className="absolute bottom-1.5 z-20 h-[25px] bg-white rounded-full px-2.5 flex items-center justify-between gap-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] cursor-pointer hover:scale-[1.01] transition"
                    >
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                        <span className="text-[10.5px] font-semibold text-[#1E1E1E] whitespace-nowrap">{ev.label}</span>
                      </div>
                      <div className={`flex-1 h-2.5 rounded-full mx-0.5 pill-hatch-gray`} />
                      <span className="text-[10px] font-medium text-[#2A2A2A] whitespace-nowrap shrink-0">{ev.dateRange}</span>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
        {events.length === 0 && (
          <p className="mt-2 text-center text-[11px] text-[#8A8D93]">Belum ada jadwal cuti/sakit tercatat bulan ini.</p>
        )}
      </div>
    </section>
  )
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
