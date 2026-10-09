import { useState, type FormEvent } from 'react'
import {
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Plus,
  Trash2,
  X,
  Clock,
  Check
} from 'lucide-react'
import type { TaskItem } from './types'

interface UpNextCardProps {
  tasks?: TaskItem[]
  customerName: string
  onUpdateTasks: (updatedTasks: TaskItem[]) => void
  className?: string
}

export function UpNextCard({
  tasks = [],
  onUpdateTasks,
  className = '',
}: UpNextCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)

  // Form State untuk Task Baru
  const [newTask, setNewTask] = useState({
    title: '',
    type: 'call' as TaskItem['type'],
    dueDate: 'Due tomorrow at 5:00 PM',
    description: '',
  })

  // Default initial tasks jika belum ada data
  const taskList: TaskItem[] = tasks.length > 0 ? tasks : [
    {
      id: '1',
      title: 'First Customer Call',
      step: 'Step 1',
      dueDate: 'Due 8/4/23 7:30 pm',
      description: 'Call to introduce yourself and qualify customer requirements.',
      isCompleted: false,
      type: 'call',
    },
    {
      id: '2',
      title: 'Send Product Lease Proposal',
      step: 'Step 2',
      dueDate: 'Due 8/6/23 10:00 am',
      description: 'Email detailed quote for espresso machine lease.',
      isCompleted: false,
      type: 'email',
    },
  ]

  // Toggle Selesai / Belum
  const handleToggleComplete = (taskId: string) => {
    const updated = taskList.map((t) =>
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    )
    onUpdateTasks(updated)
  }

  // Hapus Task
  const handleDeleteTask = (taskId: string) => {
    const updated = taskList.filter((t) => t.id !== taskId)
    onUpdateTasks(updated)
  }

  // Tambah Task Baru
  const handleAddTask = (e: FormEvent) => {
    e.preventDefault()
    if (!newTask.title.trim()) return

    const created: TaskItem = {
      id: Date.now().toString(),
      title: newTask.title,
      step: `Step ${taskList.length + 1}`,
      dueDate: newTask.dueDate || 'Due soon',
      description: newTask.description || 'No description provided.',
      isCompleted: false,
      type: newTask.type,
    }

    onUpdateTasks([created, ...taskList])
    setNewTask({
      title: '',
      type: 'call',
      dueDate: 'Due tomorrow at 5:00 PM',
      description: '',
    })
    setIsAdding(false)
  }

  const activeTasks = taskList.filter((t) => !t.isCompleted)
  const completedTasks = taskList.filter((t) => t.isCompleted)

  const getTaskIcon = (type: TaskItem['type']) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4" />
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'meeting':
        return <Calendar className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className={`space-y-4 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs backdrop-blur-md ${className}`}>
      {/* Header Card */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Up Next</h3>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-slate-800"
            title="Tambah Aktivitas / Task Baru"
          >
            <Plus className="h-3.5 w-3.5" /> Task
          </button>
        </div>
      </div>

      {/* Sequence Badge Banner */}
      <div className="rounded-2xl border border-slate-200/60 bg-slate-100/90 py-2 text-center">
        <span className="text-xs font-semibold text-slate-800">
          Sequence: New Lead Nurturing
        </span>
      </div>

      {/* FORM TAMBAH TASK BARU */}
      {isAdding && (
        <form onSubmit={handleAddTask} className="animate-fade-in space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50 p-3.5 text-xs shadow-inner">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800">Aktivitas Baru</h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div>
            <label className="mb-1 block font-medium text-slate-500">Judul Aktivitas *</label>
            <input
              type="text"
              required
              placeholder="Misal: Follow up via Whatsapp"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block font-medium text-slate-500">Tipe</label>
              <select
                value={newTask.type}
                onChange={(e) => setNewTask({ ...newTask, type: e.target.value as TaskItem['type'] })}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
              >
                <option value="call">Phone Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
                <option value="task">General Task</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block font-medium text-slate-500">Due Date</label>
              <input
                type="text"
                placeholder="Due 8/10/26 4:00 pm"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-medium text-slate-500">Catatan Singkat</label>
            <input
              type="text"
              placeholder="Detail kebutuhan aktivitas..."
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-600"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-full bg-slate-900 px-4 py-1 font-semibold text-white"
            >
              Simpan Task
            </button>
          </div>
        </form>
      )}

      {/* LIST AKTIVITAS AKTIF */}
      <div className="space-y-3">
        {activeTasks.length > 0 ? (
          activeTasks.map((task, idx) => {
            // Task paling atas = highlight (fokus), sisanya flat/muted
            const isPrimary = idx === 0
            return (
              <div
                key={task.id}
                className={`space-y-3 rounded-3xl border p-4 shadow-xs transition-all hover:scale-[1.01] ${
                  isPrimary
                    ? 'border-white/80 bg-gradient-to-b from-[#EBF8BD] to-[#E2F5A6]'
                    : 'border-slate-200/70 bg-white/90'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white bg-white/90 text-slate-800 shadow-2xs">
                      {getTaskIcon(task.type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                      <p className="text-[11px] font-medium text-slate-600">
                        {task.step} • {task.dueDate}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="rounded-full p-1 text-slate-400 transition-colors hover:bg-white/60 hover:text-red-600"
                    title="Hapus Task"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <p className="pl-1 text-xs font-medium text-slate-700">
                  {task.description}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  {isPrimary && task.type === 'call' && (
                    <button className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-black py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-slate-800">
                      <Phone className="h-3.5 w-3.5 fill-current" /> Call
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleComplete(task.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-slate-200/80 bg-white/90 py-2 text-xs font-semibold text-slate-800 shadow-2xs transition-colors hover:bg-white"
                  >
                    <Check className="h-3.5 w-3.5 text-emerald-600" /> Mark Complete
                  </button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-6 text-center text-xs font-medium text-slate-400">
            Semua task aktif telah selesai! 🎉
          </div>
        )}
      </div>

      {/* TOGGLE & LIST TASK YANG SUDAH COMPLETED */}
      {completedTasks.length > 0 && (
        <div className="border-t border-slate-200/60 pt-2">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex w-full items-center justify-between py-1 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-800"
          >
            <span>Task Selesai ({completedTasks.length})</span>
            <span className="text-[10px] text-slate-400">
              {showCompleted ? 'Sembunyikan' : 'Tampilkan'}
            </span>
          </button>

          {showCompleted && (
            <div className="mt-2 space-y-2">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200/50 bg-slate-100/70 p-2.5 text-xs"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <button
                      onClick={() => handleToggleComplete(task.id)}
                      className="shrink-0 text-emerald-600"
                      title="Tandai belum selesai"
                    >
                      <CheckCircle2 className="h-4 w-4 fill-emerald-100" />
                    </button>
                    <div className="truncate">
                      <p className="truncate font-semibold text-slate-500 line-through">
                        {task.title}
                      </p>
                      <p className="text-[10px] text-slate-400">{task.dueDate}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
