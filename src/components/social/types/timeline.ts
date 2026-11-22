/**
 * Tipe timeline milestone untuk DualTrackTimelineCard.
 */

export type SocialPlatform =
  | 'instagram'
  | 'tiktok'
  | 'threads'
  | 'youtube'
  | 'youtube_shorts'
  | 'facebook'
  | 'x'

export interface TimelineAxisTick {
  label: string
  positionPercent: number
}

export interface TimelineMilestone {
  id: string
  platform: SocialPlatform
  /** Semua channel task — label milestone nampilin semua logonya */
  platforms?: string[]
  /** Tipe konten (taksonomi A/B) — jadi filter chip di header kartu */
  contentType?: string
  /** 'short_form' = titik di atas garis, 'long_and_feed' = di bawah garis */
  track: 'short_form' | 'long_and_feed'
  /** 'high' = stem panjang (68px), selain itu pendek (34px) */
  tier?: 'high' | 'normal'
  status: 'published' | 'scheduled'
  positionPercent: number
  dateLabel: string
  title: string
}

/** Label taksonomi konten (A/B) — dipakai chip filter & modal detail */
export const CONTENT_TYPE_LABELS: Record<string, string> = {
  organic: 'Organic Content',
  honest_review: 'Honest / Unpaid Review',
  ugc_portfolio: 'UGC Portfolio',
  affiliate: 'Affiliate Content',
  collab: 'Collab (Collaboration)',
  endorsement: 'Endorsement',
  paid_promote: 'Paid Promote',
  barter: 'Barter Value',
  paid_ugc: 'Paid UGC',
  brand_ambassador: 'Brand Ambassador',
}

/** Label taksonomi format konten (C) — dipakai modal detail */
export const CONTENT_FORMAT_LABELS: Record<string, string> = {
  educational: 'Educational / How-To',
  entertainment: 'Entertainment',
  vlog: 'Vlog / Storytelling',
  review_comparison: 'Review & Comparison',
  interactive: 'Interactive',
  bts: 'Behind The Scenes (BTS)',
}
