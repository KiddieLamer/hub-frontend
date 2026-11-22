import { useState, type ReactNode } from 'react'
import { MapPin, Truck, Maximize2, Minimize2, LocateFixed } from 'lucide-react'

// ============================================================================
// SHIPBOX CARD LIBRARY — komponen reusable ala Shipbox design system.
// Semua card punya 2 keadaan: TERISI (data di-pass) dan KOSONG (placeholder).
// Token: lime #84E100 · navy #141B29 · border #EAEDF2 · muted #8C95A4.
// Pakai di dalam container .font-jakarta.
// ============================================================================

export type PillTheme = 'amber' | 'purple' | 'blue' | 'lime' | 'gray' | 'red'

export const PILL_STYLES: Record<PillTheme, string> = {
  amber: 'border-[#F5A623] text-[#D9820B] bg-[#FFFDF7]',
  purple: 'border-[#A855F7] text-[#8B5CF6] bg-[#FAF5FF]',
  blue: 'border-[#38BDF8] text-[#0284C7] bg-[#F0F9FF]',
  lime: 'border-[#84E100] text-[#65B300] bg-[#F1FCE2]',
  gray: 'border-[#DCE1EA] text-[#5A6577] bg-[#F8F9FB]',
  red: 'border-[#EF6D6D] text-[#D64545] bg-[#FEF5F5]',
}

const KEYWORD_THEME: Array<[string[], PillTheme]> = [
  [['pending', 'menunggu', 'maintenance', 'perbaikan'], 'amber'],
  [['sent', 'in_sorting', 'dikirim', 'proses'], 'purple'],
  [['approved', 'in_use', 'in_transit', 'on_the_way', 'aktif'], 'blue'],
  [['received', 'completed', 'paid', 'available', 'selesai', 'lunas', 'aktif'], 'lime'],
  [['cancelled', 'rejected', 'broken', 'lost', 'overdue', 'batal', 'ditolak'], 'red'],
]

/** Petakan status bebas → tema pill (atau pakai tema eksplisit). */
export function themeForStatus(status?: string): PillTheme {
  const s = (status || '').toLowerCase()
  for (const [words, theme] of KEYWORD_THEME) if (words.some((w) => s.includes(w))) return theme
  return 'gray'
}

/** Pill status ala Shipbox. Tanpa label → tampil '—'. */
export function ShipboxStatusPill({ status, label, theme }: { status?: string; label?: string; theme?: PillTheme }) {
  const t = theme ?? themeForStatus(status)
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${PILL_STYLES[t]}`}>
      {label ?? (status ? status.replace(/_/g, ' ') : '—')}
    </span>
  )
}

/** Kartu dasar: putih, rounded-20, border #EAEDF2. Kosong → placeholder di dalam. */
export function ShipboxCard({
  title,
  right,
  children,
  className = '',
  contentClassName = '',
}: {
  title?: ReactNode
  right?: ReactNode
  children?: ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <section className={`rounded-[20px] border border-[#EAEDF2] bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.02)] sm:p-6 ${className}`}>
      {title && (
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#F1F4F8] pb-3">
          <h2 className="text-[17px] font-bold text-[#141B29]">{title}</h2>
          {right}
        </div>
      )}
      <div className={contentClassName}>{children}</div>
    </section>
  )
}

