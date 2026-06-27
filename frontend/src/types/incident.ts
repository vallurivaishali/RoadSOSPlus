// Incident TypeScript types

export type IncidentSeverity = 'low' | 'medium' | 'high'
export type IncidentStatus = 'pending' | 'verified' | 'resolved' | 'rejected'
export type IncidentType =
  | 'collision'
  | 'pedestrian'
  | 'motorcycle'
  | 'vehicle_breakdown'
  | 'road_hazard'
  | 'flood'
  | 'other'
export type MediaType = 'image' | 'video' | 'audio'

export interface IncidentMedia {
  id: string
  media_type: MediaType
  cloudinary_url: string
  thumbnail_url: string | null
  file_size_bytes: number | null
  duration_seconds: number | null
  created_at: string
}

export interface Incident {
  id: string
  reporter_id: string | null
  latitude: number
  longitude: number
  address: string | null
  description: string
  ai_summary: string | null
  ai_incident_type: IncidentType | null
  ai_severity: IncidentSeverity | null
  ai_processed: boolean
  status: IncidentStatus
  authority_notes: string | null
  media: IncidentMedia[]
  created_at: string
  updated_at: string
}

export interface IncidentListItem {
  id: string
  latitude: number
  longitude: number
  address: string | null
  ai_severity: IncidentSeverity | null
  ai_incident_type: IncidentType | null
  status: IncidentStatus
  ai_processed: boolean
  created_at: string
}

export interface MapIncidentPoint {
  id: string
  latitude: number
  longitude: number
  severity: IncidentSeverity | null
  status: IncidentStatus
  created_at: string
}

export interface IncidentCreatePayload {
  latitude: number
  longitude: number
  description: string
  address?: string
}

export interface IncidentStatusUpdatePayload {
  status: IncidentStatus
  authority_notes?: string
}
