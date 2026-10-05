import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { tailor } from '../api';
import { Button, CopyButton, ErrorBox } from './ui';

export default function TailorPanel({ resumeText, jobDescription }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    setLoading(true);
    setError('');
    try {
      setData(await tailor(resumeText, jobDescription));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="space-y-4">
        <p className="text-slate-300">
          Rewrite your 6 most relevant bullet points in this job's language. Nothing is invented — unknown
          numbers appear as [X] for you to fill in.
        </p>
        <ErrorBox message={error} />
        <Button loading={loading} onClick={run}>Tailor my resume</Button>
      </div>
    );
  }

  const bullets = data.bullets || [];
  const allText = [data.headline, ...bullets.map((b) => `• ${b.improved}`)].join('\n');

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 rounded-xl bg-indigo-500/10 p-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-indigo-300">Headline</p>
          <p className="font-semibold">{data.headline}</p>
        </div>
        <CopyButton text={allText} />
      </div>

      {bullets.map((b, i) => (
        <div key={i} className="grid gap-3 rounded-xl border border-white/10 p-4 md:grid-cols-[1fr_auto_1fr]">
          <p className="text-sm text-slate-400">{b.original}</p>
          <ArrowRight className="hidden h-4 w-4 self-center text-indigo-400 md:block" />
          <div>
            <p className="text-sm text-slate-100">{b.improved}</p>
            <p className="mt-1 text-xs text-slate-400">{b.why}</p>
          </div>
        </div>
      ))}

      <ErrorBox message={error} />
      <Button loading={loading} onClick={run} className="bg-white/10 shadow-none hover:bg-white/20">
        Regenerate
      </Button>
    </div>
  );
}
