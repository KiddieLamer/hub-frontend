/**
 * Modul Social — dashboard Social Media Management (redesign bento orange).
 *
 * UI diporting dari desain "social media management dashboard", palet diubah ke
 * brand modul Social: latar #FFFFFF, primary #8F6CFC (ungu), secondary #FEE68B
 * (kuning), teks #000000. Isi: KPI cards, Upload Frequency heatmap, Dual-Track
 * Timeline, Content Mix + Content Queue, Active Social Channels, modal detail post.
 *
 * CATATAN DATA: sementara masih pakai data contoh bawaan desain (UI shell).
 * Wiring data nyata menyusul:
 *  - Akun terhubung: clients.social_media (via CRM → CustomerModal)
 *  - Jadwal/postingan: butuh backend social baru (tabel + routes)
 *
 * Adaptasi layout: window Social "wide fill" (~860px content pane) memakai
 * bento 2 kolom ala referensi HR dashboard — kiri 8/12 (KPI → heatmap), rail
 * kanan 4/12 (Content Mix + Queue, Active Channels), dan kartu Dual-Track
 * Timeline jadi BARIS FULL-WIDTH di bawahnya supaya rentang 1 minggu muat
 * tanpa scroll horizontal.
 */

import { useMemo, useState } from 'react'
import {
  Search,
  ChevronDown,
  ArrowUpRight,
  ArrowRight,
  Check,
  Share2,
  BarChart3,
  Layers,
  LayoutGrid,
  X,
  Calendar,
} from 'lucide-react'
import { DualTrackTimelineCard, type TimelineRange } from './DualTrackTimelineCard'
import type { TimelineAxisTick, TimelineMilestone } from './types/timeline'


// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type SocialPlatform =
  | 'overview'
  | 'instagram'
  | 'tiktok'
  | 'threads'
  | 'youtube'
  | 'youtube_shorts'
  | 'facebook'
  | 'x'

type SpecificPlatform = Exclude<SocialPlatform, 'overview'>

interface TimelinePost {
  id: string
  title: string
  platform: SpecificPlatform
  track: 'short_form' | 'long_and_feed'
  startDayIndex: number
  spanDays: number
  status: 'published' | 'scheduled'
  publishDate: string
  publishTime: string
  metricsPreview: string
  caption: string
}

interface ContentTask {
  id: string
  title: string
  platform: SpecificPlatform
  dueLabel: string
  completed: boolean
}

interface DashboardData {
  kpis: {
    id: string
    title: string
    value: string
    growth: string
    isFeatured?: boolean
  }[]
  heatmap: number[][] // 4 hari (Sen-Kam) x 14 slot waktu (0: kosong, 1: 1 post, 2: 2+ post)
  timelinePosts: TimelinePost[]
  distribution: {
    totalReach: string
    segments: { label: string; percentage: number; colorClass: string }[]
  }
  tasks: ContentTask[]
  activeAccountsCount: number
}

// ============================================================================
// CONSTANTS & DATA (mock UI shell — wire data nyata menyusul)
// ============================================================================

const NAVBAR_PLATFORMS: { id: SocialPlatform; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'threads', label: 'Threads' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'youtube_shorts', label: 'YouTube Shorts' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'x', label: 'X' },
]

const PLATFORM_BADGES: Record<
  SpecificPlatform,
  { short: string; name: string; badgeBg: string; badgeText: string }
