import { useState } from 'react'
import {
  LayoutGrid,
  Users,
  Truck,
  ClipboardList,
  FileText,
  Boxes,
  BookOpen,
  Settings,
  HelpCircle,
  Headphones,
} from 'lucide-react'
import VendorsView from './VendorsView'
import VehiclesView from './VehiclesView'
import PurchaseRequestsView from './PurchaseRequestsView'
import ProcDashboardView from './ProcDashboardView'
import ProcessDocsView from './ProcessDocsView'

// ============================================================================
// Procurement window — shell ala Shipbox (rail sidebar vertikal + workspace).
// ============================================================================

type TabId = 'dashboard' | 'vendors' | 'vehicles' | 'purchase-requests' | 'purchase-orders' | 'stock' | 'process-docs'

const NAV_ITEMS: Array<{ id: TabId; icon: typeof LayoutGrid; label: string; desc: string }> = [
  { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard', desc: 'Ringkasan vendor, PO, dan arus pengadaan.' },
  { id: 'vendors', icon: Users, label: 'Vendors', desc: 'Daftar vendor & daftar harga komoditas (20 per halaman).' },
  { id: 'vehicles', icon: Truck, label: 'Vehicles', desc: 'Kendaraan operasional — aset kategori vehicle + lokasi di peta.' },
  { id: 'purchase-requests', icon: ClipboardList, label: 'PR', desc: 'Ajukan kebutuhan multi-item dengan budget check departemen.' },
  { id: 'purchase-orders', icon: FileText, label: 'PO', desc: 'Buat dan pantau purchase orders.' },
  { id: 'stock', icon: Boxes, label: 'Stock', desc: 'Pantau stok barang dan pergerakannya.' },
  { id: 'process-docs', icon: BookOpen, label: 'Process Docs', desc: 'Dokumentasi proses PR → PO → GR → Payment.' },
]

function ProcLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17.5 4.5C14.8 4.5 13 6.8 13.7 9.4L15.4 15.6L9.2 13.9C6.6 13.2 4.3 15 4.3 17.7C4.3 20.1 6.1 22.1 8.5 22.4L14.8 23.2L11.7 28.7C10.4 31 11.8 33.8 14.4 34.2C16.7 34.6 18.9 33.1 19.4 30.8L20.8 24.6L25.6 28.7C27.6 30.4 30.7 29.6 31.7 27.1C32.6 24.9 31.6 22.4 29.4 21.4L23.6 18.8L29.1 15.5C31.3 14.2 31.7 11.1 29.9 9.2C28.2 7.5 25.5 7.5 23.8 9.2L19.4 13.7L20.8 7.5C21.3 5.2 19.8 4.5 17.5 4.5Z"
        fill="#141414"
      />
      <circle cx="18" cy="18.5" r="2.6" fill="#FAF9F6" />
    </svg>
  )
}

