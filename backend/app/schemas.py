from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class Skill(BaseModel):
    name: str
    importance: str = "must"
    present: bool = False
    evidence: str = ""


class AnalyzeResponse(BaseModel):
    id: int
    job_title: str
    company: str
    match_score: float
    semantic_score: float
    keyword_score: float
    skills: list[Skill]
    summary: str
    tips: list[str]
    resume_text: str


class TextPair(BaseModel):
    resume_text: str = Field(min_length=50)
    job_description: str = Field(min_length=50)


class CoverLetterRequest(TextPair):
    tone: str = "professional"
    candidate_name: str = ""


class InterviewRequest(TextPair):
    count: int = Field(default=5, ge=3, le=10)


class GradeRequest(BaseModel):
    question: str
    answer: str = Field(min_length=10)
    job_description: str = ""


class HistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    job_title: str
    company: str
    match_score: float
