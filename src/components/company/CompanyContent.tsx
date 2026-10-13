import { useState, useEffect } from 'react'
import {
  User, Plus,
  ChevronLeft, ChevronRight, Bell, ArrowUpRight, X, CheckCircle2, Loader2, Search,
} from 'lucide-react'
import LastSocialContentCard, { type SocialContentItem } from './LastSocialContentCard'
import MembersStaffCard from './MembersStaffCard'
import StatisticsSection from './StatisticsSection'
import TopBannerCard from './TopBannerCard'
import AddStaffModal from './AddStaffModal'
import CompanyOverviewCard from './CompanyOverviewCard'
import StructureCard from './StructureCard'
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

/* ============ PAGE ============ */

export function CompanyContent({ onClose, onMinimize, onMaximize }: { onClose: () => void; onMinimize: () => void; onMaximize?: () => void }) {
  const [statsTab, setStatsTab] = useState<'Weekly' | 'Monthly'>('Weekly')
  const [notifTab, setNotifTab] = useState<'Overview' | 'Shared' | 'Comments'>('Overview')
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
  const [showPositionModal, setShowPositionModal] = useState(false)
  const [showAddStaff, setShowAddStaff] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
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

          {/* Aksi tunggal: assign user yang SUDAH punya akun (beda dari
              tombol "Add member" di banner yang membuat user baru). */}
          <button
            onClick={openAssign}
            title="Assign staff yang sudah punya akun"
            className="mt-2 p-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            <User size={20} />
          </button>
        </div>

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
          <TopBannerCard
            companyName={tenant?.name || (platformMode ? 'Semua Tenant' : 'Perusahaan')}
            onAddMember={() => setShowAddStaff(true)}
            pickerOpen={pickerOpen}
            onPickerToggle={setPickerOpen}
            titlePicker={
              isHubAdmin ? (
                <>
                  <button
                    onClick={() => { enablePlatformView(); setPickerOpen(false) }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-[12px] font-medium transition-colors flex items-center justify-between ${
                      platformMode ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Platform view (semua tenant)
                    {platformMode && <span className="text-[9px] font-bold uppercase">aktif</span>}
                  </button>
                  <div className="h-px bg-slate-100 my-1" />
                  {allTenants.map((t: any) => (
                    <button
                      key={t.id}
                      onClick={() => { switchTo(t); setPickerOpen(false) }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-[12px] transition-colors flex items-center gap-2 ${
                        t.id === tenant?.id ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {/* Logo company, fallback inisial */}
                      <span className="w-6 h-6 rounded-lg bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0 overflow-hidden border border-slate-200 relative">
                        {t.logoUrl ? (
                          <img
                            src={t.logoUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                          />
                        ) : null}
                        <span className={t.logoUrl ? 'absolute' : ''}>{(t.name || '?').charAt(0).toUpperCase()}</span>
                      </span>
                      <span className="truncate">{t.name}</span>
                    </button>
                  ))}
                  <div className="h-px bg-slate-100 my-1" />
                  <button
                    onClick={() => { setPickerOpen(false); setShowCreateModal(true) }}
                    className="w-full text-left px-3 py-2 rounded-xl text-[12px] font-bold text-purple-600 hover:bg-purple-50 transition-colors flex items-center gap-1.5"
                  >
                    <Plus size={13} /> Tambah company baru
                  </button>
                </>
              ) : undefined
            }
          />

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
                return (
                  <div
                    key={d.toISOString()}
                    className={`py-2.5 rounded-2xl flex flex-col items-center justify-center transition-all ${
                      isToday ? 'bg-[#1c1d22] text-white shadow-md' : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-medium opacity-70">{DAYS[d.getDay()]}</span>
                    <span className="text-xs font-bold mt-0.5">{d.getDate()}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ===== BARIS 2: MEMBERS, DATA, IMPACT, SOCIAL ===== */}
          {/* Members & Staff */}
          <MembersStaffCard
            members={staffMembers.map((m: any) => ({
              id: m.id,
              name: m.userFullName || 'Staff',
              role: m.role === 'hub-admin' ? 'Hub Admin' : m.role,
              avatarUrl: m.userAvatarUrl || null,
            }))}
            isLoading={loading && staffMembers.length === 0}
            onAddMember={() => setShowAddStaff(true)}
          />

          {/* Data */}
          <div className="col-span-3 bg-white rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Data</span>
              <button className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200">
                <ArrowUpRight size={14} />
              </button>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{fmtBudget}</h2>
            <div className="space-y-2 mt-2">
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>{statTotal} proyek</span>
                <span className="text-emerald-600 font-bold">{statCompleted} selesai</span>
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
              <span className="bg-[#1c1d22] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-2xs">+{impactPct}%</span>
            </div>
            <div className="flex items-end justify-center gap-2.5 h-24 my-auto pt-2">
              {[0, 1, 2].map((lvl) => {
                const v = levelBuckets[lvl]
                const max = Math.max(1, ...levelBuckets)
                const heights = [40, 64, 88]
                return (
                  <div
                    key={lvl}
                    className={`w-5 rounded-t-lg transition-all ${lvl === 2 ? 'bg-[#9370db]' : lvl === 1 ? 'bg-[#d8cbf9]' : 'bg-slate-200'}`}
                    style={{ height: `${Math.max(16, (v / max) * heights[lvl])}px` }}
                  />
                )
              })}
            </div>
          </div>

          {/* Last content on social media */}
          <LastSocialContentCard
            items={socialContent}
            onAddClick={() => window.dispatchEvent(new Event('hub-nav-crm'))}
          />

          {/* ===== BARIS 3: STATISTICS (8) + NOTIF (4) ===== */}
          <StatisticsSection
            stats={{
              totalTasks: statTotal,
              completedProjects: statCompleted,
              inProgressProjects: statInProgress,
            }}
            summaryLabel={`proyek ${statsTab === 'Weekly' ? '7 hari' : '30 hari'} terakhir`}
            statsTab={statsTab}
            onStatsTabChange={setStatsTab}
            onUpgradeClick={() => setShowPlanModal(true)}
          />

          {/* Notifications */}
          <div className="col-span-4 rounded-3xl p-5 flex flex-col justify-between w-full">
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
                    <div key={item.id} className={`flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-100/80 shadow-2xs ${item.read ? 'opacity-60' : ''}`}>
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

          {/* ===== BARIS 4: OVERVIEW (8) + STRUKTUR JABATAN (4) ===== */}
          <CompanyOverviewCard
            company={tenant}
            logoUrl={logoUrl}
            onEditLogo={() => openEdit('logoUrl', logoUrl)}
            onEditField={(field: 'name' | 'email' | 'phoneNumber' | 'address' | 'approvalThreshold') => openEdit(field, (tenant as any)?.[field])}
            onEditGmap={() => openEdit('gmapLink', tenant?.gmapLink)}
            onEditGdrive={() => openEdit('gdriveLink', tenant?.gdriveLink)}
          />
          <StructureCard
            positions={positions}
            roles={tenantRoles}
            isLoading={loading && positions.length === 0}
            onAdd={() => { setPositionForm({ name: '', level: '0', parentId: '', defaultRoleId: '' }); setPositionError(''); setShowPositionModal(true) }}
            onDelete={async (id) => {
              if (!confirm('Hapus jabatan ini?')) return
              const res: any = await import('../../lib/endpoints').then(({ positionsApi }) => positionsApi.remove(id))
              if (res?.error) alert(res.error)
              else setPositions(prev => prev.filter((x: any) => x.id !== id))
            }}
            onRoleChange={async (id, roleId) => {
              const res: any = await import('../../lib/endpoints').then(({ positionsApi }) => positionsApi.update(id, { defaultRoleId: roleId }))
              if (res?.error) { alert(res.error); return }
              const rn = tenantRoles.find((r: any) => r.id === roleId)?.name || null
              setPositions(prev => prev.map((x: any) => x.id === id ? { ...x, defaultRoleId: roleId, defaultRoleName: rn } : x))
            }}
          />

        </div>
      </main>

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

      <AddStaffModal
        open={showAddStaff}
        onClose={() => setShowAddStaff(false)}
        positions={positions}
        onCreated={loadStaff}
      />

      {showPlanModal && (
        <Modal title="Plan & Langganan" onClose={() => setShowPlanModal(false)} width={420}>
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-3 flex items-center justify-between">
            <span className="text-[12px] font-semibold text-slate-600">Plan aktif perusahaan</span>
            <span className="text-[12px] font-bold text-slate-900 uppercase">{tenant?.plan || '-'}</span>
          </div>
          <p className="text-[12px] text-slate-500 leading-relaxed mb-4">
            Upgrade plan menambah kuota user, modul, dan fitur lanjutan. Hubungi hub-admin untuk mengubah paket
            perusahaan ini.
          </p>
          <div className="flex justify-end">
            <SolidBtn onClick={() => setShowPlanModal(false)}>Mengerti</SolidBtn>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default CompanyContent
