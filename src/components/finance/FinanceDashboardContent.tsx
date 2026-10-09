import { useState } from 'react'
import type { SVGProps } from 'react'
import { pageTables } from './pageTables'
import { ItemView, rowActions } from './views'
import CashFlowDashboard from './CashFlowDashboard'

// ======================================================================
// NAVIGATION (pills)
// ======================================================================
type NavGroup = { id: string; label: string; items: string[] }

const navGroups: NavGroup[] = [
  { id: 'planning', label: 'Planning', items: ['Budget Planning', 'Scenario & Forecast'] },
  {
    id: 'cash',
    label: 'Cash & Cost',
    items: ['Expenses', 'Payables & Recurring', 'Cash Flow', 'Cost Analysis', 'Bank Reconciliation', 'Utilities'],
  },
  { id: 'revenue', label: 'Revenue', items: ['Receivables', 'Invoice Builder', 'Deposit & Advance'] },
  {
    id: 'accounting',
    label: 'Accounting',
    items: ['P&L', 'Balance Sheet', 'Company Report', 'Accounting', 'Inventory Valuation', 'HPP / COGS Review', 'Gross Margin', 'Fixed Assets'],
  },
  { id: 'tax', label: 'Tax', items: ['Tax Setup & Calculator', 'Tax Report', 'Payroll Tax', 'Withholding'] },
  { id: 'payroll', label: 'Payroll', items: ['Payroll Run', 'Components & Rules', 'Compensation Review'] },
  { id: 'investment', label: 'Investment', items: ['Business Case', 'Risk & Decision'] },
]

// ======================================================================
// PAGE DATA (mock) — replace with API data later
// kpi: [label, value, delta?]  delta starting with "-" is shown as negative
// ======================================================================
type Kpi = [string, string, string?]
type PageDef = { desc: string; action: string; kpis: Kpi[] }

