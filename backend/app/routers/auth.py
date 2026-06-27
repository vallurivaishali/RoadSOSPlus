"""
Auth Router — registration, login, and identity endpoints.

Translates domain exceptions from auth_service into HTTP responses.
Rate limiting via shared limiter instance.
"""
from fastapi import APIRouter, Request, HTTPException, status

from app.core.dependencies import CurrentUser, DbSession
from app.core.limiter import limiter
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse, UserResponse
from app.services import auth_service
from app.exceptions import (
    EmailAlreadyExistsError,
    InvalidCredentialsError,
    AccountDeactivatedError,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=201,
    summary="Register a new citizen account",
    description="Only citizens can self-register. Authority accounts are seeded by admins.",
)
@limiter.limit("10/minute")
async def register(request: Request, payload: RegisterRequest, db: DbSession):
    try:
        return auth_service.register_citizen(db, payload)
    except EmailAlreadyExistsError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=e.message)


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Login with email and password",
    description="Returns a JWT access token valid for 24 hours. Works for both citizens and authorities.",
)
@limiter.limit("10/minute")
async def login(request: Request, payload: LoginRequest, db: DbSession):
    try:
        return auth_service.login_user(db, payload)
    except InvalidCredentialsError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=e.message)
    except AccountDeactivatedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user",
)
async def get_me(current_user: CurrentUser):
    return current_user
