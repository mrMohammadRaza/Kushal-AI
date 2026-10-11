from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.schemas.assessment import EvaluateRequest, AssessmentResponse
from app.pipelines.langgraph_pipeline import langgraph_pipeline
from app.rag.nsqf_engine import nsqf_rag_engine

load_dotenv()

app = FastAPI(
    title="Kaushal AI - RPL Assessment AI Microservice",
    description="FastAPI + LangGraph pipeline for SIH26242 Skill Assessment",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "Kaushal AI Microservice (LangGraph + RAG)",
        "indexedTrades": len(nsqf_rag_engine.trades_by_id)
    }

@app.post("/api/evaluate", response_model=AssessmentResponse)
def evaluate_assessment(request: EvaluateRequest):
    try:
        result = langgraph_pipeline.run(request.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/rag/query")
def query_nsqf(q: str, trade_id: str = None, top_k: int = 5):
    results = nsqf_rag_engine.search_competencies(query=q, trade_id=trade_id, top_k=top_k)
    return {"query": q, "results": results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
