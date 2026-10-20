from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Optional, Dict, Any
import os

from app.schemas.assessment import EvaluateRequest, AssessmentResponse
from app.pipelines.langgraph_pipeline import langgraph_pipeline
from app.rag.nsqf_engine import nsqf_rag_engine
from app.services.gemini_service import gemini_service

load_dotenv()

app = FastAPI(
    title="Kaushal AI - RPL Assessment AI Microservice (Gemini Powered)",
    description="FastAPI + LangGraph + Google Gemini pipeline for SIH26242 Skill Assessment",
    version="2.0.0"
)

allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
allowed_origins = [
    origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()
] if allowed_origins_env else [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5000",
    "https://kushal-ai.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

class CopilotChatRequest(BaseModel):
    message: str
    assessment_context: Optional[Dict[str, Any]] = None
    trade_id: Optional[str] = None

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "Kaushal AI Microservice (LangGraph + Gemini 3.5)",
        "geminiIntegrated": bool(gemini_service.api_key),
        "indexedTrades": len(nsqf_rag_engine.trades_by_id)
    }

@app.post("/api/evaluate", response_model=AssessmentResponse)
def evaluate_assessment(request: EvaluateRequest):
    try:
        result = langgraph_pipeline.run(request.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/gemini/copilot")
def ask_gemini_copilot(req: CopilotChatRequest):
    try:
        trade = nsqf_rag_engine.get_trade(req.trade_id) if req.trade_id else None
        reply = gemini_service.chat_copilot(
            message=req.message,
            assessment_context=req.assessment_context,
            trade_context=trade
        )
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/rag/query")
def query_nsqf(q: str, trade_id: str = None, top_k: int = 5):
    results = nsqf_rag_engine.search_competencies(query=q, trade_id=trade_id, top_k=top_k)
    return {"query": q, "results": results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
