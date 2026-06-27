"""
Risk Zone Schemas.
"""
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class RiskZoneResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: Optional[str]
    center_latitude: float
    center_longitude: float
    radius_meters: int
    risk_score: float
    accident_count: int
    near_miss_count: int
    high_severity_count: int
    contributing_factors: Optional[Dict[str, Any]]
    is_active: bool
    last_calculated_at: Optional[datetime]


class RiskZoneListResponse(BaseModel):
    success: bool
    data: List[RiskZoneResponse]
    message: str
