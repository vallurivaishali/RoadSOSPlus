import os
import random
import uuid
from datetime import datetime, timedelta, timezone

from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.models.incident import Incident, IncidentStatus, IncidentSeverity, IncidentType
from app.models.near_miss import NearMissReport, NearMissStatus, HazardType
from app.models.risk_zone import RiskZone
from app.core.security import hash_password as get_password_hash
from app.services.risk_engine import recalculate_risk_zones

# --- Configuration ---
# Anchoring coordinates around New Delhi, India
DELHI_CENTERS = [
    {"name": "Connaught Place", "lat": 28.6304, "lng": 77.2177},
    {"name": "India Gate", "lat": 28.6129, "lng": 77.2295},
    {"name": "Hauz Khas", "lat": 28.5494, "lng": 77.2001},
    {"name": "Karol Bagh", "lat": 28.6519, "lng": 77.1901},
]

# Random spread (roughly 0.01 degrees is ~1km)
SPREAD = 0.005 

INCIDENT_SCENARIOS = [
    ("Auto rickshaw overturned after hitting a deep pothole", IncidentType.COLLISION, IncidentSeverity.HIGH),
    ("Two-wheeler skidded on waterlogged road during monsoon", IncidentType.COLLISION, IncidentSeverity.MEDIUM),
    ("Pedestrian struck by speeding bike crossing without signal", IncidentType.PEDESTRIAN, IncidentSeverity.HIGH),
    ("Minor fender bender at crowded traffic signal", IncidentType.COLLISION, IncidentSeverity.LOW),
    ("E-rickshaw collided with a parked car", IncidentType.COLLISION, IncidentSeverity.LOW),
    ("Bicycle hit by turning truck in blind spot", IncidentType.COLLISION, IncidentSeverity.HIGH),
    ("Bus broke down causing massive traffic jam", IncidentType.OTHER, IncidentSeverity.LOW),
    ("Street dog suddenly crossed the road causing sudden braking and rear-end collision", IncidentType.COLLISION, IncidentSeverity.MEDIUM),
]

NEAR_MISS_SCENARIOS = [
    ("No streetlights working, almost hit a barricade", HazardType.POOR_LIGHTING, False),
    ("Massive uncovered pothole hidden by rain water", HazardType.POTHOLE, False),
    ("Blind turn with overgrown trees blocking view", HazardType.BLIND_TURN, False),
    ("Cars driving wrong side on one-way street", HazardType.FREQUENT_SPEEDING, False),
    ("Broken divider exposing sharp metal", HazardType.BROKEN_DIVIDER, True), # Minor scrape
    ("Missing signboard at dangerous T-junction", HazardType.MISSING_SIGNBOARD, False),
    ("Severe waterlogging hiding an open manhole", HazardType.WATERLOGGING, False),
]

def generate_random_coords(center_lat, center_lng, spread=SPREAD):
    return (
        center_lat + random.uniform(-spread, spread),
        center_lng + random.uniform(-spread, spread)
    )

def random_date(days_back=60):
    return datetime.now(timezone.utc) - timedelta(days=random.randint(0, days_back), hours=random.randint(0, 23))

def main():
    db = SessionLocal()
    
    print("🧹 Cleaning up old demo data...")
    
    # Delete old risk zones
    db.query(RiskZone).delete()
    
    # Delete citizens and cascade their incidents
    citizens = db.query(User).filter(User.role == UserRole.CITIZEN).all()
    for c in citizens:
        db.delete(c)
        
    db.commit()
    print("✅ Database wiped.")
    
    print("👤 Generating 5 mock citizens...")
    citizen_users = []
    for i in range(5):
        user = User(
            id=uuid.uuid4(),
            email=f"citizen{i}@delhi.in",
            hashed_password=get_password_hash("Password@123"),
            full_name=f"Rahul Sharma {i}",
            phone=f"+91 987654321{i}",
            role=UserRole.CITIZEN,
            is_active=True
        )
        db.add(user)
        citizen_users.append(user)
    db.commit()

    print(f"🚗 Generating 45 Incidents and 35 Near Misses clustered around New Delhi...")
    
    # Generate Incidents
    for _ in range(45):
        center = random.choice(DELHI_CENTERS)
        lat, lng = generate_random_coords(center["lat"], center["lng"])
        desc, itype, sev = random.choice(INCIDENT_SCENARIOS)
        reporter = random.choice(citizen_users)
        
        status = random.choice([IncidentStatus.VERIFIED, IncidentStatus.VERIFIED, IncidentStatus.PENDING, IncidentStatus.RESOLVED])
        
        inc = Incident(
            reporter_id=reporter.id,
            latitude=lat,
            longitude=lng,
            address=f"Near {center['name']}, New Delhi",
            description=desc,
            ai_processed=True,
            ai_summary=f"AI Summary: {desc}. Detected as {sev.value} priority.",
            ai_severity=sev,
            ai_incident_type=itype,
            status=status,
            created_at=random_date()
        )
        db.add(inc)

    # Generate Near Misses
    for _ in range(35):
        center = random.choice(DELHI_CENTERS)
        # Tighter clustering for near misses around same spots
        lat, lng = generate_random_coords(center["lat"], center["lng"], SPREAD/2)
        desc, htype, injury = random.choice(NEAR_MISS_SCENARIOS)
        reporter = random.choice(citizen_users)
        
        status = random.choice([NearMissStatus.ACKNOWLEDGED, NearMissStatus.PENDING])
        
        nm = NearMissReport(
            reporter_id=reporter.id,
            latitude=lat,
            longitude=lng,
            address=f"Hotspot near {center['name']}",
            hazard_type=htype,
            description=desc,
            injury_involved=injury,
            status=status,
            created_at=random_date()
        )
        db.add(nm)
        
    db.commit()
    print("✅ Mock data inserted.")
    
    print("⚙️  Triggering Risk Engine clustering...")
    num_zones = recalculate_risk_zones(db)
    print(f"✅ Risk Engine generated {num_zones} Hotspots based on the New Delhi data.")

    print("\n🎉 Seed Data Complete!")
    print("You can now log in as authority1@roadsos.com or citizen0@delhi.in to view the maps and dashboards.")

if __name__ == "__main__":
    main()
