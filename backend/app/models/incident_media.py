"""
IncidentMedia model — stores references to media files uploaded to Cloudinary.

Design decisions:
- Stores Cloudinary public_id separately: allows deletion from Cloudinary via API
- media_type enum covers image/video/audio (voice recordings)
- One incident → many media items (1:N relationship)
- thumbnail_url: Cloudinary auto-generates these; stored for fast list views
"""
import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Enum as PgEnum, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class MediaType(str, enum.Enum):
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"


class IncidentMedia(Base):
    __tablename__ = "incident_media"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False, index=True)

    media_type = Column(PgEnum(MediaType, name="mediatype", create_type=False, values_callable=lambda obj: [e.value for e in obj]), nullable=False)
    cloudinary_url = Column(String(1000), nullable=False)
    cloudinary_public_id = Column(String(500), nullable=False)
    thumbnail_url = Column(String(1000), nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    duration_seconds = Column(Integer, nullable=True)  # For video/audio

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    incident = relationship("Incident", back_populates="media")

    def __repr__(self) -> str:
        return f"<IncidentMedia id={self.id} type={self.media_type}>"
