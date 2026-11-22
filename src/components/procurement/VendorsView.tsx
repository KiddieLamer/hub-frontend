import { useState, useEffect, useMemo } from 'react'
import { Search, Plus, X, Phone, ChevronLeft, ChevronRight } from 'lucide-react'
import { vendorsApi, notificationsApi } from '../../lib/endpoints'

// Paging: maksimal 20 vendor per halaman (list scrollable di panel kiri).
const PAGE_SIZE = 20

function fmtRupiah(n: number | null): string {
  return n ? `Rp${Number(n).toLocaleString('id-ID')}` : '—'
}

// ============================================================================
// NAVBAR — brand + pill nav Procurement + tombol aksi kanan (ala referensi)
// ============================================================================
export function ProcNavbar({ activeTab, onTabChange, onNotifyClick }: { activeTab: string; onTabChange: (id: string) => void; onNotifyClick: (msg: string) => void }) {
  const [unreadCount, setUnreadCount] = useState(0)
  useEffect(() => {
    notificationsApi.list().then((res: any) => {
      const notifs = res?.notifications ?? res?.data ?? []
      setUnreadCount(Array.isArray(notifs) ? notifs.filter((n: Record<string, unknown>) => !n.isRead && !n.readAt).length : 0)
    }).catch(() => {})
  }, [])

  const NAV_TABS = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'suppliers', label: 'Suppliers' },
  ]

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-2.5 select-none">
        <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M17.5 4.5C14.8 4.5 13 6.8 13.7 9.4L15.4 15.6L9.2 13.9C6.6 13.2 4.3 15 4.3 17.7C4.3 20.1 6.1 22.1 8.5 22.4L14.8 23.2L11.7 28.7C10.4 31 11.8 33.8 14.4 34.2C16.7 34.6 18.9 33.1 19.4 30.8L20.8 24.6L25.6 28.7C27.6 30.4 30.7 29.6 31.7 27.1C32.6 24.9 31.6 22.4 29.4 21.4L23.6 18.8L29.1 15.5C31.3 14.2 31.7 11.1 29.9 9.2C28.2 7.5 25.5 7.5 23.8 9.2L19.4 13.7L20.8 7.5C21.3 5.2 19.8 4.5 17.5 4.5Z"
            fill="#141414"
          />
          <circle cx="18" cy="18.5" r="2.6" fill="#FAF9F6" />
        </svg>
        <span className="font-extrabold text-[15px] tracking-[0.06em] text-[#141414] uppercase">PROCUREMENT</span>
      </div>

      <nav className="flex items-center flex-wrap bg-white/95 backdrop-blur-sm rounded-full p-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]" aria-label="Modul Procurement">
        {NAV_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            aria-current={activeTab === t.id ? 'true' : undefined}
            className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 cursor-pointer ${
              activeTab === t.id
                ? 'bg-[#1E1E1E] text-white shadow-sm'
                : 'text-[#3A3A3A] hover:text-[#111111] hover:bg-black/[0.03]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2.5">
        <button
          onClick={() => onNotifyClick('Pengaturan sistem dibuka')}
          className="flex items-center gap-2 bg-white/95 hover:bg-white text-[#1E1E1E] px-4 py-2.5 rounded-full text-[13px] font-medium shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all cursor-pointer"
        >
          <span className="text-[15px] leading-none">⚙</span>
          <span>Setting</span>
        </button>
        <div
          className="relative w-10 h-10 rounded-full bg-white/95 hover:bg-white flex items-center justify-center text-[#1E1E1E] shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all"
          aria-label="Notifications"
        >
          <span className="text-[15px] leading-none">🔔</span>
          {unreadCount > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#F5D248] ring-2 ring-white" />}
        </div>
        <div
          className="w-10 h-10 rounded-full bg-white/95 hover:bg-white flex items-center justify-center text-[#1E1E1E] shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all"
          aria-label="User Profile"
        >
          <span className="text-[13px] font-bold">U</span>
        </div>
      </div>
    </header>
  )
}

// ============================================================================
// VENDOR CARD — collapsed (ringkas) / expanded (detail + daftar harga)
// ============================================================================
function VendorCard({ vendor, isExpanded, onToggle, onNotify }: { vendor: any; isExpanded: boolean; onToggle: () => void; onNotify: (msg: string) => void }) {
  const [copied, setCopied] = useState(false)
  const copyCode = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(String(vendor.companyName ?? '')).catch(() => {})
    setCopied(true)
    onNotify(`Nama vendor dikopi`)
    setTimeout(() => setCopied(false), 1800)
  }
  const commodities = vendor.commodities ?? []

  return (
    <div className={`bg-white rounded-[18px] border transition-all duration-200 ${isExpanded ? 'border-[#84E100] shadow-[0_10px_28px_rgba(132,225,0,0.08)]' : 'border-[#EDF0F5] hover:border-[#D5DCE6]'}`}>
      <button onClick={onToggle} className="w-full px-4 py-3.5 flex items-center justify-between gap-2 text-left cursor-pointer">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full border border-[#EAEDF2] bg-[#FAFBFD] flex items-center justify-center shrink-0">
            <span className="text-[13px] font-bold text-[#141B29]">{(vendor.companyName || '?').slice(0, 2).toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <div className="text-[14.5px] font-bold text-[#141B29] truncate">{vendor.companyName}</div>
            <div className="text-[11px] text-[#8C95A4] truncate">{vendor.address || '—'}</div>
          </div>
        </div>
        <span className="text-[11px] text-[#8C95A4] shrink-0">{commodities.length} komoditas</span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-3.5 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-[12px] text-[#141B29]">
            <Phone className="w-3.5 h-3.5 text-[#8C95A4]" />
            <span>{vendor.phoneNumber || '—'}</span>
          </div>
          {vendor.picName && <div className="text-[12px] text-[#8C95A4]">PIC: <span className="font-medium text-[#141B29]">{vendor.picName}</span></div>}
          {commodities.length > 0 ? (
            <div className="rounded-xl bg-[#F5F7FA] px-3 py-2 flex flex-col gap-1.5">
              {commodities.map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-[12px]">
                  <span className="font-medium text-[#141B29] truncate">{c.commodity}</span>
                  <span className="font-bold text-[#141B29]">{fmtRupiah(Number(c.price ?? 0))}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#8C95A4]">Belum ada daftar harga.</p>
          )}
          {copied && <span className="text-[10px] text-[#65B300]">Nama vendor dikopi ✓</span>}
          <button onClick={copyCode} className="self-start text-[11px] font-semibold text-[#65B300] hover:underline cursor-pointer">Kopi nama vendor</button>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// VENDORS VIEW — list vendor + expand daftar harga + tambah vendor
// ============================================================================
export default function VendorsView({ onNotify }: { onNotify: (msg: string) => void }) {
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ companyName: '', picName: '', phoneNumber: '', address: '' })
  const [commodities, setCommodities] = useState<Array<{ commodity: string; price: string }>>([{ commodity: '', price: '' }])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await vendorsApi.list()
      const v = res?.vendors || res || []
      setVendors(Array.isArray(v) ? v : [])
    } catch { onNotify('Gagal memuat vendor') } finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return vendors
    const q = searchQuery.toLowerCase()
    return vendors.filter(v => `${v.companyName} ${v.address ?? ''} ${v.phoneNumber ?? ''}`.toLowerCase().includes(q))
  }, [vendors, searchQuery])

  // Paging client-side: 20 vendor per halaman, urut sesuai hasil filter.
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  )
  useEffect(() => { setPage(1) }, [searchQuery]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    try {
      await vendorsApi.create({
        companyName: form.companyName,
        picName: form.picName || undefined,
        phoneNumber: form.phoneNumber || undefined,
        address: form.address || undefined,
        commodities: commodities.filter(r => r.commodity.trim()).map(r => ({ commodity: r.commodity.trim(), price: Number(r.price) || 0 })),
      })
      setShowForm(false)
      setForm({ companyName: '', picName: '', phoneNumber: '', address: '' })
      setCommodities([{ commodity: '', price: '' }])
      onNotify('Vendor baru tersimpan')
      loadData()
    } catch { onNotify('Gagal menyimpan vendor') }
  }

  const totalCommodities = vendors.reduce((s, v) => s + (v.commodities?.length ?? 0), 0)

  return (
    <div className="font-jakarta flex flex-col gap-5 md:flex-row">
      {/* Panel kiri: daftar vendor */}
      <section className="flex w-full shrink-0 flex-col gap-4 rounded-[20px] border border-[#EAEDF2] bg-white p-5 md:w-[345px] md:rounded-none md:border-r md:border-y-0 md:border-l-0">
        <div className="pb-2 border-b border-[#F1F4F8]">
          <h1 className="text-[20px] font-extrabold tracking-tight text-[#141B29] uppercase">VENDOR</h1>
          <p className="text-[11px] text-[#8C95A4] mt-0.5">{vendors.length} vendor · {totalCommodities} komoditas</p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#141B29] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vendor"
            className="w-full h-[42px] pl-11 pr-9 rounded-full bg-[#F5F7FA] text-[13px] text-[#141B29] placeholder-[#8C95A4] focus:outline-none focus:ring-2 focus:ring-[#84E100] focus:bg-white transition"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C95A4] hover:text-[#141B29] cursor-pointer" aria-label="Bersihkan pencarian">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="w-full h-[46px] rounded-full bg-[#84E100] hover:bg-[#78CE00] active:scale-[0.99] text-[#141B29] font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_6px_18px_rgba(132,225,0,0.28)] transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Vendor</span>
        </button>

        <div className="flex max-h-[560px] flex-col gap-3.5 overflow-y-auto pt-1 pr-1">
          {loading ? (
            <div className="rounded-2xl bg-white/70 h-40 animate-pulse" />
          ) : pageItems.length > 0 ? (
            pageItems.map((v) => (
              <VendorCard
                key={v.id}
                vendor={v}
                isExpanded={expandedVendorId === v.id}
                onToggle={() => setExpandedVendorId(expandedVendorId === v.id ? null : v.id)}
                onNotify={onNotify}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-[#DCE1EA] p-6 text-center text-[13px] text-[#8C95A4]">
              Belum ada vendor terdaftar. Klik + Add Vendor untuk menambah.
            </div>
          )}
        </div>

        {/* Pager — maksimal 20 vendor per halaman */}
        {!loading && filtered.length > 0 && (
          <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#F1F4F8] pt-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#EAEDF2] bg-white text-[#141B29] transition hover:border-[#84E100] disabled:opacity-30 disabled:hover:border-[#EAEDF2] cursor-pointer disabled:cursor-not-allowed"
              title="Halaman sebelumnya"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2]" />
            </button>
            <span className="text-[11.5px] font-medium text-[#8C95A4]">
              Halaman <span className="font-bold text-[#141B29]">{safePage}</span> / {totalPages}
              <span className="mx-1.5 text-[#DCE1EA]">·</span>
              {filtered.length} vendor
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#EAEDF2] bg-white text-[#141B29] transition hover:border-[#84E100] disabled:opacity-30 disabled:hover:border-[#EAEDF2] cursor-pointer disabled:cursor-not-allowed"
              title="Halaman berikutnya"
            >
              <ChevronRight className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        )}
      </section>

      {/* Panel kanan: workspace vendor terpilih */}
      <section className="min-w-0 flex-1 rounded-[20px] border border-[#EAEDF2] bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.02)] sm:p-6">
        {(() => {
          const selected = vendors.find(v => v.id === expandedVendorId) ?? null
          if (!selected) {
            return (
              <div className="h-full min-h-[200px] flex items-center justify-center">
                <p className="text-[12px] text-[#8C95A4] text-center">Klik vendor di panel kiri untuk melihat detail & daftar harga.</p>
              </div>
            )
          }
          const commodities = selected.commodities ?? []
          return (
            <div className="flex flex-col gap-4">
              <h2 className="text-[17px] font-bold text-[#141B29]">Info Vendor</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11.5px] text-[#8C95A4] mb-1">Nama</div>
                  <div className="text-[13.5px] font-bold text-[#141B29]">{selected.companyName}</div>
                </div>
                <div>
                  <div className="text-[11.5px] text-[#8C95A4] mb-1">No. HP</div>
                  <div className="text-[13.5px] font-bold text-[#141B29]">{selected.phoneNumber || '—'}</div>
                </div>
                <div>
                  <div className="text-[11.5px] text-[#8C95A4] mb-1">PIC</div>
                  <div className="text-[13.5px] font-bold text-[#141B29]">{selected.picName || '—'}</div>
                </div>
                <div>
                  <div className="text-[11.5px] text-[#8C95A4] mb-1">Alamat</div>
                  <div className="text-[13.5px] font-bold text-[#141B29] truncate">{selected.address || '—'}</div>
                </div>
              </div>
              <h3 className="text-[13.5px] font-semibold text-[#141B29] pt-2">Daftar harga</h3>
              <div className="rounded-xl bg-[#F5F7FA] px-3 divide-y divide-[#EEF1F6]">
                {commodities.length > 0 ? commodities.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 text-[12.5px]">
                    <span className="font-medium text-[#141B29]">{c.commodity}</span>
                    <span className="font-bold text-[#141B29]">{fmtRupiah(Number(c.price ?? 0))}</span>
                  </div>
                )) : <p className="py-2 text-[11.5px] text-[#8C95A4]">Belum ada daftar harga.</p>}
              </div>
            </div>
          )
        })()}
      </section>

      {/* Modal tambah vendor */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#EAEDF2]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F4F8]">
              <h3 className="text-lg font-bold text-[#141B29]">Add Vendor</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-[#8C95A4] cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleCreate() }} className="mt-4 flex flex-col gap-3.5 text-sm">
              <div>
                <label className="block text-xs font-semibold text-[#5A6577] mb-1">Nama vendor</label>
                <input required value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="CV Sumber Makmur" className="w-full px-3.5 py-2 rounded-xl border border-[#DCE1EA] focus:outline-none focus:border-[#84E100] font-semibold" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5A6577] mb-1">No. HP</label>
                  <input value={form.phoneNumber || ''} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} placeholder="0812…" className="w-full px-3.5 py-2 rounded-xl border border-[#DCE1EA] focus:outline-none focus:border-[#84E100]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A6577] mb-1">PIC (opsional)</label>
                  <input value={form.picName || ''} onChange={(e) => setForm({ ...form, picName: e.target.value })} placeholder="Nama PIC" className="w-full px-3.5 py-2 rounded-xl border border-[#DCE1EA] focus:outline-none focus:border-[#84E100]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5A6577] mb-1">Alamat</label>
                <input value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Jl. Raya …" className="w-full px-3.5 py-2 rounded-xl border border-[#DCE1EA] focus:outline-none focus:border-[#84E100]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5A6577] mb-1">Komoditas & harga</label>
                <div className="flex flex-col gap-2">
                  {commodities.map((row, i) => (
                    <div key={i} className="grid grid-cols-[1fr_110px_32px] gap-2">
                      <input value={row.commodity} onChange={(e) => setCommodities((rows) => rows.map((r, ri) => (ri === i ? { ...r, commodity: e.target.value } : r)))} placeholder="Komoditas" className="w-full px-3 py-2 rounded-xl border border-[#DCE1EA] focus:outline-none focus:border-[#84E100]" />
                      <input type="number" value={row.price} onChange={(e) => setCommodities((rows) => rows.map((r, ri) => (ri === i ? { ...r, price: e.target.value } : r)))} placeholder="0" className="w-full px-3 py-2 rounded-xl border border-[#DCE1EA] focus:outline-none focus:border-[#84E100]" />
                      <button type="button" onClick={() => setCommodities((rows) => rows.filter((_, ri) => ri !== i))} className="w-8 h-8 rounded-lg text-[#8C95A4] hover:bg-slate-100 flex items-center justify-center cursor-pointer" title="Hapus baris"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setCommodities((rows) => [...rows, { commodity: '', price: '' }])} className="self-start text-xs font-semibold text-[#65B300] hover:underline cursor-pointer">+ Tambah komoditas</button>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-full text-xs font-semibold text-[#5A6577] hover:bg-slate-100 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-full bg-[#84E100] hover:bg-[#77CC00] text-[#141B29] text-xs font-bold shadow-sm cursor-pointer">Add Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
