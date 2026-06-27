"""
Incident Service.
"""
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.incident import Incident, IncidentStatus
from app.models.incident_media import IncidentMedia
from app.schemas.incident import IncidentCreateRequest, IncidentResponse, IncidentListResponse
from app.services.ai_service import analyze_incident
from fastapi import BackgroundTasks
import asyncio

async def _run_ai_processing(db: Session, incident_id: str, description: str, media_url: str | None):
    """Background task to run AI processing and update incident."""
    try:
        ai_data = await analyze_incident(description, media_url)
        
        # We need a new session or refresh the object
        incident = db.query(Incident).filter(Incident.id == incident_id).first()
        if incident:
            incident.ai_summary = ai_data["ai_summary"]
            incident.ai_severity = ai_data["severity"]
            incident.ai_incident_type = ai_data["incident_type"]
            incident.ai_processed = True
            db.commit()
    except Exception as e:
        print(f"AI processing failed for incident {incident_id}: {e}")
        # In a real app we'd mark it as failed for retry


def create_incident(db: Session, payload: IncidentCreateRequest, user_id: str, background_tasks: BackgroundTasks) -> IncidentResponse:
    incident = Incident(
        reporter_id=user_id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        address=payload.address,
        description=payload.description,
        status=IncidentStatus.PENDING,
        ai_processed=False
    )
    db.add(incident)
    db.flush()  # get ID

    # Add media
    first_media_url = None
    for url in payload.media_urls:
        if not first_media_url:
            first_media_url = url
        media = IncidentMedia(
            incident_id=incident.id,
            media_type="image",
            cloudinary_url=url,
            cloudinary_public_id="local_mock"
        )
        db.add(media)
        
    db.commit()
    db.refresh(incident)

    # Trigger background AI task
    background_tasks.add_task(
        _run_ai_processing, db, incident.id, incident.description, first_media_url
    )

    return IncidentResponse.model_validate(incident)


def get_citizen_incidents(db: Session, user_id: str, skip: int = 0, limit: int = 20) -> IncidentListResponse:
    query = db.query(Incident).filter(Incident.reporter_id == user_id)
    total = query.count()
    incidents = query.order_by(desc(Incident.created_at)).offset(skip).limit(limit).all()
    
    return IncidentListResponse(
        success=True,
        data=[IncidentResponse.model_validate(inc) for inc in incidents],
        message="Fetched incidents successfully",
        pagination={"page": (skip // limit) + 1, "limit": limit, "total": total}
    )

def get_all_incidents(db: Session, skip: int = 0, limit: int = 50) -> IncidentListResponse:
    query = db.query(Incident)
    total = query.count()
    incidents = query.order_by(desc(Incident.created_at)).offset(skip).limit(limit).all()
    
    return IncidentListResponse(
        success=True,
        data=[IncidentResponse.model_validate(inc) for inc in incidents],
        message="Fetched all incidents",
        pagination={"page": (skip // limit) + 1, "limit": limit, "total": total}
    )

def update_incident_status(db: Session, incident_id: str, status: IncidentStatus, authority_id: str, authority_notes: str | None) -> IncidentResponse:
    from fastapi import HTTPException
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    incident.status = status
    if authority_notes:
        incident.authority_notes = authority_notes
    incident.verified_by_id = authority_id
    
    db.commit()
    db.refresh(incident)
    return IncidentResponse.model_validate(incident)
