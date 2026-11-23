import { useState, useEffect, useMemo, useRef } from 'react'
import ProgressHeatmapCard, { type ProgressEvent } from './company/ProgressHeatmapCard'
import {
  LayoutGrid,
  Rows3,
  MoreHorizontal,
  Users,
  ChevronDown,
  ChevronUp,
  Folder,
  Building2,
  TrendingUp,
  Wallet,
  Loader2,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  SlidersHorizontal,
  ArrowLeft,
  ArrowRight,
  Check,
  Flag,
  Calendar,
} from 'lucide-react';
import { projectsApi, tasksApi, membersApi, clientsApi, tagsApi } from '../lib/endpoints'
import { isPlatformMode } from '../lib/api'
import { canAccessPerm, fetchAccess, type AccessCtx, FALLBACK_ACCESS } from '../lib/access'

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"

// Platform sosmed + logo — checkbox channel di modal task social_media
const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', logo: '/icons/social/instagram.png' },
  { key: 'tiktok', label: 'TikTok', logo: '/icons/social/tiktok.png' },
  { key: 'youtube', label: 'YouTube', logo: '/icons/social/youtube.png' },
  { key: 'youtube_shorts', label: 'YouTube Shorts', logo: '/icons/social/youtube-shorts.png' },
  { key: 'threads', label: 'Threads', logo: '/icons/social/threads.png' },
  { key: 'x', label: 'X', logo: '/icons/social/x.png' },
  { key: 'facebook', label: 'Facebook', logo: '/icons/social/facebook.png' },
] as const

interface TaskItem {
  id: string;
  title: string;
  author: string;
  avatar: string | null;
  date: string;
  bgColor: string;
  progress: number;
  subtasks: string[];
  columnId: string;
  // Untuk chip priority + tanda overdue di kartu.
  priority?: string;
  dueDateRaw?: string | null;
  // Client yang di-handle project (null = internal/tanpa client).
  clientName?: string | null;
  // Kategori task (general / social_media / ...)
  taskType?: string;
  // Channel tujuan posting + link konten per channel (social_media task)
  channels?: string[];
  channelLinks?: Record<string, string>;
}


interface TeamMemberRef { userId: string; name?: string; url?: string | null }

interface ProjectItem {
  id: string;
  name: string;
  category: string;
  status: string;
  bgColor: string;
  completedTasks: number;
  totalTasks: number;
  dueDate: string;
  team: TeamMemberRef[];
  /** Enrichment backend untuk platform view (X-Platform-Scope: all) */
  tenantName?: string | null;
  clientName?: string | null;
  /** Raw status untuk filter chips (planning/active/on_hold/...) */
  rawStatus: string;
}

/* ============ Data layer (API nyata) ============ */

interface ProjectRow {
  id: string; tenantId: string; projectCode: string; name: string
  clientId: string | null; projectManagerId: string
  startDate: string | null; endDate: string | null; status: string
  budget: string; description: string | null; createdAt: string
  tenantName?: string | null
}
interface TaskRow {
  id: string; projectId: string; columnId: string; title: string
  description: string | null; assignedTo: string | null; createdBy: string
  priority: string; dueDate: string | null; position: number; createdAt: string
  taskType?: string; contentType?: string | null; contentFormat?: string | null
  channels?: string[]; channelLinks?: Record<string, string>
  updatedAt?: string
}
interface ColumnRow { id: string; projectId: string; name: string; position: number; colorCode: string }
interface ProjectMemberRow { id: string; projectId: string; userId: string; roleInProject: string }
interface MilestoneRow { id: string; projectId: string; title: string; dueDate: string | null; status: string }
interface TaskAssigneeRow { id: string; taskId: string; userId: string }
interface TaskCommentRow { id: string; taskId: string; userId: string; comment: string; createdAt: string }
interface MemberListRow { userId: string; userFullName: string; userAvatarUrl: string | null; userEmail?: string | null }
interface ClientListRow { id: string; name: string; logoUrl?: string | null; company?: string | null }
interface ProjectDetail { columns: ColumnRow[]; members: ProjectMemberRow[]; milestones: MilestoneRow[] }
interface Stats {
  total: number; planning: number; active: number; onHold: number
  completed: number; cancelled: number; totalBudget: number
}

const STATUS_LABEL: Record<string, string> = {
  planning: 'Perencanaan', active: 'Aktif', on_hold: 'Ditunda',
  completed: 'Selesai', cancelled: 'Dibatalkan',
}
// Pagination daftar project di tab Project (card & table)
const PROJECT_PAGE_SIZE = 20

// Palet kelas bg — literal sama dengan mock f17bc08 supaya Tailwind
// menghasilkan class yang persis sama.
const BG_CLASSES = ['bg-[#F9D0F1]', 'bg-[#E3DCFA]', 'bg-[#F2D00D]', 'bg-[#EAEAEA]', 'bg-[#D4F0F0]', 'bg-[#FFE5D4]']
const bgAt = (i: number) => BG_CLASSES[((i % BG_CLASSES.length) + BG_CLASSES.length) % BG_CLASSES.length]

