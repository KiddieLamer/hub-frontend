import { useEffect, useState } from 'react'
import type { SVGProps } from 'react'


// ======================================================================
// DATA
// ======================================================================
type Currency = 'USD' | 'IDR' | 'MYR'


const currencies: { code: Currency; flag: string }[] = [
  { code: 'USD', flag: 'us' },
  { code: 'IDR', flag: 'id' },
  { code: 'MYR', flag: 'my' },
]


const balanceByCurrency: Record<Currency, { symbol: string; amount: number; locale: string }> = {
  USD: { symbol: '$', amount: 92142.1, locale: 'en-US' },
  IDR: { symbol: 'Rp', amount: 1_452_000_000, locale: 'id-ID' },
  MYR: { symbol: 'RM', amount: 434_820.5, locale: 'en-MY' },
}


const spendingCategories = [
  { id: 'rent', label: 'Rent', amount: 500.02, icon: 'home', active: true },
  { id: 'transport', label: 'Transport', amount: 217.0, icon: 'bus', active: false },
  { id: 'food', label: 'Food', amount: 100.0, icon: 'food', active: false },
  { id: 'entertainment', label: 'Entertainment', amount: 100.0, icon: 'game', active: false },
] as const


const earningSources = [
  { id: 'investment', label: 'Investment', amount: 2000, share: 28 },
  { id: 'salary', label: 'Salary', amount: 4000, share: 51, highlight: true },
  { id: 'freelance', label: 'Freelance', amount: 1335.01, share: 19 },
  { id: 'others', label: 'Others', amount: 486, share: 7 },
]


type Transaction = {
  id: string
  title: string
  meta: string
  amount: number
  logo: 'meta' | 'apple' | 'google' | 'asivest'
}


const transactions: Transaction[] = [
  { id: 't1', title: 'Salary Payment', meta: 'Today, 09.00 AM', amount: 5000, logo: 'meta' },
  { id: 't2', title: 'Buy - Macbook Pro', meta: 'Yesterday, 2.30 PM', amount: -4000, logo: 'apple' },
  { id: 't3', title: 'Refund - Google Pay', meta: 'Apr 1, 2026', amount: 120, logo: 'google' },
]


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
    items: [
      'P&L',
      'Balance Sheet',
      'Company Report',
      'Accounting',
      'Inventory Valuation',
      'HPP / COGS Review',
      'Gross Margin',
      'Fixed Assets',
    ],
  },
  {
    id: 'tax',
    label: 'Tax',
    items: ['Tax Setup & Calculator', 'Tax Report', 'Payroll Tax', 'Withholding'],
  },
  { id: 'payroll', label: 'Payroll', items: ['Payroll Run', 'Components & Rules', 'Compensation Review'] },
  { id: 'investment', label: 'Investment', items: ['Business Case', 'Risk & Decision'] },
]


// ======================================================================
// ICONS
// ======================================================================
type IconProps = SVGProps<SVGSVGElement>


function Base({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}


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


const EyeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
    <circle cx="12" cy="12" r="2.6" />
  </Base>
)


const EyeOffIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 3l18 18" />
    <path d="M10.6 6a9.8 9.8 0 0 1 1.4-.1c6.4 0 10 6.1 10 6.1a17 17 0 0 1-3.2 3.9M6.3 7.7A17 17 0 0 0 2 12s3.6 6.5 10 6.5a9.6 9.6 0 0 0 4-.9" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </Base>
)


const CopyIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" />
  </Base>
)


const DotsIcon = (p: IconProps) => (
  <Base {...p} fill="currentColor" stroke="none">
    <circle cx="5" cy="12" r="1.7" />
    <circle cx="12" cy="12" r="1.7" />
    <circle cx="19" cy="12" r="1.7" />
  </Base>
)


const ArrowUpRightIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </Base>
)


const UploadIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 15V4" />
    <path d="m7.5 8.5 4.5-4.5 4.5 4.5" />
    <path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
  </Base>
)


const HandCoinIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5V12a2.5 2.5 0 0 1-2.5 2.5H13l-4 3.5v-3.5H6.5A2.5 2.5 0 0 1 4 12Z" />
    <path d="M12 6.5v5M10 8.5h4" />
  </Base>
)


const StarIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8Z" />
  </Base>
)


const TicketIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1.5a2.5 2.5 0 0 0 0 5V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.5a2.5 2.5 0 0 0 0-5Z" />
    <path d="M10 9.5h4M10 14.5h4" />
  </Base>
)


const BagIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5.5 8h13l-1 11.5a1.5 1.5 0 0 1-1.5 1.4H8a1.5 1.5 0 0 1-1.5-1.4Z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </Base>
)


const CoinBagIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M9.5 3.5h5l-1 2.5h-3Z" />
    <path d="M10 6c-3.5 2-5 5-5 8.2C5 18 8 20.5 12 20.5s7-2.500 7-6.300C19 11 17.500 8 14 6" />
    <path d="M12 11v5M10.500 12.500h2.200a1.100 1.100 0 0 1 0 2.200h-1.400a1.100 1.100 0 0 0 0 2.200H13.500" />
  </Base>
)


const ReceiptIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 3.5h12v17l-2.500-1.600-1.800 1.600-1.700-1.600-1.700 1.600-1.800-1.600L6 20.500Z" />
    <path d="M9.500 9h5M9.500 13h5" />
  </Base>
)


const HomeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 11 12 4l8 7" />
    <path d="M6 10v9.500h12V10" />
  </Base>
)


const BusIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="4" y="4" width="16" height="13" rx="3" />
    <path d="M4 11h16M8 20v-3M16 20v-3" />
  </Base>
)


const FoodIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M8.500 12h7M12 8.500v7" />
  </Base>
)


const GameIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 8h10a4 4 0 0 1 4 4.200l-.4 3.500A2.300 2.300 0 0 1 16.300 17L14.500 15h-5L7.700 17a2.300 2.300 0 0 1-4.300-1.300L3 12.200A4 4 0 0 1 7 8Z" />
    <path d="M8 10.500v3M6.500 12h3" />
  </Base>
)


const CheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m5 12.500 4.500 4.500L19 7.500" />
  </Base>
)


const CloseIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
)


const SparkIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3c.6 4.700 2.300 6.400 7 7-4.700.6-6.400 2.300-7 7-.6-4.700-2.300-6.400-7-7 4.700-.6 6.400-2.300 7-7Z" />
  </Base>
)


const TargetIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.500" />
    <circle cx="12" cy="12" r="4.500" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </Base>
)


