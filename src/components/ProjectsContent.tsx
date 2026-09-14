import { useState } from 'react'
import { Search } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  assignee: string
  dueDate: string
}

interface Column {
  id: string
  title: string
  color: string
  tasks: Task[]
}

interface Project {
  id: string
  name: string
  client: string
  scope: 'project' | 'task'
  status: 'planning' | 'active' | 'on_hold' | 'done'
  progress: number
  tasksCount: number
  dueDate: string
}

const MOCK_PROJECTS: Project[] = [
  { id: 'PRJ-001', name: 'Kanopi Alderon PT Maju Jaya', client: 'PT Maju Jaya', scope: 'project', status: 'active', progress: 65, tasksCount: 3, dueDate: '2026-09-20' },
  { id: 'PRJ-002', name: 'Railing Tangga SS Sarah', client: 'Sarah Johnson', scope: 'project', status: 'active', progress: 40, tasksCount: 2, dueDate: '2026-09-25' },
  { id: 'PRJ-003', name: 'Renovasi Atap Gudang CV Berkah', client: 'CV Berkah Jaya', scope: 'project', status: 'planning', progress: 10, tasksCount: 2, dueDate: '2026-10-05' },
  { id: 'PRJ-004', name: 'Maintenance Rutin Q3', client: 'Internal', scope: 'task', status: 'on_hold', progress: 20, tasksCount: 1, dueDate: '2026-09-30' },
]

const PROJECT_STATUS: Record<string, { bg: string; text: string; label: string }> = {
  planning: { bg: 'rgba(142,142,147,0.12)', text: '#8e8e93', label: 'Planning' },
  active: { bg: 'rgba(0,122,255,0.12)', text: '#007aff', label: 'Active' },
  on_hold: { bg: 'rgba(255,149,0,0.12)', text: '#ff9500', label: 'On Hold' },
  done: { bg: 'rgba(52,199,89,0.12)', text: '#34c759', label: 'Done' },
}

