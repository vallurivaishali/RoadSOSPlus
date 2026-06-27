"""
AI Service.

Analyzes incident descriptions and media using Gemini 1.5 Flash.
Returns structured JSON data for rich UI rendering.
If GEMINI_API_KEY is not set, returns a robust mock JSON response.
"""
import asyncio
import json
import logging
from app.core.config import settings
from app.models.incident import IncidentSeverity, IncidentType

logger = logging.getLogger(__name__)

try:
    import google.generativeai as genai
    if settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)
except ImportError:
    pass

PROMPT_INSTRUCTIONS = """
You are an expert AI Road Safety Assistant.
Analyze the user's report description and any provided images to generate a comprehensive safety assessment.
You MUST respond with a strict JSON object containing EXACTLY the following keys:
- "confidence_score": (int) 0 to 100 based on detail provided.
- "detected_objects": (list of strings) objects involved (e.g. ["car", "debris", "pedestrian"]).
- "damage_assessment": (string) estimated property/infrastructure damage.
- "recommended_actions": (list of strings) steps for authorities or citizens.
- "emergency_guidance": (string) immediate safety advice.
- "road_safety_insights": (string) long-term analytical insight about this hazard type.
- "severity": (string) EXACTLY one of: "low", "medium", "high".
- "incident_type": (string) EXACTLY one of: "collision", "pedestrian", "motorcycle", "vehicle_breakdown", "road_hazard", "flood", "other".

Ensure the JSON is raw and unformatted. Do not include markdown formatting (like ```json).
"""

async def analyze_incident(description: str, media_url: str | None) -> dict:
    """
    Call Gemini API to analyze the incident and return structured JSON summary.
    """
    if not settings.GEMINI_API_KEY:
        # Simulate network delay for mock
        await asyncio.sleep(2)
        
        # Fallback Mock Logic
        text = description.lower()
        if "fire" in text or "death" in text or "blood" in text or "ambulance" in text:
            severity = IncidentSeverity.HIGH
            guidance = "Call emergency services immediately. Do not move injured persons."
            damage = "Severe potential damage"
        elif "scratch" in text or "minor" in text:
            severity = IncidentSeverity.LOW
            guidance = "Move vehicles to shoulder if possible. Exchange insurance information."
            damage = "Minor cosmetic damage"
        else:
            severity = IncidentSeverity.MEDIUM
            guidance = "Turn on hazard lights. Stay clear of active traffic."
            damage = "Moderate structural damage"

        if "pedestrian" in text:
            inc_type = IncidentType.PEDESTRIAN
            objects = ["pedestrian", "vehicle"]
        elif "bike" in text or "motorcycle" in text:
            inc_type = IncidentType.MOTORCYCLE
            objects = ["motorcycle", "vehicle"]
        elif "pothole" in text or "debris" in text:
            inc_type = IncidentType.ROAD_HAZARD
            objects = ["road surface", "debris"]
        else:
            inc_type = IncidentType.COLLISION
            objects = ["multiple vehicles"]

        mock_json = {
            "confidence_score": 85,
            "detected_objects": objects,
            "damage_assessment": damage,
            "recommended_actions": [
                "Dispatch nearest traffic unit",
                "Update routing for incoming traffic",
                "Assess road integrity post-cleanup"
            ],
            "emergency_guidance": guidance,
            "road_safety_insights": "Historical data suggests poor lighting or weather conditions often contribute to this specific type of incident in similar urban corridors."
        }

        return {
            "ai_summary": json.dumps(mock_json),
            "severity": severity,
            "incident_type": inc_type,
            "contributing_factors": {}
        }

    # Use Gemini API
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"{PROMPT_INSTRUCTIONS}\n\nUser Description: {description}"
        if media_url:
            prompt += f"\nMedia URL provided: {media_url} (Assume the user uploaded an image depicting this description)"
            
        # For a hackathon, we pass the text prompt. 
        # If we had actual bytes or a generic URL accessible by Gemini, we could pass it in.
        # Here we instruct it to assume the contents.
        
        # We need an async call, but google-generativeai isn't fully native async yet.
        # We'll run it in a threadpool to prevent blocking the async loop.
        response = await asyncio.to_thread(model.generate_content, prompt)
        
        response_text = response.text.strip()
        
        # Clean markdown if model outputs it
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        data = json.loads(response_text)
        
        # Validate Enum values
        severity_val = data.get("severity", "medium").lower()
        try:
            severity = IncidentSeverity(severity_val)
        except ValueError:
            severity = IncidentSeverity.MEDIUM
            
        type_val = data.get("incident_type", "other").lower()
        try:
            inc_type = IncidentType(type_val)
        except ValueError:
            inc_type = IncidentType.OTHER
            
        # Clean up the output to only store the display data
        if "severity" in data: del data["severity"]
        if "incident_type" in data: del data["incident_type"]

        return {
            "ai_summary": json.dumps(data),
            "severity": severity,
            "incident_type": inc_type,
            "contributing_factors": {}
        }
        
    except Exception as e:
        logger.error(f"Gemini AI processing failed: {e}")
        # Fallback to empty string on failure to avoid blocking the DB commit
        return {
            "ai_summary": "AI Analysis failed to process this report.",
            "severity": IncidentSeverity.MEDIUM,
            "incident_type": IncidentType.OTHER,
            "contributing_factors": {}
        }
