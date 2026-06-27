"""
Risk Engine — Explainable Rule-Based Algorithm
"""
import math
from typing import List, Dict, Any
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import delete

from app.models.incident import Incident, IncidentStatus, IncidentSeverity, IncidentType
from app.models.near_miss import NearMissReport, NearMissStatus, HazardType
from app.models.risk_zone import RiskZone


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points on Earth in meters."""
    R = 6371000  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi / 2)**2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _generate_recommendations(categories: Dict[str, int], total_points: int) -> List[str]:
    """Generate authority recommendations based on the most common categories in a cluster."""
    recommendations = []
    
    # Sort categories by frequency
    sorted_cats = sorted(categories.items(), key=lambda x: x[1], reverse=True)
    
    for cat, count in sorted_cats:
        # Only recommend if it makes up a significant portion of the cluster
        if count / max(1, total_points) >= 0.2:
            if cat in [IncidentType.PEDESTRIAN.value]:
                recommendations.append("Review crosswalk safety and pedestrian signals.")
            elif cat in [HazardType.POOR_LIGHTING.value]:
                recommendations.append("Install or repair streetlights in this corridor.")
            elif cat in [HazardType.POTHOLE.value, HazardType.WATERLOGGING.value]:
                recommendations.append("Schedule urgent road surface maintenance.")
            elif cat in [HazardType.FREQUENT_SPEEDING.value]:
                recommendations.append("Deploy traffic calming measures (speed bumps, cameras).")
            elif cat in [HazardType.BLIND_TURN.value, HazardType.DANGEROUS_INTERSECTION.value]:
                recommendations.append("Install warning signage and review intersection visibility.")
    
    if not recommendations:
        recommendations.append("Increase general traffic patrol presence during peak hours.")
        
    return list(set(recommendations))  # Unique


def recalculate_risk_zones(db: Session) -> int:
    """
    Core algorithm to recalculate hotspots using an explainable rule-based approach.
    Returns the number of new risk zones generated.
    """
    now = datetime.now(timezone.utc)
    sixty_days_ago = now - timedelta(days=60)
    thirty_days_ago = now - timedelta(days=30)

    # 1. Fetch relevant data
    incidents = db.query(Incident).filter(
        Incident.status == IncidentStatus.VERIFIED,
        Incident.created_at >= sixty_days_ago
    ).all()
    
    near_misses = db.query(NearMissReport).filter(
        NearMissReport.status != NearMissStatus.DISMISSED,
        NearMissReport.created_at >= sixty_days_ago
    ).all()

    all_points = []
    
    for inc in incidents:
        all_points.append({
            "type": "incident",
            "lat": inc.latitude,
            "lng": inc.longitude,
            "severity": inc.ai_severity,
            "category": inc.ai_incident_type.value if inc.ai_incident_type else "other",
            "date": inc.created_at
        })
        
    for nm in near_misses:
        all_points.append({
            "type": "near_miss",
            "lat": nm.latitude,
            "lng": nm.longitude,
            "injury": nm.injury_involved,
            "category": nm.hazard_type.value if nm.hazard_type else "other",
            "date": nm.created_at
        })

    if not all_points:
        return 0

    # 2. Geographic Clustering (O(N^2) naive clustering, fine for MVP)
    # A point belongs to a cluster if it's within 500m of the cluster center
    clusters = []
    CLUSTER_RADIUS = 500  # meters

    for p in all_points:
        assigned = False
        for cluster in clusters:
            dist = haversine_distance(p["lat"], p["lng"], cluster["center_lat"], cluster["center_lng"])
            if dist <= CLUSTER_RADIUS:
                cluster["points"].append(p)
                # Recalculate center (simple average)
                cluster["center_lat"] = sum(pt["lat"] for pt in cluster["points"]) / len(cluster["points"])
                cluster["center_lng"] = sum(pt["lng"] for pt in cluster["points"]) / len(cluster["points"])
                assigned = True
                break
        
        if not assigned:
            clusters.append({
                "center_lat": p["lat"],
                "center_lng": p["lng"],
                "points": [p]
            })

    # Clear old auto-generated risk zones
    db.execute(delete(RiskZone).where(RiskZone.created_by_seed == False))
    db.commit()

    # 3. Rule-Based Scoring & Analysis
    zones_created = 0
    for i, cluster in enumerate(clusters):
        points = cluster["points"]
        if len(points) < 2:  # Ignore isolated single points to reduce noise
            continue
            
        score = 0
        accidents = 0
        near_misses_count = 0
        high_severity = 0
        
        current_30_count = 0
        previous_30_count = 0
        
        categories: Dict[str, int] = {}

        for p in points:
            # Trend counts
            if p["date"] >= thirty_days_ago:
                current_30_count += 1
            else:
                previous_30_count += 1
                
            # Categories
            cat = p.get("category", "other")
            categories[cat] = categories.get(cat, 0) + 1

            # Scoring
            if p["type"] == "incident":
                accidents += 1
                sev = p.get("severity")
                if sev == IncidentSeverity.HIGH:
                    score += 10
                    high_severity += 1
                elif sev == IncidentSeverity.MEDIUM:
                    score += 5
                else:
                    score += 2
            else:
                near_misses_count += 1
                if p.get("injury"):
                    score += 3
                else:
                    score += 1

        # Normalize Risk Score (Cap at 100)
        # Assuming ~30 points in a 500m radius is a maximum 100/100 risk
        final_score = min((score / 30.0) * 100, 100.0)
        
        # Calculate Trend
        if previous_30_count == 0:
            if current_30_count > 0:
                trend_pct = 100
                trend_dir = "up"
            else:
                trend_pct = 0
                trend_dir = "flat"
        else:
            diff = current_30_count - previous_30_count
            trend_pct = round((abs(diff) / previous_30_count) * 100)
            trend_dir = "up" if diff > 0 else ("down" if diff < 0 else "flat")

        # Generate Recommendations
        recommendations = _generate_recommendations(categories, len(points))
        
        # Save to DB
        zone = RiskZone(
            name=f"Hotspot Zone #{i+1}",
            description=f"Auto-generated hotspot cluster with {len(points)} total events.",
            center_latitude=cluster["center_lat"],
            center_longitude=cluster["center_lng"],
            radius_meters=CLUSTER_RADIUS,
            risk_score=round(final_score, 1),
            accident_count=accidents,
            near_miss_count=near_misses_count,
            high_severity_count=high_severity,
            created_by_seed=False,
            last_calculated_at=now,
            contributing_factors={
                "trend_direction": trend_dir,
                "trend_percentage": trend_pct,
                "common_categories": list(categories.keys())[:3], # Top 3
                "recommendations": recommendations
            }
        )
        db.add(zone)
        zones_created += 1

    db.commit()
    return zones_created

def get_risk_zones(db: Session, limit: int = 50) -> List[RiskZone]:
    return db.query(RiskZone).filter(RiskZone.is_active == True).order_by(RiskZone.risk_score.desc()).limit(limit).all()
