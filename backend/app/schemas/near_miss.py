"""
Near-miss report schemas.
"""
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, field_validator
from app.models.near_miss import HazardType, NearMissStatus


class NearMissCreateRequest(BaseModel):
    latitude: float
    longitude: float
    hazard_type: HazardType
    description: Optional[str] = None
    injury_involved: bool = False
    address: Optional[str] = None
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


class NearMissStatusUpdateRequest(BaseModel):
    status: NearMissStatus
    authority_notes: Optional[str] = None


class NearMissResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    reporter_id: Optional[UUID]
    latitude: float
    longitude: float
    address: Optional[str]
    hazard_type: HazardType
    description: Optional[str]
    injury_involved: bool
    media_urls: Optional[List[str]]
    status: NearMissStatus
    authority_notes: Optional[str]
    created_at: datetime
    updated_at: datetime


class NearMissListResponse(BaseModel):
    success: bool
    data: List[NearMissResponse]
    message: str
    pagination: dict
