/**
 * DualTrackTimelineCard — kartu timeline milestone ala referensi HR dashboard:
 * satu garis horizontal, titik post di atas garis (short-form) & di bawah
 * (feed & long-form) dengan stem + label tanggal/logo/judul, indikator
 * "Today", zona sorot campaign di kanan, sumbu tanggal di bawah, filter
 * channel internal (logo, tanpa teks), dan dropdown rentang Week/Month.
 * Palet modul Social: primary #8F6CFC (ungu), teks #000.
 * Logo platform: asset asli di /icons/social/*.png (tidak dipotong).
 */

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { TimelineAxisTick, TimelineMilestone, SocialPlatform } from './types/timeline'

const PLATFORM_META: Record<
  SocialPlatform,
  { short: string; name: string; logo: string }
> = {
  instagram: { short: 'IG', name: 'Instagram', logo: '/icons/social/instagram.png' },
  tiktok: { short: 'TT', name: 'TikTok', logo: '/icons/social/tiktok.png' },
  threads: { short: 'TH', name: 'Threads', logo: '/icons/social/threads.png' },
  youtube: { short: 'YT', name: 'YouTube', logo: '/icons/social/youtube.png' },
  youtube_shorts: { short: 'SHORTS', name: 'YouTube Shorts', logo: '/icons/social/youtube-shorts.png' },
  facebook: { short: 'FB', name: 'Facebook', logo: '/icons/social/facebook.png' },
  x: { short: 'X', name: 'X', logo: '/icons/social/x.png' },
}

const FILTER_TABS: { id: 'all' | SocialPlatform; label: string }[] = [
  { id: 'all', label: 'All Channels' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'youtube_shorts', label: 'YouTube Shorts' },
  { id: 'threads', label: 'Threads' },
  { id: 'x', label: 'X' },
  { id: 'facebook', label: 'Facebook' },
]

export type TimelineRange = 'week' | 'month'

interface DualTrackTimelineCardProps {
  title?: string
  subtitle?: string
  todayLabel?: string
  todayPositionPercent?: number
  highlightZone?: {
    startPercent: number
    widthPercent: number
    label: string
  }
  range?: TimelineRange
  onRangeChange?: (range: TimelineRange) => void
  axisTicks: TimelineAxisTick[]
  milestones: TimelineMilestone[]
  onSelectMilestone?: (item: TimelineMilestone) => void
  /** Sinkron dengan tab platform di header dashboard ('overview' = All Channels) */
  syncPlatform?: SocialPlatform | 'overview'
}

