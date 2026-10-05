const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function handle(res) {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      message = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
    } catch {
      /* response was not JSON */
    }
    throw new Error(message);
  }
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handle(res);
}

export async function analyze(file, jobDescription) {
  const form = new FormData();
  form.append('resume', file);
  form.append('job_description', jobDescription);
  return handle(await fetch(`${BASE}/api/analyze`, { method: 'POST', body: form }));
}

export const tailor = (resume_text, job_description) =>
  post('/api/tailor', { resume_text, job_description });

export const coverLetter = (payload) => post('/api/cover-letter', payload);

export const interviewQuestions = (resume_text, job_description, count = 5) =>
  post('/api/interview/questions', { resume_text, job_description, count });

export const gradeAnswer = (question, answer, job_description) =>
  post('/api/interview/grade', { question, answer, job_description });

export const getHistory = async () => handle(await fetch(`${BASE}/api/history`));
