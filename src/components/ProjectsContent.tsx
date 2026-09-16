import { useState, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { projectsApi, tasksApi } from '../lib/endpoints'

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"

interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignee: string
  dueDate: string
  columnId: string
}

interface Column {
  id: string
  title: string
  color: string
  position: number
  tasks: Task[]
}

interface Project {
  id: string
  name: string
  projectCode: string
  clientName?: string
  clientId?: string
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  budget: number
  startDate?: string
  endDate?: string
  description?: string
}

const PROJECT_STATUS: Record<string, { bg: string; text: string; label: string }> = {
  planning: { bg: 'rgba(142,142,147,0.12)', text: '#8e8e93', label: 'Planning' },
  active: { bg: 'rgba(0,122,255,0.12)', text: '#007aff', label: 'Active' },
  on_hold: { bg: 'rgba(255,149,0,0.12)', text: '#ff9500', label: 'On Hold' },
  completed: { bg: 'rgba(52,199,89,0.12)', text: '#34c759', label: 'Completed' },
  cancelled: { bg: 'rgba(255,59,48,0.12)', text: '#ff3b30', label: 'Cancelled' },
}

const COLUMN_COLORS = ['#6b7280', '#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#06b6d4']

const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  low: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
  medium: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
  high: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  urgent: { bg: '#fecaca', text: '#7f1d1d', border: '#fca5a5' },
}

function TaskCard({ task }: { task: Task }) {
  const [hovered, setHovered] = useState(false)
  const pColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ padding: 12, borderRadius: 10, background: 'white', border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.15s', boxShadow: hovered ? '0 4px 12px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)', transform: hovered ? 'translateY(-1px)' : 'translateY(0)' }}>
      <div style={{ fontWeight: 600, fontSize: 13, color: '#1f2937', marginBottom: 4 }}>{task.title}</div>
      {task.description && <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.description}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ padding: '2px 8px', borderRadius: 12, background: pColor.bg, color: pColor.text, border: `1px solid ${pColor.border}`, fontSize: 10, fontWeight: 600, textTransform: 'capitalize' }}>{task.priority}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {task.dueDate && <span style={{ fontSize: 10, color: '#9ca3af' }}>{task.dueDate}</span>}
          {task.assignee && <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white' }}>{task.assignee.charAt(0)}</div>}
        </div>
      </div>
    </div>
  )
}