> = {
  instagram: {
    short: 'IG',
    name: 'Instagram',
    badgeBg: 'bg-pink-500/20',
    badgeText: 'text-pink-100',
  },
  tiktok: {
    short: 'TT',
    name: 'TikTok',
    badgeBg: 'bg-cyan-400/20',
    badgeText: 'text-cyan-100',
  },
  threads: {
    short: 'TH',
    name: 'Threads',
    badgeBg: 'bg-neutral-500/30',
    badgeText: 'text-neutral-100',
  },
  youtube: {
    short: 'YT',
    name: 'YouTube',
    badgeBg: 'bg-red-500/25',
    badgeText: 'text-red-100',
  },
  youtube_shorts: {
    short: 'SHORTS',
    name: 'YouTube Shorts',
    badgeBg: 'bg-red-500/25',
    badgeText: 'text-red-100',
  },
  facebook: {
    short: 'FB',
    name: 'Facebook',
    badgeBg: 'bg-blue-500/25',
    badgeText: 'text-blue-100',
  },
  x: {
    short: 'X',
    name: 'X',
    badgeBg: 'bg-white/20',
    badgeText: 'text-white',
  },
}

const TIMELINE_DATES = [
  '12 Apr',
  '13 Apr',
  '14 Apr',
  '15 Apr',
  '16 Apr',
  '17 Apr',
  '18 Apr',
  '19 Apr',
  '20 Apr',
]

// Rentang timeline: week = 12–20 Apr (window mock), month = 1–30 Apr penuh
const TIMELINE_RANGE_CONFIG = {
  week: { firstDay: 12, totalDays: 9 },
  month: { firstDay: 1, totalDays: 30 },
} as const

const OVERVIEW_DATA: DashboardData = {
  kpis: [
    { id: 'ov-1', title: 'Total Content Up', value: '1,247', growth: '+12%', isFeatured: true },
    { id: 'ov-2', title: 'Uploaded This Month', value: '84', growth: '+18%' },
    { id: 'ov-3', title: 'Avg. Engagement Rate', value: '8.7%', growth: '+5%' },
  ],
  heatmap: [
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 2, 0, 0, 2, 0, 2, 2, 0, 0, 0, 0, 2],
    [1, 2, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0],
    [0, 0, 2, 0, 1, 2, 2, 0, 1, 2, 0, 0, 2, 0],
  ],
  timelinePosts: [
    {
      id: 'ov-p1',
      title: 'Behind The Scenes',
      platform: 'instagram',
      track: 'short_form',
      startDayIndex: 0.4,
      spanDays: 2.3,
      status: 'published',
      publishDate: '12 Apr',
      publishTime: '10:00 AM',
      metricsPreview: '42.8K Plays · 3.1K Likes',
      caption: 'Behind-the-scenes look at creative production and daily reel shoots.',
    },
    {
      id: 'ov-p2',
      title: 'Product Teaser Hook',
      platform: 'tiktok',
      track: 'short_form',
      startDayIndex: 3.1,
      spanDays: 2.3,
      status: 'published',
      publishDate: '15 Apr',
      publishTime: '06:30 PM',
      metricsPreview: '118.4K Views · 9.4K Likes',
      caption: 'High-retention short hook introducing our multi-channel workflow.',
    },
    {
      id: 'ov-p3',
      title: '60s Workflow Hack',
      platform: 'youtube_shorts',
      track: 'short_form',
      startDayIndex: 5.8,
      spanDays: 2.4,
      status: 'scheduled',
      publishDate: '18 Apr',
      publishTime: '04:00 PM',
      metricsPreview: 'Scheduled · Auto-Publish Ready',
      caption: 'Quick 60-second YouTube Short showing batch content scheduling.',
    },
    {
      id: 'ov-p4',
      title: 'Tech Deep Dive Ep.12',
      platform: 'youtube',
      track: 'long_and_feed',
      startDayIndex: 1.0,
      spanDays: 2.5,
      status: 'published',
      publishDate: '13 Apr',
      publishTime: '02:00 PM',
      metricsPreview: '29.5K Views · 7.8% CTR',
      caption: 'Full episode walking through analytics attribution across social channels.',
    },
    {
      id: 'ov-p5',
      title: 'Launch Thread Breakdown',
      platform: 'threads',
      track: 'long_and_feed',
      startDayIndex: 3.8,
      spanDays: 2.2,
      status: 'published',
      publishDate: '16 Apr',
      publishTime: '11:15 AM',
      metricsPreview: '14.2K Views · 410 Reposts',
      caption: 'Multi-part thread sharing lessons from cross-posting short & long formats.',
    },
    {
      id: 'ov-p6',
      title: 'Community Recap & Poll',
      platform: 'x',
      track: 'long_and_feed',
      startDayIndex: 6.3,
      spanDays: 2.1,
      status: 'scheduled',
      publishDate: '19 Apr',
      publishTime: '09:00 AM',
      metricsPreview: 'Scheduled · Cross-post FB',
      caption: 'Weekly community poll and topic vote for next week’s video series.',
    },
  ],
  distribution: {
    totalReach: '246.2K',
    segments: [
      { label: 'Short-Form Video', percentage: 45, colorClass: 'bg-[#8F6CFC]' },
      { label: 'Feed & Carousel', percentage: 35, colorClass: 'bg-[#FEE68B]' },
      { label: 'Long-Form & Text', percentage: 20, colorClass: 'bg-[#E4D9FF]' },
    ],
  },
  tasks: [
    {
      id: 't1',
      title: 'Upload IG Reels & TikTok Teaser',
      platform: 'instagram',
      dueLabel: 'Published today',
      completed: true,
    },
    {
      id: 't2',
      title: 'Cross-post Threads & X Thread',
      platform: 'threads',
      dueLabel: 'Published today',
      completed: true,
    },
    {
      id: 't3',
      title: 'Schedule YouTube Shorts Ep. 14',
      platform: 'youtube_shorts',
      dueLabel: 'Due in 2 days',
      completed: false,
    },
    {
      id: 't4',
      title: 'Approve Facebook Carousel Copy',
      platform: 'facebook',
      dueLabel: 'Due in 4 days',
      completed: false,
    },
    {
      id: 't5',
      title: 'Final Cut YouTube Main Video',
      platform: 'youtube',
      dueLabel: 'Due in 1 week',
      completed: false,
    },
  ],
  activeAccountsCount: 7,
}

