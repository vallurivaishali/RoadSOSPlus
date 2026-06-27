"""
Seed authority accounts into the database.

Run with:
    python -m app.scripts.seed_authorities

This script is idempotent — safe to run multiple times.
Authority accounts cannot be created via the public API.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.core.config import settings
from app.models.user import User, UserRole

AUTHORITY_ACCOUNTS = [
    {
        "email": "admin@roadsos.gov.in",
        "full_name": "Road Safety Administrator",
        "phone": "+91-11-23456789",
    },
    {
        "email": "analyst@roadsos.gov.in",
        "full_name": "Safety Data Analyst",
        "phone": "+91-11-23456790",
    },
    {
        "email": "inspector@roadsos.gov.in",
        "full_name": "Field Safety Inspector",
        "phone": "+91-11-23456791",
    },
]


def seed_authorities():
    db = SessionLocal()
    try:
        created = 0
        for account in AUTHORITY_ACCOUNTS:
            existing = db.query(User).filter(User.email == account["email"]).first()
            if existing:
                print(f"  ⏭  Already exists: {account['email']}")
                continue

            user = User(
                email=account["email"],
                hashed_password=hash_password(settings.AUTHORITY_SEED_PASSWORD),
                full_name=account["full_name"],
                phone=account["phone"],
                role=UserRole.AUTHORITY,
                is_active=True,
            )
            db.add(user)
            created += 1
            print(f"  ✅ Created authority: {account['email']}")

        db.commit()
        print(f"\n🎉 Seeding complete. {created} authority account(s) created.")
        print("\nAuthority credentials:")
        for account in AUTHORITY_ACCOUNTS:
            print(f"  Email: {account['email']}  |  Password: <from environment>")

    except Exception as e:
        db.rollback()
        print(f"❌ Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🌱 Seeding authority accounts...\n")
    seed_authorities()
