import { useState, type FormEvent } from 'react'
import { MessageSquare, Phone, Mail, Calendar, Send, FileText } from 'lucide-react'
import type { ActivityNote } from './types'

interface ActivityLogCardProps {
  activities?: ActivityNote[]
  currentUser: { name: string; avatar: string }
  onAddActivity: (newActivity: ActivityNote) => void
  className?: string
}

const TYPE_LABELS: Record<ActivityNote['type'], string> = {
  note: 'Note',
  call: 'Call',
  email: 'Email',
  meeting: 'Meeting',
}

export function ActivityLogCard({
  activities = [],
  currentUser,
  onAddActivity,
  className = '',
}: ActivityLogCardProps) {
  const [content, setContent] = useState('')
  const [activityType, setActivityType] = useState<ActivityNote['type']>('note')

  // Default mock activity jika data belum ada
  const activityList: ActivityNote[] = activities.length > 0 ? activities : [
    {
      id: '1',
      type: 'call',
      author: 'Kenny Smith',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      content: 'Telepon singkat dengan customer. Tertarik dengan mesin tipe Commercial Espresso A1.',
      timestamp: 'Hari ini, 10:30 AM',
    },
    {
      id: '2',
      type: 'note',
      author: 'Kenny Smith',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      content: 'Customer meminta garansi diperpanjang menjadi 2 tahun.',
      timestamp: 'Kemarin, 04:15 PM',
    },
  ]

  // Kirim langsung dengan tipe yang dipilih dari dropdown
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    onAddActivity({
      id: Date.now().toString(),
      type: activityType,
      author: currentUser.name || 'You',
      authorAvatar: currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      content: content.trim(),
      timestamp: 'Baru saja',
    })
    setContent('')
  }

  const getTypeIcon = (type: ActivityNote['type']) => {
    switch (type) {
      case 'call':
        return <Phone className="h-3.5 w-3.5 text-blue-600" />
      case 'email':
        return <Mail className="h-3.5 w-3.5 text-purple-600" />
      case 'meeting':
        return <Calendar className="h-3.5 w-3.5 text-emerald-600" />
      default:
        return <FileText className="h-3.5 w-3.5 text-slate-600" />
    }
  }

  return (
    <div className={`space-y-4 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs backdrop-blur-md ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Activity Log & Notes</h3>
        <MessageSquare className="h-4 w-4 text-slate-700" />
      </div>

      {/* Form Input Catatan Baru */}
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div className="relative">
          <textarea
            rows={2}
            placeholder="Tulis catatan / aktivitas baru..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full resize-none rounded-2xl border border-slate-200/80 bg-slate-50 p-3 pr-10 text-xs font-medium text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
          />
        </div>

        {/* Dropdown tipe + tombol kirim (sebelah-sebelah) */}
        <div className="flex items-center gap-2">
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value as ActivityNote['type'])}
            className="flex-1 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
          >
            {(['note', 'call', 'email', 'meeting'] as const).map((type) => (
              <option key={type} value={type}>{TYPE_LABELS[type]}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!content.trim()}
            className="flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-1.5 text-[11px] font-bold text-white shadow-xs transition-all hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900"
            title="Kirim Catatan"
          >
            <Send className="h-3.5 w-3.5" /> Kirim
          </button>
        </div>
      </form>

      {/* Timeline List Catatan */}
      <div className="max-h-72 space-y-3 overflow-y-auto pr-1 pt-1">
        {activityList.map((item) => (
          <div
            key={item.id}
            className="space-y-2 rounded-2xl border border-slate-200/70 bg-white/90 p-3 text-xs shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={item.authorAvatar}
                  alt={item.author}
                  className="h-5 w-5 rounded-full border border-slate-200 object-cover"
                />
                <span className="text-[11px] font-bold text-slate-800">{item.author}</span>
                <span className="flex items-center justify-center rounded-md bg-slate-100 p-1">
                  {getTypeIcon(item.type)}
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-400">{item.timestamp}</span>
            </div>

            <p className="pl-1 text-[11px] font-medium leading-relaxed text-slate-700">
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
