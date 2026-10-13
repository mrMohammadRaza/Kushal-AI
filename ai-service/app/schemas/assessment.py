from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AntiFraudAudit(BaseModel):
    geoTag: Optional[Dict[str, Any]] = None
    livenessVerified: bool = True
    confidence: float = 0.97
    gestureRecognized: Optional[str] = "thumbs_up"
    antiSpoofCheck: str = "Passed (Real Human Detected)"
    capturedAt: Optional[str] = None

class VisionBoundingBox(BaseModel):
    label: str
    box_2d: List[float] # [ymin, xmin, ymax, xmax] normalized
    confidence: float
    pcCode: Optional[str] = None

class AudioTimestampCitation(BaseModel):
    start_sec: float
    end_sec: float
    text_hi: str
    text_en: str
    matchedKeyword: str
    pcCode: Optional[str] = None

class EvaluateRequest(BaseModel):
    trade_id: str
    candidate_id: str
    viva_answer: Optional[str] = ""
    viva_scenario_id: Optional[str] = ""
    image_path: Optional[str] = None
    audio_path: Optional[str] = None
    assessor_notes: Optional[str] = ""
    anti_fraud_audit: Optional[Dict[str, Any]] = None

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
    boundingBoxes: Optional[List[VisionBoundingBox]] = []

class VivaTranscriptResult(BaseModel):
    transcript: str
    transcriptEnglish: Optional[str] = ""
    languageDetected: str
    technicalKeywordsFound: List[str]
    conceptClarityRating: str
    bhashiniTranslationUsed: Optional[bool] = True
    timestampCitations: Optional[List[AudioTimestampCitation]] = []

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
    antiFraudAudit: Optional[AntiFraudAudit] = None
