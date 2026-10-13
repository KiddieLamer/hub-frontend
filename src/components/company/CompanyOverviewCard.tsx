import { ShieldCheck, Mail, Phone, MapPin, CreditCard, Edit3, ArrowUpRight, Cloud, Map } from 'lucide-react'

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"

interface Props {
  company?: any
  logoUrl?: string | null
  onEditLogo?: () => void
  onEditField?: (field: 'name' | 'email' | 'phoneNumber' | 'address' | 'approvalThreshold') => void
  onEditGmap?: () => void
  onEditGdrive?: () => void
}

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

  const pills = [
    {
      key: 'email' as const,
      icon: <Mail size={13} />,
      iconCls: 'text-blue-600',
      label: 'Email',
      value: company?.email || '-',
    },
    {
      key: 'phoneNumber' as const,
      icon: <Phone size={13} />,
      iconCls: 'text-emerald-600',
      label: 'Telepon',
      value: company?.phoneNumber || '-',
    },
    {
      key: 'address' as const,
      icon: <MapPin size={13} />,
      iconCls: 'text-rose-600',
      label: 'Lokasi',
      value: company?.address || '-',
    },
    {
      key: 'approvalThreshold' as const,
      icon: <CreditCard size={13} />,
      iconCls: 'text-orange-500',
      label: 'Approval Limit',
      value: approval,
    },
  ]

  return (
    <div className="col-span-8 bg-white rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[220px]" style={{ fontFamily: SF }}>
      {/* Header profil */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4 min-w-0">
          {/* Logo */}
          <div onClick={onEditLogo} className="relative group cursor-pointer shrink-0" title="Ganti logo perusahaan">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md ring-4 ring-slate-50">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
              ) : (
                company?.name?.charAt(0) || 'P'
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-2xs">
              <Edit3 size={10} className="text-slate-600" />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-slate-900 text-lg tracking-tight truncate">{company?.name || 'Perusahaan'}</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100/80">
                <ShieldCheck size={11} /> {company?.status === 'active' ? 'Verified' : company?.status || '-'}
              </span>
              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100/80">
                {company?.plan || 'FREE'} PLAN
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">ID Tenant: {company?.id?.slice(0, 14) || '-'}</p>
          </div>
        </div>

        <button className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-all cursor-pointer border border-slate-100 shrink-0" title="Detail perusahaan">
          <ArrowUpRight size={15} />
        </button>
      </div>

      {/* Quick data pills */}
      <div className="grid grid-cols-4 gap-2.5 mt-5">
        {pills.map((p) => (
          <button
            key={p.key}
            onClick={() => onEditField?.(p.key)}
            title={`Edit ${p.label}`}
            className="bg-[#f8f9fb] p-3 rounded-2xl border border-slate-100/80 text-left cursor-pointer hover:bg-slate-100/60 transition-colors"
          >
            <div className={`flex items-center gap-1.5 ${p.iconCls} mb-1`}>
              {p.icon}
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{p.label}</span>
            </div>
            <span className="text-xs font-bold text-slate-800 truncate block">{p.value}</span>
          </button>
        ))}
      </div>

      {/* Integrasi (Google Maps / Drive) */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
        <button
          onClick={onEditGmap}
          title="Edit link Google Maps"
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-500 hover:text-amber-600 bg-[#f8f9fb] hover:bg-amber-50 border border-slate-100/80 rounded-full px-2.5 py-1 transition-colors"
        >
          <Map size={11} className="text-amber-500" /> Maps: {company?.gmapLink ? 'Tersedia' : 'Belum diatur'}
        </button>
        <button
          onClick={onEditGdrive}
          title="Edit link Google Drive"
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-500 hover:text-sky-600 bg-[#f8f9fb] hover:bg-sky-50 border border-slate-100/80 rounded-full px-2.5 py-1 transition-colors"
        >
          <Cloud size={11} className="text-sky-500" /> Drive: {company?.gdriveLink ? 'Tersedia' : 'Belum diatur'}
        </button>
      </div>
    </div>
  )
}
