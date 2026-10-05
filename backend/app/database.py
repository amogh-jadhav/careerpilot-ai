from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, Session, SQLModel, create_engine

from .config import settings

connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=connect_args)


class Analysis(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    job_title: str = ""
    company: str = ""
    match_score: float = 0
    semantic_score: float = 0
    keyword_score: float = 0
    matched_skills: str = "[]"  # JSON list of skill names
    missing_skills: str = "[]"  # JSON list of skill names
    result_json: str = "{}"  # full LLM output, for debugging


def init_db() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
