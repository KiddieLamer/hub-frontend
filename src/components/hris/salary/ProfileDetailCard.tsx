import { Calendar, Phone, Mail, Globe, MapPin, Map, Hourglass, Sparkles } from 'lucide-react'
import type { SalaryEmployee } from './types'

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ============================================================================
// PROFILE DETAIL CARD — profil karyawan terpilih (kolom kanan)
// ============================================================================
export default function ProfileDetailCard({ employee }: { employee: SalaryEmployee }) {
  const initials = (employee.name || '?').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  const infoRows = [
    { icon: Calendar, label: 'Birthday', value: employee.dateOfBirth ? fmtDate(employee.dateOfBirth) : null },
    { icon: Phone, label: 'Phone number', value: employee.phone },
    { icon: Mail, label: 'E-Mail', value: employee.email },
    { icon: Globe, label: 'Departemen', value: employee.department },
    { icon: MapPin, label: 'Jabatan', value: employee.role || null },
    { icon: Map, label: 'Address', value: employee.address },
  ].filter((r) => r.value)
  const overtimePct = Math.min(100, Math.round(employee.overtimeHours * 5))
  const sickPct = Math.min(100, employee.sickDays * 10)

  return (
    <aside className="bg-white rounded-[28px] p-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
      <div>
        {/* Banner Gelombang Cahaya Emas Abstrak + Avatar */}
        <div className="relative h-[88px] rounded-[20px] overflow-hidden bg-[#120D05]">
          <svg className="w-full h-full object-cover" viewBox="0 0 400 120" preserveAspectRatio="none">
            <defs>
              <radialGradient id="goldGlow1" cx="72%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#FFD84D" stopOpacity="0.95" />
                <stop offset="45%" stopColor="#D98A14" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#0E0A04" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="waveRibbon" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1E170C" />
                <stop offset="45%" stopColor="#F4B928" />
                <stop offset="70%" stopColor="#FFF0A8" />
                <stop offset="100%" stopColor="#8F5608" />
              </linearGradient>
            </defs>
            <rect width="400" height="120" fill="#0F0B06" />
            <circle cx="295" cy="55" r="130" fill="url(#goldGlow1)" />
            <path d="M-20,105 C70,30 150,125 250,45 C310,-5 360,35 420,15 L420,120 L-20,120 Z" fill="url(#waveRibbon)" opacity="0.7" />
            <path d="M-10,85 C95,120 185,10 315,75 C360,95 390,65 420,55" fill="none" stroke="#FFE680" strokeWidth="3.5" opacity="0.85" />
            <path d="M20,30 C130,85 215,5 395,95" fill="none" stroke="#E6E8EC" strokeWidth="2" opacity="0.45" />
          </svg>
        </div>

        {/* Foto profil overlapping */}
        <div className="flex flex-col items-center -mt-10 px-3">
          <div className="w-[78px] h-[78px] rounded-full p-1 bg-white shadow-sm">
            <span className="relative grid w-full h-full rounded-full place-items-center overflow-hidden bg-[#ECEEF2] text-lg font-semibold text-[#1E1E1E]">
              {initials}
              {employee.avatarUrl && <img src={employee.avatarUrl} alt={employee.name} className="absolute inset-0 size-full object-cover" />}
            </span>
          </div>
          <h2 className="mt-2 text-[19px] font-semibold text-[#1E1E1E] tracking-tight">{employee.name}</h2>
          <p className="text-[12.5px] text-[#7A7D84] mt-0.5">{employee.role}</p>
        </div>

        {/* Ringkasan bulan */}
        <div className="px-3.5 pt-4">
          <h3 className="text-[13.5px] font-semibold text-[#1E1E1E] mb-2.5">Bulan ini</h3>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-[16px] bg-[#F5EED8] p-3">
              <div className="flex items-center gap-1.5 text-[10.5px] text-[#6A6D73] mb-1"><Hourglass className="w-3 h-3" /> Jam kerja</div>
              <div className="text-[15px] font-semibold text-[#1E1E1E]">{employee.workHours !== null ? `${employee.workHours.toFixed(1)} jam` : `${employee.presentDays} hari`}</div>
            </div>
            <div className="rounded-[16px] bg-[#F8F3E2] p-3">
              <div className="flex items-center gap-1.5 text-[10.5px] text-[#6A6D73] mb-1"><Sparkles className="w-3 h-3" /> Gaji bersih</div>
              <div className="text-[15px] font-semibold text-[#1E1E1E] truncate">
                {employee.netSalary !== null ? `Rp${employee.netSalary.toLocaleString('id-ID', { maximumFractionDigits: 0 })}` : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Basic information — baris tanpa nilai disembunyikan */}
        <div className="px-3.5 pt-5">
          <h3 className="text-[13.5px] font-semibold text-[#1E1E1E] mb-3">Basic Information</h3>
          <div className="flex flex-col gap-2.5">
            {infoRows.map((item) => {
              const IconComp = item.icon
              return (
                <div key={item.label} className="flex items-baseline text-[11.5px] gap-1.5">
                  <div className="flex items-center gap-2 text-[#2A2A2A] shrink-0">
                    <IconComp className="w-3.5 h-3.5 text-[#3A3D42] stroke-[1.75] translate-y-[1px]" />
                    <span>{item.label}</span>
                  </div>
                  <span className="flex-1 border-b border-dotted border-[#D5D7DC] mx-1" />
                  <span className="font-medium text-[#1E1E1E] text-right truncate max-w-[165px]">{item.value}</span>
                </div>
              )
            })}
            {infoRows.length === 0 && <p className="text-[11px] text-[#8A8D93]">Data profil karyawan belum dilengkapi.</p>}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="px-3.5 pt-5 pb-3">
        <h3 className="text-[13.5px] font-semibold text-[#1E1E1E] mb-3">Statistics</h3>

        <div className="mb-3">
          <div className="flex items-center justify-between text-[11.5px] mb-1.5">
            <span className="text-[#2A2A2A]">Lembur</span>
            <span className="font-medium text-[#1E1E1E]">{employee.overtimeHours} jam</span>
          </div>
          <div className="w-full h-[5px] rounded-full overflow-hidden hatch-track">
            <div className="h-full bg-[#F5D248] rounded-full transition-all duration-300" style={{ width: `${overtimePct}%` }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-[11.5px] mb-1.5">
            <span className="text-[#2A2A2A]">Sickness</span>
            <span className="font-medium text-[#1E1E1E]">{employee.sickDays} hari</span>
          </div>
          <div className="w-full h-[5px] rounded-full overflow-hidden hatch-track">
            <div className="h-full bg-[#222222] rounded-full transition-all duration-300" style={{ width: `${sickPct}%` }} />
          </div>
        </div>
      </div>
    </aside>
  )
}
