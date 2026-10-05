import { useState } from 'react';
import { FileText, History, Mail, MessageSquare, Sparkles, Target } from 'lucide-react';
import UploadPanel from './components/UploadPanel';
import ScoreCard from './components/ScoreCard';
import SkillsPanel from './components/SkillsPanel';
import TailorPanel from './components/TailorPanel';
import CoverLetterPanel from './components/CoverLetterPanel';
import InterviewPanel from './components/InterviewPanel';
import HistoryPanel from './components/HistoryPanel';

const TABS = [
  { id: 'skills', label: 'Skill gaps', icon: Target },
  { id: 'resume', label: 'Tailored resume', icon: FileText },
  { id: 'cover', label: 'Cover letter', icon: Mail },
  { id: 'interview', label: 'Mock interview', icon: MessageSquare },
  { id: 'history', label: 'History', icon: History },
];

export default function App() {
  const [analysis, setAnalysis] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [tab, setTab] = useState('skills');

  const shared = { resumeText: analysis?.resume_text, jobDescription };
  const show = (id) => (tab === id ? '' : 'hidden');

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.25),transparent_60%)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="h-6 w-6 text-indigo-400" />
          CareerPilot <span className="text-indigo-400">AI</span>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">Your AI job-application copilot</span>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20">
        {!analysis && (
          <section className="py-10 text-center md:py-16">
            <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
              Land the interview,
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                not the rejection email.
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-slate-400">
              Upload your resume and a job post. Get your ATS match score, missing skills, a tailored resume, a cover
              letter and mock interview practice — in about 30 seconds.
            </p>
          </section>
        )}

        <UploadPanel
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          onResult={(result) => {
            setAnalysis(result);
            setTab('skills');
          }}
        />

        {analysis && (
          <div key={analysis.id} className="mt-8 grid gap-6 lg:grid-cols-3">
            <ScoreCard analysis={analysis} />

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur lg:col-span-2">
              <nav className="mb-6 flex flex-wrap gap-2">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                      tab === id ? 'bg-indigo-500 text-white' : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
              </nav>

              <div className={show('skills')}><SkillsPanel skills={analysis.skills} /></div>
              <div className={show('resume')}><TailorPanel {...shared} /></div>
              <div className={show('cover')}><CoverLetterPanel {...shared} /></div>
              <div className={show('interview')}><InterviewPanel {...shared} /></div>
              <div className={show('history')}>{tab === 'history' && <HistoryPanel />}</div>
            </div>
          </div>
        )}
      </main>

      <footer className="pb-8 text-center text-xs text-slate-500">
        AI suggestions can be wrong — always review before you apply.
      </footer>
    </div>
  );
}
