import { useState } from 'react';
import { Download } from 'lucide-react';
import { coverLetter } from '../api';
import { Button, CopyButton, ErrorBox } from './ui';

const TONES = ['professional', 'enthusiastic', 'confident', 'friendly'];
const field =
  'rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm outline-none focus:border-indigo-400';

export default function CoverLetterPanel({ resumeText, jobDescription }) {
  const [tone, setTone] = useState('professional');
  const [name, setName] = useState('');
  const [letter, setLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await coverLetter({
        resume_text: resumeText,
        job_description: jobDescription,
        tone,
        candidate_name: name,
      });
      setLetter(res.cover_letter);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([letter], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cover-letter.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={field} />
        <select value={tone} onChange={(e) => setTone(e.target.value)} className={`${field} capitalize`}>
          {TONES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <ErrorBox message={error} />
      <Button loading={loading} onClick={run}>{letter ? 'Rewrite' : 'Write my cover letter'}</Button>

      {letter && (
        <div className="space-y-2">
          <div className="flex justify-end gap-2">
            <CopyButton text={letter} />
            <button
              onClick={download}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-300 hover:bg-white/10"
            >
              <Download className="h-3.5 w-3.5" /> .txt
            </button>
          </div>
          <textarea
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
            className="min-h-96 w-full rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm leading-relaxed outline-none focus:border-indigo-400"
          />
        </div>
      )}
    </div>
  );
}
