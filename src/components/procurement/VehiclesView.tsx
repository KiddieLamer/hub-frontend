import { useEffect, useMemo, useState } from 'react'
import { Search, Plus, X, Truck } from 'lucide-react'
import { assetsApi } from '../../lib/endpoints'
import {
  ShipboxMapCard,
  ShipboxExpandableCard,
  ShipboxProfileCard,
  ShipboxStatusPill,
  ShipboxEmptyState,
  themeForStatus,
} from '../shipbox/cards'

// ============================================================================
// VEHICLES VIEW — kendaraan operasional di modul Procurement.
// Data = aset kategori 'vehicle' via backend Assets API (GET/POST /api/assets).
// UI dibangun penuh dari Shipbox Card Library (kosong & terisi otomatis).
// ============================================================================

type Vehicle = Record<string, any>

const STATUS_LABEL: Record<string, string> = {
  available: 'Available',
  in_use: 'In Use',
  under_maintenance: 'Maintenance',
  broken: 'Broken',
  disposed: 'Disposed',
  lost: 'Lost',
}

// Koordinat marker peta deterministik dari id (posisi stabil per kendaraan).
function coordsFor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return {
    truckX: 180 + (h % 480),
    truckY: 80 + ((h >> 8) % 160),
    pinX: 120 + ((h >> 4) % 220),
    pinY: 180 + ((h >> 12) % 100),
  }
}

