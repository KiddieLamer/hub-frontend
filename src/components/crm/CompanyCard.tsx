import { useEffect, useState } from 'react'
import { Pencil, Check, X, Building, Globe, Tags } from 'lucide-react'
import type { LeadItem } from './types'

const DEFAULT_TAGS = ['Lead', 'Sales Insight']

interface CompanyCardProps {
  lead: LeadItem
  onSave: (updatedData: Partial<LeadItem>) => void
  className?: string
}

export function CompanyCard({ lead, onSave, className = '' }: CompanyCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    company: '',
    website: '',
    tags: '',
  })

  useEffect(() => {
    setFormData({
      company: lead.company || '',
      website: lead.website || '',
      tags: (lead.tags || DEFAULT_TAGS).join(', '),
    })
    setIsEditing(false)
  }, [lead])

  const handleSave = () => {
    onSave({
      company: formData.company,
      website: formData.website,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
    })
    setIsEditing(false)
  }

  return (
    <div className={`space-y-3 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs backdrop-blur-md transition-all ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Company</h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 shadow-2xs transition-colors hover:bg-slate-200/80"
          >
            <Pencil className="h-3.5 w-3.5 text-slate-500" /> Edit
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEditing(false)}
              className="rounded-full border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100"
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
            <p className="mt-0.5 text-sm font-semibold text-slate-900">{lead.company}</p>
          ) : (
            <div className="relative mt-1">
              <Building className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
              />
            </div>
          )}
        </div>

        <div>
          <span className="block font-medium text-slate-400">Website</span>
          {!isEditing ? (
            <a
              href={`https://${lead.website.replace(/^https?:\/\//, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 block cursor-pointer text-xs font-semibold text-slate-900 underline transition-colors hover:text-[#0d9488]"
            >
              {lead.website}
            </a>
          ) : (
            <div className="relative mt-1">
              <Globe className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
              />
            </div>
          )}
        </div>

        <div>
          <span className="block font-medium text-slate-400">Tags</span>
          {!isEditing ? (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {(lead.tags || DEFAULT_TAGS).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200/60 bg-white/80 px-3 py-0.5 text-xs font-semibold text-slate-800 shadow-2xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <div className="relative mt-1">
              <Tags className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Lead, Sales Insight"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
