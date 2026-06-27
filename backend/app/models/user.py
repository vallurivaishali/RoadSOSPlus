"""
User model — supports both Citizen and Authority roles via RBAC.

Design decisions:
- UUID primary key: avoids enumerable IDs, safe for public-facing APIs
- role stored as PostgreSQL ENUM for DB-level constraint
- phone nullable: not all citizens may provide it
- authority_accounts table not separate — role field + is_active flag is sufficient
  at this scale; authority accounts are seeded, not self-registered
"""
import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime, Enum as PgEnum, Index
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class UserRole(str, enum.Enum):
    CITIZEN = "citizen"
    AUTHORITY = "authority"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(PgEnum(UserRole, name="userrole", create_type=False, values_callable=lambda obj: [e.value for e in obj]), nullable=False, default=UserRole.CITIZEN)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    incidents = relationship("Incident", foreign_keys="Incident.reporter_id", back_populates="reporter")
    verified_incidents = relationship("Incident", foreign_keys="Incident.verified_by_id", back_populates="verified_by")
    near_miss_reports = relationship("NearMissReport", back_populates="reporter")

    # Composite indexes
    __table_args__ = (
        Index("ix_users_role_active", "role", "is_active"),
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