/** Placeholder kosong ala Shipbox: dashed border + ikon + teks + CTA opsional. */
export function ShipboxEmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}: {
  icon?: ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  compact?: boolean
}) {
  return (
    <div className={`rounded-2xl border border-dashed border-[#DCE1EA] text-center ${compact ? 'p-5' : 'bg-white p-8'}`}>
      {icon && <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8FEEF] text-[#65B300]">{icon}</div>}
      <div className={`${compact ? 'text-[13.5px]' : 'text-[15px]'} font-bold text-[#141B29]`}>{title}</div>
      {description && <p className="mx-auto mt-1 max-w-sm text-[12.5px] leading-relaxed text-[#8C95A4]">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-3 cursor-pointer rounded-full bg-[#84E100] px-5 py-2 text-xs font-bold text-[#141B29] shadow-[0_6px_18px_rgba(132,225,0,0.28)] transition hover:bg-[#78CE00] active:scale-[0.98]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// INFO CARD — ala ShippingInfoCard: grid label/nilai dengan divider vertikal.
// items kosong → ShipboxEmptyState di dalam card.
// ---------------------------------------------------------------------------
export type InfoItem = { label: string; value?: ReactNode; highlight?: boolean }

export function ShipboxInfoCard({
  title,
  items,
  cols = 3,
  right,
  empty,
}: {
  title: string
  items: InfoItem[]
  cols?: 2 | 3 | 4
  right?: ReactNode
  empty?: { icon?: ReactNode; title: string; description?: string; actionLabel?: string; onAction?: () => void }
}) {
  return (
    <ShipboxCard title={title} right={right}>
      {items.length === 0 ? (
        empty ? <ShipboxEmptyState {...empty} /> : <ShipboxEmptyState title="Belum ada data" />
      ) : (
        <div className={`grid gap-3 pb-1 grid-cols-${cols === 2 ? '2' : cols === 4 ? '4' : '3'}`}>
          {items.map((it, i) => {
            const isLastCol = (i + 1) % cols === 0 || i === items.length - 1
            return (
              <div key={`${it.label}-${i}`} className={!isLastCol ? 'border-r border-[#EEF1F6] pr-2' : 'pl-1'}>
                <div className="mb-1 text-[11.5px] text-[#8C95A4]">{it.label}</div>
                <div className={`text-[13.5px] ${it.highlight ? 'text-[22px] font-bold leading-none tracking-tight' : 'font-bold'} text-[#141B29]`}>
                  {it.value ?? '—'}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </ShipboxCard>
  )
}

// ---------------------------------------------------------------------------
// ROUTE PROGRESS — ala progress bar ShipmentCard: node lime → truck → dashed → pin.
// ---------------------------------------------------------------------------
export function ShipboxRouteProgress({ percent }: { percent: number }) {
  const p = Math.max(0, Math.min(100, percent))
  return (
    <div className="flex items-center gap-1.5 py-1">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#84E100] shadow-[0_2px_8px_rgba(132,225,0,0.4)]">
        <span className="h-2 w-2 rounded-full bg-white" />
      </div>
      <div className="h-[2.5px] rounded-full bg-[#84E100] transition-all duration-500" style={{ width: `${p}%` }} />
      <div className="shrink-0 px-0.5 text-[#141B29]">
        <Truck className="h-[16px] w-[16px] stroke-[2]" />
      </div>
      <div className="flex-1 border-t-2 border-dashed border-[#DCE1EA]" />
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#E2E6EE] bg-white text-[#141B29]">
        <MapPin className="h-3 w-3 stroke-[2]" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// EXPANDABLE ITEM CARD — ala ShipmentCard: collapsed ringkas, klik → expanded
// (konten children). Tanpa item → pakai ShipboxEmptyState di luar komponen ini.
// ---------------------------------------------------------------------------
export function ShipboxExpandableCard({
  icon,
  title,
  pill,
  expanded,
  onToggle,
  children,
}: {
  icon?: ReactNode
  title: ReactNode
  pill?: ReactNode
  expanded: boolean
  onToggle: () => void
  children?: ReactNode
}) {
  return (
    <div className={`rounded-[18px] border bg-white transition-all duration-200 ${expanded ? 'border-[#84E100] shadow-[0_10px_28px_rgba(132,225,0,0.08)]' : 'border-[#EDF0F5] hover:border-[#D5DCE6] hover:shadow-[0_6px_18px_rgba(15,23,42,0.05)]'}`}>
      <button onClick={onToggle} className="flex w-full cursor-pointer items-center justify-between gap-2 px-4 py-3.5 text-left">
        <div className="flex min-w-0 items-center gap-3">
          {icon && <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#EAEDF2] bg-[#FAFBFD] text-[#141B29]">{icon}</div>}
          <span className="truncate text-[16px] font-bold tracking-tight text-[#141B29]">{title}</span>
        </div>
        {pill}
      </button>
      {expanded && children && <div className="flex flex-col gap-3 px-4 pb-4">{children}</div>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// TIMELINE CARD — ala RouteDetailsCard: node lime (selesai) / outline (belum),
// konektor dashed, kolom meta (tanggal/jam) + judul + subtitle.
// steps kosong → ShipboxEmptyState di dalam card.
// ---------------------------------------------------------------------------
export type TimelineStep = { title: string; meta?: string; subtitle?: string; completed?: boolean }

export function ShipboxTimelineCard({
  title,
  steps,
  right,
  empty,
}: {
  title: string
  steps: TimelineStep[]
  right?: ReactNode
  empty?: { icon?: ReactNode; title: string; description?: string }
}) {
  return (
    <ShipboxCard title={title} right={right} contentClassName="flex h-full flex-col">
      {steps.length === 0 ? (
        empty ? <ShipboxEmptyState {...empty} /> : <ShipboxEmptyState title="Belum ada riwayat" />
      ) : (
        <div className="flex flex-1 flex-col justify-between">
          {steps.map((s, idx) => {
            const isLast = idx === steps.length - 1
            return (
              <div key={`${s.title}-${idx}`} className="relative flex items-start gap-3.5 pb-5 last:pb-0">
                <div className="relative flex flex-col items-center pt-0.5">
                  {s.completed ? (
                    <div className="z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#84E100] shadow-[0_2px_8px_rgba(132,225,0,0.3)]">
                      <span className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  ) : (
                    <div className="z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full border border-[#DCE1EA] bg-white text-[#141B29]">
                      <MapPin className="h-3 w-3 stroke-[2]" />
                    </div>
                  )}
                  {!isLast && <div className="my-0.5 h-[44px] w-[2px] border-l-2 border-dashed border-[#84E100]" />}
                </div>
                <div className="min-w-0 flex-1">
                  {s.meta && <div className="text-[12.5px] font-bold leading-snug text-[#141B29]">{s.meta}</div>}
                  <div className={`${s.meta ? 'mt-0.5' : ''} text-[13px] font-bold leading-snug text-[#141B29]`}>{s.title}</div>
                  {s.subtitle && <div className="mt-0.5 text-[11.5px] leading-snug text-[#8C95A4]">{s.subtitle}</div>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </ShipboxCard>
  )
}

// ---------------------------------------------------------------------------
// PROFILE CARD — ala DriverInfoCard: avatar/ikon + nama + status online,
// tombol aksi, lalu baris specs 3 kolom di bawah. Tanpa data → placeholder.
// ---------------------------------------------------------------------------
export function ShipboxProfileCard({
  title,
  avatar,
  name,
  subtitle,
  online,
  actions,
  specs,
  empty,
}: {
  title: string
  avatar?: ReactNode
  name?: string
  subtitle?: string
  online?: boolean
  actions?: ReactNode
  specs?: InfoItem[]
  empty?: { icon?: ReactNode; title: string; description?: string }
}) {
  return (
    <ShipboxCard title={title} contentClassName="flex flex-col justify-between">
      {!name ? (
        empty ? <ShipboxEmptyState {...empty} /> : <ShipboxEmptyState title="Belum ada data" />
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 pb-5">
            <div className="flex items-center gap-3">
              {avatar && <div className="shrink-0">{avatar}</div>}
              <div>
                <div className="text-[14px] font-bold text-[#141B29]">{name}</div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  {online !== undefined && <span className={`h-2 w-2 rounded-full ${online ? 'bg-[#22C55E]' : 'bg-[#DCE1EA]'}`} />}
                  {subtitle && <span className="text-[11.5px] font-medium text-[#5A6577]">{subtitle}</span>}
                </div>
              </div>
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
          {specs && specs.length > 0 && (
            <div className="grid grid-cols-3 gap-3 pt-1">
              {specs.map((sp, i) => {
                const isLastCol = (i + 1) % 3 === 0 || i === specs.length - 1
                return (
                  <div key={`${sp.label}-${i}`} className={!isLastCol ? 'border-r border-[#EEF1F6] pr-2' : 'pl-1'}>
                    <div className="mb-1 text-[11.5px] text-[#8C95A4]">{sp.label}</div>
                    <div className="truncate text-[13.5px] font-bold text-[#141B29]">{sp.value ?? '—'}</div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </ShipboxCard>
  )
}

// ---------------------------------------------------------------------------
// MAP CARD — ala LiveMapCard: kanvas kota vektor + marker + kontrol zoom.
// city content + marker di-pass sebagai children; tanpa marker → tetap tampil.
// ---------------------------------------------------------------------------
export function ShipboxMapCard({
  children,
  badge,
  fullscreenHeight = 'h-[430px]',
  normalHeight = 'h-[285px] xl:h-[305px]',
  onRecenter,
}: {
  children: ReactNode
  badge?: string
  fullscreenHeight?: string
  normalHeight?: string
  onRecenter?: () => void
}) {
  const [zoom, setZoom] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-[20px] border border-[#EAEDF2] bg-[#F4F5F7] shadow-[0_2px_12px_rgba(15,23,42,0.02)] transition-all duration-300 ${fullscreen ? fullscreenHeight : normalHeight}`}>
      <div className="h-full w-full origin-center transition-transform duration-300" style={{ transform: `scale(${zoom})` }}>
        {children}
      </div>
      {badge && (
        <div className="absolute left-3.5 top-3.5 rounded-full bg-white/95 px-3.5 py-1.5 text-[11.5px] font-semibold text-[#141B29] shadow-[0_4px_14px_rgba(15,23,42,0.1)]">
          📍 {badge}
        </div>
      )}
      <button
        onClick={() => setFullscreen((v) => !v)}
        className="absolute right-3.5 top-3.5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-white text-[#141B29] shadow-[0_4px_14px_rgba(15,23,42,0.1)] transition hover:bg-slate-50"
        title={fullscreen ? 'Exit Fullscreen' : 'Expand Map'}
      >
        {fullscreen ? <Minimize2 className="h-4 w-4 stroke-[2]" /> : <Maximize2 className="h-4 w-4 stroke-[2]" />}
      </button>
      <div className="absolute bottom-3.5 right-3.5 flex flex-col gap-2">
        <div className="flex flex-col divide-y divide-[#EEF1F6] overflow-hidden rounded-xl bg-white shadow-[0_4px_14px_rgba(15,23,42,0.1)]">
          <button onClick={() => setZoom((z) => Math.min(1.4, +(z + 0.15).toFixed(2)))} className="flex h-8 w-9 cursor-pointer items-center justify-center text-base font-semibold text-[#141B29] transition hover:bg-slate-50" title="Zoom In">+</button>
          <button onClick={() => setZoom((z) => Math.max(0.85, +(z - 0.15).toFixed(2)))} className="flex h-8 w-9 cursor-pointer items-center justify-center text-base font-semibold text-[#141B29] transition hover:bg-slate-50" title="Zoom Out">−</button>
        </div>
        <button
          onClick={() => { setZoom(1); onRecenter?.() }}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-white text-[#141B29] shadow-[0_4px_14px_rgba(15,23,42,0.1)] transition hover:bg-slate-50"
          title="Pusatkan"
        >
          <LocateFixed className="h-4 w-4 stroke-[2]" />
        </button>
      </div>
    </div>
  )
}
