import { useEffect, useMemo, useState } from 'react'
import { Bell } from 'lucide-react'
import { membersApi, payrollApi, attendancesApi, leavesApi, overtimeApi, notificationsApi } from '../../../lib/endpoints'
import EmployeeListCard from './EmployeeListCard'
import SalaryOverviewCard from './SalaryOverviewCard'
import ProfileDetailCard from './ProfileDetailCard'
import type { CalendarEvent, SalaryEmployee } from './types'

const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const pad = (n: number) => String(n).padStart(2, '0')

function hoursBetween(clockIn?: string | null, clockOut?: string | null): number | null {
  if (!clockIn || !clockOut) return null
  const a = new Date(clockIn.includes('T') ? clockIn : clockIn.replace(' ', 'T'))
  const b = new Date(clockOut.includes('T') ? clockOut : clockOut.replace(' ', 'T'))
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null
  const h = (b.getTime() - a.getTime()) / 3600000
  return h > 0 && h < 24 ? Math.round(h * 100) / 100 : null
}

function daysBetweenInMonth(startISO: string, endISO: string, year: number, month: number): Array<{ dateISO: string; day: number }> {
  const out: Array<{ dateISO: string; day: number }> = []
  const start = new Date(`${startISO}T00:00:00`)
  const end = new Date(`${endISO}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return out
  const first = new Date(year, month - 1, 1)
  const last = new Date(year, month, 0)
  const from = start < first ? first : start
  const to = end > last ? last : end
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    out.push({ dateISO: `${year}-${pad(month)}-${pad(d.getDate())}`, day: d.getDate() })
  }
  return out
}

function workingDaysInMonth(year: number, month: number): number {
  const days = new Date(year, month, 0).getDate()
  let count = 0
  for (let d = 1; d <= days; d++) {
    const dow = new Date(year, month - 1, d).getDay()
    if (dow >= 1 && dow <= 5) count++
  }
  return count
}

// Tab HRIS untuk pill navbar (urutan mengikuti referensi Crextio).
const NAV_TABS: Array<{ id: string; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'attendance', label: 'Absensi' },
  { id: 'leaves', label: 'Cuti' },
  { id: 'overtime', label: 'Lembur' },
  { id: 'salary', label: 'Salary' },
  { id: 'payroll', label: 'Gaji' },
  { id: 'shifts', label: 'Shift' },
  { id: 'profile', label: 'Profil' },
]

// ============================================================================
// NAVBAR — brand + pill nav tengah + tombol aksi kanan (ala referensi).
// Dipakai HRISContent untuk SEMUA tab. Jumlah notifikasi real.
// ============================================================================
export function HrisNavbar({ activeTab, onTabChange, onNotifyClick }: { activeTab: string; onTabChange: (id: string) => void; onNotifyClick: (msg: string) => void }) {
  const [unreadCount, setUnreadCount] = useState(0)
  useEffect(() => {
    notificationsApi.list().then((res: any) => {
      const notifs = res?.notifications ?? res?.data ?? []
      setUnreadCount(Array.isArray(notifs) ? notifs.filter((n: Record<string, unknown>) => !n.isRead && !n.readAt).length : 0)
    }).catch(() => {})
  }, [])

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 w-full">
      {/* Brand logo */}
      <div className="flex items-center gap-2.5 select-none">
        <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M17.5 4.5C14.8 4.5 13 6.8 13.7 9.4L15.4 15.6L9.2 13.9C6.6 13.2 4.3 15 4.3 17.7C4.3 20.1 6.1 22.1 8.5 22.4L14.8 23.2L11.7 28.7C10.4 31 11.8 33.8 14.4 34.2C16.7 34.6 18.9 33.1 19.4 30.8L20.8 24.6L25.6 28.7C27.6 30.4 30.7 29.6 31.7 27.1C32.6 24.9 31.6 22.4 29.4 21.4L23.6 18.8L29.1 15.5C31.3 14.2 31.7 11.1 29.9 9.2C28.2 7.5 25.5 7.5 23.8 9.2L19.4 13.7L20.8 7.5C21.3 5.2 19.8 4.5 17.5 4.5Z"
            fill="#141414"
          />
          <circle cx="18" cy="18.5" r="2.6" fill="#FAF9F6" />
        </svg>
        <span className="font-extrabold text-[15px] tracking-[0.06em] text-[#141414] uppercase">HRIS</span>
      </div>

      {/* Menu navigasi tengah berbentuk pill */}
      <nav className="flex items-center flex-wrap bg-white/95 backdrop-blur-sm rounded-full p-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]" aria-label="Modul HRIS">
        {NAV_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            aria-current={activeTab === t.id ? 'true' : undefined}
            className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 cursor-pointer ${
              activeTab === t.id
                ? 'bg-[#1E1E1E] text-white shadow-sm'
                : 'text-[#3A3A3A] hover:text-[#111111] hover:bg-black/[0.03]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Tombol aksi kanan (Setting, Notifikasi, Profil) */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => onNotifyClick('Pengaturan sistem dibuka')}
          className="flex items-center gap-2 bg-white/95 hover:bg-white text-[#1E1E1E] px-4 py-2.5 rounded-full text-[13px] font-medium shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all cursor-pointer"
        >
          <span className="text-[15px] leading-none">⚙</span>
          <span>Setting</span>
        </button>

        <div
          className="relative w-10 h-10 rounded-full bg-white/95 hover:bg-white flex items-center justify-center text-[#1E1E1E] shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 stroke-[1.75]" />
          {unreadCount > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#F5D248] ring-2 ring-white" />}
        </div>

        <div
          className="w-10 h-10 rounded-full bg-white/95 hover:bg-white flex items-center justify-center text-[#1E1E1E] shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all"
          aria-label="User Profile"
        >
          <span className="text-[13px] font-bold">U</span>
        </div>
      </div>
    </header>
  )
}

// ============================================================================
// SALARY VIEW — container 3 kolom (list karyawan / overview / profil).
// Semua data nyata: members, payroll bulan terpilih, attendance bulan
// terpilih, leave requests + types, overtime. Kosong = empty state jujur.
// ======================================================================
export default function SalaryView({ onActionToast }: { onActionToast: (msg: string) => void }) {
  const now = new Date()
  const [members, setMembers] = useState<any[]>([])
  const [payrolls, setPayrolls] = useState<any[]>([])
  const [attendances, setAttendances] = useState<any[]>([])
  const [leaveRequests, setLeaveRequests] = useState<any[]>([])
  const [leaveTypes, setLeaveTypes] = useState<any[]>([])
  const [overtimes, setOvertimes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [selId, setSelId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [ym, setYm] = useState(`${now.getFullYear()}-${pad(now.getMonth() + 1)}`)
  const [year, month] = ym.split('-').map(Number)

  const monthOptions = useMemo(() => {
    const out: Array<{ value: string; label: string }> = []
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      out.push({ value: `${d.getFullYear()}-${pad(d.getMonth() + 1)}`, label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}` })
    }
    return out
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let alive = true
    setLoading(true)
    setLoadError(false)
    const [y, m] = ym.split('-').map(Number)
    const startDate = `${y}-${pad(m)}-01`
    const endDate = `${y}-${pad(m)}-${new Date(y, m, 0).getDate()}`
    Promise.allSettled([
      membersApi.list({ limit: 100 }),
      payrollApi.list({ month: m, year: y }),
      attendancesApi.list(undefined, startDate, endDate),
      leavesApi.listRequests(),
      leavesApi.types(),
      overtimeApi.list(),
    ]).then(([memRes, payRes, attRes, lvRes, ltRes, otRes]) => {
      if (!alive) return
      setMembers(memRes.status === 'fulfilled' ? (memRes.value?.members ?? memRes.value ?? []) : [])
      setPayrolls(payRes.status === 'fulfilled' ? (payRes.value?.payrolls ?? payRes.value?.data ?? []) : [])
      setAttendances(attRes.status === 'fulfilled' ? (attRes.value?.attendances ?? attRes.value ?? []) : [])
      setLeaveRequests(lvRes.status === 'fulfilled' ? (lvRes.value?.leaveRequests ?? lvRes.value ?? []) : [])
      setLeaveTypes(ltRes.status === 'fulfilled' ? (ltRes.value?.leaveTypes ?? ltRes.value ?? []) : [])
      setOvertimes(otRes.status === 'fulfilled' ? (otRes.value?.overtimeRequests ?? otRes.value ?? []) : [])
      setLoading(false)
    })
    return () => { alive = false }
  }, [ym])

  // Bangun karyawan dari members + payroll + attendance + cuti bulan terpilih
  const employees: SalaryEmployee[] = useMemo(() => {
    const typeById = new Map(leaveTypes.map((t) => [String(t.id), String(t.name ?? '')]))
    const isSick = (typeId: string) => /sakit|sick/i.test(typeById.get(typeId) ?? '')

    const byUser = new Map<string, SalaryEmployee>()
    for (const m of members) {
      byUser.set(String(m.userId), {
        id: String(m.userId),
        name: String(m.userFullName ?? '—'),
        role: String(m.jobTitle ?? m.role ?? ''),
        avatarUrl: (m.userAvatarUrl as string | null) ?? null,
        email: (m.userEmail as string | null) ?? null,
        phone: (m.userPhoneNumber as string | null) ?? null,
        department: (m.userDepartment as string | null) ?? null,
        dateOfBirth: (m.userDateOfBirth as string | null) ?? null,
        address: (m.userAddress as string | null) ?? null,
        netSalary: null,
        presentDays: 0,
        workHours: null,
        truancyDays: 0,
        vacationDays: 0,
        sickDays: 0,
        overtimeHours: 0,
      })
    }
    for (const p of payrolls) {
      const e = byUser.get(String(p.userId))
      if (e) e.netSalary = Number(p.netSalary ?? p.basicSalary ?? 0) || null
    }
    const hoursByUser = new Map<string, number>()
    const daysByUser = new Map<string, number>()
    for (const a of attendances) {
      const uid = String(a.userId ?? '')
      if (!byUser.has(uid)) continue
      daysByUser.set(uid, (daysByUser.get(uid) ?? 0) + 1)
      const h = hoursBetween(a.clockInTime, a.clockOutTime)
      if (h !== null) hoursByUser.set(uid, (hoursByUser.get(uid) ?? 0) + h)
    }
    for (const [uid, d] of daysByUser) { const e = byUser.get(uid)!; e.presentDays = d; e.workHours = hoursByUser.get(uid) ?? null }
    for (const lv of leaveRequests) {
      if (!['approved', 'pending'].includes(String(lv.status))) continue
      const uid = String(lv.userId ?? '')
      const e = byUser.get(uid)
      if (!e) continue
      const days = daysBetweenInMonth(String(lv.startDate), String(lv.endDate), year, month)
      if (days.length === 0) continue
      if (isSick(String(lv.leaveTypeId))) e.sickDays += days.length
      else e.vacationDays += days.length
    }
    for (const ot of overtimes) {
      const e = byUser.get(String(ot.userId))
      if (!e) continue
      if (String(ot.overtimeDate ?? '').startsWith(ym) && ['approved', 'pending'].includes(String(ot.status))) {
        e.overtimeHours += Number(ot.totalHours ?? 0)
      }
    }
    // Truancy: hari kerja bulan ini tanpa hadir/cuti/sakit tercatat
    const workdays = workingDaysInMonth(year, month)
    for (const e of byUser.values()) {
      e.truancyDays = Math.max(0, workdays - e.presentDays - e.vacationDays - e.sickDays)
    }
    return [...byUser.values()]
  }, [members, payrolls, attendances, leaveRequests, leaveTypes, overtimes, year, month])

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return employees
    const q = searchQuery.toLowerCase()
    return employees.filter((e) => e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q))
  }, [employees, searchQuery])

  const selected = useMemo(() => employees.find((e) => e.id === selId) ?? employees[0] ?? null, [employees, selId])

  const handleSelectEmployee = (emp: SalaryEmployee) => {
    setSelId(emp.id)
    if (emp.id !== selected?.id) onActionToast(`Menampilkan data gaji ${emp.name}`)
  }

  // Event kalender dari cuti karyawan terpilih pada bulan tampil
  const events: CalendarEvent[] = useMemo(() => {
    if (!selected) return []
    const typeById = new Map(leaveTypes.map((t) => [String(t.id), String(t.name ?? '')]))
    const { lead } = (() => {
      const first = new Date(year, month - 1, 1)
      return { lead: (first.getDay() + 6) % 7 }
    })()
    const out: CalendarEvent[] = []
    for (const lv of leaveRequests) {
      if (String(lv.userId) !== selected.id) continue
      if (!['approved', 'pending'].includes(String(lv.status))) continue
      const typeName = typeById.get(String(lv.leaveTypeId)) ?? 'Cuti'
      const isSick = /sakit|sick/i.test(typeName)
      const days = daysBetweenInMonth(String(lv.startDate), String(lv.endDate), year, month)
      if (days.length === 0) continue
      const firstIdx = lead + days[0].day - 1
      const lastIdx = lead + days[days.length - 1].day - 1
      let row = Math.floor(firstIdx / 7)
      let startCol = firstIdx % 7
      let cursor = firstIdx
      const label = isSick ? 'Sickness' : 'Vacation'
      while (cursor <= lastIdx) {
        const rowEnd = row * 7 + 6
        const segEnd = Math.min(lastIdx, rowEnd)
        const rangeStart = days.find((d) => lead + d.day - 1 === cursor)?.day ?? days[0].day
        const rangeEnd = days.find((d) => lead + d.day - 1 === segEnd)?.day ?? days[days.length - 1].day
        out.push({
          id: `${lv.id}-${row}`,
          type: isSick ? 'sickness' : 'vacation',
          label,
          dateRange: rangeStart === rangeEnd ? `${rangeStart} ${MONTH_SHORT[month - 1]}` : `${rangeStart}–${rangeEnd} ${MONTH_SHORT[month - 1]}`,
          row,
          startCol,
          spanCols: segEnd - cursor + 1,
        })
        cursor = segEnd + 1
        row += 1
        startCol = 0
      }
    }
    return out
  }, [selected, leaveRequests, leaveTypes, year, month])

  const presentDays = selected?.presentDays ?? 0
  const workHours = selected?.workHours ?? null
  const truancyDays = selected?.truancyDays ?? 0
  const vacationDays = selected?.vacationDays ?? 0

  return (
    <div className="@container p-4 md:p-5 flex flex-col gap-5">
      {loading ? (
        <div className="grid grid-cols-1 @3xl:grid-cols-12 gap-5 animate-pulse">
          <div className="@3xl:col-span-3 h-80 rounded-[22px] bg-white/70" />
          <div className="@3xl:col-span-6 h-96 rounded-[22px] bg-white/70" />
          <div className="@3xl:col-span-3 h-96 rounded-[28px] bg-white/70" />
        </div>
      ) : loadError ? (
        <p className="text-sm text-[#df4a4a]">Gagal memuat data salary.</p>
      ) : employees.length === 0 ? (
        <p className="text-sm text-[#8A8D93] py-10 text-center">Belum ada anggota tim di tenant ini.</p>
      ) : (
        <>
          {/* Judul halaman ala referensi */}
          <div className="mt-4 mb-3 flex items-center justify-between">
            <h1 className="text-[32px] sm:text-[36px] font-normal text-[#1E1E1E] tracking-[-0.02em] leading-none">Salary</h1>
            <span className="text-[12px] text-[#8A8D93]">{employees.length} karyawan · {MONTH_NAMES[month - 1]} {year}</span>
          </div>

          <div className="grid grid-cols-1 @3xl:grid-cols-12 gap-5 items-stretch">
            <div className="@3xl:col-span-3">
              <EmployeeListCard
                employees={filtered}
                selectedId={selected?.id ?? null}
                onSelectEmployee={handleSelectEmployee}
                emptyHint={searchQuery ? 'Karyawan tidak ditemukan.' : 'Belum ada anggota tim.'}
              />
            </div>

            <div className="@3xl:col-span-6">
              {selected && (
                <SalaryOverviewCard
                  employee={selected}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  year={year}
                  month={month}
                  onMonthChange={setYm}
                  monthOptions={monthOptions}
                  events={events}
                  presentDays={presentDays}
                  workHours={workHours}
                  truancyDays={truancyDays}
                  vacationDays={vacationDays}
                  onActionToast={onActionToast}
                />
              )}
            </div>

            <div className="@3xl:col-span-3">
              {selected && <ProfileDetailCard employee={selected} />}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