const pages: Record<string, PageDef> = {
  'Budget Planning': { desc: 'Susun dan pantau anggaran per departemen.', action: 'New Budget', kpis: [['Total Budget', 'Rp4,2 M'], ['Terpakai', 'Rp2,9 M', '69%'], ['Sisa', 'Rp1,3 M']] },
  'Scenario & Forecast': { desc: 'Bandingkan skenario best / base / worst case.', action: 'New Scenario', kpis: [['Forecast Revenue', 'Rp6,8 M', '+9%'], ['Forecast Cost', 'Rp4,1 M', '+4%'], ['Proyeksi Laba', 'Rp2,7 M', '+17%']] },
  Expenses: { desc: 'Catat dan setujui pengeluaran operasional.', action: 'Add Expense', kpis: [['Bulan Ini', 'Rp812 jt', '+6%'], ['Menunggu Approval', '14'], ['Reimbursement', 'Rp38 jt']] },
  'Payables & Recurring': { desc: 'Hutang usaha dan tagihan berulang.', action: 'New Bill', kpis: [['Total Hutang', 'Rp1,1 M'], ['Jatuh Tempo 7 Hari', 'Rp286 jt', '-3 bill'], ['Recurring Aktif', '22']] },
  'Cash Flow': { desc: 'Arus kas masuk dan keluar.', action: 'Export', kpis: [['Saldo Kas', 'Rp3,48 M', '+5%'], ['Kas Masuk', 'Rp1,92 M', '+12%'], ['Kas Keluar', 'Rp1,41 M', '-8%']] },
  'Cost Analysis': { desc: 'Analisis biaya per pusat biaya dan kategori.', action: 'New Analysis', kpis: [['Total Biaya', 'Rp2,6 M'], ['Biaya Tetap', '58%'], ['Biaya Variabel', '42%']] },
  'Bank Reconciliation': { desc: 'Cocokkan mutasi bank dengan jurnal.', action: 'Import Statement', kpis: [['Belum Cocok', '37'], ['Selisih', 'Rp4,2 jt', '-'], ['Terakhir Rekon', '8 Okt 2026']] },
  Utilities: { desc: 'Listrik, air, internet, dan biaya utilitas lain.', action: 'Add Utility Bill', kpis: [['Bulan Ini', 'Rp96 jt', '+2%'], ['Tagihan Aktif', '9'], ['Rata-rata/Bulan', 'Rp91 jt']] },
  Receivables: { desc: 'Piutang pelanggan dan aging.', action: 'Send Reminder', kpis: [['Total Piutang', 'Rp2,3 M'], ['Overdue', 'Rp410 jt', '-'], ['DSO', '34 hari', '+2']] },
  'Invoice Builder': { desc: 'Buat dan kirim invoice ke pelanggan.', action: 'New Invoice', kpis: [['Draft', '6'], ['Terkirim', '48'], ['Lunas Bulan Ini', 'Rp1,6 M']] },
  'Deposit & Advance': { desc: 'Uang muka pelanggan dan deposit.', action: 'Record Deposit', kpis: [['Uang Muka', 'Rp540 jt'], ['Belum Dialokasi', 'Rp120 jt'], ['Deposit Aktif', '11']] },
  'P&L': { desc: 'Laporan laba rugi periode berjalan.', action: 'Export', kpis: [['Pendapatan', 'Rp6,2 M', '+11%'], ['Beban', 'Rp4,3 M', '+6%'], ['Laba Bersih', 'Rp1,9 M', '+22%']] },
  'Balance Sheet': { desc: 'Posisi aset, liabilitas, dan ekuitas.', action: 'Export', kpis: [['Total Aset', 'Rp14,8 M'], ['Liabilitas', 'Rp5,1 M'], ['Ekuitas', 'Rp9,7 M']] },
  'Company Report': { desc: 'Laporan konsolidasi untuk manajemen.', action: 'Generate Report', kpis: [['Entitas', '3'], ['Periode', 'Q3 2026'], ['Status', 'Draft']] },
  Accounting: { desc: 'Jurnal umum, buku besar, dan closing.', action: 'New Journal', kpis: [['Jurnal Bulan Ini', '412'], ['Belum Posting', '9'], ['Periode', 'Terbuka']] },
  'Inventory Valuation': { desc: 'Nilai persediaan per gudang dan metode.', action: 'Run Valuation', kpis: [['Nilai Persediaan', 'Rp3,2 M'], ['Item Aktif', '1.284'], ['Slow Moving', '7%']] },
  'HPP / COGS Review': { desc: 'Tinjau harga pokok penjualan per produk.', action: 'Review COGS', kpis: [['Total HPP', 'Rp3,6 M'], ['HPP / Revenue', '58%', '-1%'], ['Produk Dikaji', '86']] },
  'Gross Margin': { desc: 'Margin kotor per produk dan pelanggan.', action: 'Export', kpis: [['Gross Margin', '42%', '+1%'], ['Margin Terbaik', 'Produk A'], ['Margin Terendah', 'Produk F']] },
  'Fixed Assets': { desc: 'Daftar aset tetap dan penyusutan.', action: 'Add Asset', kpis: [['Nilai Buku', 'Rp4,7 M'], ['Aset Aktif', '158'], ['Penyusutan/Bulan', 'Rp62 jt']] },
  'Tax Setup & Calculator': { desc: 'Atur tarif pajak dan hitung simulasi.', action: 'Open Calculator', kpis: [['PPN', '11%'], ['PPh 23', '2%'], ['Kode Pajak Aktif', '14']] },
  'Tax Report': { desc: 'Rekap pajak dan siap lapor SPT.', action: 'Generate Report', kpis: [['PPN Keluaran', 'Rp680 jt'], ['PPN Masukan', 'Rp412 jt'], ['Kurang Bayar', 'Rp268 jt']] },
  'Payroll Tax': { desc: 'PPh 21 dan iuran terkait payroll.', action: 'Calculate', kpis: [['PPh 21 Bulan Ini', 'Rp74 jt'], ['Karyawan', '128'], ['Jatuh Tempo', '10 Nov']] },
  Withholding: { desc: 'Bukti potong dan pajak yang dipotong.', action: 'New Withholding', kpis: [['Bukti Potong', '63'], ['Total Dipotong', 'Rp91 jt'], ['Belum Terbit', '5']] },
  'Payroll Run': { desc: 'Proses penggajian bulanan.', action: 'Run Payroll', kpis: [['Total Gaji', 'Rp1,34 M'], ['Karyawan', '128'], ['Pembayaran', '25 Okt']] },
  'Components & Rules': { desc: 'Komponen gaji, tunjangan, dan aturan hitung.', action: 'Add Component', kpis: [['Komponen', '18'], ['Aturan Aktif', '11'], ['Terakhir Diubah', '2 Okt']] },
  'Compensation Review': { desc: 'Tinjauan kompensasi dan kenaikan gaji.', action: 'Start Review', kpis: [['Dalam Review', '24'], ['Anggaran Kenaikan', 'Rp58 jt'], ['Rata-rata Naik', '6%']] },
  'Business Case': { desc: 'Analisis kelayakan investasi (NPV, IRR, payback).', action: 'New Business Case', kpis: [['Proposal Aktif', '4'], ['NPV Gabungan', 'Rp1,2 M'], ['IRR Rata-rata', '17%']] },
  'Risk & Decision': { desc: 'Matriks risiko dan keputusan investasi.', action: 'Add Risk', kpis: [['Risiko Tinggi', '3', '-'], ['Menunggu Keputusan', '2'], ['Disetujui', '5']] },
}

const good = ['On track', 'Cocok', 'Lunas', 'Posted', 'Dibayar', 'Disetujui', 'Aktif', 'Dialokasi', 'Selesai']
const bad = ['Over', 'Overdue', 'Belum bayar', 'Selisih', 'Belum dialokasi']
const badge = (s: string) =>
  good.includes(s) ? 'bg-lime/60 text-forest' : bad.includes(s) ? 'bg-[#fdeaea] text-loss' : 'bg-canvas text-muted'

