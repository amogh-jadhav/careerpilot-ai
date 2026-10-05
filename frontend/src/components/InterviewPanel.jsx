import { useState } from 'react';
import { gradeAnswer, interviewQuestions } from '../api';
import { Button, ErrorBox } from './ui';

function List({ title, items = [] }) {
  return (
    <div>
      <p className="mb-1 font-semibold">{title}</p>
      <ul className="list-disc space-y-1 pl-5 text-slate-300">
        {items.map((x, i) => <li key={i}>{x}</li>)}
      </ul>
    </div>
  );
}

function QuestionCard({ q, index, jobDescription }) {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const grade = async () => {
    setLoading(true);
    setError('');
    try {
      setFeedback(await gradeAnswer(q.question, answer, jobDescription));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = !feedback
    ? ''
    : feedback.score >= 8 ? 'text-emerald-400' : feedback.score >= 5 ? 'text-amber-300' : 'text-rose-400';

  return (
    <div className="space-y-3 rounded-xl border border-white/10 p-4">
      <div className="flex items-start gap-3">
        <span className="rounded-lg bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-300">Q{index + 1}</span>
        <div>
          <p className="font-medium">{q.question}</p>
          <p className="mt-1 text-xs text-slate-400">
            <span className="capitalize">{q.type}</span> · {q.what_good_looks_like}
          </p>
        </div>
      </div>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer as you would say it..."
        className="min-h-28 w-full rounded-xl border border-white/10 bg-slate-900/60 p-3 text-sm outline-none focus:border-indigo-400"
      />
      <ErrorBox message={error} />
      <Button loading={loading} onClick={grade} disabled={answer.trim().length < 10} className="px-4 py-2 text-sm">
        Grade my answer
      </Button>

      {feedback && (
        <div className="space-y-3 rounded-xl bg-white/5 p-4 text-sm">
          <p className={`text-2xl font-bold ${scoreColor}`}>{feedback.score}/10</p>
          <List title="Strengths" items={feedback.strengths} />
          <List title="Improve" items={feedback.improvements} />
          <div>
            <p className="mb-1 font-semibold">Stronger answer</p>
            <p className="whitespace-pre-line text-slate-300">{feedback.better_answer}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InterviewPanel({ resumeText, jobDescription }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await interviewQuestions(resumeText, jobDescription, 5);
      setQuestions(res.questions || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {questions.length === 0 && (
        <p className="text-slate-300">
          Practice 5 questions this employer is likely to ask. Type your answer and get a score plus a stronger sample answer.
        </p>
      )}
      <ErrorBox message={error} />
      <Button loading={loading} onClick={run}>{questions.length ? 'New questions' : 'Start mock interview'}</Button>
      {questions.map((q, i) => (
        <QuestionCard key={`${i}-${q.question}`} index={i} q={q} jobDescription={jobDescription} />
      ))}
    </div>
  );
}
