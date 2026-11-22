import { useEffect, useState } from 'react'
import type { ReactNode, SVGProps } from 'react'
import { ChevronDown, Eye as EyeLucide, EyeOff as EyeOffLucide } from 'lucide-react'
import { expenseClaimsApi } from '../../lib/endpoints'
import { bankLogoUrl, bankMonogram, resolveBank } from '../../lib/banks'
import { type UseFinanceLiveResult } from './useFinanceLive'

// ======================================================================
// Cash Flow dashboard — SEMUA angka dari data live (useFinanceLive).
// Saldo kas = estimasi (invoice terbayar − klaim dibayar).
// ======================================================================

type Currency = 'USD' | 'IDR' | 'MYR'
const currencies: Currency[] = ['USD', 'IDR', 'MYR']
const balanceCurrency: Record<Currency, { symbol: string; locale: string }> = {
  USD: { symbol: '$', locale: 'en-US' },
  IDR: { symbol: 'Rp', locale: 'id-ID' },
  MYR: { symbol: 'RM', locale: 'en-MY' },
}

const rp = (n: number) =>
  n >= 1e9 ? `Rp${(n / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 2 })} M` : `Rp${(n / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`
const rpSigned = (n: number) => `${n > 0 ? '+' : '-'}${rp(Math.abs(n))}`
const shortD = (d: string | null) => {
  if (!d) return '—'
  const date = new Date(d.includes('T') ? d : d.replace(' ', 'T'))
  return Number.isNaN(date.getTime()) ? d : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

// ======================================================================
// ICONS
// ======================================================================
type IconProps = SVGProps<SVGSVGElement>
const Base = ({ children, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {children}
  </svg>
)
const EyeIcon = (p: IconProps) => <EyeLucide strokeWidth={1.8} {...p} />
const EyeOffIcon = (p: IconProps) => <EyeOffLucide strokeWidth={1.8} {...p} />
const CopyIcon = (p: IconProps) => (<Base {...p}><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" /></Base>)
const DotsIcon = (p: IconProps) => (<Base {...p} fill="currentColor" stroke="none"><circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" /></Base>)
const UploadIcon = (p: IconProps) => (<Base {...p}><path d="M12 15V4" /><path d="m7.5 8.5 4.5-4.5 4.5 4.5" /><path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" /></Base>)
const HandCoinIcon = (p: IconProps) => (<Base {...p}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5V12a2.5 2.5 0 0 1-2.5 2.5H13l-4 3.5v-3.5H6.5A2.5 2.5 0 0 1 4 12Z" /><path d="M12 6.5v5M10 8.5h4" /></Base>)
const ArrowUpRightIcon = (p: IconProps) => (<Base {...p}><path d="M7 17 17 7" /><path d="M8 7h9v9" /></Base>)
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

const FLAG_ISO: Record<Currency, string> = { USD: 'us', IDR: 'id', MYR: 'my' }
const FLAG_FALLBACK_BG: Record<Currency, string> = { USD: '#d9363e', IDR: '#e70011', MYR: '#010066' }

function Flag({ code }: { code: Currency }) {
  return (
    <span
      className="relative block size-6 overflow-hidden rounded-full ring-1 ring-black/5"
      style={{ backgroundColor: FLAG_FALLBACK_BG[code] }}
    >
      <img
        src={`https://flagcdn.com/w40/${FLAG_ISO[code]}.png`}
        alt={`Bendera ${code}`}
        className="absolute inset-0 size-full object-cover"
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
    </span>
  )
}

function BalanceCard({
  kas,
  loading,
  bankName,
  bankAccountNumber,
  onCatatKasKeluar,
  onOpenBankRec,
}: {
  kas: number
  loading: boolean
  bankName: string | null
  bankAccountNumber: string | null
  onCatatKasKeluar?: () => void
  onOpenBankRec?: () => void
}) {
  const [currency, setCurrency] = useState<Currency>('IDR')
  const [hidden, setHidden] = useState(false)
  const bank = resolveBank(bankName)
  const [copied, setCopied] = useState(false)
  const { symbol, locale } = balanceCurrency[currency]
  // Kurs USD/MYR belum tersedia — hanya IDR yang menampilkan nilai real.
  const amount = currency === 'IDR' ? kas : null
  const formatted = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount ?? 0)
  const acct = bankAccountNumber ?? ''

  const copy = async () => {
    if (!acct) return
    try {
      await navigator.clipboard.writeText(acct)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <section className="flex flex-col justify-between rounded-[20px] border border-[#EAEDF2] bg-white p-7 shadow-[0_2px_12px_rgba(15,23,42,0.02)] lg:col-span-7">
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
          <p className="flex items-center gap-1.5 text-xs text-muted">
            {bank && (
              <span className="relative grid size-5 shrink-0 place-items-center overflow-hidden rounded-md ring-1 ring-black/5" style={{ backgroundColor: bank.color }}>
                <span className="text-[6px] font-bold leading-none text-white">{bankMonogram(bank)}</span>
                <img src={bankLogoUrl(bank)} alt={`Logo ${bank.name}`} className="absolute inset-0 size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
              </span>
            )}
            Rekening Operasional{bankName ? ` — ${bankName}` : ''}
          </p>
          <button type="button" onClick={copy} title={acct ? 'Salin nomor rekening' : undefined}
            className="mt-0.5 flex items-center gap-2 text-lg font-medium tracking-wide">
            {acct || '—'}
            <CopyIcon className={copied ? 'text-gain' : ''} />
          </button>
          {!acct && !loading && (
            <p className="mt-1 text-[11px] text-muted">Atur no. rekening di modul Company.</p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <p className="text-sm text-muted">Saldo Kas Aktif</p>
        <div className="mt-1 flex items-center gap-3">
          <p className="text-5xl font-medium tracking-tight md:text-6xl">
            {loading || hidden || amount === null ? `${symbol}••••••` : `${symbol}${formatted}`}
          </p>
          <button type="button" aria-label={hidden ? 'Tampilkan saldo' : 'Sembunyikan saldo'} onClick={() => setHidden((v) => !v)}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-canvas text-lg text-muted">
            {hidden ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {currency !== 'IDR' && amount === null && (
          <p className="mt-1 text-xs text-muted">Kurs {currency} belum tersedia — nilai ditampilkan dalam IDR.</p>
        )}
      </div>

      <div className="mt-8 flex items-end justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" disabled title="Pembayaran tercatat lewat invoice di CRM"
            className="flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed">
            <UploadIcon />
            Catat Kas Masuk
          </button>
          <button type="button" onClick={onCatatKasKeluar}
            className="flex items-center gap-2 rounded-full border border-forest px-5 py-2.5 text-sm font-medium text-forest">
            <HandCoinIcon />
            Catat Kas Keluar
          </button>
          <button type="button" aria-label="More" className="px-1 text-forest"><DotsIcon /></button>
        </div>
        <button type="button" aria-label="Buka detail kas" title="Buka mutasi kas (Bank Reconciliation)" onClick={onOpenBankRec}
          className="grid size-16 place-items-center rounded-full bg-lime text-2xl text-forest transition-transform hover:scale-105">
          <ArrowUpRightIcon />
        </button>
      </div>
    </section>
  )
}

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

function HighlightCard({ laba, delta, piutang, hutang, loading }: { laba: number; delta: number | null; piutang: number; hutang: number; loading: boolean }) {
  return (
    <section className="relative flex flex-col justify-between overflow-hidden rounded-[20px] border border-[#EAEDF2] bg-lime p-7 shadow-[0_6px_24px_rgba(132,225,0,0.18)] lg:col-span-5">
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
          <p className="text-5xl font-medium tracking-tight text-forest">{loading ? '–' : rp(laba)}</p>
          {delta !== null ? (
            <span className={`rounded-full bg-white px-2.5 py-1 text-xs font-medium ${delta >= 0 ? 'text-gain' : 'text-loss'}`}>
              {delta >= 0 ? '+' : ''}{delta}% vs bulan lalu
            </span>
          ) : (
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-forest/60">
              – vs bulan lalu
            </span>
          )}
        </div>
      </div>
      <div className="relative mt-8 flex gap-3">
        <Stat label="Piutang" value={loading ? '–' : rp(piutang)} icon={<CoinBagIcon />} />
        <Stat label="Hutang" value={loading ? '–' : rp(hutang)} icon={<ReceiptIcon />} />
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

function CostCard({
  costItems,
  chip,
  monthValue,
  monthOptions,
  onMonthChange,
}: {
  costItems: Array<{ id: string; label: string; amount: number; icon: 'home' | 'bus' | 'bag' | 'receipt' }>
  chip: { dir: 'naik' | 'turun'; pct: number } | null
  monthValue: string
  monthOptions: Array<{ value: string; label: string }>
  onMonthChange: (m: string) => void
}) {
  const total = costItems.reduce((s, c) => s + c.amount, 0)
  const animatedTotal = useCountUp(total)
  const segments = buildSegments(costItems, total)
  const [selectedId, setSelectedId] = useState<string>(costItems[0]?.id ?? '')
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [drawn, setDrawn] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 60)
    return () => clearTimeout(t)
  }, [])
  const highlightId = hoverId ?? selectedId
  const hovered = costItems.find((c) => c.id === hoverId)
  const reduced = prefersReducedMotion()

  return (
    <section className="rounded-[20px] border border-[#EAEDF2] bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.02)] lg:col-span-4">
      <div className="flex flex-wrap items-center justify-between gap-y-2">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full border border-track text-lg"><BagIcon /></span>
          <h2 className="text-lg font-medium">Biaya</h2>
        </div>
        <div className="relative max-w-full">
          <select
            value={monthValue}
            onChange={(e) => onMonthChange(e.target.value)}
            aria-label="Pilih bulan biaya"
            className="min-w-0 max-w-full appearance-none rounded-full border border-track px-4 py-2 pr-8 text-sm font-medium bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-forest/30"
          >
            {monthOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
        </div>
      </div>

      <div className="relative mx-auto mt-5 aspect-square w-full max-w-[170px]">
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
              {chip && <p className={`text-sm font-medium ${chip.dir === 'naik' ? 'text-loss' : 'text-gain'}`}>{chip.dir === 'naik' ? '+' : '-'}{chip.pct}%</p>}
            </>
          )}
        </div>
      </div>

      {chip && (
        <p className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full border border-track px-3 py-1.5 text-xs font-medium">
          <SparkIcon className="text-sm" />
          {chip.dir === 'naik' ? 'Naik' : 'Turun'} {chip.pct}% vs bulan sebelumnya
        </p>
      )}

      {costItems.length === 0 ? (
        <p className="mt-4 text-center text-sm text-muted">Belum ada biaya tercatat.</p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          {costItems.map((c) => {
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
      )}
    </section>
  )
}

// ======================================================================
// REVENUE CARD
// ======================================================================
function RevenueCard({
  earned,
  deltaPct,
  sources,
  goal,
}: {
  earned: number
  deltaPct: number | null
  sources: Array<{ id: string; label: string; amount: number; share: number; highlight?: boolean }>
  goal: number | null
}) {
  const goalPct = goal && goal > 0 ? Math.min(100, (earned / goal) * 100) : null
  const total = sources.reduce((s, x) => s + x.amount, 0) || 1
  return (
    <section className="rounded-[20px] border border-[#EAEDF2] bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.02)] lg:col-span-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full border border-track text-lg"><CoinBagIcon /></span>
          <h2 className="text-lg font-medium">Pendapatan</h2>
        </div>
        {goalPct !== null && goal !== null && (
          <div className="w-28">
            <p className="flex items-center justify-end gap-1.5 text-sm font-medium"><TargetIcon className="text-ember" />{rp(goal)}</p>
            <div className="mt-1.5 h-1 rounded-full bg-track"><div className="h-full rounded-full bg-ember" style={{ width: `${goalPct}%` }} /></div>
          </div>
        )}
      </div>

      <p className="mt-6 text-5xl font-medium tracking-tight">{rp(earned)}</p>
      <p className="mt-1 text-xs text-muted">
        {deltaPct !== null ? (
          <><span className={`font-medium ${deltaPct >= 0 ? 'text-gain' : 'text-loss'}`}>{deltaPct >= 0 ? '+' : ''}{deltaPct}%</span> vs bulan lalu</>
        ) : (
          <><span className="font-medium text-muted">–</span> vs bulan lalu</>
        )}
      </p>

      {sources.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Belum ada pendapatan tercatat.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {sources.map((s) => (
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
          <li className="text-[11px] text-muted">Pendapatan per pelanggan · total {rp(total)}</li>
        </ul>
      )}
    </section>
  )
}

// ======================================================================
// TRANSACTIONS CARD
// ======================================================================
const initials = (t: string) => t.split(' ').slice(0, 2).map((w) => w[0]).join('')

function Logo({ text, url }: { text: string; url?: string | null }) {
  return (
    <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-track bg-white text-sm font-semibold text-forest">
      {text}
      {url && <img src={url} alt={text} className="absolute inset-0 size-full object-cover" />}
    </span>
  )
}

function TransactionsCard({
  pendingClaim,
  pendingLogoUrl,
  events,
  onApprove,
  onReject,
}: {
  pendingClaim: { id: string; title: string; amount: number } | null
  pendingLogoUrl: string | null
  events: Array<{ id: string; title: string; meta: string; amount: number; logoUrl: string | null }>
  onApprove: (id: string) => void
  onReject: (id: string) => void
}) {
  return (
    <section className="rounded-[20px] border border-[#EAEDF2] bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.02)] lg:col-span-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full border border-track text-lg"><ReceiptIcon /></span>
          <h2 className="text-lg font-medium">Transaksi</h2>
        </div>
        <button type="button" aria-label="More" className="grid size-10 place-items-center rounded-full border border-track"><DotsIcon /></button>
      </div>

      {pendingClaim && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-ember/40 bg-[#fff8f4] p-3">
          <Logo text={initials(pendingClaim.title)} url={pendingLogoUrl} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{pendingClaim.title} · {rp(pendingClaim.amount)}</p>
            <p className="text-xs text-ember">Menunggu persetujuan pembayaran</p>
          </div>
          <button type="button" aria-label="Setujui" onClick={() => onApprove(pendingClaim.id)} className="grid size-9 place-items-center rounded-full bg-lime text-forest"><CheckIcon /></button>
          <button type="button" aria-label="Tolak" onClick={() => onReject(pendingClaim.id)} className="grid size-9 place-items-center rounded-full border border-track"><CloseIcon /></button>
        </div>
      )}

      <ul className="mt-2 divide-y divide-track">
        {events.length === 0 && <li className="py-6 text-center text-sm text-muted">Belum ada transaksi kas.</li>}
        {events.map((t) => (
          <li key={t.id} className="flex items-center gap-3 py-4">
            <Logo text={initials(t.title)} url={t.logoUrl} />
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
export default function CashFlowDashboard({
  live,
  onCatatKasKeluar,
  onOpenBankRec,
}: {
  live: UseFinanceLiveResult
  onCatatKasKeluar?: () => void
  onOpenBankRec?: () => void
}) {
  const pad = (n: number) => String(n).padStart(2, '0')
  const now = new Date()
  const thisM = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`
  const prevD = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevM = `${prevD.getFullYear()}-${pad(prevD.getMonth() + 1)}`

  // Bulan terpilih untuk kartu Biaya (default: bulan berjalan) + opsi 12 bulan terakhir.
  const [costMonth, setCostMonth] = useState(thisM)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
    return { value, label: d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) }
  })
  const monthBeforeCost = (() => {
    const [y, m] = costMonth.split('-').map(Number)
    const d = new Date(y, m - 2, 1)
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
  })()

  const nonDraft = live.invoices.filter((i) => !['draft', 'cancelled'].includes(i.status))
  const claimsPaid = live.claims.filter((c) => c.status === 'paid')
  const claimsRealized = live.claims.filter((c) => ['approved', 'paid'].includes(c.status))

  const revOf = (m: string) => nonDraft.filter((i) => (i.issueDate || '').slice(0, 7) === m).reduce((s, i) => s + i.grandTotal, 0)
  const bebanOf = (m: string) =>
    claimsRealized.filter((c) => (c.expenseDate || '').slice(0, 7) === m).reduce((s, c) => s + c.amount, 0)

  const kas = Math.max(0, nonDraft.reduce((s, i) => s + i.amountPaid, 0) - claimsPaid.reduce((s, c) => s + c.amount, 0))
  const revThis = revOf(thisM)
  const bebanThis = bebanOf(thisM)
  const labaT = revThis - bebanThis
  const labaL = revOf(prevM) - bebanOf(prevM)
  const delta = labaL > 0 ? Math.round(((labaT - labaL) / Math.abs(labaL)) * 100) : null
  const piutang = nonDraft.reduce((s, i) => s + (i.grandTotal - i.amountPaid), 0)
  const hutang = live.purchaseOrders
    .filter((p) => !['completed', 'cancelled', 'received', 'rejected'].includes(p.status))
    .reduce((s, p) => s + p.grandTotal, 0)

  // Biaya per kategori (klaim disetujui & dibayar) — difilter bulan terpilih
  const costAgg = new Map<string, number>()
  for (const c of claimsRealized) {
    if ((c.expenseDate || '').slice(0, 7) !== costMonth) continue
    costAgg.set(c.categoryId, (costAgg.get(c.categoryId) ?? 0) + c.amount)
  }
  const costItems = [...costAgg.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([id, amount], i) => ({
      id,
      label: live.categoryNames[id] ?? 'Lainnya',
      amount,
      icon: (['home', 'bus', 'bag', 'receipt'] as const)[i % 4],
    }))
  const bebanSelected = bebanOf(costMonth)
  const bebanPrevSel = bebanOf(monthBeforeCost)
  const costChip = bebanPrevSel > 0 && bebanSelected > 0
    ? { dir: bebanSelected >= bebanPrevSel ? ('naik' as const) : ('turun' as const), pct: Math.abs(Math.round(((bebanSelected - bebanPrevSel) / bebanPrevSel) * 100)) }
    : null

  // Pendapatan per pelanggan
  const revByClient = new Map<string, number>()
  for (const i of nonDraft) revByClient.set(i.clientId, (revByClient.get(i.clientId) ?? 0) + i.grandTotal)
  const sources = [...revByClient.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([id, amount], i) => ({
      id,
      label: live.clientNames[id] ?? '—',
      amount,
      share: Math.round((amount / (revByClient.size ? revThis || 1 : 1)) * 100),
      highlight: i === 0,
    }))
  const goal = live.scenarios.length > 0
    ? live.scenarios.reduce((s, x) => s + x.revenueTarget, 0) / live.scenarios.length
    : null
  const revDelta = revOf(prevM) > 0 ? Math.round(((revThis - revOf(prevM)) / revOf(prevM)) * 100) : null

  // Transaksi: klaim menunggu approve + mutasi kas (payment masuk / klaim dibayar)
  const invoiceClientId = new Map(live.invoices.map((i) => [i.id, i.clientId]))
  const clientAvatars = live.clientAvatars
  const pendingClaim = live.claims.find((c) => c.status === 'submitted') ?? null
  const events = [
    ...live.payments.map((p) => ({
      id: `pay-${p.id}`,
      title: `Pembayaran ${p.invoiceNumber ?? 'Invoice'}`,
      meta: shortD(p.paymentDate),
      date: p.paymentDate ?? '',
      amount: p.amount,
      logoUrl: clientAvatars[invoiceClientId.get(p.invoiceId) ?? ''] ?? null,
    })),
    ...claimsPaid.map((c) => ({
      id: `claim-${c.id}`,
      title: `Klaim dibayar — ${c.title}`,
      meta: shortD(c.expenseDate),
      date: c.expenseDate,
      amount: -c.amount,
      logoUrl: clientAvatars[c.clientId ?? ''] ?? null,
    })),
  ]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 6)

  const handleApprove = async (id: string) => {
    await expenseClaimsApi.approve(id, { approved: true }).catch(() => null)
    live.reload()
  }
  const handleReject = async (id: string) => {
    await expenseClaimsApi.approve(id, { approved: false, rejectionReason: 'Ditolak dari Cash Flow' }).catch(() => null)
    live.reload()
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <BalanceCard
        kas={live.loading ? 0 : kas}
        loading={live.loading}
        bankName={live.loading ? null : live.bankInfo.bankName}
        bankAccountNumber={live.loading ? null : live.bankInfo.bankAccountNumber}
        onCatatKasKeluar={onCatatKasKeluar}
        onOpenBankRec={onOpenBankRec}
      />
      <HighlightCard laba={labaT} delta={live.loading ? null : delta} piutang={piutang} hutang={hutang} loading={live.loading} />
      <CostCard
        costItems={live.loading ? [] : costItems}
        chip={live.loading ? null : costChip}
        monthValue={costMonth}
        monthOptions={monthOptions}
        onMonthChange={setCostMonth}
      />
      <RevenueCard earned={live.loading ? 0 : revThis} deltaPct={live.loading ? null : revDelta} sources={live.loading ? [] : sources} goal={live.loading ? null : goal} />
      <TransactionsCard
        pendingClaim={live.loading ? null : pendingClaim ? { id: pendingClaim.id, title: pendingClaim.title, amount: pendingClaim.amount } : null}
        pendingLogoUrl={live.loading || !pendingClaim ? null : clientAvatars[pendingClaim.clientId ?? ''] ?? null}
        events={live.loading ? [] : events}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}
