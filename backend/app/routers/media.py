"""
Media Router.
"""
from fastapi import APIRouter, UploadFile, File

from app.core.dependencies import CurrentUser
from app.services import media_service

router = APIRouter(prefix="/media", tags=["Media"])


@router.post("/upload")
async def upload_file(
    current_user: CurrentUser,
    file: UploadFile = File(...)
):
    """
    Upload an image for an incident or near-miss.
    Returns the URL to the uploaded file.
    Requires authentication.
    """
    url = media_service.upload_image(file)
    return {"success": True, "url": url}
