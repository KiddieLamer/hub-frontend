import { BadgeCheck, Edit3, ArrowUpRight, Map, Cloud } from 'lucide-react'
import { siTiktok, siInstagram, siFacebook, siYoutube, siX, siThreads } from 'simple-icons'
import type { SimpleIcon } from 'simple-icons'

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"

export type SocialField = 'tiktokUrl' | 'instagramUrl' | 'facebookUrl' | 'youtubeUrl' | 'xUrl' | 'threadsUrl'

interface Props {
  company?: any
  logoUrl?: string | null
  onEditLogo?: () => void
  onEditField?: (field: 'name' | 'email' | 'phoneNumber' | 'address' | 'approvalThreshold' | SocialField) => void
  onEditGmap?: () => void
  onEditGdrive?: () => void
}

const socials: { key: SocialField; label: string; icon: SimpleIcon; hex: string }[] = [
  { key: 'tiktokUrl', label: 'TikTok', icon: siTiktok, hex: `#${siTiktok.hex}` },
  { key: 'instagramUrl', label: 'Instagram', icon: siInstagram, hex: `#${siInstagram.hex}` },
  { key: 'facebookUrl', label: 'Facebook', icon: siFacebook, hex: `#${siFacebook.hex}` },
  { key: 'youtubeUrl', label: 'YouTube', icon: siYoutube, hex: `#${siYoutube.hex}` },
  { key: 'xUrl', label: 'X', icon: siX, hex: `#${siX.hex}` },
  { key: 'threadsUrl', label: 'Threads', icon: siThreads, hex: `#${siThreads.hex}` },
]

export default function CompanyOverviewCard({
  company,
  logoUrl,
  onEditLogo,
  onEditField,
  onEditGmap,
  onEditGdrive,
}: Props) {
  const approval =
    company?.approvalThreshold != null
      ? `Rp ${Number(company.approvalThreshold).toLocaleString('id-ID')}`
      : 'Rp 10.000.000'

  const tenantId = company?.id ? String(company.id).slice(0, 14).replace(/-+$/, '') : '-'

  const fields = [
    { key: 'email' as const, label: 'Email', value: company?.email },
    { key: 'phoneNumber' as const, label: 'Telepon', value: company?.phoneNumber },
    { key: 'address' as const, label: 'Lokasi', value: company?.address },
    { key: 'approvalThreshold' as const, label: 'Approval limit', value: approval },
  ]

  const integrations = [
    { label: 'Google Maps', icon: Map, set: !!company?.gmapLink, onClick: onEditGmap, title: 'Edit link Google Maps' },
    { label: 'Google Drive', icon: Cloud, set: !!company?.gdriveLink, onClick: onEditGdrive, title: 'Edit link Google Drive' },
  ]

  return (
    <div
      className="col-span-12 @6xl:col-span-8 @container bg-white rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[220px]"
      style={{ fontFamily: SF }}
    >
      {/* Identitas */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div
            onClick={onEditLogo}
            title="Ganti logo perusahaan"
            className="group/logo relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 cursor-pointer"
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              />
            ) : (
              <span className="w-full h-full flex items-center justify-center text-lg font-semibold text-slate-400">
                {company?.name?.charAt(0) || 'P'}
              </span>
            )}
            <span className="absolute inset-0 bg-slate-900/45 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center">
              <Edit3 size={14} className="text-white" />
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-slate-900 truncate">
                {company?.name || 'Perusahaan'}
              </h3>
              {company?.status === 'active' ? (
                <BadgeCheck size={16} className="text-slate-900 shrink-0" aria-label="Terverifikasi" />
              ) : company?.status ? (
                <span className="text-[11px] text-slate-400 shrink-0">{company.status}</span>
              ) : null}
            </div>
            <div className="mt-1.5 flex items-center gap-2.5 flex-wrap">
              <span className="text-[11px] leading-none font-medium px-2 py-[3px] rounded-md border border-slate-200 text-slate-500">
                {(company?.plan || 'free').toLowerCase()} plan
              </span>
              <span className="text-[11px] text-slate-400 font-mono tracking-tight">ID {tenantId}</span>
            </div>
          </div>
        </div>

        <button
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
          title="Detail perusahaan"
        >
          <ArrowUpRight size={15} />
        </button>
      </div>

      {/* Data perusahaan — klik sel untuk edit */}
      <div className="grid grid-cols-2 @3xl:grid-cols-4 gap-x-6 gap-y-3 mt-6">
        {fields.map((f) => {
          const value = f.value?.trim() ? f.value : null
          return (
            <button
              key={f.key}
              onClick={() => onEditField?.(f.key)}
              title={`Edit ${f.label.toLowerCase()}`}
              className="group/field text-left rounded-lg px-2.5 -mx-2.5 py-1.5 hover:bg-slate-50 transition-colors cursor-pointer min-w-0"
            >
              <span className="block text-[11px] font-medium text-slate-400">{f.label}</span>
              <span className="mt-0.5 flex items-center gap-1.5 min-w-0">
                <span className={`text-[13px] font-medium truncate ${value ? 'text-slate-800' : 'text-slate-300'}`}>
                  {value || '—'}
                </span>
                <Edit3 size={11} className="shrink-0 text-slate-400 opacity-0 group-hover/field:opacity-100 transition-opacity" />
              </span>
            </button>
          )
        })}
      </div>

      {/* Integrasi & sosial media */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-x-7 gap-y-2">
          <span className="text-[11px] font-medium text-slate-400 w-14 shrink-0">Integrasi</span>
          {integrations.map((it) => (
            <button
              key={it.label}
              onClick={it.onClick}
              title={it.title}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <it.icon size={13} className="text-slate-400" />
              {it.label}
              <span className={`font-normal ${it.set ? 'text-slate-400' : 'text-slate-300'}`}>
                · {it.set ? 'tersedia' : 'belum diatur'}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-7 gap-y-2">
          <span className="text-[11px] font-medium text-slate-400 w-14 shrink-0">Sosial</span>
          <div className="flex items-center gap-1.5">
            {socials.map((s) => {
              const url = company?.[s.key]?.trim() ? company[s.key] : null
              return (
                <button
                  key={s.key}
                  onClick={() => onEditField?.(s.key)}
                  title={url ? `${s.label}: ${url}` : `Atur akun ${s.label}`}
                  aria-label={url ? `${s.label}: ${url}` : `Atur akun ${s.label}`}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    url ? 'hover:bg-slate-50' : 'border border-dashed border-slate-200 hover:border-slate-400'
                  }`}
                  style={url ? { color: s.hex } : undefined}
                >
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
                    <path d={s.icon.path} />
                  </svg>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