// ---------------------------------------------------------------------------
// Kanvas kota vektor ala Shipbox + rute + marker kendaraan aktif (children
// untuk ShipboxMapCard).
// ---------------------------------------------------------------------------
function CityMapCanvas({ vehicle }: { vehicle: Vehicle | null }) {
  const c = vehicle ? coordsFor(String(vehicle.id ?? vehicle.name ?? 'x')) : { truckX: 525, truckY: 205, pinX: 250, pinY: 75 }
  const route = `M ${c.pinX} ${c.pinY} L ${c.pinX + 35} ${c.pinY - 22} Q ${c.pinX + 55} ${c.pinY - 30} ${c.pinX + 68} ${c.pinY - 8} L ${c.truckX - 95} ${c.truckY + 35} Q ${c.truckX - 75} ${c.truckY + 48} ${c.truckX - 45} ${c.truckY + 25} L ${c.truckX} ${c.truckY}`
  return (
    <svg viewBox="0 0 900 320" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <filter id="vehicleMarkerShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#0F172A" floodOpacity="0.16" />
        </filter>
      </defs>
      <rect width="900" height="320" fill="#F2F3F5" />
      <g fill="#E2E3E5">
        <polygon points="0,0 160,0 130,95 0,65" /><polygon points="175,0 320,0 280,125 145,100" />
        <polygon points="0,80 125,108 100,190 0,165" /><polygon points="0,235 165,280 150,320 0,320" />
        <polygon points="180,285 330,320 165,320" /><polygon points="340,0 530,0 490,115 300,130" />
        <polygon points="545,0 740,0 705,120 505,115" /><polygon points="755,0 900,0 900,135 720,120" />
        <polygon points="295,148 485,130 455,220 275,205" /><polygon points="500,130 695,135 675,235 470,225" />
        <polygon points="710,135 900,150 900,260 690,235" /><polygon points="355,255 565,245 550,320 340,320" />
        <polygon points="580,248 770,265 755,320 565,320" /><polygon points="785,268 900,275 900,320 770,320" />
      </g>
      <g fill="#9BE248">
        <polygon points="85,12 142,24 128,74 72,60" /><polygon points="225,135 282,130 272,175 215,172" />
        <polygon points="195,212 248,225 232,272 178,258" /><polygon points="480,148 545,145 538,188 474,185" />
        <polygon points="462,218 525,215 518,248 455,245" /><polygon points="622,82 678,86 672,124 615,120" />
        <polygon points="745,25 812,32 798,92 732,84" /><polygon points="642,275 712,282 706,320 636,320" />
      </g>
      <path d="M -20,185 C 120,215 240,265 360,235 C 465,208 530,135 655,128 C 765,122 835,142 920,155 L 920,188 C 825,175 755,155 655,160 C 545,166 475,242 360,270 C 235,298 115,248 -20,218 Z" fill="#9CD3F6" />
      <path d="M 335,255 L 305,330 L 332,330 L 362,255 Z" fill="#9CD3F6" />
      <g stroke="#FFFFFF" strokeWidth="2.5" fill="none">
        <line x1="0" y1="72" x2="900" y2="142" /><line x1="0" y1="128" x2="720" y2="195" />
        <line x1="168" y1="0" x2="112" y2="320" /><line x1="332" y1="0" x2="265" y2="320" />
        <line x1="538" y1="0" x2="462" y2="320" /><line x1="748" y1="0" x2="682" y2="320" />
        <line x1="840" y1="0" x2="790" y2="320" />
        <line x1="55" y1="0" x2="25" y2="175" strokeWidth="1.5" /><line x1="250" y1="0" x2="210" y2="220" strokeWidth="1.5" />
        <line x1="435" y1="0" x2="395" y2="225" strokeWidth="1.5" /><line x1="640" y1="0" x2="595" y2="245" strokeWidth="1.5" />
        <line x1="350" y1="62" x2="890" y2="88" strokeWidth="1.5" /><line x1="345" y1="285" x2="895" y2="305" strokeWidth="1.5" />
      </g>
      {/* Rute ke posisi kendaraan */}
      <path d={route} fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d={route} fill="none" stroke="#141B29" strokeWidth="2.8" strokeDasharray="6 6" strokeLinecap="round" strokeLinejoin="round" />
      {/* Base pin */}
      <g transform={`translate(${c.pinX}, ${c.pinY})`} filter="url(#vehicleMarkerShadow)">
        <circle cx="0" cy="0" r="15" fill="#FFFFFF" />
        <path d="M0 -6.5C-3.2 -6.5 -5.8 -3.9 -5.8 -0.7C-5.8 3.6 0 8.5 0 8.5C0 8.5 5.8 3.6 5.8 -0.7C5.8 -3.9 3.2 -6.5 0 -6.5ZM0 1.3C-1.1 1.3 -2 0.4 -2 -0.7C-2 -1.8 -1.1 -2.7 0 -2.7C1.1 -2.7 2 -1.8 2 -0.7C2 0.4 1.1 1.3 0 1.3Z" fill="#141B29" />
      </g>
      {/* Marker kendaraan aktif (lime) */}
      <g transform={`translate(${c.truckX}, ${c.truckY})`} filter="url(#vehicleMarkerShadow)">
        <circle cx="0" cy="0" r="24" fill="#84E100" fillOpacity="0.28" />
        <circle cx="0" cy="0" r="17" fill="#84E100" stroke="#FFFFFF" strokeWidth="2" />
        <g transform="translate(-9, -9)">
          <rect x="2" y="4" width="9.5" height="7.5" rx="1" stroke="#141B29" strokeWidth="1.5" fill="none" />
          <path d="M11.5 7H14.5L16.5 9.2V11.5H11.5V7Z" stroke="#141B29" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
          <circle cx="5.5" cy="13" r="1.5" fill="#141B29" />
          <circle cx="14" cy="13" r="1.5" fill="#141B29" />
        </g>
      </g>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// VehiclesView utama.
// ---------------------------------------------------------------------------
export default function VehiclesView({ onNotify }: { onNotify: (msg: string) => void }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', serialNumber: '', brandModel: '', location: '', purchaseCost: '' })

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await assetsApi.list({ category: 'vehicle' })
      const a = res?.assets || res || []
      setVehicles(Array.isArray(a) ? a : [])
    } catch {
      onNotify('Gagal memuat kendaraan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return vehicles
    const q = searchQuery.toLowerCase()
    return vehicles.filter((v) => `${v.name} ${v.serialNumber ?? ''} ${v.brandModel ?? ''}`.toLowerCase().includes(q))
  }, [vehicles, searchQuery])

  const selected = vehicles.find((v) => String(v.id) === selectedId) ?? null

  const handleCreate = async () => {
    try {
      await assetsApi.create({
        assetCode: `VEH-${Date.now().toString().slice(-6)}`,
        name: form.name,
        category: 'vehicle',
        serialNumber: form.serialNumber || undefined,
        brandModel: form.brandModel || undefined,
        location: form.location || 'Gudang Utama',
        purchaseCost: form.purchaseCost ? Number(form.purchaseCost) : undefined,
        status: 'available',
        condition: 'good',
      })
      setShowForm(false)
      setForm({ name: '', serialNumber: '', brandModel: '', location: '', purchaseCost: '' })
      onNotify('Kendaraan baru tersimpan')
      loadData()
    } catch {
      onNotify('Gagal menyimpan kendaraan')
    }
  }

  const fmtRupiah = (n: any) => (n ? `Rp${Number(n).toLocaleString('id-ID')}` : '—')

  return (
    <div className="font-jakarta flex flex-col gap-5 md:flex-row">
      {/* Panel kiri: daftar kendaraan */}
      <section className="flex w-full shrink-0 flex-col gap-4 rounded-[20px] border border-[#EAEDF2] bg-white p-5 md:w-[345px] md:rounded-none md:border-r md:border-y-0 md:border-l-0">
        <div className="border-b border-[#F1F4F8] pb-2">
          <h1 className="text-[20px] font-extrabold uppercase tracking-tight text-[#141B29]">VEHICLES</h1>
          <p className="mt-0.5 text-[11px] text-[#8C95A4]">Vehicles · {vehicles.length} aset</p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 stroke-[2] text-[#141B29]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vehicle name"
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
          <span>Add Vehicle</span>
        </button>

        <div className="flex max-h-[480px] flex-col gap-3.5 overflow-y-auto pr-1 pt-1">
          {loading ? (
            <div className="h-40 animate-pulse rounded-2xl bg-white/70" />
          ) : filtered.length > 0 ? (
            filtered.map((v) => {
              const isSel = String(v.id) === selectedId
              const st = String(v.status || 'available')
              return (
                <ShipboxExpandableCard
                  key={String(v.id)}
                  icon={<Truck className="h-4 w-4" />}
                  title={v.name}
                  expanded={isSel}
                  onToggle={() => setSelectedId(isSel ? null : String(v.id))}
                  pill={
                    <ShipboxStatusPill
                      status={st}
                      label={STATUS_LABEL[st] ?? st}
                      theme={themeForStatus(st)}
                    />
                  }
                >
                  {/* Expanded ala ShipmentCard: info ringkas kendaraan */}
                  <div className="flex items-start justify-between gap-3 border-b border-[#F1F4F8] pb-3">
                    <div>
                      <div className="text-[11px] text-[#8C95A4]">Nomor polisi</div>
                      <div className="text-[12.5px] font-bold text-[#141B29]">{v.serialNumber || '—'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-[#8C95A4]">Merk & tipe</div>
                      <div className="text-[12.5px] font-bold text-[#141B29]">{v.brandModel || '—'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-[#8C95A4]">Lokasi</div>
                      <div className="text-[12.5px] font-bold text-[#141B29]">{v.location || '—'}</div>
                    </div>
                  </div>
                </ShipboxExpandableCard>
              )
            })
          ) : (
            <ShipboxEmptyState
              icon={<Truck className="h-5 w-5" />}
              title={searchQuery ? `Tidak ada "${searchQuery}"` : 'Belum ada kendaraan'}
              description="Klik + Add Vehicle untuk mendaftarkan kendaraan operasional pertama."
              compact
            />
          )}
        </div>
      </section>

      {/* Workspace kanan: peta (ShipboxMapCard) + detail (ShipboxProfileCard) / empty */}
      <main className="flex min-w-0 flex-1 flex-col gap-5 overflow-y-auto rounded-[20px] bg-[#F8F9FB] p-5 md:rounded-none md:rounded-r-[20px]">
        <ShipboxMapCard
          badge={selected?.location || 'Lokasi kendaraan'}
          onRecenter={() => onNotify('Peta dipusatkan ke kendaraan terpilih')}
        >
          <CityMapCanvas vehicle={selected} />
        </ShipboxMapCard>

        {selected ? (
          <ShipboxProfileCard
            title="Info Kendaraan"
            avatar={
              <div className="flex h-11 w-11 items-end justify-center overflow-hidden rounded-full border border-black/5 bg-[#F8DF8B]">
                <Truck className="mb-2 h-5 w-5 text-[#141B29]" />
              </div>
            }
            name={selected.name}
            subtitle={selected.location || '—'}
            online={selected.status === 'in_use'}
            actions={
              <ShipboxStatusPill
                status={String(selected.status || 'available')}
                label={STATUS_LABEL[selected.status] ?? selected.status}
                theme={themeForStatus(selected.status)}
              />
            }
            specs={[
              { label: 'Nomor polisi', value: selected.serialNumber || '—' },
              { label: 'Merk & tipe', value: selected.brandModel || '—' },
              { label: 'Kondisi', value: selected.condition || '—' },
              { label: 'Kode aset', value: selected.assetCode || '—' },
              { label: 'Nilai perolehan', value: fmtRupiah(selected.purchaseCost) },
              { label: 'Terakhir diubah', value: selected.updatedAt ? new Date(selected.updatedAt).toLocaleDateString('id-ID') : '—' },
            ]}
          />
        ) : (
          <ShipboxEmptyState
            icon={<Truck className="h-5 w-5" />}
            title="Belum ada kendaraan dipilih"
            description="Pilih kendaraan di panel kiri untuk melihat detail & lokasinya di peta, atau tambahkan lewat + Add Vehicle."
          />
        )}
      </main>

      {/* Modal tambah kendaraan */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-3xl border border-[#EAEDF2] bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#F1F4F8] pb-3">
              <h3 className="text-lg font-bold text-[#141B29]">Add Vehicle</h3>
              <button onClick={() => setShowForm(false)} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#8C95A4] hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleCreate() }} className="mt-4 flex flex-col gap-3.5 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#5A6577]">Nama kendaraan</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dump Truck 01" className="w-full rounded-xl border border-[#DCE1EA] px-3.5 py-2 font-semibold focus:border-[#84E100] focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#5A6577]">Nomor polisi</label>
                  <input value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} placeholder="B 9142 KYZ" className="w-full rounded-xl border border-[#DCE1EA] px-3.5 py-2 focus:border-[#84E100] focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#5A6577]">Merk & tipe</label>
                  <input value={form.brandModel} onChange={(e) => setForm({ ...form, brandModel: e.target.value })} placeholder="Hino Dutro 130" className="w-full rounded-xl border border-[#DCE1EA] px-3.5 py-2 focus:border-[#84E100] focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#5A6577]">Lokasi / base</label>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Gudang Utama" className="w-full rounded-xl border border-[#DCE1EA] px-3.5 py-2 focus:border-[#84E100] focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#5A6577]">Nilai perolehan (opsional)</label>
                <input type="number" min="0" value={form.purchaseCost} onChange={(e) => setForm({ ...form, purchaseCost: e.target.value })} placeholder="0" className="w-full rounded-xl border border-[#DCE1EA] px-3.5 py-2 focus:border-[#84E100] focus:outline-none" />
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button type="button" onClick={() => setShowForm(false)} className="cursor-pointer rounded-full px-4 py-2 text-xs font-semibold text-[#5A6577] hover:bg-slate-100">Cancel</button>
                <button type="submit" className="cursor-pointer rounded-full bg-[#84E100] px-5 py-2 text-xs font-bold text-[#141B29] shadow-sm transition hover:bg-[#77CC00]">Add Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
