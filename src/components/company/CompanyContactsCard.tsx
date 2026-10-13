import { Mail, Phone, Globe, MapPin } from 'lucide-react'

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"

export interface CompanyContacts {
  email?: string | null
  phoneNumber?: string | null
  website?: string | null
  address?: string | null
}

interface Props {
  company?: CompanyContacts | null
  /** Dipanggil saat salah satu box diklik → buka modal edit field terkait */
  onEditField?: (field: 'email' | 'phoneNumber' | 'website' | 'address') => void
}

const boxCls = 'bg-slate-50/80 p-2.5 rounded-2xl border border-slate-100 flex items-center gap-2.5 text-left'

export default function CompanyContactsCard({ company, onEditField }: Props) {
  const items = [
    {
      key: 'email' as const,
      icon: <Mail size={14} />,
      iconCls: 'bg-blue-100 text-blue-600',
      label: 'Email',
      value: company?.email || '-',
      valueCls: 'text-slate-800',
    },
    {
      key: 'phoneNumber' as const,
      icon: <Phone size={14} />,
      iconCls: 'bg-emerald-100 text-emerald-600',
      label: 'Telepon',
      value: company?.phoneNumber || '-',
      valueCls: 'text-slate-800',
    },
    {
      key: 'website' as const,
      icon: <Globe size={14} />,
      iconCls: 'bg-indigo-100 text-indigo-600',
      label: 'Website',
      value: company?.website || '-',
      valueCls: 'text-indigo-600',
    },
    {
      key: 'address' as const,
      icon: <MapPin size={14} />,
      iconCls: 'bg-rose-100 text-rose-600',
      label: 'Alamat',
      value: company?.address || '-',
      valueCls: 'text-slate-800',
    },
  ]

  return (
    <div className="col-span-5 bg-white rounded-3xl p-5 shadow-xs flex flex-col justify-between h-full" style={{ fontFamily: SF }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kontak &amp; Lokasi Utama</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 my-auto">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => onEditField?.(it.key)}
            title={`Edit ${it.label}`}
            className={`${boxCls} cursor-pointer hover:bg-slate-100/80 transition-colors w-full`}
          >
            <div className={`w-7 h-7 rounded-xl ${it.iconCls} flex items-center justify-center shrink-0`}>{it.icon}</div>
            <div className="min-w-0 text-left">
              <span className="text-[9px] text-slate-400 block font-medium">{it.label}</span>
              <span className={`text-xs font-bold ${it.valueCls} truncate block`}>{it.value}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
