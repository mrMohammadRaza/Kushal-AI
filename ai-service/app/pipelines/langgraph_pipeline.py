from typing import Dict, Any, List, Optional
import os
from app.rag.nsqf_engine import nsqf_rag_engine
from app.services.bhashini_service import bhashini_service
from app.services.gemini_service import gemini_service
from app.schemas.assessment import (
    AssessmentResponse,
    NOSResult,
    PerformanceCriterionResult,
    VisionAnalysisResult,
    VivaTranscriptResult,
    VisionBoundingBox,
    AudioTimestampCitation,
    AntiFraudAudit
)

class LangGraphAssessmentPipeline:
    """
    RPL Assessment Pipeline:
    Stage 1: Speech Processing & Indic Understanding (Bhashini + Gemini)
    Stage 2: Multimodal Practical Vision Inspection (Gemini)
    Stage 3: NSQF Competency Mapping & Gap Diagnosis
    Stage 4: Anti-Fraud Verification Audit
    """

    def __init__(self):
        self.rag = nsqf_rag_engine
        self.bhashini = bhashini_service
        self.gemini = gemini_service

    def run(self, request_data: Dict[str, Any]) -> AssessmentResponse:
        trade_id = request_data.get("trade_id")
        candidate_id = request_data.get("candidate_id")
        viva_answer = request_data.get("viva_answer", "")
        image_path = request_data.get("image_path")
        audio_path = request_data.get("audio_path")
        image_base64 = request_data.get("image_base64")
        audio_base64 = request_data.get("audio_base64")
        anti_fraud_input = request_data.get("anti_fraud_audit")

        trade = self.rag.get_trade(trade_id)
        if not trade:
            first_key = list(self.rag.trades_by_id.keys())[0] if self.rag.trades_by_id else "electrician-l3"
            trade = self.rag.get_trade(first_key)

        has_image = bool((image_path and os.path.exists(image_path)) or image_base64)
        has_viva = bool(viva_answer and viva_answer.strip())

        # 1. Stage 1: Speech & Vernacular viva processing
        viva_transcript_data = self._process_viva(viva_answer, trade)

        # 2. Stage 2: Practical vision evidence inspection
        vision_data = self._analyze_practical_vision(
            image_path if (image_path and os.path.exists(image_path)) else None, 
            trade, 
            image_base64=image_base64
        )

        # 3. Stage 3: Competency synthesis & gap identification
        synthesis = self.gemini.synthesize_nsqf_evaluation(
            trade=trade,
            viva_data=viva_transcript_data.model_dump(),
            vision_data=vision_data.model_dump()
        )

        nos_results = self._parse_nos_results(synthesis.get("nosResults", []), trade, has_viva, has_image)
        overall_score = synthesis.get("overallScore")
        nsqf_level = trade.get("nsqfLevel", 3)
        status = synthesis.get("status", "assessor_review_required" if (has_image and has_viva) else "insufficient_evidence")

        recommendation = synthesis.get(
            "recommendation",
            f"Candidate evidence logged for NSQF Level {nsqf_level} assessor review."
        )

        strengths = synthesis.get("strengths") or [
            f"Familiarity with foundational {trade.get('trade')} operations."
        ]

        gap_areas = synthesis.get("gapAreas") or [
            "Physical execution speed and formal schematic interpretation requires verification."
        ]

        bridge_modules = synthesis.get("bridgeTrainingModules") or [
            f"Module 1: NSQF Level {nsqf_level} Industrial Safety and BIS/IS Standards",
            "Module 2: Technical Schematics and Digital Job-Card Documentation"
        ]

        # 4. Stage 4: Anti-Fraud Verification Audit (preserves client data if provided; does not fabricate)
        anti_fraud_audit = self._verify_anti_fraud_audit(anti_fraud_input)

        return AssessmentResponse(
            tradeId=trade.get("id"),
            tradeTitle=trade.get("trade"),
            qpCode=trade.get("qpCode"),
            nsqfLevel=nsqf_level,
            candidateId=candidate_id,
            overallScore=overall_score,
            status=status,
            recommendation=recommendation,
            confidenceScore=float(synthesis.get("confidenceScore", 0.75)),
            evidencePresent={
                "hasPracticalPhoto": has_image,
                "hasVivaExplanation": has_viva
            },
            visionAnalysis=vision_data,
            vivaTranscript=viva_transcript_data,
            nosResults=nos_results,
            strengths=strengths,
            gapAreas=gap_areas,
            bridgeTrainingModules=bridge_modules,
            assessorSignOffRequired=True,
            antiFraudAudit=anti_fraud_audit
        )

    def _process_viva(self, raw_answer: str, trade: Dict[str, Any]) -> VivaTranscriptResult:
        if not raw_answer or not raw_answer.strip():
            return VivaTranscriptResult(
                transcript=None,
                transcriptEnglish=None,
                languageDetected="none",
                technicalKeywordsFound=[],
                conceptClarityRating="Not Assessed",
                bhashiniTranslationUsed=False,
                timestampCitations=[]
            )

        # Call Bhashini service for translation/transliteration
        bhashini_res = self.bhashini.process_speech_and_translation(raw_answer)
        gemini_result = self.gemini.analyze_viva_explanation(raw_answer, trade)

        return VivaTranscriptResult(
            transcript=raw_answer,
            transcriptEnglish=gemini_result.get("transcriptEnglish") or bhashini_res.get("englishTranslation") or raw_answer,
            languageDetected=gemini_result.get("languageDetected") or bhashini_res.get("sourceLanguage", "hi-IN"),
            technicalKeywordsFound=gemini_result.get("technicalKeywordsFound", []),
            conceptClarityRating=gemini_result.get("conceptClarityRating", "Moderate"),
            bhashiniTranslationUsed=bhashini_res.get("liveProviderConnected", False),
            timestampCitations=[]
        )

    def _analyze_practical_vision(
        self, 
        image_path: Optional[str], 
        trade: Dict[str, Any],
        image_base64: Optional[str] = None
    ) -> VisionAnalysisResult:
        gemini_result = self.gemini.analyze_practical_vision(image_path, trade, image_base64=image_base64)

        bounding_boxes: List[VisionBoundingBox] = []
        for box in gemini_result.get("boundingBoxes", []):
            bounding_boxes.append(VisionBoundingBox(
                label=box.get("label", "Object"),
                box_2d=box.get("box_2d", [0.0, 0.0, 0.0, 0.0]),
                confidence=float(box.get("confidence", 0.8)),
                pcCode=box.get("pcCode")
            ))

        return VisionAnalysisResult(
            imageAudited=gemini_result.get("imageAudited", False),
            ppeCompliance=gemini_result.get("ppeCompliance", {
                "helmetDetected": None,
                "glovesDetected": None,
                "safetyShoesVerified": None,
                "ppeScore": 0,
                "remarks": "Image not submitted."
            }),
            workmanshipQuality=gemini_result.get("workmanshipQuality", {
                "toolHandling": "Unassessed",
                "finishing": "Unassessed",
                "neatnessScore": 0
            }),
            toolsIdentified=gemini_result.get("toolsIdentified", []),
            boundingBoxes=bounding_boxes
        )

    def _parse_nos_results(
        self,
        nos_data: List[Dict[str, Any]],
        trade: Dict[str, Any],
        has_viva: bool,
        has_image: bool
    ) -> List[NOSResult]:
        trade_nos_list = trade.get("nosList", [])
        results: List[NOSResult] = []

        nos_map = {n.get("nosCode"): n for n in nos_data if isinstance(n, dict)}

        for nos in trade_nos_list:
            nos_code = nos.get("nosCode")
            synthesis_item = nos_map.get(nos_code, {})
            weight = int(nos.get("weightage", 25))

            score = int(synthesis_item.get("score", 70 if (has_viva and has_image) else (40 if has_image else 0)))
            status = "partially_supported" if score >= 60 else ("insufficient_evidence" if score > 0 else "evidence_missing")

            pcs: List[PerformanceCriterionResult] = []
            for pc in nos.get("performanceCriteria", []):
                parts = pc.split(":", 1)
                code = parts[0].strip() if len(parts) > 1 else "PC"
                desc = parts[1].strip() if len(parts) > 1 else pc

                pc_status = "partially_supported" if (has_viva or has_image) else "evidence_missing"
                pc_score = score if (has_viva or has_image) else 0

                pcs.append(PerformanceCriterionResult(
                    code=code,
                    description=desc,
                    status=pc_status,
                    score=pc_score,
                    evidence="Evidence observed from multimodal upload." if (has_viva or has_image) else "Evidence missing."
                ))

            results.append(NOSResult(
                nosCode=nos_code,
                title=nos.get("title", "Core Operations"),
                weightage=weight,
                score=score,
                status=status,
                performanceCriteria=pcs,
                feedback=synthesis_item.get("feedback", f"Criteria evaluation for {nos.get('title')}.")
            ))

        return results

    def _verify_anti_fraud_audit(self, anti_fraud_input: Optional[Dict[str, Any]]) -> Optional[AntiFraudAudit]:
        if not anti_fraud_input:
            return None

        return AntiFraudAudit(
            geoTag=anti_fraud_input.get("geoLocation") or anti_fraud_input.get("geoTag"),
            livenessVerified=bool(anti_fraud_input.get("livenessVerified", False)),
            confidence=float(anti_fraud_input.get("confidence", 0.0)) if anti_fraud_input.get("confidence") is not None else None,
            gestureRecognized=anti_fraud_input.get("gestureRecognized"),
            antiSpoofCheck=anti_fraud_input.get("antiSpoofCheck", "Client verified; subject to assessor review"),
            capturedAt=anti_fraud_input.get("capturedAt")
        )

langgraph_pipeline = LangGraphAssessmentPipeline()
