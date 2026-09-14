import { useState } from 'react'
import {
  Search, User, ShieldCheck, Sliders, Wifi, Bluetooth,
  Globe, Battery, Settings, Palette, Sparkles, Monitor, Sun, Bell,
  Volume2, Moon, Hourglass, Lock, Key, Laptop, RefreshCw, HardDrive,
  Airplay, Clock, Calendar, Shield, CreditCard, Cloud, Users, ShoppingBag,
  Smartphone, Camera, X
} from 'lucide-react'
import { ProjectCard } from './ProjectCard'
import { DockBar } from './DockBar'
import { usersApi } from '../lib/endpoints'
import { WindowShell } from './WindowShell'
import { ClientsContent } from './ClientsContent'
import { ProjectsContent } from './ProjectsContent'
import { DashboardWidgets } from './DashboardWidget'
import { RanpoAIContent } from './RanpoAIContent'
import { POSContent } from './POSContent'
import { BrowserContent } from './BrowserContent'

const PROJECTS = [
  { title: 'HRIS', anchorX: 6, anchorY: 10, thumbnail: 'https://cdn.jim-nielsen.com/macos/1024/swiftly-business-workspace-2025-04-26.png?rf=1024', isHRIS: true },
  { title: 'CRM', anchorX: 6, anchorY: 26, thumbnail: 'https://cdn.jim-nielsen.com/macos/1024/contacts-2025-11-13.png?rf=1024', isClients: true },
  { title: 'Projects', anchorX: 6, anchorY: 42, thumbnail: 'https://cdn.jim-nielsen.com/macos/1024/reminders-2025-11-14.png?rf=1024', isProjects: true },
  { title: 'Finance', anchorX: 6, anchorY: 58, thumbnail: 'https://cdn.jim-nielsen.com/macos/1024/stocks-2025-11-14.png?rf=1024', isFinance: true },
  { title: 'Procurement', anchorX: 6, anchorY: 74, thumbnail: 'https://cdn.jim-nielsen.com/macos/1024/1doc-word-processor-for-writer-2020-08-17.png?rf=1024', isProcurement: true },
  { title: 'Ranpo AI', anchorX: 16, anchorY: 26, thumbnail: 'https://cdn.jim-nielsen.com/macos/1024/gapplin-2025-04-04.png?rf=1024', isRanpoAI: true },
  { title: 'POS', anchorX: 16, anchorY: 42, thumbnail: 'https://cdn.jim-nielsen.com/macos/1024/expenses-spending-tracker-2025-04-26.png?rf=1024', isPOS: true },
  { title: 'Settings', anchorX: 16, anchorY: 58, thumbnail: 'https://cdn.jim-nielsen.com/macos/1024/system-settings-2025-11-14.png?rf=1024', isSettings: true },
  { title: 'Support', anchorX: 16, anchorY: 10, thumbnail: 'https://cdn.jim-nielsen.com/macos/1024/ip-address-monitor-2025-11-26.png?rf=1024', isSupport: true },
  { title: 'Assets', anchorX: 16, anchorY: 74, thumbnail: 'https://cdn.jim-nielsen.com/macos/1024/scapple-2026-05-18.png?rf=1024', isAssets: true },
  { title: 'Audit', anchorX: 26, anchorY: 10, thumbnail: 'https://cdn.jim-nielsen.com/macos/1024/daily-hours-time-tracker-2023-10-09.png?rf=1024', isAudit: true },
  { title: 'Catalog', anchorX: 26, anchorY: 26, thumbnail: 'https://cdn.jim-nielsen.com/macos/1024/pricetag-app-pricing-manager-2024-05-20.png?rf=1024', isCatalog: true },
  { title: 'Browser', anchorX: 26, anchorY: 42, thumbnail: 'https://cdn.jim-nielsen.com/macos/1024/safari-2025-11-14.png?rf=1024', isBrowser: true },
]

const BG_IMAGE = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260624_151236_784929aa-a992-4292-9938-1dd9b5296a29.png&w=1920&q=85'

const DOCK_ITEMS = [
  {
    label: 'HRIS',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/swiftly-business-workspace-2025-04-26.png?rf=1024',
    isApp: true,
  },
  {
    label: 'CRM',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/contacts-2025-11-13.png?rf=1024',
    isApp: true,
  },
  {
    label: 'Projects',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/reminders-2025-11-14.png?rf=1024',
    isApp: true,
  },
  {
    label: 'Finance',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/stocks-2025-11-14.png?rf=1024',
    isApp: true,
  },
  {
    label: 'Procurement',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/1doc-word-processor-for-writer-2020-08-17.png?rf=1024',
    isApp: true,
  },
  {
    label: 'Ranpo AI',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/gapplin-2025-04-04.png?rf=1024',
    isApp: true,
  },
  {
    label: 'POS',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/expenses-spending-tracker-2025-04-26.png?rf=1024',
    isApp: true,
  },
  {
    label: 'Support',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/ip-address-monitor-2025-11-26.png?rf=1024',
    isApp: true,
  },
  {
    label: 'Assets',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/scapple-2026-05-18.png?rf=1024',
    isApp: true,
  },
  {
    label: 'Audit',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/daily-hours-time-tracker-2023-10-09.png?rf=1024',
    isApp: true,
  },
  {
    label: 'Catalog',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/pricetag-app-pricing-manager-2024-05-20.png?rf=1024',
    isApp: true,
  },
  {
    label: 'Browser',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/safari-2025-11-14.png?rf=1024',
    isApp: true,
  },
  { label: 'divider', icon: '' },
  {
    label: 'Settings',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/system-settings-2025-11-14.png?rf=1024',
    isApp: true,
  },
  {
    label: 'Notes',
    icon: 'https://framerusercontent.com/images/4ar8CL6aUtjymV8jTsXrcPzXCM.svg',
  },
  { label: 'divider2', icon: '' },
  {
    label: 'Instagram',
    icon: 'https://framerusercontent.com/images/Q0Z0p8LOZhN2hJ2arLjEtkqQD0.png',
    href: 'https://www.instagram.com/',
  },
  {
    label: 'X',
    icon: 'https://framerusercontent.com/images/vjmmhizcqEgw5ZT5SNFQMpxD00.png',
    href: 'https://www.x.com/',
  },
  {
    label: 'Behance',
    icon: 'https://framerusercontent.com/images/edJkRGfjqjPajyxmEgsUCKVgjE.png',
    href: 'https://www.behance.com/',
  },
]


function NotesContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 24, margin: 0, letterSpacing: '-0.04em' }}>
        Notes
      </h2>
      <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 15, lineHeight: 1.7, color: 'rgb(89,89,91)', margin: 0 }}>
        "Photography is the story I fail to put into words."
      </p>
      <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 15, lineHeight: 1.7, color: 'rgb(89,89,91)', margin: 0 }}>
        Notes, ideas, and reflections on the craft.
      </p>
    </div>
  )
}

