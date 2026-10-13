import { Map, Cloud, FileText, CreditCard } from 'lucide-react'

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"

export interface CompanyIntegrations {
  approvalThreshold?: number | string | null
  gmapLink?: string | null
  gdriveLink?: string | null
}

interface Props {
  company?: CompanyIntegrations | null
  onEditApproval?: () => void
  onEditGmap?: () => void
  onEditGdrive?: () => void
}

const rowCls = 'flex items-center justify-between p-2 rounded-2xl bg-slate-50 border border-slate-100 text-xs w-full'

export default function CompanyIntegrationsCard({
  company,
  onEditApproval,
  onEditGmap,
  onEditGdrive,
}: Props) {
  const approval =
    company?.approvalThreshold != null
      ? `Rp ${Number(company.approvalThreshold).toLocaleString('id-ID')}`
      : 'Rp 10.000.000'

  const rows = [
    {
      key: 'approval',
      icon: <CreditCard size={14} className="text-orange-500" />,
      label: 'Batas Approval Owner',
      value: approval,
      valueCls: 'font-bold text-slate-900',
      onClick: onEditApproval,
      title: 'Edit batas approval',
    },
    {
      key: 'gmap',
      icon: <Map size={14} className="text-amber-500" />,
      label: 'Google Maps',
      value: company?.gmapLink || 'Belum diatur',
      valueCls: company?.gmapLink ? 'text-[11px] font-bold text-slate-800 truncate max-w-[130px]' : 'text-[11px] text-slate-400 italic',
      onClick: onEditGmap,
      title: 'Edit link Google Maps',
    },
    {
      key: 'gdrive',
      icon: <Cloud size={14} className="text-sky-500" />,
      label: 'Google Drive',
      value: company?.gdriveLink || 'Belum diatur',
      valueCls: company?.gdriveLink ? 'text-[11px] font-bold text-slate-800 truncate max-w-[130px]' : 'text-[11px] text-slate-400 italic',
      onClick: onEditGdrive,
      title: 'Edit link Google Drive',
    },
  ]

  return (
    <div className="col-span-4 bg-white rounded-3xl p-5 shadow-xs flex flex-col justify-between h-full" style={{ fontFamily: SF }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Integrasi &amp; Batas Operasional</span>
      </div>

      <div className="space-y-2 my-auto">
        {rows.map((r) => (
          <button key={r.key} onClick={r.onClick} className={`${rowCls} cursor-pointer hover:bg-slate-100 transition-colors`} title={r.title}>
            <div className="flex items-center gap-2 min-w-0">
              {r.icon}
              <span className="text-slate-600 font-medium">{r.label}</span>
            </div>
            <span className={`${r.valueCls} flex items-center gap-1`}>
              {r.key !== 'approval' && <FileText size={11} className="text-slate-300 shrink-0" />}
              {r.value}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
