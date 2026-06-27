"""
AnalyticsSnapshot model — pre-aggregated daily snapshots for dashboard performance.

Design decisions:
- Snapshots are computed nightly (or on-demand for demo)
- JSONB columns store flexible arrays without schema migrations when adding metrics
- top_risk_zones / hotspot_data stored as JSONB arrays: avoid slow JOINs on dashboard load
- This is a classic "read-optimized materialized view" pattern implemented at app level
  (avoids PostgreSQL materialized view complexity while achieving the same goal)
- snapshot_date is unique: one record per day, upserted by analytics service
"""
import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, DateTime, Date, Integer, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.core.database import Base


class AnalyticsSnapshot(Base):
    __tablename__ = "analytics_snapshots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Snapshot date (one per day)
    snapshot_date = Column(Date, nullable=False, unique=True, index=True)

    # Aggregate counts
    total_incidents = Column(Integer, nullable=False, default=0)
    total_near_misses = Column(Integer, nullable=False, default=0)
    active_incidents = Column(Integer, nullable=False, default=0)
    verified_incidents = Column(Integer, nullable=False, default=0)
    resolved_incidents = Column(Integer, nullable=False, default=0)
    rejected_incidents = Column(Integer, nullable=False, default=0)
    high_severity_count = Column(Integer, nullable=False, default=0)
    medium_severity_count = Column(Integer, nullable=False, default=0)
    low_severity_count = Column(Integer, nullable=False, default=0)

    # Computed risk
    avg_risk_score = Column(Float, nullable=True)
    high_risk_zone_count = Column(Integer, nullable=False, default=0)

    # Rich data (JSON arrays)
    top_risk_zones = Column(JSONB, nullable=True)   # [{id, name, score, count}]
    hotspot_data = Column(JSONB, nullable=True)     # [{lat, lng, weight}] for heatmap
    incident_type_breakdown = Column(JSONB, nullable=True)  # {collision: 12, pedestrian: 5}
    hazard_type_breakdown = Column(JSONB, nullable=True)    # {pothole: 20, blind_turn: 15}

    # Timestamp
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = ()

    def __repr__(self) -> str:
        return f"<AnalyticsSnapshot date={self.snapshot_date} incidents={self.total_incidents}>"
