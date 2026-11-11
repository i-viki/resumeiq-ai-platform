# ResumeIQ Platform

[![Java](https://img.shields.io/badge/Java-21%20LTS-18181b?logo=openjdk&logoColor=ED8B00&labelColor=101012)](https://adoptium.net)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.0-18181b?logo=springboot&logoColor=6DB33F&labelColor=101012)](https://spring.io)
[![React](https://img.shields.io/badge/React-18.3-18181b?logo=react&logoColor=61DAFB&labelColor=101012)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-18181b?logo=typescript&logoColor=3178C6&labelColor=101012)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-18181b?logo=tailwindcss&logoColor=38B2AC&labelColor=101012)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-6.4-18181b?logo=vite&logoColor=9135FF&labelColor=101012)](https://vite.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-18181b?logo=postgresql&logoColor=4169E1&labelColor=101012)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-18181b?logo=docker&logoColor=2496ED&labelColor=101012)](https://www.docker.com)
[![Gemini](https://img.shields.io/badge/Google_Gemini-AI-18181b?logo=google-gemini&logoColor=4285F4&labelColor=101012)](https://deepmind.google/technologies/gemini/)
[![JWT](https://img.shields.io/badge/Security-JWT-18181b?logo=jsonwebtokens&logoColor=FFFFFF&labelColor=101012)](https://jwt.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An enterprise-grade **SaaS ATS intelligence and resume optimization engine** pairing a reactive **Spring Boot 3.3 / Java 21 backend** with a refined **React 18 TypeScript dashboard**. Powered by **Google Gemini AI** and **Apache PDFBox**, the platform evaluates candidate resumes against complex job descriptions in real-time, executing multi-weighted scoring algorithms, skill gap analysis, eager refresh-token lifecycle management, and actionable career roadmap recommendations.

---

## Key Architecture Pillars

- **Asynchronous ATS Scoring Engine (`com.resumeiq.service.AtsScoreService`):**
  Non-blocking `@EnableAsync` analysis pipeline computing comprehensive 5-vector ATS compatibility scores ($S_{\text{total}} = \sum w_i \cdot s_i$) in under 3.5 seconds.
- **Dual-Stream Document Ingestion (`com.resumeiq.service.ResumeParsingService`):**
  Streamlined PDF ingestion powered by Apache PDFBox that cleans, normalizes, and extracts structured semantic resume sections without text corruption.
- **Gemini Skill Gap Attribution (`com.resumeiq.service.GeminiAiService`):**
  High-speed contextual inference via Google Gemini API extracting job description competencies and categorizing candidate deficits into missing critical skills and weak keywords.
- **Eager Refresh Token Security Architecture (`com.resumeiq.security`):**
  Dual-token system featuring short-lived access JWTs and database-persisted UUID refresh tokens (`RefreshToken`), paired with client-side eager auto-renewal 10 seconds before expiration.
- **Role-Based Clearance Matrix (`com.resumeiq.config.SecurityConfig`):**
  Four-tier authorization hierarchy separating `JOB_SEEKER`, `RECRUITER`, `ENTERPRISE`, and `ADMIN` personas with built-in seeder routines.

---

## System Architecture

```mermaid
flowchart TB
    subgraph CLIENT["Client Tier (React 18 / TypeScript)"]
        UI["React 18 + Tailwind Dashboard<br/>Port: 5173 (or 80 via Nginx)"]
        AUTH_CTX["AuthContext Engine<br/>• Eager Silent Refresh Timer<br/>• LocalStorage Token Vault"]
        UI <--> AUTH_CTX
    end

    subgraph EDGE["Reverse Proxy & Gateway"]
        NGINX["Nginx Edge Container<br/>Port: 80"]
        SEC_FILTER["Spring Security 6.3 Filter<br/>• Bearer JWT Extraction<br/>• RBAC Route Guards"]
        UI --> NGINX
        NGINX --> SEC_FILTER
    end

    subgraph CONTROLLERS["API Gateway (Java 21 / Spring Boot 3.3)"]
        direction TB
        AUTH_CTRL["AuthController<br/>/api/auth/*"]
        RESUME_CTRL["ResumeController<br/>/api/resume/upload"]
        JOB_CTRL["JobController<br/>/api/job/analyze"]
        SCORE_CTRL["AnalysisController<br/>/api/score/evaluate"]
        ADMIN_CTRL["AdminController<br/>/api/admin/*"]
    end

    subgraph PIPELINE["Core Scoring & Parsing Mesh"]
        PARSER["ResumeParsingService<br/>• Apache PDFBox Extraction"]
        GEMINI_SVC["GeminiAiService<br/>• Skill Extraction & Gap Analysis"]
        SCORING["AtsScoreService<br/>• 5-Vector Weighted Matrix<br/>• @EnableAsync Executor"]
    end

    subgraph MODELS["External AI Inference"]
        GEMINI_API["Google Gemini AI Studio<br/>• Model: gemini-1.5-flash"]
    end

    subgraph STORAGE["Persistence Tier"]
        DB[("PostgreSQL 16 / H2<br/>Port: 5432<br/>• users & refresh_tokens<br/>• resumes & job_descriptions<br/>• analysis_results")]
    end

    SEC_FILTER --> CONTROLLERS

    AUTH_CTRL --> DB
    RESUME_CTRL --> PARSER
    JOB_CTRL --> GEMINI_SVC
    SCORE_CTRL --> SCORING

    PARSER --> DB
    GEMINI_SVC <--> GEMINI_API
    SCORING --> GEMINI_SVC
    SCORING --> DB
    ADMIN_CTRL --> DB
```

### Monorepo Directory Organization

```text
resumeiq-ai-platform/
├── backend/
│   ├── pom.xml                          # Maven build descriptor
│   ├── Dockerfile                       # Multi-stage Temurin 21 JRE container
│   └── src/main/
│       ├── java/com/resumeiq/
│       │   ├── ResumeIqApplication.java # Bootstrap entry point (@EnableAsync)
│       │   ├── config/
│       │   │   ├── SecurityConfig.java  # JWT filter, CORS, RBAC
│       │   │   └── AdminSeeder.java     # Default admin provisioning
│       │   ├── controller/
│       │   │   ├── AuthController.java       # /api/auth/* endpoints
│       │   │   ├── ResumeController.java     # /api/resume/upload
│       │   │   ├── JobController.java        # /api/job/analyze
│       │   │   ├── AnalysisController.java   # /api/score/evaluate, /api/analysis/{id}
│       │   │   ├── DashboardController.java  # /api/dashboard/stats
│       │   │   └── AdminController.java      # /api/admin/* fleet endpoints
│       │   ├── dto/                          # AuthDto, ResumeDto, JobDto, AnalysisDto
│       │   ├── entity/                       # User, Resume, JobDescription, AnalysisResult, RefreshToken
│       │   ├── exception/                    # GlobalExceptionHandler
│       │   ├── repository/                   # Spring Data JPA repositories
│       │   ├── security/                     # JwtTokenProvider, JwtAuthenticationFilter
│       │   └── service/                      # AtsScoreService, ResumeParsingService, GeminiAiService
│       └── resources/
│           └── application.yml          # Multi-profile configuration (dev/prod)
├── frontend/
│   ├── package.json
│   ├── vite.config.ts                   # Vite configuration & proxy routes
│   ├── tailwind.config.js               # Tailwind design system tokens
│   ├── nginx.conf                       # Production SPA fallback routing
│   └── src/
│       ├── main.tsx                     # React DOM entry point
│       ├── App.tsx                      # Route declarations
│       ├── context/AuthContext.tsx      # Eager refresh token state engine
│       ├── components/                  # Layout, ProtectedRoute, UI primitives
│       ├── pages/                       # LoginPage, DashboardPage, UploadPage, AnalysisPage, AdminPage
│       └── services/                    # Axios API client & endpoints
├── docker-compose.yml                   # Production container orchestration
└── .env.example                         # Environment secret template
```

---

## ATS Scoring Weighted Matrix & Invariants

The engine calculates objective candidate suitability across five weighted dimensions:

$$S_{\text{overall}} = 0.45 \cdot S_{\text{skill}} + 0.20 \cdot S_{\text{exp}} + 0.15 \cdot S_{\text{keywords}} + 0.10 \cdot S_{\text{struct}} + 0.10 \cdot S_{\text{ai}}$$

| Assessment Dimension | Weight ($w_i$) | Evaluation Criteria | Optimization Recommendation |
| :--- | :---: | :--- | :--- |
| **Skill Match** | `45%` | Direct overlap with job mandatory requirements | Identify missing technical tooling & frameworks |
| **Experience Relevance** | `20%` | Alignment of past roles, seniority, and responsibilities | Reorder achievements toward job scope |
| **Keyword Density** | `15%` | Frequency and context of core domain terminology | Inject industry keywords without keyword-stuffing |
| **Resume Formatting** | `10%` | Section headers, typography, parse readability | Fix non-standard headers, tables, or columns |
| **AI Fit Confidence** | `10%` | LLM holistic semantic reasoning score | Strengthen project narrative and deliverables |

### User Roles & Clearance Matrix

| Role | Access Level | Permissions |
| :--- | :--- | :--- |
| **`JOB_SEEKER`** | Default Persona | Upload personal resumes, trigger ATS scoring, view own analysis history. |
| **`RECRUITER`** | Hiring Team | Bulk candidate ingestion, JD benchmarking, talent comparison. |
| **`ENTERPRISE`** | Institutional Team | Enterprise API access, custom scoring weight configuration. |
| **`ADMIN`** | Platform Superuser | Access `/api/admin/**` endpoints, manage user registry, view fleet analytics. |

> The backend includes an `AdminSeeder` that provisions `admin@resumeiq.com` (password: `admin123`) on initial boot.

---

## Complete Technology Stack & Version Matrix

| Tier | Dependency / Tool | Version | Operational Purpose |
| :--- | :--- | :--- | :--- |
| **Runtime** | Java LTS | `21` | Eclipse Temurin 21 JRE runtime |
| **Backend** | Spring Boot | `3.3.0` | Core microservice framework |
| **Security** | Spring Security / JJWT | `6.3.x` / `0.12.5` | Stateless JWT authentication and token rotation |
| **Persistence** | Spring Data JPA / Hibernate | `3.3.x` | Relational persistence with EntityGraphs |
| **PDF Extraction**| Apache PDFBox | `3.0.2` | Clean semantic PDF text and structure extraction |
| **AI Inference**| Google Gemini API | `gemini-1.5-flash` | Contextual skill extraction and gap reasoning |
| **Frontend UI** | React / TypeScript | `18.3.1` / `5.4.5` | High-craft dashboard and reactive state |
| **Styling** | Tailwind CSS | `3.4.4` | Responsive dark/light styling |
| **Bundler** | Vite | `6.4.2` | Fast HMR dev server and Rollup production builds |
| **Visualization**| Recharts / Lucide | `2.12.7` / `0.378.0` | Vector radar charts and icon system |
| **Datastores** | PostgreSQL / H2 | `16` / `2.2.x` | Production ACID store / In-memory dev database |
| **Container** | Docker / Compose | `24+` / `2.x` | Multi-stage containerized deployment |

---

## Core API Specification

| Method & Path | Authorization | Description |
| :--- | :---: | :--- |
| `POST /api/auth/register` | Public | Register new user account (defaults to `JOB_SEEKER`). |
| `POST /api/auth/login` | Public | Authenticates credentials and returns Access & Refresh tokens. |
| `POST /api/auth/refresh` | Public | Silent background token renewal hitting timer 10s before expiry. |
| `POST /api/resume/upload` | **Authenticated** | Uploads candidate resume PDF (multipart form-data). |
| `POST /api/job/analyze` | **Authenticated** | Submits job description text for Gemini AI skill extraction. |
| `POST /api/score/evaluate` | **Authenticated** | Triggers asynchronous ATS analysis (`@EnableAsync`) $\to$ returns `{ analysisId }`. |
| `GET /api/analysis/{id}` | **Authenticated** | Retrieves analysis score breakdown (poll until `COMPLETED`). |
| `GET /api/dashboard/stats` | **Authenticated** | Retrieves aggregate user analytics and recent ATS evaluations. |
| `GET /api/admin/users` | `ROLE_ADMIN` | Fleet user list and clearance roles. |
| `GET /api/admin/stats/overview`| `ROLE_ADMIN` | Platform-wide evaluation metrics, error rates, and user counts. |
| `GET /actuator/health` | Public | Liveness probe and database connectivity check. |

---

## Quickstart & Platform Orchestration

### Prerequisites
- Docker Desktop (with Compose v2+)
- Java 21 LTS & Maven 3.9+
- Node.js 20+ & npm
- Google AI Studio API Key ([Get API Key](https://aistudio.google.com/app/apikey))

---

### Option A: Automated Docker Compose Orchestration (Recommended)

Launch the full-stack containerized platform (PostgreSQL 16, Spring Boot API, and Nginx-powered React dashboard) in one command:
```bash
# Clone repository
git clone https://github.com/i-viki/resumeiq-ai-platform.git
cd resumeiq-ai-platform

# Configure environment variables
cp .env.example .env
# Edit .env with your GEMINI_API_KEY and passwords

# Launch containers
docker compose up --build -d
```
*Platform active at `http://localhost` (Frontend: `:80`, Backend: `:8080`, PostgreSQL: `:5432`).*

To cleanly shut down all services:
```bash
docker compose down -v
```

---

### Option B: Step-by-Step Manual Launch

#### Step 1: Launch Backend with In-Memory H2 (Dev Profile)
```bash
cd backend
export GEMINI_API_KEY="your-gemini-api-key"
./mvnw spring-boot:run
# Windows: .\mvnw.cmd spring-boot:run
```
*Backend initializes on `http://localhost:8080` with embedded H2 database.*

#### Step 2: Launch Frontend Development Server
```bash
cd frontend
npm install
npm run dev
# Dashboard active at: http://localhost:5173
```

#### Step 3: Production Builds (Optional)
```bash
# Backend JAR packaging
cd backend && ./mvnw clean package -DskipTests

# Frontend optimized build
cd frontend && npm run build
```

---

## Decoupled Environment Strategy

All services extract hostnames, database connection strings, and AI credentials into decoupled environment templates:

| Variable | Required | Default (Dev) | Description |
| :--- | :---: | :--- | :--- |
| `GEMINI_API_KEY` | **Yes** | *(none)* | Google Gemini API key for contextual skill extraction. |
| `SPRING_PROFILES_ACTIVE` | No | `dev` | Profile mode: `dev` (H2 DB) or `prod` (PostgreSQL). |
| `DATABASE_URL` | Prod only | – | PostgreSQL JDBC URL (`jdbc:postgresql://localhost:5432/resumeiq`). |
| `DATABASE_USERNAME` | Prod only | – | Relational database username. |
| `DATABASE_PASSWORD` | Prod only | – | Relational database password. |
| `JWT_SECRET` | Prod only | *(256-bit key)* | HMAC-SHA secret for token signing. |
| `CORS_ORIGINS` | No | `http://localhost:5173` | Comma-separated allowed CORS origins. |

---

## Live Telemetry & Observability Hubs

| Hub / Service | Port | URL | Role & Live Features |
| :--- | :--- | :--- | :--- |
| **React ATS Dashboard** | `5173` | [http://localhost:5173](http://localhost:5173) | Interactive ATS Workspace, resume upload studio & admin panel. |
| **Backend REST API** | `8080` | [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health) | Analysis pipeline status and database connectivity health. |
| **H2 Database Console** | `8080` | [http://localhost:8080/h2-console](http://localhost:8080/h2-console) | In-memory relational explorer (active under `dev` profile). |

---

## Testing & Quality Assurance Suite

### Backend Service Tests (Java 21)
```bash
cd backend
./mvnw test
# Validates JWT parsing, PDFBox extraction, and ATS scoring formulas.
```

### Async ATS Evaluation Request
```bash
curl -X POST http://localhost:8080/api/score/evaluate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "resumeId": 1,
    "jobDescriptionId": 1
  }'
```

### Direct Resume PDF Upload
```bash
curl -X POST http://localhost:8080/api/resume/upload \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "file=@/path/to/resume.pdf"
```

---

## Platform Troubleshooting Guide

### 1. "Unable to access lob stream" (PostgreSQL)
If encountered while accessing the dashboard, this occurs when Hibernate attempts to read large text fields outside an active transactional context. Resolved by attaching `@Transactional(readOnly = true)` to controller read methods.

### 2. "mvnw: illegal option -" (Windows CRLF Line Endings)
Caused by Windows CRLF line terminators on shell scripts. The container Dockerfile handles this automatically via:
```bash
sed -i 's/\r$//' mvnw
```

---

## Author

**Jayavignesh**
- **Website:** [jayavignesh.dev](https://jayavignesh.dev)
- **GitHub:** [@i-viki](https://github.com/i-viki)
- **Email:** [hello@jayavignesh.dev](mailto:hello@jayavignesh.dev)

---

## License

This platform is distributed under the **MIT License**. See the [`LICENSE`](LICENSE) file for complete terms.
