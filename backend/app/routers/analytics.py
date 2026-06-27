"""
Analytics Router.
"""
from fastapi import APIRouter

from app.core.dependencies import CurrentAuthority, DbSession
from app.schemas.analytics import DashboardSummary
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary", response_model=DashboardSummary)
async def get_summary(
    current_authority: CurrentAuthority,
    db: DbSession
):
    """
    Get high-level analytics summary.
    Requires authority role.
    """
    return analytics_service.get_dashboard_summary(db)
