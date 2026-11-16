import { useState, useEffect, useMemo } from 'react'
import ProgressHeatmapCard, { type ProgressEvent } from './company/ProgressHeatmapCard'
import {
  BarChart3,
  Cloud,
  Settings,
  MoreHorizontal,
  RotateCw,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp,
  Folder,
  TrendingUp,
  Wallet,
  Loader2,
  Plus,
  X,
} from 'lucide-react';
import { projectsApi, tasksApi, membersApi, clientsApi, tagsApi } from '../lib/endpoints'
import { isPlatformMode } from '../lib/api'
import { canAccessPerm, fetchAccess, type AccessCtx, FALLBACK_ACCESS } from '../lib/access'

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"

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
}
interface ColumnRow { id: string; projectId: string; name: string; position: number; colorCode: string }
interface ProjectMemberRow { id: string; projectId: string; userId: string; roleInProject: string }
interface MilestoneRow { id: string; projectId: string; title: string; dueDate: string | null; status: string }
interface TaskAssigneeRow { id: string; taskId: string; userId: string }
interface TaskCommentRow { id: string; taskId: string; userId: string; comment: string; createdAt: string }
interface MemberListRow { userId: string; userFullName: string; userAvatarUrl: string | null }
interface ClientListRow { id: string; name: string }
interface ProjectDetail { columns: ColumnRow[]; members: ProjectMemberRow[]; milestones: MilestoneRow[] }
interface Stats {
  total: number; planning: number; active: number; onHold: number
  completed: number; cancelled: number; totalBudget: number
}

const STATUS_LABEL: Record<string, string> = {
  planning: 'Perencanaan', active: 'Aktif', on_hold: 'Ditunda',
  completed: 'Selesai', cancelled: 'Dibatalkan',
}

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