// ======================================================================
// ICONS
// ======================================================================
type IconProps = SVGProps<SVGSVGElement>
const Base = ({ children, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {children}
  </svg>
)
const SearchIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Base>
)
const BellIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </Base>
)
const PlusIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
)

// ======================================================================
// HEADER (controlled — state lives in App)
// ======================================================================
function Header({
  groupId,
  item,
  onGroup,
  onItem,
}: {
  groupId: string
  item: string
  onGroup: (id: string) => void
  onItem: (name: string) => void
}) {
  const group = navGroups.find((g) => g.id === groupId) ?? navGroups[0]
  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-amber-200 to-orange-300 text-sm font-semibold text-forest">S</div>
          <h1 className="text-2xl font-medium tracking-tight">Hello, Siburian</h1>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Search" className="grid size-10 place-items-center rounded-full bg-white text-lg shadow-sm">
            <SearchIcon />
          </button>
          <button type="button" aria-label="Notifications" className="flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium shadow-sm">
            <span className="relative text-lg">
              <BellIcon />
              <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-loss" />
            </span>
            24
          </button>
        </div>
      </div>

      <nav aria-label="Modules" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navGroups.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => onGroup(g.id)}
            aria-current={g.id === groupId ? 'true' : undefined}
            className={`shrink-0 whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              g.id === groupId ? 'bg-lime text-forest' : 'text-muted hover:text-ink'
            }`}
          >
            {g.label}
          </button>
        ))}
      </nav>

      <nav aria-label={`${group.label} pages`} className="flex flex-wrap gap-2">
        {group.items.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => onItem(name)}
            aria-current={name === item ? 'page' : undefined}
            className={`rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors ${
              name === item ? 'border-forest bg-forest text-white' : 'border-track bg-white text-muted hover:border-forest/30 hover:text-ink'
            }`}
          >
            {name}
          </button>
        ))}
      </nav>
    </header>
  )
}

// ======================================================================
// MODULE PAGE (generic, driven by `pages` + `tables`)
// ======================================================================
function ModulePage({ item }: { item: string }) {
  const [done, setDone] = useState<string[]>([])
  const verb = rowActions[item]
  const page = pages[item]
  const table = pageTables[item]
  if (!page || !table) return null
  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-medium tracking-tight">{item}</h2>
          <p className="mt-1 text-sm text-muted">{page.desc}</p>
        </div>
        <button type="button" className="flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white">
          <PlusIcon />
          {page.action}
        </button>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {page.kpis.map(([label, value, delta], i) => (
          <section key={label} className={`rounded-[28px] p-6 shadow-sm ${i === 0 ? 'bg-lime' : 'bg-white'}`}>
            <p className={`text-sm ${i === 0 ? 'text-forest/70' : 'text-muted'}`}>{label}</p>
            <p className="mt-2 text-3xl font-medium tracking-tight">{value}</p>
            {delta && (
              <p className={`mt-1 text-xs font-medium ${delta.startsWith('-') ? 'text-loss' : 'text-gain'}`}>{delta}</p>
            )}
          </section>
        ))}
      </div>

      <ItemView item={item} />

      <section className="rounded-[28px] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium">{table.title}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr>
                {table.cols.map((c) => (
                  <th key={c} className="pb-3 font-medium">{c}</th>
                ))}
                {verb && <th />}
              </tr>
            </thead>
            <tbody className="divide-y divide-track">
              {table.rows.map((r) => {
                const fin = done.includes(r[0])
                const last = r.length - 1
                return (
                  <tr key={r[0]}>
                    {r.map((cell, i) => {
                      const v = i === last && fin ? 'Selesai' : cell
                      return (
                        <td key={i} className="py-3.5">
                          {i === last ? <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge(v)}`}>{v}</span> : cell}
                        </td>
                      )
                    })}
                    {verb && (
                      <td className="py-3.5 text-right">
                        {!fin && !good.includes(r[last]) && (
                          <button type="button" onClick={() => setDone([...done, r[0]])} className="rounded-full bg-forest px-3 py-1 text-xs font-medium text-white">
                            {verb}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

// ======================================================================
// APP
// ======================================================================
export function FinanceDashboardContent() {
  const [groupId, setGroupId] = useState('cash')
  const [item, setItem] = useState('Cash Flow')

  const selectGroup = (id: string) => {
    const next = navGroups.find((g) => g.id === id)
    if (!next) return
    setGroupId(id)
    setItem(next.items[0])
  }

  return (
    <div className="h-full overflow-y-auto bg-[#f7f7f5]">
      <main className="mx-auto flex max-w-[1200px] flex-col gap-5 p-4 md:p-6">
        <Header groupId={groupId} item={item} onGroup={selectGroup} onItem={setItem} />
        {item === 'Cash Flow' ? <CashFlowDashboard /> : <ModulePage key={item} item={item} />}
      </main>
    </div>
  )
}
