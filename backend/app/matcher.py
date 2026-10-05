import re
from functools import lru_cache

import numpy as np

from .config import settings


@lru_cache
def get_model():
    """Load the embedding model once. Returns None in API mode."""
    if settings.embedding_provider == "api":
        return None
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(settings.embedding_model)


def embed(texts: list[str]) -> np.ndarray:
    if settings.embedding_provider == "api":
        from huggingface_hub import InferenceClient

        client = InferenceClient(token=settings.hf_token)
        vectors = [
            np.asarray(client.feature_extraction(t, model=settings.embedding_model)).reshape(-1)
            for t in texts
        ]
    else:
        vectors = get_model().encode(texts)
    vectors = np.asarray(vectors, dtype=float)
    norms = np.linalg.norm(vectors, axis=1, keepdims=True).clip(min=1e-9)
    return vectors / norms


def _chunks(text: str, size: int = 80) -> list[str]:
    words = text.split()
    return [" ".join(words[i : i + size]) for i in range(0, len(words), size)] or [""]


def semantic_score(resume: str, jd: str) -> float:
    """For each chunk of the job post, find the best-matching resume chunk; average them."""
    sims = embed(_chunks(jd)) @ embed(_chunks(resume)).T
    best = float(sims.max(axis=1).mean())
    # MiniLM similarities for related text usually fall between 0.2 and 0.8; rescale to 0-100.
    return round(max(0.0, min(1.0, (best - 0.2) / 0.6)) * 100, 1)


def verify_presence(skills: list[dict], resume_text: str) -> list[dict]:
    """Clean the LLM's skill list and double-check with an exact text search."""
    text = resume_text.lower()
    cleaned = []
    for s in skills:
        name = str(s.get("name", "")).strip()
        if not name:
            continue
        pattern = rf"(?<![a-z0-9]){re.escape(name.lower())}(?![a-z0-9])"
        cleaned.append(
            {
                "name": name,
                "importance": "nice" if s.get("importance") == "nice" else "must",
                "present": bool(s.get("present")) or re.search(pattern, text) is not None,
                "evidence": str(s.get("evidence") or "")[:200],
            }
        )
    return cleaned


def keyword_score(skills: list[dict]) -> float:
    if not skills:
        return 0.0
    weight = {"must": 2, "nice": 1}
    total = sum(weight.get(s.get("importance"), 1) for s in skills)
    got = sum(weight.get(s.get("importance"), 1) for s in skills if s.get("present"))
    return round(got / total * 100, 1)


def final_score(semantic: float, keyword: float) -> float:
    return round(0.4 * semantic + 0.6 * keyword, 1)
