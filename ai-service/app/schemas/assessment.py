from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AntiFraudAudit(BaseModel):
    geoTag: Optional[Dict[str, Any]] = None
    livenessVerified: bool = False
    confidence: Optional[float] = None
    gestureRecognized: Optional[str] = None
    antiSpoofCheck: str = "Pending Assessor Verification"
    capturedAt: Optional[str] = None

class VisionBoundingBox(BaseModel):
    label: str
    box_2d: List[float] # [ymin, xmin, ymax, xmax] normalized 0.0 - 1.0
    confidence: float
    pcCode: Optional[str] = None

class AudioTimestampCitation(BaseModel):
    start_sec: float
    end_sec: float
    text_hi: Optional[str] = None
    text_en: Optional[str] = None
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
    imageAudited: bool = False
    ppeCompliance: Dict[str, Any]
    workmanshipQuality: Dict[str, Any]
    toolsIdentified: List[str] = []
    boundingBoxes: Optional[List[VisionBoundingBox]] = []

class VivaTranscriptResult(BaseModel):
    transcript: Optional[str] = None
    transcriptEnglish: Optional[str] = None
    languageDetected: str = "none"
    technicalKeywordsFound: List[str] = []
    conceptClarityRating: str = "Not Assessed"
    bhashiniTranslationUsed: Optional[bool] = False
    timestampCitations: Optional[List[AudioTimestampCitation]] = []

class AssessmentResponse(BaseModel):
    tradeId: str
    tradeTitle: str
    qpCode: str
    nsqfLevel: int
    candidateId: str
    overallScore: Optional[int] = None
    status: str = Field(..., description="assessor_review_required, insufficient_evidence, requires_practical_test, evidence_missing")
    recommendation: str
    confidenceScore: float
    evidencePresent: Optional[Dict[str, bool]] = None
    visionAnalysis: VisionAnalysisResult
    vivaTranscript: VivaTranscriptResult
    nosResults: List[NOSResult]
    strengths: List[str] = []
    gapAreas: List[str] = []
    bridgeTrainingModules: List[str] = []
    assessorSignOffRequired: bool = True
    antiFraudAudit: Optional[AntiFraudAudit] = None