export function ProjectsContent({ onClose, onMinimize, onMaximize }: { onClose: () => void; onMinimize: () => void; onMaximize?: () => void }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [columns, setColumns] = useState<Column[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [projectValues, setProjectValues] = useState<Record<string, string>>({})
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskValues, setTaskValues] = useState<Record<string, string>>({})
  const [draggedTask, setDraggedTask] = useState<{ taskId: string; fromColumn: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const btnSize = 12
  const btnGap = 8

  const loadProjects = useCallback(async () => {
    try {
      const res = await projectsApi.list()
      const pr = res?.projects || res || []
      setProjects(Array.isArray(pr) ? pr : [])
      if (!selectedProjectId && pr.length > 0) setSelectedProjectId(pr[0].id)
    } catch {
      setError('Gagal memuat data')
    }
  }, [selectedProjectId])

  const loadTasks = useCallback(async () => {
    if (!selectedProjectId) return
    try {
      const [taskRes, projRes] = await Promise.allSettled([tasksApi.list({ projectId: selectedProjectId }), projectsApi.get(selectedProjectId)])
      if (taskRes.status === 'fulfilled') {
        const t = taskRes.value?.tasks || taskRes.value || []
        setTasks(Array.isArray(t) ? t : [])
      }
      if (projRes.status === 'fulfilled') {
        const p = projRes.value?.project || projRes.value
        if (p?.columns) {
          setColumns(p.columns.map((c: any, i: number) => ({ id: c.id, title: c.name, color: c.colorCode || COLUMN_COLORS[i % COLUMN_COLORS.length], position: c.position || i, tasks: [] })))
        } else if (projRes.status === 'fulfilled' && !p?.columns) {
          setColumns([
            { id: 'backlog', title: 'Backlog', color: '#6b7280', position: 0, tasks: [] },
            { id: 'todo', title: 'To Do', color: '#3b82f6', position: 1, tasks: [] },
            { id: 'in-progress', title: 'In Progress', color: '#f59e0b', position: 2, tasks: [] },
            { id: 'review', title: 'Review', color: '#8b5cf6', position: 3, tasks: [] },
            { id: 'done', title: 'Done', color: '#10b981', position: 4, tasks: [] },
          ])
        }
      }
    } catch {
      setError('Gagal memuat data')
    }
  }, [selectedProjectId])

  useEffect(() => { loadProjects() }, [loadProjects])
  useEffect(() => { loadTasks() }, [loadTasks])

  useEffect(() => {
    setColumns(prev => prev.map(col => ({
      ...col,
      tasks: tasks.filter(t => t.columnId === col.id),
    })))
  }, [tasks])

  const filteredProjects = projects.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.projectCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.clientName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0]
  const activeStatus = PROJECT_STATUS[activeProject?.status || 'planning']

  const handleDragStart = (taskId: string, columnId: string) => {
    setDraggedTask({ taskId, fromColumn: columnId })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (toColumnId: string) => {
    if (!draggedTask) return
    const task = tasks.find(t => t.id === draggedTask.taskId)
    if (task) {
      try { await tasksApi.move(task.id, { columnId: toColumnId, position: 0 }) } catch {}
    }
    setColumns(prev => prev.map(col => {
      if (col.id === draggedTask.fromColumn) {
        return { ...col, tasks: col.tasks.filter(t => t.id !== draggedTask.taskId) }
      }
      if (col.id === toColumnId) {
        const movedTask = tasks.find(t => t.id === draggedTask.taskId)
        if (movedTask) return { ...col, tasks: [...col.tasks, { ...movedTask, columnId: toColumnId }] }
      }
      return col
    }))
    setDraggedTask(null)
  }

  const handleCreateProject = async () => {
    if (!projectValues.name) return
    try {
      await projectsApi.create({ ...projectValues, budget: Number(projectValues.budget || '0') })
      setShowProjectForm(false); setProjectValues({})
      loadProjects()
    } catch {}
  }

  const handleCreateTask = async () => {
    if (!taskValues.title || !selectedProjectId) return
    try {
      await tasksApi.create({ ...taskValues, projectId: selectedProjectId, priority: taskValues.priority || 'medium' })
      setShowTaskForm(false); setTaskValues({})
      loadTasks()
    } catch {}
  }

  return (
    <div style={{ display: 'flex', height: '100%', padding: 10, gap: 10, fontFamily: SF }}>
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
        <div style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: SF }}>PROJECTS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredProjects.map((p) => {
            const active = selectedProjectId === p.id
            const st = PROJECT_STATUS[p.status || 'planning']
            return (
              <button key={p.id} onClick={() => setSelectedProjectId(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 8px', borderRadius: 7, border: 'none', background: active ? '#007aff' : 'transparent', color: active ? 'white' : '#1d1d1f', cursor: 'pointer', transition: 'background 0.12s', textAlign: 'left', width: '100%', fontFamily: SF }} onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }} onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                <div style={{ width: 22, height: 22, borderRadius: 5, background: active ? 'rgba(255,255,255,0.25)' : 'linear-gradient(135deg, #ff9500 0%, #c06a00 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: active ? 'none' : '0 1px 2px rgba(0,0,0,0.12)', fontSize: 11, fontWeight: 700, color: 'white' }}>
                  {(p.projectCode || p.name || 'P').charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: active ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: active ? 'rgba(255,255,255,0.8)' : '#8e8e93', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.projectCode}</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: active ? 'white' : st.text, flexShrink: 0, opacity: active ? 0.9 : 1 }} />
              </button>
            )
          })}
        </div>
        <div style={{ marginTop: 'auto', padding: '4px 6px' }}>
          <button onClick={() => setShowProjectForm(true)} style={{ width: '100%', padding: '8px', borderRadius: 7, border: '1px dashed rgba(0,0,0,0.15)', background: 'transparent', color: '#007aff', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>+ New Project</button>
        </div>
      </div>

      {/* Main panel */}
      <div style={{ flex: 1, minWidth: 0, background: '#ffffff', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 12, padding: '12px 18px 0', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 2 }}>
            <button style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
            <button style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
          </div>
          <div style={{ flex: 1 }} />
          <button onClick={() => setShowTaskForm(true)} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: '#007aff', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>+ New Task</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 24px 20px', textAlign: 'center' }}>
          <div style={{ width: 58, height: 58, borderRadius: 14, background: 'linear-gradient(135deg, #ff9500 0%, #c06a00 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.12), inset 0 0 0 0.5px rgba(255,255,255,0.3)', fontSize: 24, fontWeight: 700, fontFamily: SF }}>
            {(activeProject?.projectCode || activeProject?.name || 'P').charAt(0)}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.02em', marginBottom: 4 }}>
            {activeProject?.name || 'Pilih Project'}
          </div>
          {activeProject && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: activeStatus.bg, color: activeStatus.text, fontFamily: SF }}>{activeStatus.label}</span>
              <span style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF }}>{activeProject.clientName || '-'} {activeProject.endDate ? `· due ${activeProject.endDate}` : ''}</span>
            </div>
          )}
        </div>

        {/* Kanban Board */}
        {error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 }}>
            <div style={{ fontSize: 13, color: '#ff3b30', fontFamily: SF }}>Gagal memuat data</div>
            <button onClick={() => { setError(null); loadProjects(); loadTasks() }} style={{ fontSize: 12, color: '#007aff', background: 'none', border: 'none', cursor: 'pointer', fontFamily: SF }}>Coba lagi</button>
          </div>
        ) : columns.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 }}>
            <div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF }}>Belum ada data</div>
          </div>
        ) : (
        <div style={{ display: 'flex', gap: 12, flex: 1, overflowX: 'auto', padding: '0 20px 16px' }}>
          {columns.map((col) => (
            <div key={col.id} onDragOver={handleDragOver} onDrop={() => handleDrop(col.id)} style={{ minWidth: 220, width: 220, background: '#f5f5f7', borderRadius: 12, padding: 10, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '0 4px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>{col.title}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 500, color: '#86868b', background: '#e5e5ea', padding: '1px 6px', borderRadius: 10 }}>{col.tasks.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflow: 'auto' }}>
                {col.tasks.map((task) => (
                  <div key={task.id} draggable onDragStart={() => handleDragStart(task.id, col.id)} style={{ cursor: 'grab' }}>
                    <TaskCard task={task} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Project Form Modal */}
      {showProjectForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowProjectForm(false)}>
          <div style={{ background: 'white', borderRadius: 12, padding: 20, width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, fontFamily: SF, color: '#1d1d1f' }}>New Project</div>
              <button onClick={() => setShowProjectForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={16} color="#8e8e93" /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Project Code<span style={{ color: '#ff3b30' }}> *</span></label><input type="text" value={projectValues.projectCode || ''} onChange={(e) => setProjectValues({ ...projectValues, projectCode: e.target.value })} placeholder="PRJ-001" style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box' }} /></div>
              <div><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Nama Project<span style={{ color: '#ff3b30' }}> *</span></label><input type="text" value={projectValues.name || ''} onChange={(e) => setProjectValues({ ...projectValues, name: e.target.value })} placeholder="Kanopi Alderon" style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box' }} /></div>
              <div><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Status</label><select value={projectValues.status || 'planning'} onChange={(e) => setProjectValues({ ...projectValues, status: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box', background: 'white' }}><option value="planning">Planning</option><option value="active">Active</option><option value="on_hold">On Hold</option><option value="completed">Completed</option></select></div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Start Date</label><input type="date" value={projectValues.startDate || ''} onChange={(e) => setProjectValues({ ...projectValues, startDate: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box' }} /></div>
                <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>End Date</label><input type="date" value={projectValues.endDate || ''} onChange={(e) => setProjectValues({ ...projectValues, endDate: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box' }} /></div>
              </div>
              <div><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Budget</label><input type="number" min="0" value={projectValues.budget || ''} onChange={(e) => setProjectValues({ ...projectValues, budget: e.target.value })} placeholder="50000000" style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box' }} /></div>
              <div><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Deskripsi</label><textarea rows={2} value={projectValues.description || ''} onChange={(e) => setProjectValues({ ...projectValues, description: e.target.value })} placeholder="Deskripsi project..." style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} /></div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowProjectForm(false); setProjectValues({}) }} style={{ padding: '7px 16px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', background: '#f5f5f5', color: '#1d1d1f', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Batal</button>
              <button onClick={handleCreateProject} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: '#007aff', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowTaskForm(false)}>
          <div style={{ background: 'white', borderRadius: 12, padding: 20, width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, fontFamily: SF, color: '#1d1d1f' }}>New Task</div>
              <button onClick={() => setShowTaskForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={16} color="#8e8e93" /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Judul<span style={{ color: '#ff3b30' }}> *</span></label><input type="text" value={taskValues.title || ''} onChange={(e) => setTaskValues({ ...taskValues, title: e.target.value })} placeholder="Survey lokasi" style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box' }} /></div>
              <div><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Deskripsi</label><textarea rows={2} value={taskValues.description || ''} onChange={(e) => setTaskValues({ ...taskValues, description: e.target.value })} placeholder="Deskripsi task..." style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} /></div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Priority</label><select value={taskValues.priority || 'medium'} onChange={(e) => setTaskValues({ ...taskValues, priority: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box', background: 'white' }}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
                <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Due Date</label><input type="date" value={taskValues.dueDate || ''} onChange={(e) => setTaskValues({ ...taskValues, dueDate: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box' }} /></div>
              </div>
              <div><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Column</label><select value={taskValues.columnId || columns[0]?.id || ''} onChange={(e) => setTaskValues({ ...taskValues, columnId: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box', background: 'white' }}>{columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowTaskForm(false); setTaskValues({}) }} style={{ padding: '7px 16px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', background: '#f5f5f5', color: '#1d1d1f', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Batal</button>
              <button onClick={handleCreateTask} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: '#007aff', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
