"""
Near Miss Router.
"""
from fastapi import APIRouter, Query

from app.core.dependencies import CurrentUser, DbSession
from app.schemas.near_miss import NearMissCreateRequest, NearMissResponse, NearMissListResponse
from app.services import near_miss_service

router = APIRouter(prefix="/near-miss", tags=["Near Miss"])


@router.post("/", response_model=NearMissResponse, status_code=201)
async def create_near_miss(
    payload: NearMissCreateRequest,
    current_user: CurrentUser,
    db: DbSession
):
    """
    Submit a near-miss or road hazard report.
    """
    return near_miss_service.create_near_miss(db, payload, str(current_user.id))


@router.get("/", response_model=NearMissListResponse)
async def get_my_near_misses(
    current_user: CurrentUser,
    db: DbSession,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Get all near-miss reports created by the current citizen.
    """
    return near_miss_service.get_citizen_near_misses(db, str(current_user.id), skip, limit)