const createPlatformData = (
  platform: SpecificPlatform,
  total: string,
  monthly: string,
  er: string,
  reach: string
): DashboardData => {
  const info = PLATFORM_BADGES[platform]
  const platformPosts = OVERVIEW_DATA.timelinePosts.filter((p) => p.platform === platform)
  const postsToShow =
    platformPosts.length > 0
      ? platformPosts.map((post, idx) => ({
          ...post,
          id: `${platform}-p-${idx}`,
          title: `${info.name}: ${post.title}`,
        }))
      : OVERVIEW_DATA.timelinePosts.slice(0, 2).map((post, idx) => ({
          ...post,
          id: `${platform}-fallback-${idx}`,
          platform,
          title: `${info.name}: ${post.title}`,
        }))

  return {
    ...OVERVIEW_DATA,
    kpis: [
      {
        id: `${platform}-1`,
        title: `Total ${info.name} Content`,
        value: total,
        growth: '+14%',
        isFeatured: true,
      },
      { id: `${platform}-2`, title: 'Uploaded This Month', value: monthly, growth: '+11%' },
      { id: `${platform}-3`, title: `${info.name} Engagement`, value: er, growth: '+4%' },
    ],
    timelinePosts: postsToShow,
    distribution: {
      ...OVERVIEW_DATA.distribution,
      totalReach: reach,
    },
    activeAccountsCount: 1,
  }
}