function HRISContent({ onClose, onMinimize, onMaximize }: { onClose: () => void; onMinimize: () => void; onMaximize?: () => void }) {
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
    } catch {} finally {}
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
    } catch {}
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
    } catch {}
  }, [])

  const loadOvertime = useCallback(async () => {
    try {
      const res = await overtimeApi.list()
      const ot = res?.overtimeRequests || res || []
      setOvertimeData(Array.isArray(ot) ? ot : [])
    } catch {}
  }, [])

  const loadPayroll = useCallback(async () => {
    try {
      const now = new Date()
      const listRes = await payrollApi.list({ month: now.getMonth() + 1, year: now.getFullYear() })
      const pl = listRes?.payrollRecords || listRes || []
      setPayrollList(Array.isArray(pl) ? pl : [])
    } catch {}
  }, [])

  const loadShifts = useCallback(async () => {
    try {
      const res = await shiftsApi.list()
      const sh = res?.shifts || res || []
      setShiftsList(Array.isArray(sh) ? sh : [])
    } catch {}
  }, [])

  const loadProfile = useCallback(async () => {
    try {
      const res = await usersApi.getMe()
      setUserProfile(res?.user || res || null)
    } catch {}
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
          {activeTab === 'profile' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0 2px', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'white', flexShrink: 0, boxShadow: '0 4px 14px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.08)', marginBottom: 10 }}>
                  {userName.charAt(0)}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.02em' }}>{userName}</div>
                <div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF, marginTop: 2 }}>{userProfile?.email || '-'} · {userProfile?.jobTitle || '-'}</div>
              </div>
              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <GroupedRow icon={<User size={14} />} iconBg="#8e8e93" label="NIK" value={userProfile?.employeeId || '-'} />
                <GroupedRow icon={<Users size={14} />} iconBg="#007aff" label="Departemen" value={userProfile?.department || '-'} />
                <GroupedRow icon={<Calendar size={14} />} iconBg="#34c759" label="Tanggal Lahir" value={userProfile?.dateOfBirth || '-'} />
                <GroupedRow icon={<Smartphone size={14} />} iconBg="#ff9500" label="Telepon" value={userProfile?.phoneNumber || '-'} />
                <GroupedRow icon={<User size={14} />} iconBg="#5856d6" label="No. KTP" value={userProfile?.ktpNumber || '-'} />
                <GroupedRow icon={<Users size={14} />} iconBg="#af52de" label="Alamat" value={userProfile?.address || '-'} isLast />
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
                    <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
                      <button onClick={() => { setShowEmployeeForm(false); setEmployeeValues({}) }} style={{ padding: '7px 16px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', background: '#f5f5f5', color: '#1d1d1f', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Batal</button>
                      <button onClick={handleCreateEmployee} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: '#007aff', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Simpan</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}

function FinanceContent({ onClose, onMinimize, onMaximize, onGreenMouseEnter, onGreenMouseLeave }: { onClose: () => void; onMinimize: () => void; onMaximize?: () => void; onGreenMouseEnter?: () => void; onGreenMouseLeave?: () => void }) {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'expenses' | 'budgets' | 'payments'>('dashboard')
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const iconBg: Record<string, string> = {
    dashboard: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)',
    invoices: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)',
    expenses: 'linear-gradient(135deg, #ff3b30 0%, #d70015 100%)',
    payments: 'linear-gradient(135deg, #30b0c7 0%, #00778a 100%)',
    budgets: 'linear-gradient(135deg, #af52de 0%, #892ab8 100%)',
  }

  const tabDesc: Record<string, string> = {
    dashboard: 'Ringkasan revenue, expenses, dan transaksi terbaru.',
    invoices: 'Kelola dan pantau semua invoice klien.',
    expenses: 'Catat dan pantau pengeluaran operasional.',
    payments: 'Pantau pembayaran yang sudah diterima.',
    budgets: 'Rencana dan realisasi budget departemen.',
  }

  const sidebarGroups: { label: string; items: { id: string; label: string }[] }[] = [
    { label: 'OVERVIEW', items: [{ id: 'dashboard' as const, label: 'Dashboard' }] },
    { label: 'TRANSACTIONS', items: [
      { id: 'invoices' as const, label: 'Invoices' },
      { id: 'expenses' as const, label: 'Expense' },
      { id: 'payments' as const, label: 'Payments' },
    ]},
    { label: 'PLANNING', items: [{ id: 'budgets' as const, label: 'Budget' }] },
  ]

  const iconPaths: Record<string, string> = {
    dashboard: 'M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z',
    invoices: 'M6 2h9l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1zm8 1v5h5M8 13h8M8 17h5',
    expenses: 'M2 5h20v14H2V5zm3 3h14M7 12h4',
    budgets: 'M3 20V10M9 20V6M15 20V14M21 20V4',
    payments: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
  }

  const btnSize = 12
  const btnGap = 8

  const allFinTabs = sidebarGroups.flatMap(g => g.items)
  const filteredGroups = sidebarGroups.map(g => ({ ...g, items: g.items.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase())) })).filter(g => g.items.length > 0)

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: SF, padding: 10, gap: 10 }}>
      {/* Sidebar */}
      <div style={{
        width: 220, flexShrink: 0,
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column',
        padding: '6px',
        overflowY: 'auto',
      }}>
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: btnGap, padding: '12px 10px 10px' }}>
          <div style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'close' ? '#ff5f57' : 'linear-gradient(180deg, #ff5f57 0%, #e0443e 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose} onMouseEnter={() => setHoveredBtn('close')} onMouseLeave={() => setHoveredBtn(null)}>
            {hoveredBtn === 'close' && <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 1L5 5M5 1L1 5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round"/></svg>}
          </div>
          <div style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'minimize' ? '#febc2e' : 'linear-gradient(180deg, #febc2e 0%, #dea123 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onMinimize} onMouseEnter={() => setHoveredBtn('minimize')} onMouseLeave={() => setHoveredBtn(null)}>
            {hoveredBtn === 'minimize' && <svg width="6" height="2" viewBox="0 0 6 2" fill="none"><path d="M1 1H5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round"/></svg>}
          </div>
          <div style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'maximize' ? '#28c840' : 'linear-gradient(180deg, #28c840 0%, #1aab29 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onMaximize} onMouseEnter={() => { setHoveredBtn('maximize'); onGreenMouseEnter?.() }} onMouseLeave={() => { setHoveredBtn(null); onGreenMouseLeave?.() }}>
            {hoveredBtn === 'maximize' && <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 3L3 1L5 3" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 3L3 5L5 3" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '0 6px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.06)', padding: '4px 8px' }}>
            <Search size={13} color="#8e8e93" />
            <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 12, color: '#1d1d1f', fontFamily: SF }} />
          </div>
        </div>

        {filteredGroups.map((group) => (
          <div key={group.label}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: SF }}>{group.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.items.map((tab) => {
                const active = activeTab === tab.id
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', padding: '5px 8px', borderRadius: 7, border: 'none', background: active ? '#007aff' : 'transparent', color: active ? 'white' : '#1d1d1f', fontSize: 13, fontWeight: active ? 500 : 400, cursor: 'pointer', transition: 'background 0.12s', textAlign: 'left', width: '100%', gap: 9, fontFamily: SF, letterSpacing: '-0.01em' }} onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }} onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                    <div style={{ width: 22, height: 22, borderRadius: 5, background: active ? 'rgba(255,255,255,0.25)' : iconBg[tab.id], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: active ? 'none' : '0 1px 2px rgba(0,0,0,0.12)' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d={iconPaths[tab.id]} fill="white" strokeWidth={0} /></svg>
                    </div>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
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

        {/* Section header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 24px 20px', textAlign: 'center' }}>
          <div style={{ width: 58, height: 58, borderRadius: 14, background: iconBg[activeTab], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.12), inset 0 0 0 0.5px rgba(255,255,255,0.3)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d={iconPaths[activeTab]} fill="white" strokeWidth={0} /></svg>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.02em', marginBottom: 4 }}>
            {(allFinTabs.find(t => t.id === activeTab) as { id: string; label: string } | undefined)?.label}
          </div>
          <div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF, maxWidth: 440, lineHeight: 1.4 }}>
            {tabDesc[activeTab]}
          </div>
        </div>

        <div style={{ padding: '0 24px 28px', maxWidth: 540, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ padding: 14, borderRadius: 10, background: '#f0fdf4', border: '0.5px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ fontSize: 10, color: '#16a34a', fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em' }}>Financials</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
                    <DonutChart
                      segs={[
                        { frac: 185 / 322, color: '#16a34a' },
                        { frac: 92 / 322, color: '#dc2626' },
                        { frac: 45 / 322, color: '#2563eb' },
                      ]}
                      centerTop={(v) => `Rp ${Math.round(v * 322)}jt`}
                      centerSub="total"
                    />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {[
                        { dot: '#16a34a', label: 'Revenue', value: 'Rp 185jt', color: '#15803d' },
                        { dot: '#dc2626', label: 'Expenses', value: 'Rp 92jt', color: '#b91c1c' },
                        { dot: '#2563eb', label: 'Outstanding', value: 'Rp 45jt', color: '#1d4ed8' },
                      ].map((row) => (
                        <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: row.dot, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: '#6b7280', fontFamily: SF, letterSpacing: '-0.01em' }}>{row.label}</span>
                          <div style={{ flex: 1 }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: row.color, fontFamily: SF }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ padding: 14, borderRadius: 8, background: '#f9fafb', border: '0.5px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8, fontFamily: SF, letterSpacing: '-0.01em' }}>Recent Transactions</div>
                  {[
                    { desc: 'Invoice #INV-001 - CV Berkah', amount: '+ Rp 12.500.000', color: '#16a34a' },
                    { desc: 'Material - Alderon Corp', amount: '- Rp 3.200.000', color: '#dc2626' },
                    { desc: 'Invoice #INV-002 - PT Maju', amount: '+ Rp 8.750.000', color: '#16a34a' },
                  ].map((tx, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 2 ? '0.5px solid rgba(0,0,0,0.06)' : 'none' }}>
                      <span style={{ fontSize: 12, color: '#6b7280', fontFamily: SF, letterSpacing: '-0.01em' }}>{tx.desc}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: tx.color, fontFamily: SF }}>{tx.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invoices */}
            {activeTab === 'invoices' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontFamily: SF, fontWeight: 600, fontSize: 14, margin: 0, color: '#1d1d1f', letterSpacing: '-0.01em' }}>Invoices</h3>
                  <button style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: '#007aff', color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: SF, letterSpacing: '-0.01em' }}>+ Invoice</button>
                </div>
                {[
                  { id: 'INV-001', client: 'CV Berkah Jaya', amount: 'Rp 12.500.000', status: 'Paid', date: '1 Sep 2026', statusColor: '#16a34a' },
                  { id: 'INV-002', client: 'PT Maju Bersama', amount: 'Rp 8.750.000', status: 'Pending', date: '5 Sep 2026', statusColor: '#f59e0b' },
                  { id: 'INV-003', client: 'CV Sinar Terang', amount: 'Rp 5.200.000', status: 'Overdue', date: '20 Aug 2026', statusColor: '#dc2626' },
                  { id: 'INV-004', client: 'PT Berkah Sejahtera', amount: 'Rp 18.000.000', status: 'Draft', date: '10 Sep 2026', statusColor: '#6b7280' },
                ].map((inv) => (
                  <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 8, background: '#f9fafb', border: '0.5px solid rgba(0,0,0,0.08)', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'} onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: '#1f2937', fontFamily: SF, letterSpacing: '-0.01em' }}>{inv.id}</div>
                      <div style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{inv.client}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: '#1f2937', fontFamily: SF }}>{inv.amount}</div>
                      <div style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{inv.date}</div>
                    </div>
                    <span style={{ padding: '2px 8px', borderRadius: 10, background: inv.statusColor + '18', color: inv.statusColor, fontSize: 10, fontWeight: 600, flexShrink: 0, fontFamily: SF, letterSpacing: '-0.01em' }}>{inv.status}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Expenses */}
            {activeTab === 'expenses' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontFamily: SF, fontWeight: 600, fontSize: 14, margin: 0, color: '#1d1d1f', letterSpacing: '-0.01em' }}>Expense Claims</h3>
                  <button style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: '#007aff', color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: SF, letterSpacing: '-0.01em' }}>+ Expense</button>
                </div>
                {[
                  { title: 'Material Bahan Bangunan', amount: 'Rp 3.200.000', category: 'Material', status: 'Approved', statusColor: '#16a34a' },
                  { title: 'Transport Proyek', amount: 'Rp 450.000', category: 'Transport', status: 'Pending', statusColor: '#f59e0b' },
                  { title: 'Makan Tim Lapangan', amount: 'Rp 280.000', category: 'Meals', status: 'Approved', statusColor: '#16a34a' },
                  { title: 'Sewa Alat Berat', amount: 'Rp 2.500.000', category: 'Equipment', status: 'Rejected', statusColor: '#dc2626' },
                ].map((exp, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 8, background: '#f9fafb', border: '0.5px solid rgba(0,0,0,0.08)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#8e8e93', flexShrink: 0, fontFamily: SF }}>
                      {exp.category === 'Material' ? 'M' : exp.category === 'Transport' ? 'T' : exp.category === 'Meals' ? 'F' : 'E'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: '#1f2937', fontFamily: SF, letterSpacing: '-0.01em' }}>{exp.title}</div>
                      <div style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{exp.category}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: '#1f2937', fontFamily: SF }}>{exp.amount}</div>
                      <span style={{ padding: '2px 6px', borderRadius: 8, background: exp.statusColor + '18', color: exp.statusColor, fontSize: 10, fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em' }}>{exp.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Budgets */}
            {activeTab === 'budgets' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h3 style={{ fontFamily: SF, fontWeight: 600, fontSize: 14, margin: 0, color: '#1d1d1f', letterSpacing: '-0.01em' }}>Department Budgets</h3>
                {[
                  { dept: 'Operations', budget: 50000000, used: 32000000 },
                  { dept: 'HR & Admin', budget: 25000000, used: 18500000 },
                  { dept: 'Project', budget: 120000000, used: 89000000 },
                  { dept: 'Marketing', budget: 15000000, used: 12500000 },
                ].map((b) => {
                  const pct = Math.round((b.used / b.budget) * 100)
                  return (
                    <div key={b.dept} style={{ padding: 12, borderRadius: 8, background: '#f9fafb', border: '0.5px solid rgba(0,0,0,0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 12, color: '#1f2937', fontFamily: SF, letterSpacing: '-0.01em' }}>{b.dept}</span>
                        <span style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{pct}% used</span>
                      </div>
                      <div style={{ width: '100%', height: 4, borderRadius: 2, background: '#e5e7eb', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: pct > 80 ? '#dc2626' : pct > 60 ? '#f59e0b' : '#007aff' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>
                        <span>Rp {(b.used / 1000000).toFixed(0)}jt used</span>
                        <span>Rp {(b.budget / 1000000).toFixed(0)}jt total</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Payments */}
            {activeTab === 'payments' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h3 style={{ fontFamily: SF, fontWeight: 600, fontSize: 14, margin: 0, color: '#1d1d1f', letterSpacing: '-0.01em' }}>Payments Received</h3>
                {[
                  { from: 'CV Berkah Jaya', invoice: 'INV-001', amount: 'Rp 12.500.000', date: '2 Sep 2026', method: 'Transfer' },
                  { from: 'PT Maju Bersama', invoice: 'INV-005', amount: 'Rp 6.300.000', date: '28 Aug 2026', method: 'Cash' },
                  { from: 'CV Sinar Terang', invoice: 'INV-003', amount: 'Rp 5.200.000', date: '1 Sep 2026', method: 'Transfer' },
                ].map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 8, background: '#f0fdf4', border: '0.5px solid rgba(0,0,0,0.08)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: '#1f2937', fontFamily: SF, letterSpacing: '-0.01em' }}>{p.from}</div>
                      <div style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{p.invoice} · {p.method}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: '#16a34a', fontFamily: SF }}>{p.amount}</div>
                      <div style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{p.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
  )
}

function ProcurementContent({ onClose, onMinimize, onMaximize }: { onClose: () => void; onMinimize: () => void; onMaximize?: () => void }) {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"
  const [activeTab, setActiveTab] = useState<'dashboard' | 'suppliers' | 'purchase-orders' | 'stock'>('dashboard')
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const iconBg: Record<string, string> = {
    dashboard: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)',
    suppliers: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)',
    'purchase-orders': 'linear-gradient(135deg, #ff9500 0%, #c06a00 100%)',
    stock: 'linear-gradient(135deg, #5856d6 0%, #3634a3 100%)',
  }

  const tabDesc: Record<string, string> = {
    dashboard: 'Ringkasan supplier aktif, PO pending, dan stok.',
    suppliers: 'Kelola daftar supplier dan kontak pengadaan.',
    'purchase-orders': 'Buat dan pantau purchase orders.',
    stock: 'Pantau stok barang dan pergerakannya.',
  }

  const tabMeta: Record<string, { label: string; group: string; labelAbove?: string }> = {
    'dashboard':        { label: 'Dashboard',       group: 'OVERVIEW' },
    'suppliers':        { label: 'Suppliers',       group: 'SOURCING', labelAbove: 'SOURCING' },
    'purchase-orders':  { label: 'Purchase Orders', group: 'SOURCING' },
    'stock':            { label: 'Stock',           group: 'INVENTORY', labelAbove: 'INVENTORY' },
  }

  const iconFor = (id: string, active: boolean) => {
    const fill = active ? 'white' : '#8e8e93'
    const icons: Record<string, React.ReactNode> = {
      dashboard: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" fill={fill} /><rect x="14" y="3" width="7" height="7" rx="1.5" fill={fill} /><rect x="3" y="14" width="7" height="7" rx="1.5" fill={fill} /><rect x="14" y="14" width="7" height="7" rx="1.5" fill={fill} /></svg>),
      suppliers: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 21V9l9-6 9 6v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" fill={fill} /><path d="M9 21V13h6v8" fill={active ? 'rgba(255,255,255,0.3)' : 'rgba(142,142,147,0.3)'} /></svg>),
      'purchase-orders': (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill={fill} /><path d="M14 2v6h6" fill={active ? 'rgba(255,255,255,0.3)' : 'rgba(142,142,147,0.3)'} /><line x1="8" y1="13" x2="16" y2="13" stroke={active ? 'rgba(255,255,255,0.6)' : 'rgba(142,142,147,0.6)'} strokeWidth="1.5" /><line x1="8" y1="17" x2="13" y2="17" stroke={active ? 'rgba(255,255,255,0.6)' : 'rgba(142,142,147,0.6)'} strokeWidth="1.5" /></svg>),
      stock: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill={fill} /><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke={active ? 'rgba(255,255,255,0.4)' : 'rgba(142,142,147,0.4)'} strokeWidth="1.5" fill="none" /></svg>),
    }
    return icons[id] || null
  }

  const groupedTabs = [
    { group: 'OVERVIEW', items: ['dashboard'] },
    { group: 'SOURCING', items: ['suppliers', 'purchase-orders'] },
    { group: 'INVENTORY', items: ['stock'] },
  ]

  const btnSize = 12
  const btnGap = 8

  const filteredGroupedTabs = groupedTabs.map(g => ({ ...g, items: g.items.filter(id => tabMeta[id].label.toLowerCase().includes(searchQuery.toLowerCase())) })).filter(g => g.items.length > 0)

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: SF, padding: 10, gap: 10 }}>
      {/* Sidebar */}
      <div style={{
        width: 220, flexShrink: 0,
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column',
        padding: '6px',
        overflowY: 'auto',
      }}>
        {/* Traffic lights */}
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

        {/* Search */}
        <div style={{ padding: '0 6px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.06)', padding: '4px 8px' }}>
            <Search size={13} color="#8e8e93" />
            <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 12, color: '#1d1d1f', fontFamily: SF }} />
          </div>
        </div>

        {filteredGroupedTabs.map((group) => (
          <div key={group.group}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', padding: '4px 10px', letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: SF }}>{group.group}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.items.map((id) => {
                const active = activeTab === id
                return (
                  <button key={id} onClick={() => setActiveTab(id as any)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 8px', width: '100%', borderRadius: 7, border: 'none', background: active ? '#007aff' : 'transparent', color: active ? 'white' : '#1d1d1f', fontSize: 13, fontWeight: active ? 500 : 400, cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s', fontFamily: SF, letterSpacing: '-0.01em' }} onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }} onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                    <div style={{ width: 22, height: 22, borderRadius: 5, background: active ? 'rgba(255,255,255,0.25)' : iconBg[id], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: active ? 'none' : '0 1px 2px rgba(0,0,0,0.12)' }}>
                      {iconFor(id, true)}
                    </div>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tabMeta[id].label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
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

        {/* Section header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 24px 20px', textAlign: 'center' }}>
          <div style={{ width: 58, height: 58, borderRadius: 14, background: iconBg[activeTab], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.12), inset 0 0 0 0.5px rgba(255,255,255,0.3)' }}>
            {iconFor(activeTab, true)}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.02em', marginBottom: 4 }}>
            {tabMeta[activeTab].label}
          </div>
          <div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF, maxWidth: 440, lineHeight: 1.4 }}>
            {tabDesc[activeTab]}
          </div>
        </div>

        <div style={{ padding: '0 24px 28px', maxWidth: 540, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div style={{ padding: 14, borderRadius: 8, background: '#f0fdf4', border: '0.5px solid rgba(0,0,0,0.08)' }}>
                    <div style={{ fontSize: 10, color: '#16a34a', fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em' }}>Active Suppliers</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#15803d', fontFamily: SF, marginTop: 2 }}>12</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 8, background: '#fef2f2', border: '0.5px solid rgba(0,0,0,0.08)' }}>
                    <div style={{ fontSize: 10, color: '#dc2626', fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em' }}>Pending PO</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#b91c1c', fontFamily: SF, marginTop: 2 }}>5</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 8, background: '#eff6ff', border: '0.5px solid rgba(0,0,0,0.08)' }}>
                    <div style={{ fontSize: 10, color: '#2563eb', fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em' }}>Stock Items</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#1d4ed8', fontFamily: SF, marginTop: 2 }}>48</div>
                  </div>
                </div>
                <div style={{ padding: 14, borderRadius: 8, background: '#f9fafb', border: '0.5px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8, fontFamily: SF, letterSpacing: '-0.01em' }}>Recent Orders</div>
                  {[
                    { id: 'PO-001', supplier: 'Toko Bangunan Jaya', amount: 'Rp 15.200.000', status: 'Delivered', statusColor: '#16a34a' },
                    { id: 'PO-002', supplier: 'CV Logam Mulia', amount: 'Rp 8.500.000', status: 'Shipped', statusColor: '#3b82f6' },
                    { id: 'PO-003', supplier: 'PT Cat Indonesia', amount: 'Rp 3.800.000', status: 'Pending', statusColor: '#f59e0b' },
                  ].map((order, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < 2 ? '0.5px solid rgba(0,0,0,0.06)' : 'none' }}>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#1f2937', fontFamily: SF, letterSpacing: '-0.01em' }}>{order.id}</span>
                        <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 8, fontFamily: SF }}>{order.supplier}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: '#1f2937', fontFamily: SF }}>{order.amount}</span>
                        <span style={{ padding: '2px 8px', borderRadius: 10, background: order.statusColor + '18', color: order.statusColor, fontSize: 10, fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em' }}>{order.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suppliers */}
            {activeTab === 'suppliers' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontFamily: SF, fontWeight: 600, fontSize: 14, margin: 0, color: '#1d1d1f', letterSpacing: '-0.01em' }}>Suppliers</h3>
                  <button style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: '#007aff', color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: SF, letterSpacing: '-0.01em' }}>+ Supplier</button>
                </div>
                {[
                  { name: 'Toko Bangunan Jaya', category: 'Material', contact: 'Pak Budi', phone: '0812-3456-7890', status: 'Active' },
                  { name: 'CV Logam Mulia', category: 'Logam', contact: 'Ibu Sari', phone: '0856-7890-1234', status: 'Active' },
                  { name: 'PT Cat Indonesia', category: 'Finishing', contact: 'Pak Andi', phone: '0878-9012-3456', status: 'Active' },
                  { name: 'CV Sinar Jaya', category: 'Material', contact: 'Pak Dodi', phone: '0813-5678-9012', status: 'Inactive' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 8, background: '#f9fafb', border: '0.5px solid rgba(0,0,0,0.08)', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'} onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}>
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#8e8e93', flexShrink: 0, fontFamily: SF }}>
                      {s.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: '#1f2937', fontFamily: SF, letterSpacing: '-0.01em' }}>{s.name}</div>
                      <div style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{s.contact} · {s.phone}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 10, background: s.status === 'Active' ? '#dcfce7' : '#f3f4f6', color: s.status === 'Active' ? '#166534' : '#6b7280', fontSize: 10, fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em' }}>{s.status}</span>
                      <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2, fontFamily: SF }}>{s.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Purchase Orders */}
            {activeTab === 'purchase-orders' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontFamily: SF, fontWeight: 600, fontSize: 14, margin: 0, color: '#1d1d1f', letterSpacing: '-0.01em' }}>Purchase Orders</h3>
                  <button style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: '#007aff', color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: SF, letterSpacing: '-0.01em' }}>+ PO</button>
                </div>
                {[
                  { id: 'PO-001', supplier: 'Toko Bangunan Jaya', date: '1 Sep 2026', amount: 'Rp 15.200.000', items: 8, status: 'Delivered', statusColor: '#16a34a' },
                  { id: 'PO-002', supplier: 'CV Logam Mulia', date: '5 Sep 2026', amount: 'Rp 8.500.000', items: 3, status: 'Shipped', statusColor: '#3b82f6' },
                  { id: 'PO-003', supplier: 'PT Cat Indonesia', date: '8 Sep 2026', amount: 'Rp 3.800.000', items: 5, status: 'Pending', statusColor: '#f59e0b' },
                  { id: 'PO-004', supplier: 'Toko Bangunan Jaya', date: '10 Sep 2026', amount: 'Rp 22.100.000', items: 12, status: 'Draft', statusColor: '#6b7280' },
                ].map((po) => (
                  <div key={po.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 8, background: '#f9fafb', border: '0.5px solid rgba(0,0,0,0.08)', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'} onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: '#1f2937', fontFamily: SF, letterSpacing: '-0.01em' }}>{po.id}</div>
                      <div style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{po.supplier} · {po.items} items</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: '#1f2937', fontFamily: SF }}>{po.amount}</div>
                      <div style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{po.date}</div>
                    </div>
                    <span style={{ padding: '2px 8px', borderRadius: 10, background: po.statusColor + '18', color: po.statusColor, fontSize: 10, fontWeight: 600, flexShrink: 0, fontFamily: SF, letterSpacing: '-0.01em' }}>{po.status}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Stock */}
            {activeTab === 'stock' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h3 style={{ fontFamily: SF, fontWeight: 600, fontSize: 14, margin: 0, color: '#1d1d1f', letterSpacing: '-0.01em' }}>Stock Inventory</h3>
                {[
                  { name: 'Alderon Sheet', sku: 'ALD-001', qty: 120, unit: 'lembar', min: 50, status: 'safe' },
                  { name: 'Besi Hollow 4x4', sku: 'BES-002', qty: 45, unit: 'batang', min: 30, status: 'safe' },
                  { name: 'Cat Tembok Putih', sku: 'CAT-003', qty: 8, unit: 'kaleng', min: 10, status: 'low' },
                  { name: 'Semen Portland', sku: 'SEM-004', qty: 200, unit: 'karung', min: 50, status: 'safe' },
                  { name: 'Paku 5cm', sku: 'PAK-005', qty: 3, unit: 'kg', min: 5, status: 'low' },
                ].map((item) => (
                  <div key={item.sku} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 8, background: '#f9fafb', border: '0.5px solid rgba(0,0,0,0.08)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: item.status === 'low' ? '#fef2f2' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: item.status === 'low' ? '#dc2626' : '#16a34a', flexShrink: 0, fontFamily: SF }}>
                      {item.sku.split('-')[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: '#1f2937', fontFamily: SF, letterSpacing: '-0.01em' }}>{item.name}</div>
                      <div style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{item.sku}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: item.status === 'low' ? '#dc2626' : '#1f2937', fontFamily: SF }}>{item.qty} {item.unit}</div>
                      <div style={{ fontSize: 10, color: item.status === 'low' ? '#dc2626' : '#6b7280', fontFamily: SF, letterSpacing: '-0.01em' }}>min: {item.min}</div>
                    </div>
                    <span style={{ padding: '2px 8px', borderRadius: 10, background: item.status === 'low' ? '#fee2e2' : '#dcfce7', color: item.status === 'low' ? '#991b1b' : '#166534', fontSize: 10, fontWeight: 600, flexShrink: 0, fontFamily: SF, letterSpacing: '-0.01em' }}>
                      {item.status === 'low' ? 'Low' : 'Safe'}
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
  )
}

function SupportContent({ onClose, onMinimize, onMaximize, onGreenMouseEnter, onGreenMouseLeave }: { onClose: () => void; onMinimize: () => void; onMaximize?: () => void; onGreenMouseEnter?: () => void; onGreenMouseLeave?: () => void }) {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"
  const [activeTab, setActiveTab] = useState<string>('all')
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const iconBg: Record<string, string> = {
    all: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)',
    open: 'linear-gradient(135deg, #ff3b30 0%, #d70015 100%)',
    in_progress: 'linear-gradient(135deg, #ff9500 0%, #c06a00 100%)',
    resolved: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)',
    closed: 'linear-gradient(135deg, #8e8e93 0%, #636366 100%)',
    bug: 'linear-gradient(135deg, #ff3b30 0%, #d70015 100%)',
    complaint: 'linear-gradient(135deg, #ff9500 0%, #c06a00 100%)',
    feature_request: 'linear-gradient(135deg, #af52de 0%, #892ab8 100%)',
    billing_issue: 'linear-gradient(135deg, #30b0c7 0%, #00778a 100%)',
  }

  const tabDesc: Record<string, string> = {
    all: 'Semua tiket support dari klien.',
    open: 'Tiket yang baru masuk dan belum ditangani.',
    in_progress: 'Tiket yang sedang dikerjakan tim.',
    resolved: 'Tiket yang sudah diselesaikan.',
    closed: 'Tiket yang sudah ditutup.',
    bug: 'Laporan bug dan error aplikasi.',
    complaint: 'Keluhan dan komplain klien.',
    feature_request: 'Permintaan fitur baru.',
    billing_issue: 'Masalah tagihan dan pembayaran.',
  }

  const sidebarGroups: { label: string; items: { id: string; label: string; count?: number }[] }[] = [
    { label: 'TICKETS', items: [
      { id: 'all' as const, label: 'All Tickets', count: 24 },
      { id: 'open' as const, label: 'Open', count: 8 },
      { id: 'in_progress' as const, label: 'In Progress', count: 6 },
      { id: 'resolved' as const, label: 'Resolved', count: 7 },
      { id: 'closed' as const, label: 'Closed', count: 3 },
    ]},
    { label: 'CATEGORIES', items: [
      { id: 'bug' as const, label: 'Bug Report', count: 9 },
      { id: 'complaint' as const, label: 'Complaint', count: 5 },
      { id: 'feature_request' as const, label: 'Feature Request', count: 6 },
      { id: 'billing_issue' as const, label: 'Billing Issue', count: 4 },
    ]},
  ]

  const iconPaths: Record<string, string> = {
    all: 'M4 6h16M4 12h16M4 18h16',
    open: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
    in_progress: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    resolved: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    closed: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z',
    bug: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
    complaint: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
    feature_request: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
    billing_issue: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
  }

  const priorityColor: Record<string, string> = {
    low: '#34c759',
    medium: '#ff9500',
    high: '#ff3b30',
    critical: '#af52de',
  }

  const statusColor: Record<string, string> = {
    open: '#007aff',
    in_progress: '#ff9500',
    resolved: '#34c759',
    closed: '#8e8e93',
  }

  const MOCK_TICKETS = [
    { id: 'TKT-001', subject: 'Login timeout on mobile app', client: 'PT Maju Jaya', priority: 'high', status: 'open', category: 'bug', assignee: 'Budi', created: '2 Sep 2026', sla: '4 Sep 2026' },
    { id: 'TKT-002', subject: 'Cannot export invoice to PDF', client: 'CV Berkah Jaya', priority: 'critical', status: 'in_progress', category: 'bug', assignee: 'Siti', created: '1 Sep 2026', sla: '2 Sep 2026' },
    { id: 'TKT-003', subject: 'Request for dark mode feature', client: 'PT Sejahtera', priority: 'low', status: 'open', category: 'feature_request', assignee: null, created: '30 Aug 2026', sla: '6 Sep 2026' },
    { id: 'TKT-004', subject: 'Duplicate billing on September invoice', client: 'PT Maju Jaya', priority: 'high', status: 'in_progress', category: 'billing_issue', assignee: 'Andi', created: '28 Aug 2026', sla: '1 Sep 2026' },
    { id: 'TKT-005', subject: 'Slow page load on dashboard', client: 'CV Berkah Jaya', priority: 'medium', status: 'resolved', category: 'bug', assignee: 'Budi', created: '25 Aug 2026', sla: '28 Aug 2026' },
    { id: 'TKT-006', subject: 'Delivery delay complaint', client: 'PT Abadi', priority: 'medium', status: 'open', category: 'complaint', assignee: null, created: '1 Sep 2026', sla: '4 Sep 2026' },
    { id: 'TKT-007', subject: 'Cannot upload receipt image', client: 'PT Sejahtera', priority: 'low', status: 'closed', category: 'bug', assignee: 'Siti', created: '20 Aug 2026', sla: '23 Aug 2026' },
    { id: 'TKT-008', subject: 'Overcharge on service fee', client: 'CV Berkah Jaya', priority: 'critical', status: 'open', category: 'billing_issue', assignee: 'Andi', created: '3 Sep 2026', sla: '4 Sep 2026' },
  ]

  const filteredTickets = activeTab === 'all'
    ? MOCK_TICKETS
    : activeTab === 'bug' || activeTab === 'complaint' || activeTab === 'feature_request' || activeTab === 'billing_issue'
      ? MOCK_TICKETS.filter(t => t.category === activeTab)
      : MOCK_TICKETS.filter(t => t.status === activeTab)

  const btnSize = 12
  const btnGap = 8

  const filteredSidebarGroups = sidebarGroups.map(g => ({ ...g, items: g.items.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase())) })).filter(g => g.items.length > 0)
  const allSupTabs = sidebarGroups.flatMap(g => g.items)

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: SF, padding: 10, gap: 10 }}>
      {/* Sidebar */}
      <div style={{
        width: 220, flexShrink: 0,
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column',
        padding: '6px',
        overflowY: 'auto',
      }}>
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: btnGap, padding: '12px 10px 10px' }}>
          <div style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'close' ? '#ff5f57' : 'linear-gradient(180deg, #ff5f57 0%, #e0443e 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose} onMouseEnter={() => setHoveredBtn('close')} onMouseLeave={() => setHoveredBtn(null)}>
            {hoveredBtn === 'close' && <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 1L5 5M5 1L1 5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round"/></svg>}
          </div>
          <div style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'minimize' ? '#febc2e' : 'linear-gradient(180deg, #febc2e 0%, #dea123 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onMinimize} onMouseEnter={() => setHoveredBtn('minimize')} onMouseLeave={() => setHoveredBtn(null)}>
            {hoveredBtn === 'minimize' && <svg width="6" height="2" viewBox="0 0 6 2" fill="none"><path d="M1 1H5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round"/></svg>}
          </div>
          <div style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'maximize' ? '#28c840' : 'linear-gradient(180deg, #28c840 0%, #1aab29 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onMaximize} onMouseEnter={() => { setHoveredBtn('maximize'); onGreenMouseEnter?.() }} onMouseLeave={() => { setHoveredBtn(null); onGreenMouseLeave?.() }}>
            {hoveredBtn === 'maximize' && <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 3L3 1L5 3" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 3L3 5L5 3" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '0 6px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.06)', padding: '4px 8px' }}>
            <Search size={13} color="#8e8e93" />
            <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 12, color: '#1d1d1f', fontFamily: SF }} />
          </div>
        </div>

        {filteredSidebarGroups.map((group) => (
          <div key={group.label}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: SF }}>{group.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.items.map((item) => {
                const active = activeTab === item.id
                return (
                  <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 8px', borderRadius: 7, border: 'none', background: active ? '#007aff' : 'transparent', color: active ? 'white' : '#1d1d1f', fontSize: 13, fontWeight: active ? 500 : 400, cursor: 'pointer', transition: 'background 0.12s', textAlign: 'left', width: '100%', gap: 9, fontFamily: SF, letterSpacing: '-0.01em' }} onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }} onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 5, background: active ? 'rgba(255,255,255,0.25)' : iconBg[item.id], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: active ? 'none' : '0 1px 2px rgba(0,0,0,0.12)' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d={iconPaths[item.id]} fill="white" strokeWidth={0} /></svg>
                      </div>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span style={{ fontSize: 10, fontWeight: 500, color: active ? 'rgba(255,255,255,0.7)' : '#8e8e93', fontFamily: SF }}>{item.count}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
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

        {/* Section header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 24px 20px', textAlign: 'center' }}>
          <div style={{ width: 58, height: 58, borderRadius: 14, background: iconBg[activeTab] || 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.12), inset 0 0 0 0.5px rgba(255,255,255,0.3)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d={iconPaths[activeTab] || iconPaths.all} fill="white" strokeWidth={0} /></svg>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.02em', marginBottom: 4 }}>
            {(allSupTabs.find(t => t.id === activeTab) as { id: string; label: string } | undefined)?.label || 'Support Tickets'}
          </div>
          <div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF, maxWidth: 440, lineHeight: 1.4 }}>
            {tabDesc[activeTab] || 'Kelola tiket support klien.'}
          </div>
        </div>

        <div style={{ padding: '0 24px 28px', maxWidth: 540, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Open', value: '8', color: '#007aff', bg: '#f0f7ff' },
              { label: 'In Progress', value: '6', color: '#ff9500', bg: '#fff8f0' },
              { label: 'Resolved', value: '7', color: '#34c759', bg: '#f0fdf4' },
              { label: 'Critical', value: '2', color: '#af52de', bg: '#f8f0ff' },
            ].map((s) => (
              <div key={s.label} style={{ padding: 14, borderRadius: 8, background: s.bg, border: '0.5px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 10, color: s.color, fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em' }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: SF, marginTop: 2 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Ticket list */}
          <div style={{ background: 'white', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            {filteredTickets.map((ticket, i) => (
              <div key={ticket.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: i < filteredTickets.length - 1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none', cursor: 'pointer', background: selectedTicket === ticket.id ? '#f5f5f7' : 'transparent' }} onClick={() => setSelectedTicket(ticket.id)} onMouseEnter={(e) => { if (selectedTicket !== ticket.id) e.currentTarget.style.background = '#fafafa' }} onMouseLeave={(e) => { if (selectedTicket !== ticket.id) e.currentTarget.style.background = selectedTicket === ticket.id ? '#f5f5f7' : 'transparent' }}>
                {/* Priority indicator */}
                <div style={{ width: 4, height: 32, borderRadius: 2, background: priorityColor[ticket.priority], flexShrink: 0 }} />

                {/* Ticket info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{ticket.id}</span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: statusColor[ticket.status] + '18', color: statusColor[ticket.status], fontWeight: 500, fontFamily: SF }}>{ticket.status.replace('_', ' ')}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ticket.subject}</div>
                  <div style={{ fontSize: 11, color: '#8e8e93', fontFamily: SF, marginTop: 2, letterSpacing: '-0.01em' }}>{ticket.client}</div>
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{ticket.created}</span>
                  {ticket.assignee && <span style={{ fontSize: 10, color: '#007aff', fontFamily: SF, letterSpacing: '-0.01em' }}>{ticket.assignee}</span>}
                  {!ticket.assignee && <span style={{ fontSize: 10, color: '#ff3b30', fontFamily: SF, letterSpacing: '-0.01em', fontWeight: 500 }}>Unassigned</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AssetsContent({ onClose, onMinimize, onMaximize }: { onClose: () => void; onMinimize: () => void; onMaximize?: () => void }) {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"
  const [activeTab, setActiveTab] = useState<string>('all')
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)

  const sidebarGroups = [
    { label: 'STATUS', items: [
      { id: 'all' as const, label: 'All Assets', count: 18 },
      { id: 'available' as const, label: 'Available', count: 7 },
      { id: 'in_use' as const, label: 'In Use', count: 8 },
      { id: 'under_maintenance' as const, label: 'Maintenance', count: 2 },
      { id: 'broken' as const, label: 'Broken', count: 1 },
    ]},
    { label: 'CATEGORY', items: [
      { id: 'electronics' as const, label: 'Electronics', count: 9 },
      { id: 'furniture' as const, label: 'Furniture', count: 4 },
      { id: 'vehicles' as const, label: 'Vehicles', count: 2 },
      { id: 'tools' as const, label: 'Tools', count: 3 },
    ]},
  ]

  const iconPaths: Record<string, string> = {
    all: 'M4 6h16M4 12h16M4 18h16',
    available: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    in_use: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
    under_maintenance: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    broken: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z',
    electronics: 'M4 6h16M4 12h16M4 18h16',
    furniture: 'M4 6h16M4 12h16M4 18h16',
    vehicles: 'M4 6h16M4 12h16M4 18h16',
    tools: 'M4 6h16M4 12h16M4 18h16',
  }

  const iconBg: Record<string, string> = {
    all: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)',
    available: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)',
    in_use: 'linear-gradient(135deg, #30b0c7 0%, #00778a 100%)',
    under_maintenance: 'linear-gradient(135deg, #ff9500 0%, #c06a00 100%)',
    broken: 'linear-gradient(135deg, #ff3b30 0%, #d70015 100%)',
    electronics: 'linear-gradient(135deg, #5856d6 0%, #3634a3 100%)',
    furniture: 'linear-gradient(135deg, #af52de 0%, #892ab8 100%)',
    vehicles: 'linear-gradient(135deg, #8e8e93 0%, #636366 100%)',
    tools: 'linear-gradient(135deg, #1c1c1e 0%, #3a3a3c 100%)',
  }

  const statusColor: Record<string, string> = {
    available: '#34c759',
    in_use: '#007aff',
    under_maintenance: '#ff9500',
    broken: '#ff3b30',
    disposed: '#8e8e93',
    lost: '#af52de',
  }

  const tabDesc: Record<string, string> = {
    all: 'Semua aset perusahaan dalam satu tempat.',
    available: 'Aset siap pakai dan belum dipinjam.',
    in_use: 'Aset yang sedang dipakai karyawan.',
    under_maintenance: 'Aset dalam perbaikan / servis.',
    broken: 'Aset rusak dan butuh tindak lanjut.',
    electronics: 'Laptop, monitor, dan perangkat elektronik.',
    furniture: 'Meja, kursi, dan perabot kantor.',
    vehicles: 'Kendaraan operasional perusahaan.',
    tools: 'Perkakas dan alat kerja lapangan.',
  }

  const MOCK_ASSETS = [
    { id: 'AST-001', code: 'LT-2024-001', name: 'MacBook Pro 16"', category: 'electronics', location: 'Kantor Pusat · Lt 2', status: 'in_use', condition: 'good', assignee: 'Budi', cost: 'Rp 38jt' },
    { id: 'AST-002', code: 'MN-2024-014', name: 'Monitor LG 27" 4K', category: 'electronics', location: 'Kantor Pusat · Lt 2', status: 'in_use', condition: 'good', assignee: 'Siti', cost: 'Rp 4,5jt' },
    { id: 'AST-003', code: 'LT-2023-008', name: 'ThinkPad X1 Carbon', category: 'electronics', location: 'Gudang IT', status: 'available', condition: 'good', assignee: null, cost: 'Rp 24jt' },
    { id: 'AST-004', code: 'VH-2022-002', name: 'Toyota Hiace Operasional', category: 'vehicles', location: 'Pool Bintaro', status: 'in_use', condition: 'fair', assignee: 'Tim Lapangan', cost: 'Rp 480jt' },
    { id: 'AST-005', code: 'TL-2024-031', name: 'Mesin Las Lakoni 900W', category: 'tools', location: 'Workshop', status: 'under_maintenance', condition: 'damaged', assignee: null, cost: 'Rp 2,1jt' },
    { id: 'AST-006', code: 'FR-2023-011', name: 'Meja Kerja L-Shape', category: 'furniture', location: 'Kantor Pusat · Lt 1', status: 'available', condition: 'new', assignee: null, cost: 'Rp 1,8jt' },
    { id: 'AST-007', code: 'PR-2024-003', name: 'Printer Epson L6270', category: 'electronics', location: 'Kantor Pusat · Lt 1', status: 'broken', condition: 'damaged', assignee: null, cost: 'Rp 3,4jt' },
    { id: 'AST-008', code: 'TL-2023-019', name: 'Gerinda Makita 9553', category: 'tools', location: 'Workshop', status: 'in_use', condition: 'fair', assignee: 'Andi', cost: 'Rp 950rb' },
  ]

  const filteredAssets = activeTab === 'all'
    ? MOCK_ASSETS
    : ['available', 'in_use', 'under_maintenance', 'broken'].includes(activeTab)
      ? MOCK_ASSETS.filter(a => a.status === activeTab)
      : MOCK_ASSETS.filter(a => a.category === activeTab)

  const filteredSidebarGroups = sidebarGroups.map(g => ({ ...g, items: g.items.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase())) })).filter(g => g.items.length > 0)
  const allAssetTabs = sidebarGroups.flatMap(g => g.items)

  const btnSize = 12
  const btnGap = 8

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: SF, padding: 10, gap: 10 }}>
      {/* Sidebar */}
      <div style={{
        width: 220, flexShrink: 0,
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column',
        padding: '6px',
        overflowY: 'auto',
      }}>
        {/* Traffic lights */}
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

        {/* Search */}
        <div style={{ padding: '0 6px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.06)', padding: '4px 8px' }}>
            <Search size={13} color="#8e8e93" />
            <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 12, color: '#1d1d1f', fontFamily: SF }} />
          </div>
        </div>

        {filteredSidebarGroups.map((group) => (
          <div key={group.label}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: SF }}>{group.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.items.map((item) => {
                const active = activeTab === item.id
                return (
                  <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 8px', borderRadius: 7, border: 'none', background: active ? '#007aff' : 'transparent', color: active ? 'white' : '#1d1d1f', fontSize: 13, fontWeight: active ? 500 : 400, cursor: 'pointer', transition: 'background 0.12s', textAlign: 'left', width: '100%', gap: 9, fontFamily: SF, letterSpacing: '-0.01em' }} onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }} onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 5, background: active ? 'rgba(255,255,255,0.25)' : iconBg[item.id], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: active ? 'none' : '0 1px 2px rgba(0,0,0,0.12)' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d={iconPaths[item.id]} fill="white" strokeWidth={0} /></svg>
                      </div>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span style={{ fontSize: 10, fontWeight: 500, color: active ? 'rgba(255,255,255,0.7)' : '#8e8e93', fontFamily: SF }}>{item.count}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
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

        {/* Section header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 24px 20px', textAlign: 'center' }}>
          <div style={{ width: 58, height: 58, borderRadius: 14, background: iconBg[activeTab] || 'linear-gradient(135deg, #5856d6 0%, #3634a3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.12), inset 0 0 0 0.5px rgba(255,255,255,0.3)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d={iconPaths[activeTab] || iconPaths.all} fill="white" strokeWidth={0} /></svg>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.02em', marginBottom: 4 }}>
            {(allAssetTabs.find(t => t.id === activeTab) as { id: string; label: string } | undefined)?.label || 'Assets'}
          </div>
          <div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF, maxWidth: 440, lineHeight: 1.4 }}>
            {tabDesc[activeTab] || 'Kelola aset perusahaan.'}
          </div>
        </div>

        <div style={{ padding: '0 24px 28px', maxWidth: 540, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Total', value: '18', color: '#007aff', bg: '#f0f7ff' },
              { label: 'In Use', value: '8', color: '#30b0c7', bg: '#f0fafc' },
              { label: 'Available', value: '7', color: '#34c759', bg: '#f0fdf4' },
              { label: 'Maintenance', value: '2', color: '#ff9500', bg: '#fff8f0' },
            ].map((s) => (
              <div key={s.label} style={{ padding: 14, borderRadius: 8, background: s.bg, border: '0.5px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 10, color: s.color, fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em' }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: SF, marginTop: 2 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Asset list */}
          <div style={{ background: 'white', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            {filteredAssets.map((asset, i) => (
              <div key={asset.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: i < filteredAssets.length - 1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none', cursor: 'pointer', background: selectedAsset === asset.id ? '#f5f5f7' : 'transparent' }} onClick={() => setSelectedAsset(asset.id)} onMouseEnter={(e) => { if (selectedAsset !== asset.id) e.currentTarget.style.background = '#fafafa' }} onMouseLeave={(e) => { if (selectedAsset !== asset.id) e.currentTarget.style.background = selectedAsset === asset.id ? '#f5f5f7' : 'transparent' }}>
                <div style={{ width: 4, height: 32, borderRadius: 2, background: statusColor[asset.status], flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{asset.code}</span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: statusColor[asset.status] + '18', color: statusColor[asset.status], fontWeight: 500, fontFamily: SF }}>{asset.status.replace('_', ' ')}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.name}</div>
                  <div style={{ fontSize: 11, color: '#8e8e93', fontFamily: SF, marginTop: 2, letterSpacing: '-0.01em' }}>{asset.location}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, color: '#1d1d1f', fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em' }}>{asset.cost}</span>
                  {asset.assignee && <span style={{ fontSize: 10, color: '#007aff', fontFamily: SF, letterSpacing: '-0.01em' }}>{asset.assignee}</span>}
                  {!asset.assignee && <span style={{ fontSize: 10, color: '#34c759', fontFamily: SF, letterSpacing: '-0.01em', fontWeight: 500 }}>Available</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AuditContent({ onClose, onMinimize, onMaximize }: { onClose: () => void; onMinimize: () => void; onMaximize?: () => void }) {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"
  const [activeTab, setActiveTab] = useState<string>('all')
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLog, setSelectedLog] = useState<string | null>(null)

  const sidebarGroups = [
    { label: 'ACTIVITY', items: [
      { id: 'all' as const, label: 'All Activity', count: 48 },
      { id: 'create' as const, label: 'Created', count: 21 },
      { id: 'update' as const, label: 'Updated', count: 17 },
      { id: 'delete' as const, label: 'Deleted', count: 4 },
      { id: 'login' as const, label: 'Logins', count: 6 },
    ]},
    { label: 'MODULE', items: [
      { id: 'crm' as const, label: 'CRM', count: 12 },
      { id: 'hris' as const, label: 'HRIS', count: 9 },
      { id: 'finance' as const, label: 'Finance', count: 11 },
      { id: 'procurement' as const, label: 'Procurement', count: 7 },
      { id: 'projects' as const, label: 'Projects', count: 6 },
      { id: 'assets' as const, label: 'Assets', count: 3 },
    ]},
  ]

  const iconPaths: Record<string, string> = {
    all: 'M4 6h16M4 12h16M4 18h16',
    create: 'M12 5v14M5 12h14',
    update: 'M12 5v14M5 12h14',
    delete: 'M4 6h16M4 12h16M4 18h16',
    login: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
    crm: 'M4 6h16M4 12h16M4 18h16',
    hris: 'M4 6h16M4 12h16M4 18h16',
    finance: 'M4 6h16M4 12h16M4 18h16',
    procurement: 'M4 6h16M4 12h16M4 18h16',
    projects: 'M4 6h16M4 12h16M4 18h16',
    assets: 'M4 6h16M4 12h16M4 18h16',
  }

  const iconBg: Record<string, string> = {
    all: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)',
    create: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)',
    update: 'linear-gradient(135deg, #30b0c7 0%, #00778a 100%)',
    delete: 'linear-gradient(135deg, #ff3b30 0%, #d70015 100%)',
    login: 'linear-gradient(135deg, #5856d6 0%, #3634a3 100%)',
    crm: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)',
    hris: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)',
    finance: 'linear-gradient(135deg, #ff9500 0%, #c06a00 100%)',
    procurement: 'linear-gradient(135deg, #af52de 0%, #892ab8 100%)',
    projects: 'linear-gradient(135deg, #ff9500 0%, #c06a00 100%)',
    assets: 'linear-gradient(135deg, #8e8e93 0%, #636366 100%)',
  }

  const actionColor: Record<string, string> = {
    create: '#34c759',
    update: '#30b0c7',
    delete: '#ff3b30',
    login: '#5856d6',
  }

  const tabDesc: Record<string, string> = {
    all: 'Semua aktivitas sistem dalam satu linimasa.',
    create: 'Record yang baru dibuat.',
    update: 'Perubahan data oleh pengguna.',
    delete: 'Record yang dihapus.',
    login: 'Riwayat login pengguna.',
    crm: 'Aktivitas modul CRM.',
    hris: 'Aktivitas modul HRIS.',
    finance: 'Aktivitas modul Finance.',
    procurement: 'Aktivitas modul Procurement.',
    projects: 'Aktivitas modul Projects.',
    assets: 'Aktivitas modul Assets.',
  }

  const MOCK_LOGS = [
    { id: 'LOG-048', action: 'create', module: 'crm', desc: 'Membuat client PT Maju Jaya', user: 'Admin', time: '2 mnt lalu', ip: '192.168.1.10' },
    { id: 'LOG-047', action: 'update', module: 'finance', desc: 'Mengubah invoice INV-002 → Paid', user: 'Siti', time: '18 mnt lalu', ip: '192.168.1.12' },
    { id: 'LOG-046', action: 'login', module: 'hris', desc: 'Login dari perangkat baru', user: 'Budi', time: '32 mnt lalu', ip: '192.168.1.15' },
    { id: 'LOG-045', action: 'create', module: 'procurement', desc: 'Membuat PO-004 ke PT Cat Indonesia', user: 'Andi', time: '1 jam lalu', ip: '192.168.1.11' },
    { id: 'LOG-044', action: 'delete', module: 'projects', desc: 'Menghapus task duplikat T-112', user: 'Admin', time: '2 jam lalu', ip: '192.168.1.10' },
    { id: 'LOG-043', action: 'update', module: 'assets', desc: 'Handover LT-2024-001 → Budi', user: 'Admin', time: '3 jam lalu', ip: '192.168.1.10' },
    { id: 'LOG-042', action: 'create', module: 'hris', desc: 'Pengajuan cuti 3 hari oleh Siti', user: 'Siti', time: '5 jam lalu', ip: '192.168.1.12' },
    { id: 'LOG-041', action: 'update', module: 'crm', desc: 'Mengubah status CV Berkah → active', user: 'Dewi', time: 'Kemarin', ip: '192.168.1.14' },
  ]

  const filteredLogs = activeTab === 'all'
    ? MOCK_LOGS
    : ['create', 'update', 'delete', 'login'].includes(activeTab)
      ? MOCK_LOGS.filter(l => l.action === activeTab)
      : MOCK_LOGS.filter(l => l.module === activeTab)

  const filteredSidebarGroups = sidebarGroups.map(g => ({ ...g, items: g.items.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase())) })).filter(g => g.items.length > 0)
  const allAuditTabs = sidebarGroups.flatMap(g => g.items)

  const btnSize = 12
  const btnGap = 8

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: SF, padding: 10, gap: 10 }}>
      {/* Sidebar */}
      <div style={{
        width: 220, flexShrink: 0,
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column',
        padding: '6px',
        overflowY: 'auto',
      }}>
        {/* Traffic lights */}
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

        {/* Search */}
        <div style={{ padding: '0 6px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.06)', padding: '4px 8px' }}>
            <Search size={13} color="#8e8e93" />
            <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 12, color: '#1d1d1f', fontFamily: SF }} />
          </div>
        </div>

        {filteredSidebarGroups.map((group) => (
          <div key={group.label}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: SF }}>{group.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.items.map((item) => {
                const active = activeTab === item.id
                return (
                  <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 8px', borderRadius: 7, border: 'none', background: active ? '#007aff' : 'transparent', color: active ? 'white' : '#1d1d1f', fontSize: 13, fontWeight: active ? 500 : 400, cursor: 'pointer', transition: 'background 0.12s', textAlign: 'left', width: '100%', gap: 9, fontFamily: SF, letterSpacing: '-0.01em' }} onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }} onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 5, background: active ? 'rgba(255,255,255,0.25)' : iconBg[item.id], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: active ? 'none' : '0 1px 2px rgba(0,0,0,0.12)' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d={iconPaths[item.id]} fill="white" strokeWidth={0} /></svg>
                      </div>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span style={{ fontSize: 10, fontWeight: 500, color: active ? 'rgba(255,255,255,0.7)' : '#8e8e93', fontFamily: SF }}>{item.count}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
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

        {/* Section header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 24px 20px', textAlign: 'center' }}>
          <div style={{ width: 58, height: 58, borderRadius: 14, background: iconBg[activeTab] || 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.12), inset 0 0 0 0.5px rgba(255,255,255,0.3)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d={iconPaths[activeTab] || iconPaths.all} fill="white" strokeWidth={0} /></svg>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.02em', marginBottom: 4 }}>
            {(allAuditTabs.find(t => t.id === activeTab) as { id: string; label: string } | undefined)?.label || 'Audit Logs'}
          </div>
          <div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF, maxWidth: 440, lineHeight: 1.4 }}>
            {tabDesc[activeTab] || 'Jejak audit sistem.'}
          </div>
        </div>

        <div style={{ padding: '0 24px 28px', maxWidth: 540, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Today', value: '12', color: '#007aff', bg: '#f0f7ff' },
              { label: 'Creates', value: '21', color: '#34c759', bg: '#f0fdf4' },
              { label: 'Updates', value: '17', color: '#30b0c7', bg: '#f0fafc' },
              { label: 'Deletes', value: '4', color: '#ff3b30', bg: '#fff5f5' },
            ].map((s) => (
              <div key={s.label} style={{ padding: 14, borderRadius: 8, background: s.bg, border: '0.5px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 10, color: s.color, fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em' }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: SF, marginTop: 2 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Log timeline */}
          <div style={{ background: 'white', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            {filteredLogs.map((log, i) => (
              <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: i < filteredLogs.length - 1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none', cursor: 'pointer', background: selectedLog === log.id ? '#f5f5f7' : 'transparent' }} onClick={() => setSelectedLog(log.id)} onMouseEnter={(e) => { if (selectedLog !== log.id) e.currentTarget.style.background = '#fafafa' }} onMouseLeave={(e) => { if (selectedLog !== log.id) e.currentTarget.style.background = selectedLog === log.id ? '#f5f5f7' : 'transparent' }}>
                <div style={{ width: 4, height: 32, borderRadius: 2, background: actionColor[log.action], flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{log.id}</span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: actionColor[log.action] + '18', color: actionColor[log.action], fontWeight: 500, fontFamily: SF, textTransform: 'capitalize' }}>{log.action}</span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(142,142,147,0.12)', color: '#8e8e93', fontWeight: 500, fontFamily: SF, textTransform: 'uppercase' }}>{log.module}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.desc}</div>
                  <div style={{ fontSize: 11, color: '#8e8e93', fontFamily: SF, marginTop: 2, letterSpacing: '-0.01em' }}>{log.ip}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{log.time}</span>
                  <span style={{ fontSize: 10, color: '#007aff', fontFamily: SF, letterSpacing: '-0.01em' }}>{log.user}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CatalogContent({ onClose, onMinimize, onMaximize }: { onClose: () => void; onMinimize: () => void; onMaximize?: () => void }) {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"
  const [activeTab, setActiveTab] = useState<string>('all')
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  const sidebarGroups = [
    { label: 'ITEMS', items: [
      { id: 'all' as const, label: 'All Items', count: 18 },
      { id: 'service' as const, label: 'Services', count: 10 },
      { id: 'product' as const, label: 'Products', count: 8 },
      { id: 'subscriptions' as const, label: 'Subscriptions', count: 5 },
    ]},
    { label: 'CATEGORY', items: [
      { id: 'kanopi' as const, label: 'Kanopi', count: 6 },
      { id: 'railing' as const, label: 'Railing', count: 4 },
      { id: 'renovasi' as const, label: 'Renovasi', count: 5 },
      { id: 'baja' as const, label: 'Baja Ringan', count: 3 },
    ]},
  ]

  const iconPaths: Record<string, string> = {
    all: 'M4 6h16M4 12h16M4 18h16',
    service: 'M4 6h16M4 12h16M4 18h16',
    product: 'M4 6h16M4 12h16M4 18h16',
    subscriptions: 'M4 6h16M4 12h16M4 18h16',
    kanopi: 'M4 6h16M4 12h16M4 18h16',
    railing: 'M4 6h16M4 12h16M4 18h16',
    renovasi: 'M4 6h16M4 12h16M4 18h16',
    baja: 'M4 6h16M4 12h16M4 18h16',
  }

  const iconBg: Record<string, string> = {
    all: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)',
    service: 'linear-gradient(135deg, #30b0c7 0%, #00778a 100%)',
    product: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)',
    subscriptions: 'linear-gradient(135deg, #af52de 0%, #892ab8 100%)',
    kanopi: 'linear-gradient(135deg, #ff9500 0%, #c06a00 100%)',
    railing: 'linear-gradient(135deg, #5856d6 0%, #3634a3 100%)',
    renovasi: 'linear-gradient(135deg, #ff3b30 0%, #d70015 100%)',
    baja: 'linear-gradient(135deg, #8e8e93 0%, #636366 100%)',
  }

  const tabDesc: Record<string, string> = {
    all: 'Semua jasa dan produk yang dijual.',
    service: 'Jasa pemasangan dan pengerjaan.',
    product: 'Barang fisik dengan stok.',
    subscriptions: 'Paket langganan klien.',
    kanopi: 'Paket dan material kanopi.',
    railing: 'Paket dan material railing.',
    renovasi: 'Paket renovasi bangunan.',
    baja: 'Material baja ringan.',
  }

  const MOCK_ITEMS = [
    { id: 'ITM-001', code: 'JSA-KNP-01', name: 'Pasang Kanopi Alderon /m²', type: 'service', category: 'kanopi', price: 'Rp 450rb', unit: '/m²', stock: null as number | null, status: 'active' },
    { id: 'ITM-002', code: 'JSA-RLG-02', name: 'Railing Tangga Stainless /m', type: 'service', category: 'railing', price: 'Rp 850rb', unit: '/m', stock: null, status: 'active' },
    { id: 'ITM-003', code: 'BRG-ALD-10', name: 'Atap Alderon RS 3m', type: 'product', category: 'kanopi', price: 'Rp 385rb', unit: '/lbr', stock: 120, status: 'active' },
    { id: 'ITM-004', code: 'JSA-RNV-05', name: 'Renovasi Atap Gudang', type: 'service', category: 'renovasi', price: 'Rp 120jt', unit: '/paket', stock: null, status: 'active' },
    { id: 'ITM-005', code: 'BRG-BJR-07', name: 'Baja Ringan Taso 0.75', type: 'product', category: 'baja', price: 'Rp 95rb', unit: '/btg', stock: 340, status: 'active' },
    { id: 'ITM-006', code: 'JSA-RLG-03', name: 'Railing Balkon Minimalis /m', type: 'service', category: 'railing', price: 'Rp 650rb', unit: '/m', stock: null, status: 'inactive' },
    { id: 'ITM-007', code: 'BRG-CT-02', name: 'Cat Avian 5kg', type: 'product', category: 'renovasi', price: 'Rp 420rb', unit: '/pail', stock: 45, status: 'active' },
    { id: 'ITM-008', code: 'JSA-KNP-04', name: 'Bongkar Pasang Kanopi Lama', type: 'service', category: 'kanopi', price: 'Rp 150rb', unit: '/m²', stock: null, status: 'active' },
  ]

  const MOCK_SUBS = [
    { id: 'SUB-001', code: 'PKT-MAINT-01', name: 'Maintenance Rutin Bulanan', client: 'PT Maju Jaya', price: 'Rp 2,5jt', period: '/bln', quota: '4 kunjungan', status: 'active' },
    { id: 'SUB-002', code: 'PKT-CEK-02', name: 'Inspeksi Atap Triwulan', client: 'CV Berkah Jaya', price: 'Rp 1,2jt', period: '/3 bln', quota: '2 kunjungan', status: 'active' },
    { id: 'SUB-003', code: 'PKT-MAINT-03', name: 'Maintenance Rutin Bulanan', client: 'PT Sejahtera', price: 'Rp 2,5jt', period: '/bln', quota: '4 kunjungan', status: 'paused' },
  ]

  const showingSubs = activeTab === 'subscriptions'

  const filteredItems = activeTab === 'all'
    ? MOCK_ITEMS
    : activeTab === 'service' || activeTab === 'product'
      ? MOCK_ITEMS.filter(i => i.type === activeTab)
      : MOCK_ITEMS.filter(i => i.category === activeTab)

  const filteredSidebarGroups = sidebarGroups.map(g => ({ ...g, items: g.items.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase())) })).filter(g => g.items.length > 0)
  const allCatalogTabs = sidebarGroups.flatMap(g => g.items)

  const btnSize = 12
  const btnGap = 8

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: SF, padding: 10, gap: 10 }}>
      {/* Sidebar */}
      <div style={{
        width: 220, flexShrink: 0,
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column',
        padding: '6px',
        overflowY: 'auto',
      }}>
        {/* Traffic lights */}
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

        {/* Search */}
        <div style={{ padding: '0 6px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.06)', padding: '4px 8px' }}>
            <Search size={13} color="#8e8e93" />
            <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 12, color: '#1d1d1f', fontFamily: SF }} />
          </div>
        </div>

        {filteredSidebarGroups.map((group) => (
          <div key={group.label}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: SF }}>{group.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.items.map((item) => {
                const active = activeTab === item.id
                return (
                  <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 8px', borderRadius: 7, border: 'none', background: active ? '#007aff' : 'transparent', color: active ? 'white' : '#1d1d1f', fontSize: 13, fontWeight: active ? 500 : 400, cursor: 'pointer', transition: 'background 0.12s', textAlign: 'left', width: '100%', gap: 9, fontFamily: SF, letterSpacing: '-0.01em' }} onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }} onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 5, background: active ? 'rgba(255,255,255,0.25)' : iconBg[item.id], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: active ? 'none' : '0 1px 2px rgba(0,0,0,0.12)' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d={iconPaths[item.id]} fill="white" strokeWidth={0} /></svg>
                      </div>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span style={{ fontSize: 10, fontWeight: 500, color: active ? 'rgba(255,255,255,0.7)' : '#8e8e93', fontFamily: SF }}>{item.count}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
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

        {/* Section header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 24px 20px', textAlign: 'center' }}>
          <div style={{ width: 58, height: 58, borderRadius: 14, background: iconBg[activeTab] || 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.12), inset 0 0 0 0.5px rgba(255,255,255,0.3)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d={iconPaths[activeTab] || iconPaths.all} fill="white" strokeWidth={0} /></svg>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.02em', marginBottom: 4 }}>
            {(allCatalogTabs.find(t => t.id === activeTab) as { id: string; label: string } | undefined)?.label || 'Catalog'}
          </div>
          <div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF, maxWidth: 440, lineHeight: 1.4 }}>
            {tabDesc[activeTab] || 'Katalog jasa dan produk.'}
          </div>
        </div>

        <div style={{ padding: '0 24px 28px', maxWidth: 540, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Items', value: '18', color: '#007aff', bg: '#f0f7ff' },
              { label: 'Services', value: '10', color: '#30b0c7', bg: '#f0fafc' },
              { label: 'Products', value: '8', color: '#34c759', bg: '#f0fdf4' },
              { label: 'Subs', value: '5', color: '#af52de', bg: '#f8f0ff' },
            ].map((s) => (
              <div key={s.label} style={{ padding: 14, borderRadius: 8, background: s.bg, border: '0.5px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 10, color: s.color, fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em' }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: SF, marginTop: 2 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Items / subscriptions list */}
          <div style={{ background: 'white', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            {showingSubs ? MOCK_SUBS.map((sub, i) => (
              <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: i < MOCK_SUBS.length - 1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none', cursor: 'pointer', background: selectedItem === sub.id ? '#f5f5f7' : 'transparent' }} onClick={() => setSelectedItem(sub.id)} onMouseEnter={(e) => { if (selectedItem !== sub.id) e.currentTarget.style.background = '#fafafa' }} onMouseLeave={(e) => { if (selectedItem !== sub.id) e.currentTarget.style.background = selectedItem === sub.id ? '#f5f5f7' : 'transparent' }}>
                <div style={{ width: 4, height: 32, borderRadius: 2, background: sub.status === 'active' ? '#af52de' : '#8e8e93', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{sub.code}</span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: sub.status === 'active' ? 'rgba(175,82,222,0.12)' : 'rgba(142,142,147,0.12)', color: sub.status === 'active' ? '#af52de' : '#8e8e93', fontWeight: 500, fontFamily: SF, textTransform: 'capitalize' }}>{sub.status}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.name}</div>
                  <div style={{ fontSize: 11, color: '#8e8e93', fontFamily: SF, marginTop: 2, letterSpacing: '-0.01em' }}>{sub.client} · {sub.quota}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: '#1d1d1f', fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em' }}>{sub.price}</span>
                  <span style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{sub.period}</span>
                </div>
              </div>
            )) : filteredItems.map((item, i) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: i < filteredItems.length - 1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none', cursor: 'pointer', background: selectedItem === item.id ? '#f5f5f7' : 'transparent' }} onClick={() => setSelectedItem(item.id)} onMouseEnter={(e) => { if (selectedItem !== item.id) e.currentTarget.style.background = '#fafafa' }} onMouseLeave={(e) => { if (selectedItem !== item.id) e.currentTarget.style.background = selectedItem === item.id ? '#f5f5f7' : 'transparent' }}>
                <div style={{ width: 4, height: 32, borderRadius: 2, background: item.type === 'service' ? '#30b0c7' : '#34c759', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{item.code}</span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: item.type === 'service' ? 'rgba(48,176,199,0.12)' : 'rgba(52,199,89,0.12)', color: item.type === 'service' ? '#30b0c7' : '#34c759', fontWeight: 500, fontFamily: SF, textTransform: 'capitalize' }}>{item.type}</span>
                    {item.status !== 'active' && (
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(142,142,147,0.12)', color: '#8e8e93', fontWeight: 500, fontFamily: SF }}>{item.status}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: '#8e8e93', fontFamily: SF, marginTop: 2, letterSpacing: '-0.01em' }}>{item.stock !== null ? `Stok: ${item.stock}` : 'Tanpa stok'}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: '#1d1d1f', fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em' }}>{item.price}</span>
                  <span style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{item.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function DonutChart({ segs, centerTop, centerSub }: {
  segs: { frac: number; color: string }[]
  centerTop: (v: number) => string
  centerSub: string
}) {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setElapsed(Number.MAX_SAFE_INTEGER)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const e = now - start
      setElapsed(e)
      if (e < 1600) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Apple signature easing — cubic-bezier(0.16, 1, 0.3, 1) ≈ easeOutExpo
  const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x))
  const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

  const r = 28
  const c = 2 * Math.PI * r
  const stagger = 160
  const segDur = 850
  let acc = 0

  const total = segs.reduce((s, x) => s + x.frac, 0)
  const countT = easeOutExpo(clamp01(elapsed / 1200))

  return (
    <svg width="84" height="84" viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
      <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="9" />
      {segs.map((s, i) => {
        const local = easeOutExpo(clamp01((elapsed - i * stagger) / segDur))
        const dash = s.frac * c * local
        const off = -acc * c
        acc += s.frac
        return (
          <circle
            key={i}
            cx="32" cy="32" r={r} fill="none" stroke={s.color} strokeWidth="9"
            strokeLinecap="butt"
            strokeDasharray={`${dash} ${c}`}
            strokeDashoffset={off}
            transform="rotate(-90 32 32)"
          />
        )
      })}
      <text x="32" y="31" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1d1d1f" fontFamily={SF}>
        {centerTop(countT * total)}
      </text>
      <text x="32" y="41" textAnchor="middle" fontSize="8" fill="#8e8e93" fontFamily={SF}>{centerSub}</text>
    </svg>
  )
}

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

function DeviceRow({
  icon,
  title,
  subtitle,
  isLast,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  isLast?: boolean
}) {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 14px',
        borderBottom: isLast ? 'none' : '1px solid rgb(229, 229, 234)',
        minHeight: 48,
        cursor: 'pointer',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 13, color: '#1d1d1f', fontFamily: SF, fontWeight: 600 }}>{title}</div>
          <div style={{ fontSize: 11, color: '#8e8e93', fontFamily: SF, marginTop: 1 }}>{subtitle}</div>
        </div>
      </div>

      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  )
}

function SettingsContent({ onLogout, onClose, onMinimize, onMaximize }: { onLogout: () => void; onClose: () => void; onMinimize: () => void; onMaximize?: () => void }) {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"
  const [activeTab, setActiveTab] = useState<string>('general')
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('hub-avatar-url') || '')
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [avatarInput, setAvatarInput] = useState('')

  const categories = [
    { id: 'profile', label: 'Profile & Account', icon: User, bg: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)' },
    { id: 'wifi', label: 'Wi-Fi', icon: Wifi, bg: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)' },
    { id: 'bluetooth', label: 'Bluetooth', icon: Bluetooth, bg: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)' },
    { id: 'network', label: 'Network', icon: Globe, bg: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)' },
    { id: 'battery', label: 'Battery', icon: Battery, bg: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)' },
    { id: 'general', label: 'General', icon: Settings, bg: 'linear-gradient(135deg, #8e8e93 0%, #636366 100%)' },
    { id: 'accessibility', label: 'Accessibility', icon: User, bg: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)' },
    { id: 'appearance', label: 'Appearance', icon: Palette, bg: 'linear-gradient(135deg, #1c1c1e 0%, #3a3a3c 100%)' },
    { id: 'siri', label: 'Apple Intelligence & Siri', icon: Sparkles, bg: 'linear-gradient(135deg, #a259ff 0%, #6131b4 100%)' },
    { id: 'dock', label: 'Desktop & Dock', icon: Monitor, bg: 'linear-gradient(135deg, #2c2c2e 0%, #1c1c1e 100%)' },
    { id: 'displays', label: 'Displays', icon: Sun, bg: 'linear-gradient(135deg, #30b0c7 0%, #00778a 100%)' },
    { id: 'notifications', label: 'Notifications', icon: Bell, bg: 'linear-gradient(135deg, #ff3b30 0%, #d70015 100%)' },
    { id: 'sound', label: 'Sound', icon: Volume2, bg: 'linear-gradient(135deg, #ff2d55 0%, #c4002f 100%)' },
    { id: 'focus', label: 'Focus', icon: Moon, bg: 'linear-gradient(135deg, #5856d6 0%, #3634a3 100%)' },
    { id: 'screentime', label: 'Screen Time', icon: Hourglass, bg: 'linear-gradient(135deg, #af52de 0%, #892ab8 100%)' },
    { id: 'lockscreen', label: 'Lock Screen', icon: Lock, bg: 'linear-gradient(135deg, #1c1c1e 0%, #3a3a3c 100%)' },
    { id: 'security', label: 'Privacy & Security', icon: ShieldCheck, bg: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)' },
  ]

  const filteredCategories = categories.filter(c => c.label.toLowerCase().includes(searchQuery.toLowerCase()))

  const btnSize = 12
  const btnGap = 8

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: SF, padding: 10, gap: 10 }}>
      {/* Sidebar with traffic lights & search */}
      <div style={{
        width: 220, flexShrink: 0,
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column',
        padding: '6px',
        overflowY: 'auto',
      }}>
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: btnGap, padding: '12px 10px 10px' }}>
          <div
            style={{
              width: btnSize, height: btnSize, borderRadius: '50%',
              background: hoveredBtn === 'close' ? '#ff5f57' : 'linear-gradient(180deg, #ff5f57 0%, #e0443e 100%)',
              cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={onClose}
            onMouseEnter={() => setHoveredBtn('close')}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            {hoveredBtn === 'close' && (
              <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                <path d="M1 1L5 5M5 1L1 5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <div
            style={{
              width: btnSize, height: btnSize, borderRadius: '50%',
              background: hoveredBtn === 'minimize' ? '#febc2e' : 'linear-gradient(180deg, #febc2e 0%, #dea123 100%)',
              cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={onMinimize}
            onMouseEnter={() => setHoveredBtn('minimize')}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            {hoveredBtn === 'minimize' && (
              <svg width="6" height="2" viewBox="0 0 6 2" fill="none">
                <path d="M1 1H5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <div
            style={{
              width: btnSize, height: btnSize, borderRadius: '50%',
              background: hoveredBtn === 'maximize' ? '#28c840' : 'linear-gradient(180deg, #28c840 0%, #1aab29 100%)',
              cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={onMaximize}
            onMouseEnter={() => setHoveredBtn('maximize')}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            {hoveredBtn === 'maximize' && (
              <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                <path d="M1 3L3 1L5 3" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 3L3 5L5 3" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        </div>

        {/* Search Bar matching macOS Settings */}
        <div style={{ padding: '0 6px 8px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(0,0,0,0.05)',
            borderRadius: 8,
            border: '0.5px solid rgba(0,0,0,0.06)',
            padding: '4px 8px',
          }}>
            <Search size={13} color="#8e8e93" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none', background: 'transparent', outline: 'none',
                width: '100%', fontSize: 12, color: '#1d1d1f', fontFamily: SF,
              }}
            />
          </div>
        </div>

        {/* Profile Card Header (Alfian Hafiz / Apple Account) */}
        <div
          onClick={() => setActiveTab('profile')}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 8px', borderRadius: 8, cursor: 'pointer',
            marginBottom: 2,
            background: activeTab === 'profile' ? '#007aff' : 'transparent',
            color: activeTab === 'profile' ? 'white' : '#1d1d1f',
            transition: 'background 0.12s',
          }}
          onMouseEnter={(e) => { if (activeTab !== 'profile') e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
          onMouseLeave={(e) => { if (activeTab !== 'profile') e.currentTarget.style.background = 'transparent' }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0,
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }}>
            AH
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Alfian Hafiz
            </div>
            <div style={{ fontSize: 11, color: activeTab === 'profile' ? 'rgba(255,255,255,0.8)' : '#8e8e93', fontFamily: SF }}>
              Apple Account
            </div>
          </div>
        </div>

        {/* Suggestions Card */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '6px 8px', borderRadius: 8, cursor: 'pointer', marginBottom: 8,
            fontSize: 12, fontWeight: 400, color: '#1d1d1f', fontFamily: SF,
            transition: 'background 0.12s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: 12, color: '#1d1d1f', fontFamily: SF }}>Apple Account Suggestions</span>
          <span style={{
            background: '#ff3b30', color: 'white', fontSize: 11, fontWeight: 700,
            width: 18, height: 18, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>2</span>
        </div>

        {/* Category items with macOS Squircle badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredCategories.map((cat) => {
            const active = activeTab === cat.id
            const IconComponent = cat.icon
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '5px 8px', width: '100%',
                  borderRadius: 7, border: 'none',
                  background: active ? '#007aff' : 'transparent',
                  color: active ? 'white' : '#1d1d1f',
                  fontSize: 13, fontWeight: active ? 500 : 400,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.12s',
                  fontFamily: SF, letterSpacing: '-0.01em',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: 5,
                  background: active ? 'rgba(255,255,255,0.25)' : cat.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', flexShrink: 0,
                  boxShadow: active ? 'none' : '0 1px 2px rgba(0,0,0,0.12)',
                }}>
                  <IconComponent size={13} color="white" />
                </div>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main content right panel */}
      <div style={{ flex: 1, overflowY: 'auto', minWidth: 0, background: '#ffffff', borderRadius: 12 }}>
        {/* Navigation arrows top toolbar */}
        <div style={{ display: 'flex', gap: 12, padding: '12px 18px 0', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 2 }}>
            <button style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          {activeTab === 'profile' && (
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f', fontFamily: SF }}>Apple Account</span>
          )}
        </div>

        {/* Section Header for non-profile tabs */}
        {activeTab !== 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 24px 20px', textAlign: 'center' }}>
            <div style={{
              width: 58, height: 58, borderRadius: 14,
              background: activeTab === 'general' ? 'linear-gradient(135deg, #8e8e93 0%, #636366 100%)' : 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', marginBottom: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.12), inset 0 0 0 0.5px rgba(255,255,255,0.3)',
              fontSize: 24, fontWeight: 700,
            }}>
              {activeTab === 'general' && <Settings size={32} color="white" />}
              {activeTab === 'security' && <ShieldCheck size={32} color="white" />}
              {activeTab === 'appearance' && <Palette size={32} color="white" />}
              {activeTab !== 'general' && activeTab !== 'security' && activeTab !== 'appearance' && <Settings size={32} color="white" />}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.02em', marginBottom: 4 }}>
              {activeTab === 'general' && 'General'}
              {activeTab === 'security' && 'Privacy & Security'}
              {activeTab === 'appearance' && 'Appearance'}
              {activeTab !== 'general' && activeTab !== 'security' && activeTab !== 'appearance' && (categories.find(c => c.id === activeTab)?.label || 'General')}
            </div>
            <div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF, maxWidth: 440, lineHeight: 1.4 }}>
              {activeTab === 'general' && 'Manage your overall setup and preferences for Mac, such as software updates, device language, AirDrop, and more.'}
              {activeTab === 'security' && 'Manage privacy permissions, security keys, passkeys, and encryption settings.'}
              {activeTab === 'appearance' && 'Customize theme colors, accent styles, and window appearance.'}
              {activeTab !== 'general' && activeTab !== 'security' && activeTab !== 'appearance' && 'Configure and personalize settings for this section.'}
            </div>
          </div>
        )}

        {/* Grouped Cards Container */}
        <div style={{ padding: activeTab === 'profile' ? '8px 24px 28px' : '0 24px 28px', maxWidth: 540, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* PROFILE / APPLE ACCOUNT TAB */}
          {activeTab === 'profile' && (
            <>
              {/* Centered Large Avatar & Name */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0 16px', textAlign: 'center' }}>
                <div
                  onClick={() => { setAvatarInput(avatarUrl); setShowAvatarModal(true) }}
                  style={{
                    width: 80, height: 80, borderRadius: '50%',
                    overflow: 'hidden', marginBottom: 10,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.08)',
                    background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', position: 'relative',
                  }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  ) : (
                    <span style={{ fontSize: 28, fontWeight: 700, color: 'white', fontFamily: SF }}>AH</span>
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
                    <Camera size={20} color="white" />
                  </div>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.02em', marginBottom: 2 }}>
                  Alfian Hafiz
                </div>
                <div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF }}>
                  alfianhafiz@icloud.com
                </div>
              </div>

              {/* Group 1: Personal Info, Sign-In & Security, Payment */}
              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <GroupedRow icon={<User size={14} />} iconBg="#8e8e93" label="Personal Information" onClick={() => {}} />
                <GroupedRow icon={<Lock size={14} />} iconBg="#8e8e93" label="Sign-In & Security" onClick={() => {}} />
                <GroupedRow icon={<CreditCard size={14} />} iconBg="#8e8e93" label="Payment & Shipping" isLast onClick={() => {}} />
              </div>

              {/* Group 2: iCloud, Family, Media & Purchases, Sign in with Apple */}
              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <GroupedRow icon={<Cloud size={14} />} iconBg="#007aff" label="iCloud" onClick={() => {}} />
                <GroupedRow icon={<Users size={14} />} iconBg="#34c759" label="Family" value="Set Up" editable onClick={() => {}} />
                <GroupedRow icon={<ShoppingBag size={14} />} iconBg="#007aff" label="Media & Purchases" onClick={() => {}} />
                <GroupedRow
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.68-.82 1.14-1.97.98-3.14-1 .04-2.19.67-2.88 1.48-.6.7-1.12 1.84-.98 2.97 1.12.09 2.22-.5 2.88-1.31z"/>
                    </svg>
                  }
                  iconBg="#1c1c1e"
                  label="Sign in with Apple"
                  isLast
                  onClick={() => {}}
                />
              </div>

              {/* Group 3: Devices Section */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', fontFamily: SF, marginBottom: 6, paddingLeft: 4 }}>
                  Devices
                </div>
                <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                  <DeviceRow
                    icon={<Laptop size={20} color="#007aff" />}
                    title="Razor Crest"
                    subtitle='This MacBook Pro 16"'
                  />
                  <DeviceRow
                    icon={<Smartphone size={18} color="#007aff" />}
                    title="Alfian h"
                    subtitle="iPhone 13"
                    isLast
                  />
                </div>
              </div>

              {/* Group 4: Contact Key Verification */}
              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <GroupedRow icon={<Users size={14} />} iconBg="#8e8e93" label="Contact Key Verification" isLast onClick={() => {}} />
              </div>

              {/* Bottom Action Footer: Sign Out... Button & ? Help Circle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <button
                  onClick={onLogout}
                  style={{
                    padding: '6px 14px', borderRadius: 6, border: '0.5px solid rgba(0,0,0,0.12)',
                    background: 'rgba(0,0,0,0.04)', color: '#1d1d1f', fontSize: 13, fontWeight: 400,
                    cursor: 'pointer', fontFamily: SF, transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                >
                  Sign Out...
                </button>

                <button
                  style={{
                    width: 22, height: 22, borderRadius: '50%', border: 'none',
                    background: 'rgba(0,0,0,0.08)', color: '#1d1d1f', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: SF,
                  }}
                >
                  ?
                </button>
              </div>
            </>
          )}

          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <>
              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <GroupedRow icon={<Laptop size={14} />} iconBg="#8e8e93" label="About" />
                <GroupedRow icon={<RefreshCw size={14} />} iconBg="#8e8e93" label="Software Update" />
                <GroupedRow icon={<HardDrive size={14} />} iconBg="#8e8e93" label="Storage" isLast />
              </div>

              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <GroupedRow icon={<Shield size={14} />} iconBg="#ff3b30" label="AppleCare & Warranty" isLast />
              </div>

              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <GroupedRow icon={<Airplay size={14} />} iconBg="#007aff" label="AirDrop & Handoff" isLast />
              </div>

              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <GroupedRow icon={<Key size={14} />} iconBg="#8e8e93" label="AutoFill & Passwords" />
                <GroupedRow icon={<Calendar size={14} />} iconBg="#007aff" label="Date & Time" />
                <GroupedRow icon={<Globe size={14} />} iconBg="#007aff" label="Language & Region" />
                <GroupedRow icon={<Sliders size={14} />} iconBg="#8e8e93" label="Login Items & Extensions" />
                <GroupedRow icon={<User size={14} />} iconBg="#8e8e93" label="Sharing" />
                <GroupedRow icon={<HardDrive size={14} />} iconBg="#8e8e93" label="Startup Disk" />
                <GroupedRow icon={<Clock size={14} />} iconBg="#30b0c7" label="Time Machine" isLast />
              </div>

              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <GroupedRow icon={<ShieldCheck size={14} />} iconBg="#34c759" label="Device Management" isLast />
              </div>
            </>
          )}

          {/* PRIVACY & SECURITY TAB */}
          {activeTab === 'security' && (
            <>
              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <GroupedRow icon={<Key size={14} />} iconBg="#007aff" label="Password" value="••••••••" editable />
                <GroupedRow icon={<ShieldCheck size={14} />} iconBg="#34c759" label="Two-Factor Authentication" value="Enabled" editable />
                <GroupedRow icon={<Laptop size={14} />} iconBg="#8e8e93" label="Active Sessions" value="2 devices" isLast />
              </div>
              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <GroupedRow icon={<Lock size={14} />} iconBg="#ff9500" label="FileVault Encryption" value="On" />
                <GroupedRow icon={<Shield size={14} />} iconBg="#007aff" label="Firewall" value="On" isLast />
              </div>
            </>
          )}

          {/* OTHER TABS */}
          {activeTab !== 'general' && activeTab !== 'profile' && activeTab !== 'security' && (
            <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
              <GroupedRow icon={<Settings size={14} />} iconBg="#007aff" label={`${categories.find(c => c.id === activeTab)?.label || 'Setting'} Configuration`} value="Default" editable />
              <GroupedRow icon={<Sliders size={14} />} iconBg="#8e8e93" label="Advanced Preferences" value="Enabled" isLast />
            </div>
          )}

           {/* Sign Out Card for Non-Profile Tabs */}
           {activeTab !== 'profile' && (
            <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <button
                onClick={onLogout}
                style={{
                  width: '100%', padding: '11px 14px', border: 'none', background: 'transparent',
                  color: '#ff3b30', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  fontFamily: SF, textAlign: 'center', transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,59,48,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Sign Out of Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Avatar URL Modal */}
      {showAvatarModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowAvatarModal(false)}>
          <div style={{ background: 'white', borderRadius: 12, padding: 20, width: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 15, fontWeight: 600, fontFamily: SF, color: '#1d1d1f', marginBottom: 4 }}>Ubah Foto Profil</div>
            <div style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, marginBottom: 14 }}>Masukkan URL gambar dari internet</div>
            <input
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={avatarInput}
              onChange={(e) => setAvatarInput(e.target.value)}
              autoFocus
              style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box', color: '#1d1d1f' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setAvatarUrl(avatarInput)
                  localStorage.setItem('hub-avatar-url', avatarInput)
                  setShowAvatarModal(false)
                }
              }}
            />
            {avatarInput && (
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
                <img src={avatarInput} alt="Preview" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(0,0,0,0.08)' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
              {avatarUrl && (
                <button onClick={() => { setAvatarUrl(''); localStorage.removeItem('hub-avatar-url'); setShowAvatarModal(false) }} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: '#ff3b30', color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Hapus</button>
              )}
              <button onClick={() => setShowAvatarModal(false)} style={{ padding: '6px 14px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', background: '#f5f5f5', color: '#1d1d1f', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Batal</button>
              <button onClick={() => { setAvatarUrl(avatarInput); localStorage.setItem('hub-avatar-url', avatarInput); setShowAvatarModal(false) }} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: '#007aff', color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function Portfolio({ onLogout }: { onLogout: () => void }) {
  const [openProject, setOpenProject] = useState<number | null>(null)
  const [openOverlay, setOpenOverlay] = useState<'notes' | null>(null)
  const [openHRIS, setOpenHRIS] = useState(false)
  const [openClients, setOpenClients] = useState(false)
  const [openProjects, setOpenProjects] = useState(false)
  const [openFinance, setOpenFinance] = useState(false)
  const [openProcurement, setOpenProcurement] = useState(false)
  const [openSettings, setOpenSettings] = useState(false)
  const [openSupport, setOpenSupport] = useState(false)
  const [openAssets, setOpenAssets] = useState(false)
  const [openAudit, setOpenAudit] = useState(false)
  const [openCatalog, setOpenCatalog] = useState(false)
  const [openBrowser, setOpenBrowser] = useState(false)
  const [openRanpoAI, setOpenRanpoAI] = useState(false)
  const [openPOS, setOpenPOS] = useState(false)

  const [zIndices, setZIndices] = useState<Record<string, number>>({})

  const bringToFront = (id: string) => {
    setZIndices((prev) => {
      const maxZ = Math.max(50, ...Object.values(prev))
      return { ...prev, [id]: maxZ + 1 }
    })
  }

  const handleDockClick = (label: string) => {
    let id = ''
    if (label === 'Notes') { setOpenOverlay('notes'); id = 'notes' }
    else if (label === 'HRIS') { setOpenHRIS(true); id = 'hris' }
    else if (label === 'CRM') { setOpenClients(true); id = 'clients' }
    else if (label === 'Projects') { setOpenProjects(true); id = 'projects' }
    else if (label === 'Finance') { setOpenFinance(true); id = 'finance' }
    else if (label === 'Procurement') { setOpenProcurement(true); id = 'procurement' }
    else if (label === 'Settings') { setOpenSettings(true); id = 'settings' }
    else if (label === 'Ranpo AI') { setOpenRanpoAI(true); id = 'ranpo' }
    else if (label === 'POS') { setOpenPOS(true); id = 'pos' }
    else if (label === 'Support') { setOpenSupport(true); id = 'support' }
    else if (label === 'Assets') { setOpenAssets(true); id = 'assets' }
    else if (label === 'Audit') { setOpenAudit(true); id = 'audit' }
    else if (label === 'Catalog') { setOpenCatalog(true); id = 'catalog' }
    else if (label === 'Browser') { setOpenBrowser(true); id = 'browser' }
    if (id) bringToFront(id)
  }

  const handleProjectClick = (index: number) => {
    let id = ''
    if (PROJECTS[index].isHRIS) {
      setOpenHRIS(true); id = 'hris'
    } else if (PROJECTS[index].isClients) {
      setOpenClients(true); id = 'clients'
    } else if (PROJECTS[index].isProjects) {
      setOpenProjects(true); id = 'projects'
    } else if (PROJECTS[index].isFinance) {
      setOpenFinance(true); id = 'finance'
    } else if (PROJECTS[index].isProcurement) {
      setOpenProcurement(true); id = 'procurement'
    } else if (PROJECTS[index].isRanpoAI) {
      setOpenRanpoAI(true); id = 'ranpo'
    } else if (PROJECTS[index].isPOS) {
      setOpenPOS(true); id = 'pos'
    } else if (PROJECTS[index].isSettings) {
      setOpenSettings(true); id = 'settings'
    } else if (PROJECTS[index].isSupport) {
      setOpenSupport(true); id = 'support'
    } else if (PROJECTS[index].isAssets) {
      setOpenAssets(true); id = 'assets'
    } else if (PROJECTS[index].isAudit) {
      setOpenAudit(true); id = 'audit'
    } else if (PROJECTS[index].isCatalog) {
      setOpenCatalog(true); id = 'catalog'
    } else if (PROJECTS[index].isBrowser) {
      setOpenBrowser(true); id = 'browser'
    } else {
      setOpenProject(index); id = `project-${index}`
    }
    if (id) bringToFront(id)
  }

  const dockItems = DOCK_ITEMS.map((item) => ({
    ...item,
    onClick: item.href ? undefined : () => handleDockClick(item.label),
      isActive: item.label === 'HRIS' ? openHRIS : item.label === 'CRM' ? openClients : item.label === 'Projects' ? openProjects : item.label === 'Finance' ? openFinance : item.label === 'Procurement' ? openProcurement : item.label === 'Settings' ? openSettings : item.label === 'Support' ? openSupport : item.label === 'Assets' ? openAssets : item.label === 'Audit' ? openAudit : item.label === 'Catalog' ? openCatalog : item.label === 'Browser' ? openBrowser : item.label === 'Notes' ? openOverlay === 'notes' : item.label === 'Ranpo AI' ? openRanpoAI : item.label === 'POS' ? openPOS : false,
  }))

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        background: 'white',
      }}
    >
      {/* Background image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(84,84,84,0) 0%, rgb(0,0,0) 100%)',
          opacity: 0.4,
        }}
      />

      {/* Bottom blur layer */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: '47.375%',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 40%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 40%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Dashboard Widget */}
      <DashboardWidgets />

      {/* Logout button */}
      <button
        onClick={onLogout}
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          zIndex: 10,
          padding: '8px 16px',
          borderRadius: 12,
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          color: 'white',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
          fontSize: 13,
          cursor: 'pointer',
          letterSpacing: '-0.02em',
        }}
      >
        Logout
      </button>

      {/* Project cards */}
      {PROJECTS.map((project, i) => (
        <ProjectCard
          key={i}
          title={project.title}
          anchorX={project.anchorX}
          anchorY={project.anchorY}
          thumbnail={project.thumbnail}
          onClick={() => handleProjectClick(i)}
        />
      ))}

      {/* Dock bar */}
      <DockBar items={dockItems} />

      {/* Project window */}
      {openProject !== null && (
        <WindowShell
          id={`project-${openProject}`}
          title={PROJECTS[openProject].title}
          onClose={() => setOpenProject(null)}
          zIndex={zIndices[`project-${openProject}`] || 50}
          onFocus={() => bringToFront(`project-${openProject}`)}
        >
          <img
            src={PROJECTS[openProject].thumbnail}
            alt={PROJECTS[openProject].title}
            style={{
              width: '100%',
              borderRadius: 12,
              border: '1px solid rgb(229,229,234)',
            }}
          />
        </WindowShell>
      )}

      {/* HRIS window */}
      {openHRIS && (
        <WindowShell
          id="hris"
          title="HRIS"
          onClose={() => setOpenHRIS(false)}
          noToolbar
          zIndex={zIndices['hris'] || 50}
          onFocus={() => bringToFront('hris')}
        >
          <HRISContent onClose={() => setOpenHRIS(false)} onMinimize={() => setOpenHRIS(false)} />
        </WindowShell>
      )}

      {/* Clients window */}
      {openClients && (
        <WindowShell
          id="clients"
          title="CRM"
          onClose={() => setOpenClients(false)}
          wide
          fill
          noToolbar
          zIndex={zIndices['clients'] || 50}
          onFocus={() => bringToFront('clients')}
        >
          <ClientsContent onClose={() => setOpenClients(false)} onMinimize={() => setOpenClients(false)} />
        </WindowShell>
      )}

      {/* Projects window */}
      {openProjects && (
        <WindowShell
          id="projects"
          title="Projects"
          onClose={() => setOpenProjects(false)}
          wide
          fill
          noToolbar
          zIndex={zIndices['projects'] || 50}
          onFocus={() => bringToFront('projects')}
        >
          <ProjectsContent onClose={() => setOpenProjects(false)} onMinimize={() => setOpenProjects(false)} />
        </WindowShell>
      )}

      {/* Finance window */}
      {openFinance && (
        <WindowShell
          id="finance"
          title="Finance"
          onClose={() => setOpenFinance(false)}
          wide
          fill
          noToolbar
          zIndex={zIndices['finance'] || 50}
          onFocus={() => bringToFront('finance')}
        >
          <FinanceContent onClose={() => setOpenFinance(false)} onMinimize={() => setOpenFinance(false)} />
        </WindowShell>
      )}

      {/* Procurement window */}
      {openProcurement && (
        <WindowShell
          id="procurement"
          title="Procurement"
          onClose={() => setOpenProcurement(false)}
          wide
          fill
          noToolbar
          zIndex={zIndices['procurement'] || 50}
          onFocus={() => bringToFront('procurement')}
        >
          <ProcurementContent onClose={() => setOpenProcurement(false)} onMinimize={() => setOpenProcurement(false)} />
        </WindowShell>
      )}

      {/* Ranpo AI window */}
      {openRanpoAI && (
        <WindowShell
          id="ranpo"
          title="Ranpo AI"
          onClose={() => setOpenRanpoAI(false)}
          wide
          fill
          noToolbar
          zIndex={zIndices['ranpo'] || 50}
          onFocus={() => bringToFront('ranpo')}
        >
          <RanpoAIContent onClose={() => setOpenRanpoAI(false)} onMinimize={() => setOpenRanpoAI(false)} />
        </WindowShell>
      )}

      {/* POS window */}
      {openPOS && (
        <WindowShell
          id="pos"
          title="POS"
          onClose={() => setOpenPOS(false)}
          wide
          fill
          noToolbar
          zIndex={zIndices['pos'] || 50}
          onFocus={() => bringToFront('pos')}
        >
          <POSContent onClose={() => setOpenPOS(false)} onMinimize={() => setOpenPOS(false)} />
        </WindowShell>
      )}

      {/* Settings window */}
      {openSettings && (
        <WindowShell
          id="settings"
          title="Settings"
          onClose={() => setOpenSettings(false)}
          wide
          fill
          noToolbar
          zIndex={zIndices['settings'] || 50}
          onFocus={() => bringToFront('settings')}
        >
          <SettingsContent onLogout={onLogout} onClose={() => setOpenSettings(false)} onMinimize={() => setOpenSettings(false)} />
        </WindowShell>
      )}

      {/* Support Tickets window */}
      {openSupport && (
        <WindowShell
          id="support"
          title="Support Tickets"
          onClose={() => setOpenSupport(false)}
          wide
          fill
          noToolbar
          zIndex={zIndices['support'] || 50}
          onFocus={() => bringToFront('support')}
        >
          <SupportContent onClose={() => setOpenSupport(false)} onMinimize={() => setOpenSupport(false)} />
        </WindowShell>
      )}

      {/* Assets window */}
      {openAssets && (
        <WindowShell
          id="assets"
          title="Assets"
          onClose={() => setOpenAssets(false)}
          wide
          fill
          noToolbar
          zIndex={zIndices['assets'] || 50}
          onFocus={() => bringToFront('assets')}
        >
          <AssetsContent onClose={() => setOpenAssets(false)} onMinimize={() => setOpenAssets(false)} />
        </WindowShell>
      )}

      {/* Audit Logs window */}
      {openAudit && (
        <WindowShell
          id="audit"
          title="Audit Logs"
          onClose={() => setOpenAudit(false)}
          wide
          fill
          noToolbar
          zIndex={zIndices['audit'] || 50}
          onFocus={() => bringToFront('audit')}
        >
          <AuditContent onClose={() => setOpenAudit(false)} onMinimize={() => setOpenAudit(false)} />
        </WindowShell>
      )}

      {/* Catalog window */}
      {openCatalog && (
        <WindowShell
          id="catalog"
          title="Catalog"
          onClose={() => setOpenCatalog(false)}
          wide
          fill
          noToolbar
          zIndex={zIndices['catalog'] || 50}
          onFocus={() => bringToFront('catalog')}
        >
          <CatalogContent onClose={() => setOpenCatalog(false)} onMinimize={() => setOpenCatalog(false)} />
        </WindowShell>
      )}

      {/* Browser window */}
      {openBrowser && (
        <WindowShell
          id="browser"
          title="Browser"
          onClose={() => setOpenBrowser(false)}
          wide
          fill
          noToolbar
          zIndex={zIndices['browser'] || 50}
          onFocus={() => bringToFront('browser')}
        >
          <BrowserContent onClose={() => setOpenBrowser(false)} onMinimize={() => setOpenBrowser(false)} />
        </WindowShell>
      )}

      {/* Notes overlay */}
      {openOverlay === 'notes' && (
        <WindowShell
          id="notes"
          title="Notes"
          onClose={() => setOpenOverlay(null)}
          zIndex={zIndices['notes'] || 50}
          onFocus={() => bringToFront('notes')}
        >
          <NotesContent />
        </WindowShell>
      )}
    </div>
  )
}