export function DualTrackTimelineCard({
  title = 'Dual-Track Timeline',
  subtitle = 'Short-Form posts above the line, Feed & Long-Form schedule below. Hollow dots show upcoming scheduled posts.',
  todayLabel = 'Today',
  todayPositionPercent = 24,
  highlightZone = {
    startPercent: 80,
    widthPercent: 13.5,
    label: 'Campaign peak',
  },
  range = 'week',
  onRangeChange,
  axisTicks,
  milestones,
  onSelectMilestone,
  syncPlatform,
}: DualTrackTimelineCardProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | SocialPlatform>('all')

  // Sinkron dengan tab platform di header dashboard ('overview' = semua channel)
  useEffect(() => {
    if (!syncPlatform) return
    setSelectedPlatform(syncPlatform === 'overview' ? 'all' : syncPlatform)
  }, [syncPlatform])

  const visibleMilestones =
    selectedPlatform === 'all'
      ? milestones
      : milestones.filter((item) => item.platform === selectedPlatform)

  return (
    <div className="bg-white rounded-[28px] p-6 border border-neutral-200/80 shadow-2xs">
      {/* HEADER & LEGENDA */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-black tracking-tight">{title}</h2>
          <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
        </div>

        {/* Legend: Pill Hitam (Short-Form), Pill Ungu (Feed & Long), Pill Outline (Scheduled) */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-neutral-700">
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-1.5 rounded-full bg-black inline-block" />
            Short-Form
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-1.5 rounded-full bg-[#8F6CFC] inline-block" />
            Feed &amp; Long
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-1.5 rounded-full border border-[#D9C9FF] bg-white inline-block" />
            Scheduled
          </span>
        </div>
      </div>

      {/* FILTER CHANNEL (LOGO) + DROPDOWN RENTANG */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-1 bg-neutral-100/90 p-1 rounded-full w-fit max-w-full overflow-x-auto">
          {FILTER_TABS.map((tab) => {
            const active = selectedPlatform === tab.id
            const meta = tab.id === 'all' ? null : PLATFORM_META[tab.id]
            return (
              <button
                key={tab.id}
                title={meta ? meta.name : 'All Channels'}
                onClick={() => setSelectedPlatform(tab.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition whitespace-nowrap cursor-pointer ${
                  meta
                    ? active
                      ? 'bg-white shadow-2xs'
                      : 'opacity-45 hover:opacity-100'
                    : active
                    ? 'bg-white text-[#8F6CFC] font-semibold shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {meta ? (
                  <img src={meta.logo} alt={meta.name} className="h-5 w-5 object-contain" />
                ) : (
                  tab.label
                )}
              </button>
            )
          })}
        </div>

        {/* Dropdown rentang Week / Month */}
        <div className="relative">
          <select
            value={range}
            onChange={(e) => onRangeChange?.(e.target.value as TimelineRange)}
            aria-label="Timeline range"
            className="appearance-none bg-white border border-neutral-200 rounded-full pl-3.5 pr-8 py-1.5 text-xs font-medium text-neutral-700 cursor-pointer focus:outline-none"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* AREA TIMELINE HORIZONTAL */}
      <div className="overflow-x-auto pb-2">
        <div className="relative min-w-[680px] h-[300px] select-none">
          {/* ZONA SOROTAN DI KANAN */}
          {highlightZone && (
            <div
              style={{
                left: `${highlightZone.startPercent}%`,
                width: `${highlightZone.widthPercent}%`,
              }}
              className="absolute top-6 bottom-8 rounded-2xl bg-[#F1EBFF]/85 border border-[#D9C9FF]/60 pointer-events-none flex flex-col justify-start items-center pt-2.5"
            >
              <span className="text-[11px] font-semibold text-[#8F6CFC] tracking-tight">
                {highlightZone.label}
              </span>
            </div>
          )}

          {/* GARIS HORIZONTAL UTAMA (50% HEIGHT) */}
          <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-[1.5px] bg-neutral-200" />

          {/* INDIKATOR HARI INI */}
          <div
            style={{ left: `${todayPositionPercent}%` }}
            className="absolute top-4 bottom-12 -translate-x-1/2 flex flex-col items-center z-20 pointer-events-none"
          >
            <span className="px-3.5 py-1 rounded-full bg-neutral-950 text-white text-xs font-semibold shadow-sm whitespace-nowrap">
              {todayLabel}
            </span>
            <div className="w-[2px] flex-1 bg-neutral-950" />
          </div>

          {/* TITIK MILESTONE ATAS & BAWAH GARIS */}
          {visibleMilestones.map((item) => {
            const isAbove = item.track === 'short_form'
            const stemHeight = item.tier === 'high' ? 68 : 34
            const badge = PLATFORM_META[item.platform]

            const dotClass = isAbove
              ? item.status === 'published'
                ? 'bg-neutral-950 border-neutral-950'
                : 'bg-white border-neutral-400'
              : item.status === 'published'
              ? 'bg-[#8F6CFC] border-[#8F6CFC]'
              : 'bg-white border-[#8F6CFC]'

            return (
              <div
                key={item.id}
                style={{ left: `${item.positionPercent}%` }}
                onClick={() => onSelectMilestone?.(item)}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 group cursor-pointer"
                title={`[${badge.name}] ${item.title} • ${item.dateLabel}`}
              >
                {/* Titik pada garis utama */}
                <div
                  className={`w-3 h-3 rounded-full border-2 transition-transform duration-150 group-hover:scale-125 ${dotClass}`}
                />

                {/* Garis vertikal penghubung & label di ATAS atau BAWAH garis */}
                {isAbove ? (
                  <div
                    style={{ height: `${stemHeight}px` }}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[1px] bg-neutral-300 group-hover:bg-neutral-800 transition-colors"
                  >
                    <div className="absolute bottom-full left-0 pb-1.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-black">
                          {item.dateLabel}
                        </span>
                        <img
                          src={badge.logo}
                          alt={badge.name}
                          className="h-4 w-4 object-contain shrink-0"
                        />
                      </div>
                      <div className="text-[11px] text-neutral-600 group-hover:text-neutral-950 font-medium">
                        {item.title}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{ height: `${stemHeight}px` }}
                    className="absolute top-3 left-1/2 -translate-x-1/2 w-[1px] bg-neutral-300 group-hover:bg-[#8F6CFC] transition-colors"
                  >
                    <div className="absolute top-full left-0 pt-1.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-black">
                          {item.dateLabel}
                        </span>
                        <img
                          src={badge.logo}
                          alt={badge.name}
                          className="h-4 w-4 object-contain shrink-0"
                        />
                      </div>
                      <div className="text-[11px] text-neutral-600 group-hover:text-[#8F6CFC] font-medium">
                        {item.title}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* SUMBU TANGGAL DI BAGIAN BAWAH */}
          <div className="absolute left-0 right-0 bottom-0 h-6">
            {axisTicks.map((tick) => (
              <span
                key={tick.label}
                style={{ left: `${tick.positionPercent}%` }}
                className="absolute -translate-x-1/2 text-[11px] font-medium text-neutral-400 whitespace-nowrap"
              >
                {tick.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
