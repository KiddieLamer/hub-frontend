export type Channel = 'mail' | 'phone'

export interface ProcessStage {
  id: string
  label: string
  icon: 'sparkles' | 'userCheck' | 'paperclip' | 'lock'
}

export interface LeadScoreInsight {
  id: string
  text: string
  subtext?: string
}

export interface SocialHandles {
  instagram?: string
  linkedin?: string
  twitter?: string
}

export interface TaskItem {
  id: string
  title: string
  step: string
  dueDate: string
  description: string
  isCompleted: boolean
  type: 'call' | 'email' | 'meeting' | 'task'
}

export interface ActivityNote {
  id: string
  type: 'note' | 'call' | 'email' | 'meeting'
  author: string
  authorAvatar: string
  content: string
  timestamp: string
}

export interface WarrantyInfo {
  productName: string
  serialNumber: string
  startDate: string
  endDate: string
  status: 'Active' | 'Expiring Soon' | 'Expired'
  coverageType: string
}

export interface LeadItem {
  id: string
  name: string
  avatar: string
  subtitle: string
  type: string
  timestamp: string
  score: number
  grade: string
  status: string
  statusDirection: 'up' | 'down' | 'steady'
  scoreColor: string
  icon: Channel
  timeGroup: 'Today' | '3 weeks ago'
  activeStageIndex: number
  activeDays: string
  topic: string
  jobTitle?: string
  phone: string
  mobile: string
  email: string
  identityType?: 'KTP' | 'SIM' | 'Passport'
  identityNumber?: string
  address: string
  company: string
  website: string
  leadSource: string
  rating: string
  statusTag: string
  budget?: string
  owner: string
  ownerAvatar: string
  insights: LeadScoreInsight[]

  // Media Sosial
  socialMedia?: SocialHandles

  // Industri / bidang usaha client (dari clients.industry)
  industry?: string

  // Legalitas & finansial
  taxId?: string
  billingEmail?: string

  // Owner / penanggung jawab (clients.assigned_to -> users.id)
  assignedTo?: string

  // Tags (misal: Lead, Sales Insight)
  tags?: string[]

  // Daftar Task / Sequence Activities
  tasks?: TaskItem[]

  // Riwayat Aktivitas & Catatan Customer
  activities?: ActivityNote[]

  // Info Garansi Produk Client
  warranty?: WarrantyInfo

  // Multi-tenant tagging (dipakai hub-admin platform view: gabungan semua
  // company). Kosong saat user adalah member tenant biasa.
  tenantId?: string
  tenantName?: string
}
