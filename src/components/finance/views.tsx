import { useState } from 'react'
import type { ReactNode } from 'react'

const card = 'rounded-[20px] border border-[#EAEDF2] bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.02)]'
const idr = (n: number) => 'Rp' + new Intl.NumberFormat('id-ID').format(Math.round(n))
const input = 'w-full rounded-xl border border-track bg-white px-3 py-2 text-sm outline-none focus:border-forest'

// Tombol aksi per baris tabel — HANYA yang punya endpoint nyata.
// (Bayar PO / Post jurnal / Terbitkan bukti potong dll. butuh backend terpisah.)
export const rowActions: Record<string, string> = {
  Expenses: 'Setujui', 'Deposit & Advance': 'Alokasi',
  'Compensation Review': 'Setujui', 'Business Case': 'Setujui', 'Risk & Decision': 'Putuskan',
}

// ---------- Bars ----------
export type Bar = [label: string, pct: number, text: string]
const bars: Record<string, { title: string; data: Bar[] }> = {
  'Budget Planning': { title: 'Penggunaan Budget', data: [['Sales', 90, 'Rp812 jt / Rp900 jt'], ['Operations', 100, 'Rp1,5 M / Rp1,4 M'], ['HR', 68, 'Rp410 jt / Rp600 jt']] },
  'Cost Analysis': { title: 'Porsi Biaya', data: [['Produksi', 46, '46%'], ['Pemasaran', 25, '25%'], ['Administrasi', 16, '16%'], ['Lainnya', 13, '13%']] },
  Utilities: { title: 'Biaya per Tagihan', data: [['Listrik', 100, 'Rp54 jt'], ['Internet', 33, 'Rp18 jt'], ['Air', 11, 'Rp6 jt']] },
  Receivables: { title: 'Aging Piutang', data: [['0-30 hari', 78, 'Rp1,8 M'], ['31-60 hari', 18, 'Rp410 jt'], ['>60 hari', 4, 'Rp90 jt']] },
  'Company Report': { title: 'Revenue per Entitas', data: [['PT Induk', 100, 'Rp3,8 M'], ['PT Anak A', 42, 'Rp1,6 M'], ['PT Anak B', 21, 'Rp800 jt']] },
  'Inventory Valuation': { title: 'Nilai per Gudang', data: [['Jakarta', 100, 'Rp1,6 M'], ['Surabaya', 61, 'Rp980 jt'], ['Bandung', 39, 'Rp620 jt']] },
  'HPP / COGS Review': { title: 'Margin per Produk', data: [['Produk A', 50, '50%'], ['Produk B', 35, '35%'], ['Produk F', 21, '21%']] },
  'Gross Margin': { title: 'Gross Margin per Produk', data: [['Produk A', 50, '50%'], ['Produk B', 35, '35%'], ['Produk F', 21, '21%']] },
  'Fixed Assets': { title: 'Nilai Buku vs Perolehan', data: [['Mesin Produksi 01', 70, '70%'], ['Kendaraan Operasional', 50, '50%'], ['Server Rack', 25, '25%']] },
  'Business Case': { title: 'NPV per Proposal', data: [['Gudang Baru', 100, 'Rp540 jt'], ['Mesin Produksi', 57, 'Rp310 jt'], ['ERP Upgrade', 7, 'Rp40 jt']] },
}

