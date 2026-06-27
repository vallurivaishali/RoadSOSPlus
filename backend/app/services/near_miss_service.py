"""
Near Miss Service.
"""
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.near_miss import NearMissReport, NearMissStatus
from app.schemas.near_miss import NearMissCreateRequest, NearMissResponse, NearMissListResponse

def create_near_miss(db: Session, payload: NearMissCreateRequest, user_id: str) -> NearMissResponse:
    report = NearMissReport(
        reporter_id=user_id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        address=payload.address,
        hazard_type=payload.hazard_type,
        description=payload.description,
        injury_involved=payload.injury_involved,
        media_urls=payload.media_urls,
        status=NearMissStatus.PENDING
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return NearMissResponse.model_validate(report)


def get_citizen_near_misses(db: Session, user_id: str, skip: int = 0, limit: int = 20) -> NearMissListResponse:
    query = db.query(NearMissReport).filter(NearMissReport.reporter_id == user_id)
    total = query.count()
    reports = query.order_by(desc(NearMissReport.created_at)).offset(skip).limit(limit).all()
    
    return NearMissListResponse(
        success=True,
        data=[NearMissResponse.model_validate(r) for r in reports],
        message="Fetched near misses successfully",
        pagination={"page": (skip // limit) + 1, "limit": limit, "total": total}
    )
