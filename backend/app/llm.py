import json
import re

from huggingface_hub import InferenceClient
from openai import OpenAI

from .config import settings

_openai_client = None
_hf_client = None


def _chat(messages: list[dict], temperature: float = 0.4, max_tokens: int = 1500) -> str:
    global _openai_client, _hf_client

    if settings.llm_provider == "huggingface":
        if _hf_client is None:
            _hf_client = InferenceClient(model=settings.hf_model, token=settings.hf_token)
        resp = _hf_client.chat_completion(messages=messages, max_tokens=max_tokens, temperature=temperature)
        return resp.choices[0].message.content

    if not settings.openai_api_key or settings.openai_api_key.startswith("sk-your"):
        raise RuntimeError("OPENAI_API_KEY is not set. Put your real key in backend/.env and restart the server.")
    if _openai_client is None:
        _openai_client = OpenAI(api_key=settings.openai_api_key)
    resp = _openai_client.chat.completions.create(
        model=settings.openai_model,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return resp.choices[0].message.content


def chat_text(system: str, user: str) -> str:
    messages = [{"role": "system", "content": system}, {"role": "user", "content": user}]
    return _chat(messages, temperature=0.6).strip()


def chat_json(system: str, user: str) -> dict:
    messages = [
        {"role": "system", "content": system + "\nRespond with valid JSON only. No markdown fences."},
        {"role": "user", "content": user},
    ]
    return _parse_json(_chat(messages, temperature=0.2))


def _parse_json(raw: str) -> dict:
    """Models sometimes wrap JSON in ``` fences or add text. Recover the object."""
    cleaned = re.sub(r"^```(?:json)?|```$", "", raw.strip(), flags=re.MULTILINE).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        raise ValueError("The AI model did not return valid JSON.")