function Bars({ title, data }: { title: string; data: Bar[] }) {
  return (
    <section className={card}>
      <h2 className="text-lg font-medium">{title}</h2>
      <ul className="mt-5 space-y-4">
        {data.map(([label, pct, text]) => (
          <li key={label}>
            <div className="mb-1.5 flex justify-between text-sm text-muted"><span>{label}</span><span>{text}</span></div>
            <div className="h-2.5 rounded-full bg-track">
              <div className={`h-full rounded-full ${pct >= 100 && title.includes('Budget') ? 'bg-loss' : 'bg-lime-deep'}`} style={{ width: `${pct}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ---------- Statement (P&L / Neraca) ----------
type Row = [label: string, value: string, kind: 'h' | 'r' | 't']
const statements: Record<string, { title: string; rows: Row[] }> = {
  'P&L': {
    title: 'Laba Rugi - Oktober 2026',
    rows: [['Pendapatan', '', 'h'], ['Penjualan Produk', 'Rp5,4 M', 'r'], ['Pendapatan Jasa', 'Rp800 jt', 'r'], ['Total Pendapatan', 'Rp6,2 M', 't'],
      ['Beban', '', 'h'], ['Beban Pokok Penjualan', 'Rp2,6 M', 'r'], ['Gaji & Tunjangan', 'Rp1,0 M', 'r'], ['Operasional', 'Rp700 jt', 'r'], ['Total Beban', 'Rp4,3 M', 't'],
      ['Laba Bersih', 'Rp1,9 M', 't']],
  },
  'Balance Sheet': {
    title: 'Neraca - 31 Oktober 2026',
    rows: [['Aset', '', 'h'], ['Kas & Bank', 'Rp3,48 M', 'r'], ['Piutang Usaha', 'Rp2,3 M', 'r'], ['Persediaan', 'Rp3,2 M', 'r'], ['Aset Tetap', 'Rp4,7 M', 'r'], ['Aset Lain', 'Rp1,12 M', 'r'], ['Total Aset', 'Rp14,8 M', 't'],
      ['Liabilitas', '', 'h'], ['Hutang Usaha', 'Rp1,1 M', 'r'], ['Hutang Pajak', 'Rp300 jt', 'r'], ['Pinjaman Bank', 'Rp3,7 M', 'r'], ['Total Liabilitas', 'Rp5,1 M', 't'],
      ['Ekuitas', '', 'h'], ['Modal Disetor', 'Rp5,0 M', 'r'], ['Laba Ditahan', 'Rp4,7 M', 'r'], ['Total Ekuitas', 'Rp9,7 M', 't']],
  },
}

function Statement({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <section className={card}>
      <h2 className="text-lg font-medium">{title}</h2>
      <div className="mt-4">
        {rows.map(([label, value, kind], i) => (
          <div
            key={i}
            className={`flex justify-between py-2 text-sm ${
              kind === 'h' ? 'mt-3 text-xs font-semibold uppercase tracking-wide text-muted' : kind === 't' ? 'border-t border-track font-medium' : 'pl-4 text-muted'
            }`}
          >
            <span>{label}</span><span>{value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

// ---------- Invoice Builder ----------
function InvoiceForm({
  live,
  onCreated,
}: {
  live?: { clientNames: Record<string, string> }
  onCreated?: () => void
}) {
  const [clientId, setClientId] = useState('')
  const [items, setItems] = useState([{ d: '', q: 1, p: 0 }])
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState('')
  const set = (i: number, k: 'd' | 'q' | 'p', v: string) =>
    setItems(items.map((x, j) => (j === i ? { ...x, [k]: k === 'd' ? v : Number(v) || 0 } : x)))
  const sub = items.reduce((s, x) => s + x.q * x.p, 0)

  const submit = async () => {
    if (!clientId || !sub || sending) return
    setSending(true)
    setMsg('')
    try {
      const { invoicesApi } = await import('../../lib/endpoints')
      const now = new Date()
      const pad = (n: number) => String(n).padStart(2, '0')
      const localDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
      const ymd = localDate.replace(/-/g, '')
      const due = new Date(now.getTime() + 14 * 86_400_000)
      const dueLocal = `${due.getFullYear()}-${pad(due.getMonth() + 1)}-${pad(due.getDate())}`
      const res = await invoicesApi.create({
        invoiceNumber: `INV-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`,
        clientId,
        issueDate: localDate,
        dueDate: dueLocal,
        taxRate: 11,
        discountAmount: 0,
        items: items
          .filter((x) => x.d.trim() && x.q > 0)
          .map((x) => ({ itemName: x.d.trim(), quantity: x.q, unitPrice: x.p })),
      })
      if (res?.error) {
        setMsg(String(res.error))
      } else {
        setMsg('')
        setItems([{ d: '', q: 1, p: 0 }])
        setClientId('')
        onCreated?.()
      }
    } catch {
      setMsg('Gagal membuat invoice.')
    } finally {
      setSending(false)
    }
  }

  const clientOptions = Object.entries(live?.clientNames ?? {})
  return (
    <section className={card}>
      <h2 className="text-lg font-medium">Buat Invoice</h2>
      <label className="mt-3 block text-xs text-muted">
        Pelanggan
        <select className={`${input} mt-1`} value={clientId} onChange={(e) => setClientId(e.target.value)} aria-label="Pelanggan">
          <option value="">— Pilih pelanggan —</option>
          {clientOptions.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      </label>
      <div className="mt-4 grid grid-cols-12 gap-2 text-xs text-muted">
        <span className="col-span-6">Deskripsi</span><span className="col-span-2">Qty</span><span className="col-span-4">Harga</span>
      </div>
      <div className="mt-1 space-y-2">
        {items.map((x, i) => (
          <div key={i} className="grid grid-cols-12 gap-2">
            <input className={`${input} col-span-6`} value={x.d} onChange={(e) => set(i, 'd', e.target.value)} aria-label="Deskripsi" placeholder="Item / jasa" />
            <input className={`${input} col-span-2`} type="number" value={x.q} onChange={(e) => set(i, 'q', e.target.value)} aria-label="Qty" />
            <input className={`${input} col-span-4`} type="number" value={x.p} onChange={(e) => set(i, 'p', e.target.value)} aria-label="Harga" />
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <button type="button" onClick={() => setItems([...items, { d: '', q: 1, p: 0 }])} className="rounded-full border border-forest px-4 py-1.5 text-sm font-medium text-forest">
          + Tambah baris
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={!clientId || sub <= 0 || sending}
          className="rounded-full bg-forest px-5 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {sending ? 'Menyimpan…' : 'Simpan Invoice'}
        </button>
      </div>
      <dl className="mt-5 space-y-1.5 border-t border-track pt-4 text-sm">
        <div className="flex justify-between text-muted"><dt>Subtotal</dt><dd>{idr(sub)}</dd></div>
        <div className="flex justify-between text-muted"><dt>PPN 11%</dt><dd>{idr(sub * 0.11)}</dd></div>
        <div className="flex justify-between text-base font-medium"><dt>Total</dt><dd>{idr(sub * 1.11)}</dd></div>
      </dl>
      <p className="mt-2 text-xs text-loss" role="status">{msg}</p>
    </section>
  )
}

// ---------- Tax calculator ----------
const taxes: [string, number][] = [['PPN 11%', 0.11], ['PPh 23 (jasa) 2%', 0.02], ['PPh 4(2) sewa 10%', 0.1]]
function TaxCalc() {
  const [dpp, setDpp] = useState(100_000_000)
  const [t, setT] = useState(0)
  return (
    <section className={card}>
      <h2 className="text-lg font-medium">Kalkulator Pajak</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="text-xs text-muted">DPP (Rp)
          <input className={`${input} mt-1`} type="number" value={dpp} onChange={(e) => setDpp(Number(e.target.value) || 0)} />
        </label>
        <label className="text-xs text-muted">Jenis pajak
          <select className={`${input} mt-1`} value={t} onChange={(e) => setT(Number(e.target.value))}>
            {taxes.map(([n], i) => <option key={n} value={i}>{n}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-5 flex justify-between rounded-2xl bg-lime p-4 text-forest">
        <span className="text-sm">Pajak terutang</span><span className="text-xl font-medium">{idr(dpp * taxes[t][1])}</span>
      </div>
    </section>
  )
}

// ---------- Scenario (live) ----------
function Scenario({
  scenarios,
}: {
  scenarios: Array<{ id: string; name: string; revenueTarget: number; costTarget: number; assumption: string | null }>
}) {
  const [sel, setSel] = useState(scenarios[0]?.id ?? '')
  const active = scenarios.find((s) => s.id === sel) ?? scenarios[0]
  return (
    <section className={card}>
      <h2 className="text-lg font-medium">Skenario</h2>
      <div className="mt-4 flex gap-2">
        {scenarios.map((s) => (
          <button key={s.id} type="button" onClick={() => setSel(s.id)} aria-pressed={s.id === active?.id}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${s.id === active?.id ? 'bg-forest text-white' : 'border border-track text-muted'}`}>{s.name}</button>
        ))}
      </div>
      {active && (
        <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
          {[
            ['Revenue', idr(active.revenueTarget)],
            ['Biaya', idr(active.costTarget)],
            ['Laba', idr(active.revenueTarget - active.costTarget)],
          ].map(([l, v]) => (
            <div key={l} className="rounded-2xl bg-canvas p-4"><p className="text-xs text-muted">{l}</p><p className="mt-1 text-xl font-medium">{v}</p></div>
          ))}
        </div>
      )}
    </section>
  )
}

// ---------- Risk matrix (live) ----------
function RiskMatrix({
  risks,
}: {
  risks: Array<{ id: string; name: string; impactAmount: number; impactLevel: number; probability: number; status: string }>
}) {
  return (
    <section className={card}>
      <h2 className="text-lg font-medium">Matriks Risiko</h2>
      <p className="mt-1 text-xs text-muted">Baris: dampak (tinggi ke rendah) · Kolom: probabilitas (rendah ke tinggi)</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[2, 1, 0].flatMap((r) => [0, 1, 2].map((c) => {
          const sev = 2 - r + c
          return (
            <div key={`${r}${c}`} className={`min-h-16 rounded-2xl p-2 text-xs ${sev >= 3 ? 'bg-[#fdeaea]' : sev === 2 ? 'bg-[#fff8f4]' : 'bg-lime/30'}`}>
              {risks.filter((x) => x.impactLevel === r && x.probability === c).map((x) => <p key={x.id} className="font-medium">{x.name}</p>)}
            </div>
          )
        }))}
      </div>
    </section>
  )
}

