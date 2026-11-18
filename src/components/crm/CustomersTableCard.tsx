import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Search, Users, X } from 'lucide-react'
import { clientsApi } from '../../lib/endpoints'

const SF = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif'

const STATUS_STYLES: Record<string, string> = {
  lead: 'bg-sky-100 text-sky-700 border-sky-200',
  prospect: 'bg-violet-100 text-violet-700 border-violet-200',
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  churned: 'bg-zinc-200 text-zinc-600 border-zinc-300',
  inactive: 'bg-amber-100 text-amber-700 border-amber-200',
}

const PAGE_SIZE = 20

interface Props {
  onSelect: (clientId: string) => void
  onClose: () => void
}

/** Directory view: seluruh customer dalam tabel, 20/halaman + filter + search
 *  server-side (page/limit/search/status sudah didukung GET /api/clients). */
export default function CustomersTableCard({ onSelect, onClose }: Props) {
  const [rows, setRows] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Ref nilai terkini — debounce search tidak membawa status/search basi
  // dari closure lama (race saat user mengetik lalu langsung ganti filter).
  const statusRef = useRef(status)
  statusRef.current = status

  const load = useCallback(async (p: number, s: string, st: string) => {
    setLoading(true); setErr('')
    try {
      const data: any = await clientsApi.list(s.trim() || undefined, PAGE_SIZE, p, st || undefined)
      setRows(data?.clients || [])
      setTotal(data?.total ?? (data?.clients || []).length)
      setPages(Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE)))
    } catch {
      setErr('Gagal memuat customer')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page, search, status) }, [page, status, load])

  const onSearchChange = (v: string) => {
    setSearch(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { setPage(1); load(1, v, statusRef.current) }, 400)
  }

  const totalPages = Math.max(pages, 1)
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(total, page * PAGE_SIZE)

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-white/70 bg-[#F2F5F8]/70 p-5 shadow-sm backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900" style={{ fontFamily: SF }}>Customers</h2>
            <p className="text-[11px] text-zinc-500" style={{ fontFamily: SF }}>Directory lengkap — {total} customer</p>
          </div>
        </div>
        <button
          onClick={onClose}
          title="Kembali ke pipeline"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/60 bg-white/80 text-slate-600 shadow-xs transition-colors hover:bg-white hover:text-slate-900"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nama / PIC / email…"
            className="w-64 rounded-full border border-slate-200/80 bg-white/80 py-1.5 pl-8 pr-3 text-xs text-slate-800 outline-none transition-colors focus:border-slate-400"
            style={{ fontFamily: SF }}
          />
        </div>
        {['', 'lead', 'prospect', 'active', 'churned'].map((st) => (
          <button
            key={st || 'all'}
            onClick={() => { setStatus(st); setPage(1) }}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
              status === st
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200/80 bg-white/70 text-slate-600 hover:border-slate-400'
            }`}
            style={{ fontFamily: SF }}
          >
            {st === '' ? 'Semua' : st.charAt(0).toUpperCase() + st.slice(1)}
          </button>
        ))}
      </div>

      {/* Tabel */}
      <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-white/80 bg-white/60">
        {loading ? (
          <div className="flex items-center justify-center py-14 text-[12px] text-zinc-400" style={{ fontFamily: SF }}>Memuat…</div>
        ) : err ? (
          <div className="px-4 py-8 text-center text-[12px] text-red-500" style={{ fontFamily: SF }}>{err}</div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-14 text-center text-[12px] text-zinc-400" style={{ fontFamily: SF }}>
            Tidak ada customer yang cocok.
          </div>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-[#F2F5F8]/95 backdrop-blur-sm">
              <tr className="text-[10px] font-bold uppercase tracking-wider text-zinc-500" style={{ fontFamily: SF }}>
                <th className="px-4 py-2.5">Customer</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">PIC</th>
                <th className="px-4 py-2.5">Industry</th>
                <th className="px-4 py-2.5">PIC Email</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelect(c.id)}
                  className="cursor-pointer border-t border-slate-100 transition-colors hover:bg-slate-50"
                >
                  <td className="max-w-[220px] truncate px-4 py-2.5 text-[12px] font-semibold text-slate-900" style={{ fontFamily: SF }}>
                    {c.name}
                    {c.socialMedia?.instagram && (
                      <span className="ml-2 text-[10px] font-normal text-zinc-400">{c.socialMedia.instagram}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[c.status] || 'bg-zinc-100 text-zinc-600 border-zinc-200'}`} style={{ fontFamily: SF }}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[12px] text-slate-700" style={{ fontFamily: SF }}>{c.picName || '—'}</td>
                  <td className="px-4 py-2.5 text-[12px] text-slate-600" style={{ fontFamily: SF }}>{c.industry || '—'}</td>
                  <td className="px-4 py-2.5 text-[12px] text-slate-500" style={{ fontFamily: SF }}>{c.picEmail || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex shrink-0 items-center justify-between">
        <span className="text-[11px] text-zinc-500" style={{ fontFamily: SF }}>
          {from}–{to} dari {total} customer
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-600 transition-colors hover:bg-white disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="text-[11px] font-semibold text-slate-700" style={{ fontFamily: SF }}>
            Hal. {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-600 transition-colors hover:bg-white disabled:opacity-40"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
