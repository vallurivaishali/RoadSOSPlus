"""
Risk Zone Router.
"""
from fastapi import APIRouter

from app.core.dependencies import CurrentAuthority, DbSession
from app.schemas.risk_zone import RiskZoneListResponse, RiskZoneResponse
from app.services import risk_engine

router = APIRouter(prefix="/risk-zones", tags=["Risk Zones"])


@router.get("/", response_model=RiskZoneListResponse)
async def list_risk_zones(db: DbSession):
    """
    Get all active risk zones for the map and dashboard.
    Public endpoint so citizens can also see risk zones on their map.
    """
    zones = risk_engine.get_risk_zones(db)
    return {
        "success": True,
        "data": zones,
        "message": "Fetched risk zones successfully"
    }


@router.post("/recalculate")
async def recalculate_risk_zones(
    current_authority: CurrentAuthority,
    db: DbSession
):
    """
    Manually trigger the rule-based risk clustering algorithm.
    Requires authority role.
    """
    num_zones = risk_engine.recalculate_risk_zones(db)
    return {
        "success": True,
        "message": f"Risk Engine finished. Generated {num_zones} hotspots."
    }
