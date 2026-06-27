"""
Media Service.

Since Cloudinary API keys aren't provided, this implements a fallback
that saves files locally to the `uploads/` directory and returns a local URL.
"""
import os
import uuid
import shutil
from fastapi import UploadFile

from app.core.config import settings
from app.exceptions import MediaUploadError

UPLOAD_DIR = "uploads"


def upload_image(file: UploadFile) -> str:
    """
    Save an uploaded image locally and return the public URL.
    In a real app, this would use Cloudinary SDK.
    """
    try:
        # Generate unique filename
        ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg"
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)

        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Return the local URL
        # e.g. http://localhost:8000/uploads/uuid.jpg
        base_url = "http://localhost:8000" if settings.ENVIRONMENT == "development" else ""
        return f"{base_url}/uploads/{filename}"

    except Exception as e:
        raise MediaUploadError(f"Failed to upload media: {str(e)}")
