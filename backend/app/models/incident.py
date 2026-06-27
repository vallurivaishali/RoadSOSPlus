"""
Incident model — core accident report entity.

Design decisions:
- lat/lng as FLOAT (double precision via Numeric): sufficient for ~1cm accuracy
- severity as Enum with 3 levels: Low/Medium/High — AI assigns this
- status lifecycle: pending → verified | rejected | resolved
- ai_summary/ai_incident_type populated asynchronously after submission
- verified_by_id nullable: set only when authority reviews
- address: reverse-geocoded string from lat/lng (stored for display, not querying)
"""
import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Float, Text, DateTime, Enum as PgEnum,
    ForeignKey, Index, Boolean
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class IncidentSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class IncidentStatus(str, enum.Enum):
    PENDING = "pending"       # Just submitted
    VERIFIED = "verified"     # Authority confirmed
    RESOLVED = "resolved"     # Issue addressed
    REJECTED = "rejected"     # Spam or invalid


class IncidentType(str, enum.Enum):
    COLLISION = "collision"
    PEDESTRIAN = "pedestrian"
    MOTORCYCLE = "motorcycle"
    VEHICLE_BREAKDOWN = "vehicle_breakdown"
    ROAD_HAZARD = "road_hazard"
    FLOOD = "flood"
    OTHER = "other"


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Reporter
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    # Location
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(500), nullable=True)  # Reverse-geocoded

    # Report content
    description = Column(Text, nullable=False)

    # AI-generated fields (populated async)
    ai_summary = Column(Text, nullable=True)
    ai_incident_type = Column(PgEnum(IncidentType, name="incidenttype", create_type=False, values_callable=lambda obj: [e.value for e in obj]), nullable=True)
    ai_severity = Column(PgEnum(IncidentSeverity, name="incidentseverity", create_type=False, values_callable=lambda obj: [e.value for e in obj]), nullable=True)
    ai_processed = Column(Boolean, default=False, nullable=False)

    # Status management
    status = Column(PgEnum(IncidentStatus, name="incidentstatus", create_type=False, values_callable=lambda obj: [e.value for e in obj]), nullable=False, default=IncidentStatus.PENDING)
    verified_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
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
    reporter = relationship("User", foreign_keys=[reporter_id], back_populates="incidents")
    verified_by = relationship("User", foreign_keys=[verified_by_id], back_populates="verified_incidents")
    media = relationship("IncidentMedia", back_populates="incident", cascade="all, delete-orphan")

    # Indexes for map queries and dashboard filters
    __table_args__ = (
        Index("ix_incidents_location", "latitude", "longitude"),
        Index("ix_incidents_status", "status"),
        Index("ix_incidents_severity", "ai_severity"),
        Index("ix_incidents_created_at", "created_at"),
        Index("ix_incidents_reporter", "reporter_id"),
    )

    def __repr__(self) -> str:
        return f"<Incident id={self.id} severity={self.ai_severity} status={self.status}>"
