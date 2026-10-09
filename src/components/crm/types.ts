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
  phone: string
  mobile: string
  email: string
  address: string
  company: string
  website: string
  leadSource: string
  rating: string
  statusTag: string
  owner: string
  ownerAvatar: string
  insights: LeadScoreInsight[]
}
