import type {
  ActivityNote,
  LeadItem,
  LeadScoreInsight,
  SocialHandles,
  TaskItem,
  WarrantyInfo,
} from './types'

// ============ SHAPE API (backend /api/clients) ============

export interface ApiClient {
  id: string
  tenantId: string
  // Hanya terisi saat hub-admin pakai ?scope=all (JOIN tenants di backend).
  tenantName?: string | null
  name: string
  type: 'corporate' | 'individual'
  industry: string | null
  website: string | null
  logoUrl: string | null
  picName: string | null
  picEmail: string | null
  picPhone: string | null
  picPosition: string | null
  status: 'lead' | 'prospect' | 'active' | 'churned' | 'inactive'
  source: string | null
  assignedTo: string | null
  taxId: string | null
  address: string | null
  billingEmail: string | null
  mobile: string | null
  topic: string | null
  rating: string | null
  budget: string | null
  identityType: string | null
  identityNumber: string | null
  tags: string[] | null
  socialMedia: SocialHandles | null
  createdAt: string
  updatedAt: string
}

export interface ApiClientActivity {
  id: string
  type: string
  content: string
  createdAt: string
  authorId: string | null
  authorName: string | null
  authorAvatar: string | null
}

export interface ApiClientTask {
  id: string
  title: string
  description: string | null
  dueDate: string | null
  type: string
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}

export interface ApiClientWarranty {
  id: string
  productName: string
  serialNumber: string | null
  startDate: string | null
  endDate: string | null
  coverageType: string | null
  status: string
}

export interface ApiClientInsight {
  id: string
  clientId: string
  tenantId: string
  text: string
  subtext: string | null
  sortOrder: number
  createdAt: string
}

// ============ HELPERS ============

const STATUS_LABEL: Record<string, string> = {
  lead: 'Lead',
  prospect: 'Prospect',
  active: 'Active',
  churned: 'Churned',
  inactive: 'Inactive',
}

const STATUS_TO_STAGE: Record<string, number> = {
  lead: 0,
  prospect: 1,
  active: 2,
  inactive: 0,
  churned: 3,
}

export const STAGE_TO_STATUS: Record<number, ApiClient['status']> = {
  0: 'lead',
  1: 'prospect',
  2: 'active',
  3: 'churned',
}

export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

/** Backend validasi website dengan z.string().url() — 'domain.com' saja ditolak. */
export function normalizeWebsite(value: string): string | null {
  const raw = value.trim()
  if (!raw) return null
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
  try {
    new URL(withScheme)
    return withScheme
  } catch {
    return null
  }
}

export function toDateInputValue(value: string | null | undefined): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatDate(value: string | null | undefined): string {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return dateFormatter.format(d)
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return iso
  const diff = Date.now() - then
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Kemarin'
  if (days <= 7) return `${days} hari lalu`
  return formatDate(iso)
}