const fmtDue = (iso: string | null) => {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getFullYear()).slice(2)}`
}

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'

const rp = (n: number) =>
  n >= 1e9 ? `Rp${(n / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 2 })} M`
  : n >= 1e6 ? `Rp${(n / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`
  : `Rp${Number(n || 0).toLocaleString('id-ID')}`

function Avatar({ name, url, size = 28 }: { name?: string; url?: string | null; size?: number }) {
  const initials = (name || 'U').trim().charAt(0).toUpperCase()
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0 overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2] relative"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      title={name}
    >
      {initials}
      {url && <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />}
    </div>
  )
}

function Modal({ title, onClose, width = 440, children, hideHeader = false, hideScrollbar = false }: { title: string; onClose: () => void; width?: number; children: React.ReactNode; hideHeader?: boolean; hideScrollbar?: boolean }) {
  return (
    <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={`bg-white rounded-3xl shadow-2xl w-full p-4 sm:p-6 max-h-[90%] overflow-hidden ${hideScrollbar ? '[&::-webkit-scrollbar]:hidden' : ''}`}
        style={{ maxWidth: width, fontFamily: SF, ...(hideScrollbar ? { scrollbarWidth: 'none' as const } : {}) }}
        onClick={(e) => e.stopPropagation()}
      >
        {!hideHeader && (
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-zinc-900">{title}</h2>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500">
              <X size={14} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">{label}</div>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-[13px] text-zinc-900 outline-none focus:border-zinc-900 bg-white box-border'
const selectCls = 'w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-[13px] text-zinc-900 outline-none focus:border-zinc-900 bg-white'
// Khusus form Create Project: field garis bawah (konsisten dengan CRM).
const underlineInputCls = 'w-full border-0 border-b border-zinc-200 bg-transparent py-2 text-[13px] font-semibold text-zinc-900 placeholder:font-normal placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-0 box-border'
const underlineSelectCls = 'w-full border-0 border-b border-zinc-200 bg-transparent py-2 text-[13px] font-semibold text-zinc-900 outline-none focus:border-zinc-900 focus:ring-0 box-border'

function GhostBtn({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="px-4 py-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-sm font-medium transition-colors">
      {children}
    </button>
  )
}

function SolidBtn({ onClick, disabled, children }: { onClick?: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium disabled:opacity-60 transition-colors"
    >
      {children}
    </button>
  )
}

export function TasksBoardContent() {
  const [activeTab, setActiveTab] = useState<'Project' | 'Task' | 'Report'>('Task');
  // Tab Project: 'card' = grid kartu, 'table' = list table
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  // Filter status + halaman aktif daftar project
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [projectPage, setProjectPage] = useState(1);

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [access, setAccess] = useState<AccessCtx>(FALLBACK_ACCESS)
  const isPlatform = isPlatformMode()
  // Platform view tidak punya tenant context — backend menolak create.
  const canWrite = canAccessPerm('projects:write', access) && !isPlatform

  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [details, setDetails] = useState<Record<string, ProjectDetail>>({})
  const [stats, setStats] = useState<Stats | null>(null)
  const [allTasks, setAllTasks] = useState<TaskRow[]>([])
  const [members, setMembers] = useState<MemberListRow[]>([])
  const [clients, setClients] = useState<ClientListRow[]>([])

  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [boardColumns, setBoardColumns] = useState<ColumnRow[]>([])
  const [boardTasks, setBoardTasks] = useState<TaskRow[]>([])
  const [boardLoading, setBoardLoading] = useState(false)
  const [expandedTaskId, setExpandedTaskId] = useState('')
  const [expandedDetail, setExpandedDetail] = useState<{ assignees: TaskAssigneeRow[]; comments: TaskCommentRow[]; tagIds?: string[] } | null>(null)
  const [commentDraft, setCommentDraft] = useState('')
  const [addingComment, setAddingComment] = useState(false)
  const [taskError, setTaskError] = useState('')
  // Multi-assignee: task bisa dikerjakan beberapa user (backend task_assignees
  // sudah mendukung — GUI sebelumnya hanya 1 assignee saat create).
  const [assigneePick, setAssigneePick] = useState('')
  const [assigneeBusy, setAssigneeBusy] = useState(false)
  // Filter board (client-side): priority + assignee.
  const [priorityFilter, setPriorityFilter] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')
  // Drag & drop kanban: id task yang sedang ditarik + kolom target hover.
  const [dragOverCol, setDragOverCol] = useState('')
  // Tag task: daftar tag project aktif + draft tag baru.
  const [projectTags, setProjectTags] = useState<{ id: string; name: string; colorCode: string | null }[]>([])
  const [newTagDraft, setNewTagDraft] = useState('')
  const [tagBusy, setTagBusy] = useState(false)
  // Milestone: form tambah di modal detail project.
  const [milestoneForm, setMilestoneForm] = useState({ title: '', dueDate: '' })
  const [milestoneBusy, setMilestoneBusy] = useState(false)
  const [milestoneErr, setMilestoneErr] = useState('')

  const [showCreateProject, setShowCreateProject] = useState(false)
  const [createStep, setCreateStep] = useState(1)
  const [createProjForm, setCreateProjForm] = useState({ name: '', projectCode: '', projectManagerId: '', clientId: '', status: 'planning', priority: 'medium', billingType: 'fixed', budget: '', startDate: '', endDate: '', description: '', teamMemberIds: [] as string[] })
  const [createProjError, setCreateProjError] = useState('')
  const [creatingProject, setCreatingProject] = useState(false)
  // Client autocomplete: query diketik user, hasil di-lazy-load setelah 2,5 detik idle.
  const [clientQuery, setClientQuery] = useState('')
  const [clientSuggestions, setClientSuggestions] = useState<ClientListRow[]>([])
  const [clientSearching, setClientSearching] = useState(false)
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClientListRow | null>(null)
  const skipClientSearch = useRef('')
  // Project Manager autocomplete — pola sama dengan client, tapi pakai avatar member.
  const [managerQuery, setManagerQuery] = useState('')
  const [managerSuggestions, setManagerSuggestions] = useState<MemberListRow[]>([])
  const [managerSearching, setManagerSearching] = useState(false)
  const [managerDropdownOpen, setManagerDropdownOpen] = useState(false)
  const [selectedManager, setSelectedManager] = useState<MemberListRow | null>(null)
  const skipManagerSearch = useRef('')
  // Team Members autocomplete — multi-select, pakai pola member yang sama.
  const [teamQuery, setTeamQuery] = useState('')
  const [teamSuggestions, setTeamSuggestions] = useState<MemberListRow[]>([])
  const [teamSearching, setTeamSearching] = useState(false)
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<MemberListRow[]>([])
  const skipTeamSearch = useRef('')
  const startDateRef = useRef<HTMLInputElement>(null)
  const endDateRef = useRef<HTMLInputElement>(null)
  const [heatmapHover, setHeatmapHover] = useState<string | null>(null)
  const priorityDraggingRef = useRef(false)
  const [prioritySliderValue, setPrioritySliderValue] = useState(0)
  const priorityLevels = [
    { value: 'low', label: 'Rendah', color: 'text-zinc-400' },
    { value: 'medium', label: 'Sedang', color: 'text-blue-500' },
    { value: 'high', label: 'Tinggi', color: 'text-amber-500' },
    { value: 'urgent', label: 'Mendesak', color: 'text-red-500' },
  ]
  useEffect(() => {
    if (!priorityDraggingRef.current) {
      const idx = Math.max(0, priorityLevels.findIndex((l) => l.value === createProjForm.priority))
      setPrioritySliderValue(idx)
    }
  }, [createProjForm.priority])

  const [detailProject, setDetailProject] = useState<(ProjectRow & { members: ProjectMemberRow[]; milestones: MilestoneRow[]; columns: ColumnRow[] }) | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [editProjForm, setEditProjForm] = useState({ name: '', status: '', budget: '', startDate: '', endDate: '', description: '' })
  const [editProjError, setEditProjError] = useState('')
  const [savingProject, setSavingProject] = useState(false)

  const [showCreateTask, setShowCreateTask] = useState(false)
  const [createTaskForm, setCreateTaskForm] = useState({ title: '', columnId: '', priority: 'medium', taskType: 'general', contentType: '', contentFormat: '', dueDate: '', assignedTo: '', description: '', channels: [] as string[] })
  const [createTaskError, setCreateTaskError] = useState('')
  const [creatingTask, setCreatingTask] = useState(false)
  const [showEditTask, setShowEditTask] = useState(false)
  const [editTaskId, setEditTaskId] = useState<string | null>(null)
  const [editTaskError, setEditTaskError] = useState('')
  const [savingTask, setSavingTask] = useState(false)
  const [editTaskForm, setEditTaskForm] = useState({
    title: '', columnId: '', priority: 'medium', taskType: 'general',
    contentType: '', contentFormat: '', dueDate: '', description: '',
    channels: [] as string[], channelLinks: {} as Record<string, string>,
  })

  const memberName = (userId: string) => members.find((m) => m.userId === userId)?.userFullName
  const memberAvatar = (userId: string) => members.find((m) => m.userId === userId)?.userAvatarUrl || null
  const memberInitials = (name?: string | null) =>
    name?.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'M'

  const loadData = async () => {
    const [projRes, statRes, taskRes, memRes, cliRes] = await Promise.all([
      projectsApi.list().catch(() => null),
      projectsApi.stats().catch(() => null),
      tasksApi.list().catch(() => null),
      membersApi.list().catch(() => null),
      clientsApi.list().catch(() => null),
    ])
    if ((projRes as any)?.error && (projRes as any)?.error !== 'No tenant selected') {
      setError(String((projRes as any).error))
    }
    const projRows: ProjectRow[] = (projRes as any)?.projects || []
    setProjects(projRows)
    setStats((statRes as any)?.stats ?? null)
    setAllTasks((taskRes as any)?.tasks || [])
    setMembers((memRes as any)?.members || [])
    setClients((cliRes as any)?.clients || [])

    // Detail per project: kolom (untuk hitungan Done) + members (avatar tim).
    const detailPairs = await Promise.all(
      projRows.map((p) => projectsApi.get(p.id).catch(() => null))
    )
    const det: Record<string, ProjectDetail> = {}
    projRows.forEach((p, i) => {
      const d = (detailPairs[i] as any)?.project
      if (d) det[p.id] = { columns: d.columns || [], members: d.members || [], milestones: d.milestones || [] }
    })
    setDetails(det)
  }

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        await loadData()
        fetchAccess().then((a) => { if (alive) setAccess(a) }).catch(() => {})
      } catch (e: any) {
        if (alive) setError(e?.message || 'Gagal memuat data')
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [])

  // Client autocomplete: baru query ke server setelah user berhenti mengetik 2,5 detik.
  useEffect(() => {
    const q = clientQuery.trim()
    if (skipClientSearch.current && skipClientSearch.current === q) {
      skipClientSearch.current = ''
      setClientSuggestions([])
      setClientSearching(false)
      return
    }
    if (!q) {
      setClientSuggestions([])
      setClientSearching(false)
      return
    }

    setClientSearching(true)
    let cancelled = false
    const timer = window.setTimeout(() => {
      clientsApi.list(q, 8, 1)
        .then((res: any) => {
          if (!cancelled) setClientSuggestions(res?.clients || [])
        })
        .catch(() => {
          if (!cancelled) setClientSuggestions([])
        })
        .finally(() => {
          if (!cancelled) setClientSearching(false)
        })
    }, 2500)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [clientQuery])

  // Project Manager autocomplete: query server setelah 2,5 detik idle.
  useEffect(() => {
    const q = managerQuery.trim()
    if (skipManagerSearch.current && skipManagerSearch.current === q) {
      skipManagerSearch.current = ''
      setManagerSuggestions([])
      setManagerSearching(false)
      return
    }
    if (!q) {
      setManagerSuggestions([])
      setManagerSearching(false)
      return
    }

    setManagerSearching(true)
    let cancelled = false
    const timer = window.setTimeout(() => {
      membersApi.list({ search: q, limit: 8, page: 1 })
        .then((res: any) => {
          if (!cancelled) setManagerSuggestions(res?.members || [])
        })
        .catch(() => {
          if (!cancelled) setManagerSuggestions([])
        })
        .finally(() => {
          if (!cancelled) setManagerSearching(false)
        })
    }, 2500)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [managerQuery])

  // Team Members autocomplete: query server setelah 2,5 detik idle.
  useEffect(() => {
    const q = teamQuery.trim()
    if (skipTeamSearch.current && skipTeamSearch.current === q) {
      skipTeamSearch.current = ''
      setTeamSuggestions([])
      setTeamSearching(false)
      return
    }
    if (!q) {
      setTeamSuggestions([])
      setTeamSearching(false)
      return
    }

    setTeamSearching(true)
    let cancelled = false
    const timer = window.setTimeout(() => {
      membersApi.list({ search: q, limit: 8, page: 1 })
        .then((res: any) => {
          if (!cancelled) setTeamSuggestions(res?.members || [])
        })
        .catch(() => {
          if (!cancelled) setTeamSuggestions([])
        })
        .finally(() => {
          if (!cancelled) setTeamSearching(false)
        })
    }, 2500)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [teamQuery])

  // Ganti tenant / platform view → window reload datanya.
  useEffect(() => {
    const onTenantChange = () => { setLoading(true); loadData().finally(() => setLoading(false)) }
    window.addEventListener('hub-tenant-changed', onTenantChange as EventListener)
    return () => window.removeEventListener('hub-tenant-changed', onTenantChange as EventListener)
  }, [])

  /* ---------- turunan data (bentuk ProjectItem/TaskItem f17bc08) ---------- */

  const doneCount = (projectId: string) => {
    const tasks = allTasks.filter((t) => t.projectId === projectId)
    const d = details[projectId]
    const doneCol = d?.columns.find((c) => c.name.toLowerCase() === 'done')
    const done = doneCol ? tasks.filter((t) => t.columnId === doneCol.id).length : 0
    return { done, total: tasks.length }
  }

  const items: ProjectItem[] = projects.map((p, idx) => {
    const { done, total } = doneCount(p.id)
    const team: TeamMemberRef[] = (details[p.id]?.members || []).slice(0, 4).map((m) => ({
      userId: m.userId,
      name: memberName(m.userId),
      url: memberAvatar(m.userId),
    }))
    return {
      id: p.id,
      name: p.name,
      category: p.projectCode,
      status: STATUS_LABEL[p.status] || p.status,
      bgColor: bgAt(idx),
      completedTasks: done,
      totalTasks: total,
      dueDate: fmtDue(p.endDate),
      team,
      // Tag company asal (platform view) — jangan hilang di mapping.
      tenantName: p.tenantName ?? null,
      // Client yang di-handle (opsional — project bisa tanpa client).
      clientName: clients.find((c) => c.id === p.clientId)?.name ?? null,
      rawStatus: p.status,
    }
  })

  // Filter status + pagination 20/halaman — tab Project (card & table)
  const filteredProjectItems = useMemo(
    () => (projectFilter === 'all' ? items : items.filter((i) => i.rawStatus === projectFilter)),
    [items, projectFilter]
  )
  const projectPageCount = Math.max(1, Math.ceil(filteredProjectItems.length / PROJECT_PAGE_SIZE))
  const safeProjectPage = Math.min(projectPage, projectPageCount)
  const pageProjectItems = filteredProjectItems.slice(
    (safeProjectPage - 1) * PROJECT_PAGE_SIZE,
    safeProjectPage * PROJECT_PAGE_SIZE
  )
  const applyProjectFilter = (s: string) => {
    setProjectFilter(s)
    setProjectPage(1)
  }

  // Event heatmap untuk tab Report: aktivitas project & task (dibuat/diperbarui)
  // — pola sama dengan Progress Tracker di window Company, tapi fokus project.
  const reportEvents = useMemo<ProgressEvent[]>(() => {
    const evs: ProgressEvent[] = []
    const push = (module: ProgressEvent['module'], id: string, date: any, label: string) => {
      if (!date || Number.isNaN(new Date(date).getTime())) return
      evs.push({ id, module, date: new Date(date).toISOString(), label })
    }
    const pushPair = (module: ProgressEvent['module'], key: string, x: any, cLabel: string, uLabel: string) => {
      push(module, `${key}-c`, x?.createdAt, cLabel)
      const c = x?.createdAt ? new Date(x.createdAt).getTime() : 0
      const u = x?.updatedAt ? new Date(x.updatedAt).getTime() : 0
      if (u && u - c > 60_000) push(module, `${key}-u`, x.updatedAt, uLabel)
    }
    projects.forEach((p: any, i: number) =>
      pushPair('projects', `p-${p?.id ?? i}`, p,
        `Project "${p?.name || '-'}" dibuat`,
        `Project "${p?.name || '-'}" diperbarui`))
    allTasks.forEach((t: any, i: number) =>
      pushPair('tasks', `t-${t?.id ?? i}`, t,
        `Task "${(t?.title || '-').slice(0, 40)}" ditambahkan`,
        `Task "${(t?.title || '-').slice(0, 40)}" diperbarui`))
    return evs.sort((a, b) => b.date.localeCompare(a.date))
  }, [projects, allTasks])

  const doneTotal = allTasks.filter((t) => {
    const d = details[t.projectId]
    const doneCol = d?.columns.find((c) => c.name.toLowerCase() === 'done')
    return doneCol ? t.columnId === doneCol.id : false
  }).length
  const taskTotal = allTasks.length
  const pendingCount = Math.max(0, taskTotal - doneTotal)
  const outputPct = taskTotal > 0 ? Math.round((doneTotal / taskTotal) * 100) : 0
  const contributors = Array.from(new Set(allTasks.flatMap((t) => [t.assignedTo, t.createdBy]).filter(Boolean))) as string[]


  const openBoard = async (projectId: string) => {
    setSelectedProjectId(projectId)
    setExpandedTaskId(''); setExpandedDetail(null)
    if (!projectId) { setBoardColumns([]); setBoardTasks([]); return }
    setBoardLoading(true)
    try {
      const [detailRes, tasksRes] = await Promise.all([
        projectsApi.get(projectId),
        tasksApi.list({ projectId }),
      ])
      setBoardColumns((detailRes as any)?.project?.columns || [])
      setBoardTasks((tasksRes as any)?.tasks || [])
    } catch {
      setError('Gagal memuat board task')
    } finally {
      setBoardLoading(false)
    }
  }

  const toggleTaskExpand = async (taskId: string) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(''); setExpandedDetail(null); return
    }
    setExpandedTaskId(taskId); setExpandedDetail(null); setTaskError('')
    // Muat tag project aktif untuk UI attach/detach.
    if (selectedProjectId) tagsApi.list(selectedProjectId).then((d: any) => setProjectTags(d?.tags || d?.data || [])).catch(() => {})
    // Card yang expand membesar (min-h 22rem) — scroll-into-view supaya card
    // ini DAN card di bawahnya tetap terlihat; tanpa ini card di bawah fold
    // terkesan "tertimpa" oleh card yang membesar (keluhan overlap).
    requestAnimationFrame(() => {
      const h = [...document.querySelectorAll('h3')].find(x => x.textContent?.trim() && x.closest('.ring-2'))
      ;(h?.closest('.ring-2') as HTMLElement | null)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
    try {
      const res: any = await tasksApi.get(taskId)
      if (res?.error) { setTaskError(String(res.error)); return }
      setExpandedDetail({ assignees: res.task.assignees || [], comments: res.task.comments || [], tagIds: res.task.tagIds || [] })
    } catch (e: any) {
      setTaskError(e?.message || 'Gagal memuat detail task')
    }
  }

  const moveTask = async (taskId: string, columnId: string) => {
    if (!columnId) return
    const res: any = await tasksApi.move(taskId, { columnId, position: 0 })
    if (res?.error) { alert(res.error); return }
    await openBoard(selectedProjectId)
    await loadData()
  }

  const submitComment = async (taskId: string) => {
    if (!commentDraft.trim()) return
    setAddingComment(true); setTaskError('')
    try {
      const res: any = await tasksApi.addComment(taskId, { comment: commentDraft.trim() })
      if (res?.error) { setTaskError(String(res.error)); return }
      setCommentDraft('')
      const res2: any = await tasksApi.get(taskId)
      if (!res2?.error) setExpandedDetail({ assignees: res2.task.assignees || [], comments: res2.task.comments || [] })
      await loadData()
    } finally {
      setAddingComment(false)
    }
  }

  // Tambah assignee ke task (multi-user). Setelah sukses, detail di-refresh
  // dari backend supaya avatar & daftar selalu sinkron.
  const submitAssignee = async (taskId: string) => {
    if (!assigneePick) return
    setAssigneeBusy(true); setTaskError('')
    try {
      const res: any = await tasksApi.addAssignee(taskId, assigneePick)
      if (res?.error) { setTaskError(String(res.error)); return }
      setAssigneePick('')
      const res2: any = await tasksApi.get(taskId)
      if (!res2?.error) setExpandedDetail({ assignees: res2.task.assignees || [], comments: res2.task.comments || [] })
    } finally {
      setAssigneeBusy(false)
    }
  }

  // Cabut assignee dari task.
  const removeAssigneeById = async (taskId: string, userId: string) => {
    setAssigneeBusy(true); setTaskError('')
    try {
      const res: any = await tasksApi.removeAssignee(taskId, userId)
      if (res?.error) { setTaskError(String(res.error)); return }
      const res2: any = await tasksApi.get(taskId)
      if (!res2?.error) setExpandedDetail({ assignees: res2.task.assignees || [], comments: res2.task.comments || [] })
    } finally {
      setAssigneeBusy(false)
    }
  }

  // Tambah milestone dari modal detail project (API sudah ada, GUI belum).
  const submitMilestone = async () => {
    if (!detailProject || !milestoneForm.title.trim()) return
    setMilestoneBusy(true); setMilestoneErr('')
    try {
      const res: any = await projectsApi.addMilestone(detailProject.id, {
        title: milestoneForm.title.trim(),
        ...(milestoneForm.dueDate ? { dueDate: milestoneForm.dueDate } : {}),
      })
      if (res?.error) { setMilestoneErr(String(res.error)); return }
      setMilestoneForm({ title: '', dueDate: '' })
      await openProjectDetail(detailProject.id)
    } finally {
      setMilestoneBusy(false)
    }
  }

  // Lampirkan tag project ke task (+ buat tag baru sekalian kalau perlu).
  const attachTag = async (taskId: string, tagId: string) => {
    setTagBusy(true); setTaskError('')
    try {
      const res: any = await tagsApi.attach(taskId, tagId)
      if (res?.error) { setTaskError(String(res.error)); return }
      const res2: any = await tasksApi.get(taskId)
      if (!res2?.error) setExpandedDetail({ assignees: res2.task.assignees || [], comments: res2.task.comments || [], tagIds: res2.task.tagIds || [] })
    } finally {
      setTagBusy(false)
    }
  }

  // Buat tag baru pada project lalu langsung lampirkan ke task.
  const createAndAttachTag = async (taskId: string, name: string) => {
    if (!name.trim() || !selectedProjectId) return
    setTagBusy(true); setTaskError('')
    try {
      const created: any = await tagsApi.create({ projectId: selectedProjectId, name: name.trim() })
      if (created?.error) { setTaskError(String(created.error)); return }
      const tag = created.tag || created.taskTag || created
      setNewTagDraft('')
      // Refresh daftar tag project supaya chip tampil dengan nama (bukan fallback).
      tagsApi.list(selectedProjectId).then((d: any) => setProjectTags(d?.tags || d?.data || [])).catch(() => {})
      if (tag?.id) await attachTag(taskId, tag.id)
    } finally {
      setTagBusy(false)
    }
  }

  // Lepas tag dari task.
  const detachTag = async (taskId: string, tagId: string) => {
    setTagBusy(true); setTaskError('')
    try {
      const res: any = await tagsApi.detach(taskId, tagId)
      if (res?.error) { setTaskError(String(res.error)); return }
      const res2: any = await tasksApi.get(taskId)
      if (!res2?.error) setExpandedDetail({ assignees: res2.task.assignees || [], comments: res2.task.comments || [], tagIds: res2.task.tagIds || [] })
    } finally {
      setTagBusy(false)
    }
  }

  /* ---------- project actions ---------- */

  const openCreateProject = () => {
    const fallbackManager = members[0] || null
    const fallbackManagerId = fallbackManager?.userId || ''
    const fallbackManagerName = fallbackManager?.userFullName || ''
    setCreateStep(1)
    setCreateProjForm({ name: '', projectCode: '', projectManagerId: fallbackManagerId, clientId: '', status: 'planning', priority: 'medium', billingType: 'fixed', budget: '', startDate: '', endDate: '', description: '', teamMemberIds: [] })
    setManagerQuery(fallbackManagerName)
    setManagerSuggestions([])
    setManagerSearching(false)
    setManagerDropdownOpen(false)
    setSelectedManager(fallbackManager)
    skipManagerSearch.current = fallbackManagerName
    setClientQuery('')
    setClientSuggestions([])
    setClientSearching(false)
    setClientDropdownOpen(false)
    setSelectedClient(null)
    skipClientSearch.current = ''
    setTeamQuery('')
    setTeamSuggestions([])
    setTeamSearching(false)
    setTeamDropdownOpen(false)
    setSelectedTeam([])
    skipTeamSearch.current = ''
    setCreateProjError('')
    setNotice('')
    setShowCreateProject(true)
  }

  // Validasi per step — error tidak menutup modal.
  const validateCreateStep = (step: number) => {
    if (step === 1 && (!createProjForm.name.trim() || !createProjForm.projectCode.trim())) {
      setCreateProjError('Name dan Project Code wajib diisi')
      return false
    }
    if (step === 2 && !createProjForm.projectManagerId) {
      setCreateProjError('Project Manager wajib dipilih')
      return false
    }
    setCreateProjError('')
    return true
  }

  const goNextStep = () => {
    if (!validateCreateStep(createStep)) return
    setCreateStep((prev) => Math.min(4, prev + 1))
  }

  const toggleTeamMember = (member: MemberListRow) => {
    if (member.userId === createProjForm.projectManagerId) return // PM sudah otomatis jadi lead
    const already = createProjForm.teamMemberIds.includes(member.userId)
    setCreateProjForm({
      ...createProjForm,
      teamMemberIds: already
        ? createProjForm.teamMemberIds.filter((id) => id !== member.userId)
        : [...createProjForm.teamMemberIds, member.userId],
    })
    setSelectedTeam((prev) => already
      ? prev.filter((m) => m.userId !== member.userId)
      : [...prev, member])
    setTeamQuery('')
    setTeamSuggestions([])
    setTeamDropdownOpen(false)
    skipTeamSearch.current = ''
    setCreateProjError('')
  }

  const submitCreateProject = async () => {
    if (!validateCreateStep(1) || !validateCreateStep(2)) {
      setCreateStep(!createProjForm.projectManagerId ? 2 : 1)
      return
    }
    setCreatingProject(true); setCreateProjError('')
    try {
      const res: any = await projectsApi.create({
        name: createProjForm.name,
        projectCode: createProjForm.projectCode,
        description: createProjForm.description || undefined,
        priority: createProjForm.priority,
        projectManagerId: createProjForm.projectManagerId,
        clientId: createProjForm.clientId || undefined,
        status: createProjForm.status,
        billingType: createProjForm.billingType,
        budget: Number(createProjForm.budget || 0),
        startDate: createProjForm.startDate || undefined,
        endDate: createProjForm.endDate || undefined,
      })
      if (res?.error) { setCreateProjError(String(res.error)); return }

      const projectId = res?.project?.id
      const extra = createProjForm.teamMemberIds.filter((uid) => uid !== createProjForm.projectManagerId)
      let failedMembers = 0
      if (projectId && extra.length) {
        // Best-effort: project sudah tersimpan, jadi kegagalan add member
        // tidak boleh menandai seluruh create sebagai gagal.
        const results = await Promise.allSettled(extra.map((uid) =>
          projectsApi.addMember(projectId, { userId: uid, roleInProject: 'viewer' })
        ))
        failedMembers = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && (r.value as any)?.error)).length
      }
      setShowCreateProject(false)
      setNotice(failedMembers > 0
        ? `Project berhasil dibuat, tapi ${failedMembers} team member gagal ditambahkan. Buka detail project untuk menambahkannya lagi.`
        : 'Project berhasil dibuat.')
      await loadData()
    } catch (e: any) {
      setCreateProjError(e?.message || 'Gagal membuat project')
    } finally {
      setCreatingProject(false)
    }
  }

  const openProjectDetail = async (id: string) => {
    setDetailLoading(true); setEditProjError('')
    try {
      const res: any = await projectsApi.get(id)
      if (res?.error) { setError(String(res.error)); setDetailLoading(false); return }
      const p = res.project
      setDetailProject(p)
      setEditProjForm({
        name: p.name || '',
        status: p.status || 'planning',
        budget: p.budget ? String(Number(p.budget)) : '',
        startDate: p.startDate ? p.startDate.slice(0, 10) : '',
        endDate: p.endDate ? p.endDate.slice(0, 10) : '',
        description: p.description || '',
      })
    } finally {
      setDetailLoading(false)
    }
  }

  const submitEditProject = async () => {
    if (!detailProject) return
    setSavingProject(true); setEditProjError('')
    try {
      const res: any = await projectsApi.update(detailProject.id, {
        name: editProjForm.name,
        status: editProjForm.status,
        budget: Number(editProjForm.budget || 0),
        startDate: editProjForm.startDate || undefined,
        endDate: editProjForm.endDate || undefined,
        description: editProjForm.description || undefined,
      })
      if (res?.error) { setEditProjError(String(res.error)); return }
      setDetailProject(null)
      await loadData()
    } catch (e: any) {
      setEditProjError(e?.message || 'Gagal menyimpan')
    } finally {
      setSavingProject(false)
    }
  }

  const deleteProject = async (p: ProjectRow) => {
    const ok = confirm(`Hapus project "${p.name}"?\n\nProject dinonaktifkan (arsip) dan hilang dari daftar. Lanjutkan?`)
    if (!ok) return
    const res: any = await projectsApi.delete(p.id)
    if (res?.error) { alert(res.error); return }
    setDetailProject(null)
    if (selectedProjectId === p.id) setSelectedProjectId('')
    await loadData()
  }

  /* ---------- task actions ---------- */

  const openCreateTask = () => {
    if (!selectedProjectId || boardColumns.length === 0) return
    setCreateTaskForm({ title: '', columnId: boardColumns[0].id, priority: 'medium', taskType: 'general', contentType: '', contentFormat: '', dueDate: '', assignedTo: '', description: '', channels: [] as string[] })
    setCreateTaskError('')
    setShowCreateTask(true)
  }

  const toggleCreateChannel = (key: string) => {
    setCreateTaskForm((prev) => ({
      ...prev,
      channels: prev.channels.includes(key)
        ? prev.channels.filter((c) => c !== key)
        : [...prev.channels, key],
    }))
  }

  const submitCreateTask = async () => {
    if (!createTaskForm.title || !createTaskForm.columnId) {
      setCreateTaskError('Title dan kolom wajib diisi')
      return
    }
    if (createTaskForm.taskType === 'social_media' && createTaskForm.channels.length === 0) {
      setCreateTaskError('Pilih minimal 1 channel sosmed')
      return
    }
    setCreatingTask(true); setCreateTaskError('')
    try {
      const res: any = await tasksApi.create({
        projectId: selectedProjectId,
        columnId: createTaskForm.columnId,
        title: createTaskForm.title,
        description: createTaskForm.description || undefined,
        priority: createTaskForm.priority,
        taskType: createTaskForm.taskType,
        contentType: createTaskForm.contentType || undefined,
        contentFormat: createTaskForm.contentFormat || undefined,
        channels: createTaskForm.taskType === 'social_media' ? createTaskForm.channels : undefined,
        dueDate: createTaskForm.dueDate || undefined,
        assignedTo: createTaskForm.assignedTo || undefined,
      })
      if (res?.error) { setCreateTaskError(String(res.error)); return }
      setShowCreateTask(false)
      await Promise.all([openBoard(selectedProjectId), loadData()])
    } catch (e: any) {
      setCreateTaskError(e?.message || 'Gagal membuat task')
    } finally {
      setCreatingTask(false)
    }
  }

  const openEditTask = (taskId: string) => {
    const row: any = boardTasks.find((t) => t.id === taskId)
    if (!row) return
    setEditTaskId(taskId)
    setEditTaskForm({
      title: row.title ?? '',
      columnId: row.columnId ?? '',
      priority: row.priority || 'medium',
      taskType: row.taskType || 'general',
      contentType: row.contentType || '',
      contentFormat: row.contentFormat || '',
      dueDate: row.dueDate ? String(row.dueDate).slice(0, 10) : '',
      description: row.description || '',
      channels: Array.isArray(row.channels) ? row.channels : [],
      channelLinks: row.channelLinks && typeof row.channelLinks === 'object' ? { ...row.channelLinks } : {},
    })
    setEditTaskError('')
    setShowEditTask(true)
  }

  const submitEditTask = async () => {
    if (!editTaskId) return
    if (!editTaskForm.title || !editTaskForm.columnId) {
      setEditTaskError('Title dan kolom wajib diisi')
      return
    }
    if (editTaskForm.taskType === 'social_media' && editTaskForm.channels.length === 0) {
      setEditTaskError('Pilih minimal 1 channel sosmed')
      return
    }
    setSavingTask(true); setEditTaskError('')
    try {
      const res: any = await tasksApi.update(editTaskId, {
        title: editTaskForm.title,
        columnId: editTaskForm.columnId,
        description: editTaskForm.description || undefined,
        priority: editTaskForm.priority,
        taskType: editTaskForm.taskType,
        contentType: editTaskForm.taskType === 'social_media' ? (editTaskForm.contentType || undefined) : undefined,
        contentFormat: editTaskForm.taskType === 'social_media' ? (editTaskForm.contentFormat || undefined) : undefined,
        channels: editTaskForm.taskType === 'social_media' ? editTaskForm.channels : [],
        channelLinks: editTaskForm.taskType === 'social_media' ? editTaskForm.channelLinks : {},
        dueDate: editTaskForm.dueDate || undefined,
      })
      if (res?.error) { setEditTaskError(String(res.error)); return }
      setShowEditTask(false)
      await Promise.all([openBoard(selectedProjectId), loadData()])
    } catch (e: any) {
      setEditTaskError(e?.message || 'Gagal menyimpan task')
    } finally {
      setSavingTask(false)
    }
  }

  /* ---------- render ---------- */

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F6F5F2]" style={{ fontFamily: SF }}>
        <Loader2 className="animate-spin text-zinc-600" size={28} />
        <span className="ml-3 text-sm text-zinc-500">Memuat project…</span>
      </div>
    )
  }

  // Toggle Card/Table view — KHUSUS tab Project: daftar project sebagai grid kartu atau list table
  const viewToggle = (
    <div className="flex items-center gap-1 bg-zinc-200/80 p-1 rounded-full border border-zinc-300/40">
      <button
        onClick={() => setViewMode('card')}
        title="Card view"
        aria-label="Card view"
        className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${
          viewMode === 'card' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-600 hover:bg-white/50'
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => setViewMode('table')}
        title="Table view"
        aria-label="Table view"
        className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${
          viewMode === 'table' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-600 hover:bg-white/50'
        }`}
      >
        <Rows3 className="w-3.5 h-3.5" />
      </button>
    </div>
  )

  return (
    <div className="h-full overflow-y-auto bg-[#F6F5F2] text-zinc-900 p-6 md:p-8 font-sans">

      {/* NAVIGATION TAB PILL */}
      <div className="flex justify-between items-center mb-6">
        <div className="bg-zinc-200/80 p-1 rounded-full flex items-center gap-1 w-fit border border-zinc-300/40 backdrop-blur-md">
          {(['Project', 'Task', 'Report'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-zinc-900 text-white shadow-md'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>


      {/* HEADER SECTION */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            {activeTab === 'Project' && 'Active Workspaces'}
            {activeTab === 'Task' && 'Task Schedule'}
            {activeTab === 'Report' && 'Analytics & Performance'}
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mt-1">
            {activeTab === 'Project' && 'Project Overview'}
            {activeTab === 'Task' && 'Daily Operation'}
            {activeTab === 'Report' && 'Performance Reports'}
          </h1>
        </div>


        {/* CONTROLS & METRICS */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-6 w-full lg:w-auto">
          {activeTab === 'Task' && (
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-xs font-medium shadow-sm">
                Still Running
                <span className="bg-[#F2D00D] text-black font-bold px-1.5 py-0.5 rounded-full text-[10px]">{pendingCount}</span>
              </button>
            </div>
          )}


          {activeTab === 'Project' && (
            <div className="flex items-center gap-3">
              {viewToggle}
              {canWrite && (
                <button onClick={openCreateProject} className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-sm hover:bg-zinc-800 transition">
                  <Plus size={13} /> New Project
                </button>
              )}
            </div>
          )}


          <div className="flex items-center gap-8 border-l border-zinc-300 pl-6">
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Week's Tasks</p>
              <p className="text-2xl font-bold text-zinc-900">{taskTotal}</p>
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Pending Approval</p>
              <p className="text-2xl font-bold text-zinc-900">{pendingCount}</p>
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Employees involved</p>
              <p className="text-2xl font-bold text-zinc-900">{contributors.length}</p>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl text-xs">
          {error}
        </div>
      )}
      {notice && (
        <div className="mb-4 flex items-start gap-2 rounded-2xl border border-[#F2D00D]/60 bg-[#F2D00D]/15 px-4 py-3 text-xs text-zinc-800">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B89400]" />
          <span className="flex-1">{notice}</span>
          <button onClick={() => setNotice('')} aria-label="Tutup notifikasi" className="shrink-0 rounded-full p-0.5 text-zinc-500 transition-colors hover:bg-white/60 hover:text-zinc-800">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* TAB CONTENT: PROJECT VIEW — filter status + Card (grid kartu) / Table (list) */}
      {activeTab === 'Project' && (
        <>
          {items.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-5">
              <button
                onClick={() => applyProjectFilter('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                  projectFilter === 'all'
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                }`}
              >
                Semua <span className="opacity-60">· {items.length}</span>
              </button>
              {Object.entries(STATUS_LABEL).map(([k, label]) => {
                const n = items.filter((i) => i.rawStatus === k).length
                return (
                  <button
                    key={k}
                    onClick={() => applyProjectFilter(k)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                      projectFilter === k
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    {label} <span className="opacity-60">· {n}</span>
                  </button>
                )
              })}
            </div>
          )}

          {items.length > 0 && filteredProjectItems.length === 0 && (
            <div className="bg-white rounded-3xl border border-zinc-200/60 px-5 py-10 text-center text-xs text-zinc-400">
              Tidak ada project dengan status {STATUS_LABEL[projectFilter] ?? projectFilter}.
            </div>
          )}

          {viewMode === 'card' ? (
            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pageProjectItems.map((proj) => (
                <ProjectCard key={proj.id} project={proj} onOpen={() => openProjectDetail(proj.id)} />
              ))}

              {/* New Project Dotted Card */}
              {canWrite && (
                <div
                  onClick={openCreateProject}
                  className="h-64 rounded-3xl p-6 border-2 border-dashed border-zinc-300/80 hover:border-zinc-500 transition flex flex-col items-center justify-center gap-3 cursor-pointer group bg-white/30"
                >
                  <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-zinc-200 flex items-center justify-center group-hover:scale-110 transition duration-200">
                    <Folder className="w-5 h-5 text-zinc-600" />
                  </div>
                </div>
              )}
            </main>
          ) : (
            <ProjectTable items={pageProjectItems} onOpen={openProjectDetail} />
          )}

          {filteredProjectItems.length > PROJECT_PAGE_SIZE && (
            <div className="flex items-center justify-between mt-5">
              <p className="text-xs text-zinc-400">
                Menampilkan {(safeProjectPage - 1) * PROJECT_PAGE_SIZE + 1}–
                {Math.min(safeProjectPage * PROJECT_PAGE_SIZE, filteredProjectItems.length)} dari{' '}
                {filteredProjectItems.length} project
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setProjectPage((p) => Math.max(1, p - 1))}
                  disabled={safeProjectPage === 1}
                  aria-label="Halaman sebelumnya"
                  className="w-8 h-8 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-zinc-600 px-2">
                  {safeProjectPage} / {projectPageCount}
                </span>
                <button
                  onClick={() => setProjectPage((p) => Math.min(projectPageCount, p + 1))}
                  disabled={safeProjectPage === projectPageCount}
                  aria-label="Halaman berikutnya"
                  className="w-8 h-8 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}


      {/* TAB CONTENT: TASK (KANBAN) VIEW */}
      {activeTab === 'Task' && (
        projects.length === 0 ? (
          <main><div style={{ padding: '40px 20px', textAlign: 'center' }}><div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF }}>Belum ada project. Buat project dulu di tab Project.</div></div></main>
        ) : (
        <div>
          {/* Project selector chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => openBoard(p.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                  selectedProjectId === p.id
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {!selectedProjectId ? (
            <main><div style={{ padding: '40px 20px', textAlign: 'center' }}><div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF }}>Pilih project untuk melihat task-nya.</div></div></main>
          ) : boardLoading ? (
            <div className="flex items-center justify-center py-10"><Loader2 className="animate-spin text-zinc-500" size={22} /></div>
          ) : (
          <>
          {/* Filter board: priority + assignee (client-side) */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5">
              {['', 'low', 'medium', 'high', 'urgent'].map((p) => (
                <button
                  key={p || 'all'}
                  onClick={() => setPriorityFilter(p)}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full transition ${
                    priorityFilter === p ? 'bg-zinc-900 text-white' : 'bg-white/70 text-zinc-600 border border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  {p === '' ? 'Semua priority' : p}
                </button>
              ))}
            </div>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="text-[11px] text-zinc-700 bg-white/70 border border-zinc-200 rounded-full px-2.5 py-1 outline-none focus:border-zinc-400"
            >
              <option value="">Semua assignee</option>
              <option value="none">— belum di-assign —</option>
              {members.map((m) => <option key={m.userId} value={m.userId}>{m.userFullName}</option>)}
            </select>
            {(priorityFilter || assigneeFilter) && (
              <button
                onClick={() => { setPriorityFilter(''); setAssigneeFilter('') }}
                className="text-[10px] font-semibold text-red-500 hover:text-red-600 px-2 py-1"
              >
                Reset filter
              </button>
            )}
          </div>
          <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
            {boardColumns.map((col, colIdx) => {
              const colTasks = boardTasks
                .filter((t) => t.columnId === col.id)
                // Filter client-side: priority + assignee (chip di atas board).
                .filter((t) => !priorityFilter || t.priority === priorityFilter)
                .filter((t) => !assigneeFilter || (assigneeFilter === 'none' ? !t.assignedTo : t.assignedTo === assigneeFilter))
                .map((t, idx) => {
                const author = (t.assignedTo ? memberName(t.assignedTo) : null) || memberName(t.createdBy) || 'User'
                return {
                  item: {
                    id: t.id,
                    title: t.title,
                    author,
                    avatar: memberAvatar(t.assignedTo || t.createdBy),
                    date: fmtDue(t.createdAt),
                    bgColor: bgAt(colIdx + idx),
                    progress: 0,
                    subtasks: [] as string[],
                    columnId: t.columnId,
                    priority: t.priority,
                    dueDateRaw: t.dueDate,
                    taskType: t.taskType,
                    channels: (t as any).channels ?? [],
                    channelLinks: (t as any).channelLinks ?? {},
                  },
                  row: t,
                  colIdx,
                  idx,
                }
              })
              return (
                <div
                  key={col.id}
                  className={`flex flex-col gap-4 rounded-2xl transition-colors ${dragOverCol === col.id ? 'bg-zinc-900/5 ring-2 ring-zinc-400/60 ring-dashed' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (dragOverCol !== col.id) setDragOverCol(col.id) }}
                  onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node) && dragOverCol === col.id) setDragOverCol('') }}
                  onDrop={(e) => {
                    e.preventDefault()
                    const id = e.dataTransfer.getData('text/plain')
                    setDragOverCol('')
                    if (id) moveTask(id, col.id)
                  }}
                >
                  <div className="flex items-center gap-2 px-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: col.colorCode }} />
                    <span className="text-xs font-bold text-zinc-700">{col.name}</span>
                    <span className="text-[10px] text-zinc-400">{colTasks.length}</span>
                  </div>
                  {colTasks.length === 0 && (
                    <div className="h-36 rounded-3xl border border-dashed border-zinc-300/70 flex items-center justify-center text-[11px] text-zinc-400">
                      kosong
                    </div>
                  )}
                  {colTasks.map(({ item, row }) => (
                    <Card
                      key={row.id}
                      item={item}
                      isExpanded={expandedTaskId === row.id}
                      onToggle={() => toggleTaskExpand(row.id)}
                      expandedDetail={expandedTaskId === row.id ? expandedDetail : null}
                      taskError={expandedTaskId === row.id ? taskError : ''}
                      commentDraft={expandedTaskId === row.id ? commentDraft : ''}
                      setCommentDraft={setCommentDraft}
                      addingComment={addingComment}
                      onSubmitComment={() => submitComment(row.id)}
                      canWrite={canWrite}
                      columns={boardColumns}
                      onMove={(columnId) => moveTask(row.id, columnId)}
                      members={members}
                      assigneePick={expandedTaskId === row.id ? assigneePick : ''}
                      setAssigneePick={setAssigneePick}
                      assigneeBusy={assigneeBusy}
                      onAddAssignee={() => submitAssignee(row.id)}
                      onRemoveAssignee={(userId) => removeAssigneeById(row.id, userId)}
                      projectTags={projectTags}
                      taskTagIds={expandedTaskId === row.id ? (expandedDetail?.tagIds || []) : []}
                      newTagDraft={newTagDraft}
                      setNewTagDraft={setNewTagDraft}
                      tagBusy={tagBusy}
                      onAttachTag={(tagId) => attachTag(row.id, tagId)}
                      onEdit={() => openEditTask(row.id)}
                      onDetachTag={(tagId) => detachTag(row.id, tagId)}
                      onCreateTag={(name) => createAndAttachTag(row.id, name)}
                      resolveName={memberName}
                      resolveAvatar={memberAvatar}
                    />
                  ))}
                  {/* Hatched widget — trigger New Task, hanya di kolom Backlog */}
                  {col.name.toLowerCase() === 'backlog' && canWrite && (
                    <div
                      onClick={openCreateTask}
                      title="Tambah task"
                      className="h-36 rounded-3xl p-4 flex items-center justify-center border border-zinc-200/60 shadow-xs relative overflow-hidden cursor-pointer hover:border-zinc-400 transition"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(135deg, rgba(0,0,0,0.04), rgba(0,0,0,0.04) 10px, transparent 10px, transparent 20px)'
                      }}
                    >
                      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3 py-2 rounded-full shadow-md border border-zinc-100">
                        <Plus size={14} className="text-zinc-600" />
                        <span className="text-xs font-medium text-zinc-600">Tambah task</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </main>
          </>
          )}
        </div>
        )
      )}


      {/* TAB CONTENT: REPORT VIEW */}
      {activeTab === 'Report' && (
        !stats || stats.total === 0 ? (
          <main><div style={{ padding: '40px 20px', textAlign: 'center' }}><div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF }}>Belum ada project untuk dilaporkan.</div></div></main>
        ) : (
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-[#E3DCFA] rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Task Output</span>
                <TrendingUp className="w-4 h-4 text-zinc-700" />
              </div>
              <h2 className="text-4xl font-extrabold text-zinc-900">{outputPct}%</h2>
              <p className="text-xs text-zinc-600 mt-1 font-medium">{doneTotal} dari {taskTotal} task selesai</p>
            </div>
            <div className="mt-8 bg-white/60 backdrop-blur-xs p-4 rounded-2xl border border-white/40">
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span>Task Throughput</span>
                <span>{doneTotal} / {taskTotal}</span>
              </div>
              <div className="h-2 bg-zinc-900/10 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-900 rounded-full transition-all duration-500" style={{ width: `${outputPct}%` }} />
              </div>
            </div>
          </div>


          <div className="bg-[#F9D0F1] rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Active Contributors</span>
                <Users className="w-4 h-4 text-zinc-700" />
              </div>
              <h2 className="text-4xl font-extrabold text-zinc-900">{contributors.length} Members</h2>
              <p className="text-xs text-zinc-600 mt-1 font-medium">User yang ter-assign atau membuat task</p>
            </div>
            <div className="mt-8 flex -space-x-2">
              {contributors.slice(0, 5).map((uid) => (
                <div key={uid} className="rounded-full border-2 border-white object-cover overflow-hidden">
                  <Avatar name={memberName(uid)} url={memberAvatar(uid)} size={36} />
                </div>
              ))}
            </div>
          </div>


          <div className="bg-[#F2D00D] rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-900/80">Total Budget</span>
                <Wallet className="w-4 h-4 text-zinc-900" />
              </div>
              <h2 className="text-4xl font-extrabold text-zinc-900">{rp(stats.totalBudget)}</h2>
              <p className="text-xs text-zinc-800 mt-1 font-medium">{stats.total} project — {stats.active} aktif</p>
            </div>
            <div className="mt-8 bg-white/60 backdrop-blur-xs p-4 rounded-2xl border border-white/40">
              <div className="flex justify-between text-xs font-semibold mb-1.5 text-zinc-800">
                <span>Perencanaan</span><span>{stats.planning}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-zinc-800">
                <span>Aktif</span><span>{stats.active}</span>
              </div>
            </div>
          </div>
          {/* Heatmap aktivitas project (reuse ProgressHeatmapCard) */}
          <div className="lg:col-span-3">
            <ProgressHeatmapCard events={reportEvents} />
          </div>
        </main>
        )
      )}

      {/* ============ MODAL: CREATE PROJECT ============ */}
      {showCreateProject && (
        <Modal title="New Project" onClose={() => setShowCreateProject(false)} width={520} hideHeader hideScrollbar>
          {/* Banner visual — triple bullseye, judul & close ditaruh di dalam gambar. */}
          <div className="relative mb-2 sm:mb-3 h-24 sm:h-32 overflow-hidden rounded-2xl bg-zinc-950">
            <img
              src="/bg/project-banner.jpg"
              alt="Tiga anak panah mengenai sasaran"
              className="absolute inset-0 h-full w-full object-contain object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/30 to-transparent" />
            <div className="absolute inset-y-0 left-4 flex items-center">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">New Project</h2>
                <div className="group flex items-center gap-1.5 w-24 sm:w-28">
                  {[
                    { step: 1, Icon: FileText },
                    { step: 2, Icon: Users },
                    { step: 3, Icon: SlidersHorizontal },
                    { step: 4, Icon: Calendar },
                  ].map(({ step, Icon }) => (
                    <div key={step} className="relative h-5 flex-1">
                      <div
                        className={`absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full transition-opacity duration-200 group-hover:opacity-0 ${
                          createStep >= step ? 'bg-[#F2D00D]' : 'bg-zinc-200'
                        }`}
                      />
                      <div
                        className={`absolute inset-0 flex items-center justify-center rounded-full border opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
                          createStep === step
                            ? 'border-[#F2D00D] bg-[#F2D00D] text-zinc-900'
                            : createStep > step
                              ? 'border-[#F2D00D]/40 bg-[#F2D00D]/10 text-[#B89400]'
                              : 'border-zinc-200 bg-white text-zinc-400'
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowCreateProject(false)}
              aria-label="Tutup"
              className="absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-white transition-colors hover:bg-black/50"
            >
              <X size={14} />
            </button>
          </div>
          {createProjError && <div className="rounded-xl bg-red-50 px-3 py-2 text-[12px] text-red-600 mb-3">{createProjError}</div>}
          {/* Tinggi area konten tetap supaya modal tidak naik-turun. */}
          <div className="min-h-0">
            {createStep === 1 && (
            <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
            <Field label="Name">
              <input className={underlineInputCls} value={createProjForm.name} onChange={(e) => setCreateProjForm({ ...createProjForm, name: e.target.value })} placeholder="Nama project" />
            </Field>
            <Field label="Project Code">
              <input className={underlineInputCls} value={createProjForm.projectCode} onChange={(e) => setCreateProjForm({ ...createProjForm, projectCode: e.target.value.toUpperCase() })} placeholder="PRJ-001" />
            </Field>
            <Field label="Priority">
              {(() => {
                const idx = Math.min(priorityLevels.length - 1, Math.max(0, Math.round(prioritySliderValue)))
                const current = priorityLevels[idx]
                return (
                  <div className="pt-1">
                    <div className="mb-2 flex items-center gap-2 transition-all duration-200">
                      <Flag className={`h-4 w-4 transition-colors duration-200 ${current.color}`} />
                      <span className="text-[13px] font-semibold text-zinc-900 transition-all duration-200">{current.label}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={priorityLevels.length - 1}
                      step="any"
                      value={prioritySliderValue}
                      onPointerDown={() => { priorityDraggingRef.current = true }}
                      onPointerUp={() => {
                        priorityDraggingRef.current = false
                        const snapIdx = Math.min(priorityLevels.length - 1, Math.max(0, Math.round(prioritySliderValue)))
                        setPrioritySliderValue(snapIdx)
                        const snapPriority = priorityLevels[snapIdx].value
                        if (snapPriority !== createProjForm.priority) {
                          setCreateProjForm({ ...createProjForm, priority: snapPriority })
                        }
                      }}
                      onChange={(e) => {
                        const v = Number(e.target.value)
                        setPrioritySliderValue(v)
                        const newIdx = Math.min(priorityLevels.length - 1, Math.max(0, Math.round(v)))
                        const newPriority = priorityLevels[newIdx].value
                        if (newPriority !== createProjForm.priority) {
                          setCreateProjForm({ ...createProjForm, priority: newPriority })
                        }
                      }}
                      className="w-full accent-zinc-900"
                    />
                    <div className="mt-1 flex justify-between text-[10px] font-medium text-zinc-400">
                      {priorityLevels.map((l) => (
                        <span key={l.value}>{l.label}</span>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </Field>
            <Field label="Description">
              <textarea className={`${underlineInputCls} !py-1.5`} rows={1} value={createProjForm.description} onChange={(e) => setCreateProjForm({ ...createProjForm, description: e.target.value })} placeholder="Deskripsi singkat" />
            </Field>
          </div>
            </>
            )}
            {createStep === 2 && (
            <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
          <div className="col-start-1 row-start-1">
          <Field label="Project Manager">
            <div className="relative">
              <div className="relative">
                {selectedManager && (
                  <span className="absolute left-2.5 top-1/2 z-10 grid h-6 w-6 -translate-y-1/2 place-items-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 text-[10px] font-bold text-zinc-500">
                    {selectedManager.userAvatarUrl ? (
                      <img
                        src={selectedManager.userAvatarUrl}
                        alt=""
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      memberInitials(selectedManager.userFullName)
                    )}
                  </span>
                )}
                <input
                  className={`${underlineInputCls} ${selectedManager ? '!pl-11' : ''}`}
                  value={managerQuery}
                  onChange={(e) => {
                    const value = e.target.value
                    setManagerQuery(value)
                    setSelectedManager(null)
                    setCreateProjForm({ ...createProjForm, projectManagerId: '' })
                    setManagerDropdownOpen(true)
                  }}
                  onFocus={() => setManagerDropdownOpen(true)}
                  onBlur={() => window.setTimeout(() => setManagerDropdownOpen(false), 120)}
                  placeholder="Cari nama member..."
                />
                {managerSearching && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-400" />
                )}
                {!managerSearching && (managerQuery || createProjForm.projectManagerId) && (
                  <button
                    type="button"
                    onClick={() => {
                      setManagerQuery('')
                      setManagerSuggestions([])
                      setSelectedManager(null)
                      setCreateProjForm({ ...createProjForm, projectManagerId: '' })
                      skipManagerSearch.current = ''
                    }}
                    aria-label="Hapus project manager"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {managerDropdownOpen && managerQuery.trim() && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
                  {managerSearching && (
                    <div className="px-3 py-2 text-[12px] text-zinc-400">Mencari member…</div>
                  )}
                  {!managerSearching && managerSuggestions.length === 0 && (
                    <div className="px-3 py-2 text-[12px] text-zinc-400">Member tidak ditemukan.</div>
                  )}
                  {managerSuggestions.map((m) => (
                    <button
                      type="button"
                      key={m.userId}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        skipManagerSearch.current = m.userFullName
                        setManagerQuery(m.userFullName)
                        setSelectedManager(m)
                        setCreateProjForm({ ...createProjForm, projectManagerId: m.userId })
                        setManagerSuggestions([])
                        setManagerDropdownOpen(false)
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-zinc-50"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 text-[11px] font-bold text-zinc-500">
                        {m.userAvatarUrl ? (
                          <img
                            src={m.userAvatarUrl}
                            alt=""
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          memberInitials(m.userFullName)
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-zinc-900">{m.userFullName}</span>
                        {m.userEmail && (
                          <span className="block truncate text-[11px] text-zinc-400">{m.userEmail}</span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Field>
          </div>
          <div className="col-start-2 row-start-1">
          <Field label="Client (opsional)">
            <div className="relative">
              <div className="relative">
                {selectedClient && (
                  <span className="absolute left-2.5 top-1/2 z-10 grid h-6 w-6 -translate-y-1/2 place-items-center overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
                    {selectedClient.logoUrl ? (
                      <img
                        src={selectedClient.logoUrl}
                        alt=""
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                    )}
                  </span>
                )}
                <input
                  className={`${underlineInputCls} ${selectedClient ? '!pl-11' : ''}`}
                  value={clientQuery}
                  onChange={(e) => {
                    const value = e.target.value
                    setClientQuery(value)
                    setSelectedClient(null)
                    setCreateProjForm({ ...createProjForm, clientId: '' })
                    setClientDropdownOpen(true)
                  }}
                  onFocus={() => setClientDropdownOpen(true)}
                  onBlur={() => window.setTimeout(() => setClientDropdownOpen(false), 120)}
                  placeholder="Cari nama client..."
                />
                {clientSearching && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-400" />
                )}
                {!clientSearching && (clientQuery || createProjForm.clientId) && (
                  <button
                    type="button"
                    onClick={() => {
                      setClientQuery('')
                      setClientSuggestions([])
                      setSelectedClient(null)
                      setCreateProjForm({ ...createProjForm, clientId: '' })
                      skipClientSearch.current = ''
                    }}
                    aria-label="Hapus client"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {clientDropdownOpen && clientQuery.trim() && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
                  {clientSearching && (
                    <div className="px-3 py-2 text-[12px] text-zinc-400">Mencari client…</div>
                  )}
                  {!clientSearching && clientSuggestions.length === 0 && (
                    <div className="px-3 py-2 text-[12px] text-zinc-400">Client tidak ditemukan.</div>
                  )}
                  {clientSuggestions.map((cl) => (
                    <button
                      type="button"
                      key={cl.id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        skipClientSearch.current = cl.name
                        setClientQuery(cl.name)
                        setSelectedClient(cl)
                        setCreateProjForm({ ...createProjForm, clientId: cl.id })
                        setClientSuggestions([])
                        setClientDropdownOpen(false)
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-zinc-50"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                        {cl.logoUrl ? (
                          <img
                            src={cl.logoUrl}
                            alt=""
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <Building2 className="h-4 w-4 text-zinc-400" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-zinc-900">{cl.name}</span>
                        {cl.company && (
                          <span className="block truncate text-[11px] text-zinc-400">{cl.company}</span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Field>
          </div>
          <div className="col-span-2 row-start-2">
          <Field label="Team Members (opsional)">
            {selectedTeam.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {selectedTeam.map((m) => (
                  <button
                    type="button"
                    key={m.userId}
                    onClick={() => toggleTeamMember(m)}
                    title="Klik untuk hapus"
                    className="flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 py-1 pl-1 pr-2 text-[11px] font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                  >
                    <span className="grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-zinc-200 text-[9px] font-bold text-zinc-600">
                      {m.userAvatarUrl ? (
                        <img src={m.userAvatarUrl} alt="" onError={(e) => { e.currentTarget.style.display = 'none' }} className="h-full w-full object-cover" />
                      ) : memberInitials(m.userFullName)}
                    </span>
                    <span className="max-w-[110px] truncate">{m.userFullName}</span>
                    <X className="h-3 w-3 text-zinc-400" />
                  </button>
                ))}
              </div>
            )}
            <div className="relative">
              <div className="relative">
                <input
                  className={underlineInputCls}
                  value={teamQuery}
                  onChange={(e) => {
                    setTeamQuery(e.target.value)
                    setTeamDropdownOpen(true)
                  }}
                  onFocus={() => setTeamDropdownOpen(true)}
                  onBlur={() => window.setTimeout(() => setTeamDropdownOpen(false), 120)}
                  placeholder="Cari member untuk ditambahkan..."
                />
                {teamSearching && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-400" />
                )}
              </div>
              {teamDropdownOpen && teamQuery.trim() && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-lg">
                  {teamSearching && (
                    <div className="px-3 py-2 text-[12px] text-zinc-400">Mencari member…</div>
                  )}
                  {!teamSearching && teamSuggestions.length === 0 && (
                    <div className="px-3 py-2 text-[12px] text-zinc-400">Member tidak ditemukan.</div>
                  )}
                  {teamSuggestions.map((m) => {
                    const picked = createProjForm.teamMemberIds.includes(m.userId)
                    const isPM = m.userId === createProjForm.projectManagerId
                    return (
                      <button
                        type="button"
                        key={m.userId}
                        disabled={isPM}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => toggleTeamMember(m)}
                        className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors ${isPM ? 'cursor-not-allowed opacity-50' : 'hover:bg-zinc-50'}`}
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 text-[11px] font-bold text-zinc-500">
                          {m.userAvatarUrl ? (
                            <img src={m.userAvatarUrl} alt="" onError={(e) => { e.currentTarget.style.display = 'none' }} className="h-full w-full object-cover" />
                          ) : memberInitials(m.userFullName)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium text-zinc-900">{m.userFullName}</span>
                          {m.userEmail && <span className="block truncate text-[11px] text-zinc-400">{m.userEmail}</span>}
                        </span>
                        {isPM ? (
                          <span className="shrink-0 text-[10px] font-semibold text-[#B89400]">Lead</span>
                        ) : picked ? (
                          <Check className="h-4 w-4 shrink-0 text-[#B89400]" />
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </Field>
          </div>
          </div>
            </>
            )}
            {createStep === 3 && (
            <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Status">
              <select className={underlineSelectCls} value={createProjForm.status} onChange={(e) => setCreateProjForm({ ...createProjForm, status: e.target.value })}>
                {Object.entries(STATUS_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
              </select>
            </Field>
            <Field label="Billing Type">
              <select className={underlineSelectCls} value={createProjForm.billingType} onChange={(e) => setCreateProjForm({ ...createProjForm, billingType: e.target.value })}>
                <option value="fixed">Fixed price</option>
                <option value="hourly">Hourly</option>
                <option value="retainer">Retainer</option>
                <option value="internal">Internal (tanpa tagihan)</option>
              </select>
            </Field>
          </div>
          <Field label="Budget (Rp)">
            <input className={underlineInputCls} type="number" min="0" value={createProjForm.budget} onChange={(e) => setCreateProjForm({ ...createProjForm, budget: e.target.value })} placeholder="0" />
          </Field>
            </>
            )}
          {createStep === 4 && (
            <>
          <div className="flex flex-col gap-3">
            {/* Heatmap kalender: 1 tahun penuh (53 minggu) */}
            <div className="w-full rounded-xl border border-zinc-100 bg-zinc-50/50 p-2">
              {(() => {
                const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                const today = new Date()
                const rangeStart = new Date(today)
                rangeStart.setDate(rangeStart.getDate() - 364)
                // Minggu dimulai Senin
                rangeStart.setDate(rangeStart.getDate() - ((rangeStart.getDay() + 6) % 7))
                const rangeEnd = new Date(rangeStart)
                rangeEnd.setDate(rangeEnd.getDate() + 370) // 53 minggu penuh
                const days: Date[] = []
                for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
                  days.push(new Date(d))
                }
                const weeks: Date[][] = []
                for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))
                const selStart = createProjForm.startDate ? new Date(createProjForm.startDate + 'T00:00:00') : null
                const selEnd = createProjForm.endDate ? new Date(createProjForm.endDate + 'T00:00:00') : null
                const hoverParsed = heatmapHover ? new Date(heatmapHover + 'T00:00:00') : null
                const handleDay = (ds: string) => {
                  const clicked = new Date(ds + 'T00:00:00')
                  if (!selStart || (selStart && selEnd)) {
                    setCreateProjForm({ ...createProjForm, startDate: ds, endDate: '' })
                  } else if (clicked >= selStart) {
                    setCreateProjForm({ ...createProjForm, endDate: ds })
                  } else {
                    setCreateProjForm({ ...createProjForm, startDate: ds, endDate: '' })
                  }
                }
                return (
                  <>
                    {/* Label bulan (atas) */}
                    <div className="mb-1 text-[10px] font-medium text-zinc-500">
                      {createProjForm.startDate
                        ? `${new Date(createProjForm.startDate + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} → ${createProjForm.endDate ? new Date(createProjForm.endDate + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'pilih tanggal akhir'}`
                        : 'Klik tanggal untuk mulai pilih range'}
                    </div>
                    {/* Quick select */}
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {[
                        { label: '7H', days: 7 },
                        { label: '30H', days: 30 },
                        { label: 'Bulan ini', days: null },
                      ].map((q) => (
                        <button
                          key={q.label}
                          type="button"
                          onClick={() => {
                            const today = new Date()
                            const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                            if (q.days) {
                              const s = new Date(today); s.setDate(s.getDate() - q.days)
                              setCreateProjForm({ ...createProjForm, startDate: fmt(s), endDate: fmt(today) })
                            } else {
                              const s = new Date(today.getFullYear(), today.getMonth(), 1)
                              const e = new Date(today.getFullYear(), today.getMonth() + 1, 0)
                              setCreateProjForm({ ...createProjForm, startDate: fmt(s), endDate: fmt(e) })
                            }
                          }}
                          className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[9px] font-semibold text-zinc-600 transition-colors hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
                        >
                          {q.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setCreateProjForm({ ...createProjForm, startDate: '', endDate: '' })}
                        className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[9px] font-semibold text-zinc-400 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-500"
                      >
                        Reset
                      </button>
                    </div>
                    <div
                      className="grid gap-0"
                      style={{
                        gridTemplateColumns: `16px repeat(${weeks.length}, minmax(0, 1fr))`,
                        gridTemplateRows: `12px repeat(7, auto)`,
                      }}
                    >
                      {/* Header kosong + label bulan (spasi di awal bulan) */}
                      <div />
                      {weeks.map((week, wi) => {
                        const labelDay = week.find((d) => d.getDate() === 1)
                        const label = labelDay ? labelDay.toLocaleDateString('id-ID', { month: 'short' }) : ''
                        return (
                          <div
                            key={`m${wi}`}
                            className="text-center text-[8px] font-medium leading-none text-zinc-400"
                            style={{ marginLeft: wi > 0 && labelDay ? 5 : 0 }}
                          >
                            {label}
                          </div>
                        )
                      })}
                      {/* 7 baris hari: label + 53 kolom minggu */}
                      {Array.from({ length: 7 }).flatMap((_, r) => [
                        <div key={`l${r}`} className="flex items-center justify-end whitespace-nowrap pr-0.5 text-[8px] font-medium leading-none text-zinc-400">
                          {['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mn'][r]}
                        </div>,
                        ...weeks.map((week, wi) => {
                          const day = week[r]
                          const ds = fmt(day)
                          const monthStart = week.some((d) => d.getDate() === 1)
                          const inRange = selStart && selEnd && day >= selStart && day <= selEnd
                          const isStart = selStart && ds === createProjForm.startDate
                          const isEnd = selEnd && ds === createProjForm.endDate
                          const isToday = fmt(today) === ds
                          const previewRange = selStart && !selEnd && hoverParsed && hoverParsed >= selStart
                          const inPreview = previewRange && day >= selStart! && day <= hoverParsed!
                          return (
                            <button
                              key={`c${r}-${wi}`}
                              type="button"
                              onClick={() => handleDay(ds)}
                              onMouseEnter={() => setHeatmapHover(ds)}
                              onMouseLeave={() => setHeatmapHover(null)}
                              title={new Date(ds + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                              style={{ marginLeft: wi > 0 && monthStart ? 5 : 0 }}
                              className={`aspect-square w-full rounded-[2px] transition-all duration-150 hover:scale-125 ${
                                isStart || isEnd
                                  ? 'bg-zinc-900'
                                  : inRange
                                    ? 'bg-amber-300'
                                    : inPreview
                                      ? 'bg-amber-200'
                                      : isToday
                                        ? 'bg-blue-400'
                                        : 'bg-zinc-200 hover:bg-zinc-300'
                              }`}
                            />
                          )
                        }),
                      ])}
                    </div>
                  </>
                )
              })()}
            </div>
            {/* Field tanggal */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date">
                <div className="relative">
                  <input ref={startDateRef} className={`${underlineInputCls} pr-8`} type="date" value={createProjForm.startDate} onChange={(e) => setCreateProjForm({ ...createProjForm, startDate: e.target.value })} />
                  <button type="button" onClick={() => startDateRef.current?.showPicker?.()} className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700">
                    <Calendar className="h-4 w-4" />
                  </button>
                </div>
              </Field>
              <Field label="End Date">
                <div className="relative">
                  <input ref={endDateRef} className={`${underlineInputCls} pr-8`} type="date" value={createProjForm.endDate} onChange={(e) => setCreateProjForm({ ...createProjForm, endDate: e.target.value })} />
                  <button type="button" onClick={() => endDateRef.current?.showPicker?.()} className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700">
                    <Calendar className="h-4 w-4" />
                  </button>
                </div>
              </Field>
            </div>
          </div>
            </>
            )}
          </div>
          <div className="mt-5 flex items-center justify-end gap-2 sticky bottom-0 bg-white/95 backdrop-blur-sm py-2 -mx-4 sm:-mx-6 px-4 sm:px-6">
            {createStep > 1 && (
              <button
                type="button"
                onClick={() => { setCreateStep((prev) => prev - 1); setCreateProjError('') }}
                aria-label="Kembali"
                className="group flex h-9 w-9 items-center justify-center rounded-full bg-[#F2D00D] text-zinc-900 transition-colors hover:bg-[#e0bd00]"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
              </button>
            )}
            <button
              type="button"
              onClick={createStep < 4 ? goNextStep : submitCreateProject}
              disabled={creatingProject}
              aria-label={createStep < 4 ? 'Lanjut' : 'Buat project'}
              className="group flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white shadow-md transition-colors hover:bg-[#F2D00D] hover:text-zinc-900 disabled:opacity-50"
            >
              {creatingProject && createStep === 3 ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : createStep < 4 ? (
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              ) : (
                <Check className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              )}
            </button>
          </div>
        </Modal>
      )}

      {/* ============ MODAL: DETAIL/EDIT PROJECT ============ */}
      {detailProject && (
        <Modal title={`Project ${detailProject.projectCode}`} onClose={() => setDetailProject(null)} width={520}>
          {detailLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="animate-spin text-zinc-500" size={20} /></div>
          ) : (
            <>
              {editProjError && <div className="rounded-xl bg-red-50 px-3 py-2 text-[12px] text-red-600 mb-3">{editProjError}</div>}
              {canWrite ? (
                <>
                  <Field label="Name">
                    <input className={inputCls} value={editProjForm.name} onChange={(e) => setEditProjForm({ ...editProjForm, name: e.target.value })} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Status">
                      <select className={selectCls} value={editProjForm.status} onChange={(e) => setEditProjForm({ ...editProjForm, status: e.target.value })}>
                        {Object.entries(STATUS_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                      </select>
                    </Field>
                    <Field label="Budget (Rp)">
                      <input className={inputCls} type="number" min="0" value={editProjForm.budget} onChange={(e) => setEditProjForm({ ...editProjForm, budget: e.target.value })} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Start Date">
                      <input className={inputCls} type="date" value={editProjForm.startDate} onChange={(e) => setEditProjForm({ ...editProjForm, startDate: e.target.value })} />
                    </Field>
                    <Field label="End Date">
                      <input className={inputCls} type="date" value={editProjForm.endDate} onChange={(e) => setEditProjForm({ ...editProjForm, endDate: e.target.value })} />
                    </Field>
                  </div>
                  <Field label="Description">
                    <textarea className={inputCls} rows={2} value={editProjForm.description} onChange={(e) => setEditProjForm({ ...editProjForm, description: e.target.value })} />
                  </Field>
                  <div className="flex justify-between items-center mt-5">
                    <button
                      onClick={() => deleteProject(detailProject)}
                      className="text-[12px] font-medium text-red-500 hover:text-red-600 transition-colors"
                    >
                      Hapus project
                    </button>
                    <div className="flex gap-2">
                      <GhostBtn onClick={() => setDetailProject(null)}>Batal</GhostBtn>
                      <SolidBtn onClick={submitEditProject} disabled={savingProject}>
                        {savingProject ? 'Saving…' : 'Save'}
                      </SolidBtn>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-full">{detailProject.projectCode}</span>
                    <span className="text-[11px] font-semibold text-zinc-600">{STATUS_LABEL[detailProject.status] || detailProject.status}</span>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900">{detailProject.name}</h3>
                  {detailProject.description && <p className="text-[13px] text-zinc-600">{detailProject.description}</p>}
                  <div className="grid grid-cols-2 gap-2 text-[12px] text-zinc-600">
                    <span>Budget: <b>{rp(Number(detailProject.budget))}</b></span>
                    <span>Due: <b>{fmtDate(detailProject.endDate)}</b></span>
                  </div>
                </div>
              )}

              {/* Members */}
              <div className="mt-5 pt-4 border-t border-zinc-100">
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Members ({detailProject.members.length})</p>
                {detailProject.members.length === 0 ? (
                  <p className="text-[12px] text-zinc-400">Belum ada member di project ini.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {detailProject.members.map((m) => (
                      <div key={m.id} className="flex items-center gap-2.5">
                        <Avatar name={memberName(m.userId)} url={memberAvatar(m.userId)} size={26} />
                        <span className="text-[12px] text-zinc-800 flex-1">{memberName(m.userId) || 'User'}</span>
                        <span className="text-[10px] font-semibold text-zinc-400 uppercase">{m.roleInProject}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Milestones */}
              <div className="mt-4 pt-4 border-t border-zinc-100">
                  {/* Client yang di-handle — opsional */}
                  <div className="flex items-center justify-between text-[12px] text-slate-700 mb-2">
                    <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">Client</span>
                    <span className="font-medium">{clients.find((c) => c.id === detailProject.clientId)?.name || '— internal (tanpa client) —'}</span>
                  </div>


                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Milestones ({detailProject.milestones.length})</p>
                {detailProject.milestones.length === 0 ? (
                  <p className="text-[12px] text-zinc-400">Belum ada milestone.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {detailProject.milestones.map((ms) => (
                      <div key={ms.id} className="flex items-center justify-between text-[12px] text-zinc-700">
                        <span>{ms.title}</span>
                        <span className="text-zinc-400">{fmtDate(ms.dueDate)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {canWrite && (
                  <div className="mt-2 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      value={milestoneForm.title}
                      onChange={(e) => setMilestoneForm((p) => ({ ...p, title: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') submitMilestone() }}
                      placeholder="Milestone baru…"
                      disabled={milestoneBusy}
                      className={inputCls + ' flex-1'}
                    />
                    <input
                      type="date"
                      value={milestoneForm.dueDate}
                      onChange={(e) => setMilestoneForm((p) => ({ ...p, dueDate: e.target.value }))}
                      disabled={milestoneBusy}
                      className={inputCls}
                      style={{ maxWidth: 140 }}
                    />
                    <button
                      onClick={submitMilestone}
                      disabled={milestoneBusy || !milestoneForm.title.trim()}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-zinc-900/85 text-white disabled:opacity-40 hover:bg-zinc-900 transition whitespace-nowrap"
                    >Tambah</button>
                  </div>
                )}
                {milestoneErr && <p className="text-[11px] text-red-500 mt-1">{milestoneErr}</p>}
              </div>
            </>
          )}
        </Modal>
      )}

      {/* ============ MODAL: CREATE TASK ============ */}
      {showCreateTask && (
        <Modal title="New Task" onClose={() => setShowCreateTask(false)}>
          {createTaskError && <div className="rounded-xl bg-red-50 px-3 py-2 text-[12px] text-red-600 mb-3">{createTaskError}</div>}
          <Field label="Title">
            <input className={inputCls} value={createTaskForm.title} onChange={(e) => setCreateTaskForm({ ...createTaskForm, title: e.target.value })} placeholder="Judul task" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kolom">
              <select className={selectCls} value={createTaskForm.columnId} onChange={(e) => setCreateTaskForm({ ...createTaskForm, columnId: e.target.value })}>
                {boardColumns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select className={selectCls} value={createTaskForm.priority} onChange={(e) => setCreateTaskForm({ ...createTaskForm, priority: e.target.value })}>
                {['low', 'medium', 'high', 'urgent'].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Tipe">
            <select className={selectCls} value={createTaskForm.taskType} onChange={(e) => setCreateTaskForm({ ...createTaskForm, taskType: e.target.value })}>
              <option value="general">General</option>
              <option value="social_media">Social Media</option>
            </select>
          </Field>
          {createTaskForm.taskType === 'social_media' && (
            <>
              <Field label="Tipe Konten">
                <select className={selectCls} value={createTaskForm.contentType} onChange={(e) => setCreateTaskForm({ ...createTaskForm, contentType: e.target.value })}>
                  <option value="">— pilih —</option>
                  <optgroup label="Konten Mandiri">
                    <option value="organic">Organic Content</option>
                    <option value="honest_review">Honest / Unpaid Review</option>
                    <option value="ugc_portfolio">UGC Portfolio</option>
                    <option value="affiliate">Affiliate Content</option>
                  </optgroup>
                  <optgroup label="Kerja Sama Brand">
                    <option value="collab">Collab (Collaboration)</option>
                    <option value="endorsement">Endorsement</option>
                    <option value="paid_promote">Paid Promote</option>
                    <option value="barter">Barter Value</option>
                    <option value="paid_ugc">Paid UGC</option>
                    <option value="brand_ambassador">Brand Ambassador</option>
                  </optgroup>
                </select>
              </Field>
              <Field label="Format Konten">
                <select className={selectCls} value={createTaskForm.contentFormat} onChange={(e) => setCreateTaskForm({ ...createTaskForm, contentFormat: e.target.value })}>
                  <option value="">— pilih —</option>
                  <option value="educational">Educational / How-To</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="vlog">Vlog / Storytelling</option>
                  <option value="review_comparison">Review &amp; Comparison</option>
                  <option value="interactive">Interactive</option>
                  <option value="bts">Behind The Scenes (BTS)</option>
                </select>
              </Field>
              <Field label="Channel (minimal 1)">
                <div className="flex flex-wrap gap-1.5">
                  {SOCIAL_PLATFORMS.map((p) => {
                    const checked = createTaskForm.channels.includes(p.key)
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => toggleCreateChannel(p.key)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition cursor-pointer ${
                          checked
                            ? 'bg-[#8F6CFC] border-[#8F6CFC] text-white'
                            : 'bg-white text-zinc-600 border-zinc-300/60 hover:border-zinc-400'
                        }`}
                      >
                        <img src={p.logo} alt="" className="h-3.5 w-3.5 object-contain" />
                        {p.label}
                      </button>
                    )
                  })}
                </div>
              </Field>
            </>
          )}
          <Field label="Assignee (opsional)">
            <select className={selectCls} value={createTaskForm.assignedTo} onChange={(e) => setCreateTaskForm({ ...createTaskForm, assignedTo: e.target.value })}>
              <option value="">— belum ditentukan —</option>
              {members.map((m) => <option key={m.userId} value={m.userId}>{m.userFullName}</option>)}
            </select>
          </Field>
          <Field label="Due Date">
            <input className={inputCls} type="date" value={createTaskForm.dueDate} onChange={(e) => setCreateTaskForm({ ...createTaskForm, dueDate: e.target.value })} />
          </Field>
          <Field label="Description">
            <textarea className={inputCls} rows={2} value={createTaskForm.description} onChange={(e) => setCreateTaskForm({ ...createTaskForm, description: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 mt-5">
            <GhostBtn onClick={() => setShowCreateTask(false)}>Batal</GhostBtn>
            <SolidBtn onClick={submitCreateTask} disabled={creatingTask}>
              {creatingTask ? 'Creating…' : 'Create'}
            </SolidBtn>
          </div>
        </Modal>
      )}

      {/* ============ MODAL: EDIT TASK ============ */}
      {showEditTask && editTaskId && (
        <Modal title="Edit Task" onClose={() => setShowEditTask(false)}>
          {editTaskError && <div className="rounded-xl bg-red-50 px-3 py-2 text-[12px] text-red-600 mb-3">{editTaskError}</div>}
          <Field label="Title">
            <input className={inputCls} value={editTaskForm.title} onChange={(e) => setEditTaskForm({ ...editTaskForm, title: e.target.value })} placeholder="Judul task" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kolom">
              <select className={selectCls} value={editTaskForm.columnId} onChange={(e) => setEditTaskForm({ ...editTaskForm, columnId: e.target.value })}>
                {boardColumns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select className={selectCls} value={editTaskForm.priority} onChange={(e) => setEditTaskForm({ ...editTaskForm, priority: e.target.value })}>
                {['low', 'medium', 'high', 'urgent'].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Tipe">
            <select className={selectCls} value={editTaskForm.taskType} onChange={(e) => setEditTaskForm({ ...editTaskForm, taskType: e.target.value })}>
              <option value="general">General</option>
              <option value="social_media">Social Media</option>
            </select>
          </Field>
          {editTaskForm.taskType === 'social_media' && (
            <>
              <Field label="Tipe Konten">
                <select className={selectCls} value={editTaskForm.contentType} onChange={(e) => setEditTaskForm({ ...editTaskForm, contentType: e.target.value })}>
                  <option value="">— pilih —</option>
                  <optgroup label="Konten Mandiri">
                    <option value="organic">Organic Content</option>
                    <option value="honest_review">Honest / Unpaid Review</option>
                    <option value="ugc_portfolio">UGC Portfolio</option>
                    <option value="affiliate">Affiliate Content</option>
                  </optgroup>
                  <optgroup label="Kerja Sama Brand">
                    <option value="collab">Collab (Collaboration)</option>
                    <option value="endorsement">Endorsement</option>
                    <option value="paid_promote">Paid Promote</option>
                    <option value="barter">Barter Value</option>
                    <option value="paid_ugc">Paid UGC</option>
                    <option value="brand_ambassador">Brand Ambassador</option>
                  </optgroup>
                </select>
              </Field>
              <Field label="Format Konten">
                <select className={selectCls} value={editTaskForm.contentFormat} onChange={(e) => setEditTaskForm({ ...editTaskForm, contentFormat: e.target.value })}>
                  <option value="">— pilih —</option>
                  <option value="educational">Educational / How-To</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="vlog">Vlog / Storytelling</option>
                  <option value="review_comparison">Review &amp; Comparison</option>
                  <option value="interactive">Interactive</option>
                  <option value="bts">Behind The Scenes (BTS)</option>
                </select>
              </Field>
              <Field label="Channel (minimal 1)">
                <div className="flex flex-wrap gap-1.5">
                  {SOCIAL_PLATFORMS.map((p) => {
                    const checked = editTaskForm.channels.includes(p.key)
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setEditTaskForm((prev) => ({
                          ...prev,
                          channels: prev.channels.includes(p.key)
                            ? prev.channels.filter((c) => c !== p.key)
                            : [...prev.channels, p.key],
                        }))}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition cursor-pointer ${
                          checked
                            ? 'bg-[#8F6CFC] border-[#8F6CFC] text-white'
                            : 'bg-white text-zinc-600 border-zinc-300/60 hover:border-zinc-400'
                        }`}
                      >
                        <img src={p.logo} alt="" className="h-3.5 w-3.5 object-contain" />
                        {p.label}
                      </button>
                    )
                  })}
                </div>
              </Field>
              {editTaskForm.channels.length > 0 && (
                <Field label="Link konten per channel (wajib sebelum Done)">
                  <div className="space-y-2">
                    {editTaskForm.channels.map((ch) => {
                      const p = SOCIAL_PLATFORMS.find((x) => x.key === ch)
                      return (
                        <div key={ch} className="flex items-center gap-2">
                          <img src={p?.logo} alt="" className="h-4 w-4 object-contain shrink-0" />
                          <span className="text-[11px] font-semibold text-zinc-600 w-20 shrink-0">{p?.label}</span>
                          <input
                            className={inputCls}
                            placeholder={`https://${ch === 'youtube_shorts' ? 'youtube' : ch}.com/...`}
                            value={editTaskForm.channelLinks[ch] ?? ''}
                            onChange={(e) => setEditTaskForm((prev) => ({
                              ...prev,
                              channelLinks: { ...prev.channelLinks, [ch]: e.target.value },
                            }))}
                          />
                        </div>
                      )
                    })}
                  </div>
                </Field>
              )}
            </>
          )}
          <Field label="Due Date">
            <input className={inputCls} type="date" value={editTaskForm.dueDate} onChange={(e) => setEditTaskForm({ ...editTaskForm, dueDate: e.target.value })} />
          </Field>
          <Field label="Description">
            <textarea className={inputCls} rows={2} value={editTaskForm.description} onChange={(e) => setEditTaskForm({ ...editTaskForm, description: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 mt-5">
            <GhostBtn onClick={() => setShowEditTask(false)}>Batal</GhostBtn>
            <SolidBtn onClick={submitEditTask} disabled={savingTask}>
              {savingTask ? 'Saving…' : 'Save'}
            </SolidBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}


/* List table daftar project — mode kedua toggle Card/Table di tab Project */
function ProjectTable({ items, onOpen }: { items: ProjectItem[]; onOpen: (id: string) => void }) {
  return (
    <div className="bg-white rounded-3xl border border-zinc-200/60 shadow-xs overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold bg-zinc-50/80">
            <th className="px-5 py-3.5 font-semibold">Project</th>
            <th className="px-5 py-3.5 font-semibold">Status</th>
            <th className="px-5 py-3.5 font-semibold hidden md:table-cell">Progress</th>
            <th className="px-5 py-3.5 font-semibold hidden lg:table-cell">Team</th>
            <th className="px-5 py-3.5 font-semibold text-right">Due</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => {
            const pct = p.totalTasks > 0 ? Math.round((p.completedTasks / p.totalTasks) * 100) : 0
            return (
              <tr
                key={p.id}
                onClick={() => onOpen(p.id)}
                title="Buka detail project"
                className="border-t border-zinc-100 cursor-pointer hover:bg-zinc-50 transition"
              >
                <td className="px-5 py-3.5">
                  <p className="text-sm font-semibold text-zinc-900">{p.name}</p>
                  <p className="text-[11px] text-zinc-400 font-medium truncate max-w-[220px]">
                    {p.category}
                    {p.clientName ? ` · ${p.clientName}` : ''}
                    {p.tenantName ? ` · ${p.tenantName}` : ''}
                  </p>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 hidden md:table-cell min-w-[150px]">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-zinc-900/10 overflow-hidden">
                      <div className="h-full bg-zinc-900 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-zinc-600 w-9 text-right">{pct}%</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    {p.completedTasks}/{p.totalTasks} tasks
                  </p>
                </td>
                <td className="px-5 py-3.5 hidden lg:table-cell">
                  <div className="flex -space-x-2">
                    {p.team.map((m) => (
                      <div
                        key={m.userId}
                        title={m.name}
                        className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white flex items-center justify-center text-[9px] font-bold shrink-0"
                      >
                        {m.url ? (
                          <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                        ) : (
                          m.name?.charAt(0) || '?'
                        )}
                      </div>
                    ))}
                    {p.team.length === 0 && (
                      <span className="text-[10px] text-zinc-400 italic">belum ada member</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <span className="text-[10px] font-bold text-zinc-600 bg-zinc-50 px-2.5 py-1 rounded-full border border-zinc-100 whitespace-nowrap">
                    {p.dueDate ? `Due ${p.dueDate}` : 'Due -'}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {items.length === 0 && (
        <p className="px-5 py-8 text-center text-xs text-zinc-400">Belum ada project.</p>
      )}
    </div>
  )
}


function ProjectCard({
  project,
  onOpen,
}: {
  project: ProjectItem;
  onOpen: () => void;
}) {
  const percentage = project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0;


  return (
    <div
      onClick={onOpen}
      className={`${project.bgColor} rounded-3xl p-6 flex flex-col justify-between h-64 shadow-xs relative hover:-translate-y-1 transition-all duration-300 group cursor-pointer`}
      title="Buka detail project"
    >
      {/* Header */}
      <div>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-600/90 bg-white/40 px-2.5 py-1 rounded-full">
              {project.category}
            </span>
            {/* Tag company asal — hanya tampil di platform view (tenantName
                di-enrich backend hanya untuk X-Platform-Scope: all). */}
            {project.tenantName && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/90 bg-zinc-900/70 px-2 py-1 rounded-full">
                {project.tenantName}
              </span>
            )}
            {/* Client yang di-handle — tidak tampil bila project internal */}
            {project.clientName && (
              <span className="text-[9px] font-semibold text-slate-600 bg-white/70 border border-slate-200/70 px-2 py-1 rounded-full max-w-[120px] truncate">
                🧑‍💼 {project.clientName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); onOpen() }}
              className="text-zinc-600 hover:text-black p-1 rounded-full"
              title="Detail project"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>


        <h3 className="font-bold text-lg leading-snug text-zinc-900 mt-1">{project.name}</h3>
        {project.status && (
          <p className="text-[11px] font-medium text-zinc-500 mt-0.5">{project.status}</p>
        )}
      </div>


      {/* Progress Section */}
      <div className="my-2">
        <div className="flex justify-between items-center text-xs font-semibold mb-1.5 text-zinc-800">
          <span>{project.completedTasks} / {project.totalTasks} Tasks Completed</span>
          <span>{percentage}%</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-900/10 overflow-hidden">
          <div
            className="h-full bg-zinc-900 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>


      {/* Footer */}
      <div className="flex justify-between items-center pt-2 border-t border-zinc-900/10">
        <div className="flex -space-x-2">
          {project.team.map((m) => (
            <div key={m.userId} className="rounded-full border-2 border-white/70 overflow-hidden" title={m.name}>
              <Avatar name={m.name} url={m.url} size={26} />
            </div>
          ))}
          {project.team.length === 0 && (
            <span className="text-[10px] text-zinc-500 italic">belum ada member</span>
          )}
        </div>


        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-600 bg-white/60 px-2.5 py-1 rounded-full">
            Due {project.dueDate}
          </span>
        </div>
      </div>
    </div>
  );
}


function Card({
  item,
  isExpanded,
  onToggle,
  expandedDetail,
  taskError,
  commentDraft,
  setCommentDraft,
  addingComment,
  onSubmitComment,
  canWrite,
  columns,
  onMove,
  resolveName,
  resolveAvatar,
  members,
  assigneePick,
  setAssigneePick,
  assigneeBusy,
  onAddAssignee,
  onRemoveAssignee,
  projectTags,
  taskTagIds,
  newTagDraft,
  setNewTagDraft,
  tagBusy,
  onAttachTag,
  onDetachTag,
  onCreateTag,
  onEdit,
}: {
  item: TaskItem;
  isExpanded: boolean;
  onToggle: () => void;
  expandedDetail: { assignees: TaskAssigneeRow[]; comments: TaskCommentRow[]; tagIds?: string[] } | null;
  taskError: string;
  commentDraft: string;
  setCommentDraft: (v: string) => void;
  addingComment: boolean;
  onSubmitComment: () => void;
  canWrite: boolean;
  columns: ColumnRow[];
  onMove: (columnId: string) => void;
  resolveName: (userId: string) => string | undefined;
  resolveAvatar: (userId: string) => string | null;
  members: MemberListRow[];
  assigneePick: string;
  setAssigneePick: (v: string) => void;
  assigneeBusy: boolean;
  onAddAssignee: () => void;
  onRemoveAssignee: (userId: string) => void;
  projectTags: { id: string; name: string; colorCode: string | null }[];
  taskTagIds: string[];
  newTagDraft: string;
  setNewTagDraft: (v: string) => void;
  tagBusy: boolean;
  onAttachTag: (tagId: string) => void;
  onDetachTag: (tagId: string) => void;
  onCreateTag: (name: string) => void;
  onEdit: (taskId: string) => void;
}) {


  return (
    <div
      onClick={onToggle}
      draggable={!isExpanded}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', item.id)
        e.dataTransfer.effectAllowed = 'move'
      }}
      className={`${item.bgColor} rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 ease-in-out cursor-pointer shadow-xs relative group ${
        isExpanded ? 'min-h-[22rem] ring-2 ring-zinc-900/10 shadow-lg' : 'h-44 overflow-hidden hover:-translate-y-1'
      }`}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-sm leading-snug text-zinc-900 pr-2">{item.title}</h3>
        <div className="flex items-center gap-1">
          <span className="p-1 text-zinc-500 group-hover:text-black transition">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>
      </div>


      {/* Meta: kolom + priority + overdue (pengganti segmen subtask — task real tak punya subtask) */}
      <div className="flex flex-wrap items-center gap-1.5 my-2">
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/50 text-zinc-700">
          {item.columnId ? (columns.find((c) => c.id === item.columnId)?.name || '') : ''}
        </span>
        {item.taskType === 'social_media' && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#8F6CFC]/90 text-white">
            Social Media
          </span>
        )}
        {item.priority && item.priority !== 'medium' && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            item.priority === 'urgent' ? 'bg-red-500/80 text-white'
              : item.priority === 'high' ? 'bg-orange-400/80 text-white'
                : 'bg-zinc-300/70 text-zinc-700'
          }`}>
            {item.priority}
          </span>
        )}
        {/* Overdue: dueDate lewat hari ini & belum selesai (kolom Done tak dikenai) */}
        {(() => {
          if (!item.dueDateRaw) return null
          const isDone = (columns.find((c) => c.id === item.columnId)?.name || '').toLowerCase() === 'done'
          if (isDone) return null
          // Bandingkan tanggal kalender (abaikan jam/timezone) supaya tidak
          // off-by-one akibat dueDate disimpan UTC midnight.
          const dueD = new Date(item.dueDateRaw.slice(0, 10) + 'T00:00:00')
          const now = new Date()
          const todayD = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          const days = Math.round((todayD.getTime() - dueD.getTime()) / 86_400_000)
          if (Number.isNaN(dueD.getTime()) || days < 1) return null
          return (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200">
              Terlambat {days}h
            </span>
          )
        })()}
      </div>


      {isExpanded && (
        <div
          className="my-3 pt-3 border-t border-zinc-900/10 flex flex-col gap-2 max-h-56 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Detail Task</span>
            <div className="flex items-center gap-2">
              {canWrite && (
                <button
                  type="button"
                  onClick={() => onEdit(item.id)}
                  className="text-[10px] font-semibold text-zinc-600 hover:text-zinc-900 underline underline-offset-2 cursor-pointer"
                >
                  Edit Task
                </button>
              )}
              <span className="text-[10px] font-medium text-zinc-500">{item.date}</span>
            </div>
          </div>


          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 shrink-0">Assignees</span>
              <div className="flex -space-x-1.5">
                {(expandedDetail?.assignees || []).map((a) => (
                  <div key={a.id} className="relative rounded-full border border-white/70 overflow-hidden group/av">
                    <Avatar name={resolveName(a.userId)} url={resolveAvatar(a.userId)} size={22} />
                    {canWrite && (
                      <button
                        onClick={() => onRemoveAssignee(a.userId)}
                        disabled={assigneeBusy}
                        title={`Cabut ${resolveName(a.userId) || 'assignee'}`}
                        className="absolute inset-0 hidden group-hover/av:flex items-center justify-center bg-black/45 text-white text-[9px] leading-none"
                      >×</button>
                    )}
                  </div>
                ))}
              </div>
              {(expandedDetail?.assignees || []).length === 0 && (
                <span className="text-[10px] text-zinc-400">belum ada</span>
              )}
            </div>
            {/* Tambah assignee: satu task bisa dikerjakan beberapa user */}
            {canWrite && (
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <select
                  value={assigneePick}
                  onChange={(e) => setAssigneePick(e.target.value)}
                  disabled={assigneeBusy}
                  className="text-[10px] text-zinc-700 bg-white/70 border border-zinc-300/70 rounded-lg px-1.5 py-1 outline-none focus:border-zinc-500 max-w-[10rem]"
                >
                  <option value="">+ tambah assignee…</option>
                  {members
                    .filter((m) => !(expandedDetail?.assignees || []).some((a) => a.userId === m.userId))
                    .map((m) => <option key={m.userId} value={m.userId}>{m.userFullName}</option>)}
                </select>
                <button
                  onClick={onAddAssignee}
                  disabled={assigneeBusy || !assigneePick}
                  className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-zinc-900/85 text-white disabled:opacity-40 hover:bg-zinc-900 transition"
                >Tambah</button>
              </div>
            )}
          </div>


          {/* Tags task (project-scoped) — lampirkan / lepas / buat baru */}
          <div className="flex flex-wrap items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 shrink-0">Tags</span>
            {(taskTagIds || []).map((tid) => {
              const tg = projectTags.find((x) => x.id === tid)
              return (
                <span key={tid} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70 text-zinc-700 border border-zinc-300/60">
                  {tg?.name || 'tag'}
                  {canWrite && (
                    <button onClick={() => onDetachTag(tid)} disabled={tagBusy} title="Lepas tag" className="text-zinc-400 hover:text-red-500 leading-none">×</button>
                  )}
                </span>
              )
            })}
            {(taskTagIds || []).length === 0 && <span className="text-[10px] text-zinc-400">belum ada</span>}
            {canWrite && (
              <>
                <select
                  value=""
                  onChange={(e) => { if (e.target.value) onAttachTag(e.target.value) }}
                  disabled={tagBusy}
                  className="text-[10px] text-zinc-700 bg-white/70 border border-zinc-300/70 rounded-lg px-1.5 py-1 outline-none focus:border-zinc-500 max-w-[9rem]"
                >
                  <option value="">+ tag…</option>
                  {projectTags.filter((t) => !(taskTagIds || []).includes(t.id)).map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <input
                  value={newTagDraft}
                  onChange={(e) => setNewTagDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && newTagDraft.trim()) onCreateTag(newTagDraft.trim()) }}
                  placeholder="tag baru…"
                  disabled={tagBusy}
                  className="text-[10px] text-zinc-700 bg-white/70 border border-zinc-300/70 rounded-lg px-1.5 py-1 outline-none focus:border-zinc-500 w-20"
                />
                {newTagDraft.trim() && (
                  <button
                    onClick={() => onCreateTag(newTagDraft.trim())}
                    disabled={tagBusy}
                    className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-zinc-900/85 text-white disabled:opacity-40 hover:bg-zinc-900 transition"
                  >Buat</button>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col gap-1.5 max-h-28 overflow-y-auto">
            {(expandedDetail?.comments || []).map((c) => (
              <div key={c.id} className="bg-white/60 rounded-xl px-2.5 py-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-zinc-700">{resolveName(c.userId) || 'User'}</span>
                  <span className="text-[9px] text-zinc-400">{fmtDate(c.createdAt)}</span>
                </div>
                <p className="text-[11px] text-zinc-700">{c.comment}</p>
              </div>
            ))}
            {(expandedDetail?.comments || []).length === 0 && (
              <span className="text-[10px] text-zinc-400">Belum ada komentar.</span>
            )}
          </div>


          <input
            value={commentDraft}
            onChange={(e) => setCommentDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSubmitComment() }}
            placeholder={addingComment ? 'Mengirim…' : 'Tulis komentar… (Enter)'}
            disabled={addingComment}
            className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 text-[11px] bg-white outline-none focus:border-zinc-900 disabled:opacity-60"
          />


          {canWrite && (
            <select
              value={item.columnId}
              onChange={(e) => onMove(e.target.value)}
              className="text-[11px] text-zinc-700 border border-zinc-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:border-zinc-900 cursor-pointer"
              title="Pindah ke kolom"
            >
              {columns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          {taskError && (
            <span className="text-[10px] text-red-500">{taskError}</span>
          )}
        </div>
      )}


      <div className="flex justify-between items-end mt-auto pt-2">
        <div className="flex items-center gap-2.5">
          <Avatar name={item.author} url={item.avatar} size={26} />
          <div>
            <p className="text-xs font-semibold text-zinc-900 leading-tight">{item.author}</p>
            <p className="text-[10px] text-zinc-500 font-medium">{item.date}</p>
          </div>
        </div>


        {canWrite && !isExpanded && (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <select
              value={item.columnId}
              onChange={(e) => onMove(e.target.value)}
              className="text-[10px] text-zinc-600 border border-white/60 rounded-full px-2 py-1 bg-white/60 outline-none cursor-pointer"
              title="Pindah ke kolom"
            >
              {columns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
