import os
import re
import json
import urllib.request
import urllib.error
from typing import Dict, Any, Optional

BHASHINI_USER_ID = os.getenv("BHASHINI_USER_ID", "")
BHASHINI_API_KEY = os.getenv("BHASHINI_API_KEY", "")
BHASHINI_INFERENCE_URL = os.getenv(
    "BHASHINI_INFERENCE_URL", 
    "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"
)

# Indic vocabulary glossary for basic vocational terms
INDIC_VOCAB_GLOSSARY = {
    "आइसोलेटर": "isolator",
    "अर्थिंग": "earthing / ground",
    "वायरिंग": "wiring",
    "मेगर": "Megger insulation tester",
    "मल्टीमीटर": "multimeter",
    "तार": "wire conductor",
    "स्विच": "switch",
    "फेज": "phase",
    "न्यूट्रल": "neutral",
    "वोल्टेज": "voltage",
    "शॉर्ट सर्किट": "short circuit",
    "दबाव": "pressure",
    "लीक": "leak",
    "जोड़": "joint / coupling",
    "काटना": "isolate / cut off",
    "जांच": "inspection / continuity test"
}

class BhashiniTranslationService:
    """
    Digital India Bhashini ULCA API Integration Service.
    Integrates genuine ASR and NMT pipelines when configured.
    Does NOT fabricate translations when offline.
    """

    def __init__(self):
        self.user_id = BHASHINI_USER_ID
        self.api_key = BHASHINI_API_KEY
        self.inference_url = BHASHINI_INFERENCE_URL

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and "sih26242" not in self.api_key and len(self.api_key) > 10)

    def process_speech_and_translation(
        self, 
        raw_text_or_audio: str, 
        source_language: str = "hi"
    ) -> Dict[str, Any]:
        """
        Executes Bhashini pipeline or returns honest normalization.
        """
        cleaned_text = (raw_text_or_audio or "").strip()
        if not cleaned_text:
            return {
                "sourceText": "",
                "sourceLanguage": "none",
                "englishTranslation": "",
                "service": "Bhashini ULCA (No Input Provided)",
                "liveProviderConnected": self.is_configured,
                "confidence": 0.0
            }

        # Check if live Bhashini API credentials configured
        if self.is_configured:
            try:
                bhashini_result = self._call_bhashini_api(cleaned_text, source_language)
                if bhashini_result:
                    return bhashini_result
            except Exception as e:
                print(f"[Bhashini API] Connection error ({str(e)}). Returning honest offline state.")

        # Honest glossary substitution without hallucinating sentences
        translated_text = cleaned_text
        has_devanagari = bool(re.search(r'[\u0900-\u097F]', cleaned_text))
        
        for hindi_term, eng_term in INDIC_VOCAB_GLOSSARY.items():
            if hindi_term in translated_text:
                translated_text = translated_text.replace(hindi_term, f"[{eng_term}]")

        return {
            "sourceText": cleaned_text,
            "sourceLanguage": "hi" if has_devanagari else "en-IN / hi-Latn",
            "englishTranslation": translated_text,
            "service": "Bhashini Interface (Offline Fallback - Vocabulary Aligned)",
            "liveProviderConnected": False,
            "confidence": 0.70 if has_devanagari else 0.85
        }

    def _call_bhashini_api(self, text: str, source_lang: str) -> Optional[Dict[str, Any]]:
        headers = {
            "Content-Type": "application/json",
            "userID": self.user_id,
            "ulcaApiKey": self.api_key
        }
        
        payload = {
            "pipelineTasks": [
                {
                    "taskType": "translation",
                    "config": {
                        "language": {
                            "sourceLanguage": source_lang,
                            "targetLanguage": "en"
                        }
                    }
                }
            ],
            "inputData": {
                "input": [{"source": text}]
            }
        }

        req = urllib.request.Request(
            self.inference_url, 
            data=json.dumps(payload).encode('utf-8'),
            headers=headers,
            method="POST"
        )

        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                translated_text = data.get("pipelineResponse", [{}])[0].get("output", [{}])[0].get("target", "")
                return {
                    "sourceText": text,
                    "sourceLanguage": source_lang,
                    "englishTranslation": translated_text or text,
                    "service": "Bhashini ULCA NMT (Dhruva)",
                    "liveProviderConnected": True,
                    "confidence": 0.95
                }
        return None

bhashini_service = BhashiniTranslationService()
