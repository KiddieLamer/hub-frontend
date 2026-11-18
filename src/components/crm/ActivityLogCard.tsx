import { useState, type FormEvent } from 'react'
import { MessageSquare, Phone, Mail, Calendar, Send, FileText, Loader2, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import type { ActivityNote } from './types'

interface ActivityLogCardProps {
  activities?: ActivityNote[]
  onAddActivity: (activity: { type: ActivityNote['type']; content: string }) => void | Promise<void>
  /** Dipanggil saat user menghapus catatan sendiri (soft delete di BE). */
  onDeleteActivity?: (id: string) => Promise<void>
  /** Id user login — tombol hapus hanya tampil pada catatan miliknya. */
  currentUserId?: string
  className?: string
}

/** Anti-spam: default hanya N catatan terbaru yang tampil. */
const COLLAPSED_COUNT = 3

const TYPE_LABELS: Record<ActivityNote['type'], string> = {
  note: 'Note',
  call: 'Call',
  email: 'Email',
  meeting: 'Meeting',
}

const FALLBACK_AVATAR = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="#0d9488"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="#fff">U</text></svg>'
)

export function ActivityLogCard({
  activities = [],
  onAddActivity,
  onDeleteActivity,
  currentUserId,
  className = '',
}: ActivityLogCardProps) {
  const [content, setContent] = useState('')
  const [activityType, setActivityType] = useState<ActivityNote['type']>('note')
  const [saving, setSaving] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  // Konfirmasi hapus inline dua-tahap — BUKAN window.confirm() (dialog native
  // bisa memblokir halaman tanpa tampil = terlihat seperti freeze).
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!content.trim() || saving) return

    setSaving(true)
    try {
      await onAddActivity({
        type: activityType,
        content: content.trim(),
      })
      setContent('')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!onDeleteActivity || deleting) return
    setDeleting(id)
    try {
      await onDeleteActivity(id)
    } finally {
      setDeleting(null)
      setConfirmingId(null)
    }
  }

  const canDelete = (item: ActivityNote) =>
    Boolean(onDeleteActivity && currentUserId && item.authorId && item.authorId === currentUserId && !item.deleted)

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

  const canCollapse = activities.length > COLLAPSED_COUNT
  const visibleActivities = canCollapse && !showAll ? activities.slice(0, COLLAPSED_COUNT) : activities

  return (
    <div className={`space-y-4 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs backdrop-blur-md ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Activity Log &amp; Notes</h3>
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
            disabled={!content.trim() || saving}
            className="flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-1.5 text-[11px] font-bold text-white shadow-xs transition-all hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900"
            title="Kirim Catatan"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Kirim
          </button>
        </div>
      </form>

      {/* Timeline List Catatan — collapsed default untuk anti-spam */}
      <div className="space-y-3 pr-1 pt-1">
        {visibleActivities.length > 0 ? (
          visibleActivities.map((item) => (
            <div
              key={item.id}
              className={`space-y-2 rounded-2xl border p-3 text-xs shadow-2xs ${item.deleted ? 'border-dashed border-rose-200 bg-rose-50/40' : 'border-slate-200/70 bg-white/90'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={item.authorAvatar || FALLBACK_AVATAR}
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

              {item.deleted ? (
                <>
                  <p className="pl-1 text-[11px] font-medium leading-relaxed text-slate-400 line-through">
                    {item.content}
                  </p>
                  <p className="text-[10px] font-semibold text-rose-500">
                    Dihapus oleh {item.deletedBy || 'admin'} — jejak tetap tersimpan untuk audit
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <p className="pl-1 text-[11px] font-medium leading-relaxed text-slate-700">{item.content}</p>
                    {canDelete(item) && confirmingId !== item.id && (
                      <button
                        onClick={() => setConfirmingId(item.id)}
                        title="Hapus catatan"
                        className="shrink-0 rounded-full p-1 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Strip konfirmasi inline — pengganti dialog native */}
                  {confirmingId === item.id && (
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5">
                      <span className="text-[11px] font-semibold text-rose-600">
                        Hapus catatan ini? Admin tetap bisa melihat jejaknya.
                      </span>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          onClick={() => setConfirmingId(null)}
                          className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deleting === item.id}
                          className="flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
                        >
                          {deleting === item.id && <Loader2 className="h-3 w-3 animate-spin" />} Hapus
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-6 text-center text-xs font-medium text-slate-400">
            Belum ada aktivitas tercatat.
          </div>
        )}

        {/* Accordion: tampilkan semua / ringkas */}
        {canCollapse && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-white/50 py-2 text-[11px] font-semibold text-slate-500 transition-colors hover:bg-white"
          >
            {showAll ? (
              <>Tampilkan lebih sedikit <ChevronUp className="h-3.5 w-3.5" /></>
            ) : (
              <>Tampilkan semua ({activities.length} catatan) <ChevronDown className="h-3.5 w-3.5" /></>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