function initialsAvatar(name: string): string {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#0d9488"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-size="38" fill="#ffffff">${initials || '?'}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

// ============ LEAD SCORING (dipakai ring score & modal "Quality") ============

export interface ScoreFactor {
  label: string
  earned: number
  weight: number
  hint: string
}

export interface ScoreBreakdown {
  score: number
  grade: string
  factors: ScoreFactor[]
  bonus: ScoreFactor[]
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/** Skor 5-99 dari kelengkapan data + rating + status pipeline. */
export function scoreBreakdown(lead: LeadItem): ScoreBreakdown {
  const factors: ScoreFactor[] = [
    {
      label: 'Email kontak',
      earned: lead.email ? 10 : 0,
      weight: 10,
      hint: 'Isi email PIC di modal Edit',
    },
    {
      label: 'Telepon',
      earned: lead.phone ? 10 : 0,
      weight: 10,
      hint: 'Isi nomor telepon perusahaan',
    },
    {
      label: 'Alamat lengkap',
      earned: lead.address ? 10 : 0,
      weight: 10,
      hint: 'Lengkapi alamat customer',
    },
    {
      label: 'Nama perusahaan',
      earned: lead.company ? 10 : 0,
      weight: 10,
      hint: 'Isi nama perusahaan di modal Edit',
    },
    {
      label: 'Identitas (KTP/SIM)',
      earned: lead.identityNumber ? 10 : 0,
      weight: 10,
      hint: 'Lengkapi data identitas PIC',
    },
    {
      label: 'Estimasi budget',
      earned: lead.budget ? 10 : 0,
      weight: 10,
      hint: 'Catat estimasi budget customer',
    },
    {
      label: 'Jabatan PIC',
      earned: lead.jobTitle ? 5 : 0,
      weight: 5,
      hint: 'Isi jabatan contact person',
    },
    {
      label: 'Website',
      earned: lead.website ? 5 : 0,
      weight: 5,
      hint: 'Tambahkan website perusahaan',
    },
    {
      label: 'Mobile',
      earned: lead.mobile ? 5 : 0,
      weight: 5,
      hint: 'Tambahkan nomor mobile PIC',
    },
    {
      label: 'Topik / minat',
      earned: lead.topic && lead.topic !== 'General Inquiry' ? 5 : 0,
      weight: 5,
      hint: 'Catat topik atau produk yang diminati',
    },
  ]

  const completeness = factors.reduce((sum, f) => sum + f.earned, 0)

  const bonus: ScoreFactor[] = []
  const rating = lead.rating
  if (rating === 'Hot') bonus.push({ label: 'Rating Hot', earned: 12, weight: 12, hint: '' })
  else if (rating === 'Warm') bonus.push({ label: 'Rating Warm', earned: 6, weight: 6, hint: '' })

  const statusTag = lead.statusTag
  if (statusTag === 'Active') bonus.push({ label: 'Status Active', earned: 8, weight: 8, hint: '' })
  else if (statusTag === 'Prospect') bonus.push({ label: 'Status Prospect', earned: 5, weight: 5, hint: '' })
  else if (statusTag === 'Churned') bonus.push({ label: 'Status Churned', earned: -5, weight: 0, hint: '' })
  else if (statusTag === 'Inactive') bonus.push({ label: 'Status Inactive', earned: -3, weight: 0, hint: '' })

  if ((lead.activities?.length ?? 0) >= 1) {
    bonus.push({ label: 'Sudah ada interaksi', earned: 5, weight: 5, hint: '' })
  }
  if ((lead.activities?.length ?? 0) >= 3) {
    bonus.push({ label: 'Interaksi berulang', earned: 5, weight: 5, hint: '' })
  }

  const bonusSum = bonus.reduce((sum, b) => sum + b.earned, 0)
  const score = clamp(completeness + bonusSum, 5, 99)
  const grade = score >= 85 ? 'Grade A' : score >= 70 ? 'Grade B' : score >= 50 ? 'Grade C' : 'Grade D'

  return { score, grade, factors, bonus }
}

const SCORE_BANDS = [
  { min: 80, color: 'bg-[#BCE893] text-slate-900' },
  { min: 60, color: 'bg-[#FDE68A] text-slate-900' },
  { min: 0, color: 'bg-[#FECACA] text-slate-900' },
]

function scoreColor(score: number): string {
  return SCORE_BANDS.find((band) => score >= band.min)!.color
}

function buildInsights(client: ApiClient): LeadScoreInsight[] {
  const insights: LeadScoreInsight[] = []
  if (client.rating === 'Hot') {
    insights.push({ id: `ins-hot`, text: 'Rating Hot', subtext: 'Prioritas follow-up' })
  }
  if (client.budget) {
    insights.push({ id: `ins-budget`, text: 'Estimated budget', subtext: `~ ${client.budget}` })
  }
  if (client.status === 'active') {
    insights.push({ id: `ins-active`, text: 'Customer active', subtext: 'Sudah bertransaksi' })
  }
  if (client.status === 'churned') {
    insights.push({ id: `ins-churn`, text: 'Churn risk', subtext: 'Butuh penanganan khusus' })
  }
  if (insights.length === 0) {
    insights.push({ id: 'ins-default', text: 'Qualification in progress' })
  }
  return insights
}

// ============ CLIENT -> LEADITEM ============

export function mapClientToLead(client: ApiClient): LeadItem {
  const name = client.picName || client.name
  const status = client.status || 'lead'
  const created = new Date(client.createdAt)
  const withinWeek = !Number.isNaN(created.getTime()) && Date.now() - created.getTime() < 7 * 86400000

  const lead: LeadItem = {
    id: client.id,
    name,
    avatar: client.logoUrl || initialsAvatar(name),
    tenantId: client.tenantId,
    tenantName: client.tenantName ?? undefined,
    subtitle: client.industry || (client.type === 'individual' ? 'Individual' : 'Corporate'),
    type: STATUS_LABEL[status] ?? 'Lead',
    timestamp: relativeTime(client.createdAt),
    score: 0,
    grade: '',
    status: client.rating === 'Hot' ? 'Growing' : client.rating === 'Cold' ? 'At Risk' : 'Steady',
    statusDirection: client.rating === 'Hot' ? 'up' : client.rating === 'Cold' ? 'down' : 'steady',
    scoreColor: '',
    icon: client.picPhone ? 'phone' : 'mail',
    timeGroup: withinWeek ? 'Today' : '3 weeks ago',
    activeStageIndex: STATUS_TO_STAGE[status] ?? 0,
    activeDays: `Aktif sejak ${formatDate(client.createdAt)}`,
    topic: client.topic || 'General Inquiry',
    jobTitle: client.picPosition || 'Purchasing Manager',
    phone: client.picPhone || '',
    mobile: client.mobile || '',
    email: client.picEmail || '',
    identityType: (client.identityType as LeadItem['identityType']) || undefined,
    identityNumber: client.identityNumber || undefined,
    address: client.address || '',
    company: client.name,
    website: client.website || '',
    leadSource: client.source || 'Website',
    rating: client.rating || 'Warm',
    budget: client.budget || undefined,
    statusTag: STATUS_LABEL[status] ?? status,
    owner: '',
    ownerAvatar: '',
    insights: buildInsights(client),
    tags: client.tags && client.tags.length > 0 ? client.tags : ['Lead', 'Sales Insight'],
    socialMedia: client.socialMedia ?? undefined,
    industry: client.industry || undefined,
    taxId: client.taxId || undefined,
    billingEmail: client.billingEmail || undefined,
    assignedTo: client.assignedTo || undefined,
    tasks: [],
    activities: [],
    warranty: undefined,
  }

  // Skor dihitung dari kelengkapan data; bonus interaksi masuk setelah
  // activities/tasks dimuat (recompute di loadDetails).
  const { score, grade } = scoreBreakdown(lead)
  return { ...lead, score, grade, scoreColor: scoreColor(score) }
}

// ============ FORM/LEADITEM -> PAYLOAD API ============

interface LeadPatch {
  name?: string
  jobTitle?: string
  email?: string
  phone?: string
  mobile?: string
  identityType?: string
  identityNumber?: string
  address?: string
  company?: string
  website?: string
  topic?: string
  leadSource?: string
  rating?: string
  budget?: string
  industry?: string
  taxId?: string
  billingEmail?: string
  assignedTo?: string
  tags?: string[]
  socialMedia?: SocialHandles
}

/** Ubah partial LeadItem (dari modal / card edit) jadi payload PATCH /api/clients. */
export function buildClientPatch(patch: LeadPatch): Record<string, unknown> {
  const payload: Record<string, unknown> = {}
  const put = (key: string, value: unknown) => {
    if (value !== undefined && value !== null && value !== '') payload[key] = value
  }

  const company = patch.company?.trim() || ''
  const personName = patch.name?.trim() || ''

  if (company || personName) {
    payload.name = company || personName
    payload.type = company ? 'corporate' : 'individual'
  }
  put('picName', personName)
  put('picPosition', patch.jobTitle)
  if (patch.email && isValidEmail(patch.email)) payload.picEmail = patch.email
  put('picPhone', patch.phone)
  put('mobile', patch.mobile)
  put('topic', patch.topic)
  put('rating', patch.rating)
  put('budget', patch.budget)
  put('industry', patch.industry)
  put('taxId', patch.taxId)
  if (patch.billingEmail && isValidEmail(patch.billingEmail)) payload.billingEmail = patch.billingEmail
  if (patch.assignedTo) payload.assignedTo = patch.assignedTo
  put('identityType', patch.identityType)
  put('identityNumber', patch.identityNumber)
  put('address', patch.address)
  put('source', patch.leadSource)
  if (patch.website) {
    const url = normalizeWebsite(patch.website)
    if (url) payload.website = url
  }
  if (patch.tags) payload.tags = patch.tags.filter(Boolean)
  if (patch.socialMedia !== undefined) {
    const socials = Object.fromEntries(
      Object.entries(patch.socialMedia).filter(([, v]) => typeof v === 'string' && v.trim())
    )
    payload.socialMedia = socials
  }

  return payload
}

/** Gabungkan patch ke data existing sebelum kirim (PATCH mengirim field terubah saja). */
export function mergeLeadPatch(lead: LeadItem, patch: LeadPatch): Record<string, unknown> {
  return buildClientPatch({
    name: patch.name !== undefined ? patch.name : lead.name,
    jobTitle: patch.jobTitle !== undefined ? patch.jobTitle : lead.jobTitle,
    email: patch.email !== undefined ? patch.email : lead.email,
    phone: patch.phone !== undefined ? patch.phone : lead.phone,
    mobile: patch.mobile !== undefined ? patch.mobile : lead.mobile,
    identityType: patch.identityType !== undefined ? patch.identityType : lead.identityType,
    identityNumber: patch.identityNumber !== undefined ? patch.identityNumber : lead.identityNumber,
    address: patch.address !== undefined ? patch.address : lead.address,
    company: patch.company !== undefined ? patch.company : lead.company,
    website: patch.website !== undefined ? patch.website : lead.website,
    topic: patch.topic !== undefined ? patch.topic : lead.topic,
    leadSource: patch.leadSource !== undefined ? patch.leadSource : lead.leadSource,
    rating: patch.rating !== undefined ? patch.rating : lead.rating,
    budget: patch.budget !== undefined ? patch.budget : lead.budget,
    industry: patch.industry !== undefined ? patch.industry : lead.industry,
    taxId: patch.taxId !== undefined ? patch.taxId : lead.taxId,
    billingEmail: patch.billingEmail !== undefined ? patch.billingEmail : lead.billingEmail,
    assignedTo: patch.assignedTo !== undefined ? patch.assignedTo : lead.assignedTo,
    tags: patch.tags !== undefined ? patch.tags : lead.tags,
    socialMedia: patch.socialMedia !== undefined ? patch.socialMedia : lead.socialMedia,
  })
}

// ============ SUB-RESOURCE MAPPERS ============

export function mapActivity(activity: ApiClientActivity): ActivityNote {
  return {
    id: activity.id,
    type: (['note', 'call', 'email', 'meeting'] as const).includes(activity.type as never)
      ? (activity.type as ActivityNote['type'])
      : 'note',
    author: activity.authorName || 'User',
    authorAvatar: activity.authorAvatar || initialsAvatar(activity.authorName || 'User'),
    content: activity.content,
    timestamp: relativeTime(activity.createdAt),
  }
}

export function mapTask(task: ApiClientTask, index: number): TaskItem {
  return {
    id: task.id,
    title: task.title,
    step: `Step ${index + 1}`,
    dueDate: task.dueDate || 'Due soon',
    description: task.description || 'No description provided.',
    isCompleted: task.isCompleted,
    type: (['call', 'email', 'meeting', 'task'] as const).includes(task.type as never)
      ? (task.type as TaskItem['type'])
      : 'task',
  }
}

export function mapInsight(insight: ApiClientInsight): LeadScoreInsight {
  return {
    id: insight.id,
    text: insight.text,
    subtext: insight.subtext || undefined,
  }
}

export function mapWarranty(warranty: ApiClientWarranty): WarrantyInfo {
  const valid = warranty.status === 'Active' || warranty.status === 'Expiring Soon' || warranty.status === 'Expired'
  return {
    productName: warranty.productName,
    serialNumber: warranty.serialNumber || '-',
    startDate: warranty.startDate || '',
    endDate: warranty.endDate || '',
    status: valid ? (warranty.status as WarrantyInfo['status']) : 'Active',
    coverageType: warranty.coverageType || 'Full Parts & Service',
  }
}
