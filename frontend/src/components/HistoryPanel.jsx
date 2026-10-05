import { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getHistory } from '../api';
import { ErrorBox } from './ui';

export default function HistoryPanel() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getHistory().then(setRows).catch((e) => setError(e.message));
  }, []);

  const chartData = [...rows].reverse().map((r, i) => ({ n: i + 1, score: r.match_score, role: r.job_title }));

  return (
    <div className="space-y-6">
      <ErrorBox message={error} />
      {chartData.length > 1 && (
        <div className="h-56">
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="n" stroke="#94a3b8" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                formatter={(value, _name, item) => [value, item.payload.role]}
              />
              <Line type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <table className="w-full text-sm">
        <thead className="text-left text-slate-400">
          <tr>
            <th className="pb-2">Date</th>
            <th className="pb-2">Role</th>
            <th className="pb-2 text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-white/5">
              <td className="py-2 text-slate-400">{new Date(r.created_at).toLocaleDateString()}</td>
              <td className="py-2">
                {r.job_title}
                {r.company && <span className="text-slate-400"> · {r.company}</span>}
              </td>
              <td className="py-2 text-right font-semibold">{Math.round(r.match_score)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
