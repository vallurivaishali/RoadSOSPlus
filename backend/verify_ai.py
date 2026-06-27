import requests
import time
import json

base_url = "http://localhost:8000/api/v1"

# 1. Login
print("Logging in...")
res = requests.post(f"{base_url}/auth/login", json={"email": "citizen0@delhi.in", "password": "Password@123"})
if res.status_code != 200:
    print("Login failed:", res.text)
    exit(1)

token = res.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 2. Report Incident
print("Reporting incident...")
payload = {
    "latitude": 28.61,
    "longitude": 77.22,
    "description": "Massive collision between two cars causing a fire. Need an ambulance.",
    "media_base64": []
}

res = requests.post(f"{base_url}/incidents/", json=payload, headers=headers)
if res.status_code != 201:
    print("Report failed:", res.text)
    exit(1)

inc_id = res.json()["data"]["id"]
print(f"Incident created: {inc_id}. Waiting for AI to process...")

# 3. Wait and fetch
time.sleep(3) # Wait for background task
res = requests.get(f"{base_url}/incidents/", headers=headers)
for inc in res.json()["data"]:
    if inc["id"] == inc_id:
        print("AI Processed:", inc["ai_processed"])
        print("AI Summary:", inc["ai_summary"])
        break
