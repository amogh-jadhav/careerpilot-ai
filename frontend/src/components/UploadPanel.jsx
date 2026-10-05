import { useRef, useState } from 'react';
import { FileCheck2, UploadCloud } from 'lucide-react';
import { analyze } from '../api';
import { Button, Card, ErrorBox } from './ui';

export default function UploadPanel({ jobDescription, setJobDescription, onResult }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const pick = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setError('Please choose a PDF file.');
      return;
    }
    setError('');
    setFile(f);
  };

  const submit = async () => {
    if (!file || jobDescription.trim().length < 50) {
      setError('Add your resume PDF and paste the full job description.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      onResult(await analyze(file, jobDescription));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="grid gap-6 md:grid-cols-2">
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files[0]);
        }}
        className={`flex min-h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition ${
          dragging ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/15 hover:border-indigo-400/60'
        }`}
      >
        <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => pick(e.target.files[0])} />
        {file ? (
          <>
            <FileCheck2 className="h-10 w-10 text-emerald-400" />
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-slate-400">Click to change</p>
          </>
        ) : (
          <>
            <UploadCloud className="h-10 w-10 text-indigo-400" />
            <p className="font-medium">Drop your resume PDF here</p>
            <p className="text-sm text-slate-400">or click to browse · max 5 MB</p>
          </>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-slate-300">Job description</label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job post from LinkedIn, Indeed or the company site..."
          className="min-h-44 flex-1 resize-y rounded-xl border border-white/10 bg-slate-900/60 p-3 text-sm outline-none focus:border-indigo-400"
        />
        <ErrorBox message={error} />
        <Button loading={loading} onClick={submit}>
          {loading ? 'Analyzing… (about 15 s)' : 'Analyze my fit'}
        </Button>
      </div>
    </Card>
  );
}
