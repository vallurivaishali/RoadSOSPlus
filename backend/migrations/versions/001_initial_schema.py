"""Initial schema — all tables

Revision ID: 001_initial_schema
Revises:
Create Date: 2026-06-05

Creates all tables for RoadSOS+ MVP:
- users
- incidents
- incident_media
- near_miss_reports
- risk_zones
- analytics_snapshots
"""
from typing import Sequence, Union
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op

revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── ENUMS ────────────────────────────────────────────────────────────────
    # Idempotent ENUM creation using raw Postgres blocks to prevent DuplicateObject errors
    op.execute("DO $$ BEGIN CREATE TYPE userrole AS ENUM ('citizen', 'authority'); EXCEPTION WHEN duplicate_object THEN null; END $$;")
    op.execute("DO $$ BEGIN CREATE TYPE incidenttype AS ENUM ('collision', 'pedestrian', 'motorcycle', 'vehicle_breakdown', 'road_hazard', 'flood', 'other'); EXCEPTION WHEN duplicate_object THEN null; END $$;")
    op.execute("DO $$ BEGIN CREATE TYPE incidentseverity AS ENUM ('low', 'medium', 'high'); EXCEPTION WHEN duplicate_object THEN null; END $$;")
    op.execute("DO $$ BEGIN CREATE TYPE incidentstatus AS ENUM ('pending', 'verified', 'resolved', 'rejected'); EXCEPTION WHEN duplicate_object THEN null; END $$;")
    op.execute("DO $$ BEGIN CREATE TYPE mediatype AS ENUM ('image', 'video', 'audio'); EXCEPTION WHEN duplicate_object THEN null; END $$;")
    op.execute("DO $$ BEGIN CREATE TYPE hazardtype AS ENUM ('blind_turn', 'poor_lighting', 'missing_signboard', 'dangerous_intersection', 'pothole', 'frequent_speeding', 'waterlogging', 'narrow_road', 'broken_divider', 'other'); EXCEPTION WHEN duplicate_object THEN null; END $$;")
    op.execute("DO $$ BEGIN CREATE TYPE nearmisstatus AS ENUM ('pending', 'acknowledged', 'resolved', 'dismissed'); EXCEPTION WHEN duplicate_object THEN null; END $$;")

    # ── USERS ────────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("role", postgresql.ENUM("citizen", "authority", name="userrole", create_type=False), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_id", "users", ["id"])
    op.create_index("ix_users_role_active", "users", ["role", "is_active"])

    # ── INCIDENTS ────────────────────────────────────────────────────────────
    op.create_table(
        "incidents",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("reporter_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("address", sa.String(500), nullable=True),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("ai_summary", sa.Text(), nullable=True),
        sa.Column("ai_incident_type", postgresql.ENUM("collision", "pedestrian", "motorcycle", "vehicle_breakdown", "road_hazard", "flood", "other", name="incidenttype", create_type=False), nullable=True),
        sa.Column("ai_severity", postgresql.ENUM("low", "medium", "high", name="incidentseverity", create_type=False), nullable=True),
        sa.Column("ai_processed", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("status", postgresql.ENUM("pending", "verified", "resolved", "rejected", name="incidentstatus", create_type=False), nullable=False, server_default="pending"),
        sa.Column("verified_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("authority_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_incidents_id", "incidents", ["id"])
    op.create_index("ix_incidents_location", "incidents", ["latitude", "longitude"])
    op.create_index("ix_incidents_status", "incidents", ["status"])
    op.create_index("ix_incidents_severity", "incidents", ["ai_severity"])
    op.create_index("ix_incidents_created_at", "incidents", ["created_at"])
    op.create_index("ix_incidents_reporter", "incidents", ["reporter_id"])

    # ── INCIDENT MEDIA ────────────────────────────────────────────────────────
    op.create_table(
        "incident_media",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("incident_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("media_type", postgresql.ENUM("image", "video", "audio", name="mediatype", create_type=False), nullable=False),
        sa.Column("cloudinary_url", sa.String(1000), nullable=False),
        sa.Column("cloudinary_public_id", sa.String(500), nullable=False),
        sa.Column("thumbnail_url", sa.String(1000), nullable=True),
        sa.Column("file_size_bytes", sa.Integer(), nullable=True),
        sa.Column("duration_seconds", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_incident_media_id", "incident_media", ["id"])
    op.create_index("ix_incident_media_incident", "incident_media", ["incident_id"])

    # ── NEAR MISS REPORTS ────────────────────────────────────────────────────
    op.create_table(
        "near_miss_reports",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("reporter_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("address", sa.String(500), nullable=True),
        sa.Column("hazard_type", postgresql.ENUM("blind_turn", "poor_lighting", "missing_signboard", "dangerous_intersection", "pothole", "frequent_speeding", "waterlogging", "narrow_road", "broken_divider", "other", name="hazardtype", create_type=False), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("injury_involved", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("media_urls", postgresql.ARRAY(sa.String(1000)), nullable=True),
        sa.Column("status", postgresql.ENUM("pending", "acknowledged", "resolved", "dismissed", name="nearmisstatus", create_type=False), nullable=False, server_default="pending"),
        sa.Column("authority_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_near_miss_id", "near_miss_reports", ["id"])
    op.create_index("ix_near_miss_location", "near_miss_reports", ["latitude", "longitude"])
    op.create_index("ix_near_miss_hazard", "near_miss_reports", ["hazard_type"])
    op.create_index("ix_near_miss_created_at", "near_miss_reports", ["created_at"])

    # ── RISK ZONES ───────────────────────────────────────────────────────────
    op.create_table(
        "risk_zones",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("center_latitude", sa.Float(), nullable=False),
        sa.Column("center_longitude", sa.Float(), nullable=False),
        sa.Column("radius_meters", sa.Integer(), nullable=False, server_default="500"),
        sa.Column("geojson_polygon", sa.Text(), nullable=True),
        sa.Column("risk_score", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("accident_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("near_miss_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("high_severity_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("contributing_factors", postgresql.JSONB(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_by_seed", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("last_calculated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_risk_zones_id", "risk_zones", ["id"])
    op.create_index("ix_risk_zones_location", "risk_zones", ["center_latitude", "center_longitude"])
    op.create_index("ix_risk_zones_score", "risk_zones", ["risk_score"])

    # ── ANALYTICS SNAPSHOTS ──────────────────────────────────────────────────
    op.create_table(
        "analytics_snapshots",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("snapshot_date", sa.Date(), nullable=False),
        sa.Column("total_incidents", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_near_misses", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("active_incidents", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("verified_incidents", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("resolved_incidents", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("rejected_incidents", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("high_severity_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("medium_severity_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("low_severity_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("avg_risk_score", sa.Float(), nullable=True),
        sa.Column("high_risk_zone_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("top_risk_zones", postgresql.JSONB(), nullable=True),
        sa.Column("hotspot_data", postgresql.JSONB(), nullable=True),
        sa.Column("incident_type_breakdown", postgresql.JSONB(), nullable=True),
        sa.Column("hazard_type_breakdown", postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_analytics_snapshots_id", "analytics_snapshots", ["id"])
    op.create_index("ix_analytics_snapshots_date", "analytics_snapshots", ["snapshot_date"], unique=True)

    # ── UPDATED_AT TRIGGERS ──────────────────────────────────────────────────
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
    """)
    op.execute("CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();")
    op.execute("CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();")
    op.execute("CREATE TRIGGER update_near_miss_reports_updated_at BEFORE UPDATE ON near_miss_reports FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();")
    op.execute("CREATE TRIGGER update_risk_zones_updated_at BEFORE UPDATE ON risk_zones FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();")


def downgrade() -> None:
    # Drop triggers
    op.execute("DROP TRIGGER IF EXISTS update_risk_zones_updated_at ON risk_zones;")
    op.execute("DROP TRIGGER IF EXISTS update_near_miss_reports_updated_at ON near_miss_reports;")
    op.execute("DROP TRIGGER IF EXISTS update_incidents_updated_at ON incidents;")
    op.execute("DROP TRIGGER IF EXISTS update_users_updated_at ON users;")
    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column();")

    op.drop_table("analytics_snapshots")
    op.drop_table("risk_zones")
    op.drop_table("near_miss_reports")
    op.drop_table("incident_media")
    op.drop_table("incidents")
    op.drop_table("users")

    # Drop enums
    for enum_name in ["nearmisstatus", "hazardtype", "mediatype", "incidentstatus", "incidentseverity", "incidenttype", "userrole"]:
        op.execute(f"DROP TYPE IF EXISTS {enum_name}")
