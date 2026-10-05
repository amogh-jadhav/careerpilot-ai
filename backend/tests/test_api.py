import os

os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["EMBEDDING_PROVIDER"] = "api"  # don't load the model during tests

from fastapi.testclient import TestClient  # noqa: E402

from app import main  # noqa: E402
from app.database import init_db  # noqa: E402
from app.matcher import keyword_score, verify_presence  # noqa: E402

init_db()
client = TestClient(main.app)


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_keyword_score_weights_must_skills_double():
    skills = [
        {"name": "Python", "importance": "must", "present": True},
        {"name": "Docker", "importance": "nice", "present": False},
    ]
    assert keyword_score(skills) == 66.7


def test_verify_presence_catches_literal_skill():
    out = verify_presence([{"name": "SQL", "present": False}], "Built SQL dashboards for sales")
    assert out[0]["present"] is True


def test_tailor_returns_llm_json(monkeypatch):
    fake = {"headline": "Data Analyst", "bullets": [{"original": "a", "improved": "b", "why": "c"}]}
    monkeypatch.setattr(main, "chat_json", lambda system, user: fake)
    body = {"resume_text": "x" * 60, "job_description": "y" * 60}
    r = client.post("/api/tailor", json=body)
    assert r.status_code == 200
    assert r.json()["headline"] == "Data Analyst"
