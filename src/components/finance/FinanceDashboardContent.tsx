import React, { useState } from 'react'
import type { ReactNode, SVGProps } from 'react'
import { pageTables } from './pageTables'
import { ItemView, rowActions } from './views'
import CashFlowDashboard from './CashFlowDashboard'
import {
  expenseClaimsApi,
  departmentBudgetsApi,
  financeBusinessCasesApi,
  financeCompensationsApi,
  financeDepositsApi,
  financePayrollComponentsApi,
  financeRisksApi,
  financeScenariosApi,
  financeTaxCodesApi,
} from '../../lib/endpoints'
import { idrCompact, shortDate, useFinanceLive, type FinanceLive, type UseFinanceLiveResult, type LiveClaim, type LiveInvoice } from './useFinanceLive'
import type { Bar } from './views'

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

const good = ['On track', 'Cocok', 'Lunas', 'Posted', 'Dibayar', 'Disetujui', 'Aktif', 'Dialokasi', 'Selesai', 'Masuk']
const bad = ['Over', 'Overdue', 'Belum bayar', 'Selisih', 'Belum dialokasi', 'Ditolak', 'Keluar']
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
  userName,
  avatarUrl,
  unreadCount,
}: {
  groupId: string
  item: string
  onGroup: (id: string) => void
  onItem: (name: string) => void
  userName: string | null
  avatarUrl: string | null
  unreadCount: number
}) {
  const group = navGroups.find((g) => g.id === groupId) ?? navGroups[0]
  const firstName = userName ? userName.split(' ')[0] : null
  const initials = userName ? userName.split(' ').slice(0, 2).map((w) => w[0]).join('') : 'U'
  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative grid size-10 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-amber-200 to-orange-300 text-sm font-semibold text-forest">
            {initials}
            {avatarUrl && <img src={avatarUrl} alt={initials} className="absolute inset-0 size-full object-cover" />}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">{firstName ? `Hello, ${firstName}` : 'Hello'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Search" title="Pencarian Finance belum tersedia" disabled
            className="grid size-10 place-items-center rounded-full bg-white text-lg shadow-sm opacity-40 cursor-not-allowed">
            <SearchIcon />
          </button>
          <button type="button" aria-label="Notifications" className="flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium shadow-sm">
            <span className="relative text-lg">
              <BellIcon />
              {unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-loss" />}
            </span>
            {unreadCount}
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
// LIVE DATA OVERRIDE — halaman yang sudah punya backend
// ======================================================================
const WIRED_PAGES = [
  'Budget Planning', 'Expenses', 'Invoice Builder', 'Receivables',
  'P&L', 'Cost Analysis', 'Fixed Assets', 'Inventory Valuation',
  'HPP / COGS Review', 'Gross Margin', 'Payables & Recurring', 'Utilities',
  'Payroll Run', 'Tax Report', 'Accounting', 'Balance Sheet',
  'Scenario & Forecast', 'Deposit & Advance', 'Tax Setup & Calculator',
  'Components & Rules', 'Compensation Review', 'Business Case', 'Risk & Decision',
  'Payroll Tax', 'Company Report', 'Bank Reconciliation', 'Withholding',
]

const COMP_LABEL: Record<string, string> = { review: 'Review', approved: 'Disetujui', rejected: 'Ditolak', ditunda: 'Ditunda' }
const LEVEL_LABEL: Record<number, string> = { 0: 'Rendah', 1: 'Sedang', 2: 'Tinggi' }

const CLAIM_LABEL: Record<string, string> = {
  draft: 'Draft', submitted: 'Pending', approved: 'Disetujui', rejected: 'Ditolak', paid: 'Dibayar',
}
const INVOICE_LABEL: Record<string, string> = {
  draft: 'Draft', sent: 'Terkirim', partially_paid: 'Parsial', paid: 'Lunas', overdue: 'Overdue', cancelled: 'Batal',
}
const ASSET_LABEL: Record<string, string> = {
  available: 'Aktif', assigned: 'Dipakai', maintenance: 'Perbaikan', retired: 'Dihentikan',
}
const PO_LABEL: Record<string, string> = {
  draft: 'Draft', sent: 'Terkirim', approved: 'Disetujui', received: 'Diterima',
  completed: 'Selesai', cancelled: 'Batal', rejected: 'Ditolak',
}
const PAYROLL_LABEL: Record<string, string> = {
  draft: 'Draft', approved: 'Disetujui', paid: 'Dibayar',
}

type WiredPage = {
  kpis: Kpi[]
  rows: string[][]
  cols?: string[]
  rowMeta?: Array<{ key: string; id: string; actionable: boolean }>
  bars?: { title: string; data: Bar[] }
  statement?: { title: string; rows: Array<[string, string, 'h' | 'r' | 't']> }
}

function buildLivePage(item: string, live: FinanceLive): WiredPage | null {
  if (item === 'Expenses') {
    const now = new Date()
    const inMonth = (d: string) => {
      const date = new Date(d.includes('T') ? d : d.replace(' ', 'T'))
      return !Number.isNaN(date.getTime()) && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    }
    const sum = (arr: LiveClaim[]) => arr.reduce((s, c) => s + c.amount, 0)
    const monthClaims = live.claims.filter((c) => inMonth(c.expenseDate))
    const pendingReimb = live.claims.filter(
      (c) => ['submitted', 'approved'].includes(c.status) && c.paymentMethod === 'reimbursement'
    )
    const kpis: Kpi[] = [
      ['Bulan Ini', idrCompact(sum(monthClaims))],
      ['Menunggu Approval', String(live.claimStats.submitted)],
      ['Reimbursement', idrCompact(sum(pendingReimb))],
    ]
    const recent = live.claims.slice(0, 8)
    return {
      kpis,
      rows: recent.map((c) => [
        shortDate(c.expenseDate),
        live.categoryNames[c.categoryId] ?? 'Lainnya',
        idrCompact(c.amount),
        CLAIM_LABEL[c.status] ?? c.status,
      ]),
      rowMeta: recent.map((c) => ({ key: c.id, id: c.id, actionable: c.status === 'submitted' })),
    }
  }

  if (item === 'Invoice Builder') {
    const st = live.invoiceStats
    const kpis: Kpi[] = [
      ['Draft', String(st.draft)],
      ['Terkirim', String(st.sent)],
      ['Total Terbayar', idrCompact(st.totalPaid)],
    ]
    return {
      kpis,
      rows: live.invoices.slice(0, 8).map((i) => [
        i.invoiceNumber,
        live.clientNames[i.clientId] ?? '—',
        idrCompact(i.grandTotal),
        INVOICE_LABEL[i.status] ?? i.status,
      ]),
    }
  }

  if (item === 'Receivables') {
    const unpaid = live.invoices.filter((i) => ['sent', 'partially_paid', 'overdue'].includes(i.status))
    const outstandingOf = (i: LiveInvoice) => i.grandTotal - i.amountPaid
    const today = new Date().toISOString().slice(0, 10)
    const outstanding = unpaid.reduce((s, i) => s + outstandingOf(i), 0)
    const overdue = unpaid
      .filter((i) => i.dueDate && i.dueDate < today)
      .reduce((s, i) => s + outstandingOf(i), 0)
    const dso = live.invoiceStats.totalRevenue > 0
      ? Math.round(outstanding / (live.invoiceStats.totalRevenue / 30))
      : null
    const kpis: Kpi[] = [
      ['Total Piutang', idrCompact(outstanding)],
      ['Overdue', idrCompact(overdue)],
      ['DSO', dso === null ? '–' : `${dso} hari`],
    ]
    const bucket = (days: number) => (days <= 30 ? '0-30 hari' : days <= 60 ? '31-60 hari' : '>60 hari')
    const rows = unpaid.slice(0, 8).map((i) => {
      const days = Math.max(
        0,
        Math.floor((Date.now() - new Date(i.issueDate.replace(' ', 'T')).getTime()) / 86_400_000)
      )
      return [
        live.clientNames[i.clientId] ?? '—',
        bucket(days),
        idrCompact(outstandingOf(i)),
        days > 60 ? 'Overdue' : 'Aktif',
      ]
    })
    const b0 = unpaid.filter((i) => bucket(Math.max(0, Math.floor((Date.now() - new Date(i.issueDate.replace(' ', 'T')).getTime()) / 86_400_000))) === '0-30 hari').reduce((s, i) => s + outstandingOf(i), 0)
    const b1 = unpaid.filter((i) => bucket(Math.max(0, Math.floor((Date.now() - new Date(i.issueDate.replace(' ', 'T')).getTime()) / 86_400_000))) === '31-60 hari').reduce((s, i) => s + outstandingOf(i), 0)
    const b2 = unpaid.filter((i) => bucket(Math.max(0, Math.floor((Date.now() - new Date(i.issueDate.replace(' ', 'T')).getTime()) / 86_400_000))) === '>60 hari').reduce((s, i) => s + outstandingOf(i), 0)
    const total = b0 + b1 + b2 || 1
    const pct = (v: number) => Math.round((v / total) * 100)
    return {
      kpis,
      rows,
      bars: {
        title: 'Aging Piutang',
        data: [
          ['0-30 hari', pct(b0), idrCompact(b0)],
          ['31-60 hari', pct(b1), idrCompact(b1)],
          ['>60 hari', pct(b2), idrCompact(b2)],
        ],
      },
    }
  }

  if (item === 'Budget Planning') {
    const sumBudget = live.budgets.reduce((s, b) => s + b.budgetAmount, 0)
    const sumUsed = live.budgets.reduce((s, b) => s + b.usedBudget, 0)
    const pctTotal = sumBudget > 0 ? Math.round((sumUsed / sumBudget) * 100) : 0
    const kpis: Kpi[] = [
      ['Total Budget', idrCompact(sumBudget)],
      ['Terpakai', `${idrCompact(sumUsed)}${sumBudget > 0 ? ` (${pctTotal}%)` : ''}`],
      ['Sisa', idrCompact(sumBudget - sumUsed)],
    ]
    return {
      kpis,
      rows: live.budgets.map((b) => [
        b.department || '—',
        idrCompact(b.budgetAmount),
        idrCompact(b.usedBudget),
        b.usedBudget > b.budgetAmount ? 'Over' : 'On track',
      ]),
      bars: {
        title: 'Penggunaan Budget',
        data: live.budgets.map((b) => [
          b.department || '—',
          b.budgetAmount > 0 ? Math.min(100, Math.round((b.usedBudget / b.budgetAmount) * 100)) : 0,
          `${idrCompact(b.usedBudget)} / ${idrCompact(b.budgetAmount)}`,
        ]),
      },
    }
  }

  if (item === 'P&L') {
    const monthKey = (d: string) => (d || '').slice(0, 7)
    const now = new Date()
    const thisM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const prevD = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevM = `${prevD.getFullYear()}-${String(prevD.getMonth() + 1).padStart(2, '0')}`
    const revOf = (m: string) =>
      live.invoices
        .filter((i) => monthKey(i.issueDate) === m && ['sent', 'partially_paid', 'paid', 'overdue'].includes(i.status))
        .reduce((s, i) => s + i.grandTotal, 0)
    const bebanOf = (m: string) =>
      live.claims
        .filter((c) => monthKey(c.expenseDate) === m && ['approved', 'paid'].includes(c.status))
        .reduce((s, c) => s + c.amount, 0)
    const revT = revOf(thisM)
    const revL = revOf(prevM)
    const bebT = bebanOf(thisM)
    const bebL = bebanOf(prevM)
    const labaT = revT - bebT
    const labaL = revL - bebL
    const pct = (a: number, b: number) =>
      b > 0 ? `${a >= b ? '+' : '-'}${Math.abs(Math.round(((a - b) / b) * 100))}%` : undefined
    const kpis: Kpi[] = [
      ['Pendapatan', idrCompact(revT), pct(revT, revL)],
      ['Beban Operasional', idrCompact(bebT), pct(bebT, bebL)],
      ['Laba Bersih', idrCompact(labaT), pct(labaT, labaL)],
    ]
    const bulan = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    const bulanPendek = (m: string) => {
      const [y, mm] = m.split('-')
      return new Date(Number(y), Number(mm) - 1, 1).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
    }
    const months = Array.from(new Set([...live.invoices.map((i) => monthKey(i.issueDate)), ...live.claims.map((c) => monthKey(c.expenseDate))].filter(Boolean)))
      .sort()
      .reverse()
      .slice(0, 3)
    const rows = months.map((m) => [
      bulanPendek(m),
      idrCompact(revOf(m)),
      idrCompact(bebanOf(m)),
      m === thisM ? 'Berjalan' : 'Posted',
    ])
    return {
      kpis,
      rows,
      cols: ['Bulan', 'Pendapatan', 'Beban', 'Status'],
      statement: {
        title: `Laba Rugi — ${bulan}`,
        rows: [
          ['Pendapatan', '', 'h'],
          ['Invoice terbit', idrCompact(revT), 'r'],
          ['Total Pendapatan', idrCompact(revT), 't'],
          ['Beban', '', 'h'],
          ['Klaim disetujui & dibayar', idrCompact(bebT), 'r'],
          ['Total Beban', idrCompact(bebT), 't'],
          ['Laba Bersih', idrCompact(labaT), 't'],
        ],
      },
    }
  }

  if (item === 'Cost Analysis') {
    const realized = live.claims.filter((c) => ['approved', 'paid'].includes(c.status))
    const monthKey = (d: string) => (d || '').slice(0, 7)
    const now = new Date()
    const thisM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const prevD = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevM = `${prevD.getFullYear()}-${String(prevD.getMonth() + 1).padStart(2, '0')}`
    const agg = new Map<string, { total: number; thisMonth: number; lastMonth: number }>()
    for (const c of realized) {
      const e = agg.get(c.categoryId) ?? { total: 0, thisMonth: 0, lastMonth: 0 }
      e.total += c.amount
      if (monthKey(c.expenseDate) === thisM) e.thisMonth += c.amount
      if (monthKey(c.expenseDate) === prevM) e.lastMonth += c.amount
      agg.set(c.categoryId, e)
    }
    const entries = [...agg.entries()].sort((a, b) => b[1].total - a[1].total)
    const totalAll = entries.reduce((s, [, v]) => s + v.total, 0)
    const thisMonthTotal = entries.reduce((s, [, v]) => s + v.thisMonth, 0)
    const kpis: Kpi[] = [
      ['Total Biaya (disetujui)', idrCompact(totalAll)],
      ['Bulan Ini', idrCompact(thisMonthTotal)],
      ['Kategori Aktif', String(entries.length)],
    ]
    const rows = entries.slice(0, 8).map(([id, v]) => {
      const share = totalAll > 0 ? `${Math.round((v.total / totalAll) * 100)}%` : '0%'
      const tren = v.thisMonth > v.lastMonth ? `↑ +${idrCompact(v.thisMonth - v.lastMonth)}` : v.thisMonth < v.lastMonth ? `↓ ${idrCompact(v.thisMonth - v.lastMonth)}` : '→'
      return [live.categoryNames[id] ?? 'Lainnya', idrCompact(v.total), share, tren]
    })
    const top = entries.slice(0, 5)
    const pctOf = (v: number) => (totalAll > 0 ? Math.round((v / totalAll) * 100) : 0)
    return {
      kpis,
      rows,
      cols: ['Kategori', 'Biaya', '% Total', 'Tren'],
      bars: {
        title: 'Porsi Biaya',
        data: top.map(([id, v]) => [live.categoryNames[id] ?? 'Lainnya', pctOf(v.total), `${pctOf(v.total)}%`]) as Bar[],
      },
    }
  }

  if (item === 'Fixed Assets') {
    const assets = live.assets
    const sumCost = assets.reduce((s, a) => s + a.purchaseCost, 0)
    const aktif = assets.filter((a) => a.status !== 'retired').length
    const kpis: Kpi[] = [
      ['Nilai Perolehan', idrCompact(sumCost)],
      ['Total Aset', String(assets.length)],
      ['Aset Aktif', String(aktif)],
    ]
    const rows = assets.slice(0, 8).map((a) => [
      a.name,
      a.purchaseDate ? shortDate(a.purchaseDate) : '—',
      idrCompact(a.purchaseCost),
      ASSET_LABEL[a.status] ?? a.status,
    ])
    const top = [...assets].sort((a, b) => b.purchaseCost - a.purchaseCost).slice(0, 5)
    const max = top[0]?.purchaseCost || 1
    return {
      kpis,
      rows,
      cols: ['Aset', 'Perolehan', 'Nilai', 'Status'],
      bars: {
        title: 'Nilai Perolehan per Aset',
        data: top.map((a) => [a.name, Math.round((a.purchaseCost / max) * 100), idrCompact(a.purchaseCost)]) as Bar[],
      },
    }
  }

  if (item === 'Inventory Valuation') {
    const items = live.catalogItems
    const nilaiOf = (it: { stockQuantity: number; costPrice: number }) => it.stockQuantity * it.costPrice
    const totalNilai = items.reduce((s, it) => s + nilaiOf(it), 0)
    const kpis: Kpi[] = [
      ['Nilai Persediaan', idrCompact(totalNilai)],
      ['Total SKU', String(items.length)],
      ['Stok Nol', String(items.filter((it) => it.stockQuantity === 0).length)],
    ]
    const sorted = [...items].sort((a, b) => nilaiOf(b) - nilaiOf(a))
    const rows = sorted.slice(0, 8).map((it) => [
      it.name,
      String(it.stockQuantity),
      idrCompact(nilaiOf(it)),
      'HPP',
    ])
    const top = sorted.slice(0, 5)
    const max = top[0] ? nilaiOf(top[0]) || 1 : 1
    return {
      kpis,
      rows,
      cols: ['Item', 'Stok', 'Nilai (HPP)', 'Metode'],
      bars: {
        title: 'Nilai Persediaan per Item',
        data: top.map((it) => [it.name, Math.round((nilaiOf(it) / max) * 100), idrCompact(nilaiOf(it))]) as Bar[],
      },
    }
  }

  if (item === 'HPP / COGS Review') {
    const items = live.catalogItems
    const hppOf = (it: { stockQuantity: number; costPrice: number }) => it.stockQuantity * it.costPrice
    const totalHpp = items.reduce((s, it) => s + hppOf(it), 0)
    const marginPct = (it: { price: number; costPrice: number }) =>
      it.price > 0 ? Math.round(((it.price - it.costPrice) / it.price) * 100) : 0
    const sorted = [...items].sort((a, b) => hppOf(b) - hppOf(a))
    const kpis: Kpi[] = [
      ['Total HPP (Nilai Stok)', idrCompact(totalHpp)],
      ['HPP / Pendapatan', live.invoiceStats.totalRevenue > 0 ? `${Math.round((totalHpp / live.invoiceStats.totalRevenue) * 100)}%` : '–'],
      ['Produk', String(items.length)],
    ]
    const rows = sorted.slice(0, 8).map((it) => [
      it.name,
      idrCompact(it.costPrice),
      idrCompact(it.price),
      `${marginPct(it)}%`,
    ])
    const top = sorted.slice(0, 5)
    const max = top[0] ? hppOf(top[0]) || 1 : 1
    return {
      kpis,
      rows,
      bars: {
        title: 'HPP per Produk',
        data: top.map((it) => [it.name, Math.round((hppOf(it) / max) * 100), idrCompact(hppOf(it))]) as Bar[],
      },
    }
  }

  if (item === 'Gross Margin') {
    const items = live.catalogItems
    const marginPct = (it: { price: number; costPrice: number }) =>
      it.price > 0 ? Math.round(((it.price - it.costPrice) / it.price) * 100) : 0
    const withMargin = items.map((it) => ({ ...it, margin: marginPct(it) }))
    const avgMargin = withMargin.length > 0
      ? Math.round(withMargin.reduce((s, it) => s + it.margin, 0) / withMargin.length)
      : 0
    const best = [...withMargin].sort((a, b) => b.margin - a.margin)[0]
    const kpis: Kpi[] = [
      ['Rata-rata Margin', `${avgMargin}%`],
      ['Produk', String(items.length)],
      ['Margin Terbaik', best ? `${best.name} (${best.margin}%)` : '–'],
    ]
    const sorted = [...withMargin].sort((a, b) => b.margin - a.margin)
    const rows = sorted.slice(0, 8).map((it) => [
      it.name,
      idrCompact(it.price),
      idrCompact(it.price - it.costPrice),
      `${it.margin}%`,
    ])
    const max = sorted[0]?.margin || 1
    return {
      kpis,
      rows,
      cols: ['Produk', 'Harga Jual', 'Profit/Unit', 'Margin'],
      bars: {
        title: 'Margin per Produk',
        data: sorted.slice(0, 5).map((it) => [it.name, Math.round((it.margin / max) * 100), `${it.margin}%`]) as Bar[],
      },
    }
  }

  if (item === 'Payables & Recurring') {
    const pos = live.purchaseOrders
    const totalAll = pos.reduce((s, p) => s + p.grandTotal, 0)
    const open = pos.filter((p) => !['completed', 'cancelled', 'received', 'rejected'].includes(p.status))
    const kpis: Kpi[] = [
      ['Total Nilai PO', idrCompact(totalAll)],
      ['PO Terbuka', String(open.length)],
      ['Vendor Aktif', String(new Set(open.map((p) => p.vendorId)).size)],
    ]
    const rows = pos.slice(0, 8).map((p) => [
      live.vendorNames[p.vendorId] ?? p.poNumber,
      p.poNumber,
      idrCompact(p.grandTotal),
      PO_LABEL[p.status] ?? p.status,
    ])
    const byVendor = new Map<string, number>()
    for (const p of pos) byVendor.set(p.vendorId, (byVendor.get(p.vendorId) ?? 0) + p.grandTotal)
    const top = [...byVendor.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
    const max = top[0]?.[1] || 1
    return {
      kpis,
      rows,
      cols: ['Vendor', 'No. PO', 'Jumlah', 'Status'],
      bars: {
        title: 'Nilai PO per Vendor',
        data: top.map(([id, v]) => [live.vendorNames[id] ?? '—', Math.round((v / max) * 100), idrCompact(v)]) as Bar[],
      },
    }
  }

  if (item === 'Utilities') {
    // Klaim pada kategori yang menyerupai utilitas (listrik/air/internet/utilitas).
    const utilCategoryIds = Object.entries(live.categoryNames)
      .filter(([, name]) => /util|listrik|air|internet/i.test(name))
      .map(([id]) => id)
    const utilClaims = live.claims
      .filter((c) => utilCategoryIds.includes(c.categoryId))
      .sort((a, b) => (a.expenseDate < b.expenseDate ? 1 : -1))
    const now = new Date()
    const thisM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const monthSum = utilClaims
      .filter((c) => (c.expenseDate || '').slice(0, 7) === thisM)
      .reduce((s, c) => s + c.amount, 0)
    const totalSum = utilClaims.reduce((s, c) => s + c.amount, 0)
    const kpis: Kpi[] = [
      ['Bulan Ini', idrCompact(monthSum)],
      ['Total Tercatat', idrCompact(totalSum)],
      ['Tagihan', String(utilClaims.length)],
    ]
    return {
      kpis,
      rows: utilClaims.slice(0, 8).map((c) => [
        c.title,
        shortDate(c.expenseDate),
        idrCompact(c.amount),
        CLAIM_LABEL[c.status] ?? c.status,
      ]),
      cols: ['Pengeluaran', 'Tanggal', 'Jumlah', 'Status'],
    }
  }

  if (item === 'Payroll Run') {
    const pr = live.payrolls
    const sumNet = pr.reduce((s, p) => s + p.netSalary, 0)
    const paidCount = pr.filter((p) => p.status === 'paid').length
    const kpis: Kpi[] = [
      ['Total Gaji', idrCompact(sumNet)],
      ['Karyawan', String(pr.length)],
      ['Sudah Dibayar', pr.length > 0 ? `${paidCount}/${pr.length}` : '–'],
    ]
    return {
      kpis,
      rows: pr.slice(0, 8).map((p) => [
        p.fullName ?? '—',
        idrCompact(p.totalAllowances),
        idrCompact(p.netSalary),
        PAYROLL_LABEL[p.status] ?? p.status,
      ]),
      cols: ['Karyawan', 'Tunjangan', 'Gaji Net', 'Status'],
    }
  }

  if (item === 'Tax Report') {
    const now = new Date()
    const thisM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    // PPN keluaran real dari kolom taxAmount invoice (bukan draft & bukan batal).
    const ppnThisMonth = live.invoices
      .filter((i) => (i.issueDate || '').slice(0, 7) === thisM && !['draft', 'cancelled'].includes(i.status))
      .reduce((s, i) => s + i.taxAmount, 0)
    const ppnTotal = live.invoices
      .filter((i) => !['draft', 'cancelled'].includes(i.status))
      .reduce((s, i) => s + i.taxAmount, 0)
    const bulanLabel = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    const kpis: Kpi[] = [
      ['PPN Bulan Ini', idrCompact(ppnThisMonth)],
      ['PPN Terutang', idrCompact(ppnTotal)],
      ['PPh', '–'],
    ]
    return {
      kpis,
      rows: [[`PPN Keluaran ${bulanLabel}`, bulanLabel, idrCompact(ppnThisMonth), 'Belum dilaporkan']],
      cols: ['Jenis', 'Periode', 'Jumlah', 'Status'],
    }
  }

  if (item === 'Accounting') {
    // Jurnal turunan: gabungan kejadian keuangan ber-tanggal dari invoice & klaim.
    type Entry = { date: string; desc: string; amount: number; kind: 'Masuk' | 'Keluar' }
    const entries: Entry[] = []
    for (const i of live.invoices) {
      if (['draft', 'cancelled'].includes(i.status)) continue
      entries.push({ date: i.issueDate, desc: `Invoice ${i.invoiceNumber}`, amount: i.grandTotal, kind: 'Masuk' })
    }
    for (const c of live.claims) {
      if (c.status !== 'paid') continue
      entries.push({ date: c.expenseDate, desc: `Klaim dibayar — ${c.title}`, amount: -c.amount, kind: 'Keluar' })
    }
    entries.sort((a, b) => (a.date < b.date ? 1 : -1))
    const now = new Date()
    const thisM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const masuk = entries.filter((e) => e.kind === 'Masuk' && (e.date || '').slice(0, 7) === thisM).reduce((s, e) => s + e.amount, 0)
    const keluar = entries.filter((e) => e.kind === 'Keluar' && (e.date || '').slice(0, 7) === thisM).reduce((s, e) => s + Math.abs(e.amount), 0)
    const kpis: Kpi[] = [
      ['Entri Bulan Ini', String(entries.filter((e) => (e.date || '').slice(0, 7) === thisM).length)],
      ['Pendapatan Tercatat', idrCompact(masuk)],
      ['Klaim Dibayar', idrCompact(keluar)],
    ]
    return {
      kpis,
      rows: entries.slice(0, 8).map((e) => [
        shortDate(e.date),
        e.desc,
        `${e.amount < 0 ? '-' : '+'}${idrCompact(Math.abs(e.amount))}`,
        e.kind,
      ]),
      cols: ['Tanggal', 'Deskripsi', 'Jumlah', 'Tipe'],
    }
  }

  if (item === 'Balance Sheet') {
    // Neraca ESTIMASI dari data yang ada — label dilengkapi "(est.)".
    const unpaid = live.invoices.filter((i) => ['sent', 'partially_paid', 'paid', 'overdue'].includes(i.status))
    const piutang = unpaid.reduce((s, i) => s + (i.grandTotal - i.amountPaid), 0)
    const persediaan = live.catalogItems.reduce((s, it) => s + it.stockQuantity * it.costPrice, 0)
    const asetTetap = live.assets.reduce((s, a) => s + a.purchaseCost, 0)
    const kas = unpaid.reduce((s, i) => s + i.amountPaid, 0) - live.claims.filter((c) => c.status === 'paid').reduce((s, c) => s + c.amount, 0)
    const totalAset = Math.max(0, kas) + piutang + persediaan + asetTetap
    const hutang = live.purchaseOrders
      .filter((p) => !['completed', 'cancelled', 'received', 'rejected'].includes(p.status))
      .reduce((s, p) => s + p.grandTotal, 0)
    const ekuitas = totalAset - hutang
    const kpis: Kpi[] = [
      ['Total Aset (est.)', idrCompact(totalAset)],
      ['Total Liabilitas (est.)', idrCompact(hutang)],
      ['Ekuitas (est.)', idrCompact(ekuitas)],
    ]
    return {
      kpis,
      rows: [],
      statement: {
        title: 'Neraca (estimasi dari data tercatat)',
        rows: [
          ['Aset', '', 'h'],
          ['Kas (estimasi: terbayar − klaim dibayar)', idrCompact(Math.max(0, kas)), 'r'],
          ['Piutang Usaha', idrCompact(piutang), 'r'],
          ['Persediaan (HPP)', idrCompact(persediaan), 'r'],
          ['Aset Tetap (nilai perolehan)', idrCompact(asetTetap), 'r'],
          ['Total Aset (est.)', idrCompact(totalAset), 't'],
          ['Liabilitas', '', 'h'],
          ['PO Vendor Terbuka', idrCompact(hutang), 'r'],
          ['Total Liabilitas (est.)', idrCompact(hutang), 't'],
          ['Ekuitas (Aset − Liabilitas)', idrCompact(ekuitas), 't'],
        ],
      },
    }
  }

  if (item === 'Scenario & Forecast') {
    const scenarios = live.scenarios
    const best = [...scenarios].sort((a, b) => b.revenueTarget - a.revenueTarget)[0]
    const kpis: Kpi[] = [
      ['Skenario', String(scenarios.length)],
      ['Forecast Terbaik', best ? idrCompact(best.revenueTarget) : '–'],
      ['Laba Terbaik', best ? idrCompact(best.revenueTarget - best.costTarget) : '–'],
    ]
    return {
      kpis,
      rows: scenarios.map((s) => [s.name, idrCompact(s.revenueTarget), idrCompact(s.revenueTarget - s.costTarget), s.assumption ?? '—']),
      cols: ['Skenario', 'Target Revenue', 'Target Laba', 'Asumsi'],
    }
  }

  if (item === 'Deposit & Advance') {
    const deposits = live.deposits
    const sumAll = deposits.reduce((s, d) => s + d.amount, 0)
    const unallocated = deposits.filter((d) => !d.isAllocated).reduce((s, d) => s + d.amount, 0)
    const kpis: Kpi[] = [
      ['Total Deposit', idrCompact(sumAll)],
      ['Belum Dialokasi', idrCompact(unallocated)],
      ['Deposit Aktif', String(deposits.filter((d) => !d.isAllocated).length)],
    ]
    return {
      kpis,
      rows: deposits.slice(0, 8).map((d) => [
        d.clientId ? live.clientNames[d.clientId] ?? '—' : '—',
        shortDate(d.depositDate),
        idrCompact(d.amount),
        d.isAllocated ? 'Dialokasi' : 'Belum dialokasi',
      ]),
      rowMeta: deposits.slice(0, 8).map((d) => ({ key: d.id, id: d.id, actionable: !d.isAllocated })),
    }
  }

  if (item === 'Tax Setup & Calculator') {
    const codes = live.taxCodes
    const ppnActive = codes.find((t) => t.type === 'ppn' && t.isActive)
    const kpis: Kpi[] = [
      ['Kode Pajak', String(codes.length)],
      ['Aktif', String(codes.filter((t) => t.isActive).length)],
      ['Tarif PPN', ppnActive ? `${ppnActive.rate}%` : '–'],
    ]
    return {
      kpis,
      rows: codes.map((t) => [t.code, t.name, `${t.rate}%`, t.isActive ? 'Aktif' : 'Nonaktif']),
      cols: ['Kode', 'Jenis', 'Tarif', 'Status'],
    }
  }

  if (item === 'Components & Rules') {
    const comps = live.payrollComponents
    const kpis: Kpi[] = [
      ['Komponen', String(comps.length)],
      ['Aktif', String(comps.filter((c) => c.isActive).length)],
      ['Potongan', String(comps.filter((c) => c.type === 'potongan').length)],
    ]
    return {
      kpis,
      rows: comps.slice(0, 8).map((c) => [
        c.name,
        c.type === 'potongan' ? 'Potongan' : 'Pendapatan',
        c.rule ?? '—',
        c.isActive ? 'Aktif' : 'Nonaktif',
      ]),
      cols: ['Komponen', 'Tipe', 'Aturan', 'Status'],
    }
  }

  if (item === 'Compensation Review') {
    const revs = live.compensations
    const naik = revs.filter((r) => r.proposedSalary > r.currentSalary)
    const avgPct = naik.length > 0
      ? Math.round(naik.reduce((s, r) => s + ((r.proposedSalary - r.currentSalary) / r.currentSalary) * 100, 0) / naik.length)
      : 0
    const kpis: Kpi[] = [
      ['Dalam Review', String(revs.filter((r) => r.status === 'review').length)],
      ['Usulan Naik', String(naik.length)],
      ['Rata-rata Naik', naik.length > 0 ? `${avgPct}%` : '–'],
    ]
    return {
      kpis,
      rows: revs.slice(0, 8).map((r) => [
        r.employeeName,
        idrCompact(r.currentSalary),
        idrCompact(r.proposedSalary),
        COMP_LABEL[r.status] ?? r.status,
      ]),
      cols: ['Karyawan', 'Gaji Saat Ini', 'Usulan', 'Status'],
      rowMeta: revs.slice(0, 8).map((r) => ({ key: r.id, id: r.id, actionable: r.status === 'review' })),
    }
  }

  if (item === 'Business Case') {
    const cases = live.businessCases
    const sumNpv = cases.reduce((s, b) => s + b.npv, 0)
    const sumInv = cases.reduce((s, b) => s + b.investment, 0)
    const kpis: Kpi[] = [
      ['Proposal Aktif', String(cases.filter((b) => b.status === 'review').length)],
      ['NPV Gabungan', idrCompact(sumNpv)],
      ['Investasi Total', idrCompact(sumInv)],
    ]
    const top = [...cases].sort((a, b) => b.npv - a.npv).slice(0, 5)
    const max = top[0]?.npv || 1
    return {
      kpis,
      rows: cases.slice(0, 8).map((b) => [b.name, idrCompact(b.investment), idrCompact(b.npv), COMP_LABEL[b.status] ?? b.status]),
      cols: ['Proposal', 'Investasi', 'NPV', 'Status'],
      rowMeta: cases.slice(0, 8).map((b) => ({ key: b.id, id: b.id, actionable: b.status === 'review' })),
      bars: {
        title: 'NPV per Proposal',
        data: top.map((b) => [b.name, Math.round((b.npv / max) * 100), idrCompact(b.npv)]) as Bar[],
      },
    }
  }

  if (item === 'Risk & Decision') {
    const risks = live.risks
    const kpis: Kpi[] = [
      ['Risiko Tinggi', String(risks.filter((r) => r.impactLevel === 2).length)],
      ['Menunggu Keputusan', String(risks.filter((r) => r.status === 'review').length)],
      ['Disetujui', String(risks.filter((r) => r.status === 'approved').length)],
    ]
    return {
      kpis,
      rows: risks.slice(0, 8).map((r) => [
        r.name,
        idrCompact(r.impactAmount),
        LEVEL_LABEL[r.impactLevel] ?? String(r.impactLevel),
        COMP_LABEL[r.status] ?? r.status,
      ]),
      cols: ['Risiko', 'Dampak', 'Level', 'Status'],
      rowMeta: risks.slice(0, 8).map((r) => ({ key: r.id, id: r.id, actionable: r.status === 'review' })),
    }
  }

  if (item === 'Payroll Tax') {
    // Estimasi PPh 21 flat 5% dari gaji net — label jujur, bukan kalkulasi TER resmi.
    const pr = live.payrolls
    const estTotal = pr.reduce((s, p) => s + p.netSalary * 0.05, 0)
    const kpis: Kpi[] = [
      ['Total Estimasi PPh 21', idrCompact(estTotal)],
      ['Karyawan', String(pr.length)],
      ['Metode', 'Estimasi flat 5%'],
    ]
    return {
      kpis,
      rows: pr.slice(0, 8).map((p) => [
        p.fullName ?? '—',
        idrCompact(p.netSalary),
        idrCompact(p.netSalary * 0.05),
        PAYROLL_LABEL[p.status] ?? p.status,
      ]),
      cols: ['Karyawan', 'Penghasilan Net', 'PPh 21 (est.)', 'Status Payroll'],
    }
  }

  if (item === 'Company Report') {
    // Ringkasan konsolidasi satu halaman dari semua metrik yang tersedia.
    const bulan = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    const piutang = live.invoices
      .filter((i) => ['sent', 'partially_paid', 'paid', 'overdue'].includes(i.status))
      .reduce((s, i) => s + (i.grandTotal - i.amountPaid), 0)
    const beban = live.claims.filter((c) => ['approved', 'paid'].includes(c.status)).reduce((s, c) => s + c.amount, 0)
    const kpis: Kpi[] = [
      ['Pendapatan', idrCompact(live.invoiceStats.totalRevenue)],
      ['Laba Bersih', idrCompact(live.invoiceStats.totalRevenue - beban)],
      ['Periode', bulan],
    ]
    return {
      kpis,
      rows: [],
      statement: {
        title: `Ringkasan Konsolidasi — ${bulan}`,
        rows: [
          ['Pendapatan (invoice terbit)', idrCompact(live.invoiceStats.totalRevenue), 'r'],
          ['Beban (klaim disetujui & dibayar)', idrCompact(beban), 'r'],
          ['Laba Bersih', idrCompact(live.invoiceStats.totalRevenue - beban), 't'],
          ['Piutang Usaha', idrCompact(piutang), 'r'],
          ['Persediaan (HPP)', idrCompact(live.catalogItems.reduce((s, it) => s + it.stockQuantity * it.costPrice, 0)), 'r'],
          ['PO Vendor Terbuka', idrCompact(live.purchaseOrders.filter((p) => !['completed', 'cancelled', 'received', 'rejected'].includes(p.status)).reduce((s, p) => s + p.grandTotal, 0)), 'r'],
        ],
      },
    }
  }

  if (item === 'Bank Reconciliation') {
    // Mutasi kas internal: payment masuk vs klaim dibayar. Rekonsiliasi vs
    // statement bank butuh fitur import — di sini ditampilkan sebagai mutasi.
    const masuk = live.payments.reduce((s, p) => s + p.amount, 0)
    const keluar = live.claims.filter((c) => c.status === 'paid').reduce((s, c) => s + c.amount, 0)
    const events = [
      ...live.payments.map((p) => ({
        key: `pay-${p.id}`,
        date: p.paymentDate,
        desc: `Pembayaran ${p.invoiceNumber ?? 'Invoice'}`,
        amount: `+${idrCompact(p.amount)}`,
        src: p.paymentMethod === 'bank_transfer' ? 'Transfer Bank' : p.paymentMethod === 'cash' ? 'Tunai' : p.paymentMethod,
      })),
      ...live.claims
        .filter((c) => c.status === 'paid')
        .map((c) => ({ key: `claim-${c.id}`, date: c.expenseDate, desc: `Klaim dibayar — ${c.title}`, amount: `-${idrCompact(c.amount)}`, src: 'Klaim' })),
    ]
      .sort((a, b) => ((a.date || '') < (b.date || '') ? 1 : -1))
      .slice(0, 8)
    const kpis: Kpi[] = [
      ['Kas Masuk', idrCompact(masuk)],
      ['Kas Keluar', idrCompact(keluar)],
      ['Net', idrCompact(masuk - keluar)],
    ]
    return {
      kpis,
      rows: events.map((e) => [shortDate(e.date ?? ''), e.desc, e.amount, e.src]),
      cols: ['Tanggal', 'Keterangan', 'Jumlah', 'Sumber'],
    }
  }

  if (item === 'Withholding') {
    // Estimasi PPh 23 (2%) atas PO vendor yang sudah disetujui/diterima/selesai.
    const pos = live.purchaseOrders.filter((p) => ['approved', 'received', 'completed'].includes(p.status))
    const totalPo = pos.reduce((s, p) => s + p.grandTotal, 0)
    const kpis: Kpi[] = [
      ['Total Nilai PO', idrCompact(totalPo)],
      ['Estimasi PPh 23', idrCompact(totalPo * 0.02)],
      ['Metode', 'Estimasi 2%'],
    ]
    return {
      kpis,
      rows: pos.slice(0, 8).map((p) => [
        p.poNumber,
        live.vendorNames[p.vendorId] ?? '—',
        idrCompact(p.grandTotal),
        idrCompact(p.grandTotal * 0.02),
      ]),
      cols: ['No. PO', 'Vendor', 'Nilai PO', 'PPh 23 (est.)'],
    }
  }

  return null
}

// ======================================================================
// KONFIGURASI CTA HEADER — hanya yang punya endpoint nyata.
// type 'print' = cetak halaman; 'reload' = hitung ulang dari server.
// ======================================================================
type FieldDef = {
  key: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'textarea'
  options?: Array<{ value: string; label: string }>
  required?: boolean
  /** Nilai awal field (mis. default date hari ini) */
  defaultValue?: string | number
}

const HEADER_FORMS: Record<string, { title: string; fields: FieldDef[]; submit: (v: Record<string, unknown>) => Promise<unknown> }> = {
  'Budget Planning': {
    title: 'New Budget',
    fields: [
      { key: 'department', label: 'Departemen', type: 'text', required: true },
      { key: 'periodMonth', label: 'Bulan (1-12)', type: 'number', required: true },
      { key: 'periodYear', label: 'Tahun', type: 'number', required: true },
      { key: 'allocatedBudget', label: 'Budget (Rp)', type: 'number', required: true },
    ],
    submit: (v) => departmentBudgetsApi.create(v),
  },
  'Scenario & Forecast': {
    title: 'New Scenario',
    fields: [
      { key: 'name', label: 'Nama skenario', type: 'text', required: true },
      { key: 'revenueTarget', label: 'Target Revenue (Rp)', type: 'number', required: true },
      { key: 'costTarget', label: 'Target Biaya (Rp)', type: 'number', required: true },
      { key: 'assumption', label: 'Asumsi', type: 'text' },
    ],
    submit: (v) => financeScenariosApi.create(v),
  },
  'Deposit & Advance': {
    title: 'Record Deposit',
    fields: [
      { key: 'clientId', label: 'Pelanggan', type: 'select' },
      { key: 'depositDate', label: 'Tanggal', type: 'date', required: true },
      { key: 'amount', label: 'Jumlah (Rp)', type: 'number', required: true },
      { key: 'notes', label: 'Catatan', type: 'text' },
    ],
    submit: (v) => financeDepositsApi.create(v),
  },
  'Tax Setup & Calculator': {
    title: 'New Tax Code',
    fields: [
      { key: 'code', label: 'Kode', type: 'text', required: true },
      { key: 'name', label: 'Nama', type: 'text', required: true },
      { key: 'type', label: 'Jenis', type: 'select', options: [{ value: 'ppn', label: 'PPN' }, { value: 'pph', label: 'PPh' }, { value: 'lainnya', label: 'Lainnya' }] },
      { key: 'rate', label: 'Tarif (%)', type: 'number', required: true },
    ],
    submit: (v) => financeTaxCodesApi.create({ ...v, isActive: true }),
  },
  'Components & Rules': {
    title: 'Add Component',
    fields: [
      { key: 'name', label: 'Nama komponen', type: 'text', required: true },
      { key: 'type', label: 'Tipe', type: 'select', options: [{ value: 'pendapatan', label: 'Pendapatan' }, { value: 'potongan', label: 'Potongan' }] },
      { key: 'rule', label: 'Aturan', type: 'text' },
    ],
    submit: (v) => financePayrollComponentsApi.create({ ...v, isActive: true }),
  },
  'Compensation Review': {
    title: 'Start Review',
    fields: [
      { key: 'employeeName', label: 'Nama karyawan', type: 'text', required: true },
      { key: 'currentSalary', label: 'Gaji saat ini (Rp)', type: 'number', required: true },
      { key: 'proposedSalary', label: 'Usulan gaji (Rp)', type: 'number', required: true },
    ],
    submit: (v) => financeCompensationsApi.create({ ...v, status: 'review' }),
  },
  'Business Case': {
    title: 'New Business Case',
    fields: [
      { key: 'name', label: 'Nama proposal', type: 'text', required: true },
      { key: 'investment', label: 'Investasi (Rp)', type: 'number', required: true },
      { key: 'npv', label: 'NPV (Rp)', type: 'number', required: true },
    ],
    submit: (v) => financeBusinessCasesApi.create({ ...v, status: 'review' }),
  },
  'Risk & Decision': {
    title: 'Add Risk',
    fields: [
      { key: 'name', label: 'Nama risiko', type: 'text', required: true },
      { key: 'impactAmount', label: 'Dampak (Rp)', type: 'number', required: true },
      { key: 'impactLevel', label: 'Level dampak', type: 'select', options: [{ value: '0', label: 'Rendah' }, { value: '1', label: 'Sedang' }, { value: '2', label: 'Tinggi' }] },
      { key: 'probability', label: 'Probabilitas', type: 'select', options: [{ value: '0', label: 'Rendah' }, { value: '1', label: 'Sedang' }, { value: '2', label: 'Tinggi' }] },
    ],
    submit: (v) => financeRisksApi.create({ ...v, impactLevel: Number(v.impactLevel), probability: Number(v.probability), status: 'review' }),
  },
}

const PRINT_PAGES = new Set(['P&L', 'Balance Sheet', 'Gross Margin', 'Company Report', 'Tax Report'])

// ======================================================================
// MODULE PAGE (generic, driven by `pages` + `tables`; 4 halaman live)
// ======================================================================
function ModulePage({ item, live, onOpenAddExpense }: { item: string; live: UseFinanceLiveResult; onOpenAddExpense?: () => void }) {
  const [done, setDone] = useState<string[]>([])
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const verb = rowActions[item]
  const page = pages[item]
  const table = pageTables[item]
  if (!page || !table) return null

  const isWiredPage = WIRED_PAGES.includes(item)
  const wired = isWiredPage && !live.loading ? buildLivePage(item, live) : null

  const kpis: Kpi[] = !isWiredPage
    ? page.kpis
    : wired
      ? wired.kpis
      : page.kpis.map(([label]) => [label, live.error ? '!' : '–'] as Kpi)

  const rows = isWiredPage ? (wired?.rows ?? []) : table.rows
  const rowMeta = wired?.rowMeta

  // Aksi baris per halaman — hanya endpoint yang benar-benar ada.
  const handleRowAction = async (id: string) => {
    if (approvingId) return
    setApprovingId(id)
    try {
      if (item === 'Expenses') {
        const res = await expenseClaimsApi.approve(id, { approved: true })
        if (res?.error) return
      } else if (item === 'Deposit & Advance') {
        const d = live.deposits.find((x) => x.id === id)
        if (!d) return
        const res = await financeDepositsApi.update(id, {
          clientId: d.clientId ?? undefined, depositDate: d.depositDate, amount: d.amount, isAllocated: true, notes: d.notes ?? undefined,
        })
        if (res?.error) return
      } else if (item === 'Compensation Review') {
        const r = live.compensations.find((x) => x.id === id)
        if (!r) return
        const res = await financeCompensationsApi.update(id, {
          employeeName: r.employeeName, currentSalary: r.currentSalary, proposedSalary: r.proposedSalary, status: 'approved',
        })
        if (res?.error) return
      } else if (item === 'Business Case') {
        const b = live.businessCases.find((x) => x.id === id)
        if (!b) return
        const res = await financeBusinessCasesApi.update(id, {
          name: b.name, investment: b.investment, npv: b.npv, status: 'approved',
        })
        if (res?.error) return
      } else if (item === 'Risk & Decision') {
        const r = live.risks.find((x) => x.id === id)
        if (!r) return
        const res = await financeRisksApi.update(id, {
          name: r.name, impactAmount: r.impactAmount, impactLevel: r.impactLevel, probability: r.probability, status: 'approved',
        })
        if (res?.error) return
      }
      live.reload()
    } finally {
      setApprovingId(null)
    }
  }

  const handleToggleComponent = async (id: string, next: boolean) => {
    const comp = live.payrollComponents.find((c) => c.id === id)
    if (!comp) return
    await financePayrollComponentsApi
      .update(id, { name: comp.name, type: comp.type, rule: comp.rule ?? undefined, isActive: next })
      .catch(() => null)
    live.reload()
  }

  // CTA header: form create / print / reload / add-expense / disabled (butuh backend lain).
  const headerForm = HEADER_FORMS[item]
  const onHeaderClick = () => {
    if (headerForm) return setShowForm(true)
    if (item === 'Utilities') return onOpenAddExpense?.()
    if (PRINT_PAGES.has(item)) return window.print()
    if (item === 'Inventory Valuation') return live.reload()
  }
  const headerDisabled = !headerForm && item !== 'Utilities' && !PRINT_PAGES.has(item) && item !== 'Inventory Valuation'
  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-[#EAEDF2] bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.02)]">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink">{item}</h2>
          <p className="mt-1 text-sm text-muted">{page.desc}</p>
        </div>
        <button
          type="button"
          onClick={onHeaderClick}
          disabled={headerDisabled}
          title={headerDisabled ? 'Butuh backend/modul terpisah' : undefined}
          className="flex items-center gap-2 rounded-full bg-lime px-5 py-2.5 text-sm font-bold text-forest shadow-[0_6px_18px_rgba(132,225,0,0.28)] transition hover:bg-lime-deep disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <PlusIcon />
          {page.action}
        </button>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {kpis.map(([label, value, delta], i) => (
          <section key={label} className={`rounded-[20px] border border-[#EAEDF2] p-6 shadow-[0_2px_12px_rgba(15,23,42,0.02)] ${i === 0 ? 'bg-lime' : 'bg-white'}`}>
            <p className={`text-sm ${i === 0 ? 'text-forest/70' : 'text-muted'}`}>{label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
            {delta && (
              <p className={`mt-1 text-xs font-medium ${delta.startsWith('-') ? 'text-loss' : 'text-gain'}`}>{delta}</p>
            )}
          </section>
        ))}
      </div>

      <ItemView
        item={item}
        liveBars={wired?.bars}
        liveStatement={wired?.statement}
        live={live}
        onCreated={live.reload}
        liveReady={Boolean(wired)}
        onToggleComponent={handleToggleComponent}
      />

      <section className="rounded-[20px] border border-[#EAEDF2] bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.02)]">
        <h2 className="text-lg font-medium">{wired?.statement ? 'Ringkasan per Bulan' : table.title}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr>
                {(wired?.cols ?? table.cols).map((c) => (
                  <th key={c} className="pb-3 font-medium">{c}</th>
                ))}
                {verb && <th />}
              </tr>
            </thead>
            <tbody className="divide-y divide-track">
              {rows.map((r, idx) => {
                const fin = !isWiredPage && done.includes(r[0])
                const last = r.length - 1
                const meta = rowMeta?.[idx]
                const showAction = isWiredPage
                  ? Boolean(verb && meta?.actionable)
                  : Boolean(verb && !fin && !good.includes(r[last]))
                return (
                  <tr key={meta?.key ?? r[0]}>
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
                        {showAction && !isWiredPage && (
                          <button type="button" onClick={() => setDone([...done, r[0]])} className="rounded-full bg-forest px-3 py-1 text-xs font-medium text-white">
                            {verb}
                          </button>
                        )}
                        {showAction && isWiredPage && (
                          <button
                            type="button"
                            onClick={() => handleRowAction(meta!.id)}
                            disabled={approvingId === meta!.id}
                            className="rounded-full bg-forest px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
                          >
                            {approvingId === meta!.id ? 'Memproses…' : verb}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
              {isWiredPage && rows.length === 0 && (
                <tr>
                  <td colSpan={table.cols.length + (verb ? 1 : 0)} className="py-8 text-center text-sm text-muted">
                    {live.loading ? 'Memuat data…' : live.error ? 'Gagal memuat data dari server.' : 'Belum ada data.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showForm && headerForm && (
        <FinanceEntryModal
          title={headerForm.title}
          fields={headerForm.fields.map((f) =>
            f.type === 'select' && f.key === 'clientId'
              ? { ...f, options: Object.entries(live.clientNames).map(([id, name]) => ({ value: id, label: name })) }
              : f
          )}
          submit={headerForm.submit}
          onClose={() => setShowForm(false)}
          onCreated={live.reload}
        />
      )}
    </div>
  )
}

// ======================================================================
// FORM MODAL GENERIK untuk CTA header (create entitas finance extras)
// ======================================================================
function FinanceEntryModal({
  title,
  fields,
  submit,
  onClose,
  onCreated,
}: {
  title: string
  fields: FieldDef[]
  submit: (v: Record<string, unknown>) => Promise<unknown>
  onClose: () => void
  onCreated: () => void
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const f of fields) {
      if (f.defaultValue !== undefined) init[f.key] = String(f.defaultValue)
      else if (f.type === 'date') init[f.key] = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
    }
    return init
  })
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState('')

  const set = (k: string, v: string) => setValues((prev) => ({ ...prev, [k]: v }))

  const handleSubmit = async () => {
    if (sending) return
    const missing = fields.filter((f) => f.required && !String(values[f.key] ?? '').trim())
    if (missing.length > 0) {
      setMsg(`Lengkapi: ${missing.map((f) => f.label).join(', ')}`)
      return
    }
    setSending(true)
    setMsg('')
    try {
      const payload: Record<string, unknown> = { ...values }
      for (const f of fields) if (f.type === 'number' && payload[f.key] !== undefined) payload[f.key] = Number(payload[f.key])
      const res = (await submit(payload)) as { error?: string }
      if (res?.error) {
        setMsg(String(res.error))
        return
      }
      onCreated()
      onClose()
    } catch {
      setMsg('Gagal menyimpan.')
    } finally {
      setSending(false)
    }
  }

  const field = 'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40'

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md space-y-4 rounded-3xl border border-white/80 bg-white/90 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600" aria-label="Tutup">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        {fields.map((f) => (
          <label key={f.key} className="block text-xs font-medium text-slate-500">
            {f.label}
            {f.type === 'select' ? (
              <select value={values[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} className={field}>
                {!f.required && <option value="">— Pilih —</option>}
                {(f.options ?? []).map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea value={values[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} className={`${field} resize-none`} rows={2} />
            ) : (
              <input
                type={f.type}
                value={values[f.key] ?? ''}
                onChange={(e) => set(f.key, e.target.value)}
                className={field}
                min={f.type === 'number' ? 0 : undefined}
              />
            )}
          </label>
        ))}
        <p className="text-xs font-medium text-rose-600" role="status">{msg}</p>
        <div className="flex items-center justify-end gap-2 border-t border-slate-200/60 pt-3">
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-600 shadow-2xs transition-colors hover:bg-slate-50">
            Batal
          </button>
          <button type="button" onClick={handleSubmit} disabled={sending} className="rounded-full bg-[#0d9488] px-5 py-2 text-xs font-semibold text-white shadow-md transition-colors hover:bg-[#0fa396] disabled:opacity-50">
            {sending ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ======================================================================
// ADD EXPENSE — modal create claim (auto expenseNumber + auto submit)
// ======================================================================
function AddExpenseModal({
  categories,
  onClose,
  onCreated,
}: {
  categories: Array<{ id: string; name: string }>
  onClose: () => void
  onCreated: () => void
}) {
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  // Tanggal LOKAL (toISOString = UTC → bisa mundur sehari di WIB)
  const now0 = new Date()
  const pad0 = (n: number) => String(n).padStart(2, '0')
  const [expenseDate, setExpenseDate] = useState(`${now0.getFullYear()}-${pad0(now0.getMonth() + 1)}-${pad0(now0.getDate())}`)
  const [department, setDepartment] = useState('')
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState('')

  const submit = async () => {
    const amt = Number(amount)
    if (!title.trim() || !categoryId || !(amt > 0) || sending) {
      if (!sending) setMsg('Lengkapi judul, kategori, dan jumlah (> 0).')
      return
    }
    setSending(true)
    setMsg('')
    try {
      const now = new Date()
      const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
      const created = await expenseClaimsApi.create({
        expenseNumber: `EXP-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`,
        categoryId,
        title: title.trim(),
        amount: amt,
        expenseDate,
        department: department.trim() || undefined,
      })
      if (created?.error) {
        setMsg(String(created.error))
        return
      }
      // Auto-submit → masuk antrean approval (muncul tombol Setujui).
      const claimId = created?.claim?.id
      if (claimId) await expenseClaimsApi.submit(claimId).catch(() => null)
      onCreated()
      onClose()
    } catch {
      setMsg('Gagal menyimpan pengeluaran.')
    } finally {
      setSending(false)
    }
  }

  const field = 'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40'

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md space-y-4 rounded-3xl border border-white/80 bg-white/90 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <h3 className="text-lg font-bold text-slate-900">Catat Pengeluaran</h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600" aria-label="Tutup">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <label className="block text-xs font-medium text-slate-500">
          Judul
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Misal: Belanja ATK" className={field} />
        </label>
        <label className="block text-xs font-medium text-slate-500">
          Kategori
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={field}>
            {categories.length === 0 && <option value="">— Belum ada kategori —</option>}
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs font-medium text-slate-500">
            Jumlah (Rp)
            <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className={field} />
          </label>
          <label className="block text-xs font-medium text-slate-500">
            Tanggal
            <input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className={field} />
          </label>
        </div>
        <label className="block text-xs font-medium text-slate-500">
          Departemen (opsional)
          <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Misal: Ops" className={field} />
        </label>

        <p className="text-xs text-slate-500">Pengeluaran langsung masuk antrean persetujuan setelah disimpan.</p>
        <p className="text-xs font-medium text-rose-600" role="status">{msg}</p>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200/60 pt-3">
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-600 shadow-2xs transition-colors hover:bg-slate-50">
            Batal
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={sending}
            className="rounded-full bg-[#0d9488] px-5 py-2 text-xs font-semibold text-white shadow-md transition-colors hover:bg-[#0fa396] disabled:opacity-50"
          >
            {sending ? 'Menyimpan…' : 'Simpan & Ajukan'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ======================================================================
// APP
// ======================================================================
// Error boundary DIAGNOSTIK sementara — menampilkan crash render Finance
// alih-alih membiarkan seluruh root blank. Dibaca via window.__finCrash.
class FinanceErrorBoundary extends React.Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null }
  static getDerivedStateFromError(e: Error) {
    return { error: String(e?.message || e) }
  }
  componentDidCatch(e: Error, info: React.ErrorInfo) {
    ;(window as unknown as Record<string, unknown>).__finCrash = String(e?.stack || e).slice(0, 900)
    void info
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, background: '#fee2e2', color: '#991b1b', fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap' }}>
          <strong>Finance crash:</strong>
          {'\n'}
          {this.state.error}
        </div>
      )
    }
    return this.props.children
  }
}

function FinanceDashboardContentInner() {
  const [groupId, setGroupId] = useState('cash')
  const [item, setItem] = useState('Cash Flow')
  const [showAddExpense, setShowAddExpense] = useState(false)
  const live = useFinanceLive()

  const selectGroup = (id: string) => {
    const next = navGroups.find((g) => g.id === id)
    if (!next) return
    setGroupId(id)
    setItem(next.items[0])
  }

  return (
    <div className="font-jakarta h-full overflow-y-auto bg-canvas">
      <main className="mx-auto flex max-w-[1200px] flex-col gap-5 p-4 md:p-6">
        <Header
          groupId={groupId}
          item={item}
          onGroup={selectGroup}
          onItem={setItem}
          userName={live.me.fullName}
          avatarUrl={live.me.avatarUrl}
          unreadCount={live.unreadCount}
        />
        {item === 'Cash Flow' ? (
          <CashFlowDashboard
            live={live}
            onCatatKasKeluar={() => setShowAddExpense(true)}
            onOpenBankRec={() => {
              setGroupId('cash')
              setItem('Bank Reconciliation')
            }}
          />
        ) : (
          <ModulePage key={item} item={item} live={live} onOpenAddExpense={() => setShowAddExpense(true)} />
        )}
      </main>

      {showAddExpense && (
        <AddExpenseModal
          categories={Object.entries(live.categoryNames).map(([id, name]) => ({ id, name }))}
          onClose={() => setShowAddExpense(false)}
          onCreated={live.reload}
        />
      )}
    </div>
  )
}

export function FinanceDashboardContent() {
  return (
    <FinanceErrorBoundary>
      <FinanceDashboardContentInner />
    </FinanceErrorBoundary>
  )
}
