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

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Search,
  ArrowUpRight,
  ArrowRight,
  ArrowDownRight,
  Check,
  Share2,
  BarChart3,
  Layers,
  LayoutGrid,
  SlidersHorizontal,
  X,
  Calendar,
} from 'lucide-react'
import { DualTrackTimelineCard, type TimelineRange } from './DualTrackTimelineCard'
import { tenantsApi, tasksApi, projectsApi } from '../../lib/endpoints'
import type { TimelineAxisTick, TimelineMilestone, SocialPlatform as PostPlatform } from './types/timeline'
import { CONTENT_TYPE_LABELS, CONTENT_FORMAT_LABELS } from './types/timeline'


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

// ======================================================================
// Upload Frequency heatmap — intensitas publish per periode terpilih.
// Data masih MOCK deterministik (seed dari periode) sampai backend social
// menyediakan data posting nyata; pola stabil per bulan/tahun yang sama.
// ======================================================================
const HEAT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HEAT_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// Yearly (ala GitHub contribution graph): 5 tingkat warna + kotak 11px
const HEAT_CELL = 11
const HEAT_GAP = 3
const HEAT_LEVEL_COLORS = ['#E5E5E5', '#EDE7FC', '#D9C9FF', '#B69DFD', '#8F6CFC']
const HEAT_MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const heatLevelOf = (count: number) => (count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 6 ? 3 : 4)

// Track timeline per sifat platform: reel/vertikal = short-form, sisanya feed & long
const SHORT_FORM_PLATFORMS: PostPlatform[] = ['instagram', 'tiktok', 'youtube_shorts']

const SOCIAL_PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  youtube_shorts: 'YouTube Shorts',
  threads: 'Threads',
  x: 'X',
  facebook: 'Facebook',
}

// Tinggi iframe embed per platform (proporsi kontennya beda-beda)
const EMBED_HEIGHTS: Record<string, number> = {
  instagram: 560, tiktok: 620, youtube: 260, youtube_shorts: 260,
  facebook: 380, x: 420, threads: 480,
}

// URL konten → URL iframe embed per platform (null = tidak bisa diembed)
function embedUrlFor(platform: string, url: string): string | null {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')
    const path = u.pathname.replace(/\/+$/, '')
    if (platform === 'instagram') {
      const m = path.match(/\/(p|reel|tv)\/([\w-]+)/)
      return m ? `https://www.instagram.com/${m[1]}/${m[2]}/embed` : null
    }
    if (platform === 'tiktok') {
      const m = path.match(/\/(video|photo)\/(\d+)/)
      return m ? `https://www.tiktok.com/embed/v2/${m[2]}` : null
    }
    if (platform === 'youtube' || platform === 'youtube_shorts') {
      if (host === 'youtu.be') return `https://www.youtube.com/embed${path}`
      const v = u.searchParams.get('v')
      if (v) return `https://www.youtube.com/embed/${v}`
      const m = path.match(/\/(shorts|embed|live)\/([\w-]+)/)
      return m ? `https://www.youtube.com/embed/${m[2]}` : null
    }
    if (platform === 'facebook') {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`
    }
    if (platform === 'x') {
      const m = path.match(/\/status\/(\d+)/)
      return m ? `https://platform.twitter.com/embed/Tweet.html?id=${m[1]}&theme=light` : null
    }
    return null
  } catch {
    return null
  }
}

// ======================================================================
// Content Queue — task nyata dari Projects (kanban). Status "done" = task
// berada di kolom bernama "Done"; set/unset done lewat tasksApi.move —
// perubahan di kanban otomatis kebaca di sini (refetch).
// Channel per task belum dimodelkan backend → mock deterministik dari id.
// ======================================================================
type QueueTask = {
  id: string
  title: string
  description: string | null
  dueDate: string | null
  updatedAt: string | null
  projectId: string
  done: boolean
  doneColumnId: string
  prevColumnId: string | null
  channels: string[]
  channelLinks: Record<string, string>
  contentType: string | null
  contentFormat: string | null
}

