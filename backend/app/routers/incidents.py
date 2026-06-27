"""
Incident Router.
"""
from fastapi import APIRouter, BackgroundTasks, Query

from app.core.dependencies import CurrentUser, CurrentAuthority, DbSession
from app.schemas.incident import IncidentCreateRequest, IncidentResponse, IncidentListResponse, IncidentStatusUpdateRequest
from app.services import incident_service

router = APIRouter(prefix="/incidents", tags=["Incidents"])


@router.post("/", response_model=IncidentResponse, status_code=201)
async def create_incident(
    payload: IncidentCreateRequest,
    current_user: CurrentUser,
    db: DbSession,
    background_tasks: BackgroundTasks
):
    """
    Submit a new accident report.
    Triggers Gemini AI processing in the background.
    """
    return incident_service.create_incident(db, payload, str(current_user.id), background_tasks)


@router.get("/", response_model=IncidentListResponse)
async def get_my_incidents(
    current_user: CurrentUser,
    db: DbSession,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Get all incidents reported by the current citizen.
    """
    # For MVP, assuming only citizens use this endpoint to fetch their own.
    # Authorities will use a different endpoint in Phase 5.
    return incident_service.get_citizen_incidents(db, str(current_user.id), skip, limit)


@router.get("/all", response_model=IncidentListResponse)
async def get_all_incidents(
    current_authority: CurrentAuthority,
    db: DbSession,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000)
):
    """
    Get all incidents. Requires authority role.
    """
    return incident_service.get_all_incidents(db, skip, limit)


@router.patch("/{incident_id}/status", response_model=IncidentResponse)
async def update_incident_status(
    incident_id: str,
    payload: IncidentStatusUpdateRequest,
    current_authority: CurrentAuthority,
    db: DbSession
):
    """
    Update the status of an incident. Requires authority role.
    """
    return incident_service.update_incident_status(
        db=db,
        incident_id=incident_id,
        status=payload.status,
        authority_id=str(current_authority.id),
        authority_notes=payload.authority_notes
    )
