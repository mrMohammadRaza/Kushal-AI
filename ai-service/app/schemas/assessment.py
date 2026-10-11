from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class EvaluateRequest(BaseModel):
    trade_id: str
    candidate_id: str
    viva_answer: Optional[str] = ""
    viva_scenario_id: Optional[str] = ""
    image_path: Optional[str] = None
    audio_path: Optional[str] = None
    assessor_notes: Optional[str] = ""

class PerformanceCriterionResult(BaseModel):
    code: str
    description: str
    status: str
    score: int
    evidence: str

class NOSResult(BaseModel):
    nosCode: str
    title: str
    weightage: int
    score: int
    status: str
    performanceCriteria: List[PerformanceCriterionResult]
    feedback: str

class VisionAnalysisResult(BaseModel):
    ppeCompliance: Dict[str, Any]
    workmanshipQuality: Dict[str, Any]
    toolsIdentified: List[str]

class VivaTranscriptResult(BaseModel):
    transcript: str
    languageDetected: str
    technicalKeywordsFound: List[str]
    conceptClarityRating: str

class AssessmentResponse(BaseModel):
    tradeId: str
    tradeTitle: str
    qpCode: str
    nsqfLevel: int
    candidateId: str
    overallScore: int
    status: str
    recommendation: str
    confidenceScore: float
    visionAnalysis: VisionAnalysisResult
    vivaTranscript: VivaTranscriptResult
    nosResults: List[NOSResult]
    strengths: List[str]
    gapAreas: List[str]
    bridgeTrainingModules: List[str]
    assessorSignOffRequired: bool
