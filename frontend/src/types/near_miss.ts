// Near-miss TypeScript types

export type HazardType =
  | 'blind_turn'
  | 'poor_lighting'
  | 'missing_signboard'
  | 'dangerous_intersection'
  | 'pothole'
  | 'frequent_speeding'
  | 'waterlogging'
  | 'narrow_road'
  | 'broken_divider'
  | 'other'

export type NearMissStatus = 'pending' | 'acknowledged' | 'resolved' | 'dismissed'

export interface NearMissReport {
  id: string
  reporter_id: string | null
  latitude: number
  longitude: number
  address: string | null
  hazard_type: HazardType
  description: string | null
  injury_involved: boolean
  media_urls: string[] | null
  status: NearMissStatus
  authority_notes: string | null
  created_at: string
  updated_at: string
}

export interface NearMissListItem {
  id: string
  latitude: number
  longitude: number
  hazard_type: HazardType
  injury_involved: boolean
  status: NearMissStatus
  created_at: string
}

export interface NearMissCreatePayload {
  latitude: number
  longitude: number
  hazard_type: HazardType
  description?: string
  injury_involved: boolean
  address?: string
}

export const HAZARD_LABELS: Record<HazardType, string> = {
  blind_turn: 'Blind Turn',
  poor_lighting: 'Poor Lighting',
  missing_signboard: 'Missing Signboard',
  dangerous_intersection: 'Dangerous Intersection',
  pothole: 'Pothole',
  frequent_speeding: 'Frequent Speeding',
  waterlogging: 'Waterlogging',
  narrow_road: 'Narrow Road',
  broken_divider: 'Broken Divider',
  other: 'Other',
}
