"""
Analytics schemas — for authority dashboard and reporting.
"""
from typing import Optional, Any, Dict, List
from uuid import UUID
from datetime import datetime, date
from pydantic import BaseModel, ConfigDict


class DashboardSummary(BaseModel):
    """Top-level metrics for authority dashboard."""
    total_incidents: int
    total_near_misses: int
    active_incidents: int
    verified_incidents: int
    resolved_incidents: int
    rejected_incidents: int
    high_severity_count: int
    medium_severity_count: int
    low_severity_count: int
    high_risk_zone_count: int
    avg_risk_score: Optional[float]


class HotspotData(BaseModel):
    """Single data point for heatmap rendering."""
    latitude: float
    longitude: float
    weight: float  # 0.0 - 1.0 normalized intensity


class HotspotResponse(BaseModel):
    heatmap_points: List[HotspotData]
    top_risk_zones: List[Dict[str, Any]]
    incident_type_breakdown: Dict[str, int]
    hazard_type_breakdown: Dict[str, int]


class TrendPoint(BaseModel):
    date: date
    incident_count: int
    near_miss_count: int


class AnalyticsSnapshotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    snapshot_date: date
    total_incidents: int
    total_near_misses: int
    active_incidents: int
    verified_incidents: int
    resolved_incidents: int
    high_severity_count: int
    avg_risk_score: Optional[float]
    top_risk_zones: Optional[List[Dict[str, Any]]]
    incident_type_breakdown: Optional[Dict[str, int]]
    created_at: datetime
