# Kaushal AI — Comprehensive Production Deployment Guide
**Target Environments:** Render, Vercel, Standalone Linux/Docker VM  
**Platform Reference:** SIH26242 RPL Practical Skill Assessment Platform  

---

## 1. Architecture & Hosting Topology

Kaushal AI is designed as a modular 3-tier platform:
1. **Frontend:** React + Vite Single Page Application (SPA), styled with TailwindCSS, utilizing Lucide icons, Framer Motion, and Web APIs (`MediaRecorder`, `IndexedDB`, `SpeechSynthesis`).
2. **Backend:** Node.js Express application providing REST APIs, JWT authentication, SQLite WAL local persistence, V8 isolated code execution sandbox, and automated PDF report generation with digital signatures.
3. **AI Microservice:** Python FastAPI service providing fast-path multi-modal analysis (Computer Vision, Speech-to-Text via Bhashini, and LLM competency rubric evaluation via Gemini Flash).

---

## 2. Environment Variables Checklist

Ensure the following variables are configured in your production environment settings (Render Dashboard, Vercel Project Settings, or `.env` file):

| Variable Name | Required | Default / Example | Purpose |
|---|---|---|---|
| `NODE_ENV` | **Yes** | `production` | Enables production optimizations, disables debug leaks |
| `PORT` | **Yes** | `5000` | Port for the backend Express application |
| `JWT_SECRET` | **Yes** | `<64-char random hex>` | Secret key for signing and verifying user authentication tokens |
| `CORS_ORIGIN` | **Yes** | `https://kaushal-ai.onrender.com` | Strict comma-separated origin allowlist for CORS |
| `AI_SERVICE_URL` | Optional | `http://127.0.0.1:8000` | Address of the FastAPI AI microservice |
| `GEMINI_API_KEY` | Optional | `AIzaSy...` | Google AI Studio key for Tier 1 multi-modal assessment |
| `DIGILOCKER_API_KEY` | Optional | `<random hex>` | HMAC secret for NeGD DigiLocker XML certificate payloads |
| `VITE_API_URL` | Optional | Empty (proxied via `/api`) | Custom backend URL if frontend is deployed on separate domain |
| `SUPABASE_URL` | Optional | `https://xyz.supabase.co` | Remote PostgreSQL database if migrating from local SQLite |
| `SUPABASE_ANON_KEY` | Optional | `<anon key>` | Public key for Supabase client synchronization |

> [!CAUTION]
> In production, `JWT_SECRET` must be at least 32 characters long. If `NODE_ENV=production` and `JWT_SECRET` is unset, the backend will refuse to start for security compliance.

---

## 3. Render Deployment (Single-Service Monorepo or Multi-Service)

### 3.1 Single-Service Unified Deployment (Recommended for Hackathon Staging)
In single-service mode, Express serves the compiled Vite frontend bundle from `frontend/dist` on a single port.

1. **Create Web Service** on Render connected to the GitHub repository:
   - **Environment:** `Node`
   - **Node.js Version:** `20.x` or higher
   - **Build Command:**
     ```bash
     npm run install:all && npm run build
     ```
   - **Start Command:**
     ```bash
     npm start
     ```
2. **Persistent Disk (Critical for SQLite and Evidence Uploads):**
   - Render ephemeral filesystems discard files upon redeploy.
   - Attach a Render Persistent Disk mounted at `/var/data` or `backend/data` and `backend/uploads`.
3. **Add Environment Variables:**
   - Configure `JWT_SECRET`, `NODE_ENV=production`, `CORS_ORIGIN`, and `GEMINI_API_KEY`.

### 3.2 Dual-Service with FastAPI Microservice (`render.yaml`)
If deploying the Python AI service alongside the backend:
```yaml
services:
  - type: web
    name: kaushal-ai-backend
    env: node
    buildCommand: npm run install:all && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: AI_SERVICE_URL
        fromService:
          name: kaushal-ai-service
          type: web
          property: host

  - type: web
    name: kaushal-ai-service
    env: python
    buildCommand: cd ai-service && pip install -r requirements.txt
    startCommand: cd ai-service && uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

## 4. Vercel Deployment

For deploying the frontend as a static SPA on Vercel:
1. Set **Framework Preset:** `Vite`
2. **Root Directory:** `frontend`
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. Configure rewrites in `vercel.json`:
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "https://your-backend-render-url.onrender.com/api/$1" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

> [!WARNING]
> Do NOT deploy the backend Express SQLite database directly as a Vercel Serverless Function without migrating to an external persistent database (such as Supabase PostgreSQL), as serverless functions do not persist local SQLite or filesystem files between invocations.

---

## 5. Standalone Linux VM / Docker Deployment

1. **Clone repository:**
   ```bash
   git clone https://github.com/mrMohammadRaza/Kushal-AI.git
   cd Kushal-AI
   ```
2. **Install system dependencies:**
   ```bash
   sudo apt-get update
   sudo apt-get install -y nodejs npm python3 python3-venv
   ```
3. **Setup environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your production secrets
   ```
4. **Install and build:**
   ```bash
   npm run install:all
   npm run build
   ```
5. **Run backend with process manager (PM2):**
   ```bash
   npm install -g pm2
   pm2 start backend/src/server.js --name "kaushal-backend"
   ```
6. **(Optional) Run AI microservice with systemd or PM2:**
   ```bash
   cd ai-service
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   pm2 start "uvicorn app.main:app --host 127.0.0.1 --port 8000" --name "kaushal-ai"
   ```

---

## 6. Health Checks & Verification

- **Backend Health Check:** `GET https://your-domain.com/api/health`  
  *Expected Output:* `HTTP 200 { "status": "UP", "timestamp": "...", "database": "CONNECTED", "version": "1.0.0" }`
- **AI Microservice Health Check:** `GET http://127.0.0.1:8000/health`  
  *Expected Output:* `HTTP 200 { "status": "healthy", "service": "kaushal-ai-multimodal-engine" }`
- **Public Verification Endpoint:** `GET https://your-domain.com/api/reports/verify/<reportHash>`  
  *Expected Output:* `HTTP 200 { "verified": true, "qualification": { ... } }`