function queueDueLabel(dueDate: string | null): string {
  if (!dueDate) return 'No due date'
  const d = Date.parse(dueDate)
  if (Number.isNaN(d)) return 'No due date'
  const diff = Math.ceil((d - Date.now()) / 86400000)
  if (diff < 0) return `Overdue ${-diff}d`
  if (diff === 0) return 'Due today'
  if (diff === 1) return 'Due tomorrow'
  return `Due in ${diff}d`
}

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
          title: post.title,
        }))
      : OVERVIEW_DATA.timelinePosts.slice(0, 2).map((post, idx) => ({
          ...post,
          id: `${platform}-fallback-${idx}`,
          platform,
          title: post.title,
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

// Palet mix per tipe konten — deterministik per tipe (urutan kanonik
// CONTENT_TYPE_LABELS), warna tipe gak keacak saat data berubah.
const MIX_PALETTE = [
  '#8F6CFC', // ungu primary
  '#FEE68B', // kuning secondary
  '#1C1917', // ink
  '#D9C9FF', // ungu muda
  '#6D51C9', // ungu tua
  '#F6C34C', // kuning emas
  '#FDF3C9', // krem kuning muda
  '#B49BE8', // ungu mid
  '#3F3B36', // ink muda
  '#E5E5E5', // neutral
]
const MIX_TYPE_ORDER = Object.keys(CONTENT_TYPE_LABELS)
const mixColorFor = (t: string) => {
  const i = MIX_TYPE_ORDER.indexOf(t)
  return i < 0 ? '#E5E5E5' : MIX_PALETTE[i % MIX_PALETTE.length]
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SocialContent() {
  const [activePlatform, setActivePlatform] = useState<SocialPlatform>('overview')
  const [selectedTask, setSelectedTask] = useState<QueueTask | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [timelineRange, setTimelineRange] = useState<TimelineRange>('week')
  const [heatMode, setHeatMode] = useState<'month' | 'year'>('month')
  const [heatMonth, setHeatMonth] = useState(() => new Date().getMonth() + 1)
  const [heatYear, setHeatYear] = useState(() => new Date().getFullYear())
  const [heatFilterOpen, setHeatFilterOpen] = useState(false)
  const [openDayKey, setOpenDayKey] = useState<string | null>(null)
  // Hasil resolve short link (vt.tiktok.com dll) per `${taskId}:${channel}`
  const [resolvedLinks, setResolvedLinks] = useState<Record<string, string>>({})
  const [queueTasks, setQueueTasks] = useState<QueueTask[]>([])
  const [queueLoading, setQueueLoading] = useState(true)
  const [tenantName, setTenantName] = useState('')
  // Kolom per project (untuk pindah balik task dari done)
  const columnsByProjectRef = useRef<Record<string, { id: string; name: string }[]>>({})

  const heatIsYear = heatMode === 'year'
  const [tenantSocial, setTenantSocial] = useState<Partial<Record<SocialPlatform, string | null>>>({})

  // Nama tenant + URL sosmed tenant (data nyata — modul ini menampung sosmed tenant)
  useEffect(() => {
    let alive = true
    tenantsApi
      .getCurrent()
      .then(
        (res: {
          tenant?: {
            name?: string
            instagramUrl?: string | null
            tiktokUrl?: string | null
            facebookUrl?: string | null
            youtubeUrl?: string | null
            xUrl?: string | null
            threadsUrl?: string | null
          }
        }) => {
          if (!alive) return
          const t = res?.tenant
          if (t?.name) setTenantName(t.name)
          setTenantSocial({
            instagram: t?.instagramUrl ?? null,
            tiktok: t?.tiktokUrl ?? null,
            facebook: t?.facebookUrl ?? null,
            youtube: t?.youtubeUrl ?? null,
            x: t?.xUrl ?? null,
            threads: t?.threadsUrl ?? null,
          })
        }
      )
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  // Tutup panel filter & popover hari saat klik di luar elemennya
  useEffect(() => {
    if (!heatFilterOpen) return
    const close = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest('[data-heat-filter]')) setHeatFilterOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [heatFilterOpen])

  useEffect(() => {
    if (!openDayKey) return
    const close = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest('[data-day-popover]') && !t.closest('[data-day-cell]')) setOpenDayKey(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [openDayKey])

  // Content Queue: task nyata dari Projects (nyambung kanban — done di-set dari sana)
  useEffect(() => {
    let alive = true
    ;(async () => {
      setQueueLoading(true)
      try {
        const res: any = await tasksApi.list()
        const tasks: any[] = res?.tasks ?? []
        const projectIds = [...new Set(tasks.map((t: any) => t.projectId).filter(Boolean))].slice(0, 5)
        const doneColByProject: Record<string, string> = {}
        await Promise.all(
          projectIds.map(async (pid: string) => {
            const res: any = await projectsApi.get(pid)
            const cols: { id: string; name: string }[] = res?.project?.columns ?? []
            columnsByProjectRef.current[pid] = cols
            const done = cols.find((c) => c.name.toLowerCase() === 'done')
            if (done) doneColByProject[pid] = done.id
          })
        )
        const mapped: QueueTask[] = tasks
          .filter((t: any) => t.projectId && doneColByProject[t.projectId] && t.taskType === 'social_media')
          .map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description ?? null,
            dueDate: t.dueDate ?? null,
            updatedAt: t.updatedAt ?? null,
            projectId: t.projectId,
            done: t.columnId === doneColByProject[t.projectId],
            doneColumnId: doneColByProject[t.projectId],
            prevColumnId: t.columnId === doneColByProject[t.projectId] ? null : t.columnId,
            channels: Array.isArray(t.channels) ? t.channels : [],
            channelLinks: t.channelLinks && typeof t.channelLinks === 'object' ? t.channelLinks : {},
            contentType: t.contentType ?? null,
            contentFormat: t.contentFormat ?? null,
          }))
        mapped.sort((a, b) => {
          if (a.done !== b.done) return a.done ? 1 : -1
          const da = a.dueDate ? Date.parse(a.dueDate) : Infinity
          const db = b.dueDate ? Date.parse(b.dueDate) : Infinity
          return da - db
        })
        if (alive) setQueueTasks(mapped)
      } catch {
        /* biarkan kosong — honest tanpa data demo */
      } finally {
        if (alive) setQueueLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  // Window queue: SEMUA task overdue (due ≤ hari ini) + 5 hari ke depan,
  // di-scope ke tab platform aktif (overview = semua) — konsisten heatmap/mix.
  // Task selesai baru (updatedAt ≤ 7 hari) tetap tampil (kanban gak simpan
  // completedAt — kira-kira pakai updatedAt). Checkbox di queue INDIKATOR
  // saja — done hanya bisa di-set dari kanban Projects.
  const queueWindowTasks = useMemo(() => {
    const now = new Date()
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 23, 59, 59, 999).getTime()
    const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).getTime()
    return queueTasks.filter((t) => {
      if (activePlatform !== 'overview' && !t.channels.includes(activePlatform)) return false
      const due = t.dueDate ? Date.parse(t.dueDate) : null
      const overdueOrSoon = due !== null && !Number.isNaN(due) && due <= end
      const recentlyDone = t.done && !!t.updatedAt && Date.parse(t.updatedAt) >= weekAgo
      return overdueOrSoon || recentlyDone
    })
  }, [queueTasks, activePlatform])

  // Heatmap: index task sosmed nyata per tanggal (YYYY-MM-DD) — ikut tab
  // platform aktif (overview = semua task). Sumber counts & logo sel heatmap.
  const heatTaskByDate = useMemo(() => {
    const map: Record<string, { tasks: QueueTask[]; platforms: string[] }> = {}
    const scoped =
      activePlatform === 'overview'
        ? queueTasks
        : queueTasks.filter((t) => t.channels.includes(activePlatform))
    for (const t of scoped) {
      if (!t.dueDate) continue
      const d = new Date(t.dueDate)
      if (Number.isNaN(d.getTime())) continue
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`
      const entry = (map[key] ??= { tasks: [], platforms: [] })
      entry.tasks.push(t)
      // Di tab channel spesifik: logo sel = platform itu saja
      const chs = activePlatform === 'overview' ? t.channels : [activePlatform]
      for (const ch of chs) {
        if (!entry.platforms.includes(ch)) entry.platforms.push(ch)
      }
    }
    return map
  }, [queueTasks, activePlatform])

  // Content Mix: akumulasi tipe konten task sosmed yang due BULAN INI
  // (basis dueDate, sama dengan heatmap/timeline) — ikut tab platform aktif.
  // Segmen hanya tipe yang ada datanya, persen dihitung atas task bertipe.
  const contentMix = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()
    const scoped =
      activePlatform === 'overview'
        ? queueTasks
        : queueTasks.filter((t) => t.channels.includes(activePlatform))
    let total = 0
    const counts: Record<string, number> = {}
    for (const t of scoped) {
      if (!t.dueDate) continue
      const d = new Date(t.dueDate)
      if (Number.isNaN(d.getTime()) || d.getFullYear() !== y || d.getMonth() !== m) continue
      total++
      if (t.contentType) counts[t.contentType] = (counts[t.contentType] ?? 0) + 1
    }
    const typedTotal = Object.values(counts).reduce((a, b) => a + b, 0)
    const segments = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => {
        const pct = typedTotal > 0 ? (count / typedTotal) * 100 : 0
        return {
          type,
          label: CONTENT_TYPE_LABELS[type] ?? type,
          count,
          percent: Math.round(pct),
          widthPct: pct,
          color: mixColorFor(type),
        }
      })
    return {
      total,
      segments,
      monthLabel: new Date(y, m, 1).toLocaleString('en-US', { month: 'long' }),
    }
  }, [queueTasks, activePlatform])

  // KPI "Uploaded This Month": task sosmed DONE bulan ini, scope tab platform
  // (overview = semua). updatedAt = proxy waktu selesai (kanban gak simpan
  // completedAt). Banding bulan lalu tampil hanya kalau bulan lalu ada data.
  const uploadedStats = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()
    const py = m === 0 ? y - 1 : y
    const pm = m === 0 ? 11 : m - 1
    const inMonth = (iso: string | null, yy: number, mm: number) => {
      if (!iso) return false
      const d = new Date(iso)
      return !Number.isNaN(d.getTime()) && d.getFullYear() === yy && d.getMonth() === mm
    }
    const scoped =
      activePlatform === 'overview'
        ? queueTasks
        : queueTasks.filter((t) => t.channels.includes(activePlatform))
    const doneTasks = scoped.filter((t) => t.done)
    const current = doneTasks.filter((t) => inMonth(t.updatedAt, y, m)).length
    const prev = doneTasks.filter((t) => inMonth(t.updatedAt, py, pm)).length
    const growth = prev > 0 ? Math.round(((current - prev) / prev) * 100) : null
    return { current, prev, growth }
  }, [queueTasks, activePlatform])

  const currentData = DASHBOARD_DATA[activePlatform]

  // Search task nyata (bukan mock posts)
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return queueTasks
    const q = searchQuery.toLowerCase()
    return queueTasks.filter((t) => t.title.toLowerCase().includes(q))
  }, [queueTasks, searchQuery])

  // Timeline REAL: milestone = task social_media (dueDate = tanggal konten).
  // This Week = overdue..+5 hari (sinkron Content Queue), This Month = bulan berjalan.
  // Track per sifat platform: IG/TikTok/Shorts = short-form, sisanya feed & long.
  // Status: task di kolom Done = published (dot isi), belum = scheduled (hollow).
  const timelineBounds = useMemo(() => {
    const now = new Date()
    const sod = (y: number, m: number, d: number) => new Date(y, m, d).getTime()
    const dayOf = (ts: number) => {
      const d = new Date(ts)
      return sod(d.getFullYear(), d.getMonth(), d.getDate())
    }
    if (timelineRange === 'month') {
      const start = sod(now.getFullYear(), now.getMonth(), 1)
      const last = sod(now.getFullYear(), now.getMonth() + 1, 0)
      const days = Math.round((last - start) / 86400000) + 1
      const posOf = (ts: number) => 4 + ((dayOf(ts) - start) / ((days - 1) * 86400000)) * 92
      return { start, end: last, days, posOf }
    }
    const start = sod(now.getFullYear(), now.getMonth(), now.getDate() - 1)
    const posOf = (ts: number) => 4 + ((dayOf(ts) - start) / (6 * 86400000)) * 92
    return { start, end: start + 6 * 86400000, days: 7, posOf }
  }, [timelineRange])

  const timelineTicks = useMemo<TimelineAxisTick[]>(() => {
    const { start, days } = timelineBounds
    const labelOf = (ts: number) => {
      const d = new Date(ts)
      return `${d.getDate()} ${HEAT_MONTHS_SHORT[d.getMonth()]}`
    }
    const idxs =
      timelineRange === 'month'
        ? Array.from({ length: days }, (_, i) => i).filter((i) => i % 3 === 0 || i === days - 1)
        : Array.from({ length: days }, (_, i) => i)
    return idxs.map((i) => ({
      label: labelOf(start + i * 86400000),
      positionPercent: 4 + (i / (days - 1)) * 92,
    }))
  }, [timelineRange, timelineBounds])

  const timelineMilestones = useMemo<TimelineMilestone[]>(() => {
    const { end, posOf } = timelineBounds
    return filteredTasks
      .filter((t) => t.channels.length > 0 && t.dueDate)
      .filter((t) => {
        // Batas atas saja — task OVERDUE tetap tampil, diclamp ke tepi kiri
        // sebelum garis Today (tanggal aslinya tetap ditampilkan di label)
        const due = Date.parse(t.dueDate!)
        return !Number.isNaN(due) && due <= end + 86399000
      })
      .map((t, i) => {
        const dueTs = Date.parse(t.dueDate!)
        const first = (t.channels[0] ?? 'instagram') as PostPlatform
        const d = new Date(dueTs)
        return {
          id: t.id,
          platform: first,
          platforms: t.channels,
          contentType: t.contentType ?? undefined,
          track: SHORT_FORM_PLATFORMS.includes(first) ? 'short_form' : 'long_and_feed',
          tier: i % 2 === 1 ? 'high' : 'normal',
          status: t.done ? 'published' : 'scheduled',
          positionPercent: Math.min(Math.max(posOf(dueTs), 4), 96),
          dateLabel: `${d.getDate()} ${HEAT_MONTHS_SHORT[d.getMonth()]}`,
          title: t.title,
        }
      })
  }, [filteredTasks, timelineBounds])

  // Milestone → task asli (id 1:1) untuk modal detail
  const handleSelectMilestone = (item: TimelineMilestone) => {
    const task = filteredTasks.find((t) => t.id === item.id)
    if (task) setSelectedTask(task)
  }

  const todayPos = Math.min(Math.max(timelineBounds.posOf(Date.now()), 4), 96)

  // Channel task yang di-scope ke tab aktif — tab channel spesifik = lihat
  // konten channel itu saja (overview = semua channel)
  const scopedTaskChannels = selectedTask
    ? activePlatform === 'overview'
      ? selectedTask.channels
      : selectedTask.channels.filter((c) => c === activePlatform)
    : []

  // Handle akun tenant di platform aktif: URL profil → username terakhir
  // (mis. https://instagram.com/toko.berkah → "toko.berkah"); kosong = belum diisi
  const urlToHandle = (url: string | null | undefined) => {
    if (!url) return ''
    const clean = url.split('?')[0].split('#')[0].replace(/\/+$/, '')
    return (clean.split('/').pop() ?? '').replace(/^@/, '')
  }
  const activeAccountHandle =
    activePlatform === 'overview'
      ? ''
      : urlToHandle(tenantSocial[activePlatform === 'youtube_shorts' ? 'youtube' : activePlatform])

  // Active Social Channels: jumlah sosmed company (tenants) yang URL-nya terisi
  const connectedChannels = Object.values(tenantSocial).filter(
    (v) => !!v && String(v).trim() !== ''
  ).length

  const todayLabel = `Today, ${new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })}`

  // Short link (vt.tiktok.com dll) yang gak bisa diparse → resolve via backend
  // supaya dapat URL final yang mengandung ID video untuk embed preview.
  useEffect(() => {
    if (!selectedTask) return
    let alive = true
    const run = async () => {
      for (const ch of selectedTask.channels) {
        const url = selectedTask.channelLinks[ch]
        if (!url || embedUrlFor(ch, url)) continue
        if (ch !== 'tiktok') continue // untuk sekarang hanya tiktok yang butuh resolve
        try {
          const res: any = await tasksApi.resolveLink(url)
          const finalUrl: string | undefined = res?.finalUrl
          if (alive && finalUrl && embedUrlFor('tiktok', finalUrl)) {
            setResolvedLinks((prev) => ({ ...prev, [`${selectedTask.id}:${ch}`]: finalUrl }))
          }
        } catch {
          /* biarkan — fallback jadi link-out */
        }
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [selectedTask])

  // Heatmap Upload Frequency — Monthly: kalender bulan nyata; Yearly: grid ala GitHub.
  const heatMonthGrid = useMemo(() => {
    if (heatIsYear)
      return {
        cells: [] as (null | { date: Date; count: number; day: number; today: boolean; tasks: QueueTask[]; platforms: string[] })[],
      }
    const first = new Date(heatYear, heatMonth - 1, 1)
    const daysInMonth = new Date(heatYear, heatMonth, 0).getDate()
    const lead = (first.getDay() + 6) % 7 // Mon=0..Sun=6
    const today = new Date()
    const isToday = (d: Date) =>
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    const cells: (null | { date: Date; count: number; day: number; today: boolean; tasks: QueueTask[]; platforms: string[] })[] = Array.from(
      { length: lead },
      () => null
    )
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(heatYear, heatMonth - 1, d)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
        date.getDate()
      ).padStart(2, '0')}`
      const entry = heatTaskByDate[key]
      const tasks = entry?.tasks ?? []
      cells.push({ date, count: tasks.length, day: d, today: isToday(date), tasks, platforms: entry?.platforms ?? [] })
    }
    while (cells.length % 7 !== 0) cells.push(null) // pad tail biar grid rapih
    return { cells }
  }, [heatIsYear, heatYear, heatMonth, heatTaskByDate])

  // Opsi tahun heatmap: dinamis ±10 tahun dari tahun berjalan (bukan hardcoded)
  const heatYearOptions = useMemo(() => {
    const thisYear = new Date().getFullYear()
    return Array.from({ length: 21 }, (_, i) => thisYear + 10 - i)
  }, [])

  // Grid tahunan: kolom = minggu, baris = Mon–Sun, sel = total upload hari itu
  const heatYearGrid = useMemo(() => {
    const start = new Date(heatYear, 0, 1)
    const end = new Date(heatYear, 11, 31)
    const monIdx = (d: Date) => (d.getDay() + 6) % 7 // Mon=0..Sun=6
    const weeks: (null | { date: Date; count: number })[][] = []
    let week: (null | { date: Date; count: number })[] = Array.from({ length: monIdx(start) }, () => null)
    const monthStarts: { label: string; weekIdx: number }[] = [{ label: 'Jan', weekIdx: 0 }]
    let lastMonth = 0
    for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getMonth() !== lastMonth) {
        lastMonth = d.getMonth()
        monthStarts.push({ label: HEAT_MONTHS_SHORT[lastMonth], weekIdx: weeks.length })
      }
      const dkey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`
      week.push({ date: new Date(d), count: (heatTaskByDate[dkey]?.tasks ?? []).length })
      if (week.length === 7) {
        weeks.push(week)
        week = []
      }
    }
    if (week.length > 0) weeks.push(week)
    return { weeks, monthStarts }
  }, [heatYear, heatTaskByDate])

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

          {/* Page header: nama tenant + logo platform aktif */}
          <div className="flex flex-wrap items-center gap-3">
            {activePlatform !== 'overview' && (
              <img
                src={`/icons/social/${activePlatform === 'youtube_shorts' ? 'youtube-shorts' : activePlatform}.png`}
                alt=""
                className="h-8 w-8 object-contain"
              />
            )}
            <h1 className="text-2xl font-semibold tracking-tight text-black">
              {tenantName || 'Social'}
            </h1>
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
                              onClick={() => {
                                const first = queueWindowTasks[0]
                                if (first) setSelectedTask(first)
                              }}
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
                        {idx !== 1 || uploadedStats.growth !== null ? (
                          <span className="px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 text-[11px] font-medium flex items-center gap-0.5">
                            {idx === 1 ? (
                              <>
                                {uploadedStats.growth !== null &&
                                  `${uploadedStats.growth >= 0 ? '+' : ''}${uploadedStats.growth}%`}
                                {uploadedStats.growth !== null &&
                                  (uploadedStats.growth >= 0 ? (
                                    <ArrowUpRight className="w-3 h-3" />
                                  ) : (
                                    <ArrowDownRight className="w-3 h-3" />
                                  ))}
                              </>
                            ) : (
                              <>
                                {kpi.growth} <ArrowUpRight className="w-3 h-3" />
                              </>
                            )}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-6 relative z-10">
                        <p className="text-xs text-neutral-500 mb-1">{kpi.title}</p>
                        <div className="flex items-end justify-between">
                          <span className="text-3xl font-semibold tracking-tight text-black">
                            {idx === 1 ? uploadedStats.current : kpi.value}
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

              {/* Upload Frequency heatmap — dinamis per bulan/tahun */}
              <div className="bg-white rounded-[28px] p-6 border border-neutral-100 shadow-2xs relative overflow-hidden">
                <div className="pointer-events-none absolute -top-10 left-1/4 w-44 h-20 rounded-full bg-neutral-100/70 blur-xl" />

                <div className="flex flex-wrap items-center justify-between gap-3 mb-5 relative z-20">
                  <div>
                    <h2 className="text-lg font-semibold text-black">Upload Frequency</h2>
                    <p className="text-xs text-neutral-400">
                      {heatIsYear
                        ? 'Publishing intensity per day of the year'
                        : 'Publishing intensity per day of the month'}
                    </p>
                  </div>
                  <div className="relative" data-heat-filter>
                    <button
                      type="button"
                      onClick={() => setHeatFilterOpen((v) => !v)}
                      aria-label="Filter heatmap"
                      className={`h-8 w-8 rounded-full border flex items-center justify-center cursor-pointer transition ${
                        heatFilterOpen
                          ? 'bg-[#8F6CFC] border-[#8F6CFC] text-white'
                          : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </button>

                    {/* Panel filter: mode + bulan/tahun */}
                    {heatFilterOpen && (
                      <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-2xl border border-neutral-200 shadow-xl p-3 z-30 space-y-2.5">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">Mode</p>
                          <div className="flex gap-1 bg-neutral-100/90 p-1 rounded-full">
                            {(['month', 'year'] as const).map((m) => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => setHeatMode(m)}
                                className={`flex-1 px-3 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
                                  heatMode === m
                                    ? 'bg-white text-[#8F6CFC] font-semibold shadow-2xs'
                                    : 'text-neutral-500 hover:text-neutral-900'
                                }`}
                              >
                                {m === 'month' ? 'Monthly' : 'Yearly'}
                              </button>
                            ))}
                          </div>
                        </div>
                        {heatMode === 'month' && (
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">Month</p>
                            <select
                              value={heatMonth}
                              onChange={(e) => setHeatMonth(Number(e.target.value))}
                              aria-label="Heatmap month"
                              className="w-full appearance-none bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-700 cursor-pointer focus:outline-none"
                            >
                              {HEAT_MONTHS.map((label, i) => (
                                <option key={label} value={i + 1}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">Year</p>
                          <select
                            value={heatYear}
                            onChange={(e) => setHeatYear(Number(e.target.value))}
                            aria-label="Heatmap year"
                            className="w-full appearance-none bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-700 cursor-pointer focus:outline-none"
                          >
                            {heatYearOptions.map((y) => (
                              <option key={y} value={y}>
                                {y}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative z-10">
                  {heatIsYear ? (
                    /* Yearly — grid ala GitHub contribution graph */
                    <div className="overflow-x-auto pb-1">
                      <div
                        style={{
                          minWidth: 40 + heatYearGrid.weeks.length * (HEAT_CELL + HEAT_GAP),
                        }}
                      >
                        {/* Label bulan di atas kolom minggu */}
                        <div className="flex mb-1.5" style={{ marginLeft: 38 }}>
                          {heatYearGrid.monthStarts.map((m, i) => {
                            const nextStart =
                              heatYearGrid.monthStarts[i + 1]?.weekIdx ?? heatYearGrid.weeks.length
                            return (
                              <div
                                key={`${m.label}-${i}`}
                                className="text-[10px] font-medium text-neutral-400 overflow-hidden whitespace-nowrap"
                                style={{
                                  width: (nextStart - m.weekIdx) * (HEAT_CELL + HEAT_GAP) - HEAT_GAP,
                                }}
                              >
                                {m.label}
                              </div>
                            )
                          })}
                        </div>

                        <div className="flex">
                          {/* Label hari */}
                          <div
                            className="flex flex-col justify-between shrink-0 mr-1.5"
                            style={{ height: 7 * HEAT_CELL + 6 * HEAT_GAP }}
                          >
                            {HEAT_DAYS.map((d) => (
                              <span
                                key={d}
                                className="flex items-center text-[9px] leading-none text-neutral-400"
                                style={{ height: HEAT_CELL }}
                              >
                                {d}
                              </span>
                            ))}
                          </div>

                          {/* Sel harian */}
                          <div className="flex">
                            {heatYearGrid.weeks.map((week, wi) => (
                              <div
                                key={wi}
                                className="flex flex-col"
                                style={{ gap: HEAT_GAP, marginRight: HEAT_GAP }}
                              >
                                {week.map((cell, ci) =>
                                  cell ? (
                                    <div
                                      key={cell.date.toISOString()}
                                      className="rounded-[2.5px] cursor-pointer hover:outline hover:outline-1 hover:outline-neutral-400"
                                      style={{
                                        width: HEAT_CELL,
                                        height: HEAT_CELL,
                                        background: HEAT_LEVEL_COLORS[heatLevelOf(cell.count)],
                                      }}
                                      title={`${HEAT_MONTHS_SHORT[cell.date.getMonth()]} ${cell.date.getDate()} — ${
                                        cell.count === 0 ? 'No tasks' : `${cell.count} task${cell.count > 1 ? 's' : ''}`
                                      }`}
                                    />
                                  ) : (
                                    <div
                                      key={`pad-${wi}-${ci}`}
                                      style={{ width: HEAT_CELL, height: HEAT_CELL }}
                                    />
                                  )
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] font-medium text-neutral-400">
                          Less
                          {HEAT_LEVEL_COLORS.map((c) => (
                            <span
                              key={c}
                              className="inline-block rounded-[2px]"
                              style={{ width: 10, height: 10, background: c }}
                            />
                          ))}
                          More
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Monthly — kalender bulan nyata: kolom Sen–Min, sel = tanggal */
                    <div>
                      {/* Header hari */}
                      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                        {HEAT_DAYS.map((d) => (
                          <span
                            key={d}
                            className="text-center text-[10px] font-medium text-neutral-400"
                          >
                            {d}
                          </span>
                        ))}
                      </div>

                      {/* Kalender */}
                      <div className="grid grid-cols-7 gap-1.5">
                        {heatMonthGrid.cells.map((cell, i) => {
                          if (!cell) {
                            return (
                              <div
                                key={`pad-${i}`}
                                className="rounded-lg h-11 border border-dashed border-neutral-200/70"
                              />
                            )
                          }
                          const level = heatLevelOf(cell.count)
                          const key = cell.date.toISOString()
                          const open = openDayKey === key
                          const row = Math.floor(i / 7)
                          const col = i % 7
                          const uniquePlatforms = cell.platforms
                          const shown = uniquePlatforms.slice(0, 2)
                          const extra = uniquePlatforms.length - shown.length
                          return (
                            <div key={key} className="relative">
                              <div
                                data-day-cell
                                onClick={() => setOpenDayKey(open ? null : key)}
                                className={`rounded-lg p-1.5 h-11 relative select-none ${
                                  cell.count > 0
                                    ? 'cursor-pointer hover:outline hover:outline-1 hover:outline-neutral-300'
                                    : ''
                                } ${cell.today ? 'outline outline-2 outline-[#8F6CFC]' : ''}`}
                                style={{ background: HEAT_LEVEL_COLORS[level] }}
                                title={`${HEAT_MONTHS_SHORT[heatMonth - 1]} ${cell.day} — ${
                                  cell.count === 0 ? 'No tasks' : `${cell.count} task${cell.count > 1 ? 's' : ''}`
                                }`}
                              >
                                <span
                                  className="text-[10px] font-semibold"
                                  style={{ color: level >= 3 ? '#ffffff' : '#1c1d22' }}
                                >
                                  {cell.day}
                                </span>
                                {shown.length > 0 && (
                                  <div className="absolute bottom-1 right-1 flex items-center gap-0.5">
                                    {shown.map((p) => (
                                      <img
                                        key={p}
                                        src={`/icons/social/${p === 'youtube_shorts' ? 'youtube-shorts' : p}.png`}
                                        alt=""
                                        className="h-3.5 w-3.5 object-contain"
                                      />
                                    ))}
                                    {extra > 0 && (
                                      <span
                                        className="text-[8px] font-bold"
                                        style={{ color: level >= 3 ? '#ffffff' : '#1c1d22' }}
                                      >
                                        +{extra}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Popover daftar agenda hari itu */}
                              {open && cell.tasks.length > 0 && (
                                <div
                                  data-day-popover
                                  onClick={(e) => e.stopPropagation()}
                                  className={`absolute z-30 w-56 bg-white rounded-xl border border-neutral-200 shadow-xl p-2 ${
                                    row >= 3 ? 'bottom-full mb-1' : 'top-full mt-1'
                                  } ${col >= 5 ? 'right-0' : 'left-0'}`}
                                >
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 px-2 pb-1">
                                    {HEAT_MONTHS_SHORT[heatMonth - 1]} {cell.day}
                                  </p>
                                  {cell.tasks.map((t) => (
                                    <div
                                      key={t.id}
                                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-neutral-50"
                                    >
                                      <span className="flex items-center shrink-0 -space-x-1">
                                        {(activePlatform === 'overview'
                                          ? t.channels
                                          : [activePlatform]
                                        )
                                          .slice(0, 3)
                                          .map((ch) => (
                                          <img
                                            key={ch}
                                            src={`/icons/social/${ch === 'youtube_shorts' ? 'youtube-shorts' : ch}.png`}
                                            alt=""
                                            className="h-3.5 w-3.5 object-contain ring-2 ring-white rounded-full"
                                          />
                                        ))}
                                      </span>
                                      <span className="text-[11px] font-medium text-neutral-800 truncate">
                                        {t.title}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Rail kanan: Content Mix + Queue & Active Channels */}
            <div className="col-span-4 flex flex-col gap-5">
              <div className="bg-white rounded-[28px] p-6 border border-neutral-100 shadow-2xs relative overflow-hidden flex flex-col">
                <div className="pointer-events-none absolute -top-10 left-1/3 w-36 h-20 rounded-full bg-neutral-100/80 blur-lg" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-semibold text-black">Content Mix</h2>
                    <span
                      className="text-2xl font-bold tracking-tight text-black"
                      title="Social media tasks due this month"
                    >
                      {contentMix.total}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 mb-4">
                    Social media tasks due in {contentMix.monthLabel}
                  </p>

                  {queueLoading ? (
                    <p className="text-xs text-neutral-400 mb-6">Loading tasks…</p>
                  ) : contentMix.segments.length === 0 ? (
                    <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                      No content types recorded for this month yet.
                    </p>
                  ) : (
                    <>
                      <div className="flex gap-1.5 mb-4">
                        {contentMix.segments.map((seg) => (
                          <div key={seg.type} style={{ width: `${seg.widthPct}%` }}>
                            <div className="text-xs font-semibold text-black mb-1.5">
                              {seg.percent}%
                            </div>
                            <div
                              className="h-11 rounded-xl transition-all duration-300"
                              style={{ backgroundColor: seg.color }}
                              title={`${seg.label}: ${seg.count} task${seg.count > 1 ? 's' : ''} · ${seg.percent}%`}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="space-y-1.5 mb-6">
                        {contentMix.segments.map((seg) => (
                          <div key={seg.type} className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-2.5 h-2.5 rounded-[4px] shrink-0"
                              style={{ backgroundColor: seg.color }}
                            />
                            <span className="text-[11px] text-neutral-700 truncate">
                              {seg.label}
                            </span>
                            <span className="ml-auto text-[11px] text-neutral-400 shrink-0">
                              {seg.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Content Queue gelap — task sosial media window 7 hari (kemarin s/d 5 hari ke depan) */}
                <div className="bg-[#1C1917] text-white rounded-[24px] p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-medium">Content Queue</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#8F6CFC] text-white text-xs font-semibold">
                      {queueWindowTasks.filter((t) => !t.done).length}
                    </span>
                  </div>

                  <div className="space-y-3.5 overflow-y-auto pr-1" style={{ maxHeight: 188 }}>
                    {queueLoading ? (
                      <p className="text-xs text-neutral-400">Loading tasks…</p>
                    ) : queueWindowTasks.length === 0 ? (
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        No social media tasks overdue or due in the next 5 days.
                      </p>
                    ) : (
                      queueWindowTasks.map((task) => {
                        const isDone = task.done
                        // Tab spesifik = fokus: logo & hint link hanya channel itu
                        const channels =
                          activePlatform === 'overview'
                            ? task.channels
                            : task.channels.filter((ch) => ch === activePlatform)
                        const shownCh = channels.slice(0, 2)
                        const extraCh = channels.length - shownCh.length
                        // Kelengkapan link: task belum-done dengan channel
                        // yang link-nya kosong belum bisa masuk Done (gate backend)
                        const missingCh = channels.filter((ch) => !(task.channelLinks[ch] ?? '').trim())
                        return (
                          <div
                            key={task.id}
                            className="flex items-center justify-between gap-3 select-none"
                          >
                            <div className="min-w-0">
                              <p
                                className={`text-xs font-medium truncate ${
                                  isDone ? 'text-white' : 'text-neutral-200'
                                }`}
                              >
                                {task.title}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <p className="text-[11px] text-neutral-400 shrink-0">
                                  {queueDueLabel(task.dueDate)}
                                </p>
                                {shownCh.length > 0 && (
                                  <div className="flex items-center gap-0.5">
                                    {shownCh.map((p) => (
                                      <img
                                        key={p}
                                        src={`/icons/social/${p === 'youtube_shorts' ? 'youtube-shorts' : p}.png`}
                                        alt=""
                                        className="h-3 w-3 object-contain"
                                      />
                                    ))}
                                    {extraCh > 0 && (
                                      <span className="text-[9px] font-bold text-neutral-400">
                                        +{extraCh}
                                      </span>
                                    )}
                                  </div>
                                )}
                                {!isDone && channels.length === 0 && (
                                  <span className="text-[10px] text-amber-400/90">belum ada channel</span>
                                )}
                                {!isDone && channels.length > 0 && missingCh.length > 0 && (
                                  <span className="text-[10px] text-amber-400/90">
                                    link belum lengkap ({missingCh.length})
                                  </span>
                                )}
                              </div>
                            </div>
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center border transition shrink-0 ${
                                isDone
                                  ? 'bg-[#8F6CFC] border-[#8F6CFC] text-white'
                                  : 'border-neutral-600 bg-neutral-800'
                              }`}
                            >
                              {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                            </span>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Active Social Channels — hitungan nyata: sosmed yang terisi di company */}
              <div className="bg-white rounded-[28px] p-6 border border-neutral-100 shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-700 mb-2">
                    Active Social Channels
                  </p>
                  <p className="text-3xl font-bold tracking-tight text-black">
                    {connectedChannels}{' '}
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
                todayPositionPercent={todayPos}
                syncPlatform={activePlatform}
                accountHandle={activeAccountHandle}
                range={timelineRange}
                onRangeChange={setTimelineRange}
                highlightZone={null}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal detail task — di dalam window, bukan seluruh desktop */}
      {selectedTask && (
        <div
          onClick={() => setSelectedTask(null)}
          className="absolute inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-30"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[28px] p-6 max-w-md w-full max-h-[92%] overflow-y-auto shadow-xl border border-neutral-100 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {scopedTaskChannels.map((ch) => (
                  <img
                    key={ch}
                    src={`/icons/social/${ch === 'youtube_shorts' ? 'youtube-shorts' : ch}.png`}
                    alt={ch}
                    className="h-5 w-5 object-contain"
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="w-7 h-7 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-black">{selectedTask.title}</h3>
              <p className="text-xs text-neutral-500 flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>
                  {selectedTask.dueDate
                    ? `Due ${new Date(selectedTask.dueDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}`
                    : 'No due date'}
                </span>
              </p>
            </div>

            {selectedTask.description && (
              <p className="text-xs text-neutral-600 bg-[#F4F4F3] p-3.5 rounded-2xl leading-relaxed">
                {selectedTask.description}
              </p>
            )}

            {/* Preview embed dari link konten per channel */}
            {scopedTaskChannels.some((ch) => selectedTask.channelLinks[ch]) && (
              <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 -mx-1 px-1">
                {scopedTaskChannels.map((ch) => {
                  const url = selectedTask.channelLinks[ch]
                  if (!url) return null
                  const resolved =
                    resolvedLinks[`${selectedTask.id}:${ch}`] ?? undefined
                  const embed = embedUrlFor(ch, resolved ?? url)
                  const p = { label: SOCIAL_PLATFORM_LABELS[ch] ?? ch }
                  return (
                    <div
                      key={ch}
                      className="w-full shrink-0 snap-center rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-50"
                    >
                      <div className="flex items-center gap-1.5 px-3 py-1.5">
                        <img
                          src={`/icons/social/${ch === 'youtube_shorts' ? 'youtube-shorts' : ch}.png`}
                          alt=""
                          className="h-4 w-4 object-contain"
                        />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                          {p.label ?? ch}
                        </span>
                      </div>
                      {embed ? (
                        <iframe
                          src={embed}
                          title={`Preview ${p.label ?? ch}`}
                          loading="lazy"
                          frameBorder="0"
                          allowFullScreen
                          className="w-full bg-white"
                          style={{ height: EMBED_HEIGHTS[ch] ?? 400 }}
                        />
                      ) : (
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="block px-3 pb-2 text-[11px] font-medium text-[#8F6CFC] break-all hover:underline"
                        >
                          Buka di {p.label ?? ch} ↗
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <div className="bg-neutral-50 rounded-2xl p-3.5 space-y-1.5 text-xs border border-neutral-100">
              <div className="flex justify-between">
                <span className="text-neutral-500">Status</span>
                <span
                  className={`font-semibold ${
                    selectedTask.done ? 'text-[#8F6CFC]' : 'text-amber-500'
                  }`}
                >
                  {selectedTask.done ? 'Published' : 'Scheduled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Tipe Konten</span>
                <span className="font-medium text-black">
                  {selectedTask.contentType
                    ? (CONTENT_TYPE_LABELS[selectedTask.contentType] ?? selectedTask.contentType)
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Format Konten</span>
                <span className="font-medium text-black">
                  {selectedTask.contentFormat
                    ? (CONTENT_FORMAT_LABELS[selectedTask.contentFormat] ?? selectedTask.contentFormat)
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Channel</span>
                <span className="font-medium text-black">
                  {scopedTaskChannels.length > 0
                    ? scopedTaskChannels
                        .map((ch) => (ch === 'youtube_shorts' ? 'Shorts' : ch.charAt(0).toUpperCase() + ch.slice(1)))
                        .join(', ')
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
