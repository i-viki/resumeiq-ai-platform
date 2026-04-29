# ResumeIQ – AI-Powered Resume Analysis & ATS Intelligence Platform

Enterprise-grade resume analysis platform that evaluates resumes against job descriptions using **Google Gemini AI**, generating ATS compatibility scores, skill gap insights, and actionable improvement recommendations.

---

## Table of Contents

- [Tech Stack & Versions](#tech-stack--versions)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Security & Authentication](#security--authentication)
- [ATS Scoring Strategy](#ats-scoring-strategy)
- [User Roles](#user-roles)
- [Author](#author)
- [License](#license)

---

## Tech Stack & Versions

### Backend

| Dependency | Version |
|---|---|
| Java | 21 |
| Spring Boot | 3.3.0 |
| Spring Security | 6.3.x (managed by Boot) |
| Spring Data JPA | 3.3.x (managed by Boot) |
| Spring WebFlux (WebClient) | 6.1.x (managed by Boot) |
| PostgreSQL Driver | 42.7.x (managed by Boot) |
| H2 Database (dev) | 2.2.x (managed by Boot) |
| Apache PDFBox | 3.0.2 |
| JJWT (JWT auth) | 0.12.5 |
| Lombok | Latest (managed by Boot) |
| Maven | 3.9+ (wrapper included) |

### Frontend

| Dependency | Version |
|---|---|
| React | 18.3.1 |
| React DOM | 18.3.1 |
| React Router DOM | 6.23.1 |
| TypeScript | 5.4.5 |
| Vite | 5.2.13 |
| Tailwind CSS | 3.4.4 |
| Axios | 1.7.2 |
| Recharts | 2.12.7 |
| Lucide React | 0.378.0 |
| Node.js | 20+ |
| npm | 10+ |

### Infrastructure

| Tool | Version |
|---|---|
| Docker | 24+ |
| Docker Compose | 2.x |
| PostgreSQL (prod) | 16 |
| Nginx (frontend container) | Alpine |

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Java 21** – [Download](https://adoptium.net/temurin/releases/?version=21)
- **Node.js 20+** – [Download](https://nodejs.org/)
- **Maven 3.9+** – Included via `mvnw` wrapper in `backend/`
- **Google Gemini API Key** – [Get one](https://aistudio.google.com/app/apikey)
- *(Optional)* **Docker & Docker Compose** – For containerized deployment
- *(Optional)* **PostgreSQL 16** – Only for production; dev uses H2 in-memory DB

---

## Project Structure

```
resumeiq-ai-platform/
├── backend/
│   ├── pom.xml                          # Maven dependencies
│   ├── Dockerfile
│   └── src/main/
│       ├── java/com/resumeiq/
│       │   ├── ResumeIqApplication.java # Entry point (@EnableAsync)
│       │   ├── config/
│       │   │   ├── SecurityConfig.java  # JWT filter, CORS, RBAC
│       │   │   └── AdminSeeder.java     # Default admin provisioning
│       │   ├── controller/
│       │   │   ├── AuthController.java       # POST /api/auth/*
│       │   │   ├── ResumeController.java     # POST /api/resume/upload
│       │   │   ├── JobController.java        # POST /api/job/analyze
│       │   │   ├── AnalysisController.java   # POST /api/score/evaluate, GET /api/analysis/{id}
│       │   │   ├── DashboardController.java  # GET /api/dashboard/stats
│       │   │   └── AdminController.java      # GET /api/admin/* endpoints
│       │   ├── dto/
│       │   │   ├── AuthDto.java
│       │   │   ├── ResumeDto.java
│       │   │   ├── JobDto.java
│       │   │   ├── AnalysisDto.java
│       │   │   └── DashboardDto.java
│       │   ├── entity/
│       │   │   ├── User.java
│       │   │   ├── Resume.java
│       │   │   ├── JobDescription.java
│       │   │   ├── AnalysisResult.java
│       │   │   └── RefreshToken.java
│       │   ├── exception/
│       │   │   └── GlobalExceptionHandler.java
│       │   ├── repository/
│       │   │   ├── UserRepository.java
│       │   │   ├── ResumeRepository.java
│       │   │   ├── JobDescriptionRepository.java
│       │   │   ├── AnalysisResultRepository.java
│       │   │   └── RefreshTokenRepository.java
│       │   ├── security/
│       │   │   ├── JwtTokenProvider.java
│       │   │   └── JwtAuthenticationFilter.java
│       │   └── service/
│       │       ├── AuthService.java
│       │       ├── ResumeParsingService.java   # PDFBox integration
│       │       ├── JobDescriptionService.java  # Gemini skill extraction
│       │       ├── GeminiAiService.java        # Gemini API client
│       │       ├── AtsScoreService.java        # Scoring engine
│       │       └── RefreshTokenService.java    # Refresh token management
│       └── resources/
│           └── application.yml          # Multi-profile config (dev/prod)
│
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│       ├── main.tsx
│       ├── App.tsx                      # Routes
│       ├── index.css                    # Tailwind directives
│       ├── context/
│       │   └── AuthContext.tsx          # Auth state + JWT storage
│       ├── components/
│       │   ├── Layout.tsx               # Nav bar + outlet
│       │   └── ProtectedRoute.tsx       # Auth guard
│       ├── pages/
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   ├── DashboardPage.tsx        # Stats + recent analyses
│       │   ├── UploadPage.tsx           # Resume + JD form
│       │   ├── AnalysisPage.tsx         # Score breakdown + polling
│       │   └── AdminDashboardPage.tsx   # Admin overview and user stats
│       └── services/
│           ├── api.ts                   # Axios instance + interceptors
│           ├── authService.ts
│           └── analysisService.ts
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/resumeiq-ai-platform.git
cd resumeiq-ai-platform
```

### 2. Backend Setup

```bash
cd backend

# Set Gemini API key (required for AI features)
export GEMINI_API_KEY=your-gemini-api-key      # Linux/Mac
set GEMINI_API_KEY=your-gemini-api-key         # Windows CMD
$env:GEMINI_API_KEY="your-gemini-api-key"      # PowerShell

# Run with Maven wrapper (uses H2 in-memory database by default)
./mvnw spring-boot:run          # Linux/Mac
mvnw.cmd spring-boot:run        # Windows
```

The backend starts on **http://localhost:8080**.

> **Note:** The dev profile uses H2 in-memory DB — no database installation needed. Data resets on restart.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The frontend starts on **http://localhost:5173** and proxies `/api` requests to the backend.

### 4. Open in Browser

Navigate to **http://localhost:5173**, register an account, and start analyzing resumes.

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes (for AI) | *(none)* | Google Gemini API key |
| `SPRING_PROFILES_ACTIVE` | No | `dev` | `dev` (H2) or `prod` (PostgreSQL) |
| `DATABASE_URL` | Prod only | – | PostgreSQL JDBC URL |
| `DATABASE_USERNAME` | Prod only | – | PostgreSQL username |
| `DATABASE_PASSWORD` | Prod only | – | PostgreSQL password |
| `JWT_SECRET` | Prod only | dev default | 256-bit secret for JWT signing |
| `CORS_ORIGINS` | No | `http://localhost:5173` | Comma-separated allowed origins |

### application.yml Profiles

- **`dev`** (default) – H2 in-memory DB, console enabled at `/h2-console`, auto DDL, built-in JWT secret
- **`prod`** – PostgreSQL, schema validation, all secrets from environment variables

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register (defaults to JOB_SEEKER) |
| POST | `/api/auth/login` | No | Login → JWT access & refresh tokens |
| POST | `/api/auth/refresh` | No | Silent background token renewal |
| POST | `/api/resume/upload` | Yes | Upload resume PDF (multipart) |
| POST | `/api/job/analyze` | Yes | Submit job description for skill extraction |
| POST | `/api/score/evaluate` | Yes | Trigger async ATS analysis → returns `{ analysisId }` |
| GET | `/api/analysis/{id}` | Yes | Get analysis result (poll until COMPLETED) |
| GET | `/api/dashboard/stats` | Yes | User dashboard stats |
| GET | `/api/admin/users` | Admin | Get all registered platform users |
| GET | `/api/admin/stats/overview`| Admin | High-level platform analytics |
| GET | `/actuator/health` | No | Health check |

---

## Security & Authentication

The platform utilizes a highly secure **Eager Refresh Token Architecture**:
- **Short-Lived Access Tokens**: Primary JWTs expire very quickly (configurable in `application.yml`) to minimize the risk of token theft.
- **Long-Lived Refresh Tokens**: A secure 7-day UUID refresh token is stored in the database (`RefreshToken` entity, configured as `@ManyToOne` to support multi-device) and in the user's `localStorage`.
- **Eager Auto-Renewal**: The React frontend (`AuthContext.tsx`) dynamically parses the JWT `exp` timestamp. It runs a silent background timer that hits the `/api/auth/refresh` endpoint exactly 10 seconds before the token dies, guaranteeing zero user interruption.
- **Strict RBAC Guards**: Spring Security is configured with an `AuthenticationEntryPoint` to enforce true `401 Unauthorized` responses for expired tokens, and the React frontend utilizes array-based routing guards to restrict unauthorized navigation.

---

## ATS Scoring Strategy

The overall ATS score is a weighted combination:

| Component | Weight | Description |
|---|---|---|
| Skill Match | 45% | How well resume skills match job requirements |
| Experience Relevance | 20% | Relevance of work experience to the role |
| Keyword Optimization | 15% | Job description keyword usage in resume |
| Resume Structure | 10% | Format, sections, and organization quality |
| AI Feedback | 10% | Overall AI confidence in candidate-job fit |

**Formula:** `Overall = (Skill × 0.45) + (Experience × 0.20) + (Keywords × 0.15) + (Structure × 0.10) + (AI × 0.10)`

---

## Docker Deployment

### Quick Start

```bash
# Copy and configure environment
cp .env.example .env
# Edit .env with your GEMINI_API_KEY, DB_PASSWORD, JWT_SECRET

# Build and run all services
docker compose up --build
```

### Services

| Service | Port | Description |
|---|---|---|
| `frontend` | 80 | Nginx serving React app |
| `backend` | 8080 | Spring Boot API |
| `db` | 5432 | PostgreSQL 16 |

### Production Build

```bash
# Backend JAR
cd backend && ./mvnw clean package -DskipTests

# Frontend dist
cd frontend && npm run build
```

---

## User Roles

| Role | Access |
|---|---|
| `JOB_SEEKER` | Upload resumes, view own analyses (Default Role) |
| `RECRUITER` | Upload resumes, view own analyses |
| `ENTERPRISE` | Upload resumes, view own analyses |
| `ADMIN` | Access `/api/admin/**` endpoints and Admin Dashboard UI |

> **Note:** The backend contains an `AdminSeeder` that automatically provisions `admin@resumeiq.com` (password: `admin123`) on the first application boot.

---

## Author

Designed and developed by **Jayavignesh**.

- **Website:** [jayavignesh.dev](https://jayavignesh.dev)
- **LinkedIn:** [linkedin.com/in/jayavigneshj](https://linkedin.com/in/jayavigneshj)

---

## License

This project is licensed under the [MIT License](LICENSE).
