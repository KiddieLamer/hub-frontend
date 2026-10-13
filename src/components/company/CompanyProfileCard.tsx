import { ShieldCheck, Palette, Edit3 } from 'lucide-react'

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"

export interface CompanyInfo {
  name?: string
  email?: string | null
  status?: string
  plan?: string
}

interface Props {
  company?: CompanyInfo | null
  /** URL logo perusahaan (kalau ada tampil di avatar) */
  logoUrl?: string | null
  onEdit?: () => void
  onEditLogo?: () => void
}

export default function CompanyProfileCard({ company, logoUrl, onEdit, onEditLogo }: Props) {
  return (
    <div className="col-span-3 bg-white rounded-3xl p-5 shadow-xs flex flex-col justify-between h-full" style={{ fontFamily: SF }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Profile Perusahaan</span>
        <button
          onClick={onEdit}
          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all cursor-pointer"
          title="Edit nama perusahaan"
        >
          <Edit3 size={14} />
        </button>
      </div>

      <div className="flex flex-col items-center text-center my-2">
        <div
          onClick={onEditLogo}
          title="Ganti logo perusahaan"
          className={`w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md mb-2 relative ${
            onEditLogo ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
          }`}
        >
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            company?.name?.charAt(0) || 'P'
          )}
        </div>
        <h3 className="font-bold text-slate-900 text-base tracking-tight truncate max-w-full">{company?.name || 'Perusahaan'}</h3>
        <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-full">{company?.email || '-'}</p>
      </div>

      <div className="flex items-center justify-center gap-2 pt-3 border-t border-slate-100">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
          <ShieldCheck size={11} /> {company?.status === 'active' ? 'Aktif' : company?.status || '-'}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
          <Palette size={11} /> Plan: {company?.plan || '-'}
        </span>
      </div>
    </div>
  )
}
