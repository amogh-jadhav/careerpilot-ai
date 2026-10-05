SKILLS_SYSTEM = """You are an expert technical recruiter and ATS analyst.
You compare a candidate's resume with a job description precisely and honestly.
Never claim a skill is present unless the resume clearly shows it."""


def skills_user(resume: str, jd: str) -> str:
    return f"""Analyse the JOB DESCRIPTION and the RESUME below.

Return JSON with exactly this shape:
{{
  "job_title": "string",
  "company": "string or empty",
  "skills": [
    {{"name": "short skill name", "importance": "must" or "nice",
      "present": true or false, "evidence": "short quote from resume or empty"}}
  ],
  "summary": "2 sentences: overall fit and the biggest gap",
  "tips": ["3 specific, actionable tips to improve this application"]
}}

Rules:
- List 8 to 15 skills, most important first, with short names (e.g. "Python", "REST APIs").
- "must" = stated as required; "nice" = preferred or bonus.
- Decide "present" only from the resume text.

JOB DESCRIPTION:
{jd[:6000]}

RESUME:
{resume[:8000]}"""


TAILOR_SYSTEM = """You are a professional resume writer. You rewrite resume bullet points so they
match a target job, using strong action verbs and measurable results.
You NEVER invent employers, numbers, tools or experience the resume does not contain.
If a number is unknown, write [X] as a placeholder for the candidate to fill in."""


def tailor_user(resume: str, jd: str) -> str:
    return f"""Pick the 6 resume bullet points (or experience sentences) most relevant to the job
and rewrite each in the job description's language.

Return JSON:
{{"headline": "one-line professional headline tailored to this job",
  "bullets": [{{"original": "...", "improved": "...", "why": "one short reason"}}]}}

JOB DESCRIPTION:
{jd[:6000]}

RESUME:
{resume[:8000]}"""


COVER_SYSTEM = """You write concise, specific cover letters that sound human, not generic.
Avoid cliches such as "I am writing to express my interest". Use only facts from the resume."""


def cover_user(resume: str, jd: str, tone: str, name: str) -> str:
    return f"""Write a cover letter of about 250 words in a {tone} tone, signed by {name or "the candidate"}.
Structure: a hook tied to the company or role; two short paragraphs mapping the candidate's
strongest relevant experience to the job's needs; a confident closing line.
Plain text only. Address it to [Hiring Manager] if no name is known.

JOB DESCRIPTION:
{jd[:6000]}

RESUME:
{resume[:8000]}"""


INTERVIEW_SYSTEM = """You are a senior hiring manager preparing a structured interview."""


def interview_user(resume: str, jd: str, count: int) -> str:
    return f"""Create {count} interview questions for this candidate and job. Mix technical and
behavioral questions, and include at least one that probes the candidate's weakest area.

Return JSON:
{{"questions": [{{"question": "...", "type": "technical" or "behavioral",
  "what_good_looks_like": "1-2 sentences on what a strong answer covers"}}]}}

JOB DESCRIPTION:
{jd[:6000]}

RESUME:
{resume[:6000]}"""


GRADE_SYSTEM = """You are a supportive but honest interview coach."""


def grade_user(question: str, answer: str, jd: str) -> str:
    return f"""Grade the candidate's answer to this interview question.

Return JSON:
{{"score": integer from 1 to 10,
  "strengths": ["..."],
  "improvements": ["..."],
  "better_answer": "a stronger first-person answer under 150 words; use STAR for behavioral questions"}}

QUESTION: {question}
ANSWER: {answer}
JOB DESCRIPTION (context): {jd[:3000]}"""
