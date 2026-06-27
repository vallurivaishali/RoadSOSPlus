"""
Custom domain exceptions for RoadSOS+.

Services raise these — routers translate them into HTTP responses.
This decouples the service layer from the HTTP transport layer,
making services testable in isolation and reusable from CLI/tasks.
"""


class RoadSOSException(Exception):
    """Base exception for all RoadSOS+ domain errors."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


# ── Auth Exceptions ───────────────────────────────────────────────────────────

class EmailAlreadyExistsError(RoadSOSException):
    """Raised when registration is attempted with a duplicate email."""
    pass


class InvalidCredentialsError(RoadSOSException):
    """Raised when login credentials don't match any active account."""
    pass


class AccountDeactivatedError(RoadSOSException):
    """Raised when a deactivated account attempts to log in."""
    pass


# ── Resource Exceptions ───────────────────────────────────────────────────────

class NotFoundError(RoadSOSException):
    """Raised when a requested resource does not exist."""
    pass


class PermissionDeniedError(RoadSOSException):
    """Raised when a user tries to act on a resource they don't own/control."""
    pass


class ValidationError(RoadSOSException):
    """Raised when business-level validation fails (beyond Pydantic schema)."""
    pass


# ── External Service Exceptions ───────────────────────────────────────────────

class AIServiceError(RoadSOSException):
    """Raised when the Gemini API call fails."""
    pass


class MediaUploadError(RoadSOSException):
    """Raised when Cloudinary upload fails."""
    pass


class GeocodingError(RoadSOSException):
    """Raised when reverse geocoding fails."""
    pass
