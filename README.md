<div align="center">
  
#  RoadSOS+

**A Next-Generation AI-Powered Road Safety Monitoring & Incident Management Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)
[![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini-FF4B4B?logo=google)](https://deepmind.google/technologies/gemini/)
[![Deployment](https://img.shields.io/badge/Deployed_on-Vercel_%7C_Railway-000000)](https://vercel.com/)

*Bridging the gap between citizens and authorities through real-time geospatial reporting and algorithmic risk analysis.*

[Live Demo](https://road-sos-plus-frno.vercel.app) · [Report Bug](https://github.com/vallurivaishali/RoadSOSPlus/issues) · [Request Feature](https://github.com/vallurivaishali/RoadSOSPlus/issues)

</div>

<br />

<details>
  <summary>📋 Table of Contents</summary>
  <ol>
    <li><a href="#-project-overview">Project Overview</a></li>
    <li><a href="#-problem-statement">Problem Statement</a></li>
    <li><a href="#-key-highlights">Key Highlights</a></li>
    <li><a href="#-live-demo">Live Demo</a></li>
    <li><a href="#-features">Features</a></li>
    <li><a href="#-tech-stack">Tech Stack</a></li>
    <li><a href="#-system-architecture">System Architecture</a></li>
    <li><a href="#-database-design">Database Design</a></li>
    <li><a href="#-project-structure">Project Structure</a></li>
    <li><a href="#-api-overview">API Overview</a></li>
    <li><a href="#-installation">Installation</a></li>
    <li><a href="#-environment-variables">Environment Variables</a></li>
    <li><a href="#-running-with-docker">Running with Docker</a></li>
    <li><a href="#-running-without-docker">Running without Docker</a></li>
    <li><a href="#-deployment">Deployment</a></li>
    <li><a href="#-security">Security</a></li>
    <li><a href="#-technical-challenges">Technical Challenges</a></li>
    <li><a href="#-future-improvements">Future Improvements</a></li>
    <li><a href="#-learning-outcomes">Learning Outcomes</a></li>
    <li><a href="#-author">Author</a></li>
  </ol>
</details>

---

##  Project Overview

RoadSOS+ is a comprehensive, full-stack platform architected to modernize municipal road safety. It serves two distinct audiences: Citizens who report road hazards and accidents using location services, and Authorities who utilize a command dashboard to triage incidents, analyze AI-processed summaries, and monitor algorithmically generated geographic risk zones.

##  Problem Statement

Traditional road safety infrastructure is highly reactive, relying on delayed post-accident reports or inefficient manual surveys. This allows severe infrastructural hazards (e.g., deep potholes, broken dividers, blind turns) to persist until fatal collisions occur. There is a critical engineering need for a proactive, crowdsourced platform that aggregates real-time data, processes it asynchronously via AI to categorize severity, and clusters incidents geospatially so municipalities can prioritize preventative maintenance.

##  Key Highlights

- **Full-stack architecture:** Strongly typed REST API (FastAPI/Pydantic) communicating with a responsive SPA (Next.js/React).
- **JWT Authentication:** Secure, stateless sessions stored locally and attached via Axios interceptors.
- **Role-Based Access Control:** Distinct dashboard and routing capabilities for `Citizen` vs `Authority` entities.
- **AI-powered incident analysis:** Asynchronous background processing utilizing Google Gemini LLM to extract structured telemetry (severity, incident type, summary) from raw text and images.
- **Interactive maps:** Client-side rendered maps using Leaflet to plot incidents and active risk zones dynamically.
- **PostgreSQL:** Relational data persistence with strict foreign key constraints and enumerated types.
- **Docker:** Complete multi-container orchestration for reproducible local development.
- **Railway & Vercel deployment:** Optimized startup scripts ensuring idempotent database migrations and seamless cloud hosting.

---

##  Live Demo

| Resource | Link |
|----------|------|
| **GitHub Repository** | [vallurivaishali/RoadSOSPlus](https://github.com/vallurivaishali/RoadSOSPlus) |
| **Frontend Application** | [road-sos-plus-frno.vercel.app](https://road-sos-plus-frno.vercel.app) |
| **Backend API** | [roadsosplus-production.up.railway.app](https://roadsosplus-production.up.railway.app) |
| **API Documentation (Swagger)** | [roadsosplus-production.up.railway.app/api/docs](https://roadsosplus-production.up.railway.app/api/docs) |

---

##  Features

###  Citizen Features
- **Geospatial Safety Map:** Real-time visualization of nearby accidents, hazards, and dynamically generated high-risk zones.
- **Rich Incident Reporting:** Multi-step submission form with automatic GPS coordinate binding and image uploads via Cloudinary.
- **Near-Miss Logging:** Dedicated endpoint for logging non-injury infrastructural hazards (e.g., severe waterlogging, missing signboards).
- **Emergency Services Router:** Haversine distance calculations pointing to the nearest (mocked) emergency facilities.

###  Authority Features
- **Command Center Dashboard:** High-level statistical visualizations of city-wide incident resolution rates.
- **Incident Triage Interface:** Data table to review citizen reports, verify AI severity ratings, and transition incident statuses (`pending` → `verified` → `resolved`).
- **Risk Zone Management:** View and manage algorithmically clustered areas that surpass safety thresholds.
- **Analytics Snapshots:** Daily aggregated metrics and statistical charts for data-driven municipal planning.

###  AI Features
- **Automated Triage:** Gemini LLM processes raw natural language and uploaded images to extract a structured JSON payload defining the incident type and prioritizing severity.
- **Asynchronous Execution:** AI inference is decoupled into FastAPI `BackgroundTasks` to ensure sub-100ms API response times for the client.

###  Map Features
- **Dynamic Leaflet Binding:** Custom React wrappers to bypass Next.js SSR constraints, ensuring smooth client-side interactions.
- **Geolocation Fallbacks:** Browser native `navigator.geolocation` integration with IP-based geolocation fallbacks.

###  Analytics
- **Data Snapshots:** A CRON-ready table structure (`analytics_snapshots`) designed to aggregate daily incident volumes, severely lowering dashboard query costs.

---

##  Tech Stack

| Domain | Technologies |
|--------|--------------|
| **Frontend** | Next.js 14 (App Router), React, TailwindCSS, Zustand, React-Leaflet, Axios |
| **Backend** | FastAPI, Python 3.12, Uvicorn, Pydantic |
| **Database** | PostgreSQL 15, SQLAlchemy 2.0, Alembic |
| **AI & Media**| Google Gemini AI, Cloudinary |
| **Auth & Security** | JWT (PyJWT), Bcrypt (Passlib), Next.js Edge Middleware |
| **DevOps** | Docker, Docker Compose, Railway, Vercel |

---

##  System Architecture

```mermaid
graph TD
    Client[Next.js Client]
    
    subgraph Frontend [Frontend Environment]
        Client -->|Zustand| State(State Management)
        Client -->|Leaflet| Maps(Browser Geolocation)
    end
    
    subgraph Backend [FastAPI Backend]
        API[REST API layer]
        Auth[JWT Auth Middleware]
        Services[Business Logic Services]
        Tasks[Background Tasks]
        
        API --> Auth
        Auth --> Services
        Services --> Tasks
    end
    
    subgraph External [External Services]
        DB[(PostgreSQL)]
        AI[Google Gemini]
        CDN[Cloudinary]
    end
    
    Client -- "HTTPS (JSON/FormData)" --> API
    Services -- "SQLAlchemy ORM" --> DB
    Tasks -- "REST" --> AI
    Services -- "Direct Stream" --> CDN
```

---

##  Database Design

```mermaid
erDiagram
    users ||--o{ incidents : "reports/verifies"
    users ||--o{ near_miss_reports : "reports"
    incidents ||--o{ incident_media : "contains"

    users {
        UUID id PK
        VARCHAR email
        VARCHAR hashed_password
        VARCHAR full_name
        userrole role
        BOOLEAN is_active
    }
    
    incidents {
        UUID id PK
        UUID reporter_id FK
        UUID verified_by_id FK
        FLOAT latitude
        FLOAT longitude
        TEXT description
        incidentstatus status
        incidentseverity ai_severity
        incidenttype ai_incident_type
    }
    
    incident_media {
        UUID id PK
        UUID incident_id FK
        VARCHAR cloudinary_url
        mediatype media_type
    }
    
    near_miss_reports {
        UUID id PK
        UUID reporter_id FK
        FLOAT latitude
        FLOAT longitude
        hazardtype hazard_type
        BOOLEAN injury_involved
    }
    
    risk_zones {
        UUID id PK
        FLOAT center_latitude
        FLOAT center_longitude
        FLOAT risk_score
        INTEGER accident_count
    }
    
    analytics_snapshots {
        UUID id PK
        DATE snapshot_date
        INTEGER total_incidents
        INTEGER active_incidents
    }
```

---

##  Project Structure

<details>
  <summary>Click to expand folder tree</summary>

```text
roadsosplus/
├── frontend/                 # Next.js Application
│   ├── src/
│   │   ├── app/              # App Router pages and Edge Middleware
│   │   ├── components/       # Reusable UI, Layout, and dynamic Map components
│   │   ├── lib/              # Axios interceptors and utility functions
│   │   └── store/            # Zustand global state (authStore, locationStore)
│   ├── public/               # Static assets
│   ├── tailwind.config.ts
│   └── package.json
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── core/             # Pydantic BaseSettings, Database Engine, JWT Logic
│   │   ├── models/           # SQLAlchemy Declarative Models
│   │   ├── routers/          # API Route definitions
│   │   ├── schemas/          # Pydantic request/response models
│   │   ├── scripts/          # DB connection wait scripts & seeders
│   │   └── services/         # Decoupled business logic (AI, Risk Engine)
│   ├── migrations/           # Alembic revision history
│   ├── Dockerfile            # Python 3.12 slim container definition
│   ├── start.sh              # Idempotent cloud deployment script
│   └── requirements.txt
├── docker-compose.yml        # Multi-container local orchestration
└── LICENSE                   # MIT License
```
</details>

---

##  API Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/v1/auth/login` | Authenticate user and return JWT | No |
| `POST` | `/api/v1/auth/register`| Register new Citizen account | No |
| `GET`  | `/api/v1/users/me` | Fetch active user profile | Yes |
| `POST` | `/api/v1/incidents/` | Submit new incident & trigger AI | Yes (Citizen) |
| `GET`  | `/api/v1/incidents/` | Retrieve paginated/spatial incidents| Yes |
| `PUT`  | `/api/v1/incidents/{id}/status`| Update incident triage status | Yes (Authority)|
| `POST` | `/api/v1/media/upload` | Stream media to Cloudinary CDN | Yes |
| `POST` | `/api/v1/near-miss/` | Log a non-injury road hazard | Yes (Citizen) |
| `GET`  | `/api/v1/risk-zones/`| Retrieve calculated hotspot clusters| Yes |

*(Complete Swagger documentation available at the `/api/docs` endpoint on the live deployment).*

---

##  Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (`postgresql://user:pass@host:port/db`) |
| `SECRET_KEY` | 32-byte hexadecimal string for signing JWTs |
| `AUTHORITY_SEED_PASSWORD`| Fallback password used when seeding the initial admin account |
| `GEMINI_API_KEY` | Google AI Studio API key |
| `CLOUDINARY_*` | Keys for the Cloudinary image hosting CDN |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Base URL pointing to the FastAPI backend (e.g., `https://roadsosplus-production.up.railway.app/api/v1`) |

---

##  Running with Docker

The fastest way to spin up the entire application architecture locally is via Docker Compose.

1. Clone the repository and navigate to the root directory.
2. Ensure environment variables are configured.
3. Execute:
   ```bash
   docker-compose up --build -d
   ```
4. **Access points:**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`
   - DB: Port `5432`

*Note: The orchestration handles Postgres initialization, executes Alembic migrations, and conditionally seeds the database without manual intervention.*

---

##  Running without Docker

1. **Database:** Ensure a local instance of PostgreSQL is running.
2. **Backend:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   alembic upgrade head
   python -m app.scripts.seed_authorities
   python -m app.scripts.seed_demo_data
   uvicorn app.main:app --reload
   ```
3. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

##  Deployment

### Backend (Railway)
The backend is configured and deployed effortlessly on [Railway](https://railway.app/).
1. Provision a PostgreSQL database on Railway.
2. Link the backend repository.
3. Add all required Environment Variables.
4. The custom `start.sh` script automatically handles database readiness, runs Alembic migrations, and conditionally seeds data upon deployment to ensure a stable, idempotent boot lifecycle.

### Frontend (Vercel)
The Next.js application is hosted on [Vercel](https://vercel.com/).
- `NEXT_PUBLIC_API_URL` securely maps outgoing Axios requests to the live Railway backend domain.
- Edge Middleware correctly handles token validation checks before allowing layout renders, keeping dashboards protected.

---

##  Security

- **JWT Authentication:** Completely stateless authentication. Tokens are stored locally and attached to Axios `Authorization` headers.
- **Password Hashing:** Passwords are cryptographically hashed using the `bcrypt` algorithm via `passlib`. Plaintext passwords are never stored or logged.
- **Role-Based Access Control (RBAC):** FastAPI endpoints utilize dependency injection (`Depends(get_current_user)`) to strictly authorize requests based on the JWT payload's `role` claim.
- **Request Validation:** Pydantic strictly types and cleanses all incoming JSON payloads, returning detailed `422 Unprocessable Entity` responses for malformed data to prevent injection vulnerabilities.
- **Environment Boundaries:** `os.getenv` overrides combined with Pydantic V2 schemas guarantee that infrastructure-level variables securely overwrite local defaults.

---

##  Technical Challenges

1. **Leaflet Server-Side Rendering (SSR) Conflicts:**
   *Challenge:* Next.js attempts to pre-render pages on the server, but Leaflet directly manipulates the browser's `window` object, causing fatal build errors.
   *Solution:* Architected dynamic React wrappers utilizing `next/dynamic` with `ssr: false`, ensuring spatial maps only hydrate on the client.

2. **Asynchronous LLM Processing:**
   *Challenge:* Sending image payloads to Google Gemini for processing blocks the main thread, resulting in unacceptable API response times for end-users submitting reports.
   *Solution:* Integrated FastAPI's `BackgroundTasks`. The API saves the incident to Postgres, returns a `202 Accepted` to the client instantly, and processes the AI inference asynchronously, updating the database record upon completion.

3. **Idempotent Cloud Initialization:**
   *Challenge:* Cloud deployments (like Railway) restart containers frequently. Running seed scripts blindly results in duplicate data or fatal primary key violations.
   *Solution:* Engineered a custom `start.sh` entrypoint that queries the PostgreSQL `information_schema` to mathematically verify table creation and row cardinality before deciding whether to execute seeding logic.

4. **SQLAlchemy 2.0 Dialect Deprecation on Cloud Hosts:**
   *Challenge:* Cloud providers often inject `postgres://` URLs, which SQLAlchemy 2.0 formally deprecated in favor of `postgresql://`, causing instant crash loops.
   *Solution:* Implemented a Pydantic V2 `@model_validator` interception layer to detect and silently mutate legacy dialect schemes before the Database Engine is instantiated, ensuring uninterrupted boots.

---

##  Future Improvements

- **WebSockets:** Implement real-time bi-directional streaming so the Authority dashboard instantly receives new incidents without manual polling.
- **PostGIS:** Migrate spatial data columns from standard `FLOAT` to PostGIS `GEOGRAPHY` types to allow for vastly superior indexing and complex bounding-box queries.
- **Caching Layer:** Introduce Redis to cache the `analytics_snapshots` and risk zones to minimize database load during peak traffic.

---

##  Learning Outcomes

Building this platform provided extensive exposure to:
- Architecting decoupled RESTful systems using modern Python (FastAPI/Pydantic V2) and TypeScript (Next.js).
- Deeply integrating AI (LLMs) into traditional CRUD workflows to extract deterministic telemetry from non-deterministic user inputs.
- Managing complex DevOps lifecycles, including Docker multi-stage builds, Alembic schema migrations, and idempotent cloud startup scripts.
- Mastering geospatial data visualization within the React ecosystem.

---

##  Author

**Vaishali Valluri**
- **GitHub:** [*https://github.com/vallurivaishali*](#)
- **LinkedIn:** [*https://www.linkedin.com/in/valluri-vaishali-478039363?utm_source=share_via&utm_content=profile&utm_medium=member_android*](#)

<br />
<div align="center">
  <i>If you found this repository helpful, please consider leaving a ⭐!</i>
</div>
