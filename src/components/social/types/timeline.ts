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
  /** 'short_form' = titik di atas garis, 'long_and_feed' = di bawah garis */
  track: 'short_form' | 'long_and_feed'
  /** 'high' = stem panjang (68px), selain itu pendek (34px) */
  tier?: 'high' | 'normal'
  status: 'published' | 'scheduled'
  positionPercent: number
  dateLabel: string
  title: string
}
