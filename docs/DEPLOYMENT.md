# Kaushal AI — Deployment & CI/CD Guide
**Production Setup, Containerization, Environment Variables, and Operational Health**

---

## 1. Environment Configuration

Copy `.env.example` to `.env` in both `backend/` and `ai-service/`:

### Backend Environment Variables (`backend/.env`)
```bash
PORT=5000
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_here
AI_SERVICE_URL=http://127.0.0.1:8000
PUBLIC_APP_URL=https://kaushal-ai.onrender.com
GEMINI_API_KEY=your_gemini_api_key_here
DIGILOCKER_ISSUER_ID=in.gov.skillindia.kaushalai.pilot
DIGILOCKER_API_KEY=your_digilocker_key_here
```

### AI Microservice Environment Variables (`ai-service/.env`)
```bash
GEMINI_API_KEY=your_gemini_api_key_here
BHASHINI_USER_ID=your_bhashini_user_id
BHASHINI_API_KEY=your_bhashini_api_key
BHASHINI_INFERENCE_URL=https://dhruva-api.bhashini.gov.in/services/inference/pipeline
```

---

## 2. Local Development Startup

1. **Install Dependencies**:
   ```bash
   npm run install:all
   ```
2. **Seed Initial Demonstration Data**:
   ```bash
   node scripts/seed_demo.js
   ```
3. **Run Services**:
   - Backend & Frontend (concurrently):
     ```bash
     npm run dev
     ```
   - AI Microservice (optional, in separate terminal):
     ```bash
     npm run dev:ai
     ```
4. **Access Applications**:
   - Web Platform: `http://localhost:5173`
   - Core API: `http://localhost:5000`
   - AI Microservice Docs: `http://localhost:8000/docs`

---

## 3. Render / Production Monorepo Deployment

On Render, configure:
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- When built, Express serves the production React frontend bundle from `frontend/dist` directly, providing a unified single-port deployment for the hackathon demonstration.
