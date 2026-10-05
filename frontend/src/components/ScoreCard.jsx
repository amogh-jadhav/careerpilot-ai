import { Lightbulb } from 'lucide-react';
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';
import { Card } from './ui';

const colorFor = (s) => (s >= 75 ? '#34d399' : s >= 50 ? '#fbbf24' : '#fb7185');
const labelFor = (s) => (s >= 75 ? 'Strong match' : s >= 50 ? 'Promising — close the gaps' : 'Stretch role');

function Meter({ label, value }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-indigo-400" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function ScoreCard({ analysis }) {
  const { match_score, semantic_score, keyword_score, job_title, company, summary, tips } = analysis;
  const color = colorFor(match_score);

  return (
    <Card className="flex flex-col gap-5">
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-400">Match for</p>
        <h2 className="text-lg font-semibold">
          {job_title}
          {company && <span className="text-slate-400"> · {company}</span>}
        </h2>
      </div>

      <div className="relative h-48">
        <ResponsiveContainer>
          <RadialBarChart innerRadius="75%" outerRadius="100%" data={[{ value: match_score }]} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={12} fill={color} background={{ fill: 'rgba(255,255,255,0.08)' }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold" style={{ color }}>{Math.round(match_score)}</span>
          <span className="text-xs text-slate-400">{labelFor(match_score)}</span>
        </div>
      </div>

      <div className="space-y-3">
        <Meter label="Skill coverage" value={keyword_score} />
        <Meter label="Semantic similarity" value={semantic_score} />
      </div>

      <p className="text-sm text-slate-300">{summary}</p>

      <div className="space-y-2">
        {tips.map((tip, i) => (
          <div key={i} className="flex gap-2 text-sm text-slate-300">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            {tip}
          </div>
        ))}
      </div>
    </Card>
  );
}
