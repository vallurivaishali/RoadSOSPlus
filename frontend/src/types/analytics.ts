// Risk zone and analytics TypeScript types

export interface RiskZone {
  id: string
  name: string
  description: string | null
  center_latitude: number
  center_longitude: number
  radius_meters: number
  risk_score: number
  accident_count: number
  near_miss_count: number
  high_severity_count: number
  contributing_factors: Record<string, unknown> | null
  last_calculated_at: string | null
  created_at: string
}

export interface RiskZoneListItem {
  id: string
  name: string
  center_latitude: number
  center_longitude: number
  radius_meters: number
  risk_score: number
  accident_count: number
  near_miss_count: number
}

export interface RouteWarning {
  risk_zone_id: string
  name: string
  risk_score: number
  reasons: string[]
  center_latitude: number
  center_longitude: number
  suggested_action: string
}

export interface DashboardSummary {
  total_incidents: number
  total_near_misses: number
  active_incidents: number
  verified_incidents: number
  resolved_incidents: number
  rejected_incidents: number
  high_severity_count: number
  medium_severity_count: number
  low_severity_count: number
  high_risk_zone_count: number
  avg_risk_score: number | null
}

export interface HotspotPoint {
  latitude: number
  longitude: number
  weight: number
}

export interface HotspotResponse {
  heatmap_points: HotspotPoint[]
  top_risk_zones: RiskZoneListItem[]
  incident_type_breakdown: Record<string, number>
  hazard_type_breakdown: Record<string, number>
}

export interface TrendPoint {
  date: string
  incident_count: number
  near_miss_count: number
}

// Emergency services types
export interface EmergencyService {
  name: string
  type: 'hospital' | 'police' | 'trauma_center'
  latitude: number
  longitude: number
  distance_km: number
  phone: string | null
  address: string | null
}

// API pagination wrapper
export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  message: string
  pagination: {
    page: number
    limit: number
    total: number
  }
}