const MOCK_COLUMNS: Column[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    color: '#6b7280',
    tasks: [
      { id: '1', title: 'Survey lokasi PT Maju Jaya', description: 'Survei kanopi carport', priority: 'medium', assignee: 'Budi', dueDate: '2026-09-20' },
      { id: '2', title: 'Buat design 3D railing', description: 'Railing tangga SS Sarah', priority: 'low', assignee: 'Andi', dueDate: '2026-09-25' },
    ],
  },
  {
    id: 'todo',
    title: 'To Do',
    color: '#3b82f6',
    tasks: [
      { id: '3', title: 'Order material kanopi', description: 'Beli Alderon RS 24 m²', priority: 'high', assignee: 'Rina', dueDate: '2026-09-18' },
      { id: '4', title: 'Buat RAB CV Berkah', description: 'Renovasi atap gudang', priority: 'medium', assignee: 'Dewi', dueDate: '2026-09-19' },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    color: '#f59e0b',
    tasks: [
      { id: '5', title: 'Pasang kanopi Alderon', description: 'PT Maju Jaya - Bintaro', priority: 'high', assignee: 'Tim Lapangan', dueDate: '2026-09-15' },
    ],
  },
  {
    id: 'review',
    title: 'Review',
    color: '#8b5cf6',
    tasks: [
      { id: '6', title: 'Cek kualitas las railing', description: 'Railing tangga SS', priority: 'medium', assignee: 'Supervisor', dueDate: '2026-09-14' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    color: '#10b981',
    tasks: [
      { id: '7', title: 'Survey lokasi CV Berkah', description: 'Selesai', priority: 'low', assignee: 'Budi', dueDate: '2026-09-10' },
      { id: '8', title: 'Kirim QUO-003', description: 'Railing Sarah Johnson', priority: 'low', assignee: 'Sales', dueDate: '2026-09-08' },
    ],
  },
]

const PRIORITY_COLORS = {
  low: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
  medium: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
  high: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
}

function TaskCard({ task }: { task: Task }) {
  const [hovered, setHovered] = useState(false)
  const pColor = PRIORITY_COLORS[task.priority]

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: 12,
        borderRadius: 10,
        background: 'white',
        border: '1px solid #e5e7eb',
        cursor: 'pointer',
        transition: 'all 0.15s',
        boxShadow: hovered ? '0 4px 12px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 13, color: '#1f2937', marginBottom: 4 }}>
        {task.title}
      </div>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8, lineHeight: 1.4 }}>
        {task.description}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          padding: '2px 8px',
          borderRadius: 12,
          background: pColor.bg,
          color: pColor.text,
          border: `1px solid ${pColor.border}`,
          fontSize: 10,
          fontWeight: 600,
          textTransform: 'capitalize',
        }}>
          {task.priority}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: '#9ca3af' }}>{task.dueDate}</span>
          <div style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 9,
            fontWeight: 700,
            color: 'white',
          }}>
            {task.assignee.charAt(0)}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProjectsContent({ onClose, onMinimize, onMaximize }: { onClose: () => void; onMinimize: () => void; onMaximize?: () => void }) {
  const [columns, setColumns] = useState(MOCK_COLUMNS)
  const [draggedTask, setDraggedTask] = useState<{ taskId: string; fromColumn: string } | null>(null)
  const [selectedProject, setSelectedProject] = useState<string>('PRJ-001')
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)

  const btnSize = 12
  const btnGap = 8

  const filteredProjects = MOCK_PROJECTS.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeProject = MOCK_PROJECTS.find(p => p.id === selectedProject) || MOCK_PROJECTS[0]

  const handleDragStart = (taskId: string, columnId: string) => {
    setDraggedTask({ taskId, fromColumn: columnId })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (toColumnId: string) => {
    if (!draggedTask) return

    setColumns((prev) => {
      const newColumns = prev.map((col) => ({ ...col, tasks: [...col.tasks] }))

      const fromCol = newColumns.find((c) => c.id === draggedTask.fromColumn)
      const toCol = newColumns.find((c) => c.id === toColumnId)

      if (!fromCol || !toCol) return prev

      const taskIndex = fromCol.tasks.findIndex((t) => t.id === draggedTask.taskId)
      if (taskIndex === -1) return prev

      const [task] = fromCol.tasks.splice(taskIndex, 1)
      toCol.tasks.push(task)

      return newColumns
    })

    setDraggedTask(null)
  }

  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"

  const activeStatus = PROJECT_STATUS[activeProject.status]

  return (
    <div style={{ display: 'flex', height: '100%', padding: 10, gap: 10, fontFamily: SF }}>
      {/* Sidebar — project list */}
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

        <div style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: SF }}>PROJECTS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredProjects.map((p) => {
            const active = selectedProject === p.id
            const st = PROJECT_STATUS[p.status]
            return (
              <button key={p.id} onClick={() => setSelectedProject(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 8px', borderRadius: 7, border: 'none', background: active ? '#007aff' : 'transparent', color: active ? 'white' : '#1d1d1f', cursor: 'pointer', transition: 'background 0.12s', textAlign: 'left', width: '100%', fontFamily: SF }} onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }} onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                <div style={{ width: 22, height: 22, borderRadius: 5, background: active ? 'rgba(255,255,255,0.25)' : 'linear-gradient(135deg, #ff9500 0%, #c06a00 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: active ? 'none' : '0 1px 2px rgba(0,0,0,0.12)', fontSize: 11, fontWeight: 700, color: 'white' }}>
                  {p.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: active ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: active ? 'rgba(255,255,255,0.8)' : '#8e8e93', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.client}</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: active ? 'white' : st.text, flexShrink: 0, opacity: active ? 0.9 : 1 }} />
              </button>
            )
          })}
        </div>
      </div>

      {/* Main panel — full project detail */}
      <div style={{ flex: 1, minWidth: 0, background: '#ffffff', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 12, padding: '12px 18px 0', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 2 }}>
            <button style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <div style={{ flex: 1 }} />
          <button style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: '#007aff', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>
            + New Task
          </button>
        </div>

        {/* Section header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 24px 20px', textAlign: 'center' }}>
          <div style={{ width: 58, height: 58, borderRadius: 14, background: 'linear-gradient(135deg, #ff9500 0%, #c06a00 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.12), inset 0 0 0 0.5px rgba(255,255,255,0.3)', fontSize: 24, fontWeight: 700, fontFamily: SF }}>
            {activeProject.name.charAt(0)}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.02em', marginBottom: 4 }}>
            {activeProject.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: activeProject.scope === 'project' ? 'rgba(0,122,255,0.12)' : 'rgba(142,142,147,0.12)', color: activeProject.scope === 'project' ? '#007aff' : '#8e8e93', fontFamily: SF, textTransform: 'capitalize' }}>
              {activeProject.scope}
            </span>
            <span style={{ fontSize: 10, fontWeight: 500, padding: '1px 6px', borderRadius: 4, background: activeStatus.bg, color: activeStatus.text, fontFamily: SF }}>
              {activeStatus.label}
            </span>
            <span style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF }}>
              {activeProject.client} · due {activeProject.dueDate}
            </span>
          </div>
        </div>

        {/* Kanban Board */}
        <div style={{ display: 'flex', gap: 12, flex: 1, overflowX: 'auto', padding: '0 20px 16px' }}>
        {columns.map((col) => (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(col.id)}
            style={{
              minWidth: 220,
              width: 220,
              background: '#f5f5f7',
              borderRadius: 12,
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
            }}
          >
            {/* Column Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '0 4px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>
                {col.title}
              </span>
              <span style={{
                marginLeft: 'auto',
                fontSize: 11,
                fontWeight: 500,
                color: '#86868b',
                background: '#e5e5ea',
                padding: '1px 6px',
                borderRadius: 10,
              }}>
                {col.tasks.length}
              </span>
            </div>

            {/* Tasks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflow: 'auto' }}>
              {col.tasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id, col.id)}
                  style={{ cursor: 'grab' }}
                >
                  <TaskCard task={task} />
                </div>
              ))}
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  )
}
