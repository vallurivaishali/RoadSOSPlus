"""
Media schemas.
"""
from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.incident_media import MediaType


class IncidentMediaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    media_type: MediaType
    cloudinary_url: str
    thumbnail_url: Optional[str]
    file_size_bytes: Optional[int]
    duration_seconds: Optional[int]
    created_at: datetime


class MediaUploadResponse(BaseModel):
    """Returned after successful Cloudinary upload."""
    public_id: str
    secure_url: str
    thumbnail_url: Optional[str]
    media_type: MediaType
    file_size_bytes: Optional[int]
