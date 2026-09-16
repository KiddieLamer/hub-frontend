import { useState, useEffect, useCallback } from 'react'
import { Search, X, Clock, Calendar, Hourglass, CreditCard, Shield, User, Users, Smartphone } from 'lucide-react'
import { usersApi, attendancesApi, overtimeApi, leavesApi, payrollApi, shiftsApi } from '../../lib/endpoints'

function GroupedRow({
  icon,
  iconBg,
  label,
  value,
  editable,
  onClick,
  isLast,
}: {
  icon?: React.ReactNode
  iconBg?: string
  label: string
  value?: string
  editable?: boolean
  onClick?: () => void
  isLast?: boolean
}) {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '9px 14px',
        borderBottom: isLast ? 'none' : '1px solid rgb(229, 229, 234)',
        minHeight: 38,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'
      }}
      onMouseLeave={(e) => {
        if (onClick) e.currentTarget.style.background = 'transparent'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon && iconBg && (
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              flexShrink: 0,
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            {icon}
          </div>
        )}
        <span style={{ fontSize: 13, color: '#1d1d1f', fontFamily: SF, fontWeight: 400 }}>{label}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {value && <span style={{ fontSize: 13, color: editable ? '#8E8E93' : '#1d1d1f', fontFamily: SF, fontWeight: 400 }}>{value}</span>}
        {editable && (
          <span style={{ fontSize: 12, color: '#007AFF', fontFamily: SF, fontWeight: 500, cursor: 'pointer' }}>Edit</span>
        )}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </div>
  )
}

