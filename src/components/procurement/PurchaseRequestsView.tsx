import { useEffect, useMemo, useState } from 'react'
import { Search, Plus, X, ClipboardList, ChevronLeft, ChevronRight, PackageOpen } from 'lucide-react'
import { purchaseRequestsApi, departmentBudgetsApi } from '../../lib/endpoints'
import {
  ShipboxCard,
  ShipboxProfileCard,
  ShipboxStatusPill,
  ShipboxEmptyState,
  ShipboxExpandableCard,
  type PillTheme,
} from '../shipbox/cards'

// ============================================================================
// PURCHASE REQUESTS VIEW — awal spine procurement.
// Form PR multi-item + BUDGET CHECK live terhadap budget departemen (periode
// bulan berjalan). Submit → status submitted → masuk antrean approval RACI.
// ============================================================================

type PR = Record<string, any>
type PRItem = { itemName: string; quantity: number; unitOfMeasure: string; estimatedUnitPrice: number; subtotal?: number }
type Budget = Record<string, any>

const PAGE_SIZE = 20

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
  po_created: 'PO Created',
  completed: 'Completed',
}
const STATUS_THEME: Record<string, PillTheme> = {
  draft: 'gray',
  submitted: 'purple',
  approved: 'lime',
  rejected: 'red',
  po_created: 'blue',
  completed: 'lime',
}
const PRIORITY_LABEL: Record<string, string> = { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' }
const PRIORITY_THEME: Record<string, PillTheme> = { low: 'gray', medium: 'blue', high: 'amber', urgent: 'red' }

const fmtRp = (n: any) => {
  const num = Number(n)
  return Number.isFinite(num) && num !== 0 ? `Rp${num.toLocaleString('id-ID')}` : 'Rp0'
}

function genPRNumber() {
  const now = new Date()
  return `PR-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-4)}`
}

// ---------------------------------------------------------------------------
// Panel budget check — dipakai di modal New PR.
// ---------------------------------------------------------------------------
function BudgetCheckPanel({ department, prTotal, budgets, loading }: { department: string; prTotal: number; budgets: Budget[]; loading: boolean }) {
  const b = budgets.find((x) => String(x.department).toLowerCase() === department.toLowerCase())
  if (!department) return null
  if (loading) return <div className="rounded-xl bg-[#F5F7FA] px-3.5 py-2.5 text-[11.5px] text-[#8C95A4]">Memuat budget departemen…</div>
  if (!b) {
    return (
      <div className="rounded-xl border border-dashed border-[#DCE1EA] px-3.5 py-2.5 text-[11.5px] text-[#8C95A4]">
        Budget departemen <span className="font-bold text-[#141B29]">{department}</span> belum diset periode ini — PR tetap bisa diajukan.
      </div>
    )
  }
  const allocated = Number(b.allocatedBudget ?? 0)
  const used = Number(b.usedBudget ?? 0)
  const remaining = Math.max(0, allocated - used)
  const over = Math.max(0, prTotal - remaining)
  const pct = allocated > 0 ? Math.min(100, ((used + prTotal) / allocated) * 100) : 100

  return (
    <div className={`rounded-xl border px-3.5 py-3 ${over > 0 ? 'border-[#EF6D6D] bg-[#FEF5F5]' : 'border-[#84E100] bg-[#F8FEEF]'}`}>
      <div className="flex items-center justify-between text-[11.5px] font-semibold">
        <span className="text-[#141B29]">Budget {department} (bulan ini)</span>
        <span className={over > 0 ? 'text-[#D64545]' : 'text-[#65B300]'}>
          {over > 0 ? `Over budget Rp${over.toLocaleString('id-ID')}` : 'Masih dalam budget'}
        </span>
      </div>
      <div className="mt-2 h-[6px] w-full overflow-hidden rounded-full bg-[#EEF1F6]">
        <div className={`h-full rounded-full transition-all ${over > 0 ? 'bg-[#EF6D6D]' : 'bg-[#84E100]'}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-[10.5px] text-[#5A6577]">
        <div>Alokasi<br /><span className="font-bold text-[#141B29]">{fmtRp(allocated)}</span></div>
        <div>Terpakai<br /><span className="font-bold text-[#141B29]">{fmtRp(used)}</span></div>
        <div>Sisa<br /><span className={`font-bold ${over > 0 ? 'text-[#D64545]' : 'text-[#141B29]'}`}>{fmtRp(remaining)}</span></div>
      </div>
      {over > 0 && (
        <p className="mt-2 text-[10.5px] leading-snug text-[#D64545]">
          Total PR melebihi sisa budget. Backend tidak memblokir — sampaikan justifikasi di kolom catatan agar approver punya konteks.
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Modal New PR — multi-item + budget check.
// ---------------------------------------------------------------------------
function NewPRModal({
  budgets,
  budgetLoading,
  onClose,
  onCreated,
}: {
  budgets: Budget[]
  budgetLoading: boolean
  onClose: () => void
  onCreated: (msg: string) => void
}) {
  const [prNumber, setPrNumber] = useState(genPRNumber())
  const [title, setTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [customDept, setCustomDept] = useState('')
  const [priority, setPriority] = useState('medium')
  const [items, setItems] = useState<PRItem[]>([{ itemName: '', quantity: 1, unitOfMeasure: 'pcs', estimatedUnitPrice: 0 }])
  const [saving, setSaving] = useState(false)

  const deptOptions = useMemo(() => {
    const set = new Set<string>()
    budgets.forEach((b) => b.department && set.add(String(b.department)))
    return Array.from(set)
  }, [budgets])

  const effectiveDept = department === '__custom' ? customDept : department
  const total = useMemo(
    () => items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.estimatedUnitPrice) || 0), 0),
    [items]
  )

  const setItem = (i: number, patch: Partial<PRItem>) =>
    setItems((rows) => rows.map((r, ri) => (ri === i ? { ...r, ...patch } : r)))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validItems = items.filter((it) => it.itemName.trim() && Number(it.quantity) > 0)
    if (validItems.length === 0 || !title.trim() || !effectiveDept.trim()) return
    setSaving(true)
    try {
      await purchaseRequestsApi.create({
        prNumber: prNumber.trim() || genPRNumber(),
        department: effectiveDept.trim(),
        title: title.trim(),
        priority,
        estimatedTotalCost: total,
        items: validItems.map((it) => ({
          itemName: it.itemName.trim(),
          quantity: Number(it.quantity),
          unitOfMeasure: it.unitOfMeasure || 'pcs',
          estimatedUnitPrice: Number(it.estimatedUnitPrice) || 0,
        })),
      })
      onCreated(`PR ${prNumber} tersimpan sebagai draft`)
      onClose()
    } catch (err: any) {
      onCreated(err?.message || 'Gagal menyimpan PR')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[#EAEDF2] bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#F1F4F8] px-6 py-4">
          <h3 className="text-lg font-bold text-[#141B29]">New Purchase Request</h3>
          <button onClick={onClose} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#8C95A4] hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto px-6 py-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#5A6577]">Nomor PR</label>
              <input value={prNumber} onChange={(e) => setPrNumber(e.target.value)} className="w-full rounded-xl border border-[#DCE1EA] px-3.5 py-2 font-mono text-[13px] font-semibold focus:border-[#84E100] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#5A6577]">Prioritas</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full rounded-xl border border-[#DCE1EA] px-3.5 py-2 focus:border-[#84E100] focus:outline-none">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#5A6577]">Judul kebutuhan</label>
              <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Pengadaan material proyek A" className="w-full rounded-xl border border-[#DCE1EA] px-3.5 py-2 focus:border-[#84E100] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#5A6577]">Departemen</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full rounded-xl border border-[#DCE1EA] px-3.5 py-2 focus:border-[#84E100] focus:outline-none">
                <option value="">— Pilih departemen —</option>
                {deptOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                <option value="__custom">Lainnya (ketik manual)…</option>
              </select>
            </div>
          </div>
          {department === '__custom' && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#5A6577]">Nama departemen</label>
              <input required value={customDept} onChange={(e) => setCustomDept(e.target.value)} placeholder="Operasional" className="w-full rounded-xl border border-[#DCE1EA] px-3.5 py-2 focus:border-[#84E100] focus:outline-none" />
            </div>
          )}

          {/* Items multi-baris */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold text-[#5A6577]">Item yang diajukan</label>
              <button type="button" onClick={() => setItems((r) => [...r, { itemName: '', quantity: 1, unitOfMeasure: 'pcs', estimatedUnitPrice: 0 }])} className="cursor-pointer text-xs font-semibold text-[#65B300] hover:underline">+ Tambah item</button>
            </div>
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-[1fr_72px_84px_120px_110px_32px] gap-2 px-1 text-[10.5px] font-semibold uppercase tracking-wide text-[#8C95A4]">
                <span>Nama item</span><span>Qty</span><span>UoM</span><span>Harga satuan</span><span>Subtotal</span><span />
              </div>
              {items.map((it, i) => {
                const sub = (Number(it.quantity) || 0) * (Number(it.estimatedUnitPrice) || 0)
                return (
                  <div key={i} className="grid grid-cols-[1fr_72px_84px_120px_110px_32px] items-center gap-2">
                    <input value={it.itemName} onChange={(e) => setItem(i, { itemName: e.target.value })} placeholder="Semen 50kg" className="w-full rounded-xl border border-[#DCE1EA] px-3 py-2 focus:border-[#84E100] focus:outline-none" />
                    <input type="number" min="1" value={it.quantity} onChange={(e) => setItem(i, { quantity: Number(e.target.value) })} className="w-full rounded-xl border border-[#DCE1EA] px-3 py-2 text-right focus:border-[#84E100] focus:outline-none" />
                    <input value={it.unitOfMeasure} onChange={(e) => setItem(i, { unitOfMeasure: e.target.value })} className="w-full rounded-xl border border-[#DCE1EA] px-3 py-2 focus:border-[#84E100] focus:outline-none" />
                    <input type="number" min="0" value={it.estimatedUnitPrice || ''} onChange={(e) => setItem(i, { estimatedUnitPrice: Number(e.target.value) })} placeholder="0" className="w-full rounded-xl border border-[#DCE1EA] px-3 py-2 text-right focus:border-[#84E100] focus:outline-none" />
                    <div className="text-right text-[12.5px] font-bold text-[#141B29]">{fmtRp(sub)}</div>
                    <button type="button" onClick={() => setItems((r) => r.length > 1 ? r.filter((_, ri) => ri !== i) : r)} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#8C95A4] hover:bg-slate-100" title="Hapus item"><X className="h-3.5 w-3.5" /></button>
                  </div>
                )
              })}
            </div>
            <div className="mt-2 flex justify-end gap-6 border-t border-[#F1F4F8] pt-2 pr-1 text-[13px]">
              <span className="text-[#8C95A4]">Total estimasi</span>
              <span className="text-[15px] font-extrabold tracking-tight text-[#141B29]">{fmtRp(total)}</span>
            </div>
          </div>

          {/* Budget check live */}
          <BudgetCheckPanel department={effectiveDept} prTotal={total} budgets={budgets} loading={budgetLoading} />

          <div className="flex items-center justify-end gap-2.5 border-t border-[#F1F4F8] pt-3 pb-1">
            <button type="button" onClick={onClose} className="cursor-pointer rounded-full px-4 py-2 text-xs font-semibold text-[#5A6577] hover:bg-slate-100">Cancel</button>
            <button type="submit" disabled={saving || total <= 0} className="cursor-pointer rounded-full bg-[#84E100] px-5 py-2 text-xs font-bold text-[#141B29] shadow-[0_6px_18px_rgba(132,225,0,0.28)] transition hover:bg-[#77CC00] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed">
              {saving ? 'Menyimpan…' : 'Simpan sebagai Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PurchaseRequestsView utama.
// ---------------------------------------------------------------------------
export default function PurchaseRequestsView({ onNotify }: { onNotify: (msg: string) => void }) {
  const [prs, setPrs] = useState<PR[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [budgetLoading, setBudgetLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<PR | null>(null)
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await purchaseRequestsApi.list()
      const list = res?.purchaseRequests || res || []
      setPrs(Array.isArray(list) ? list : [])
    } catch {
      onNotify('Gagal memuat purchase requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Budget periode bulan berjalan (gagal → check ditampilkan sebagai n/a).
  useEffect(() => {
    const now = new Date()
    departmentBudgetsApi.list({ month: now.getMonth() + 1, year: now.getFullYear() })
      .then((res: any) => setBudgets(res?.budgets ?? []))
      .catch(() => setBudgets([]))
      .finally(() => setBudgetLoading(false))
  }, [])

  // Ambil detail (dengan items) saat PR dipilih.
  useEffect(() => {
    if (!selectedId) { setDetail(null); return }
    purchaseRequestsApi.get(selectedId)
      .then((res: any) => setDetail(res?.purchaseRequest ?? null))
      .catch(() => setDetail(null))
  }, [selectedId])

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return prs
    const q = searchQuery.toLowerCase()
    return prs.filter((p) => `${p.prNumber} ${p.title} ${p.department}`.toLowerCase().includes(q))
  }, [prs, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = useMemo(() => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE), [filtered, safePage])
  useEffect(() => { setPage(1) }, [searchQuery]) // eslint-disable-line react-hooks/exhaustive-deps

  const selected = prs.find((p) => String(p.id) === selectedId) ?? null

  const handleSubmitPR = async () => {
    if (!selected || submitting) return
    setSubmitting(true)
    try {
      await purchaseRequestsApi.submit(String(selected.id))
      onNotify(`PR ${selected.prNumber} diajukan untuk approval`)
      loadData()
      setSelectedId(String(selected.id))
    } catch (e: any) {
      onNotify(e?.message || 'Gagal mengajukan PR')
    } finally {
      setSubmitting(false)
    }
  }

  const items: any[] = detail?.items ?? []

  return (
    <div className="font-jakarta flex flex-col gap-5 md:flex-row">
      {/* Panel kiri: daftar PR */}
      <section className="flex w-full shrink-0 flex-col gap-4 rounded-[20px] border border-[#EAEDF2] bg-white p-5 md:w-[345px] md:rounded-none md:border-r md:border-y-0 md:border-l-0">
        <div className="border-b border-[#F1F4F8] pb-2">
          <h1 className="text-[20px] font-extrabold uppercase tracking-tight text-[#141B29]">PURCHASE REQUESTS</h1>
          <p className="mt-0.5 text-[11px] text-[#8C95A4]">{prs.length} PR · mulai dari sini</p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 stroke-[2] text-[#141B29]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PR number / title"
            className="h-[42px] w-full rounded-full bg-[#F5F7FA] pl-11 pr-9 text-[13px] text-[#141B29] placeholder-[#8C95A4] transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#84E100]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-[#8C95A4] hover:text-[#141B29]" aria-label="Bersihkan pencarian">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#84E100] font-bold text-[14px] text-[#141B29] shadow-[0_6px_18px_rgba(132,225,0,0.28)] transition hover:bg-[#78CE00] active:scale-[0.99]"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>New Purchase Request</span>
        </button>

        <div className="flex max-h-[480px] flex-col gap-3.5 overflow-y-auto pr-1 pt-1">
          {loading ? (
            <div className="h-40 animate-pulse rounded-2xl bg-white/70" />
          ) : pageItems.length > 0 ? (
            pageItems.map((p) => {
              const st = String(p.status || 'draft')
              return (
                <ShipboxExpandableCard
                  key={String(p.id)}
                  icon={<ClipboardList className="h-4 w-4" />}
                  title={p.prNumber}
                  expanded={String(p.id) === selectedId}
                  onToggle={() => setSelectedId(String(p.id) === selectedId ? null : String(p.id))}
                  pill={<ShipboxStatusPill status={st} label={STATUS_LABEL[st] ?? st} theme={STATUS_THEME[st] ?? 'gray'} />}
                >
                  <div className="flex items-start justify-between gap-3 border-b border-[#F1F4F8] pb-3">
                    <div className="min-w-0">
                      <div className="text-[11px] text-[#8C95A4]">Judul</div>
                      <div className="truncate text-[12.5px] font-bold text-[#141B29]">{p.title}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[11px] text-[#8C95A4]">Estimasi</div>
                      <div className="text-[12.5px] font-bold text-[#141B29]">{fmtRp(p.estimatedTotalCost)}</div>
                    </div>
                  </div>
                </ShipboxExpandableCard>
              )
            })
          ) : (
            <ShipboxEmptyState
              icon={<ClipboardList className="h-5 w-5" />}
              title={searchQuery ? `Tidak ada "${searchQuery}"` : 'Belum ada purchase request'}
              description="Klik + New Purchase Request — lengkap dengan budget check departemen."
              compact
            />
          )}
        </div>

        {/* Pager 20/halaman */}
        {!loading && filtered.length > 0 && (
          <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#F1F4F8] pt-3">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#EAEDF2] bg-white text-[#141B29] transition hover:border-[#84E100] disabled:opacity-30 disabled:cursor-not-allowed" title="Halaman sebelumnya">
              <ChevronLeft className="h-4 w-4 stroke-[2]" />
            </button>
            <span className="text-[11.5px] font-medium text-[#8C95A4]">
              Halaman <span className="font-bold text-[#141B29]">{safePage}</span> / {totalPages}
              <span className="mx-1.5 text-[#DCE1EA]">·</span>{filtered.length} PR
            </span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#EAEDF2] bg-white text-[#141B29] transition hover:border-[#84E100] disabled:opacity-30 disabled:cursor-not-allowed" title="Halaman berikutnya">
              <ChevronRight className="h-4 w-4 stroke-[2]" />
            </button>
          </div>
        )}
      </section>

      {/* Workspace kanan: detail + items + aksi */}
      <main className="flex min-w-0 flex-1 flex-col gap-5 overflow-y-auto rounded-[20px] bg-[#F8F9FB] p-5 md:rounded-none md:rounded-r-[20px]">
        {selected ? (
          <>
            <ShipboxProfileCard
              title="Detail Purchase Request"
              avatar={
                <div className="flex h-11 w-11 items-end justify-center overflow-hidden rounded-full border border-black/5 bg-[#E8ECF2]">
                  <ClipboardList className="mb-2 h-5 w-5 text-[#141B29]" />
                </div>
              }
              name={selected.prNumber}
              subtitle={selected.title}
              actions={
                <div className="flex items-center gap-2">
                  <ShipboxStatusPill status={String(selected.priority || 'medium')} label={PRIORITY_LABEL[selected.priority] ?? 'Medium'} theme={PRIORITY_THEME[selected.priority] ?? 'gray'} />
                  <ShipboxStatusPill status={String(selected.status || 'draft')} label={STATUS_LABEL[selected.status] ?? 'Draft'} theme={STATUS_THEME[selected.status] ?? 'gray'} />
                </div>
              }
              specs={[
                { label: 'Departemen', value: selected.department || '—' },
                { label: 'Total estimasi', value: fmtRp(selected.estimatedTotalCost) },
                { label: 'Jumlah item', value: String(items.length || '—') },
                { label: 'Dibuat', value: selected.createdAt ? new Date(selected.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                { label: 'Prioritas', value: PRIORITY_LABEL[selected.priority] ?? 'Medium' },
                { label: 'Status', value: STATUS_LABEL[selected.status] ?? 'Draft' },
              ]}
            />

            {/* Item list */}
            <ShipboxCard title="Item yang Diajukan" right={<span className="text-[11.5px] font-medium text-[#8C95A4]">{items.length} item</span>}>
              {items.length > 0 ? (
                <div className="flex flex-col">
                  <div className="grid grid-cols-[1fr_80px_130px_120px] gap-2 border-b border-[#F1F4F8] pb-2 text-[10.5px] font-semibold uppercase tracking-wide text-[#8C95A4]">
                    <span>Nama item</span><span className="text-right">Qty</span><span className="text-right">Harga satuan</span><span className="text-right">Subtotal</span>
                  </div>
                  {items.map((it, i) => {
                    const qty = Number(it.quantity ?? 0)
                    const price = Number(it.estimatedUnitPrice ?? 0)
                    return (
                      <div key={i} className="grid grid-cols-[1fr_80px_130px_120px] items-center gap-2 border-b border-[#F1F4F8] py-2.5 text-[12.5px] last:border-b-0">
                        <div>
                          <div className="font-bold text-[#141B29]">{it.itemName}</div>
                          {it.notesSpecification && <div className="text-[11px] text-[#8C95A4]">{it.notesSpecification}</div>}
                        </div>
                        <div className="text-right text-[#141B29]">{qty} {it.unitOfMeasure || 'pcs'}</div>
                        <div className="text-right text-[#141B29]">{fmtRp(price)}</div>
                        <div className="text-right font-bold text-[#141B29]">{fmtRp(qty * price)}</div>
                      </div>
                    )
                  })}
                  <div className="mt-2 flex justify-end gap-6 pt-1 text-[13px]">
                    <span className="text-[#8C95A4]">Total estimasi</span>
                    <span className="text-[15px] font-extrabold tracking-tight text-[#141B29]">{fmtRp(selected.estimatedTotalCost)}</span>
                  </div>
                </div>
              ) : (
                <ShipboxEmptyState icon={<PackageOpen className="h-5 w-5" />} title="Item belum dimuat" description="Detail item tampil setelah data PR dimuat dari server." compact />
              )}
            </ShipboxCard>

            {/* Aksi alur */}
            <ShipboxCard title="Alur Selanjutnya">
              {selected.status === 'draft' ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="max-w-md text-[12.5px] leading-relaxed text-[#5A6577]">
                    PR masih <span className="font-bold text-[#141B29]">draft</span>. Submit untuk masuk antrean approval RACI — approver akan melihatnya di Dashboard.
                  </p>
                  <button
                    onClick={handleSubmitPR}
                    disabled={submitting}
                    className="cursor-pointer rounded-full bg-[#84E100] px-5 py-2.5 text-[13px] font-bold text-[#141B29] shadow-[0_6px_18px_rgba(132,225,0,0.28)] transition hover:bg-[#77CC00] active:scale-[0.98] disabled:opacity-50"
                  >
                    {submitting ? 'Mengajukan…' : 'Submit untuk Approval'}
                  </button>
                </div>
              ) : selected.status === 'approved' ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="max-w-md text-[12.5px] leading-relaxed text-[#5A6577]">
                    PR sudah <span className="font-bold text-[#65B300]">approved</span>. Langkah berikutnya: konversi ke Purchase Order (fitur PR → PO 1-klik di roadmap).
                  </p>
                  <span className="rounded-full border border-[#84E100] bg-[#F1FCE2] px-4 py-2 text-[12px] font-bold text-[#65B300]">Siap jadi PO</span>
                </div>
              ) : selected.status === 'rejected' ? (
                <p className="text-[12.5px] leading-relaxed text-[#D64545]">
                  PR <span className="font-bold">ditolak</span> oleh approver. Perbaiki item/justifikasi lalu ajukan ulang.
                </p>
              ) : (
                <p className="text-[12.5px] leading-relaxed text-[#5A6577]">
                  PR berstatus <span className="font-bold text-[#141B29]">{STATUS_LABEL[selected.status] ?? selected.status}</span> — sedang diproses sesuai alur RACI.
                </p>
              )}
            </ShipboxCard>
          </>
        ) : (
          <ShipboxEmptyState
            icon={<ClipboardList className="h-5 w-5" />}
            title="Belum ada PR dipilih"
            description="Pilih purchase request di panel kiri untuk melihat detail item & aksi alur, atau buat PR baru dengan budget check."
          />
        )}
      </main>

      {showForm && (
        <NewPRModal
          budgets={budgets}
          budgetLoading={budgetLoading}
          onClose={() => setShowForm(false)}
          onCreated={(msg) => {
            onNotify(msg)
            loadData()
          }}
        />
      )}
    </div>
  )
}
