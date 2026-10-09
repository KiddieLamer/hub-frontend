import { useState } from 'react'
import type { ReactNode } from 'react'

const card = 'rounded-[28px] bg-white p-6 shadow-sm'
const idr = (n: number) => 'Rp' + new Intl.NumberFormat('id-ID').format(Math.round(n))
const input = 'w-full rounded-xl border border-track bg-white px-3 py-2 text-sm outline-none focus:border-forest'

// Tombol aksi per baris tabel (muncul di baris yang belum final)
export const rowActions: Record<string, string> = {
  Expenses: 'Setujui', 'Payables & Recurring': 'Bayar', 'Deposit & Advance': 'Alokasi', 'Company Report': 'Finalisasi', Accounting: 'Post',
  'Tax Report': 'Bayar', 'Payroll Tax': 'Bayar', Withholding: 'Terbitkan',
  'Payroll Run': 'Approve', 'Compensation Review': 'Setujui', 'Business Case': 'Setujui', 'Risk & Decision': 'Putuskan',
}

// ---------- Bars ----------
type Bar = [label: string, pct: number, text: string]
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
function InvoiceForm() {
  const [items, setItems] = useState([{ d: 'Jasa implementasi', q: 1, p: 15_000_000 }])
  const set = (i: number, k: 'd' | 'q' | 'p', v: string) =>
    setItems(items.map((x, j) => (j === i ? { ...x, [k]: k === 'd' ? v : Number(v) || 0 } : x)))
  const sub = items.reduce((s, x) => s + x.q * x.p, 0)
  return (
    <section className={card}>
      <h2 className="text-lg font-medium">Buat Invoice</h2>
      <div className="mt-4 grid grid-cols-12 gap-2 text-xs text-muted">
        <span className="col-span-6">Deskripsi</span><span className="col-span-2">Qty</span><span className="col-span-4">Harga</span>
      </div>
      <div className="mt-1 space-y-2">
        {items.map((x, i) => (
          <div key={i} className="grid grid-cols-12 gap-2">
            <input className={`${input} col-span-6`} value={x.d} onChange={(e) => set(i, 'd', e.target.value)} aria-label="Deskripsi" />
            <input className={`${input} col-span-2`} type="number" value={x.q} onChange={(e) => set(i, 'q', e.target.value)} aria-label="Qty" />
            <input className={`${input} col-span-4`} type="number" value={x.p} onChange={(e) => set(i, 'p', e.target.value)} aria-label="Harga" />
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setItems([...items, { d: '', q: 1, p: 0 }])} className="mt-3 rounded-full border border-forest px-4 py-1.5 text-sm font-medium text-forest">
        + Tambah baris
      </button>
      <dl className="mt-5 space-y-1.5 border-t border-track pt-4 text-sm">
        <div className="flex justify-between text-muted"><dt>Subtotal</dt><dd>{idr(sub)}</dd></div>
        <div className="flex justify-between text-muted"><dt>PPN 11%</dt><dd>{idr(sub * 0.11)}</dd></div>
        <div className="flex justify-between text-base font-medium"><dt>Total</dt><dd>{idr(sub * 1.11)}</dd></div>
      </dl>
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

// ---------- Scenario ----------
const scenarios: Record<string, [string, string, string]> = {
  'Best case': ['Rp7,4 M', 'Rp4,3 M', 'Rp3,1 M'], 'Base case': ['Rp6,8 M', 'Rp4,1 M', 'Rp2,7 M'], 'Worst case': ['Rp6,0 M', 'Rp4,2 M', 'Rp1,8 M'],
}
function Scenario() {
  const [s, setS] = useState('Base case')
  return (
    <section className={card}>
      <h2 className="text-lg font-medium">Skenario</h2>
      <div className="mt-4 flex gap-2">
        {Object.keys(scenarios).map((k) => (
          <button key={k} type="button" onClick={() => setS(k)} aria-pressed={k === s}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${k === s ? 'bg-forest text-white' : 'border border-track text-muted'}`}>{k}</button>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
        {['Revenue', 'Biaya', 'Laba'].map((l, i) => (
          <div key={l} className="rounded-2xl bg-canvas p-4"><p className="text-xs text-muted">{l}</p><p className="mt-1 text-xl font-medium">{scenarios[s][i]}</p></div>
        ))}
      </div>
    </section>
  )
}

// ---------- Risk matrix ----------
const risks: [string, number, number][] = [['Fluktuasi kurs', 0, 2], ['Kenaikan bahan baku', 0, 1], ['Keterlambatan proyek', 1, 1]]
function RiskMatrix() {
  return (
    <section className={card}>
      <h2 className="text-lg font-medium">Matriks Risiko</h2>
      <p className="mt-1 text-xs text-muted">Baris: dampak (tinggi ke rendah) · Kolom: probabilitas (rendah ke tinggi)</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => {
          const sev = 2 - r + c
          return (
            <div key={`${r}${c}`} className={`min-h-16 rounded-2xl p-2 text-xs ${sev >= 3 ? 'bg-[#fdeaea]' : sev === 2 ? 'bg-[#fff8f4]' : 'bg-lime/30'}`}>
              {risks.filter((x) => x[1] === r && x[2] === c).map((x) => <p key={x[0]} className="font-medium">{x[0]}</p>)}
            </div>
          )
        }))}
      </div>
    </section>
  )
}

// ---------- Components & Rules ----------
const rules0: [string, string, string, boolean][] = [
  ['Gaji Pokok', 'Pendapatan', 'Tetap', true], ['Tunjangan Transport', 'Pendapatan', 'Per hari hadir', true],
  ['Tunjangan Makan', 'Pendapatan', 'Per hari hadir', false], ['Lembur', 'Pendapatan', '1,5x upah per jam', true],
  ['BPJS Kesehatan', 'Potongan', '1% gaji', true], ['BPJS Ketenagakerjaan', 'Potongan', '2% gaji', true],
]
function Rules() {
  const [rules, setRules] = useState(rules0)
  const toggle = (i: number) => setRules(rules.map((r, j) => (j === i ? [r[0], r[1], r[2], !r[3]] : r)))
  return (
    <section className={card}>
      <h2 className="text-lg font-medium">Komponen & Aturan Aktif</h2>
      <ul className="mt-3 divide-y divide-track">
        {rules.map(([n, t, rule, on], i) => (
          <li key={n} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{n}</p>
              <p className="text-xs text-muted">{t} · {rule}</p>
            </div>
            <button type="button" role="switch" aria-checked={on} aria-label={`Aktifkan ${n}`} onClick={() => toggle(i)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-forest' : 'bg-track'}`}>
              <span className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ---------- Payroll Run: daftar karyawan ----------
const emps: [name: string, dept: string, gross: number, allow: number, ded: number][] = [
  ['Andi Pratama', 'Operations', 12e6, 4e6, 1.2e6], ['Sari Wulandari', 'Sales', 16e6, 6e6, 2.4e6],
  ['Budi Hartono', 'Finance', 22e6, 8e6, 4.1e6], ['Dewi Lestari', 'HR', 11e6, 3e6, 0.9e6],
]
function PayrollEmployees() {
  const [ok, setOk] = useState<string[]>([])
  const net = (e: (typeof emps)[number]) => e[2] + e[3] - e[4]
  const total = emps.filter((e) => ok.includes(e[0])).reduce((s, e) => s + net(e), 0)
  return (
    <section className={card}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Slip Gaji Karyawan</h2>
        <button type="button" onClick={() => setOk(ok.length === emps.length ? [] : emps.map((e) => e[0]))}
          className="rounded-full border border-forest px-4 py-1.5 text-sm font-medium text-forest">
          {ok.length === emps.length ? 'Batalkan semua' : 'Approve semua'}
        </button>
      </div>
      <ul className="mt-3 divide-y divide-track">
        {emps.map((e) => (
          <li key={e[0]} className="flex items-center gap-3 py-3">
            <input type="checkbox" className="size-4 accent-[#0f3b2e]" checked={ok.includes(e[0])} aria-label={`Approve ${e[0]}`}
              onChange={() => setOk(ok.includes(e[0]) ? ok.filter((x) => x !== e[0]) : [...ok, e[0]])} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{e[0]}</p>
              <p className="text-xs text-muted">{e[1]} · Pokok {idr(e[2])} + Tunjangan {idr(e[3])} - Potongan {idr(e[4])}</p>
            </div>
            <p className="text-sm font-medium">{idr(net(e))}</p>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex justify-between border-t border-track pt-4 text-sm">
        <span className="text-muted">Total disetujui ({ok.length}/{emps.length})</span><span className="text-base font-medium">{idr(total)}</span>
      </div>
    </section>
  )
}

// ---------- Bank Reconciliation: bank vs jurnal ----------
type Tx = { id: string; d: string; a: number }
const bank: Tx[] = [{ id: 'b1', d: 'TRF PT Maju Jaya', a: 180e6 }, { id: 'b2', d: 'Biaya admin bank', a: -250e3 }, { id: 'b3', d: 'TRF Vendor Logistik', a: -72e6 }]
const ledger: Tx[] = [{ id: 'l1', d: 'Penerimaan INV-1042', a: 180e6 }, { id: 'l2', d: 'Pembayaran Vendor Logistik', a: -72e6 }, { id: 'l3', d: 'Biaya admin bank', a: -300e3 }]
const signed = (a: number) => (a < 0 ? '-' : '+') + idr(Math.abs(a))

function Col({ title, list, sel, onSel, used }: { title: string; list: Tx[]; sel: string | null; onSel: (id: string) => void; used: string[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted">{title}</p>
      <ul className="space-y-2">
        {list.map((t) => {
          const m = used.includes(t.id)
          return (
            <li key={t.id}>
              <button type="button" disabled={m} onClick={() => onSel(t.id)} aria-pressed={sel === t.id}
                className={`w-full rounded-2xl border p-3 text-left text-sm ${m ? 'border-transparent bg-lime/40' : sel === t.id ? 'border-forest bg-white' : 'border-track bg-canvas'}`}>
                <span className="block truncate">{m ? '✓ ' : ''}{t.d}</span>
                <span className={`text-xs ${t.a < 0 ? 'text-loss' : 'text-gain'}`}>{signed(t.a)}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Reconcile() {
  const [b, setB] = useState<string | null>(null)
  const [l, setL] = useState<string | null>(null)
  const [pairs, setPairs] = useState<string[]>([])
  const [msg, setMsg] = useState('')
  const match = () => {
    const x = bank.find((t) => t.id === b), y = ledger.find((t) => t.id === l)
    if (!x || !y) return
    if (x.a !== y.a) return setMsg(`Nominal berbeda, selisih ${idr(Math.abs(x.a - y.a))}`)
    setPairs([...pairs, x.id, y.id]); setB(null); setL(null); setMsg('')
  }
  return (
    <section className={card}>
      <h2 className="text-lg font-medium">Pencocokan Bank vs Jurnal</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Col title="Mutasi Bank" list={bank} sel={b} onSel={setB} used={pairs} />
        <Col title="Jurnal" list={ledger} sel={l} onSel={setL} used={pairs} />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button type="button" disabled={!b || !l} onClick={match} className="rounded-full bg-forest px-5 py-2 text-sm font-medium text-white disabled:opacity-40">Match</button>
        <p className="text-xs text-loss" role="status">{msg}</p>
      </div>
    </section>
  )
}

export function ItemView({ item }: { item: string }): ReactNode {
  if (item === 'Invoice Builder') return <InvoiceForm />
  if (item === 'Tax Setup & Calculator') return <TaxCalc />
  if (item === 'Scenario & Forecast') return <Scenario />
  if (item === 'Risk & Decision') return <RiskMatrix />
  if (item === 'Components & Rules') return <Rules />
  if (item === 'Payroll Run') return <PayrollEmployees />
  if (item === 'Bank Reconciliation') return <Reconcile />
  if (statements[item]) return <Statement {...statements[item]} />
  if (bars[item]) return <Bars {...bars[item]} />
  return null
}