// ======================================================================
// HEADER
// ======================================================================
function Header() {
  // default to Cash & Cost > Cash Flow since the dashboard is a cash overview
  const [groupId, setGroupId] = useState('cash')
  const [item, setItem] = useState('Cash Flow')


  const group = navGroups.find((g) => g.id === groupId) ?? navGroups[0]


  const selectGroup = (id: string) => {
    const next = navGroups.find((g) => g.id === id)
    if (!next) return
    setGroupId(id)
    setItem(next.items[0])
  }


  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-amber-200 to-orange-300 text-sm font-semibold text-forest">
            S
          </div>
          <h1 className="text-2xl font-medium tracking-tight">Hello, Siburian</h1>
        </div>


        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Search"
            className="grid size-10 place-items-center rounded-full bg-white text-lg shadow-sm"
          >
            <SearchIcon />
          </button>
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium shadow-sm"
          >
            <span className="relative text-lg">
              <BellIcon />
              <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-loss" />
            </span>
            24
          </button>
        </div>
      </div>


      <nav
        aria-label="Modules"
        className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {navGroups.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => selectGroup(g.id)}
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
            onClick={() => setItem(name)}
            aria-current={name === item ? 'page' : undefined}
            className={`rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors ${
              name === item
                ? 'border-forest bg-forest text-white'
                : 'border-track bg-white text-muted hover:border-forest/30 hover:text-ink'
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
// BALANCE CARD
// ======================================================================
const ACCOUNT_NUMBER = '90340222748'


function Flag({ code }: { code: string }) {
  if (code === 'us') {
    return (
      <span className="relative block size-6 overflow-hidden rounded-full bg-white ring-1 ring-black/5">
        <span className="absolute inset-0 bg-[repeating-linear-gradient(#d9363e_0_2px,#fff_2px_4px)]" />
        <span className="absolute left-0 top-0 h-3 w-3 bg-[#2b3a8c]" />
      </span>
    )
  }
  return null
}


function BalanceCard() {
  const [currency, setCurrency] = useState<Currency>('USD')
  const [hidden, setHidden] = useState(false)
  const [copied, setCopied] = useState(false)


  const { symbol, amount, locale } = balanceByCurrency[currency]
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)


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
          {currencies.map(({ code, flag }) => (
            <button
              key={code}
              type="button"
              onClick={() => setCurrency(code)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                currency === code ? 'bg-white shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              {code === 'USD' && <Flag code={flag} />}
              {code}
            </button>
          ))}
        </div>


        <div>
          <p className="text-xs text-muted">Account Number</p>
          <button
            type="button"
            onClick={copy}
            className="mt-0.5 flex items-center gap-2 text-lg font-medium tracking-wide"
          >
            {ACCOUNT_NUMBER}
            <CopyIcon className={copied ? 'text-gain' : ''} />
          </button>
        </div>
      </div>


      <div className="mt-8">
        <p className="text-sm text-muted">Active Balance</p>
        <div className="mt-1 flex items-center gap-3">
          <p className="text-6xl font-medium tracking-tight">
            {hidden ? `${symbol}••••••` : `${symbol}${formatted}`}
          </p>
          <button
            type="button"
            aria-label={hidden ? 'Show balance' : 'Hide balance'}
            onClick={() => setHidden((v) => !v)}
            className="grid size-9 place-items-center rounded-full bg-canvas text-lg text-muted"
          >
            {hidden ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>


      <div className="mt-8 flex items-end justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white"
          >
            <UploadIcon />
            Transfer Balance
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-forest px-5 py-2.5 text-sm font-medium text-forest"
          >
            <HandCoinIcon />
            Request Balance
          </button>
          <button type="button" aria-label="More" className="px-1 text-forest">
            <DotsIcon />
          </button>
        </div>


        <button
          type="button"
          aria-label="Open transfers"
          className="grid size-16 place-items-center rounded-full bg-lime text-2xl text-forest transition-transform hover:scale-105"
        >
          <ArrowUpRightIcon />
        </button>
      </div>
    </section>
  )
}


// ======================================================================
// REWARDS CARD
// ======================================================================
function Stat({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: React.ReactNode
}) {
  const [hidden, setHidden] = useState(false)
  return (
    <div className="flex-1 rounded-2xl bg-white/35 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-forest/70">{label}</p>
        <button
          type="button"
          aria-label={`Toggle ${label}`}
          onClick={() => setHidden((v) => !v)}
          className="text-forest"
        >
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


function RewardsCard() {
  return (
    <section className="relative flex flex-col justify-between overflow-hidden rounded-[28px] bg-lime p-7 shadow-sm lg:col-span-5">
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute -right-6 top-2 size-52 text-lime-deep/70"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M50 0C54 30 70 46 100 50 70 54 54 70 50 100 46 70 30 54 0 50 30 46 46 30 50 0Z"
        />
      </svg>


      <div className="relative flex items-center justify-between">
        <span className="flex items-center gap-2 rounded-full bg-forest py-1.5 pl-5 pr-1.5 text-sm font-semibold tracking-wider text-lime">
          PRIORITY
          <span className="grid size-8 place-items-center rounded-full bg-lime text-forest">
            <SparkIcon />
          </span>
        </span>
        <button
          type="button"
          aria-label="More"
          className="grid size-10 place-items-center rounded-full bg-white/35 text-forest"
        >
          <DotsIcon />
        </button>
      </div>


      <div className="relative mt-8">
        <p className="text-sm text-forest/70">Your Rewards</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <p className="text-5xl font-medium tracking-tight text-forest">$12,172.07</p>
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gain">
            +40% this month
          </span>
        </div>
      </div>


      <div className="relative mt-8 flex gap-3">
        <Stat label="Delibix Points" value="4,780" icon={<StarIcon />} />
        <Stat label="Voucher" value="124" icon={<TicketIcon />} />
      </div>
    </section>
  )
}


// ======================================================================
// SPENDING CARD
// ======================================================================
const iconMap = {
  home: HomeIcon,
  bus: BusIcon,
  food: FoodIcon,
  game: GameIcon,
} as const


const fmtUsd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)


const SIZE = 150
const CENTER = SIZE / 2
const RADIUS = 60
const STROKE = 11
const GAP_DEG = 4
// angle taken by one rounded cap, so the visual gap between segments stays GAP_DEG
const CAP_DEG = (STROKE / 2 / RADIUS) * (180 / Math.PI)


const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches


function polar(deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return [CENTER + RADIUS * Math.cos(rad), CENTER + RADIUS * Math.sin(rad)]
}


function arcPath(from: number, to: number) {
  const [x1, y1] = polar(from)
  const [x2, y2] = polar(to)
  const large = to - from > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${large} 1 ${x2} ${y2}`
}


// One segment per category, sized by its share of the total.
// Angles: 0 = 12 o'clock, clockwise. The first category is centered at the bottom.
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
    if (prefersReducedMotion()) {
      setValue(target)
      return
    }
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


function SpendingCard() {
  const total = spendingCategories.reduce((sum, c) => sum + c.amount, 0)
  const animatedTotal = useCountUp(total)
  const segments = buildSegments(spendingCategories, total)


  const [selectedId, setSelectedId] = useState<string>(
    spendingCategories.find((c) => c.active)?.id ?? spendingCategories[0].id,
  )
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [drawn, setDrawn] = useState(false)


  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 60)
    return () => clearTimeout(t)
  }, [])


  const highlightId = hoverId ?? selectedId
  const hovered = spendingCategories.find((c) => c.id === hoverId)
  const reduced = prefersReducedMotion()


  return (
    <section className="rounded-[28px] bg-white p-6 shadow-sm lg:col-span-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full border border-track text-lg">
            <BagIcon />
          </span>
          <h2 className="text-lg font-medium">Spending</h2>
        </div>
        <button
          type="button"
          className="rounded-full border border-track px-4 py-2 text-sm font-medium"
        >
          April
        </button>
      </div>


      <div className="relative mx-auto mt-5 size-[170px]">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-full">
          {segments.map((s, i) => (
            <path
              key={s.id}
              d={s.d}
              pathLength={1}
              fill="none"
              strokeWidth={STROKE}
              strokeLinecap="round"
              stroke={highlightId === s.id ? 'var(--color-lime-deep)' : 'var(--color-track)'}
              strokeDasharray="1 1"
              strokeDashoffset={drawn || reduced ? 0 : 1}
              opacity={drawn || reduced ? 1 : 0}
              className="cursor-pointer"
              style={{
                transition: reduced
                  ? 'none'
                  : `stroke-dashoffset 800ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 140}ms, opacity 200ms ${i * 140}ms, stroke 300ms`,
              }}
              onMouseEnter={() => setHoverId(s.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={() => setSelectedId(s.id)}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
          {hovered ? (
            <>
              <p className="text-2xl font-normal">{fmtUsd(hovered.amount)}</p>
              <p className="text-sm text-muted">
                {hovered.label} · {Math.round((hovered.amount / total) * 100)}%
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl font-normal">{fmtUsd(animatedTotal)}</p>
              <p className="text-sm font-medium text-loss">+12%</p>
            </>
          )}
        </div>
      </div>


      <p className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full border border-track px-3 py-1.5 text-xs font-medium">
        <SparkIcon className="text-sm" />
        Rent spending is up <span className="text-loss">8.4%</span>
      </p>


      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        {spendingCategories.map((c) => {
          const Icon = iconMap[c.icon]
          return (
            <li
              key={c.id}
              onMouseEnter={() => setHoverId(c.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={() => setSelectedId(c.id)}
              className={`flex cursor-pointer items-center gap-1.5 transition-colors ${
                highlightId === c.id ? 'font-medium text-ink' : 'text-muted/80'
              }`}
            >
              <Icon className="text-sm" />
              <span className="truncate">
                {c.label} {fmtUsd(c.amount)}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}


// ======================================================================
// EARNING CARD
// ======================================================================
const fmtUsd2 = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n)


function EarningCard() {
  const goal = 8400
  const earned = 7110.12
  const goalPct = Math.min(100, (earned / goal) * 100)


  return (
    <section className="rounded-[28px] bg-white p-6 shadow-sm lg:col-span-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full border border-track text-lg">
            <CoinBagIcon />
          </span>
          <h2 className="text-lg font-medium">Earning</h2>
        </div>
        <div className="w-24">
          <p className="flex items-center justify-end gap-1.5 text-sm font-medium">
            <TargetIcon className="text-ember" />${goal}
          </p>
          <div className="mt-1.5 h-1 rounded-full bg-track">
            <div
              className="h-full rounded-full bg-ember"
              style={{ width: `${goalPct}%` }}
            />
          </div>
        </div>
      </div>


      <p className="mt-6 text-5xl font-medium tracking-tight">{fmtUsd2(earned)}</p>
      <p className="mt-1 text-xs text-muted">
        <span className="font-medium text-gain">+18%</span> vs last month
      </p>


      <ul className="mt-6 space-y-4">
        {earningSources.map((s) => (
          <li key={s.id}>
            <div className="mb-1.5 flex items-center justify-between text-sm text-muted">
              <span>{s.label}</span>
              <span>{fmtUsd2(s.amount)}</span>
            </div>
            <div className="relative h-2.5 rounded-full bg-track">
              <div
                className={`h-full rounded-full ${s.highlight ? 'bg-lime-deep' : 'bg-[#cfd1ce]'}`}
                style={{ width: `${s.highlight ? s.share : s.share * 0.6}%` }}
              />
              {s.highlight && (
                <span
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-forest px-2 py-0.5 text-[11px] font-medium text-white"
                  style={{ left: `${s.share}%` }}
                >
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
function Logo({ kind }: { kind: Transaction['logo'] | 'asivest' }) {
  const base = 'grid size-11 shrink-0 place-items-center rounded-full border border-track bg-white'
  switch (kind) {
    case 'meta':
      return (
        <span className={`${base} text-[#0866ff]`}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M3 15c0-4 2-8 4-8s3.500 3.500 5 6 2.500 4 4.500 4S20 14 20 12s-1.500-5-3.500-5-3.500 3-5 5.500S9 17 7 17s-4-1-4-2Z" />
          </svg>
        </span>
      )
    case 'apple':
      return (
        <span className={`${base} text-ink`}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M16.400 12.600c0-2.300 1.900-3.400 2-3.500-1.100-1.600-2.800-1.800-3.400-1.800-1.400-.1-2.800.9-3.500.9s-1.800-.8-3-.8c-1.500 0-3 .9-3.800 2.300-1.600 2.800-.4 7 1.200 9.300.8 1.100 1.700 2.400 2.900 2.300 1.200 0 1.600-.7 3-.7s1.800.7 3 .7 2-1.100 2.800-2.200c.9-1.300 1.200-2.500 1.300-2.600-.1 0-2.500-1-2.500-3.900ZM14.100 5.700c.6-.8 1.100-1.800.9-2.900-.9 0-2 .6-2.700 1.400-.6.700-1.100 1.800-1 2.800 1 .1 2.100-.5 2.800-1.300Z" />
          </svg>
        </span>
      )
    case 'google':
      return (
        <span className={`${base} text-xl font-bold`}>
          <span className="bg-gradient-to-br from-[#4285f4] via-[#ea4335] to-[#34a853] bg-clip-text text-transparent">
            G
          </span>
        </span>
      )
    default:
      return (
        <span className={`${base} text-ink`}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 4 20 19H4Z" />
          </svg>
        </span>
      )
  }
}


const fmtSigned = (n: number) =>
  `${n > 0 ? '+' : '-'}${new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Math.abs(n))}`


function TransactionsCard() {
  const [pending, setPending] = useState<'pending' | 'approved' | 'declined'>('pending')


  return (
    <section className="rounded-[28px] bg-white p-6 shadow-sm lg:col-span-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full border border-track text-lg">
            <ReceiptIcon />
          </span>
          <h2 className="text-lg font-medium">Transactions</h2>
        </div>
        <button
          type="button"
          aria-label="More"
          className="grid size-10 place-items-center rounded-full border border-track"
        >
          <DotsIcon />
        </button>
      </div>


      {pending === 'pending' && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-ember/40 bg-[#fff8f4] p-3">
          <Logo kind="asivest" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Asivest Subscriptions $300</p>
            <p className="text-xs text-ember">Payment confirmation</p>
          </div>
          <button
            type="button"
            aria-label="Approve"
            onClick={() => setPending('approved')}
            className="grid size-9 place-items-center rounded-full bg-lime text-forest"
          >
            <CheckIcon />
          </button>
          <button
            type="button"
            aria-label="Decline"
            onClick={() => setPending('declined')}
            className="grid size-9 place-items-center rounded-full border border-track"
          >
            <CloseIcon />
          </button>
        </div>
      )}


      <ul className="mt-2 divide-y divide-track">
        {transactions.map((t) => (
          <li key={t.id} className="flex items-center gap-3 py-4">
            <Logo kind={t.logo} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{t.title}</p>
              <p className="text-xs text-muted">{t.meta}</p>
            </div>
            <p className={`text-base font-medium ${t.amount > 0 ? 'text-gain' : 'text-loss'}`}>
              {fmtSigned(t.amount)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}


// ======================================================================
// APP
// ======================================================================
export function FinanceDashboardContent() {
  return (
    <div className="h-full overflow-y-auto bg-[#f7f7f5]">
      <main className="mx-auto flex max-w-[1200px] flex-col gap-5 p-4 md:p-6">
        <Header />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <BalanceCard />
          <RewardsCard />
          <SpendingCard />
          <EarningCard />
          <TransactionsCard />
        </div>
      </main>
    </div>
  )
}
