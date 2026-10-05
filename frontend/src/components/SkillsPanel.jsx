import { CheckCircle2, XCircle } from 'lucide-react';

function Column({ title, items, good }) {
  return (
    <div>
      <h3 className="mb-3 font-semibold">{title}</h3>
      <ul className="space-y-2">
        {items.map((s) => (
          <li
            key={s.name}
            className={`rounded-xl border p-3 ${good ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}
          >
            <div className="flex items-center gap-2">
              {good ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-rose-400" />}
              <span className="font-medium">{s.name}</span>
              <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
                {s.importance === 'must' ? 'Required' : 'Bonus'}
              </span>
            </div>
            {s.evidence && <p className="mt-1 text-xs text-slate-400">“{s.evidence}”</p>}
            {!good && (
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(s.name + ' tutorial')}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-xs text-indigo-300 hover:underline"
              >
                Learn it →
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SkillsPanel({ skills }) {
  const have = skills.filter((s) => s.present);
  const missing = skills.filter((s) => !s.present);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Column title={`You have (${have.length})`} items={have} good />
      <Column title={`Missing (${missing.length})`} items={missing} />
    </div>
  );
}
