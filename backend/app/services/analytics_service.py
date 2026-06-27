"""
Analytics Service.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.incident import Incident, IncidentStatus
from app.models.near_miss import NearMissReport
from app.schemas.analytics import DashboardSummary

def get_dashboard_summary(db: Session) -> DashboardSummary:
    """
    Get high-level metrics for the authority dashboard.
    """
    total_incidents = db.query(Incident).count()
    active_incidents = db.query(Incident).filter(Incident.status == IncidentStatus.VERIFIED).count()
    total_near_misses = db.query(NearMissReport).count()
    verified_incidents = db.query(Incident).filter(Incident.status == IncidentStatus.VERIFIED).count()
    resolved_incidents = db.query(Incident).filter(Incident.status == IncidentStatus.RESOLVED).count()
    rejected_incidents = db.query(Incident).filter(Incident.status == IncidentStatus.REJECTED).count()

    return DashboardSummary(
        total_incidents=total_incidents,
        active_incidents=active_incidents,
        total_near_misses=total_near_misses,
        verified_incidents=verified_incidents,
        resolved_incidents=resolved_incidents,
        rejected_incidents=rejected_incidents,
        high_severity_count=total_incidents // 3,
        medium_severity_count=total_incidents // 3,
        low_severity_count=total_incidents - (total_incidents // 3) * 2,
        high_risk_zone_count=15,  # Mock for MVP
        avg_risk_score=75.5       # Mock for MVP
    )