function Modal({ title, onClose, width = 440, children }: { title: string; onClose: () => void; width?: number; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full p-6 max-h-[90%] overflow-y-auto" style={{ maxWidth: width, fontFamily: SF }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-zinc-900">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500">
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
      <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">{label}</div>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-[13px] text-zinc-900 outline-none focus:border-zinc-900 bg-white box-border'
const selectCls = 'w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-[13px] text-zinc-900 outline-none focus:border-zinc-900 bg-white'

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

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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
  const [createProjForm, setCreateProjForm] = useState({ name: '', projectCode: '', projectManagerId: '', clientId: '', status: 'planning', budget: '', startDate: '', endDate: '', description: '' })
  const [createProjError, setCreateProjError] = useState('')
  const [creatingProject, setCreatingProject] = useState(false)

  const [detailProject, setDetailProject] = useState<(ProjectRow & { members: ProjectMemberRow[]; milestones: MilestoneRow[]; columns: ColumnRow[] }) | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [editProjForm, setEditProjForm] = useState({ name: '', status: '', budget: '', startDate: '', endDate: '', description: '' })
  const [editProjError, setEditProjError] = useState('')
  const [savingProject, setSavingProject] = useState(false)

  const [showCreateTask, setShowCreateTask] = useState(false)
  const [createTaskForm, setCreateTaskForm] = useState({ title: '', columnId: '', priority: 'medium', dueDate: '', assignedTo: '', description: '' })
  const [createTaskError, setCreateTaskError] = useState('')
  const [creatingTask, setCreatingTask] = useState(false)

  const memberName = (userId: string) => members.find((m) => m.userId === userId)?.userFullName
  const memberAvatar = (userId: string) => members.find((m) => m.userId === userId)?.userAvatarUrl || null

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
    }
  })

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
    const fallbackManager = members[0]?.userId || ''
    setCreateProjForm({ name: '', projectCode: '', projectManagerId: fallbackManager, clientId: '', status: 'planning', budget: '', startDate: '', endDate: '', description: '' })
    setCreateProjError('')
    setShowCreateProject(true)
  }

  const submitCreateProject = async () => {
    if (!createProjForm.name || !createProjForm.projectCode || !createProjForm.projectManagerId) {
      setCreateProjError('Name, Project Code, dan Project Manager wajib diisi')
      return
    }
    setCreatingProject(true); setCreateProjError('')
    try {
      const res: any = await projectsApi.create({
        name: createProjForm.name,
        projectCode: createProjForm.projectCode,
        projectManagerId: createProjForm.projectManagerId,
        clientId: createProjForm.clientId || undefined,
        status: createProjForm.status,
        budget: Number(createProjForm.budget || 0),
        startDate: createProjForm.startDate || undefined,
        endDate: createProjForm.endDate || undefined,
        description: createProjForm.description || undefined,
      })
      if (res?.error) { setCreateProjError(String(res.error)); return }
      setShowCreateProject(false)
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
    setCreateTaskForm({ title: '', columnId: boardColumns[0].id, priority: 'medium', dueDate: '', assignedTo: '', description: '' })
    setCreateTaskError('')
    setShowCreateTask(true)
  }

  const submitCreateTask = async () => {
    if (!createTaskForm.title || !createTaskForm.columnId) {
      setCreateTaskError('Title dan kolom wajib diisi')
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

  /* ---------- render ---------- */

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F6F5F2]" style={{ fontFamily: SF }}>
        <Loader2 className="animate-spin text-zinc-600" size={28} />
        <span className="ml-3 text-sm text-zinc-500">Memuat project…</span>
      </div>
    )
  }

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


          {activeTab === 'Project' && canWrite && (
            <div className="flex items-center gap-2">
              <button onClick={openCreateProject} className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-sm hover:bg-zinc-800 transition">
                <Plus size={13} /> New Project
              </button>
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


          <div className="flex items-center gap-1.5 border-l border-zinc-300 pl-4">
            <IconButton icon={<BarChart3 className="w-4 h-4" />} />
            <IconButton icon={<Cloud className="w-4 h-4" />} />
            <IconButton icon={<Settings className="w-4 h-4" />} />
          </div>
        </div>
      </header>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl text-xs">
          {error}
        </div>
      )}

      {/* TAB CONTENT: PROJECT VIEW */}
      {activeTab === 'Project' && (
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((proj) => (
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
                      onDetachTag={(tagId) => detachTag(row.id, tagId)}
                      onCreateTag={(name) => createAndAttachTag(row.id, name)}
                      resolveName={memberName}
                      resolveAvatar={memberAvatar}
                    />
                  ))}
                  {/* Hatched widget — di f17bc08 dekoratif; di sini trigger New Task */}
                  {colIdx === 3 && canWrite && (
                    <div
                      onClick={openCreateTask}
                      title="Tambah task"
                      className="h-36 rounded-3xl p-4 flex items-center justify-center border border-zinc-200/60 shadow-xs relative overflow-hidden cursor-pointer hover:border-zinc-400 transition"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(135deg, rgba(0,0,0,0.04), rgba(0,0,0,0.04) 10px, transparent 10px, transparent 20px)'
                      }}
                    >
                      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3 py-2 rounded-full shadow-md border border-zinc-100">
                        <button className="p-2 rounded-full hover:bg-zinc-100 transition"><RotateCw className="w-3.5 h-3.5 text-zinc-600" /></button>
                        <button className="p-2 rounded-full hover:bg-zinc-100 transition"><Cloud className="w-3.5 h-3.5 text-zinc-600" /></button>
                        <button className="p-2 rounded-full hover:bg-zinc-100 transition"><Users className="w-3.5 h-3.5 text-zinc-600" /></button>
                        <button className="p-2 rounded-full hover:bg-zinc-100 transition"><Calendar className="w-3.5 h-3.5 text-zinc-600" /></button>
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
        <Modal title="New Project" onClose={() => setShowCreateProject(false)} width={480}>
          {createProjError && <div className="rounded-xl bg-red-50 px-3 py-2 text-[12px] text-red-600 mb-3">{createProjError}</div>}
          <Field label="Name">
            <input className={inputCls} value={createProjForm.name} onChange={(e) => setCreateProjForm({ ...createProjForm, name: e.target.value })} placeholder="Nama project" />
          </Field>
          <Field label="Project Code">
            <input className={inputCls} value={createProjForm.projectCode} onChange={(e) => setCreateProjForm({ ...createProjForm, projectCode: e.target.value.toUpperCase() })} placeholder="ISO-001" />
          </Field>
          <Field label="Project Manager">
            <select className={selectCls} value={createProjForm.projectManagerId} onChange={(e) => setCreateProjForm({ ...createProjForm, projectManagerId: e.target.value })}>
              <option value="">— pilih member —</option>
              {members.map((m) => <option key={m.userId} value={m.userId}>{m.userFullName}</option>)}
            </select>
          </Field>
          <Field label="Client (opsional)">
            <select className={selectCls} value={createProjForm.clientId} onChange={(e) => setCreateProjForm({ ...createProjForm, clientId: e.target.value })}>
              <option value="">— tanpa client —</option>
              {clients.map((cl) => <option key={cl.id} value={cl.id}>{cl.name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <select className={selectCls} value={createProjForm.status} onChange={(e) => setCreateProjForm({ ...createProjForm, status: e.target.value })}>
                {Object.entries(STATUS_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
              </select>
            </Field>
            <Field label="Budget (Rp)">
              <input className={inputCls} type="number" min="0" value={createProjForm.budget} onChange={(e) => setCreateProjForm({ ...createProjForm, budget: e.target.value })} placeholder="0" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date">
              <input className={inputCls} type="date" value={createProjForm.startDate} onChange={(e) => setCreateProjForm({ ...createProjForm, startDate: e.target.value })} />
            </Field>
            <Field label="End Date">
              <input className={inputCls} type="date" value={createProjForm.endDate} onChange={(e) => setCreateProjForm({ ...createProjForm, endDate: e.target.value })} />
            </Field>
          </div>
          <Field label="Description">
            <textarea className={inputCls} rows={2} value={createProjForm.description} onChange={(e) => setCreateProjForm({ ...createProjForm, description: e.target.value })} placeholder="Deskripsi singkat" />
          </Field>
          <div className="flex justify-end gap-2 mt-5">
            <GhostBtn onClick={() => setShowCreateProject(false)}>Batal</GhostBtn>
            <SolidBtn onClick={submitCreateProject} disabled={creatingProject}>
              {creatingProject ? 'Creating…' : 'Create'}
            </SolidBtn>
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
    </div>
  );
}


function IconButton({ icon, active = false }: { icon: React.ReactNode; active?: boolean }) {
  return (
    <button className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
      active ? 'bg-black text-white' : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
    }`}>
      {icon}
    </button>
  );
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
            <span className="text-[10px] font-medium text-zinc-500">{item.date}</span>
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
