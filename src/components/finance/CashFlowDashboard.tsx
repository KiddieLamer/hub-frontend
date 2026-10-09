import { useEffect, useState } from 'react'
import type { ReactNode, SVGProps } from 'react'

// ======================================================================
// DATA (mock, dalam Rupiah)
// ======================================================================
type Currency = 'USD' | 'IDR' | 'MYR'
const currencies: Currency[] = ['USD', 'IDR', 'MYR']
const balanceByCurrency: Record<Currency, { symbol: string; amount: number; locale: string }> = {
  USD: { symbol: '$', amount: 212_400.5, locale: 'en-US' },
  IDR: { symbol: 'Rp', amount: 3_480_000_000, locale: 'id-ID' },
  MYR: { symbol: 'RM', amount: 998_700.25, locale: 'en-MY' },
}

const costCategories = [
  { id: 'rent', label: 'Sewa', amount: 500e6, icon: 'home', active: true },
  { id: 'logistic', label: 'Logistik', amount: 217e6, icon: 'bus', active: false },
  { id: 'marketing', label: 'Marketing', amount: 100e6, icon: 'bag', active: false },
  { id: 'admin', label: 'Admin', amount: 100e6, icon: 'receipt', active: false },
] as const

const revenueSources = [
  { id: 'service', label: 'Jasa', amount: 1850e6, share: 26 },
  { id: 'product', label: 'Penjualan Produk', amount: 3630e6, share: 51, highlight: true },
  { id: 'project', label: 'Proyek', amount: 1210e6, share: 17 },
  { id: 'others', label: 'Lainnya', amount: 420e6, share: 6 },
]

const transactions = [
  { id: 't1', title: 'Pembayaran PT Maju Jaya', meta: 'Hari ini, 09.00', amount: 180e6 },
  { id: 't2', title: 'Vendor Logistik', meta: 'Kemarin, 14.30', amount: -72e6 },
  { id: 't3', title: 'Sewa Kantor Oktober', meta: '1 Okt 2026', amount: -45e6 },
]

const rp = (n: number) =>
  n >= 1e9 ? `Rp${(n / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 2 })} M` : `Rp${Math.round(n / 1e6).toLocaleString('id-ID')} jt`
const rpSigned = (n: number) => `${n > 0 ? '+' : '-'}${rp(Math.abs(n))}`

