"""
Incident schemas — request/response models for accident reports.
"""
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, field_validator
from app.models.incident import IncidentSeverity, IncidentStatus, IncidentType
from app.schemas.media import IncidentMediaResponse


class IncidentCreateRequest(BaseModel):
    latitude: float
    longitude: float
    description: str
    address: Optional[str] = None  # Can be auto-resolved server-side
    media_urls: List[str] = []

    @field_validator("latitude")
    @classmethod
    def validate_lat(cls, v: float) -> float:
        if not (-90 <= v <= 90):
            raise ValueError("Latitude must be between -90 and 90")
        return v

    @field_validator("longitude")
    @classmethod
    def validate_lng(cls, v: float) -> float:
        if not (-180 <= v <= 180):
            raise ValueError("Longitude must be between -180 and 180")
        return v

    @field_validator("description")
    @classmethod
    def description_not_empty(cls, v: str) -> str:
        if len(v.strip()) < 10:
            raise ValueError("Description must be at least 10 characters")
        return v.strip()


class IncidentStatusUpdateRequest(BaseModel):
    status: IncidentStatus
    authority_notes: Optional[str] = None


class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    reporter_id: Optional[UUID]
    latitude: float
    longitude: float
    address: Optional[str]
    description: str
    ai_summary: Optional[str]
    ai_incident_type: Optional[IncidentType]
    ai_severity: Optional[IncidentSeverity]
    ai_processed: bool
    status: IncidentStatus
    authority_notes: Optional[str]
    media: List[IncidentMediaResponse] = []
    created_at: datetime
    updated_at: datetime


class IncidentListResponse(BaseModel):
    success: bool
    data: List[IncidentResponse]
    message: str
    pagination: dict


class MapIncidentPoint(BaseModel):
    """Lightweight model for map marker rendering — only essential fields."""
    id: UUID
    latitude: float
    longitude: float
    severity: Optional[IncidentSeverity]
    status: IncidentStatus
    created_at: datetime