function RailSidebar({
  activeTab,
  setActiveTab,
  onNotify,
}: {
  activeTab: TabId
  setActiveTab: (id: TabId) => void
  onNotify: (msg: string) => void
}) {
  return (
    <aside className="flex w-[68px] shrink-0 select-none flex-col items-center justify-between border-r border-[#EAEDF2] bg-white py-5">
      <div className="flex w-full flex-col items-center gap-7">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="cursor-pointer rounded-xl p-1.5 transition hover:bg-slate-50"
          title="Procurement"
        >
          <ProcLogo />
        </button>

        <nav className="flex w-full flex-col items-center gap-3.5">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  if (item.id !== activeTab) onNotify(`Buka ${item.label}`)
                }}
                title={`${item.label} — ${item.desc}`}
                className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-[#84E100] text-[#141B29] shadow-[0_6px_16px_rgba(132,225,0,0.35)]'
                    : 'text-[#8C95A4] hover:bg-slate-100/80 hover:text-[#141B29]'
                }`}
              >
                <item.icon className="h-[18px] w-[18px] stroke-[1.9]" />
              </button>
            )
          })}
        </nav>
      </div>

      <div className="flex flex-col items-center gap-3.5 pt-6">
        <button
          onClick={() => onNotify('Pengaturan procurement dibuka')}
          title="Settings"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#8C95A4] transition hover:bg-slate-100 hover:text-[#141B29]"
        >
          <Settings className="h-[18px] w-[18px] stroke-[1.8]" />
        </button>
        <button
          onClick={() => onNotify('Help & dokumentasi proses dibuka')}
          title="Help"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#8C95A4] transition hover:bg-slate-100 hover:text-[#141B29]"
        >
          <HelpCircle className="h-[18px] w-[18px] stroke-[1.8]" />
        </button>
        <button
          onClick={() => onNotify('Dispatch support terhubung')}
          title="Support"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#8C95A4] transition hover:bg-slate-100 hover:text-[#141B29]"
        >
          <Headphones className="h-[18px] w-[18px] stroke-[1.8]" />
        </button>
        <div
          className="mt-1 grid h-9 w-9 place-items-center rounded-full bg-[#F5F7FA] ring-2 ring-[#EAEDF2] transition hover:ring-[#84E100]"
          title="Account"
        >
          <span className="text-[12px] font-bold text-[#141B29]">U</span>
        </div>
      </div>
    </aside>
  )
}

function DashboardTab({ onNotify }: { onNotify: (msg: string) => void }) {
  return <ProcDashboardView onNotify={onNotify} />
}

function SimpleListTab({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-[20px] border border-[#EAEDF2] bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.02)]">
      <h2 className="text-[17px] font-bold text-[#141B29]">{title}</h2>
      <p className="mt-1 max-w-md text-[13px] leading-relaxed text-[#8C95A4]">{desc}</p>
      <div className="mt-5 rounded-2xl border border-dashed border-[#DCE1EA] p-8 text-center text-[13px] text-[#8C95A4]">
        View ini menyusul — data tersedia via API tapi UI detail masih dalam pengembangan.
      </div>
    </div>
  )
}

export function ProcurementDashboardContent() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [toast, setToast] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast((prev) => (prev === msg ? null : prev)), 2500)
  }

  const active = NAV_ITEMS.find((n) => n.id === activeTab)!

  return (
    <div className="font-jakarta h-full overflow-y-auto bg-[#F8F9FB]" style={{ borderRadius: 12 }}>
      <div className="flex min-h-full">
        {/* Rail sidebar ala Shipbox */}
        <RailSidebar activeTab={activeTab} setActiveTab={setActiveTab} onNotify={showToast} />

        {/* Workspace */}
        <div className="flex min-w-0 flex-1 flex-col gap-5 p-4 md:p-5">
          {/* Header halaman */}
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-[20px] font-extrabold uppercase tracking-tight text-[#141B29]">
                {active.label}
              </h1>
              <p className="text-[11.5px] text-[#8C95A4]">{active.desc}</p>
            </div>
          </header>

          {activeTab === 'dashboard' && <DashboardTab onNotify={showToast} />}
          {activeTab === 'vendors' && <VendorsView onNotify={showToast} />}
          {activeTab === 'vehicles' && <VehiclesView onNotify={showToast} />}
          {activeTab === 'purchase-requests' && <PurchaseRequestsView onNotify={showToast} />}
          {activeTab === 'process-docs' && <ProcessDocsView onNotify={showToast} />}
          {activeTab === 'purchase-orders' && (
            <SimpleListTab
              title="Purchase Orders"
              desc="Daftar PO tersambung ke backend (GET /api/procurement/purchase-orders). UI tabel lengkap menyusul di roadmap procurement."
            />
          )}
          {activeTab === 'stock' && (
            <SimpleListTab
              title="Stock"
              desc="Pergerakan stok tersambung ke backend (GET /api/stock-movements). UI tabel lengkap menyusul di roadmap procurement."
            />
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#141B29] px-4 py-2.5 text-xs font-semibold text-white shadow-lg">
          <span className="h-2 w-2 rounded-full bg-[#84E100]" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  )
}