// ======================================================================
// ICONS
// ======================================================================
type IconProps = SVGProps<SVGSVGElement>
const Base = ({ children, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {children}
  </svg>
)
const EyeIcon = (p: IconProps) => (<Base {...p}><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" /><circle cx="12" cy="12" r="2.6" /></Base>)
const EyeOffIcon = (p: IconProps) => (<Base {...p}><path d="M3 3l18 18" /><path d="M10.6 6a9.8 9.8 0 0 1 1.4-.1c6.4 0 10 6.1 10 6.1a17 17 0 0 1-3.2 3.9M6.3 7.7A17 17 0 0 0 2 12s3.6 6.5 10 6.5a9.6 9.6 0 0 0 4-.9" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></Base>)
const CopyIcon = (p: IconProps) => (<Base {...p}><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" /></Base>)
const DotsIcon = (p: IconProps) => (<Base {...p} fill="currentColor" stroke="none"><circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" /></Base>)
const ArrowUpRightIcon = (p: IconProps) => (<Base {...p}><path d="M7 17 17 7" /><path d="M8 7h9v9" /></Base>)
const UploadIcon = (p: IconProps) => (<Base {...p}><path d="M12 15V4" /><path d="m7.5 8.5 4.5-4.5 4.5 4.5" /><path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" /></Base>)
const HandCoinIcon = (p: IconProps) => (<Base {...p}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5V12a2.5 2.5 0 0 1-2.5 2.5H13l-4 3.5v-3.5H6.5A2.5 2.5 0 0 1 4 12Z" /><path d="M12 6.5v5M10 8.5h4" /></Base>)
const BagIcon = (p: IconProps) => (<Base {...p}><path d="M5.5 8h13l-1 11.5a1.5 1.5 0 0 1-1.5 1.4H8a1.5 1.5 0 0 1-1.5-1.4Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></Base>)
const CoinBagIcon = (p: IconProps) => (<Base {...p}><path d="M9.5 3.5h5l-1 2.5h-3Z" /><path d="M10 6c-3.5 2-5 5-5 8.2C5 18 8 20.5 12 20.5s7-2.5 7-6.3C19 11 17.5 8 14 6" /><path d="M12 11v5M10.5 12.5h2.2a1.1 1.1 0 0 1 0 2.2h-1.4a1.1 1.1 0 0 0 0 2.2H13.5" /></Base>)
const ReceiptIcon = (p: IconProps) => (<Base {...p}><path d="M6 3.5h12v17l-2.5-1.6-1.8 1.6-1.7-1.6-1.7 1.6-1.8-1.6L6 20.5Z" /><path d="M9.5 9h5M9.5 13h5" /></Base>)
const HomeIcon = (p: IconProps) => (<Base {...p}><path d="M4 11 12 4l8 7" /><path d="M6 10v9.5h12V10" /></Base>)
const BusIcon = (p: IconProps) => (<Base {...p}><rect x="4" y="4" width="16" height="13" rx="3" /><path d="M4 11h16M8 20v-3M16 20v-3" /></Base>)
const CheckIcon = (p: IconProps) => (<Base {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Base>)
const CloseIcon = (p: IconProps) => (<Base {...p}><path d="M6 6l12 12M18 6 6 18" /></Base>)
const SparkIcon = (p: IconProps) => (<Base {...p}><path d="M12 3c.6 4.7 2.3 6.4 7 7-4.7.6-6.4 2.3-7 7-.6-4.7-2.3-6.4-7-7 4.7-.6 6.4-2.3 7-7Z" /></Base>)
const TargetIcon = (p: IconProps) => (<Base {...p}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill="currentColor" /></Base>)
const iconMap = { home: HomeIcon, bus: BusIcon, bag: BagIcon, receipt: ReceiptIcon } as const

// ======================================================================
// BALANCE CARD
// ======================================================================
const ACCOUNT_NUMBER = '90340222748'

function Flag({ code }: { code: Currency }) {
  if (code !== 'USD') return null
  return (
    <span className="relative block size-6 overflow-hidden rounded-full bg-white ring-1 ring-black/5">
      <span className="absolute inset-0 bg-[repeating-linear-gradient(#d9363e_0_2px,#fff_2px_4px)]" />
      <span className="absolute left-0 top-0 h-3 w-3 bg-[#2b3a8c]" />
    </span>
  )
}

function BalanceCard() {
  const [currency, setCurrency] = useState<Currency>('IDR')
  const [hidden, setHidden] = useState(false)
  const [copied, setCopied] = useState(false)
  const { symbol, amount, locale } = balanceByCurrency[currency]
  const formatted = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ACCOUNT_NUMBER)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <section className="flex flex-col justify-between rounded-[28px] bg-white p-7 shadow-sm lg:col-span-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex rounded-full bg-canvas p-1">
          {currencies.map((code) => (
            <button key={code} type="button" onClick={() => setCurrency(code)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${currency === code ? 'bg-white shadow-sm' : 'text-muted hover:text-ink'}`}>
              <Flag code={code} />
              {code}
            </button>
          ))}
        </div>
        <div>
          <p className="text-xs text-muted">Rekening Operasional</p>
          <button type="button" onClick={copy} className="mt-0.5 flex items-center gap-2 text-lg font-medium tracking-wide">
            {ACCOUNT_NUMBER}
            <CopyIcon className={copied ? 'text-gain' : ''} />
          </button>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-sm text-muted">Saldo Kas Aktif</p>
        <div className="mt-1 flex items-center gap-3">
          <p className="text-5xl font-medium tracking-tight md:text-6xl">{hidden ? `${symbol}••••••` : `${symbol}${formatted}`}</p>
          <button type="button" aria-label={hidden ? 'Tampilkan saldo' : 'Sembunyikan saldo'} onClick={() => setHidden((v) => !v)}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-canvas text-lg text-muted">
            {hidden ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      <div className="mt-8 flex items-end justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white">
            <UploadIcon />
            Catat Kas Masuk
          </button>
          <button type="button" className="flex items-center gap-2 rounded-full border border-forest px-5 py-2.5 text-sm font-medium text-forest">
            <HandCoinIcon />
            Catat Kas Keluar
          </button>
          <button type="button" aria-label="More" className="px-1 text-forest"><DotsIcon /></button>
        </div>
        <button type="button" aria-label="Buka detail kas" className="grid size-16 place-items-center rounded-full bg-lime text-2xl text-forest transition-transform hover:scale-105">
          <ArrowUpRightIcon />
        </button>
      </div>
    </section>
  )
}

// ======================================================================
// HIGHLIGHT CARD (lime)
// ======================================================================
function Stat({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  const [hidden, setHidden] = useState(false)
  return (
    <div className="flex-1 rounded-2xl bg-white/35 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-forest/70">{label}</p>
        <button type="button" aria-label={`Toggle ${label}`} onClick={() => setHidden((v) => !v)} className="text-forest">
          {hidden ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      <p className="mt-2 flex items-center gap-2 text-xl font-medium text-forest">
        <span className="text-lg">{icon}</span>
        {hidden ? '••••' : value}
      </p>
    </div>
  )
}

function HighlightCard() {
  return (
    <section className="relative flex flex-col justify-between overflow-hidden rounded-[28px] bg-lime p-7 shadow-sm lg:col-span-5">
      <svg viewBox="0 0 100 100" className="pointer-events-none absolute -right-6 top-2 size-52 text-lime-deep/70" aria-hidden="true">
        <path fill="currentColor" d="M50 0C54 30 70 46 100 50 70 54 54 70 50 100 46 70 30 54 0 50 30 46 46 30 50 0Z" />
      </svg>
      <div className="relative flex items-center justify-between">
        <span className="flex items-center gap-2 rounded-full bg-forest py-1.5 pl-5 pr-1.5 text-sm font-semibold tracking-wider text-lime">
          CASH HEALTH
          <span className="grid size-8 place-items-center rounded-full bg-lime text-forest"><SparkIcon /></span>
        </span>
        <button type="button" aria-label="More" className="grid size-10 place-items-center rounded-full bg-white/35 text-forest"><DotsIcon /></button>
      </div>
      <div className="relative mt-8">
        <p className="text-sm text-forest/70">Laba Bersih Bulan Ini</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <p className="text-5xl font-medium tracking-tight text-forest">Rp1,9 M</p>
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gain">+22% vs bulan lalu</span>
        </div>
      </div>
      <div className="relative mt-8 flex gap-3">
        <Stat label="Piutang" value="Rp2,3 M" icon={<CoinBagIcon />} />
        <Stat label="Hutang" value="Rp1,1 M" icon={<ReceiptIcon />} />
      </div>
    </section>
  )
}

// ======================================================================
// COST DONUT CARD
// ======================================================================
const SIZE = 150
const CENTER = SIZE / 2
const RADIUS = 60
const STROKE = 11
const GAP_DEG = 4
const CAP_DEG = (STROKE / 2 / RADIUS) * (180 / Math.PI)
const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function polar(deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return [CENTER + RADIUS * Math.cos(rad), CENTER + RADIUS * Math.sin(rad)]
}
function arcPath(from: number, to: number) {
  const [x1, y1] = polar(from)
  const [x2, y2] = polar(to)
  return `M ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${to - from > 180 ? 1 : 0} 1 ${x2} ${y2}`
}
function buildSegments(items: readonly { id: string; amount: number }[], total: number) {
  if (items.length === 0 || total <= 0) return []
  let cursor = 180 - ((items[0].amount / total) * 360) / 2
  const inset = GAP_DEG / 2 + CAP_DEG
  return items.map((item) => {
    const sweep = (item.amount / total) * 360
    const from = cursor + inset
    const to = Math.max(from + 0.1, cursor + sweep - inset)
    cursor += sweep
    return { id: item.id, d: arcPath(from, to) }
  })
}
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (prefersReducedMotion()) { setValue(target); return }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      setValue(target * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

function CostCard() {
  const total = costCategories.reduce((s, c) => s + c.amount, 0)
  const animatedTotal = useCountUp(total)
  const segments = buildSegments(costCategories, total)
  const [selectedId, setSelectedId] = useState<string>(costCategories.find((c) => c.active)?.id ?? costCategories[0].id)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [drawn, setDrawn] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 60)
    return () => clearTimeout(t)
  }, [])
  const highlightId = hoverId ?? selectedId
  const hovered = costCategories.find((c) => c.id === hoverId)
  const reduced = prefersReducedMotion()

  return (
    <section className="rounded-[28px] bg-white p-6 shadow-sm lg:col-span-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full border border-track text-lg"><BagIcon /></span>
          <h2 className="text-lg font-medium">Biaya</h2>
        </div>
        <button type="button" className="rounded-full border border-track px-4 py-2 text-sm font-medium">Oktober</button>
      </div>

      <div className="relative mx-auto mt-5 size-[170px]">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-full">
          {segments.map((s, i) => (
            <path key={s.id} d={s.d} pathLength={1} fill="none" strokeWidth={STROKE} strokeLinecap="round"
              stroke={highlightId === s.id ? 'var(--color-lime-deep)' : 'var(--color-track)'}
              strokeDasharray="1 1" strokeDashoffset={drawn || reduced ? 0 : 1} opacity={drawn || reduced ? 1 : 0}
              className="cursor-pointer"
              style={{ transition: reduced ? 'none' : `stroke-dashoffset 800ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 140}ms, opacity 200ms ${i * 140}ms, stroke 300ms` }}
              onMouseEnter={() => setHoverId(s.id)} onMouseLeave={() => setHoverId(null)} onClick={() => setSelectedId(s.id)} />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
          {hovered ? (
            <>
              <p className="text-2xl font-normal">{rp(hovered.amount)}</p>
              <p className="text-sm text-muted">{hovered.label} · {Math.round((hovered.amount / total) * 100)}%</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-normal">{rp(animatedTotal)}</p>
              <p className="text-sm font-medium text-loss">+12%</p>
            </>
          )}
        </div>
      </div>

      <p className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full border border-track px-3 py-1.5 text-xs font-medium">
        <SparkIcon className="text-sm" />
        Biaya sewa naik <span className="text-loss">8,4%</span>
      </p>

      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        {costCategories.map((c) => {
          const Icon = iconMap[c.icon]
          return (
            <li key={c.id} onMouseEnter={() => setHoverId(c.id)} onMouseLeave={() => setHoverId(null)} onClick={() => setSelectedId(c.id)}
              className={`flex cursor-pointer items-center gap-1.5 transition-colors ${highlightId === c.id ? 'font-medium text-ink' : 'text-muted/80'}`}>
              <Icon className="text-sm" />
              <span className="truncate">{c.label} {rp(c.amount)}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

// ======================================================================
// REVENUE CARD
// ======================================================================
function RevenueCard() {
  const goal = 8400e6
  const earned = 7110e6
  const goalPct = Math.min(100, (earned / goal) * 100)
  return (
    <section className="rounded-[28px] bg-white p-6 shadow-sm lg:col-span-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full border border-track text-lg"><CoinBagIcon /></span>
          <h2 className="text-lg font-medium">Pendapatan</h2>
        </div>
        <div className="w-28">
          <p className="flex items-center justify-end gap-1.5 text-sm font-medium"><TargetIcon className="text-ember" />{rp(goal)}</p>
          <div className="mt-1.5 h-1 rounded-full bg-track"><div className="h-full rounded-full bg-ember" style={{ width: `${goalPct}%` }} /></div>
        </div>
      </div>

      <p className="mt-6 text-5xl font-medium tracking-tight">{rp(earned)}</p>
      <p className="mt-1 text-xs text-muted"><span className="font-medium text-gain">+18%</span> vs bulan lalu</p>

      <ul className="mt-6 space-y-4">
        {revenueSources.map((s) => (
          <li key={s.id}>
            <div className="mb-1.5 flex items-center justify-between text-sm text-muted"><span>{s.label}</span><span>{rp(s.amount)}</span></div>
            <div className="relative h-2.5 rounded-full bg-track">
              <div className={`h-full rounded-full ${s.highlight ? 'bg-lime-deep' : 'bg-[#cfd1ce]'}`} style={{ width: `${s.highlight ? s.share : s.share * 0.6}%` }} />
              {s.highlight && (
                <span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-forest px-2 py-0.5 text-[11px] font-medium text-white" style={{ left: `${s.share}%` }}>
                  {s.share}%
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ======================================================================
// TRANSACTIONS CARD
// ======================================================================
const initials = (t: string) => t.split(' ').slice(0, 2).map((w) => w[0]).join('')

function Logo({ text }: { text: string }) {
  return <span className="grid size-11 shrink-0 place-items-center rounded-full border border-track bg-white text-sm font-semibold text-forest">{text}</span>
}

function TransactionsCard() {
  const [pending, setPending] = useState<'pending' | 'approved' | 'declined'>('pending')
  return (
    <section className="rounded-[28px] bg-white p-6 shadow-sm lg:col-span-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full border border-track text-lg"><ReceiptIcon /></span>
          <h2 className="text-lg font-medium">Transaksi</h2>
        </div>
        <button type="button" aria-label="More" className="grid size-10 place-items-center rounded-full border border-track"><DotsIcon /></button>
      </div>

      {pending === 'pending' && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-ember/40 bg-[#fff8f4] p-3">
          <Logo text="KJ" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">CV Kertas Jaya · Rp24 jt</p>
            <p className="text-xs text-ember">Menunggu persetujuan pembayaran</p>
          </div>
          <button type="button" aria-label="Setujui" onClick={() => setPending('approved')} className="grid size-9 place-items-center rounded-full bg-lime text-forest"><CheckIcon /></button>
          <button type="button" aria-label="Tolak" onClick={() => setPending('declined')} className="grid size-9 place-items-center rounded-full border border-track"><CloseIcon /></button>
        </div>
      )}

      <ul className="mt-2 divide-y divide-track">
        {transactions.map((t) => (
          <li key={t.id} className="flex items-center gap-3 py-4">
            <Logo text={initials(t.title)} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{t.title}</p>
              <p className="text-xs text-muted">{t.meta}</p>
            </div>
            <p className={`text-base font-medium ${t.amount > 0 ? 'text-gain' : 'text-loss'}`}>{rpSigned(t.amount)}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ======================================================================
export default function CashFlowDashboard() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <BalanceCard />
      <HighlightCard />
      <CostCard />
      <RevenueCard />
      <TransactionsCard />
    </div>
  )
}
