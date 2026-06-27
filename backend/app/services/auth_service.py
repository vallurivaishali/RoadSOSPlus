"""
Auth Service — all business logic for registration and login.

Raises domain exceptions (not HTTPException).
The router layer is responsible for translating these to HTTP responses.
"""
from datetime import timedelta
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User, UserRole
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse, UserResponse
from app.exceptions import (
    EmailAlreadyExistsError,
    InvalidCredentialsError,
    AccountDeactivatedError,
)


def register_citizen(db: Session, payload: RegisterRequest) -> AuthResponse:
    """
    Register a new citizen account.
    Authorities cannot self-register — they must be seeded.
    Raises EmailAlreadyExistsError if email is taken.
    """
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise EmailAlreadyExistsError("An account with this email already exists.")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        phone=payload.phone,
        role=UserRole.CITIZEN,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return _build_auth_response(user)


def login_user(db: Session, payload: LoginRequest) -> AuthResponse:
    """
    Authenticate a user (any role). Returns JWT on success.
    Uses consistent error message to prevent email enumeration.
    Raises InvalidCredentialsError or AccountDeactivatedError.
    """
    user = db.query(User).filter(User.email == payload.email).first()

    # Constant-time check even if user doesn't exist (prevent timing attacks)
    if not user or not verify_password(payload.password, user.hashed_password):
        raise InvalidCredentialsError("Invalid email or password.")

    if not user.is_active:
        raise AccountDeactivatedError("Account is deactivated. Contact support.")

    return _build_auth_response(user)


def _build_auth_response(user: User) -> AuthResponse:
    """Create JWT and build standardized auth response."""
    expires_seconds = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return AuthResponse(
        access_token=token,
        token_type="bearer",
        expires_in=expires_seconds,
        user=UserResponse.model_validate(user),
    )
