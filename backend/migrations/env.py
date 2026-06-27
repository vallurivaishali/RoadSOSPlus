"""
Alembic env.py — configured for SQLAlchemy models autogenerate.

Key: imports all models before metadata is referenced so Alembic
can detect the full schema and generate accurate migrations.
"""
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import os
import sys

# Add backend root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.database import Base

# Import all models to register them with Base.metadata
import app.models  # noqa: F401

config = context.config

# Override sqlalchemy.url with our Settings value (respects .env)
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    # Get configuration from alembic.ini
    configuration = config.get_section(config.config_ini_section, {})
    # FORCIBLY override sqlalchemy.url from our settings
    configuration["sqlalchemy.url"] = config.get_main_option("sqlalchemy.url")
    
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
