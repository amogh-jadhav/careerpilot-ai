import json
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from . import prompts
from .config import settings
from .database import Analysis, get_session, init_db
from .llm import chat_json, chat_text
from .matcher import final_score, get_model, keyword_score, semantic_score, verify_presence
from .pdf_utils import pdf_to_text
from .schemas import (
    AnalyzeResponse,
    CoverLetterRequest,
    GradeRequest,
    HistoryItem,
    InterviewRequest,
    Skill,
    TextPair,
)

MAX_PDF_BYTES = 5 * 1024 * 1024  # 5 MB


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    get_model()  # load the embedding model once, at startup
    yield


app = FastAPI(title="CareerPilot AI", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.frontend_origins.split(",")],
    allow_methods=["*"],
    allow_headers=["*"],
)


async def llm_json(system: str, user: str) -> dict:
    try:
        return await run_in_threadpool(chat_json, system, user)
    except Exception as exc:  # network, quota, bad JSON, missing key
        raise HTTPException(status_code=502, detail=f"AI service error: {exc}")


async def llm_text(system: str, user: str) -> str:
    try:
        return await run_in_threadpool(chat_text, system, user)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI service error: {exc}")


@app.get("/")
def root():
    return {"message": "CareerPilot AI API is running. Open /docs to try it."}


@app.get("/api/health")
def health():
    return {"status": "ok", "provider": settings.llm_provider}


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    session: Session = Depends(get_session),
):
    if not (resume.filename or "").lower().endswith(".pdf"):
        raise HTTPException(400, "Please upload your resume as a PDF.")
    data = await resume.read()
    if len(data) > MAX_PDF_BYTES:
        raise HTTPException(413, "The PDF is larger than 5 MB.")

    resume_text = pdf_to_text(data)
    if len(resume_text) < 100:
        raise HTTPException(
            422, "Couldn't read text from this PDF. If it is a scan, export it again from Word or Google Docs."
        )
    if len(job_description.strip()) < 50:
        raise HTTPException(422, "Please paste the full job description.")

    result = await llm_json(prompts.SKILLS_SYSTEM, prompts.skills_user(resume_text, job_description))
    skills = verify_presence(result.get("skills", []), resume_text)
    sem = await run_in_threadpool(semantic_score, resume_text, job_description)
    kw = keyword_score(skills)
    score = final_score(sem, kw)

    record = Analysis(
        job_title=result.get("job_title") or "Untitled role",
        company=result.get("company") or "",
        match_score=score,
        semantic_score=sem,
        keyword_score=kw,
        matched_skills=json.dumps([s["name"] for s in skills if s["present"]]),
        missing_skills=json.dumps([s["name"] for s in skills if not s["present"]]),
        result_json=json.dumps(result),
    )
    session.add(record)
    session.commit()
    session.refresh(record)

    return AnalyzeResponse(
        id=record.id,
        job_title=record.job_title,
        company=record.company,
        match_score=score,
        semantic_score=sem,
        keyword_score=kw,
        skills=[Skill(**s) for s in skills],
        summary=result.get("summary", ""),
        tips=result.get("tips", []),
        resume_text=resume_text,
    )


@app.post("/api/tailor")
async def tailor(req: TextPair):
    return await llm_json(prompts.TAILOR_SYSTEM, prompts.tailor_user(req.resume_text, req.job_description))


@app.post("/api/cover-letter")
async def cover_letter(req: CoverLetterRequest):
    text = await llm_text(
        prompts.COVER_SYSTEM,
        prompts.cover_user(req.resume_text, req.job_description, req.tone, req.candidate_name),
    )
    return {"cover_letter": text}


@app.post("/api/interview/questions")
async def interview_questions(req: InterviewRequest):
    return await llm_json(
        prompts.INTERVIEW_SYSTEM,
        prompts.interview_user(req.resume_text, req.job_description, req.count),
    )


@app.post("/api/interview/grade")
async def interview_grade(req: GradeRequest):
    return await llm_json(
        prompts.GRADE_SYSTEM,
        prompts.grade_user(req.question, req.answer, req.job_description),
    )


@app.get("/api/history", response_model=list[HistoryItem])
def history(session: Session = Depends(get_session)):
    statement = select(Analysis).order_by(Analysis.created_at.desc()).limit(50)
    return session.exec(statement).all()


@app.get("/api/analytics")
def analytics(session: Session = Depends(get_session)):
    rows = session.exec(select(Analysis).order_by(Analysis.created_at)).all()
    return [
        {
            "id": r.id,
            "created_at": r.created_at.isoformat(),
            "job_title": r.job_title,
            "company": r.company,
            "match_score": r.match_score,
            "semantic_score": r.semantic_score,
            "keyword_score": r.keyword_score,
            "matched_skills": json.loads(r.matched_skills),
            "missing_skills": json.loads(r.missing_skills),
        }
        for r in rows
    ]
