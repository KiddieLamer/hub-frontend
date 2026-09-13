import { useState } from 'react'

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

export function ProjectsContent({ onClose: _onClose, onMinimize: _onMinimize }: { onClose: () => void; onMinimize: () => void }) {
  const [columns, setColumns] = useState(MOCK_COLUMNS)
  const [draggedTask, setDraggedTask] = useState<{ taskId: string; fromColumn: string } | null>(null)

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 10, gap: 10 }}>
      {/* Floating back/forward + header */}
      <div style={{ background: 'white', borderRadius: 12, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 1, padding: '10px 14px 0', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 1 }}>
            <button style={{ width: 22, height: 22, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.35 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button style={{ width: 22, height: 22, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.35 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px 12px' }}>
          <div>
            <h3 style={{ fontFamily: "'Inter', -apple-system, sans-serif", fontWeight: 600, fontSize: 18, margin: 0, color: '#1d1d1f', letterSpacing: '-0.02em' }}>
              Projects
            </h3>
            <p style={{ fontSize: 12, color: '#86868b', margin: '2px 0 0' }}>
              {columns.reduce((sum, col) => sum + col.tasks.length, 0)} tasks
            </p>
          </div>
          <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#007AFF', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter', -apple-system, sans-serif" }}>
            + New Task
          </button>
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