const DASHBOARD_DATA: Record<SocialPlatform, DashboardData> = {
  overview: OVERVIEW_DATA,
  instagram: createPlatformData('instagram', '412', '28', '9.4%', '98.4K'),
  tiktok: createPlatformData('tiktok', '295', '24', '11.2%', '184.0K'),
  threads: createPlatformData('threads', '164', '14', '6.8%', '32.1K'),
  youtube: createPlatformData('youtube', '78', '6', '7.9%', '64.5K'),
  youtube_shorts: createPlatformData('youtube_shorts', '132', '12', '8.5%', '79.2K'),
  facebook: createPlatformData('facebook', '92', '8', '5.4%', '28.9K'),
  x: createPlatformData('x', '74', '10', '6.1%', '21.7K'),
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SocialContent() {
  const [activePlatform, setActivePlatform] = useState<SocialPlatform>('overview')
  const [selectedPost, setSelectedPost] = useState<TimelinePost | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({})
  const [timelineRange, setTimelineRange] = useState<TimelineRange>('week')

  const currentData = DASHBOARD_DATA[activePlatform]
  const activePlatformLabel =
    NAVBAR_PLATFORMS.find((item) => item.id === activePlatform)?.label ?? 'Overview'

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return currentData.timelinePosts
    const q = searchQuery.toLowerCase()
    return currentData.timelinePosts.filter(
      (post) =>
        post.title.toLowerCase().includes(q) ||
        PLATFORM_BADGES[post.platform].name.toLowerCase().includes(q) ||
        post.status.toLowerCase().includes(q)
    )
  }, [currentData.timelinePosts, searchQuery])

  // Timeline milestone: posisi % dari tanggal hari-ke-n dalam rentang terpilih
  // (inset 4% di tiap ujung supaya label tidak kepotong). Post mock mulai 12 Apr.
  const timelinePosition = (dayOfMonth: number, range: TimelineRange) => {
    const { firstDay, totalDays } = TIMELINE_RANGE_CONFIG[range]
    return 4 + ((dayOfMonth - firstDay) / (totalDays - 1)) * 92
  }

  const timelineTicks = useMemo<TimelineAxisTick[]>(() => {
    if (timelineRange === 'month') {
      return [1, 5, 10, 15, 20, 25, 30].map((day) => ({
        label: `${day} Apr`,
        positionPercent: timelinePosition(day, 'month'),
      }))
    }
    return TIMELINE_DATES.map((label, i) => ({
      label,
      positionPercent: timelinePosition(12 + i, 'week'),
    }))
  }, [timelineRange])

  const timelineMilestones = useMemo<TimelineMilestone[]>(
    () =>
      filteredPosts.map((post, i) => ({
        id: post.id,
        platform: post.platform,
        track: post.track,
        tier: i % 2 === 1 ? 'high' : 'normal',
        status: post.status,
        positionPercent: timelinePosition(12 + post.startDayIndex, timelineRange),
        dateLabel: post.publishDate,
        title: post.title,
      })),
    [filteredPosts, timelineRange]
  )

  // Milestone → post asli (id 1:1) supaya modal detail tetap punya caption/metrics
  const handleSelectMilestone = (item: TimelineMilestone) => {
    const post = currentData.timelinePosts.find((p) => p.id === item.id)
    if (post) setSelectedPost(post)
  }

  const todayLabel = `Today, ${new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })}`

  const toggleTask = (taskId: string, defaultCompleted: boolean) => {
    setCompletedTasks((prev) => {
      const current = prev[taskId] ?? defaultCompleted
      return { ...prev, [taskId]: !current }
    })
  }

  return (
    <div
      className="relative h-full"
      style={{ background: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}
    >
      {/* Area dashboard (scroll) — title bar pakai toolbar standar WindowShell */}
      <div className="h-full overflow-y-auto selection:bg-[#8F6CFC] selection:text-white">
        <div className="mx-auto max-w-[1400px] space-y-5 p-4 text-black md:p-6">
          {/* Baris nav ala referensi: logo modul + tabs platform (logo+teks) + search */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Logo modul Social — klik balik ke Overview */}
            <button
              type="button"
              onClick={() => setActivePlatform('overview')}
              aria-label="Social"
              className="shrink-0 cursor-pointer"
            >
              <img src="/icons/social.png" alt="Social" className="h-9 w-9 rounded-lg object-cover" />
            </button>

            {/* Platform nav tabs (logo + teks) */}
            <nav
              aria-label="Social Media Platforms"
              className="flex items-center gap-1 bg-white p-1.5 rounded-full shadow-2xs border border-neutral-100 overflow-x-auto max-w-full flex-1 min-w-0"
            >
              {NAVBAR_PLATFORMS.map((platform) => {
                const isActive = activePlatform === platform.id
                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => setActivePlatform(platform.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#F1EBFF] text-[#8F6CFC] font-semibold shadow-2xs'
                        : 'text-neutral-500 hover:text-black hover:bg-neutral-50'
                    }`}
                  >
                    {platform.id === 'overview' ? (
                      <LayoutGrid className="w-3.5 h-3.5" />
                    ) : (
                      <img
                        src={`/icons/social/${platform.id === 'youtube_shorts' ? 'youtube-shorts' : platform.id}.png`}
                        alt=""
                        className="h-4 w-4 object-contain"
                      />
                    )}
                    {platform.label}
                  </button>
                )
              })}
            </nav>

            {/* Search — satu baris dengan tabs biar nggak sendirian */}
            <div className="flex items-center bg-white rounded-full border border-neutral-100 shadow-2xs overflow-hidden shrink-0">
              {searchOpen && (
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="pl-3.5 pr-1 py-2 text-xs bg-transparent focus:outline-none w-32 sm:w-40 text-neutral-800"
                />
              )}
              <button
                type="button"
                onClick={() => {
                  if (searchOpen && searchQuery) {
                    setSearchQuery('')
                  } else {
                    setSearchOpen((prev) => !prev)
                  }
                }}
                aria-label="Search"
                className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                {searchOpen && searchQuery ? (
                  <X className="w-4 h-4 text-neutral-500" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Page header + date filter */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-black">
              {activePlatform === 'overview' ? 'Overview' : `${activePlatformLabel} Monitoring`}
            </h1>
            <button
              type="button"
              className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full text-xs font-medium text-neutral-600 border border-neutral-200/70 hover:bg-neutral-50 cursor-pointer shadow-2xs"
            >
              Last 30 days (vs. prior) <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          </div>

          {/* Bento ala referensi HR dashboard: kolom kiri (KPI → heatmap) + rail kanan; timeline full-width */}
          <div className="grid grid-cols-12 gap-5">
            {/* Kolom kiri */}
            <div className="col-span-8 space-y-5">
              {/* 3 kartu KPI */}
              <div className="grid grid-cols-3 gap-4">
                {currentData.kpis.map((kpi, idx) =>
                  kpi.isFeatured ? (
                    <div
                      key={kpi.id}
                      className="relative overflow-hidden rounded-[28px] p-5 text-white flex flex-col justify-between min-h-[190px] bg-gradient-to-br from-[#1C1917] via-[#5F3DBD] to-[#8F6CFC] shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-black/40 backdrop-blur-xs flex items-center justify-center">
                          <Share2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-xs text-[11px] font-medium flex items-center gap-0.5">
                          {kpi.growth} <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>

                      <div className="mt-6">
                        <p className="text-xs text-white/80 mb-1">{kpi.title}</p>
                        <div className="flex items-end justify-between">
                          <span className="text-3xl font-semibold tracking-tight">{kpi.value}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-1 rounded-full bg-[#FEE68B]" />
                            <span className="w-2 h-1 rounded-full bg-white/40" />
                            <button
                              type="button"
                              onClick={() => setSelectedPost(currentData.timelinePosts[0] ?? null)}
                              aria-label="Inspect latest content"
                              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition cursor-pointer ml-1"
                            >
                              <ArrowRight className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={kpi.id}
                      className="relative overflow-hidden bg-white rounded-[28px] p-5 flex flex-col justify-between min-h-[190px] border border-neutral-100 shadow-2xs"
                    >
                      <div className="pointer-events-none absolute -top-10 right-4 w-28 h-20 rounded-full bg-neutral-100/80 blur-lg" />

                      <div className="flex items-center justify-between relative z-10">
                        <div className="w-9 h-9 rounded-xl bg-neutral-900 flex items-center justify-center text-white">
                          {idx === 1 ? (
                            <Layers className="w-4 h-4" />
                          ) : (
                            <BarChart3 className="w-4 h-4" />
                          )}
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 text-[11px] font-medium flex items-center gap-0.5">
                          {kpi.growth} <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>

                      <div className="mt-6 relative z-10">
                        <p className="text-xs text-neutral-500 mb-1">{kpi.title}</p>
                        <div className="flex items-end justify-between">
                          <span className="text-3xl font-semibold tracking-tight text-black">
                            {kpi.value}
                          </span>
                          <div className="flex gap-1 mb-1.5">
                            <span className="w-3 h-1 rounded-full bg-[#8F6CFC]" />
                            <span className="w-2 h-1 rounded-full bg-[#FEE68B]" />
                            <span className="w-1.5 h-1 rounded-full bg-neutral-200" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Upload Frequency heatmap (14 kolom) */}
              <div className="bg-white rounded-[28px] p-6 border border-neutral-100 shadow-2xs relative overflow-hidden">
                <div className="pointer-events-none absolute -top-10 left-1/4 w-44 h-20 rounded-full bg-neutral-100/70 blur-xl" />

                <div className="flex items-center justify-between mb-5 relative z-10">
                  <div>
                    <h2 className="text-lg font-semibold text-black">Upload Frequency</h2>
                    <p className="text-xs text-neutral-400">
                      Daily content publishing intensity across time slots
                    </p>
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
                  >
                    Weekly <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                </div>

                <div className="space-y-2.5 overflow-x-auto pb-1">
                  {['Mon', 'Tue', 'Wed', 'Thu'].map((day, rowIdx) => (
                    <div key={day} className="flex items-center gap-4 min-w-[500px]">
                      <span className="w-10 text-xs font-medium text-neutral-400">{day}</span>
                      <div
                        className="grid gap-1.5 flex-1"
                        style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}
                      >
                        {currentData.heatmap[rowIdx].map((level, colIdx) => {
                          const cellColor =
                            level === 2
                              ? 'bg-[#8F6CFC] hover:bg-[#7D5BE8]'
                              : level === 1
                              ? 'bg-[#D9C9FF] hover:bg-[#CBB6FF]'
                              : 'bg-[#E5E5E5] hover:bg-neutral-300'

                          return (
                            <div
                              key={colIdx}
                              className={`h-7 rounded-md ${cellColor} transition-colors cursor-pointer`}
                              title={`${day} · Slot ${colIdx + 1}: ${
                                level === 2
                                  ? 'High Upload (2+ Posts)'
                                  : level === 1
                                  ? 'Moderate (1 Post)'
                                  : 'No Content Uploaded'
                              }`}
                            />
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Rail kanan: Content Mix + Queue & Active Channels */}
            <div className="col-span-4 flex flex-col gap-5">
              <div className="bg-white rounded-[28px] p-6 border border-neutral-100 shadow-2xs relative overflow-hidden flex flex-col">
                <div className="pointer-events-none absolute -top-10 left-1/3 w-36 h-20 rounded-full bg-neutral-100/80 blur-lg" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-black">Content Mix</h2>
                    <span className="text-2xl font-bold tracking-tight text-black">
                      {currentData.distribution.totalReach}
                    </span>
                  </div>

                  <div className="flex gap-1.5 mb-7">
                    {currentData.distribution.segments.map((seg) => (
                      <div key={seg.label} style={{ width: `${seg.percentage}%` }}>
                        <div className="text-xs font-semibold text-black mb-1.5">
                          {seg.percentage}%
                        </div>
                        <div
                          className={`h-11 rounded-xl ${seg.colorClass} transition-all duration-300`}
                          title={`${seg.label}: ${seg.percentage}%`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content Queue gelap */}
                <div className="relative pt-4">
                  <div className="mx-6 h-3 rounded-t-2xl bg-neutral-300/70" />
                  <div className="mx-3 h-3 rounded-t-2xl bg-neutral-600/80" />
                  <div className="bg-[#1C1917] text-white rounded-[24px] p-5 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-medium">Content Queue</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#8F6CFC] text-white text-xs font-semibold">
                        {currentData.tasks.length}
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      {currentData.tasks.map((task) => {
                        const isDone = completedTasks[task.id] ?? task.completed
                        return (
                          <div
                            key={task.id}
                            onClick={() => toggleTask(task.id, task.completed)}
                            className="flex items-center justify-between gap-3 cursor-pointer group select-none"
                          >
                            <div className="min-w-0">
                              <p
                                className={`text-xs font-medium truncate transition ${
                                  isDone
                                    ? 'text-white'
                                    : 'text-neutral-200 group-hover:text-white'
                                }`}
                              >
                                {task.title}
                              </p>
                              <p className="text-[11px] text-neutral-400">{task.dueLabel}</p>
                            </div>
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center border transition shrink-0 ${
                                isDone
                                  ? 'bg-[#8F6CFC] border-[#8F6CFC] text-white'
                                  : 'border-neutral-600 bg-neutral-800 group-hover:border-neutral-400'
                              }`}
                            >
                              {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Social Channels */}
              <div className="bg-white rounded-[28px] p-6 border border-neutral-100 shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-700 mb-2">
                    Active Social Channels
                  </p>
                  <p className="text-3xl font-bold tracking-tight text-black">
                    {currentData.activeAccountsCount}{' '}
                    <span className="text-sm font-normal text-neutral-400">connected</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePlatform('overview')}
                  className="px-4 py-2 rounded-full bg-[#8F6CFC] hover:bg-[#7D5BE8] text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Timeline full width — muat rentang 1 minggu penuh tanpa scroll */}
            <div className="col-span-12">
              <DualTrackTimelineCard
                axisTicks={timelineTicks}
                milestones={timelineMilestones}
                onSelectMilestone={handleSelectMilestone}
                todayLabel={todayLabel}
                syncPlatform={activePlatform}
                range={timelineRange}
                onRangeChange={setTimelineRange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal detail post — di dalam window, bukan seluruh desktop */}
      {selectedPost && (
        <div
          onClick={() => setSelectedPost(null)}
          className="absolute inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-30"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[28px] p-6 max-w-md w-full shadow-xl border border-neutral-100 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#F1EBFF] text-[#8F6CFC] text-xs font-semibold uppercase">
                {PLATFORM_BADGES[selectedPost.platform].name}
              </span>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="w-7 h-7 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-black">{selectedPost.title}</h3>
              <p className="text-xs text-neutral-500 flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>
                  {selectedPost.publishDate} · {selectedPost.publishTime}
                </span>
              </p>
            </div>

            <p className="text-xs text-neutral-600 bg-[#F4F4F3] p-3.5 rounded-2xl leading-relaxed">
              {selectedPost.caption}
            </p>

            <div className="bg-neutral-50 rounded-2xl p-3.5 space-y-1.5 text-xs border border-neutral-100">
              <div className="flex justify-between">
                <span className="text-neutral-500">Timeline Track</span>
                <span className="font-medium text-black">
                  {selectedPost.track === 'short_form'
                    ? 'Track 1 · Short-Form Video'
                    : 'Track 2 · Feed, Thread & Long-Form'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Status</span>
                <span className="font-semibold capitalize text-[#8F6CFC]">
                  {selectedPost.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Performance</span>
                <span className="font-medium text-black">
                  {selectedPost.metricsPreview}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
