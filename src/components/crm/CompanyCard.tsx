import { useEffect, useState } from 'react'
import { Edit2, Check, X, Building, Globe } from 'lucide-react'
import type { LeadItem } from './types'
import { ImageUrlField } from './ImageUrlField'

const underlineInputWithIconClass =
  'w-full border-0 border-b border-slate-200 bg-transparent py-2 pl-0 pr-8 text-xs font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:border-[#0096C2] focus:outline-none focus:ring-0'

interface CompanyCardProps {
  lead: LeadItem
  onSave: (updatedData: Partial<LeadItem>) => void
  className?: string
}

export function CompanyCard({ lead, onSave, className = '' }: CompanyCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [logoFailed, setLogoFailed] = useState(false)
  const [formData, setFormData] = useState({
    company: '',
    website: '',
    logoUrl: '',
  })

  useEffect(() => {
    setFormData({
      company: lead.company || '',
      website: lead.website || '',
      logoUrl: lead.logoUrl || '',
    })
    setLogoFailed(false)
    setIsEditing(false)
  }, [lead])

  const handleSave = () => {
    onSave({
      company: formData.company,
      website: formData.website,
      logoUrl: formData.logoUrl,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      company: lead.company || '',
      website: lead.website || '',
      logoUrl: lead.logoUrl || '',
    })
    setIsEditing(false)
  }

  return (
    <div className={`space-y-3 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs backdrop-blur-md transition-all ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-white text-[#0096C2]">
            {lead.logoUrl && !logoFailed ? (
              <img
                src={lead.logoUrl}
                alt={`Logo ${lead.company || 'perusahaan'}`}
                onError={() => setLogoFailed(true)}
                className="h-full w-full object-contain"
              />
            ) : (
              <Building className="h-4 w-4" />
            )}
          </div>
          <h3 className="truncate text-lg font-bold text-slate-900">Company</h3>
        </div>
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
              onClick={handleCancel}
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

      <div className="space-y-3 text-xs">
        <div>
          <span className="block font-medium text-slate-400">Company Name</span>
          {!isEditing ? (
            <p className="mt-0.5 text-sm font-semibold text-slate-900">
              {lead.company || <span className="font-normal italic text-slate-300">Belum ada perusahaan</span>}
            </p>
          ) : (
            <div className="relative mt-1">
              <Building className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Nama perusahaan..."
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className={underlineInputWithIconClass}
              />
            </div>
          )}
        </div>

        <div>
          <span className="block font-medium text-slate-400">Website</span>
          {!isEditing ? (
            lead.website ? (
              <a
                href={`https://${lead.website.replace(/^https?:\/\//, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 block cursor-pointer text-xs font-semibold text-slate-900 underline transition-colors hover:text-[#0d9488]"
              >
                {lead.website}
              </a>
            ) : (
              <p className="mt-0.5 text-xs font-normal italic text-slate-300">Belum ada website</p>
            )
          ) : (
            <div className="relative mt-1">
              <Globe className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="domain.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className={underlineInputWithIconClass}
              />
            </div>
          )}
        </div>

        {isEditing && (
          <div>
            <span className="block font-medium text-slate-400">Logo Perusahaan (URL)</span>
            <div className="mt-1">
              <ImageUrlField
                label="Logo Perusahaan (URL)"
                placeholder="https://contoh.com/logo.png"
                value={formData.logoUrl}
                onChange={(value) => setFormData({ ...formData, logoUrl: value })}
                Icon={Building}
                fit="contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
