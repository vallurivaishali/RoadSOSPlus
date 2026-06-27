"""
RiskZone model — computed geographic zones with risk scores.

Design decisions:
- risk_score (0.0-100.0): computed by risk engine, stored for fast reads
- radius_meters: defines the zone boundary as a circle around center point
  Simple approach avoids PostGIS polygon complexity at MVP
- geojson_polygon: optional — can store a custom irregular polygon for display
  on map when admin draws a custom zone boundary
- contributing_factors (JSON): stores a breakdown like
  {"accident_count": 12, "near_miss_count": 8, "high_severity_count": 4}
  for the authority dashboard tooltip
- last_calculated_at: used to determine staleness (recalculate if > 24h old)
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, Integer, Text, Boolean, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.core.database import Base


class RiskZone(Base):
    __tablename__ = "risk_zones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Identity
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # Geography
    center_latitude = Column(Float, nullable=False)
    center_longitude = Column(Float, nullable=False)
    radius_meters = Column(Integer, nullable=False, default=500)
    geojson_polygon = Column(Text, nullable=True)  # GeoJSON string for custom polygons

    # Risk metrics (computed by risk engine)
    risk_score = Column(Float, nullable=False, default=0.0)      # 0.0 - 100.0
    accident_count = Column(Integer, nullable=False, default=0)
    near_miss_count = Column(Integer, nullable=False, default=0)
    high_severity_count = Column(Integer, nullable=False, default=0)
    contributing_factors = Column(JSONB, nullable=True)          # Breakdown for display

    # Admin control
    is_active = Column(Boolean, default=True, nullable=False)
    created_by_seed = Column(Boolean, default=False, nullable=False)  # True if seeded

    # Timestamps
    last_calculated_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        Index("ix_risk_zones_location", "center_latitude", "center_longitude"),
        Index("ix_risk_zones_score", "risk_score"),
    )

    def __repr__(self) -> str:
        return f"<RiskZone id={self.id} name={self.name} score={self.risk_score}>"
