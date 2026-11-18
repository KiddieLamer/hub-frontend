import { useEffect, useState } from 'react'
import { Share2, Edit2, Check, X } from 'lucide-react'
import type { SocialHandles } from './types'

// lucide-react v1.x tidak lagi menyediakan brand icon — pakai SVG inline
// supaya tampilan tetap sama dengan mockup.
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
)

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.25 2.36 4.25 5.43v6.31zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
)

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.95 4.57a10 10 0 0 1-2.83.78 4.94 4.94 0 0 0 2.17-2.72c-.95.56-2 .97-3.13 1.2a4.92 4.92 0 0 0-8.39 4.49A13.94 13.94 0 0 1 1.64 3.16a4.92 4.92 0 0 0 1.52 6.57 4.9 4.9 0 0 1-2.23-.61v.06a4.93 4.93 0 0 0 3.95 4.83 4.96 4.96 0 0 1-2.22.09 4.93 4.93 0 0 0 4.6 3.42A9.88 9.88 0 0 1 0 19.54a13.94 13.94 0 0 0 21.57-12.2c0-.21 0-.42-.02-.63A9.94 9.94 0 0 0 24 4.59z" />
  </svg>
)

interface SocialMediaCardProps {
  customerName: string
  socials?: SocialHandles
  /** Simpan inline (pola ContactCard) — parent yang memanggil PATCH client. */
  onSave?: (patch: { socialMedia: SocialHandles }) => void
  className?: string
}

const HANDLE_FIELDS: Array<{ key: keyof SocialHandles; label: string; icon: React.ReactNode; placeholder: string }> = [
  { key: 'instagram', label: 'Instagram', icon: <InstagramIcon className="h-4 w-4 text-pink-600" />, placeholder: '@username' },
  { key: 'linkedin', label: 'LinkedIn', icon: <LinkedinIcon className="h-4 w-4 text-blue-600" />, placeholder: 'linkedin.com/in/...' },
  { key: 'twitter', label: 'Twitter / X', icon: <TwitterIcon className="h-4 w-4 text-sky-500" />, placeholder: '@username' },
]

export function SocialMediaCard({ customerName, socials, onSave, className = '' }: SocialMediaCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<SocialHandles>({
    instagram: socials?.instagram || '',
    linkedin: socials?.linkedin || '',
    twitter: socials?.twitter || '',
  })

  // Sinkronkan form + reset mode edit saat ganti customer / data baru dari server.
  useEffect(() => {
    setForm({
      instagram: socials?.instagram || '',
      linkedin: socials?.linkedin || '',
      twitter: socials?.twitter || '',
    })
    setIsEditing(false)
  }, [socials])

  const handleSave = () => {
    onSave?.({
      socialMedia: {
        instagram: form.instagram?.trim() || undefined,
        linkedin: form.linkedin?.trim() || undefined,
        twitter: form.twitter?.trim() || undefined,
      },
    })
    setIsEditing(false)
  }

  return (
    <div className={`space-y-3 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs backdrop-blur-md transition-all ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Social Media</h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 shadow-2xs transition-colors hover:bg-slate-200/80"
          >
            <Edit2 className="h-3.5 w-3.5 text-slate-500" /> Edit
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEditing(false)}
              className="rounded-full border border-slate-200 p-1.5 text-slate-500 transition-colors hover:bg-slate-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-xs"
            >
              <Check className="h-3.5 w-3.5" /> Save
            </button>
          </div>
        )}
      </div>

      {!isEditing ? (
        socials && (socials.instagram || socials.linkedin || socials.twitter) ? (
          <div className="space-y-2 text-xs">
            {HANDLE_FIELDS.map(
              (field) =>
                socials?.[field.key] && (
                  <div key={field.key} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-2xs">
                    <div className="flex items-center gap-2">
                      {field.icon}
                      <span className="font-medium text-slate-700">{field.label}</span>
                    </div>
                    <span className="font-semibold text-slate-900">{socials?.[field.key]}</span>
                  </div>
                )
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-1.5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-4 text-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <Share2 className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-slate-700">Belum Terhubung</span>
            <p className="max-w-[180px] text-[11px] font-medium text-slate-400">
              Belum ada akun sosial media yang ditautkan untuk {customerName}. Klik Edit untuk menautkan.
            </p>
          </div>
        )
      ) : (
        <div className="space-y-3 text-xs">
          {HANDLE_FIELDS.map((field) => (
            <div key={field.key}>
              <span className="flex items-center gap-1.5 font-medium text-slate-400">
                {field.icon} {field.label}
              </span>
              <input
                type="text"
                value={form[field.key] || ''}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
