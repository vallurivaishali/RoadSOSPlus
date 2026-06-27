from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
from functools import lru_cache
import os

_INSECURE_DEFAULT_KEY = "CHANGE_ME_IN_PRODUCTION_USE_OPENSSL_RAND_HEX_32"


class Settings(BaseSettings):
    # App
    APP_NAME: str = "RoadSOS+"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://roadsos:roadsos_pass@localhost:5432/roadsos_db"
    )
    AUTHORITY_SEED_PASSWORD: str = "ChangeMe123!"

    @model_validator(mode="after")
    def fix_postgres_scheme(self) -> "Settings":
        if self.DATABASE_URL.startswith("postgres://"):
            self.DATABASE_URL = self.DATABASE_URL.replace(
                "postgres://", "postgresql://", 1
            )
        return self

    # JWT
    SECRET_KEY: str = _INSECURE_DEFAULT_KEY
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # Gemini
    GEMINI_API_KEY: str = ""

    # OSM
    NOMINATIM_USER_AGENT: str = "RoadSOS-Platform/1.0"

    # Rate Limiting
    RATE_LIMIT_AUTH: str = "10/minute"

    @model_validator(mode="after")
    def validate_secret_key(self) -> "Settings":
        if (
            self.ENVIRONMENT != "development"
            and self.SECRET_KEY == _INSECURE_DEFAULT_KEY
        ):
            raise ValueError(
                "SECRET_KEY must be set in non-development environments."
            )
        return self

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()