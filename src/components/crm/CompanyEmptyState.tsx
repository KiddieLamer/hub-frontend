import { Building2, Plus } from 'lucide-react'

interface CompanyEmptyStateProps {
  companyName: string
  onAddCustomer: () => void
}

export function CompanyEmptyState({ companyName, onAddCustomer }: CompanyEmptyStateProps) {
  return (
    <div className="my-6 space-y-4 rounded-3xl border border-white/80 bg-white/80 p-8 text-center shadow-xs backdrop-blur-md">
      {/* Icon Wrapper dengan Style Pastel */}
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-500/10 text-emerald-600 shadow-2xs">
        <Building2 className="h-6 w-6" />
      </div>

      {/* Teks Informasi */}
      <div className="mx-auto max-w-sm space-y-1">
        <h3 className="text-sm font-bold text-slate-900">Belum ada customer di {companyName}</h3>
        <p className="text-xs font-medium leading-relaxed text-slate-400">
          Perusahaan ini belum memiliki record customer atau lead aktif. Tambahkan customer pertama untuk mulai melacak pipeline.
        </p>
      </div>

      {/* Tombol Aksi */}
      <div className="pt-1">
        <button
          onClick={onAddCustomer}
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-slate-800"
        >
          <Plus className="h-3.5 w-3.5" /> Tambah Customer
        </button>
      </div>
    </div>
  )
}
