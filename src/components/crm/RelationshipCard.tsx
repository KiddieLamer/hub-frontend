import { useEffect, useState } from 'react'
import { FolderKanban, Receipt, ClipboardList, CalendarDays } from 'lucide-react'
import { clientsApi } from '../../lib/endpoints'

interface RelationshipStats {
  projects: { count: number; lastAt: string | null }
  invoices: { count: number; totalValue: number; paidValue: number; lastAt: string | null }
  quotations: { count: number; lastAt: string | null }
  bookings: { count: number; lastAt: string | null }
  memberSince: string
  lastTransactionAt: string | null
}

export interface RelationshipCardProps {
  clientId: string
  className?: string
}

const fmtIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n)

const fmtDate = (d: string) => {
  const date = new Date(d.includes('T') ? d : d.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return d
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Kartu "Riwayat transaksi" — agregat live dari modul Projects/Finance/CRM via clientId. */
export function RelationshipCard({ clientId, className = '' }: RelationshipCardProps) {
  const [stats, setStats] = useState<RelationshipStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    clientsApi
      .stats(clientId)
      .then((res: { stats?: RelationshipStats }) => {
        if (cancelled) return
        if (res?.stats) setStats(res.stats)
        else setError('Gagal memuat riwayat.')
      })
      .catch(() => {
        if (!cancelled) setError('Gagal memuat riwayat.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [clientId])

  const hasAnyHistory =
    stats && (stats.projects.count > 0 || stats.invoices.count > 0 || stats.quotations.count > 0 || stats.bookings.count > 0)

  // Repeat customer = minimal 2 transaksi nyata (invoice + booking). Project/quotation
  // sengaja gak dihitung — itu upaya jualan, bukan transaksi yang sudah terjadi.
  const isRepeat = stats ? stats.invoices.count + stats.bookings.count >= 2 : false

  return (
    <div
      className={`flex flex-col gap-4 rounded-[28px] border border-white/80 bg-white/80 p-5 font-sans shadow-xs backdrop-blur-md ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold tracking-tight text-slate-900">Riwayat transaksi</h3>
        {isRepeat && (
          <span className="shrink-0 rounded-full bg-[#E2F896] px-2.5 py-0.5 text-[10px] font-bold text-slate-900">
            Repeat customer
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2.5">
          <div className="h-16 animate-pulse rounded-2xl bg-slate-200/50" />
          <div className="h-16 animate-pulse rounded-2xl bg-slate-200/50" />
        </div>
      ) : error ? (
        <p className="text-xs text-slate-400">{error}</p>
      ) : !hasAnyHistory ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/40 px-3.5 py-4 text-center">
          <p className="font-semibold text-slate-500">Belum ada riwayat kerja sama</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            Project, invoice, quotation, dan booking untuk customer ini akan tercatat otomatis di sini.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-3">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-[#0d9488]" />
                <span className="text-[11px] font-semibold text-slate-500">Project</span>
              </div>
              <p className="mt-1.5 text-xl font-black tracking-tight text-slate-900">{stats!.projects.count}</p>
              {stats!.projects.lastAt && (
                <p className="text-[10px] text-slate-400">terakhir {fmtDate(stats!.projects.lastAt)}</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-[#0d9488]" />
                <span className="text-[11px] font-semibold text-slate-500">Invoice</span>
              </div>
              <p className="mt-1.5 text-xl font-black tracking-tight text-slate-900">{stats!.invoices.count}</p>
              <p className="text-[10px] text-slate-400">
                {fmtIDR(stats!.invoices.paidValue)} terbayar dari {fmtIDR(stats!.invoices.totalValue)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-[#0d9488]" />
                <span className="text-[11px] font-semibold text-slate-500">Quotation</span>
              </div>
              <p className="mt-1.5 text-xl font-black tracking-tight text-slate-900">{stats!.quotations.count}</p>
              {stats!.quotations.lastAt && (
                <p className="text-[10px] text-slate-400">terakhir {fmtDate(stats!.quotations.lastAt)}</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#0d9488]" />
                <span className="text-[11px] font-semibold text-slate-500">Booking</span>
              </div>
              <p className="mt-1.5 text-xl font-black tracking-tight text-slate-900">{stats!.bookings.count}</p>
              {stats!.bookings.lastAt && (
                <p className="text-[10px] text-slate-400">terakhir {fmtDate(stats!.bookings.lastAt)}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 rounded-2xl border border-[#0d9488]/20 bg-[#0d9488]/5 px-3.5 py-2.5 text-[11px]">
            <span className="text-slate-500">
              Pelanggan sejak <span className="font-semibold text-slate-800">{fmtDate(stats!.memberSince)}</span>
            </span>
            {stats!.lastTransactionAt && (
              <span className="shrink-0 rounded-full bg-[#E2F896] px-2.5 py-0.5 font-bold text-slate-900">
                aktif {fmtDate(stats!.lastTransactionAt)}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