export function HRISContent({ onClose, onMinimize, onMaximize }: { onClose: () => void; onMinimize: () => void; onMaximize?: () => void }) {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'leaves' | 'overtime' | 'payroll' | 'shifts' | 'profile'>('dashboard')
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showEmployeeForm, setShowEmployeeForm] = useState(false)
  const [employeeValues, setEmployeeValues] = useState<Record<string, string>>({})

  // Dashboard state
  const [todayAttendance, setTodayAttendance] = useState<any>(null)
  const [overtimeList, setOvertimeList] = useState<any[]>([])
  const [leaveTypes, setLeaveTypes] = useState<any[]>([])

  // Attendance state
  const [attendanceList, setAttendanceList] = useState<any[]>([])
  const [hasCheckedIn, setHasCheckedIn] = useState(false)
  const [hasCheckedOut, setHasCheckedOut] = useState(false)

  // Leaves state
  const [leavesData, setLeavesData] = useState<any[]>([])
  const [showLeaveForm, setShowLeaveForm] = useState(false)
  const [leaveValues, setLeaveValues] = useState<Record<string, string>>({})

  // Overtime state
  const [overtimeData, setOvertimeData] = useState<any[]>([])
  const [overtimeValues, setOvertimeValues] = useState<Record<string, string>>({})

  // Payroll state
  const [payrollList, setPayrollList] = useState<any[]>([])

  // Shifts state
  const [shiftsList, setShiftsList] = useState<any[]>([])
  const [showShiftForm, setShowShiftForm] = useState(false)
  const [shiftValues, setShiftValues] = useState<Record<string, string>>({})

  // Profile state
  const [userProfile, setUserProfile] = useState<any>(null)

  const [listSearchQuery, setListSearchQuery] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const [error, setError] = useState<string | null>(null)

  const iconBg: Record<string, string> = {
    dashboard: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)',
    attendance: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)',
    leaves: 'linear-gradient(135deg, #ff9500 0%, #c06a00 100%)',
    overtime: 'linear-gradient(135deg, #af52de 0%, #892ab8 100%)',
    payroll: 'linear-gradient(135deg, #30b0c7 0%, #00778a 100%)',
    shifts: 'linear-gradient(135deg, #5856d6 0%, #3634a3 100%)',
    profile: 'linear-gradient(135deg, #8e8e93 0%, #636366 100%)',
  }

  const tabDesc: Record<string, string> = {
    dashboard: 'Overview kehadiran, sisa cuti, dan lembur bulan ini.',
    attendance: 'Catat dan pantau check-in / check-out harian.',
    leaves: 'Ajukan dan pantau status pengajuan cuti.',
    overtime: 'Catat dan pantau lembur karyawan.',
    payroll: 'Ringkasan gaji dan slip pembayaran.',
    shifts: 'Jadwal shift dan rotasi tim.',
    profile: 'Data profil karyawan.',
  }

  const mainTabs = [
    { id: 'dashboard' as const, label: 'Dashboard' },
    { id: 'attendance' as const, label: 'Absensi' },
    { id: 'leaves' as const, label: 'Cuti' },
    { id: 'overtime' as const, label: 'Lembur' },
  ]
  const empTabs = [
    { id: 'payroll' as const, label: 'Gaji' },
    { id: 'shifts' as const, label: 'Shift' },
    { id: 'profile' as const, label: 'Profil' },
  ]

  const iconPaths: Record<string, string> = {
    dashboard: 'M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z',
    attendance: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    leaves: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    overtime: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    payroll: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    shifts: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    profile: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  }

  const btnSize = 12
  const btnGap = 8

  // ============ DATA LOADING ============
  const loadDashboard = useCallback(async () => {
    try {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`
      const [attRes, otRes, ltRes] = await Promise.allSettled([
        attendancesApi.list(undefined, startDate, endDate),
        overtimeApi.list(),
        leavesApi.types(),
      ])
      if (attRes.status === 'fulfilled') {
        const att = attRes.value?.attendances || attRes.value || []
        const today = new Date().toISOString().slice(0, 10)
        const todayAtt = att.find((a: any) => a.date === today || a.clockInTime?.startsWith(today))
        setTodayAttendance(todayAtt)
        setAttendanceList(Array.isArray(att) ? att : [])
      }
      if (otRes.status === 'fulfilled') {
        const ot = otRes.value?.overtimeRequests || otRes.value || []
        setOvertimeList(Array.isArray(ot) ? ot : [])
      }
      if (ltRes.status === 'fulfilled') {
        const lt = ltRes.value?.leaveTypes || ltRes.value || []
        setLeaveTypes(Array.isArray(lt) ? lt : [])
      }
    } catch { setError('Gagal memuat data') } finally {}
  }, [])

  const loadAttendance = useCallback(async () => {
    try {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`
      const res = await attendancesApi.list(undefined, startDate, endDate)
      const att = res?.attendances || res || []
      setAttendanceList(Array.isArray(att) ? att : [])
      const today = new Date().toISOString().slice(0, 10)
      const todayAtt = att.find((a: any) => a.date === today || a.clockInTime?.startsWith(today))
      setHasCheckedIn(!!todayAtt?.clockInTime)
      setHasCheckedOut(!!todayAtt?.clockOutTime)
    } catch { setError('Gagal memuat data') }
  }, [])

  const loadLeaves = useCallback(async () => {
    try {
      const [reqRes, typeRes] = await Promise.allSettled([leavesApi.listRequests(), leavesApi.types()])
      if (reqRes.status === 'fulfilled') {
        const lv = reqRes.value?.leaveRequests || reqRes.value || []
        setLeavesData(Array.isArray(lv) ? lv : [])
      }
      if (typeRes.status === 'fulfilled') {
        const lt = typeRes.value?.leaveTypes || typeRes.value || []
        setLeaveTypes(Array.isArray(lt) ? lt : [])
      }
    } catch { setError('Gagal memuat data') }
  }, [])

  const loadOvertime = useCallback(async () => {
    try {
      const res = await overtimeApi.list()
      const ot = res?.overtimeRequests || res || []
      setOvertimeData(Array.isArray(ot) ? ot : [])
    } catch { setError('Gagal memuat data') }
  }, [])

  const loadPayroll = useCallback(async () => {
    try {
      const now = new Date()
      const listRes = await payrollApi.list({ month: now.getMonth() + 1, year: now.getFullYear() })
      const pl = listRes?.payrollRecords || listRes || []
      setPayrollList(Array.isArray(pl) ? pl : [])
    } catch { setError('Gagal memuat data') }
  }, [])

  const loadShifts = useCallback(async () => {
    try {
      const res = await shiftsApi.list()
      const sh = res?.shifts || res || []
      setShiftsList(Array.isArray(sh) ? sh : [])
    } catch { setError('Gagal memuat data') }
  }, [])

  const loadProfile = useCallback(async () => {
    try {
      const res = await usersApi.getMe()
      setUserProfile(res?.user || res || null)
    } catch { setError('Gagal memuat data') }
  }, [])

  useEffect(() => {
    if (activeTab === 'dashboard') loadDashboard()
    if (activeTab === 'attendance') loadAttendance()
    if (activeTab === 'leaves') loadLeaves()
    if (activeTab === 'overtime') loadOvertime()
    if (activeTab === 'payroll') loadPayroll()
    if (activeTab === 'shifts') loadShifts()
    if (activeTab === 'profile') loadProfile()
  }, [activeTab, loadDashboard, loadAttendance, loadLeaves, loadOvertime, loadPayroll, loadShifts, loadProfile])

  // ============ ACTIONS ============
  const handleCheckIn = async () => {
    try { await attendancesApi.checkIn(); loadAttendance(); loadDashboard() } catch {}
  }
  const handleCheckOut = async () => {
    try { await attendancesApi.checkOut(); loadAttendance(); loadDashboard() } catch {}
  }
  const handleCreateLeave = async () => {
    try { await leavesApi.createRequest(leaveValues); setShowLeaveForm(false); setLeaveValues({}); loadLeaves(); loadDashboard() } catch {}
  }
  const handleCreateOvertime = async () => {
    try { await overtimeApi.create(overtimeValues); setShowOvertimeForm(false); setOvertimeValues({}); loadOvertime(); loadDashboard() } catch {}
  }
  const handleCreateShift = async () => {
    try { await shiftsApi.create(shiftValues); setShowShiftForm(false); setShiftValues({}); loadShifts() } catch {}
  }
  const handleCreateEmployee = async () => {
    setFormError(null)
    if (!employeeValues.fullName?.trim()) { setFormError('Nama lengkap wajib diisi'); return }
    if (!employeeValues.email?.trim()) { setFormError('Email wajib diisi'); return }
    try { await usersApi.create(employeeValues); setShowEmployeeForm(false); setEmployeeValues({}); loadProfile() } catch {}
  }

  // ============ HELPERS ============
  const now = new Date()
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const greeting = now.getHours() < 12 ? 'Selamat Pagi' : now.getHours() < 18 ? 'Selamat Siang' : 'Selamat Malam'
  const userName = userProfile?.fullName || 'Admin'

  const filteredMainTabs = mainTabs.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredEmpTabs = empTabs.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase()))

  const renderHrisItem = (tab: { id: string; label: string }) => {
    const active = activeTab === tab.id
    return (
      <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 8px', borderRadius: 7, border: 'none', background: active ? '#007aff' : 'transparent', color: active ? 'white' : '#1d1d1f', fontSize: 13, fontWeight: active ? 500 : 400, fontFamily: SF, letterSpacing: '-0.01em', cursor: 'pointer', transition: 'background 0.12s', textAlign: 'left', width: '100%' }} onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }} onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}>
        <div style={{ width: 22, height: 22, borderRadius: 5, background: active ? 'rgba(255,255,255,0.25)' : iconBg[tab.id], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: active ? 'none' : '0 1px 2px rgba(0,0,0,0.12)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={iconPaths[tab.id]} /></svg>
        </div>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tab.label}</span>
      </button>
    )
  }

  const formatTime = (iso: string | null) => {
    if (!iso) return '--:--'
    const d = new Date(iso)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const formatRupiah = (n: number) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`

  const todayAtt = attendanceList.find((a: any) => {
    const today = new Date().toISOString().slice(0, 10)
    return a.date === today || a.clockInTime?.startsWith(today)
  })

  const dashboardCheckIn = todayAttendance?.clockInTime || todayAtt?.clockInTime

  const totalOvertimeHours = overtimeList.filter((o: any) => o.status === 'approved').reduce((sum: number, o: any) => sum + (Number(o.totalHours) || 0), 0)

  const paidLeaves = leaveTypes.filter((lt: any) => lt.isPaid !== false)

  const totalPayroll = payrollList.length > 0 ? payrollList[0] : null
  const netSalary = totalPayroll?.netSalary || totalPayroll?.totalNet || 0

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: SF, padding: 10, gap: 10 }}>
      {/* Sidebar */}
      <div style={{ width: 220, flexShrink: 0, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', padding: '6px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', gap: btnGap, padding: '12px 10px 10px' }}>
          <div style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'close' ? '#ff5f57' : 'linear-gradient(180deg, #ff5f57 0%, #e0443e 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose} onMouseEnter={() => setHoveredBtn('close')} onMouseLeave={() => setHoveredBtn(null)}>
            {hoveredBtn === 'close' && <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 1L5 5M5 1L1 5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round"/></svg>}
          </div>
          <div style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'minimize' ? '#febc2e' : 'linear-gradient(180deg, #febc2e 0%, #dea123 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onMinimize} onMouseEnter={() => setHoveredBtn('minimize')} onMouseLeave={() => setHoveredBtn(null)}>
            {hoveredBtn === 'minimize' && <svg width="6" height="2" viewBox="0 0 6 2" fill="none"><path d="M1 1H5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round"/></svg>}
          </div>
          <div style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'maximize' ? '#28c840' : 'linear-gradient(180deg, #28c840 0%, #1aab29 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onMaximize} onMouseEnter={() => setHoveredBtn('maximize')} onMouseLeave={() => setHoveredBtn(null)}>
            {hoveredBtn === 'maximize' && <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 3L3 1L5 3" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 3L3 5L5 3" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
        </div>
        <div style={{ padding: '0 6px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.06)', padding: '4px 8px' }}>
            <Search size={13} color="#8e8e93" />
            <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 12, color: '#1d1d1f', fontFamily: SF }} />
          </div>
        </div>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: SF }}>MAIN</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredMainTabs.map((tab) => renderHrisItem(tab))}
        </div>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', padding: '4px 10px', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: SF }}>EMPLOYEE</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredEmpTabs.map((tab) => renderHrisItem(tab))}
        </div>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflowY: 'auto', minWidth: 0, background: '#ffffff', borderRadius: 12 }}>
        <div style={{ display: 'flex', gap: 12, padding: '12px 18px 0', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 2 }}>
            <button style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 24px 20px', textAlign: 'center' }}>
          <div style={{ width: 58, height: 58, borderRadius: 14, background: iconBg[activeTab], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.12), inset 0 0 0 0.5px rgba(255,255,255,0.3)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={iconPaths[activeTab]} /></svg>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.02em', marginBottom: 4 }}>
            {[...mainTabs, ...empTabs].find(t => t.id === activeTab)?.label}
          </div>
          <div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF, maxWidth: 440, lineHeight: 1.4 }}>
            {tabDesc[activeTab]}
          </div>
        </div>

        {error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 }}>
            <div style={{ fontSize: 13, color: '#ff3b30', fontFamily: SF }}>Gagal memuat data</div>
            <button onClick={() => { setError(null); if (activeTab === 'dashboard') loadDashboard(); if (activeTab === 'attendance') loadAttendance(); if (activeTab === 'leaves') loadLeaves(); if (activeTab === 'overtime') loadOvertime(); if (activeTab === 'payroll') loadPayroll(); if (activeTab === 'shifts') loadShifts(); if (activeTab === 'profile') loadProfile() }} style={{ fontSize: 12, color: '#007aff', background: 'none', border: 'none', cursor: 'pointer', fontFamily: SF }}>Coba lagi</button>
          </div>
        ) : (
        <div style={{ padding: '0 24px 28px', maxWidth: 540, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14, fontFamily: SF }}>

          {/* ============ DASHBOARD ============ */}
          {activeTab === 'dashboard' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0 2px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.02em' }}>
                  {greeting}, {userName}
                </div>
                <div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF, marginTop: 2 }}>
                  {dayNames[now.getDay()]}, {now.getDate()} {monthNames[now.getMonth()]} {now.getFullYear()}
                </div>
              </div>
              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <GroupedRow icon={<Clock size={14} />} iconBg="#34c759" label="Hadir Hari Ini" value={dashboardCheckIn ? formatTime(dashboardCheckIn) : 'Belum'} />
                <GroupedRow icon={<Calendar size={14} />} iconBg="#007aff" label="Sisa Cuti" value={`${paidLeaves.reduce((sum: number, lt: any) => sum + (lt.totalQuota || 0), 0)} hari`} />
                <GroupedRow icon={<Hourglass size={14} />} iconBg="#ff9500" label="Lembur Bulan Ini" value={`${totalOvertimeHours} jam`} isLast />
              </div>

              {/* Monthly attendance heatmap */}
              {(() => {
                const year = now.getFullYear()
                const month = now.getMonth()
                const today = now.getDate()
                const daysInMonth = new Date(year, month + 1, 0).getDate()
                const firstDow = (new Date(year, month, 1).getDay() + 6) % 7
                const greens = ['#9be9a8', '#40c463', '#216e39']
                const dNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
                const statusOf = (d: number) => {
                  if (d > today) return 'future'
                  const dow = (firstDow + d - 1) % 7
                  if (dow >= 5) return 'off'
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                  const att = attendanceList.find((a: any) => a.date === dateStr || a.clockInTime?.startsWith(dateStr))
                  if (!att) return 'absent'
                  if (att.clockInTime) {
                    const ci = new Date(att.clockInTime)
                    if (ci.getHours() > 8 || (ci.getHours() === 8 && ci.getMinutes() > 0)) return 'late'
                    return 'present'
                  }
                  return 'present'
                }
                const colorOf = (d: number) => {
                  const s = statusOf(d)
                  if (s === 'present') return greens[d % 3]
                  if (s === 'late') return '#ff9500'
                  if (s === 'absent') return '#e5e5ea'
                  return '#e5e5ea'
                }
                const labelOf = (d: number) => {
                  const s = statusOf(d)
                  const base = `${d} ${monthNames[month]} ${year}`
                  if (s === 'present') return `${base} — Hadir`
                  if (s === 'late') return `${base} — Terlambat`
                  if (s === 'off') return `${base} — Libur`
                  if (s === 'absent') return `${base} — Absen`
                  return base
                }
                const weeks: (number | null)[][] = []
                let cur: (number | null)[] = Array(firstDow).fill(null)
                for (let d = 1; d <= daysInMonth; d++) { cur.push(d); if (cur.length === 7) { weeks.push(cur); cur = [] } }
                if (cur.length) { while (cur.length < 7) cur.push(null); weeks.push(cur) }
                const cell = 11
                const gap = 3
                const presentCount = attendanceList.filter((a: any) => a.clockInTime).length
                return (
                  <div style={{ padding: 12, borderRadius: 10, background: 'rgb(242, 242, 247)', border: '0.5px solid rgba(0,0,0,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.01em' }}>Kehadiran {monthNames[month]} {year}</div>
                      <div style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF }}>{presentCount} hadir</div>
                    </div>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap }}>
                        {['', 'Sen', '', 'Rab', '', 'Jum', ''].map((l, i) => (
                          <div key={i} style={{ width: 18, height: cell, display: 'flex', alignItems: 'center', fontSize: 8, color: '#8e8e93', fontFamily: SF }}>{l}</div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap }}>
                        {weeks.map((week, wi) => (
                          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap }}>
                            {week.map((d, di) => (
                              <div key={di} title={d ? `${dNames[di]}, ${labelOf(d)}` : ''} style={{ width: cell, height: cell, borderRadius: 2.5, background: d ? colorOf(d) : 'transparent' }} />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <div style={{ flex: 1 }} />
                      {[{ c: '#216e39', l: 'Hadir' }, { c: '#ff9500', l: 'Terlambat' }, { c: '#e5e5ea', l: 'Libur/Absen' }].map((x) => (
                        <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: x.c }} />
                          <span style={{ fontSize: 9, color: '#8e8e93', fontFamily: SF }}>{x.l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </>
          )}

          {/* ============ ATTENDANCE ============ */}
          {activeTab === 'attendance' && (
            <>
              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <GroupedRow icon={<Clock size={14} />} iconBg="#34c759" label="Check In" value={hasCheckedIn ? formatTime(todayAtt?.clockInTime) : '--:--'} />
                <GroupedRow icon={<Clock size={14} />} iconBg="#ff3b30" label="Check Out" value={hasCheckedOut ? formatTime(todayAtt?.clockOutTime) : '--:--'} isLast />
              </div>
              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex' }}>
                {!hasCheckedIn ? (
                  <button onClick={handleCheckIn} style={{ flex: 1, padding: '11px 14px', border: 'none', background: 'transparent', color: '#34c759', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF, textAlign: 'center' }}>Check In Sekarang</button>
                ) : !hasCheckedOut ? (
                  <button onClick={handleCheckOut} style={{ flex: 1, padding: '11px 14px', border: 'none', background: 'transparent', color: '#ff3b30', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF, textAlign: 'center' }}>Check Out Sekarang</button>
                ) : (
                  <div style={{ flex: 1, padding: '11px 14px', color: '#8e8e93', fontSize: 13, textAlign: 'center', fontFamily: SF }}>Selesai Hari Ini</div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', fontFamily: SF, marginBottom: 6, paddingLeft: 4 }}>Riwayat Bulan Ini</div>
                <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                  {attendanceList.length === 0 ? (
                    <div style={{ padding: '16px 14px', fontSize: 12, color: '#8e8e93', fontFamily: SF, textAlign: 'center' }}>Belum ada data absensi</div>
                  ) : (
                    attendanceList.slice(0, 10).map((att: any, i: number) => (
                      <GroupedRow key={att.id || i} icon={<Clock size={14} />} iconBg={att.clockOutTime ? '#34c759' : '#ff9500'} label={att.date || '-'} value={`${formatTime(att.clockInTime)} - ${formatTime(att.clockOutTime)}`} isLast={i === Math.min(attendanceList.length, 10) - 1} />
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* ============ LEAVES ============ */}
          {activeTab === 'leaves' && (
            <>
              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                {paidLeaves.length === 0 ? (
                  <div style={{ padding: '16px 14px', fontSize: 12, color: '#8e8e93', fontFamily: SF, textAlign: 'center' }}>Belum ada tipe cuti</div>
                ) : (
                  paidLeaves.map((lt: any, i: number) => (
                    <GroupedRow key={lt.id || i} icon={<Calendar size={14} />} iconBg="#007aff" label={lt.name} value={`${lt.totalQuota || 0} hari`} isLast={i === paidLeaves.length - 1} />
                  ))
                )}
              </div>
              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <button onClick={() => setShowLeaveForm(true)} style={{ width: '100%', padding: '11px 14px', border: 'none', background: 'transparent', color: '#007aff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF, textAlign: 'center' }}>Ajukan Cuti</button>
              </div>
              {leavesData.length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', fontFamily: SF, marginBottom: 6, paddingLeft: 4 }}>Riwayat Pengajuan</div>
                  <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    {leavesData.slice(0, 5).map((lv: any, i: number) => (
                      <GroupedRow key={lv.id || i} icon={<Calendar size={14} />} iconBg={lv.status === 'approved' ? '#34c759' : lv.status === 'rejected' ? '#ff3b30' : '#ff9500'} label={lv.startDate || '-'} value={lv.status || 'pending'} isLast={i === Math.min(leavesData.length, 5) - 1} />
                    ))}
                  </div>
                </div>
              )}
              {showLeaveForm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowLeaveForm(false)}>
                  <div style={{ background: 'white', borderRadius: 12, padding: 20, width: 380, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, fontFamily: SF, color: '#1d1d1f' }}>Ajukan Cuti</div>
                      <button onClick={() => setShowLeaveForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={16} color="#8e8e93" /></button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 500, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Tipe Cuti<span style={{ color: '#ff3b30' }}> *</span></label>
                        <select value={leaveValues.leaveTypeId || ''} onChange={(e) => setLeaveValues({ ...leaveValues, leaveTypeId: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box', color: '#1d1d1f', background: 'white' }}>
                          <option value="">Pilih...</option>
                          {leaveTypes.map((lt: any) => <option key={lt.id} value={lt.id}>{lt.name}</option>)}
                        </select>
                      </div>
                      <div><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Dari<span style={{ color: '#ff3b30' }}> *</span></label><input type="date" value={leaveValues.startDate || ''} onChange={(e) => setLeaveValues({ ...leaveValues, startDate: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box' }} /></div>
                      <div><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Sampai<span style={{ color: '#ff3b30' }}> *</span></label><input type="date" value={leaveValues.endDate || ''} onChange={(e) => setLeaveValues({ ...leaveValues, endDate: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box' }} /></div>
                      <div><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Total Hari<span style={{ color: '#ff3b30' }}> *</span></label><input type="number" min="1" value={leaveValues.totalDays || ''} onChange={(e) => setLeaveValues({ ...leaveValues, totalDays: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box' }} /></div>
                      <div><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Alasan<span style={{ color: '#ff3b30' }}> *</span></label><textarea rows={2} value={leaveValues.reason || ''} onChange={(e) => setLeaveValues({ ...leaveValues, reason: e.target.value })} placeholder="Alasan cuti..." style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
                      <button onClick={() => { setShowLeaveForm(false); setLeaveValues({}) }} style={{ padding: '7px 16px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', background: '#f5f5f5', color: '#1d1d1f', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Batal</button>
                      <button onClick={handleCreateLeave} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: '#007aff', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Kirim</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ============ OVERTIME ============ */}
          {activeTab === 'overtime' && (
            <>
              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <GroupedRow icon={<Hourglass size={14} />} iconBg="#ff9500" label="Total Bulan Ini" value={`${totalOvertimeHours} jam`} isLast />
              </div>
              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden', padding: '6px 14px 12px' }}>
                <div style={{ padding: '8px 0' }}>
                  <label style={{ fontSize: 12, color: '#1d1d1f', marginBottom: 4, display: 'block', fontFamily: SF }}>Tanggal</label>
                  <input type="date" value={overtimeValues.overtimeDate || ''} onChange={(e) => setOvertimeValues({ ...overtimeValues, overtimeDate: e.target.value })} style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, outline: 'none', fontFamily: SF, background: '#ffffff', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 12, color: '#1d1d1f', marginBottom: 4, display: 'block', fontFamily: SF }}>Mulai</label>
                    <input type="time" value={overtimeValues.startTime || '18:00'} onChange={(e) => setOvertimeValues({ ...overtimeValues, startTime: e.target.value })} style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, outline: 'none', fontFamily: SF, background: '#ffffff', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 12, color: '#1d1d1f', marginBottom: 4, display: 'block', fontFamily: SF }}>Selesai</label>
                    <input type="time" value={overtimeValues.endTime || '21:00'} onChange={(e) => setOvertimeValues({ ...overtimeValues, endTime: e.target.value })} style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, outline: 'none', fontFamily: SF, background: '#ffffff', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div style={{ padding: '8px 0' }}>
                  <label style={{ fontSize: 12, color: '#1d1d1f', marginBottom: 4, display: 'block', fontFamily: SF }}>Total Jam</label>
                  <input type="number" min="0.5" max="24" step="0.5" value={overtimeValues.totalHours || '3'} onChange={(e) => setOvertimeValues({ ...overtimeValues, totalHours: e.target.value })} style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, outline: 'none', fontFamily: SF, background: '#ffffff', boxSizing: 'border-box' }} />
                </div>
                <div style={{ padding: '8px 0 2px' }}>
                  <label style={{ fontSize: 12, color: '#1d1d1f', marginBottom: 4, display: 'block', fontFamily: SF }}>Alasan</label>
                  <textarea rows={2} value={overtimeValues.reason || ''} onChange={(e) => setOvertimeValues({ ...overtimeValues, reason: e.target.value })} placeholder="Alasan lembur..." style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: SF, background: '#ffffff', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <button onClick={handleCreateOvertime} style={{ width: '100%', padding: '11px 14px', border: 'none', background: 'transparent', color: '#007aff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF, textAlign: 'center' }}>Ajukan Lembur</button>
              </div>
              {overtimeData.length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', fontFamily: SF, marginBottom: 6, paddingLeft: 4 }}>Riwayat Lembur</div>
                  <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    {overtimeData.slice(0, 5).map((ot: any, i: number) => (
                      <GroupedRow key={ot.id || i} icon={<Hourglass size={14} />} iconBg={ot.status === 'approved' ? '#34c759' : ot.status === 'rejected' ? '#ff3b30' : '#ff9500'} label={ot.overtimeDate || '-'} value={`${ot.totalHours || 0} jam · ${ot.status || 'pending'}`} isLast={i === Math.min(overtimeData.length, 5) - 1} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ============ PAYROLL ============ */}
          {activeTab === 'payroll' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0 2px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gaji Bersih · {monthNames[now.getMonth()]} {now.getFullYear()}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.02em', marginTop: 2 }}>{formatRupiah(netSalary)}</div>
              </div>
              {totalPayroll ? (
                <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                  {totalPayroll.basicSalary != null && <GroupedRow icon={<CreditCard size={14} />} iconBg="#8e8e93" label="Gaji Pokok" value={formatRupiah(totalPayroll.basicSalary)} />}
                  {totalPayroll.allowances != null && <GroupedRow icon={<CreditCard size={14} />} iconBg="#34c759" label="Tunjangan" value={`+ ${formatRupiah(totalPayroll.allowances)}`} />}
                  {totalPayroll.deductions != null && <GroupedRow icon={<Shield size={14} />} iconBg="#ff9500" label="Potongan" value={`- ${formatRupiah(totalPayroll.deductions)}`} />}
                  {totalPayroll.bpjsDeduction != null && <GroupedRow icon={<Shield size={14} />} iconBg="#007aff" label="BPJS" value={`- ${formatRupiah(totalPayroll.bpjsDeduction)}`} />}
                  {totalPayroll.taxDeduction != null && <GroupedRow icon={<Shield size={14} />} iconBg="#5856d6" label="PPh 21" value={`- ${formatRupiah(totalPayroll.taxDeduction)}`} isLast />}
                </div>
              ) : (
                <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', padding: '16px 14px', fontSize: 12, color: '#8e8e93', fontFamily: SF, textAlign: 'center' }}>Belum ada data payroll bulan ini</div>
              )}
            </>
          )}

          {/* ============ SHIFTS ============ */}
          {activeTab === 'shifts' && (
            <>
              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                {shiftsList.length === 0 ? (
                  <div style={{ padding: '16px 14px', fontSize: 12, color: '#8e8e93', fontFamily: SF, textAlign: 'center' }}>Belum ada shift</div>
                ) : (
                  shiftsList.map((shift: any, i: number) => (
                    <GroupedRow key={shift.id || i} icon={<Clock size={14} />} iconBg="#5856d6" label={shift.name || '-'} value={`${shift.clockInTime || '-'} - ${shift.clockOutTime || '-'}`} isLast={i === shiftsList.length - 1} />
                  ))
                )}
              </div>
              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <button onClick={() => setShowShiftForm(true)} style={{ width: '100%', padding: '11px 14px', border: 'none', background: 'transparent', color: '#007aff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF, textAlign: 'center' }}>Tambah Shift</button>
              </div>
              {showShiftForm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowShiftForm(false)}>
                  <div style={{ background: 'white', borderRadius: 12, padding: 20, width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, fontFamily: SF, color: '#1d1d1f' }}>Tambah Shift</div>
                      <button onClick={() => setShowShiftForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={16} color="#8e8e93" /></button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Nama Shift<span style={{ color: '#ff3b30' }}> *</span></label><input type="text" value={shiftValues.name || ''} onChange={(e) => setShiftValues({ ...shiftValues, name: e.target.value })} placeholder="Shift Pagi" style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box' }} /></div>
                      <div><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Jam Masuk<span style={{ color: '#ff3b30' }}> *</span></label><input type="time" value={shiftValues.clockInTime || '07:00'} onChange={(e) => setShiftValues({ ...shiftValues, clockInTime: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box' }} /></div>
                      <div><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Jam Keluar<span style={{ color: '#ff3b30' }}> *</span></label><input type="time" value={shiftValues.clockOutTime || '15:00'} onChange={(e) => setShiftValues({ ...shiftValues, clockOutTime: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box' }} /></div>
                      <div><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Toleransi Terlambat (menit)</label><input type="number" min="0" max="120" value={shiftValues.lateGracePeriodMins || '15'} onChange={(e) => setShiftValues({ ...shiftValues, lateGracePeriodMins: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box' }} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
                      <button onClick={() => { setShowShiftForm(false); setShiftValues({}) }} style={{ padding: '7px 16px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', background: '#f5f5f5', color: '#1d1d1f', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Batal</button>
                      <button onClick={handleCreateShift} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: '#007aff', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Simpan</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ============ PROFILE ============ */}
          {activeTab === 'profile' && (() => {
            const q = listSearchQuery.toLowerCase()
            const profileFields = [
              { key: 'fullName', label: 'Nama Lengkap', value: userProfile?.fullName },
              { key: 'email', label: 'Email', value: userProfile?.email },
              { key: 'employeeId', label: 'NIK', value: userProfile?.employeeId },
              { key: 'department', label: 'Departemen', value: userProfile?.department },
              { key: 'dateOfBirth', label: 'Tanggal Lahir', value: userProfile?.dateOfBirth },
              { key: 'phoneNumber', label: 'Telepon', value: userProfile?.phoneNumber },
              { key: 'ktpNumber', label: 'No. KTP', value: userProfile?.ktpNumber },
              { key: 'address', label: 'Alamat', value: userProfile?.address },
            ]
            const filteredFields = !q ? profileFields : profileFields.filter(f => (f.label.toLowerCase().includes(q) || (f.value || '').toLowerCase().includes(q)))
            return (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0 2px', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'white', flexShrink: 0, boxShadow: '0 4px 14px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.08)', marginBottom: 10 }}>
                  {userName.charAt(0)}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.02em' }}>{userName}</div>
                <div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF, marginTop: 2 }}>{userProfile?.email || '-'} · {userProfile?.jobTitle || '-'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.06)', padding: '4px 8px' }}>
                <Search size={13} color="#8e8e93" />
                <input type="text" placeholder="Search employees..." value={listSearchQuery} onChange={(e) => setListSearchQuery(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 12, color: '#1d1d1f', fontFamily: SF }} />
              </div>
              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                {filteredFields.map((f, i) => (
                  <GroupedRow key={f.key} icon={<User size={14} />} iconBg="#8e8e93" label={f.label} value={f.value || '-'} isLast={i === filteredFields.length - 1} />
                ))}
              </div>
              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <button onClick={() => setShowEmployeeForm(true)} style={{ width: '100%', padding: '11px 14px', border: 'none', background: 'transparent', color: '#007aff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF, textAlign: 'center' }}>Tambah Karyawan</button>
              </div>
              {showEmployeeForm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowEmployeeForm(false)}>
                  <div style={{ background: 'white', borderRadius: 12, padding: 20, width: 380, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, fontFamily: SF, color: '#1d1d1f' }}>Tambah Karyawan</div>
                      <button onClick={() => setShowEmployeeForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={16} color="#8e8e93" /></button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[
                        { key: 'fullName', label: 'Nama Lengkap', type: 'text', required: true, placeholder: 'Budi Santoso' },
                        { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'budi@hub.com' },
                        { key: 'password', label: 'Password', type: 'password', required: true, placeholder: 'Min 6 karakter' },
                        { key: 'phoneNumber', label: 'Telepon', type: 'tel', placeholder: '+62 812-3456-7890' },
                        { key: 'dateOfBirth', label: 'Tanggal Lahir', type: 'date' },
                        { key: 'ktpNumber', label: 'No. KTP', type: 'text', placeholder: '3201234567890001' },
                        { key: 'address', label: 'Alamat Rumah', type: 'textarea', placeholder: 'Alamat lengkap...' },
                        { key: 'employeeId', label: 'NIP / ID Karyawan', type: 'text', placeholder: 'EMP-001' },
                        { key: 'jobTitle', label: 'Jabatan', type: 'text', placeholder: 'Staff HR' },
                        { key: 'department', label: 'Departemen', type: 'text', placeholder: 'Human Resources' },
                        { key: 'role', label: 'Role', type: 'select', options: [{ value: 'admin', label: 'Admin' }, { value: 'user', label: 'User' }, { value: 'viewer', label: 'Viewer' }] },
                        { key: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'suspended', label: 'Suspended' }] },
                      ].map((f) => (
                        <div key={f.key}>
                          <label style={{ fontSize: 12, fontWeight: 500, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>
                            {f.label}{f.required && <span style={{ color: '#ff3b30' }}> *</span>}
                          </label>
                          {f.type === 'select' ? (
                            <select value={employeeValues[f.key] || ''} onChange={(e) => setEmployeeValues({ ...employeeValues, [f.key]: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box', color: '#1d1d1f', background: 'white' }}>
                              <option value="">Pilih...</option>
                              {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          ) : f.type === 'textarea' ? (
                            <textarea rows={3} value={employeeValues[f.key] || ''} onChange={(e) => setEmployeeValues({ ...employeeValues, [f.key]: e.target.value })} placeholder={f.placeholder} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box', color: '#1d1d1f', resize: 'vertical' }} />
                          ) : (
                            <input type={f.type} value={employeeValues[f.key] || ''} onChange={(e) => setEmployeeValues({ ...employeeValues, [f.key]: e.target.value })} placeholder={f.placeholder} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box', color: '#1d1d1f' }} />
                          )}
                        </div>
                      ))}
                    </div>
                    {formError && <div style={{ fontSize: 12, color: '#ff3b30', fontFamily: SF, padding: '4px 0' }}>{formError}</div>}
                    <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
                      <button onClick={() => { setShowEmployeeForm(false); setEmployeeValues({}); setFormError(null) }} style={{ padding: '7px 16px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', background: '#f5f5f5', color: '#1d1d1f', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Batal</button>
                      <button onClick={handleCreateEmployee} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: '#007aff', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Simpan</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )})()}

        </div>
        )}
      </div>
    </div>
  )
}
