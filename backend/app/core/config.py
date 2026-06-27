from pydantic_settings import BaseSettings
from pydantic import model_validator
from functools import lru_cache

_INSECURE_DEFAULT_KEY = "CHANGE_ME_IN_PRODUCTION_USE_OPENSSL_RAND_HEX_32"


class Settings(BaseSettings):
    # App
    APP_NAME: str = "RoadSOS+"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "postgresql://roadsos:roadsos_pass@localhost:5432/roadsos_db"
    AUTHORITY_SEED_PASSWORD: str = "ChangeMe123!"

    # JWT
    SECRET_KEY: str = _INSECURE_DEFAULT_KEY
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # Gemini AI
    GEMINI_API_KEY: str = ""

    # OSM / Nominatim
    NOMINATIM_USER_AGENT: str = "RoadSOS-Platform/1.0"

    # Rate limiting
    RATE_LIMIT_AUTH: str = "10/minute"

    @model_validator(mode="after")
    def validate_secret_key(self) -> "Settings":
        """
        Refuse to start with the insecure default SECRET_KEY.
        Generate a safe key with: python -c "import secrets; print(secrets.token_hex(32))"
        """
        if self.ENVIRONMENT != "development" and self.SECRET_KEY == _INSECURE_DEFAULT_KEY:
            raise ValueError(
                "SECRET_KEY must be set to a secure random value in non-development environments. "
                "Generate one with: python -c \"import secrets; print(secrets.token_hex(32))\""
            )
        return self

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
