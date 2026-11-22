import { useState, useEffect, useMemo } from 'react'
import {
  LayoutGrid, CheckCircle2, User as UserIcon, Wrench, AlertTriangle,
  Laptop, Armchair, Truck, Hammer,
  Search, Plus, Copy, Check, MapPin, X, Settings, HelpCircle, Phone, MessageSquare,
  Maximize2, Minimize2, LocateFixed,
} from 'lucide-react'
import { assetsApi, membersApi, vendorsApi } from '../../lib/endpoints'

// ============================================================================
// Konstanta gaya Shipbox (referensi FE) — ink #141B29
// ============================================================================
const INK = '#141B29'

const NAV_VIEWS: Array<{ id: string; label: string; icon: any }> = [
  { id: 'all', label: 'Semua Aset', icon: LayoutGrid },
  { id: 'available', label: 'Available', icon: CheckCircle2 },
  { id: 'in_use', label: 'In Use', icon: UserIcon },
  { id: 'under_maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'broken', label: 'Broken', icon: AlertTriangle },
  { id: 'electronics', label: 'Electronics', icon: Laptop },
  { id: 'furniture', label: 'Furniture', icon: Armchair },
  { id: 'vehicles', label: 'Vehicles', icon: Truck },
  { id: 'tools', label: 'Tools', icon: Hammer },
]

const STATUS_BADGE: Record<string, string> = {
  available: 'border-[#84E100] text-[#5c9e00] bg-[#F8FEEF]',
  in_use: 'border-[#38BDF8] text-[#0284C7] bg-[#F0F9FF]',
  under_maintenance: 'border-[#F5A623] text-[#D9820B] bg-[#FFFDF7]',
  broken: 'border-[#ff3b30] text-[#d70015] bg-[#FFF1F0]',
  disposed: 'border-slate-300 text-slate-600 bg-slate-50',
  lost: 'border-[#A855F7] text-[#8B5CF6] bg-[#FAF5FF]',
}

/** Ikon kubus isometrik (identitas kartu aset). */
const CubeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" stroke={INK} strokeWidth="1.75" strokeLinejoin="round" />
    <path d="M12 12L20 7.5M12 12V21M12 12L4 7.5" stroke={INK} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 5.25L16 9.75" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtRupiah(n: number | null): string {
  return n ? `Rp${Number(n).toLocaleString('id-ID')}` : '—'
}

