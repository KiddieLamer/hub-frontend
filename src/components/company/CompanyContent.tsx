import { useState, useEffect } from 'react'
import {
  Video, User, LayoutGrid, Bookmark, Cloud, Monitor, Settings, Phone, LogOut,
  ChevronLeft, ChevronRight, Bell, Plus, ArrowUpRight, X,
  CheckCircle2, CircleDashed, Loader2, Building2, ShieldCheck,
  Mail, MapPin, Globe, FileText, Palette, Trash2, Users, Search,
} from 'lucide-react'
import LastSocialContentCard, { type SocialContentItem } from './LastSocialContentCard'
import { tenantsApi } from '../../lib/endpoints'
import { apiFetch, setTenantId, setPlatformMode, isPlatformMode } from '../../lib/api'

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"

/* ============ UI ATOMS ============ */

function Modal({ title, onClose, width = 420, children }: { title: string; onClose: () => void; width?: number; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full p-6 max-h-[90%] overflow-y-auto" style={{ maxWidth: width, fontFamily: SF }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500">
            <X size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</div>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] text-slate-900 outline-none focus:border-[#1c1d22] bg-white box-border'
const selectCls = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] text-slate-900 outline-none focus:border-[#1c1d22] bg-white'

function GhostBtn({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium transition-colors">
      {children}
    </button>
  )
}

function SolidBtn({ onClick, disabled, children, tone = 'dark' }: { onClick?: () => void; disabled?: boolean; children: React.ReactNode; tone?: 'dark' | 'green' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 rounded-full text-white text-sm font-medium disabled:opacity-60 transition-colors ${
        tone === 'green' ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-[#1c1d22] hover:bg-slate-800'
      }`}
    >
      {children}
    </button>
  )
}

function Avatar({ name, url, size = 40 }: { name?: string; url?: string | null; size?: number }) {
  const initials = (name || 'U').trim().charAt(0).toUpperCase()
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0 overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2] shadow-sm relative"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
      {url && <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />}
    </div>
  )
}

function InfoRow({ icon, iconBg, label, value, onClick, isLast }: {
  icon?: React.ReactNode; iconBg?: string; label: string; value?: string | null; onClick?: () => void; isLast?: boolean
}) {
  return (
    <div
      onClick={onClick}
      className={`flex justify-between items-center px-3.5 py-2.5 min-h-[38px] transition-colors ${
        isLast ? '' : 'border-b border-slate-100'
      } ${onClick ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${iconBg || 'bg-slate-900'}`}>{icon}</div>}
        <span className="text-[13px] text-slate-800">{label}</span>
      </div>
      <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
        <span className="text-[13px] text-slate-900 truncate">{value || '-'}</span>
        {onClick && <ChevronRight size={12} className="text-slate-300 shrink-0" />}
      </div>
    </div>
  )
}

/* ============ PAGE ============ */

export function CompanyContent({ onClose, onMinimize, onMaximize }: { onClose: () => void; onMinimize: () => void; onMaximize?: () => void }) {
  const [activeNav, setActiveNav] = useState('grid')
  const [selectedDate, setSelectedDate] = useState(new Date().getDate())
  const [statsTab, setStatsTab] = useState<'Weekly' | 'Monthly'>('Weekly')
  const [notifTab, setNotifTab] = useState<'Overview' | 'Shared' | 'Comments'>('Overview')
  const [brainstormActive, setBrainstormActive] = useState(true)
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)

  // Data
  const [tenant, setTenant] = useState<any>(null)
  const [staffMembers, setStaffMembers] = useState<any[]>([])
  const [positions, setPositions] = useState<any[]>([])
  const [tenantRoles, setTenantRoles] = useState<any[]>([])
  const [allTenants, setAllTenants] = useState<any[]>([])
  const [isHubAdmin, setIsHubAdmin] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [socialContent, setSocialContent] = useState<SocialContentItem[]>([])
  const [projectStats, setProjectStats] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modals & form
  const [showEditModal, setShowEditModal] = useState(false)
  const [editField, setEditField] = useState('')
  const [editValue, setEditValue] = useState('')
  const [editError, setEditError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', slug: '', website: '', email: '', phoneNumber: '', address: '', category: 'umum' })
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignSearch, setAssignSearch] = useState('')
  const [assignResults, setAssignResults] = useState<any[]>([])
  const [assignLoading, setAssignLoading] = useState(false)
  const [assignRole, setAssignRole] = useState('member')
  const [assignJobTitle, setAssignJobTitle] = useState('')
  const [assignPositionId, setAssignPositionId] = useState('')
  const [editingJobId, setEditingJobId] = useState<string | null>(null)
  const [editingJobValue, setEditingJobValue] = useState('')
  const [showPositionModal, setShowPositionModal] = useState(false)
  const [positionForm, setPositionForm] = useState({ name: '', level: '0', parentId: '', defaultRoleId: '' })
  const [positionError, setPositionError] = useState('')
  const [positionSaving, setPositionSaving] = useState(false)

  /* ---------- load ---------- */

  useEffect(() => {
    let alive = true
    async function loadData() {
      try {
        const mod = await import('../../lib/endpoints')
        const [
          compRes, memRes, posRes, roleRes, notifRes, statRes, projRes, meRes, cliRes,
        ] = await Promise.all([
          mod.tenantsApi.getCurrent().catch(() => null),
          mod.membersApi.list().catch(() => null),
          mod.positionsApi.list().catch(() => null),
          mod.rolesApi.list().catch(() => null),
          mod.notificationsApi.list().catch(() => null),
          mod.projectsApi.stats().catch(() => null),
          mod.projectsApi.list().catch(() => null),
          mod.usersApi.getMe().catch(() => null),
          mod.clientsApi.list().catch(() => null),
        ])
        if (!alive) return

        setTenant((compRes as any)?.tenant ?? null)
        const sorted = ((memRes as any)?.members || []).sort((a: any, b: any) => {
          if (a.role === 'owner') return -1
          if (b.role === 'owner') return 1
          if (a.role === 'admin') return -1
          if (b.role === 'admin') return 1
          return 0
        })
        setStaffMembers(sorted)
        setPositions((posRes as any)?.positions || [])
        setTenantRoles((roleRes as any)?.roles || [])
        setNotifications((notifRes as any)?.notifications || [])
        setProjectStats((statRes as any)?.stats ?? null)
        setProjects((projRes as any)?.projects || [])
        setSocialContent(extractSocial((cliRes as any)?.clients || []))

        const u = (meRes as any)?.user || meRes
        if (u?.platformRole === 'hub-admin') {
          setIsHubAdmin(true)
          const d = await mod.tenantsApi.listAll().catch(() => null)
          if (alive) setAllTenants((d as any)?.tenants || [])
        }
      } catch (err: any) {
        if (alive) setError(err?.message || 'Gagal memuat data dashboard')
      } finally {
        if (alive) setLoading(false)
      }
    }
    loadData()
    return () => { alive = false }
  }, [])

  // Konten sosial: diambil dari handle sosial media milik client CRM
  // (clients.social_media: instagram / linkedin / twitter).
  // Konten sosial: handle sosial media milik client CRM (clients.social_media).
  // views/comments belum tersedia di backend → tampil '-' sampai ada sumber data.
  function extractSocial(clients: any[]): SocialContentItem[] {
    const items: SocialContentItem[] = []
    for (const c of clients) {
      const sm = c?.socialMedia || {}
      for (const platform of ['instagram', 'youtube', 'linkedin', 'twitter'] as const) {
        const handle = sm[platform]
        if (handle) {
          items.push({
            id: `${c.id}-${platform}`,
            title: c.name,
            platform,
            contentType: 'Post',
            badgeText: `@${handle}`,
            date: c.createdAt ? new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-',
            views: '-',
            comments: '-',
            thumbnailUrl: '',
          })
        }
      }
    }
    return items
  }

  /* ---------- actions ---------- */

  const loadStaff = () => {
    import('../../lib/endpoints').then(({ membersApi, positionsApi, rolesApi }) => {
      membersApi.list().then((data: any) => {
        const sorted = (data?.members || []).sort((a: any, b: any) => {
          if (a.role === 'owner') return -1
          if (b.role === 'owner') return 1
          if (a.role === 'admin') return -1
          if (b.role === 'admin') return 1
          return 0
        })
        setStaffMembers(sorted)
      }).catch(() => {})
      positionsApi.list().then((d: any) => setPositions(d?.positions || [])).catch(() => {})
      rolesApi.list().then((d: any) => setTenantRoles(d?.roles || [])).catch(() => {})
    })
  }

  const switchTo = async (t: any) => {
    try {
      await apiFetch('/api/tenants/switch', { method: 'POST', body: JSON.stringify({ tenantId: t.id }) })
      setPlatformMode(false)
      setTenantId(t.id)
      setTenant(t)
      loadStaff()
    } catch {}
  }

  const enablePlatformView = () => {
    setPlatformMode(true)
    setTenant(null)
    setStaffMembers([])
  }

  const openAssign = () => {
    setShowAssignModal(true)
    setAssignSearch(''); setAssignResults([]); setAssignRole('member'); setAssignJobTitle(''); setAssignPositionId('')
  }

  const handleSave = async () => {
    setSaving(true)
    setEditError('')
    try {
      const payload: Record<string, unknown> =
        editField === 'approvalThreshold'
          ? { approvalThreshold: Number(editValue || 0) }
          : { [editField]: editValue || null }
      const res: any = await tenantsApi.updateCurrent(payload)
      if (res && res.error) { setEditError(res.error); return }
      setTenant({ ...tenant, ...(res?.tenant || payload) })
      setShowEditModal(false)
    } catch {
      setEditError('Gagal menyimpan perubahan')
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (field: string, currentValue: string) => {
    setEditField(field)
    setEditValue(currentValue || '')
    setEditError('')
    setShowEditModal(true)
  }

  /* ---------- derived ---------- */

  const platformMode = isPlatformMode()
  const logoUrl = tenant?.logoUrl || ''
  const levelBuckets = [0, 1, 2].map((lvl) => positions.filter((p: any) => Number(p.level) === lvl).length)
  const today = new Date()
  const weekDates = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return d
  })
  const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

  // Statistik proyek (real). Bila daftar proyet termuat, angka memakai proyek
  // yang dibuat pada periode tab aktif (7 / 30 hari terakhir).
  const inPeriod = (iso?: string | null) => {
    if (!iso) return false
    const span = statsTab === 'Weekly' ? 7 : 30
    return new Date(iso).getTime() >= Date.now() - span * 24 * 60 * 60 * 1000
  }
  const scoped = projects.length > 0 ? projects.filter((p: any) => inPeriod(p.createdAt)) : null
  const statTotal = scoped ? scoped.length : (projectStats?.total ?? 0)
  const statCompleted = scoped ? scoped.filter((p: any) => p.status === 'completed').length : (projectStats?.completed ?? 0)
  const statInProgress = scoped
    ? scoped.filter((p: any) => ['active', 'planning', 'on_hold'].includes(p.status)).length
    : Math.max(0, (projectStats?.active ?? 0) + (projectStats?.planning ?? 0) + (projectStats?.onHold ?? 0))
  const impactPct = statTotal > 0 ? Math.round((statCompleted / statTotal) * 100) : 0
  const budget = projectStats?.totalBudget ?? 0
  const fmtBudget = budget >= 1_000_000
    ? `Rp ${(budget / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`
    : budget >= 1000
      ? `Rp ${(budget / 1000).toLocaleString('id-ID', { maximumFractionDigits: 0 })} rb`
      : `Rp ${budget.toLocaleString('id-ID')}`
  const budgetPct = statTotal > 0 ? Math.round((statCompleted / statTotal) * 100) : 0

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#eef0f3]" style={{ fontFamily: SF }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-purple-600" size={36} />
          <p className="text-sm font-medium text-slate-600">Memuat Bento Dashboard...</p>
        </div>
      </div>
    )
  }

  const navItems = [
    { id: 'video', icon: Video },
    { id: 'user', icon: User },
    { id: 'grid', icon: LayoutGrid },
    { id: 'bookmark', icon: Bookmark },
    { id: 'cloud', icon: Cloud },
    { id: 'monitor', icon: Monitor },
    { id: 'settings', icon: Settings },
    { id: 'phone', icon: Phone },
  ]

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#eef0f3] p-4 text-slate-800 antialiased" style={{ fontFamily: SF }}>

      {/* ============ SIDEBAR RAMPING ============ */}
      <aside className="w-20 bg-[#1c1d22] text-white flex flex-col items-center justify-between py-6 rounded-3xl shadow-2xl shrink-0 my-auto h-[96%] z-20">
        <div className="flex flex-col items-center gap-5">
          {/* traffic lights */}
          <div className="flex gap-1.5">
            {[
              { id: 'close', bg: 'from-[#ff5f57] to-[#e0443e]', fn: onClose },
              { id: 'min', bg: 'from-[#febc2e] to-[#dea123]', fn: onMinimize },
              { id: 'max', bg: 'from-[#28c840] to-[#1aab29]', fn: onMaximize },
            ].map((b) => (
              <button
                key={b.id}
                onClick={b.fn}
                onMouseEnter={() => setHoveredBtn(b.id)}
                onMouseLeave={() => setHoveredBtn(null)}
                className={`w-2.5 h-2.5 rounded-full bg-gradient-to-b ${b.bg} shadow-sm flex items-center justify-center`}
              >
                {hoveredBtn === b.id && <span className="w-1 h-1 rounded-full bg-black/40" />}
              </button>
            ))}
          </div>

          {/* logo */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-xl shadow-lg cursor-pointer">
            ⚡
          </div>

          {/* nav */}
          <nav className="flex flex-col items-center gap-3 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeNav === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNav(item.id)
                    if (item.id === 'user') openAssign()
                  }}
                  title={item.id === 'user' ? 'Tambah staff' : undefined}
                  className={`relative p-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                    isActive ? 'bg-[#d8cbf9] text-slate-900 shadow-md font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={20} />
                  {isActive && <span className="absolute -right-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#1c1d22] rounded-l-full" />}
                </button>
              )
            })}
          </nav>
        </div>

        {/* switch company (hub-admin) */}
        {isHubAdmin && allTenants.length > 0 && (
          <div className="flex flex-col items-center gap-2 mb-2 max-h-40 overflow-y-auto w-full px-2">
            {allTenants.slice(0, 8).map((t: any) => (
              <button
                key={t.id}
                onClick={() => switchTo(t)}
                title={t.name}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                  t.id === tenant?.id ? 'bg-[#d8cbf9] text-slate-900 ring-2 ring-white/20' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {(t.name || '?').charAt(0).toUpperCase()}
              </button>
            ))}
          </div>
        )}

        <button onClick={onClose} className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all cursor-pointer" title="Tutup window">
          <LogOut size={20} />
        </button>
      </aside>

      {/* ============ MAIN ============ */}
      <main className="flex-1 ml-4 overflow-y-auto pr-2">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl text-xs">
            {error} (menampilkan data cadangan bila tersedia)
          </div>
        )}

        <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-4 pb-6">

          {/* ===== BARIS 1: BANNER + KALENDER ===== */}
          <div className="col-span-8 bg-gradient-to-r from-[#dedaf7] via-[#f1e6f9] to-[#fce4ee] rounded-3xl p-6 relative overflow-hidden flex items-center justify-between shadow-sm">
            <div className="z-10 max-w-lg">
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-white/70 backdrop-blur-sm text-purple-800 px-3 py-1 rounded-full shadow-2xs mb-2">
                {platformMode
                  ? 'SEMUA TENANT (HUB-ADMIN)'
                  : (tenant?.category || tenant?.plan || 'PERUSAHAAN').toUpperCase()}
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {tenant?.name || (platformMode ? 'Semua Tenant' : 'Perusahaan')}
              </h1>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Kelola detail perusahaan, tim staff, dan struktur jabatan dari satu tempat.
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-4">
                <button onClick={openAssign} className="inline-flex items-center gap-2 bg-[#1c1d22] text-white px-4 py-2.5 rounded-full text-xs font-medium hover:bg-slate-800 transition-all shadow-md cursor-pointer">
                  <Plus size={15} /> Tambah staff
                </button>
                <button onClick={() => openEdit('logoUrl', logoUrl)} className="bg-white/80 hover:bg-white text-slate-800 px-4 py-2.5 rounded-full text-xs font-semibold shadow-2xs border border-slate-200/60 transition-all cursor-pointer">
                  Ganti logo
                </button>

                {/* Pemilih company (hub-admin) */}
                {isHubAdmin && (
                  <div className="flex items-center gap-1.5">
                    <Building2 size={13} className="text-slate-500" />
                    <select
                      value={platformMode ? '__platform__' : (tenant?.id || '')}
                      onChange={(e) => {
                        if (e.target.value === '__platform__') enablePlatformView()
                        else {
                          const t = allTenants.find((x: any) => x.id === e.target.value)
                          if (t) switchTo(t)
                        }
                      }}
                      className="bg-white/80 border border-slate-200/60 rounded-full text-[11px] font-semibold text-slate-700 px-3 py-1.5 outline-none cursor-pointer max-w-[170px]"
                      title="Pilih company aktif"
                    >
                      <option value="__platform__">Platform view (semua)</option>
                      {allTenants.map((t: any) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-80 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-indigo-300 blur-2xl transform rotate-45 scale-125" />
            </div>
            <div
              onClick={() => openEdit('logoUrl', logoUrl)}
              className="relative z-10 w-[74px] h-[74px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#1c1d22] to-[#3b3d4a] flex items-center justify-center text-white shadow-lg cursor-pointer shrink-0"
            >
              <Building2 size={30} className="absolute" />
              {logoUrl && <img src={logoUrl} alt="Logo" className="absolute inset-0 w-full h-full object-cover" />}
            </div>
          </div>

          {/* Kalender */}
          <div className="col-span-4 bg-white rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-base">{MONTHS[today.getMonth()]}, {today.getFullYear()}</h3>
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer"><ChevronLeft size={16} /></button>
                <button className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer"><ChevronRight size={16} /></button>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-1 text-center">
              {weekDates.map((d) => {
                const isToday = d.toDateString() === today.toDateString()
                const isSelected = isToday && selectedDate === d.getDate()
                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => setSelectedDate(d.getDate())}
                    className={`py-2 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected ? 'bg-[#1c1d22] text-white shadow-md' : isToday ? 'bg-[#d8cbf9] text-slate-900' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-medium opacity-70">{DAYS[d.getDay()]}</span>
                    <span className="text-xs font-bold mt-0.5">{d.getDate()}</span>
                  </button>
                )
              })}
            </div>
            {isHubAdmin && (
              <button
                onClick={() => (platformMode ? switchTo(allTenants[0]) : enablePlatformView())}
                className={`mt-3 w-full py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  platformMode ? 'bg-[#1c1d22] text-white' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                }`}
              >
                {platformMode ? 'Kembali ke company' : 'Platform view'}
              </button>
            )}
          </div>

          {/* ===== BARIS 2: MEMBERS, DATA, IMPACT, SOCIAL ===== */}
          {/* Members & Staff */}
          <div className="col-span-3 bg-white rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm">Members &amp; Staff</h3>
              <button onClick={openAssign} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer">
                <Plus size={16} />
              </button>
            </div>
            <div className="flex items-center justify-around gap-2 my-2">
              {staffMembers.length > 0 ? (
                staffMembers.slice(0, 3).map((m: any) => (
                  <div key={m.id} className="flex flex-col items-center text-center min-w-0">
                    <Avatar name={m.userFullName} url={m.userAvatarUrl} size={44} />
                    <span className="text-xs font-bold text-slate-800 mt-1.5 truncate max-w-[70px]">
                      {(m.userFullName || 'U').split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-purple-600 font-medium truncate max-w-[70px] bg-purple-50 px-1.5 py-0.5 rounded-md mt-0.5">
                      {m.role === 'hub-admin' ? 'Hub Admin' : m.role}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center">
                  <p className="text-xs text-slate-400 font-medium">Belum ada staff</p>
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">{staffMembers.length} staff terdaftar</span>
          </div>

          {/* Data (anggaran proyek) */}
          <div className="col-span-3 bg-white rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Data</span>
              <button className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer"><ArrowUpRight size={16} /></button>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{fmtBudget}</h2>
            <div className="space-y-2 mt-3">
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>{statTotal} proyek</span>
                <span className="text-emerald-600 font-semibold">{statCompleted} selesai</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                <div className="bg-[#1c1d22] h-full transition-all" style={{ width: `${budgetPct}%` }} />
                <div className="bg-[#d8cbf9] h-full transition-all" style={{ width: `${100 - budgetPct}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>{budgetPct}% tuntas</span>
                <span>{statInProgress} berjalan</span>
              </div>
            </div>
          </div>

          {/* Impact */}
          <div className="col-span-2 bg-white rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Impact</span>
              <span className="bg-[#1c1d22] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-2xs">+{impactPct}%</span>
            </div>
            <div className="flex items-end justify-center gap-3 h-24 my-auto pt-4">
              {[0, 1, 2].map((lvl) => {
                const v = levelBuckets[lvl]
                const max = Math.max(1, ...levelBuckets)
                return (
                  <div
                    key={lvl}
                    className={`w-5 rounded-t-lg transition-all ${lvl === 2 ? 'bg-[#9370db]' : lvl === 1 ? 'bg-[#d8cbf9]' : 'bg-slate-200'}`}
                    style={{ height: `${Math.max(10, (v / max) * 64)}px` }}
                  />
                )
              })}
            </div>
            <span className="text-[10px] text-slate-400 font-medium text-center">{positions.length} jabatan</span>
          </div>

          {/* Last content on social media */}
          <LastSocialContentCard
            items={socialContent}
            onAddClick={() => window.dispatchEvent(new Event('hub-nav-crm'))}
          />

          {/* ===== BARIS 3: STATISTICS (8) + NOTIF (4) ===== */}
          <div className="col-span-8 grid grid-cols-1 gap-4">
            {/* Statistics */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-lg">Statistics</h3>
                <div className="bg-slate-100 p-1 rounded-full flex gap-1 text-xs font-medium">
                  {(['Weekly', 'Monthly'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setStatsTab(tab)}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                        statsTab === tab ? 'bg-[#1c1d22] text-white shadow-sm' : 'text-slate-600'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{statTotal}</span>
                <span className="text-sm font-medium text-slate-500">proyek {statsTab === 'Weekly' ? '7 hari' : '30 hari'} terakhir</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4 border border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-500">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-slate-900">{statCompleted}</h4>
                    <p className="text-xs text-slate-500 font-medium">Project complete</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4 border border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500">
                    <CircleDashed size={24} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-slate-900">{statInProgress}</h4>
                    <p className="text-xs text-slate-500 font-medium">Project in progress</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Promo + Brainstorm */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl p-6 shadow-sm flex items-center justify-between relative overflow-hidden">
                <div className="z-10">
                  <h3 className="text-base font-bold text-slate-900">Unleash Your Potential</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4">Kelola perusahaan dengan lebih terstruktur.</p>
                  <button onClick={() => { setPositionForm({ name: '', level: '0', parentId: '', defaultRoleId: '' }); setPositionError(''); setShowPositionModal(true) }} className="bg-[#eef0f3] hover:bg-slate-200 text-slate-800 text-xs font-semibold px-4 py-2.5 rounded-full transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer">
                    <ArrowUpRight size={14} /> Tambah jabatan
                  </button>
                </div>
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-purple-300 via-pink-200 to-indigo-300 flex items-center justify-center shadow-inner overflow-hidden">
                  <div className="w-full h-full opacity-60 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-purple-400 transform rotate-12" />
                </div>
              </div>

              {brainstormActive && (
                <div className="bg-[#1c1d22] text-white rounded-3xl p-4 shadow-lg flex items-center justify-between my-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">🧠</div>
                    <div>
                      <h4 className="text-sm font-bold">Breakthrough Brainstorm</h4>
                      <p className="text-[11px] text-slate-400">Rapat internal terjadwal</p>
                    </div>
                  </div>
                  <button onClick={() => setBrainstormActive(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-all cursor-pointer">
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="col-span-4 bg-white rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900">Notifications</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {notifications.filter((n: any) => !n.read).length} baru
                  </span>
                  <Bell size={16} className="cursor-pointer text-slate-400 hover:text-slate-600" />
                </div>
              </div>

              <div className="flex gap-4 border-b border-slate-100 pb-2 mb-4 text-xs font-semibold">
                {(['Overview', 'Shared', 'Comments'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setNotifTab(tab)}
                    className={`pb-1 transition-all relative cursor-pointer ${
                      notifTab === tab ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab}
                    {notifTab === tab && <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-slate-900 rounded-full" />}
                  </button>
                ))}
              </div>

              <div className="space-y-3.5">
                {notifications.length > 0 ? (
                  notifications.slice(0, 8).map((item: any) => (
                    <div key={item.id} className={`flex items-start gap-3 pb-3 border-b border-slate-100/80 ${item.read ? 'opacity-60' : ''}`}>
                      <Avatar name="Hub" size={36} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-800 font-medium leading-relaxed">
                          <strong className="font-semibold text-slate-900">Hub</strong>{' '}
                          <span className="text-indigo-600">{item.title}</span>
                          {item.message ? ` — ${item.message}` : ''}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {item.createdAt ? new Date(item.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                          {!item.read && (
                            <button
                              onClick={async () => {
                                await import('../../lib/endpoints').then(({ notificationsApi }) => notificationsApi.markRead(item.id))
                                setNotifications(prev => prev.map((x: any) => x.id === item.id ? { ...x, read: true } : x))
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-full transition-all"
                            >
                              <CheckCircle2 size={10} /> Dibaca
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">Tidak ada notifikasi baru.</p>
                )}
              </div>
            </div>
          </div>

          {/* ===== BARIS 4: DETAIL PERUSAHAAN (8) + STAFF MGMT (4) ===== */}
          {/* Detail perusahaan */}
          <div className="col-span-8 bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-lg">Detail perusahaan</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                <ShieldCheck size={12} /> {tenant?.status === 'active' ? 'Aktif' : tenant?.status || '—'}
              </span>
            </div>
            <div className="bg-slate-50 rounded-2xl overflow-hidden">
              <InfoRow icon={<Building2 size={12} color="white" />} iconBg="bg-gradient-to-br from-blue-500 to-blue-700" label="Nama" value={tenant?.name} onClick={() => openEdit('name', tenant?.name)} />
              <InfoRow icon={<Mail size={12} color="white" />} iconBg="bg-gradient-to-br from-orange-400 to-orange-600" label="Email" value={tenant?.email} onClick={() => openEdit('email', tenant?.email)} />
              <InfoRow icon={<Phone size={12} color="white" />} iconBg="bg-gradient-to-br from-emerald-400 to-emerald-600" label="Telepon" value={tenant?.phoneNumber} onClick={() => openEdit('phoneNumber', tenant?.phoneNumber)} />
              <InfoRow icon={<Globe size={12} color="white" />} iconBg="bg-gradient-to-br from-indigo-500 to-indigo-700" label="Website" value={tenant?.website} onClick={() => openEdit('website', tenant?.website)} />
              <InfoRow icon={<MapPin size={12} color="white" />} iconBg="bg-gradient-to-br from-red-500 to-rose-700" label="Alamat" value={tenant?.address} onClick={() => openEdit('address', tenant?.address)} />
            </div>
            <div className="bg-slate-50 rounded-2xl overflow-hidden mt-3">
              <InfoRow icon={<MapPin size={12} color="white" />} iconBg="bg-gradient-to-br from-rose-500 to-rose-700" label="Google Maps" value={tenant?.gmapLink ? 'Tersedia' : 'Belum diatur'} onClick={() => openEdit('gmapLink', tenant?.gmapLink)} />
              <InfoRow icon={<Cloud size={12} color="white" />} iconBg="bg-gradient-to-br from-sky-500 to-sky-700" label="Google Drive" value={tenant?.gdriveLink ? 'Tersedia' : 'Belum diatur'} onClick={() => openEdit('gdriveLink', tenant?.gdriveLink)} isLast />
            </div>
            <div className="bg-slate-50 rounded-2xl overflow-hidden mt-3">
              <InfoRow icon={<FileText size={12} color="white" />} iconBg="bg-gradient-to-br from-slate-400 to-slate-600" label="NPWP" value={tenant?.taxId} onClick={() => openEdit('taxId', tenant?.taxId)} />
              <InfoRow
                icon={<FileText size={12} color="white" />}
                iconBg="bg-gradient-to-br from-orange-400 to-orange-600"
                label="Batas Approval Owner"
                value={tenant?.approvalThreshold != null ? `Rp ${Number(tenant.approvalThreshold).toLocaleString('id-ID')}` : 'Rp 10.000.000'}
                onClick={() => openEdit('approvalThreshold', String(tenant?.approvalThreshold ?? 10000000))}
              />
              <InfoRow icon={<Palette size={12} color="white" />} iconBg="bg-gradient-to-br from-purple-500 to-purple-700" label="Plan" value={tenant?.plan?.toUpperCase()} isLast />
            </div>
          </div>

          {/* Staff management */}
          <div className="col-span-4 bg-white rounded-3xl p-5 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <Users size={14} color="white" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Staff ({staffMembers.length})</h3>
              </div>
              <button onClick={openAssign} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer">
                <Plus size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[300px] -mx-2 px-2">
              {staffMembers.length === 0 ? (
                <div className="py-8 text-center text-[12px] text-slate-400">Belum ada staff</div>
              ) : (
                staffMembers.map((m: any, i: number) => (
                  <div key={m.id} className={`flex items-center justify-between gap-2 py-2.5 ${i < staffMembers.length - 1 ? 'border-b border-slate-100' : ''}`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar name={m.userFullName} url={m.userAvatarUrl} size={32} />
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-slate-900 truncate">{m.userFullName}</div>
                        {editingJobId === m.id ? (
                          <input
                            autoFocus
                            value={editingJobValue}
                            onChange={(e) => setEditingJobValue(e.target.value)}
                            onBlur={async () => {
                              const v = editingJobValue.trim()
                              setEditingJobId(null)
                              if (v !== (m.jobTitle || '')) {
                                const res: any = await import('../../lib/endpoints').then(({ membersApi }) => membersApi.updateJobTitle(m.id, v || null))
                                if (!res?.error) setStaffMembers(prev => prev.map((x: any) => x.id === m.id ? { ...x, jobTitle: v || null } : x))
                              }
                            }}
                            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setEditingJobId(null) }}
                            placeholder="Jabatan, cth. Finance Manager"
                            className="text-[11px] text-slate-900 border border-slate-200 rounded-lg px-2 py-1 outline-none w-full"
                          />
                        ) : (
                          <div onClick={() => { setEditingJobId(m.id); setEditingJobValue(m.jobTitle || '') }} title="Klik untuk edit jabatan" className="text-[11px] text-slate-400 truncate cursor-text hover:text-slate-600">
                            {m.userEmail}{m.jobTitle ? ` · ${m.jobTitle}` : ''}{m.positionName ? ` · ${m.positionName}` : ''}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isHubAdmin || (m.role !== 'owner' && m.role !== 'hub-admin') ? (
                        <>
                          <select
                            value={m.role}
                            onChange={async (e) => {
                              const next = e.target.value
                              const res: any = await import('../../lib/endpoints').then(({ membersApi }) => membersApi.updateRole(m.id, next))
                              if (!res?.error) setStaffMembers(prev => prev.map((x: any) => x.id === m.id ? { ...x, role: next } : x))
                              else alert(res.error || 'Gagal mengubah role')
                            }}
                            title="Ubah role"
                            className={`rounded-full text-[10px] font-semibold px-2 py-1 border-0 outline-none cursor-pointer ${
                              m.role === 'admin' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                            <option value="owner">Owner</option>
                          </select>
                          {positions.length > 0 && (
                            <select
                              value={m.positionId || ''}
                              onChange={async (e) => {
                                const next = e.target.value || null
                                const res: any = await import('../../lib/endpoints').then(({ membersApi }) => membersApi.updatePosition(m.id, next))
                                if (!res?.error) {
                                  const pos = positions.find((p: any) => p.id === next)
                                  setStaffMembers(prev => prev.map((x: any) => x.id === m.id ? { ...x, positionId: next, positionName: pos?.name || null } : x))
                                } else alert(res.error || 'Gagal mengubah posisi')
                              }}
                              title="Ubah posisi struktural"
                              className="max-w-[110px] rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-1 border-0 outline-none cursor-pointer"
                            >
                              <option value="">Tanpa posisi</option>
                              {positions.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          )}
                          <button
                            onClick={async () => {
                              if (!confirm(`Remove ${m.userFullName} from this company?`)) return
                              try {
                                const res: any = await import('../../lib/endpoints').then(({ membersApi }) => membersApi.remove(m.id))
                                if (res?.error) { alert(res.error); return }
                                setStaffMembers(prev => prev.filter((x: any) => x.id !== m.id))
                              } catch {}
                            }}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          m.role === 'owner' ? 'bg-orange-50 text-orange-500' : 'bg-purple-50 text-purple-500'
                        }`}>
                          {m.role === 'hub-admin' ? 'Hub Admin' : m.role}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ===== BARIS 5: JABATAN ===== */}
          <div className="col-span-12 bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                  <Building2 size={14} color="white" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Jabatan ({positions.length})</h3>
              </div>
              <GhostBtn onClick={() => { setPositionForm({ name: '', level: '0', parentId: '', defaultRoleId: '' }); setPositionError(''); setShowPositionModal(true) }}>
                <Plus size={13} className="inline mr-1" />Tambah
              </GhostBtn>
            </div>
            {positions.length === 0 ? (
              <div className="py-6 text-center text-[12px] text-slate-400">Belum ada jabatan. Tambah cth. Direktur, Manager, Staff.</div>
            ) : (
              (() => {
                const byId = new Map(positions.map((p: any) => [p.id, p]))
                const depthOf = (p: any) => {
                  let d = 0
                  let cur: any = p
                  const seen = new Set<string>()
                  while (cur?.parentId && byId.has(cur.parentId) && !seen.has(cur.parentId)) {
                    seen.add(cur.parentId)
                    d++
                    cur = byId.get(cur.parentId)
                  }
                  return d
                }
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    {positions.map((p: any) => {
                      const depth = depthOf(p)
                      const parentName = p.parentId ? (byId.get(p.parentId) as any)?.name || null : null
                      return (
                        <div key={p.id} className="flex items-center justify-between gap-2 py-2.5 border-b border-slate-100" style={{ paddingLeft: depth * 16 }}>
                          <div className="min-w-0">
                            <div className="text-[13px] text-slate-900 truncate">{depth > 0 ? '↳ ' : ''}{p.name}</div>
                            <div className="text-[11px] text-slate-400">
                              Level {p.level}{parentName ? ` · Atasan: ${parentName}` : ''}{p.defaultRoleName ? ` · Role: ${p.defaultRoleName}` : ''}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {tenantRoles.length > 0 && (
                              <select
                                value={p.defaultRoleId || ''}
                                onChange={async (e) => {
                                  const next = e.target.value || null
                                  const res: any = await import('../../lib/endpoints').then(({ positionsApi }) => positionsApi.update(p.id, { defaultRoleId: next }))
                                  if (!res?.error) {
                                    const rn = tenantRoles.find((r: any) => r.id === next)?.name || null
                                    setPositions(prev => prev.map((x: any) => x.id === p.id ? { ...x, defaultRoleId: next, defaultRoleName: rn } : x))
                                  } else alert(res.error || 'Gagal mengubah role default')
                                }}
                                title="Role akses default"
                                className="max-w-[130px] rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold px-2 py-1 border-0 outline-none cursor-pointer"
                              >
                                <option value="">Tanpa role</option>
                                {tenantRoles.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                              </select>
                            )}
                            <button
                              onClick={async () => {
                                if (!confirm(`Delete posisi "${p.name}"?`)) return
                                const res: any = await import('../../lib/endpoints').then(({ positionsApi }) => positionsApi.remove(p.id))
                                if (res?.error) alert(res.error)
                                else setPositions(prev => prev.filter((x: any) => x.id !== p.id))
                              }}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()
            )}
          </div>
        </div>
      </main>

      {/* ============ MODALS ============ */}

      {showEditModal && (
        <Modal
          title={
            editField === 'approvalThreshold' ? 'Edit Batas Approval Owner' :
            editField === 'logoUrl' ? 'Edit Logo' :
            editField === 'gmapLink' ? 'Edit Google Maps Link' :
            editField === 'gdriveLink' ? 'Edit Google Drive Link' :
            editField === 'taxId' ? 'Edit NPWP' :
            editField === 'phoneNumber' ? 'Edit Telepon' :
            'Edit ' + editField.charAt(0).toUpperCase() + editField.slice(1)
          }
          onClose={() => setShowEditModal(false)}
        >
          {editField === 'approvalThreshold' && (
            <p className="text-[12px] text-slate-500 mb-3 leading-relaxed">Pengajuan di atas nominal ini otomatis naik ke Owner dalam rantai persetujuan (PR/PO).</p>
          )}
          {editError && <div className="rounded-xl bg-red-50 px-3 py-2 text-[12px] text-red-600 mb-3">{editError}</div>}
          <Field label="Nilai">
            <input
              type={editField === 'email' ? 'email' : editField === 'approvalThreshold' ? 'number' : 'text'}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
              autoFocus
              placeholder={
                editField === 'logoUrl' ? 'https://example.com/logo.png' :
                editField === 'gmapLink' ? 'https://maps.google.com/...' :
                editField === 'gdriveLink' ? 'https://drive.google.com/...' :
                editField === 'email' ? 'email@perusahaan.com' :
                editField === 'phoneNumber' ? '+62 812 3456 7890' :
                editField === 'website' ? 'https://perusahaan.com' :
                editField === 'taxId' ? '00.000.000.0-000.000' :
                editField === 'approvalThreshold' ? '10000000' : ''
              }
              className={inputCls}
            />
          </Field>
          <div className="flex justify-end gap-2 mt-5">
            <GhostBtn onClick={() => setShowEditModal(false)}>Batal</GhostBtn>
            <SolidBtn onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</SolidBtn>
          </div>
        </Modal>
      )}

      {showCreateModal && (
        <Modal title="New Company" onClose={() => setShowCreateModal(false)} width={460}>
          {createError && <div className="rounded-xl bg-red-50 px-3 py-2 text-[12px] text-red-600 mb-3">{createError}</div>}
          <Field label="Kategori usaha">
            <select value={(createForm as any).category || 'umum'} onChange={(e) => setCreateForm(p => ({ ...p, category: e.target.value }))} className={selectCls}>
              <option value="jasa-lapangan">Jasa Lapangan (pest control, kanopi, servis)</option>
              <option value="hotel">Hotel / Penginapan</option>
              <option value="konsultan">Konsultan / Arsitek</option>
              <option value="umum">Umum / Lainnya</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1.5">Menentukan role &amp; jabatan bawaan. Bisa diubah setelah dibuat.</p>
          </Field>
          {[
            { key: 'name', label: 'Company Name', placeholder: 'PT Maju Jaya' },
            { key: 'slug', label: 'Slug', placeholder: 'pt-maju-jaya' },
            { key: 'website', label: 'Website', placeholder: 'https://example.com' },
            { key: 'email', label: 'Email', placeholder: 'info@example.com' },
            { key: 'phoneNumber', label: 'Phone', placeholder: '+62 812 3456 7890' },
            { key: 'address', label: 'Address', placeholder: 'Jl. Sudirman No. 123, Jakarta' },
          ].map(f => (
            <Field key={f.key} label={f.label}>
              <input
                type="text"
                value={(createForm as any)[f.key]}
                onChange={(e) => setCreateForm(p => ({ ...p, [f.key]: f.key === 'slug' ? e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') : e.target.value }))}
                placeholder={f.placeholder}
                className={inputCls}
              />
            </Field>
          ))}
          <div className="flex justify-end gap-2 mt-5">
            <GhostBtn onClick={() => setShowCreateModal(false)}>Batal</GhostBtn>
            <SolidBtn
              tone="green"
              disabled={creating}
              onClick={async () => {
                if (!createForm.name || !createForm.slug) { setCreateError('Name and slug required'); return }
                setCreating(true); setCreateError('')
                try {
                  const res = await tenantsApi.create(createForm)
                  if (res.error) { setCreateError(res.error); return }
                  setShowCreateModal(false)
                  const d = await tenantsApi.listAll()
                  setAllTenants(d?.tenants || [])
                  if (res.tenant) {
                    await apiFetch('/api/tenants/switch', { method: 'POST', body: JSON.stringify({ tenantId: res.tenant.id }) })
                    setPlatformMode(false)
                    setTenantId(res.tenant.id)
                    setTenant(res.tenant)
                    loadStaff()
                  }
                } catch (e: any) { setCreateError(e?.message || 'Failed') } finally { setCreating(false) }
              }}
            >
              {creating ? 'Creating...' : 'Create'}
            </SolidBtn>
          </div>
        </Modal>
      )}

      {showAssignModal && (
        <Modal title="Assign Staff" onClose={() => setShowAssignModal(false)} width={440}>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Field label="Role">
              <select value={assignRole} onChange={(e) => setAssignRole(e.target.value)} className={selectCls}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>
            </Field>
            <Field label="Posisi">
              <select value={assignPositionId} onChange={(e) => setAssignPositionId(e.target.value)} className={selectCls}>
                <option value="">Tanpa posisi</option>
                {positions.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Jabatan (opsional)">
            <input type="text" value={assignJobTitle} onChange={(e) => setAssignJobTitle(e.target.value)} placeholder="cth. Finance Manager" className={inputCls} />
          </Field>
          <Field label="Cari user">
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={assignSearch}
                onChange={(e) => {
                  setAssignSearch(e.target.value)
                  if (e.target.value.length >= 2) {
                    setAssignLoading(true)
                    import('../../lib/endpoints').then(({ usersApi }) => {
                      usersApi.list(e.target.value).then((data: any) => {
                        const memberIds = staffMembers.map((m: any) => m.userId)
                        setAssignResults((data?.users || []).filter((u: any) => !memberIds.includes(u.id)))
                      }).catch(() => {}).finally(() => setAssignLoading(false))
                    })
                  } else setAssignResults([])
                }}
                placeholder="Nama atau email..."
                className={`${inputCls} pl-9`}
              />
            </div>
          </Field>
          {assignLoading && <div className="py-6 text-center text-[12px] text-slate-400">Mencari...</div>}
          {!assignLoading && assignResults.length > 0 && (
            <div className="max-h-52 overflow-y-auto space-y-1.5">
              {assignResults.slice(0, 5).map((u: any) => (
                <div key={u.id} className="flex items-center justify-between gap-2 p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={u.fullName} size={30} />
                    <div className="min-w-0">
                      <div className="text-[13px] text-slate-900 truncate">{u.fullName}</div>
                      <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const res: any = await import('../../lib/endpoints').then(({ membersApi }) => membersApi.add({ userId: u.id, role: assignRole, jobTitle: assignJobTitle.trim() || undefined, positionId: assignPositionId || undefined }))
                        if (res?.error) { alert(res.error); return }
                        const data = await import('../../lib/endpoints').then(({ membersApi }) => membersApi.list())
                        setStaffMembers(data?.members || [])
                        setAssignResults(prev => prev.filter((x: any) => x.id !== u.id))
                        setAssignSearch('')
                      } catch { alert('Failed to assign') }
                    }}
                    className="shrink-0 px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white text-[12px] font-medium transition-colors"
                  >
                    Assign
                  </button>
                </div>
              ))}
            </div>
          )}
          {!assignLoading && assignSearch.length >= 2 && assignResults.length === 0 && (
            <div className="py-6 text-center text-[12px] text-slate-400">User tidak ditemukan</div>
          )}
          <div className="flex justify-end mt-5">
            <GhostBtn onClick={() => setShowAssignModal(false)}>Tutup</GhostBtn>
          </div>
        </Modal>
      )}

      {showPositionModal && (
        <Modal title="Tambah Jabatan" onClose={() => setShowPositionModal(false)} width={440}>
          {positionError && <div className="rounded-xl bg-red-50 px-3 py-2 text-[12px] text-red-600 mb-3">{positionError}</div>}
          <Field label="Nama jabatan">
            <input type="text" value={positionForm.name} onChange={(e) => setPositionForm(p => ({ ...p, name: e.target.value }))} placeholder="cth. Finance Manager" autoFocus className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Level (besar = tinggi)">
              <input type="number" min={0} value={positionForm.level} onChange={(e) => setPositionForm(p => ({ ...p, level: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Atasan (opsional)">
              <select value={positionForm.parentId} onChange={(e) => setPositionForm(p => ({ ...p, parentId: e.target.value }))} className={selectCls}>
                <option value="">Tanpa atasan</option>
                {positions.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Role akses default (opsional)">
            <select value={positionForm.defaultRoleId} onChange={(e) => setPositionForm(p => ({ ...p, defaultRoleId: e.target.value }))} className={selectCls}>
              <option value="">Tanpa role</option>
              {tenantRoles.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </Field>
          <div className="flex justify-end gap-2 mt-5">
            <GhostBtn onClick={() => setShowPositionModal(false)}>Batal</GhostBtn>
            <SolidBtn
              disabled={positionSaving}
              onClick={async () => {
                if (!positionForm.name.trim()) { setPositionError('Nama jabatan wajib diisi'); return }
                setPositionSaving(true); setPositionError('')
                try {
                  const res: any = await import('../../lib/endpoints').then(({ positionsApi }) => positionsApi.create({
                    name: positionForm.name.trim(),
                    level: Math.max(0, parseInt(positionForm.level || '0', 10) || 0),
                    parentId: positionForm.parentId || null,
                    defaultRoleId: positionForm.defaultRoleId || null,
                  }))
                  if (res?.error) { setPositionError(res.error); return }
                  setShowPositionModal(false)
                  const d: any = await import('../../lib/endpoints').then(({ positionsApi }) => positionsApi.list())
                  setPositions(d?.positions || [])
                } catch (e: any) { setPositionError(e?.message || 'Gagal menyimpan') } finally { setPositionSaving(false) }
              }}
            >
              {positionSaving ? 'Menyimpan...' : 'Simpan'}
            </SolidBtn>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default CompanyContent