// ---------- Components & Rules (live, toggle → PATCH) ----------
function Rules({
  components,
  onToggle,
}: {
  components: Array<{ id: string; name: string; type: string; rule: string | null; isActive: boolean }>
  onToggle: (id: string, next: boolean) => void
}) {
  return (
    <section className={card}>
      <h2 className="text-lg font-medium">Komponen & Aturan Aktif</h2>
      <ul className="mt-3 divide-y divide-track">
        {components.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{c.name}</p>
              <p className="text-xs text-muted">{c.type === 'potongan' ? 'Potongan' : 'Pendapatan'} · {c.rule ?? '—'}</p>
            </div>
            <button type="button" role="switch" aria-checked={c.isActive} aria-label={`Aktifkan ${c.name}`} onClick={() => onToggle(c.id, !c.isActive)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${c.isActive ? 'bg-forest' : 'bg-track'}`}>
              <span className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${c.isActive ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </li>
        ))}
        {components.length === 0 && <li className="py-4 text-center text-sm text-muted">Belum ada komponen.</li>}
      </ul>
    </section>
  )
}

export function ItemView({
  item,
  liveBars,
  liveStatement,
  live,
  onCreated,
  liveReady,
  onToggleComponent,
}: {
  item: string
  liveBars?: { title: string; data: Bar[] } | null
  liveStatement?: { title: string; rows: Array<[string, string, 'h' | 'r' | 't']> } | null
  live?: { clientNames: Record<string, string>; scenarios: Array<{ id: string; name: string; revenueTarget: number; costTarget: number; assumption: string | null }>; payrollComponents: Array<{ id: string; name: string; type: string; rule: string | null; isActive: boolean }>; risks: Array<{ id: string; name: string; impactAmount: number; impactLevel: number; probability: number; status: string }> }
  onCreated?: () => void
  liveReady?: boolean
  onToggleComponent?: (id: string, next: boolean) => void
}): ReactNode {
  if (item === 'Invoice Builder') return <InvoiceForm live={live} onCreated={onCreated} />
  if (item === 'Tax Setup & Calculator') return <TaxCalc />
  // Halaman wired: widget & laporan dari data live; sembunyikan saat loading/error (tanpa data demo).
  if (item === 'Bank Reconciliation' || item === 'Withholding') return null
  if (item === 'Scenario & Forecast') return liveReady && live && live.scenarios.length > 0 ? <Scenario scenarios={live.scenarios} /> : null
  if (item === 'Components & Rules') return liveReady && live && onToggleComponent ? <Rules components={live.payrollComponents} onToggle={onToggleComponent} /> : null
  if (item === 'Risk & Decision') return liveReady && live ? <RiskMatrix risks={live.risks} /> : null
  if (item === 'Payroll Run' || item === 'Accounting' || item === 'Tax Report' || item === 'Compensation Review' || item === 'Deposit & Advance' || item === 'Payroll Tax') return null
  if (item === 'P&L' || item === 'Balance Sheet' || item === 'Company Report') return liveStatement ? <Statement {...liveStatement} /> : null
  if (
    ['Receivables', 'Budget Planning', 'Cost Analysis', 'Fixed Assets', 'Inventory Valuation',
      'HPP / COGS Review', 'Gross Margin', 'Payables & Recurring', 'Utilities', 'Business Case'].includes(item)
  ) {
    return liveBars ? <Bars {...liveBars} /> : null
  }
  if (statements[item]) return <Statement {...statements[item]} />
  if (bars[item]) return <Bars {...bars[item]} />
  return null
}