// ============================================================================
// RAIL — navigasi ikon vertikal kiri (brand + filter view + bantuan)
// ============================================================================
function AssetsRail({ activeFilter, onFilterChange, onNotify, onOpenAdd }: { activeFilter: string; onFilterChange: (id: string) => void; onNotify: (msg: string) => void; onOpenAdd: () => void }) {
  return (
    <aside className="w-[68px] sm:w-[74px] bg-white border-r border-[#EAEDF2] py-5 flex flex-col items-center justify-between shrink-0 select-none">
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Brand kubus */}
        <button
          onClick={() => onFilterChange('all')}
          className="p-1.5 rounded-xl hover:bg-slate-50 transition cursor-pointer"
          title="Modul Assets"
        >
          <CubeIcon />
        </button>

        <nav className="flex flex-col items-center gap-3 w-full">
          {NAV_VIEWS.map((item) => {
            const IconComp = item.icon
            const isActive = activeFilter === item.id
            return (
              <button
                key={item.id}
                onClick={() => onFilterChange(item.id)}
                title={item.label}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#84E100] text-[#141B29] shadow-[0_6px_16px_rgba(132,225,0,0.35)]'
                    : 'text-[#8C95A4] hover:text-[#141B29] hover:bg-slate-100/80'
                }`}
              >
                <IconComp className="w-[18px] h-[18px] stroke-[1.9]" />
              </button>
            )
          })}
        </nav>
      </div>

      <div className="flex flex-col items-center gap-3 pt-6">
        <button onClick={() => onOpenAdd()} title="Tambah aset" className="w-9 h-9 rounded-full flex items-center justify-center bg-[#84E100] hover:bg-[#77CC00] text-[#141B29] shadow-[0_4px_12px_rgba(132,225,0,0.3)] transition cursor-pointer">
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
        <button onClick={() => onNotify('Pengaturan modul aset dibuka')} title="Settings" className="w-9 h-9 rounded-full flex items-center justify-center text-[#8C95A4] hover:text-[#141B29] hover:bg-slate-100 transition cursor-pointer">
          <Settings className="w-[18px] h-[18px] stroke-[1.8]" />
        </button>
        <button onClick={() => onNotify('Bantuan & dokumentasi aset')} title="Help" className="w-9 h-9 rounded-full flex items-center justify-center text-[#8C95A4] hover:text-[#141B29] hover:bg-slate-100 transition cursor-pointer">
          <HelpCircle className="w-[18px] h-[18px] stroke-[1.8]" />
        </button>
      </div>
    </aside>
  )
}

// ============================================================================
// ASSET CARD — collapsed (ringkas) / expanded (terpilih)
// ============================================================================
function AssetCard({ asset, maxCost, isSelected, onSelect, onNotify }: { asset: any; maxCost: number; isSelected: boolean; onSelect: () => void; onNotify: (msg: string) => void }) {
  const [copied, setCopied] = useState(false)
  const cost = Number(asset.purchaseCost ?? 0)
  const goldPct = maxCost > 0 ? Math.max(6, Math.round((cost / maxCost) * 100)) : 0
  const badge = STATUS_BADGE[asset.status] ?? 'border-slate-300 text-slate-600 bg-slate-50'
  const statusLabel = String(asset.status ?? '').replace('_', ' ')
  const initials = (asset.assignee || asset.name || '?').slice(0, 2).toUpperCase()
  const copyCode = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(String(asset.assetCode ?? '')).catch(() => {})
    setCopied(true)
    onNotify(`Kode aset ${asset.assetCode} dikopi`)
    setTimeout(() => setCopied(false), 1800)
  }

  if (!isSelected) {
    return (
      <div
        onClick={onSelect}
        className="bg-white rounded-[18px] px-4 py-3.5 border border-[#EDF0F5] hover:border-[#D5DCE6] shadow-[0_2px_10px_rgba(15,23,42,0.02)] hover:shadow-[0_6px_18px_rgba(15,23,42,0.05)] transition-all duration-200 cursor-pointer flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full border border-[#EAEDF2] bg-[#FAFBFD] flex items-center justify-center shrink-0">
            <CubeIcon />
          </div>
          <div className="min-w-0">
            <div className="text-[14.5px] font-bold text-[#141B29] tracking-tight truncate">{asset.name}</div>
            <div className="text-[11px] text-[#8C95A4] truncate">{asset.assetCode} · {asset.location}</div>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-[11px] font-semibold border shrink-0 ${badge}`}>{statusLabel}</span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[20px] p-4 border-[1.75px] border-[#84E100] shadow-[0_10px_28px_rgba(132,225,0,0.08)] transition-all duration-200">
      <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-[#F1F4F8]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full border border-[#EAEDF2] bg-[#FAFBFD] flex items-center justify-center shrink-0">
            <CubeIcon />
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[15px] font-bold text-[#141B29] tracking-tight truncate">{asset.code}</span>
            <button onClick={(e) => { e.stopPropagation(); copyCode() }} title="Kopi kode aset" className="text-[#8C95A4] hover:text-[#65B300] transition cursor-pointer">
              {copied ? <Check className="w-3.5 h-3.5 text-[#65B300]" /> : <Copy className="w-3.5 h-3.5 stroke-[2]" />}
            </button>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-[11px] font-semibold border shrink-0 ${badge}`}>{statusLabel}</span>
      </div>

      <div className="pt-3.5 pb-3 flex items-end justify-between">
        <div>
          <div className="text-[11px] font-medium text-[#8C95A4] mb-0.5">Nilai aset</div>
          <div className="flex items-baseline gap-1">
            <span className="text-[24px] leading-none font-bold text-[#141B29] tracking-tight">{fmtRupiah(cost)}</span>
          </div>
        </div>
        <div className="text-[13px] font-semibold text-[#141B29] pb-0.5">{fmtDate(asset.purchaseDate)}</div>
      </div>

      {/* Bar nilai aset (share dari aset termahal) */}
      <div className="py-2 flex items-center gap-1.5">
        <div className="w-6 h-6 rounded-full bg-[#84E100] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(132,225,0,0.4)]">
          <span className="w-2 h-2 rounded-full bg-white" />
        </div>
        <div className="h-[2.5px] bg-[#84E100] rounded-full transition-all duration-500" style={{ width: `${goldPct}%` }} />
        <div className="flex-1 border-t-[2px] border-dashed border-[#DCE1EA]" />
        <div className="w-6 h-6 rounded-full border border-[#E2E6EE] bg-white flex items-center justify-center text-[#141B29] shrink-0">
          <MapPin className="w-3.5 h-3.5 stroke-[2]" />
        </div>
      </div>

      <div className="pt-1.5 pb-3.5 border-b border-[#F1F4F8] flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12.5px] font-bold text-[#141B29] truncate">{asset.location}</div>
          <div className="text-[11px] text-[#8C95A4] mt-0.5 capitalize">{String(asset.category ?? '')}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[12.5px] font-bold text-[#141B29]">Kondisi</div>
          <div className="text-[11px] text-[#8C95A4] mt-0.5 capitalize">{String(asset.condition ?? '—')}</div>
        </div>
      </div>

      <div className="pt-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="grid w-[38px] h-[38px] shrink-0 place-items-center rounded-full bg-[#E8ECF2] text-[12px] font-bold text-[#141B29] border border-black/5">
            {initials}
          </span>
          <div className="min-w-0">
            <div className="text-[13px] font-bold text-[#141B29] leading-tight truncate">{asset.assignedToName || 'Belum ada PIC'}</div>
            <div className="text-[11px] text-[#8C95A4] mt-0.5">Penanggung jawab</div>
          </div>
        </div>
        <span className="text-[11px] text-[#8C95A4] shrink-0">Serial: {asset.serialNumber || '—'}</span>
      </div>
    </div>
  )
}

// ============================================================================
// LIVE MAP CARD — peta vektor kota dekoratif (persis referensi) dengan pin
// lokasi aset + kontrol zoom / fullscreen / recenter.
// ============================================================================
function LiveMapCard({ asset, onNotify }: { asset: any; onNotify: (msg: string) => void }) {
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const pinX = 250, pinY = 75, truckX = 525, truckY = 205

  const dashedPath = `M ${pinX} ${pinY} L ${pinX + 35} ${pinY - 22} Q ${pinX + 55} ${pinY - 30} ${pinX + 68} ${pinY - 8} L ${truckX - 95} ${truckY + 35} Q ${truckX - 75} ${truckY + 48} ${truckX - 45} ${truckY + 25} L ${truckX} ${truckY}`
  const solidPath = `M ${truckX} ${truckY} Q ${truckX + 65} ${truckY - 45} ${truckX + 165} ${truckY - 35} L ${truckX + 195} ${truckY + 42}`

  return (
    <div
      className={`relative shrink-0 bg-[#F4F5F7] rounded-[20px] border border-[#EAEDF2] overflow-hidden shadow-[0_2px_12px_rgba(15,23,42,0.02)] transition-all duration-300 ${
        isFullscreen ? 'h-[430px]' : 'h-[285px] @2xl:h-[305px]'
      }`}
    >
      <div
        className="w-full h-full transition-transform duration-300 origin-center"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <svg viewBox="0 0 900 320" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
          <defs>
            <filter id="assetMarkerShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#0F172A" floodOpacity="0.16" />
            </filter>
          </defs>

          <rect width="900" height="320" fill="#F2F3F5" />

          <g fill="#E2E3E5">
            <polygon points="0,0 160,0 130,95 0,65" />
            <polygon points="175,0 320,0 280,125 145,100" />
            <polygon points="0,80 125,108 100,190 0,165" />
            <polygon points="0,235 165,280 150,320 0,320" />
            <polygon points="180,285 330,320 165,320" />
            <polygon points="340,0 530,0 490,115 300,130" />
            <polygon points="545,0 740,0 705,120 505,115" />
            <polygon points="755,0 900,0 900,135 720,120" />
            <polygon points="295,148 485,130 455,220 275,205" />
            <polygon points="500,130 695,135 675,235 470,225" />
            <polygon points="710,135 900,150 900,260 690,235" />
            <polygon points="355,255 565,245 550,320 340,320" />
            <polygon points="580,248 770,265 755,320 565,320" />
            <polygon points="785,268 900,275 900,320 770,320" />
          </g>

          <g fill="#9BE248">
            <polygon points="85,12 142,24 128,74 72,60" />
            <polygon points="225,135 282,130 272,175 215,172" />
            <polygon points="195,212 248,225 232,272 178,258" />
            <polygon points="480,148 545,145 538,188 474,185" />
            <polygon points="462,218 525,215 518,248 455,245" />
            <polygon points="622,82 678,86 672,124 615,120" />
            <polygon points="745,25 812,32 798,92 732,84" />
            <polygon points="642,275 712,282 706,320 636,320" />
          </g>

          <path d="M -20,185 C 120,215 240,265 360,235 C 465,208 530,135 655,128 C 765,122 835,142 920,155 L 920,188 C 825,175 755,155 655,160 C 545,166 475,242 360,270 C 235,298 115,248 -20,218 Z" fill="#9CD3F6" />
          <path d="M 335,255 L 305,330 L 332,330 L 362,255 Z" fill="#9CD3F6" />

          <g stroke="#FFFFFF" strokeWidth="2.5" fill="none">
            <line x1="0" y1="72" x2="900" y2="142" />
            <line x1="0" y1="128" x2="720" y2="195" />
            <line x1="168" y1="0" x2="112" y2="320" />
            <line x1="332" y1="0" x2="265" y2="320" />
            <line x1="538" y1="0" x2="462" y2="320" />
            <line x1="748" y1="0" x2="682" y2="320" />
            <line x1="840" y1="0" x2="790" y2="320" />
            <line x1="55" y1="0" x2="25" y2="175" strokeWidth="1.5" />
            <line x1="250" y1="0" x2="210" y2="220" strokeWidth="1.5" />
            <line x1="435" y1="0" x2="395" y2="225" strokeWidth="1.5" />
            <line x1="640" y1="0" x2="595" y2="245" strokeWidth="1.5" />
            <line x1="350" y1="62" x2="890" y2="88" strokeWidth="1.5" />
            <line x1="345" y1="285" x2="895" y2="305" strokeWidth="1.5" />
          </g>

          <path d={dashedPath} fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <path d={solidPath} fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <path d={dashedPath} fill="none" stroke="#141B29" strokeWidth="2.8" strokeDasharray="6 6" strokeLinecap="round" strokeLinejoin="round" />
          <path d={solidPath} fill="none" stroke="#141B29" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />

          <g transform={`translate(${pinX}, ${pinY})`} filter="url(#assetMarkerShadow)">
            <circle cx="0" cy="0" r="15" fill="#FFFFFF" />
            <path d="M0 -6.5C-3.2 -6.5 -5.8 -3.9 -5.8 -0.7C-5.8 3.6 0 8.5 0 8.5C0 8.5 5.8 3.6 5.8 -0.7C5.8 -3.9 3.2 -6.5 0 -6.5ZM0 1.3C-1.1 1.3 -2 0.4 -2 -0.7C-2 -1.8 -1.1 -2.7 0 -2.7C1.1 -2.7 2 -1.8 2 -0.7C2 0.4 1.1 1.3 0 1.3Z" fill="#141B29" />
          </g>

          <g transform={`translate(${truckX}, ${truckY})`} filter="url(#assetMarkerShadow)">
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
      </div>

      {/* Label lokasi aset */}
      <div className="absolute top-3.5 left-3.5 bg-white/95 rounded-full px-3.5 py-1.5 shadow-[0_4px_14px_rgba(15,23,42,0.1)] text-[11.5px] font-semibold text-[#141B29]">
        📍 {asset.location || 'Lokasi aset'}
      </div>

      <button
        onClick={() => setIsFullscreen((prev) => !prev)}
        className="absolute top-3.5 right-3.5 w-9 h-9 rounded-xl bg-white hover:bg-slate-50 text-[#141B29] shadow-[0_4px_14px_rgba(15,23,42,0.1)] flex items-center justify-center transition cursor-pointer"
        title={isFullscreen ? 'Exit Fullscreen' : 'Expand Map'}
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4 stroke-[2]" /> : <Maximize2 className="w-4 h-4 stroke-[2]" />}
      </button>

      <div className="absolute bottom-3.5 right-3.5 flex flex-col gap-2">
        <div className="bg-white rounded-xl shadow-[0_4px_14px_rgba(15,23,42,0.1)] flex flex-col overflow-hidden divide-y divide-[#EEF1F6]">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.4, +(z + 0.15).toFixed(2)))}
            className="w-9 h-8 flex items-center justify-center text-[#141B29] hover:bg-slate-50 font-semibold text-base transition cursor-pointer"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.85, +(z - 0.15).toFixed(2)))}
            className="w-9 h-8 flex items-center justify-center text-[#141B29] hover:bg-slate-50 font-semibold text-base transition cursor-pointer"
            title="Zoom Out"
          >
            −
          </button>
        </div>
        <button
          onClick={() => { setZoomLevel(1); onNotify(`Peta dipusatkan ke ${asset.name || 'lokasi aset'}`) }}
          className="w-9 h-9 rounded-xl bg-white hover:bg-slate-50 text-[#141B29] shadow-[0_4px_14px_rgba(15,23,42,0.1)] flex items-center justify-center transition cursor-pointer"
          title="Pusatkan lokasi aset"
        >
          <LocateFixed className="w-4 h-4 stroke-[2]" />
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// ASSETS CONTENT — frame Shipbox: rail + list panel + workspace
// ============================================================================
export function AssetsContent(_props?: { onClose?: () => void; onMinimize?: () => void }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [assets, setAssets] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast((prev) => (prev === msg ? null : prev)), 2500)
  }

  const loadData = async () => {
    setLoading(true)
    const [res, memRes, supRes] = await Promise.allSettled([assetsApi.list(), membersApi.list({ limit: 100 }), vendorsApi.list()])
    if (res.status === 'fulfilled') {
      const a = res.value?.assets || res.value || []
      setAssets(Array.isArray(a) ? a : [])
    } else { showToast('Gagal memuat data aset') }
    if (memRes.status === 'fulfilled') setMembers(memRes.value?.members ?? memRes.value ?? [])
    if (supRes.status === 'fulfilled') setSuppliers(supRes.value?.vendors ?? supRes.value ?? [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleCreate = async () => {
    try {
      await assetsApi.create(formValues)
      setShowForm(false); setFormValues({}); showToast('Aset baru tersimpan'); loadData()
    } catch { showToast('Gagal menyimpan aset') }
  }

  // Resolve nama PIC dari uuid assignedTo via daftar member
  const memberName = useMemo(() => new Map(members.map((m) => [String(m.userId), String(m.userFullName ?? '')])), [members])
  const supplierName = useMemo(() => new Map(suppliers.map((v) => [String(v.id), String(v.companyName ?? '')])), [suppliers])
  const assetsWithName = useMemo(() => assets.map((a) => ({
    ...a,
    assignedToName: memberName.get(String(a.assignedTo ?? '')) ?? null,
    supplierName: supplierName.get(String(a.supplierVendor ?? '')) ?? null,
  })), [assets, memberName, supplierName])

  const filtered = useMemo(() => {
    const byFilter = activeFilter === 'all'
      ? assetsWithName
      : ['available', 'in_use', 'under_maintenance', 'broken'].includes(activeFilter)
        ? assetsWithName.filter(a => a.status === activeFilter)
        : assetsWithName.filter(a => a.category === activeFilter)
    if (!searchQuery.trim()) return byFilter
    const q = searchQuery.toLowerCase()
    return byFilter.filter(a => `${a.name} ${a.assetCode} ${a.location}`.toLowerCase().includes(q))
  }, [assetsWithName, activeFilter, searchQuery])

  const maxCost = Math.max(1, ...assetsWithName.map((a) => Number(a.purchaseCost ?? 0)))
  const selected = filtered.find(a => a.id === selectedId) ?? filtered[0] ?? null
  const activeFilterLabel = NAV_VIEWS.find(v => v.id === activeFilter)?.label ?? 'Assets'

  return (
    <div className="@container font-jakarta h-full bg-[#F8F9FB] flex overflow-y-auto">
      {/* 1. Rail navigasi kiri */}
      <AssetsRail
        activeFilter={activeFilter}
        onFilterChange={(id) => { setActiveFilter(id); setSelectedId(null) }}
        onNotify={showToast}
        onOpenAdd={() => setShowForm(true)}
      />

      {/* 2. Panel daftar aset */}
      <section className="w-full @3xl:w-[345px] bg-white border-r border-[#EAEDF2] p-5 flex flex-col gap-4 shrink-0">
        <div className="pb-2 border-b border-[#F1F4F8]">
          <h1 className="text-[20px] font-extrabold tracking-tight text-[#141B29] uppercase">ASSETS</h1>
          <p className="text-[11px] text-[#8C95A4] mt-0.5">{activeFilterLabel} · {filtered.length} aset</p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#141B29] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search asset name"
            className="w-full h-[42px] pl-11 pr-9 rounded-full bg-[#F5F7FA] text-[13px] text-[#141B29] placeholder-[#8C95A4] focus:outline-none focus:ring-2 focus:ring-[#84E100] focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C95A4] hover:text-[#141B29] cursor-pointer"
              aria-label="Bersihkan pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="w-full h-[46px] rounded-full bg-[#84E100] hover:bg-[#78CE00] active:scale-[0.99] text-[#141B29] font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_6px_18px_rgba(132,225,0,0.28)] transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Asset</span>
        </button>

        <div className="flex flex-col gap-3.5 pt-1 overflow-y-auto">
          {loading ? (
            <div className="rounded-2xl bg-white/70 h-40 animate-pulse" />
          ) : filtered.length > 0 ? (
            filtered.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                maxCost={maxCost}
                isSelected={selected?.id === asset.id}
                onSelect={() => { setSelectedId(asset.id); showToast(`Melihat aset ${asset.name}`) }}
                onNotify={showToast}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-[#DCE1EA] p-6 text-center text-[13px] text-[#8C95A4]">
              {searchQuery ? `Tidak ada aset untuk "${searchQuery}"` : 'Belum ada aset terdaftar. Klik + Add Asset untuk menambah.'}
            </div>
          )}
        </div>
      </section>

      {/* 3. Workspace kanan: info + spesifikasi + riwayat */}
      {/* 3. Workspace kanan: vendor / info aset */}
      <main className="flex-1 min-w-0 p-5 flex flex-col gap-5 overflow-y-auto bg-[#F8F9FB]">
        {selected ? (
          <>
            <LiveMapCard asset={selected} onNotify={showToast} />

            <div className="grid grid-cols-1 @2xl:grid-cols-12 gap-5 flex-1">
              <div className="@2xl:col-span-6 flex flex-col gap-5">
                {/* Info aset — grid 2x3 ala Shipping Info */}
                <div className="bg-white rounded-[20px] border border-[#EAEDF2] p-5 sm:p-6 shadow-[0_2px_12px_rgba(15,23,42,0.02)]">
                  <h2 className="text-[17px] font-bold text-[#141B29] mb-4">Info Aset</h2>
                  <div className="grid grid-cols-3 gap-3 pb-4">
                    <div className="border-r border-[#EEF1F6] pr-2">
                      <div className="text-[11.5px] text-[#8C95A4] mb-1">Kode</div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13.5px] font-bold text-[#141B29] truncate">{selected.assetCode}</span>
                        <button
                          onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(String(selected.assetCode ?? '')).catch(() => {}); showToast(`Kode ${selected.assetCode} dikopi`) }}
                          className="text-[#141B29] hover:text-[#65B300] transition cursor-pointer"
                          title="Copy kode aset"
                        >
                          <Copy className="w-3.5 h-3.5 stroke-[2]" />
                        </button>
                      </div>
                    </div>
                    <div className="border-r border-[#EEF1F6] px-2">
                      <div className="text-[11.5px] text-[#8C95A4] mb-1">Serial number</div>
                      <div className="text-[13.5px] font-bold text-[#141B29] truncate">{selected.serialNumber || '—'}</div>
                    </div>
                    <div className="pl-2">
                      <div className="text-[11.5px] text-[#8C95A4] mb-1">Kategori</div>
                      <div className="text-[13.5px] font-bold text-[#141B29] capitalize truncate">{String(selected.category ?? '—')}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <div className="border-r border-[#EEF1F6] pr-2">
                      <div className="text-[11.5px] text-[#8C95A4] mb-1">Lokasi</div>
                      <div className="text-[13.5px] font-bold text-[#141B29] truncate">{selected.location}</div>
                    </div>
                    <div className="border-r border-[#EEF1F6] px-2">
                      <div className="text-[11.5px] text-[#8C95A4] mb-1">Tanggal beli</div>
                      <div className="text-[13.5px] font-bold text-[#141B29]">{fmtDate(selected.purchaseDate)}</div>
                    </div>
                    <div className="pl-2">
                      <div className="text-[11.5px] text-[#8C95A4] mb-1">Nilai</div>
                      <div className="text-[13.5px] font-bold text-[#141B29]">{fmtRupiah(Number(selected.purchaseCost ?? 0))}</div>
                    </div>
                  </div>
                </div>

                {/* PIC info ala Driver Info — dengan placeholder */}
                <div className="bg-white rounded-[20px] border border-[#EAEDF2] p-5 sm:p-6 shadow-[0_2px_12px_rgba(15,23,42,0.02)] flex flex-col justify-between h-full">
                  <div>
                    <h2 className="text-[17px] font-bold text-[#141B29] mb-4">PIC Info</h2>
                    <div className="flex items-center justify-between gap-3 pb-5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="rounded-full overflow-hidden flex items-end justify-center shrink-0 border border-black/5 w-[44px] h-[44px]" style={{ backgroundColor: selected.assignedToName ? '#D5E8FF' : '#F8DF8B' }}>
                          <svg viewBox="0 0 64 64" className="w-full h-full">
                            <path d="M14 64C14 53 22 48 32 48C42 48 50 53 50 64" fill="#2A3447" />
                            <rect x="27" y="40" width="10" height="10" rx="4" fill="#E0A982" />
                            <circle cx="20" cy="30" r="3.5" fill="#D99B72" />
                            <circle cx="44" cy="30" r="3.5" fill="#D99B72" />
                            <rect x="21" y="16" width="22" height="27" rx="11" fill="#E8B48E" />
                            <path d="M20 26C20 16 25 12 32 12C39 12 44 16 44 26C44 22 40 19 32 19C24 19 20 22 20 26Z" fill="#231F20" />
                            <path d="M21 31C21 39 26 44 32 44C38 44 43 39 43 31C41 35 37 37 32 37C27 37 23 35 21 31Z" fill="#231F20" opacity="0.88" />
                            <circle cx="27.5" cy="28" r="1.6" fill="#141B29" />
                            <circle cx="36.5" cy="28" r="1.6" fill="#141B29" />
                            <path d="M28.5 34.5C30 36 34 36 35.5 34.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="text-[14px] font-bold text-[#141B29] truncate">{selected.assignedToName || 'Belum ada PIC'}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`w-2 h-2 rounded-full ${selected.assignedToName ? 'bg-[#22C55E]' : 'bg-[#C4C7CE]'}`} />
                            <span className="text-[11.5px] font-medium text-[#5A6577]">{selected.assignedToName ? 'Ditugaskan' : 'Belum ditugaskan'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => showToast(selected.assignedToName ? `Menghubungi ${selected.assignedToName}…` : 'PIC belum ditugaskan')}
                          className="w-10 h-10 rounded-full border border-[#E5E9F0] hover:border-[#84E100] hover:bg-[#F8FEEF] text-[#141B29] flex items-center justify-center transition cursor-pointer"
                          title="Hubungi PIC"
                        >
                          <Phone className="w-4 h-4 stroke-[1.8]" />
                        </button>
                        <button
                          onClick={() => showToast(selected.assignedToName ? `Pesan untuk ${selected.assignedToName} dibuka` : 'PIC belum ditugaskan')}
                          className="w-10 h-10 rounded-full border border-[#E5E9F0] hover:border-[#84E100] hover:bg-[#F8FEEF] text-[#141B29] flex items-center justify-center transition cursor-pointer"
                          title="Pesan PIC"
                        >
                          <MessageSquare className="w-4 h-4 stroke-[1.8]" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <div className="border-r border-[#EEF1F6] pr-2">
                      <div className="text-[11.5px] text-[#8C95A4] mb-1">Kondisi</div>
                      <div className="text-[13.5px] font-bold text-[#141B29] capitalize">{String(selected.condition ?? '—')}</div>
                    </div>
                    <div className="border-r border-[#EEF1F6] px-2">
                      <div className="text-[11.5px] text-[#8C95A4] mb-1">Departemen</div>
                      <div className="text-[13.5px] font-bold text-[#141B29] truncate">{selected.department || '—'}</div>
                    </div>
                    <div className="pl-2">
                      <div className="text-[11.5px] text-[#8C95A4] mb-1">Status</div>
                      <div className="text-[13.5px] font-bold text-[#141B29] capitalize">{String(selected.status ?? '').replace('_', ' ')}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="@2xl:col-span-6">
                {/* Riwayat aset — timeline */}
                <div className="bg-white rounded-[20px] border border-[#EAEDF2] p-5 sm:p-6 shadow-[0_2px_12px_rgba(15,23,42,0.02)] flex flex-col justify-between h-full">
                  <h2 className="text-[17px] font-bold text-[#141B29] mb-5">Riwayat aset</h2>
                  <div className="flex flex-col flex-1">
                    <div className="relative flex items-start gap-3.5 pb-5">
                      <div className="relative flex flex-col items-center shrink-0 pt-0.5">
                        <div className="w-[22px] h-[22px] rounded-full bg-[#84E100] flex items-center justify-center z-10 shadow-[0_2px_8px_rgba(132,225,0,0.3)]">
                          <span className="w-2 h-2 rounded-full bg-white" />
                        </div>
                        <div className="w-[2px] h-[44px] border-l-[2px] border-dashed border-[#84E100] my-0.5" />
                      </div>
                      <div className="w-[92px] shrink-0">
                        <div className="text-[12.5px] font-bold text-[#141B29] leading-snug">{fmtDate(selected.purchaseDate)}</div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-bold text-[#141B29] leading-snug">Aset dibeli</div>
                        <div className="text-[11.5px] text-[#8C95A4] mt-0.5 leading-snug">{selected.location} · {fmtRupiah(Number(selected.purchaseCost ?? 0))}</div>
                      </div>
                    </div>
                    <div className="relative flex items-start gap-3.5 pb-5 last:pb-0">
                      <div className="relative flex flex-col items-center shrink-0 pt-0.5">
                        <div className="w-[22px] h-[22px] rounded-full border border-[#DCE1EA] bg-white flex items-center justify-center z-10 text-[#141B29]">
                          <MapPin className="w-3 h-3 stroke-[2]" />
                        </div>
                      </div>
                      <div className="w-[92px] shrink-0">
                        <div className="text-[12.5px] font-bold text-[#141B29] leading-snug">Sekarang</div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-bold text-[#141B29] leading-snug capitalize">{String(selected.status ?? '').replace('_', ' ')}</div>
                        <div className="text-[11.5px] text-[#8C95A4] mt-0.5 leading-snug">Riwayat perawatan akan tampil di sini.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Map tetap tampil sebagai showpiece walau belum ada aset */}
            <LiveMapCard asset={{ location: null, name: '' }} onNotify={showToast} />
            <div className="rounded-2xl border border-dashed border-[#DCE1EA] bg-white p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-[#F8FEEF] flex items-center justify-center mb-3"><CubeIcon /></div>
              <div className="text-[15px] font-bold text-[#141B29] mb-1">Belum ada aset terdaftar</div>
              <p className="text-[12.5px] text-[#8C95A4] leading-relaxed">Tambahkan aset pertama lewat tombol <span className="font-semibold">+ Add Asset</span> di panel kiri. Detail, PIC, dan riwayat akan tampil di sini.</p>
            </div>
          </div>
        )}
      </main>

      {/* Modal tambah aset */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#EAEDF2]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F4F8]">
              <h3 className="text-lg font-bold text-[#141B29]">Add Asset</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-[#8C95A4] cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleCreate() }} className="mt-4 flex flex-col gap-3.5 text-sm">
              <div>
                <label className="block text-xs font-semibold text-[#5A6577] mb-1">Nama aset</label>
                <input required value={formValues.name || ''} onChange={(e) => setFormValues({ ...formValues, name: e.target.value })} placeholder="Laptop ASUS" className="w-full px-3.5 py-2 rounded-xl border border-[#DCE1EA] focus:outline-none focus:border-[#84E100] font-semibold" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5A6577] mb-1">Kode aset</label>
                  <input required value={formValues.assetCode || ''} onChange={(e) => setFormValues({ ...formValues, assetCode: e.target.value })} placeholder="AST-001" className="w-full px-3.5 py-2 rounded-xl border border-[#DCE1EA] focus:outline-none focus:border-[#84E100]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A6577] mb-1">Kategori</label>
                  <select value={formValues.category || ''} onChange={(e) => setFormValues({ ...formValues, category: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-[#DCE1EA] focus:outline-none focus:border-[#84E100]">
                    <option value="">Pilih…</option>
                    <option value="electronics">Electronics</option>
                    <option value="furniture">Furniture</option>
                    <option value="vehicles">Vehicles</option>
                    <option value="tools">Tools</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5A6577] mb-1">Lokasi</label>
                  <input value={formValues.location || ''} onChange={(e) => setFormValues({ ...formValues, location: e.target.value })} placeholder="Kantor Pusat" className="w-full px-3.5 py-2 rounded-xl border border-[#DCE1EA] focus:outline-none focus:border-[#84E100]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A6577] mb-1">Status</label>
                  <select value={formValues.status || ''} onChange={(e) => setFormValues({ ...formValues, status: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-[#DCE1EA] focus:outline-none focus:border-[#84E100]">
                    <option value="available">Available</option>
                    <option value="in_use">In Use</option>
                    <option value="under_maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5A6577] mb-1">Supplier (dari Procurement)</label>
                <select value={formValues.supplierVendor || ''} onChange={(e) => setFormValues({ ...formValues, supplierVendor: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-[#DCE1EA] focus:outline-none focus:border-[#84E100]">
                  <option value="">Pilih supplier…</option>
                  {suppliers.map((v) => <option key={v.id} value={v.id}>{v.companyName}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-full text-xs font-semibold text-[#5A6577] hover:bg-slate-100 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-full bg-[#84E100] hover:bg-[#77CC00] text-[#141B29] text-xs font-bold shadow-sm cursor-pointer">Add Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Toast ala Shipbox */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#141B29] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#84E100]" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  )
}
