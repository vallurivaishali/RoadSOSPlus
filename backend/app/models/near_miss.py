"""
NearMissReport model — captures hazard conditions before accidents happen.

Design decisions:
- hazard_type as Enum: structured data enables clustering and risk scoring
- media_urls as ARRAY: near-miss media is typically 1-3 photos, no heavy files
  Using PostgreSQL ARRAY avoids a join for simple list/display operations.
  For heavy media workflows, a separate table (like IncidentMedia) would be better.
- verification_status: authority can confirm or dismiss
- injury_involved: boolean flag — near-misses with injuries are weighted higher in risk engine
"""
import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Text, DateTime, Enum as PgEnum, ForeignKey, Boolean, Index
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from app.core.database import Base


class HazardType(str, enum.Enum):
    BLIND_TURN = "blind_turn"
    POOR_LIGHTING = "poor_lighting"
    MISSING_SIGNBOARD = "missing_signboard"
    DANGEROUS_INTERSECTION = "dangerous_intersection"
    POTHOLE = "pothole"
    FREQUENT_SPEEDING = "frequent_speeding"
    WATERLOGGING = "waterlogging"
    NARROW_ROAD = "narrow_road"
    BROKEN_DIVIDER = "broken_divider"
    OTHER = "other"


class NearMissStatus(str, enum.Enum):
    PENDING = "pending"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


class NearMissReport(Base):
    __tablename__ = "near_miss_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Reporter
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    # Location
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(500), nullable=True)

    # Report content
    hazard_type = Column(PgEnum(HazardType, name="hazardtype", create_type=False, values_callable=lambda obj: [e.value for e in obj]), nullable=False)
    description = Column(Text, nullable=True)
    injury_involved = Column(Boolean, default=False, nullable=False)

    # Media (array of Cloudinary URLs — simpler for lightweight near-miss uploads)
    media_urls = Column(ARRAY(String(1000)), nullable=True, default=list)

    # Authority management
    status = Column(PgEnum(NearMissStatus, name="nearmisstatus", create_type=False, values_callable=lambda obj: [e.value for e in obj]), nullable=False, default=NearMissStatus.PENDING)
    authority_notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    reporter = relationship("User", back_populates="near_miss_reports")

    __table_args__ = (
        Index("ix_near_miss_location", "latitude", "longitude"),
        Index("ix_near_miss_hazard", "hazard_type"),
        Index("ix_near_miss_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<NearMissReport id={self.id} hazard={self.hazard_type}>"
