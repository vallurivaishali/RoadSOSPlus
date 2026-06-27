#!/bin/sh
# Do not use set -e immediately so we can capture and print detailed errors
echo "========================================================"
echo "🚀 INITIATING RUNTIME DEPLOYMENT AUDIT"
echo "========================================================"

# 1. Verify Effective DATABASE_URL
echo "🔍 Checking effective DATABASE_URL..."
python -c "
from app.core.config import settings
url = settings.DATABASE_URL
# Mask password for security
masked_url = url
if '@' in url:
    protocol, rest = url.split('://', 1)
    creds, host_db = rest.split('@', 1)
    if ':' in creds:
        user, _ = creds.split(':', 1)
        masked_url = f'{protocol}://{user}:***@{host_db}'
print(f'EFFECTIVE DATABASE_URL: {masked_url}')
"

# 2. Wait for Database
echo "⏳ Waiting for PostgreSQL database to become available..."
python app/scripts/pre_start.py
PRE_START_STATUS=$?
if [ $PRE_START_STATUS -ne 0 ]; then
    echo "❌ pre_start.py FAILED with status $PRE_START_STATUS"
    exit $PRE_START_STATUS
fi
echo "✅ pre_start.py SUCCEEDED."

# 3. Verify Alembic Migration Status
echo "🔍 Checking Alembic configuration and pending migrations..."
alembic history || echo "⚠️ Warning: alembic history command failed"
alembic current || echo "⚠️ Warning: alembic current command failed"

# 4. Execute Migrations
echo "🔄 Running Alembic migrations (alembic upgrade head)..."
alembic upgrade head
ALEMBIC_STATUS=$?
if [ $ALEMBIC_STATUS -ne 0 ]; then
    echo "❌ Alembic migrations FAILED with status $ALEMBIC_STATUS"
    exit $ALEMBIC_STATUS
fi
echo "✅ Alembic migrations SUCCEEDED."

# 5. Check Seeding Requirement
echo "🔍 Checking if database needs seeding..."
python -c "
import sys
import traceback
from app.core.database import SessionLocal
from app.models.user import User
from sqlalchemy import text
try:
    db = SessionLocal()
    # Verify tables actually exist
    res = db.execute(text(\"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')\")).scalar()
    if not res:
        print('❌ FATAL: Users table does not exist even after migrations!')
        sys.exit(2)
        
    count = db.query(User).count()
    if count == 0:
        print('🌱 Database is empty (0 users). Triggering seed.')
        sys.exit(0)
    else:
        print(f'✅ Database already contains {count} user(s). Skipping seed.')
        sys.exit(1)
except Exception as e:
    print('❌ FATAL: Error during database check:')
    traceback.print_exc()
    sys.exit(2)
"
SEED_CHECK_STATUS=$?

# 6. Execute Seeding
if [ $SEED_CHECK_STATUS -eq 0 ]; then
    echo "🌱 Running seed scripts..."
    python -m app.scripts.seed_authorities
    AUTH_STATUS=$?
    python -m app.scripts.seed_demo_data
    DEMO_STATUS=$?
    if [ $AUTH_STATUS -eq 0 ] && [ $DEMO_STATUS -eq 0 ]; then
        echo "✅ Seed scripts SUCCEEDED."
    else
        echo "❌ Seed scripts FAILED (auth: $AUTH_STATUS, demo: $DEMO_STATUS)"
        exit 1
    fi
elif [ $SEED_CHECK_STATUS -eq 2 ]; then
    echo "❌ Seeding check encountered a fatal error. Aborting."
    exit 1
fi

echo "========================================================"
echo "🚀 STARTING FASTAPI"
echo "========================================================"
exec uvicorn app.main:app --host 0.0.0.0 --port 8000

