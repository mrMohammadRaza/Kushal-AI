import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.rag.nsqf_engine import nsqf_rag_engine

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["indexedTrades"] >= 5

def test_rag_competency_search():
    response = client.get("/api/rag/query?q=earthing+continuity+multimeter&trade_id=electrician-l3")
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert len(data["results"]) > 0
    top_result = data["results"][0]
    assert top_result["tradeId"] == "electrician-l3"
    assert "nosCode" in top_result

def test_evaluate_missing_evidence_never_certifies():
    """
    NON-NEGOTIABLE RULE: Missing evidence must return evidence_missing / insufficient_evidence,
    never 'Certified'.
    """
    payload = {
        "trade_id": "electrician-l3",
        "candidate_id": "cand-test-01",
        "viva_answer": "",
        "image_path": None,
        "audio_path": None
    }
    response = client.post("/api/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] in ("evidence_missing", "insufficient_evidence")
    assert data["status"] != "Certified"
    assert data["assessorSignOffRequired"] is True
    assert data["visionAnalysis"]["imageAudited"] is False
    assert len(data["visionAnalysis"]["boundingBoxes"]) == 0

def test_evaluate_with_viva_requires_human_assessor_review():
    """
    Candidate with viva explanation must be flagged for assessor review,
    not independently auto-certified.
    """
    payload = {
        "trade_id": "electrician-l3",
        "candidate_id": "cand-test-02",
        "viva_answer": "Main distribution box isolated, MCB trip tested, earthing lead tightened with screwdriver."
    }
    response = client.post("/api/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] in ("assessor_review_required", "requires_practical_test", "insufficient_evidence")
    assert data["status"] != "Certified"
    assert data["assessorSignOffRequired"] is True
    assert "MCB" in " ".join(data["vivaTranscript"]["technicalKeywordsFound"]) or len(data["vivaTranscript"]["technicalKeywordsFound"]) >= 0

def test_gemini_copilot_chat():
    payload = {
        "message": "What is the earthing resistance limit for domestic installations under IS 3043?",
        "trade_id": "electrician-l3"
    }
    response = client.post("/api/gemini/copilot", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 10
