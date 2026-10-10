import type {
  ActivityNote,
  LeadItem,
  LeadScoreInsight,
  TaskItem,
  WarrantyInfo,
} from './types'

// ============ SHAPE API (backend /api/clients) ============

export interface ApiClient {
  id: string
  tenantId: string
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

function hashScore(id: string): number {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 997
  return 30 + (h % 70)
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
  const score = hashScore(client.id)
  const created = new Date(client.createdAt)
  const withinWeek = !Number.isNaN(created.getTime()) && Date.now() - created.getTime() < 7 * 86400000

  return {
    id: client.id,
    name,
    avatar: client.logoUrl || initialsAvatar(name),
    subtitle: client.industry || (client.type === 'individual' ? 'Individual' : 'Corporate'),
    type: STATUS_LABEL[status] ?? 'Lead',
    timestamp: relativeTime(client.createdAt),
    score,
    grade: score >= 80 ? 'Grade A' : score >= 60 ? 'Grade B' : 'Grade C',
    status: client.rating === 'Hot' ? 'Growing' : client.rating === 'Cold' ? 'At Risk' : 'Steady',
    statusDirection: client.rating === 'Hot' ? 'up' : client.rating === 'Cold' ? 'down' : 'steady',
    scoreColor:
      score >= 80
        ? 'bg-[#BCE893] text-slate-900'
        : score >= 60
        ? 'bg-[#FDE68A] text-slate-900'
        : 'bg-[#FECACA] text-slate-900',
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
    socialMedia: undefined,
    tasks: [],
    activities: [],
    warranty: undefined,
  }
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
  tags?: string[]
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
  put('identityType', patch.identityType)
  put('identityNumber', patch.identityNumber)
  put('address', patch.address)
  put('source', patch.leadSource)
  if (patch.website) {
    const url = normalizeWebsite(patch.website)
    if (url) payload.website = url
  }
  if (patch.tags) payload.tags = patch.tags.filter(Boolean)

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
    tags: patch.tags !== undefined ? patch.tags : lead.tags,
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
