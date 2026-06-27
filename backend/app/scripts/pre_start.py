import time
import logging
import sys
from sqlalchemy import text
from app.core.database import SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

max_tries = 60
wait_seconds = 1

def init():
    for attempt in range(max_tries):
        try:
            db = SessionLocal()
            # Try to execute a simple query
            db.execute(text("SELECT 1"))
            db.close()
            logger.info("✅ Database is ready!")
            return
        except Exception as e:
            logger.warning(f"⏳ Database not ready yet... (Attempt {attempt+1}/{max_tries})")
            time.sleep(wait_seconds)
    logger.error("❌ Database failed to start")
    sys.exit(1)

if __name__ == "__main__":
    logger.info("Initializing database connection...")
    init()
