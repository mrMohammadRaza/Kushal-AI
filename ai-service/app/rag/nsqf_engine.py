import json
import os
import re
from typing import Dict, Any, List, Optional

def _resolve_data_path():
    local_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "nsqf_standards.json"))
    if os.path.exists(local_path):
        return local_path
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "nsqf_standards.json"))

DATA_PATH = _resolve_data_path()

class NSQFRAGEngine:
    def __init__(self, data_path: str = None):
        self.data_path = data_path or _resolve_data_path()
        self.standards: Dict[str, Any] = {}
        self.trades_by_id: Dict[str, Any] = {}
        self.corpus: List[Dict[str, Any]] = []
        self.load_standards()

    def load_standards(self):
        if not os.path.exists(self.data_path):
            print(f"[NSQF RAG] Warning: {self.data_path} not found.")
            return

        with open(self.data_path, "r", encoding="utf-8") as f:
            self.standards = json.load(f)

        for trade in self.standards.get("trades", []):
            trade_id = trade.get("id")
            self.trades_by_id[trade_id] = trade
            
            # Index performance criteria for retrieval
            for nos in trade.get("nosList", []):
                for pc in nos.get("performanceCriteria", []):
                    self.corpus.append({
                        "tradeId": trade_id,
                        "tradeTitle": trade.get("trade"),
                        "nosCode": nos.get("nosCode"),
                        "nosTitle": nos.get("title"),
                        "text": pc,
                        "type": "performance_criterion"
                    })
                for kc in nos.get("knowledgeCriteria", []):
                    self.corpus.append({
                        "tradeId": trade_id,
                        "tradeTitle": trade.get("trade"),
                        "nosCode": nos.get("nosCode"),
                        "nosTitle": nos.get("title"),
                        "text": kc,
                        "type": "knowledge_criterion"
                    })

    def get_trade(self, trade_id: str) -> Optional[Dict[str, Any]]:
        return self.trades_by_id.get(trade_id)

    def search_competencies(self, query: str, trade_id: Optional[str] = None, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Token-overlap & relevance ranking against NSQF criteria.
        """
        query_tokens = set(re.findall(r"\w+", query.lower()))
        results = []

        for item in self.corpus:
            if trade_id and item["tradeId"] != trade_id:
                continue

            item_tokens = set(re.findall(r"\w+", item["text"].lower()))
            overlap = query_tokens.intersection(item_tokens)
            score = len(overlap) / (len(query_tokens) + 1e-5)

            if score > 0:
                results.append((score, item))

        results.sort(key=lambda x: x[0], reverse=True)
        return [r[1] for r in results[:top_k]]

nsqf_rag_engine = NSQFRAGEngine()
