'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const KEYS = [['spend', 'Spend', '$'], ['clicks', 'Clicks', ''], ['conversions', 'Conversions', ''], ['cpa', 'CPA', '$'], ['roas', 'ROAS', '']];

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [history, setHistory] = useState([]);
  const [report, setReport] = useState(null);
  const [f, setF] = useState({ clientName: '', agencyName: '', tone: 'professional and friendly' });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function loadHistory() {
    const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
    setHistory(data || []);
  }
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return (window.location.href = '/login');
      setSession(data.session); setReady(true); loadHistory();
    });
  }, []);

  async function generate(e) {
    e.preventDefault(); setErr('');
    if (!file) return setErr('Choose a CSV file first.');
    setBusy(true);
    const csv = await file.text();
    const res = await fetch('/api/report', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ csv, ...f }),
    });
    const out = await res.json();
    setBusy(false);
    if (!res.ok) return setErr(out.error || 'Something went wrong.');
    setReport(out.report); loadHistory();
  }

  if (!ready) return <main className="wrap">Loading…</main>;
  const m = report?.metrics;
  return (
    <main className="wrap">
      <p style={{ textAlign: 'right' }}><a className="muted" href="#" onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}>Log out</a></p>
      <h1>New report</h1>
      <form className="card" onSubmit={generate}>
        <label>Client name</label><input required value={f.clientName} onChange={e => setF({ ...f, clientName: e.target.value })} />
        <label>Your agency / name</label><input value={f.agencyName} onChange={e => setF({ ...f, agencyName: e.target.value })} />
        <label>Tone</label>
        <select value={f.tone} onChange={e => setF({ ...f, tone: e.target.value })}>
          <option>professional and friendly</option><option>formal and concise</option><option>casual and simple</option>
        </select>
        <label>Ad export (CSV)</label><input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} />
        <p><button className="btn" disabled={busy}>{busy ? 'Writing your report…' : 'Generate report'}</button></p>
        {err && <div className="err">{err}</div>}
      </form>

      {report && (
        <section style={{ marginTop: 24 }}>
          <h2>{report.client_name} · {report.period}</h2>
          <div className="grid">
            {KEYS.map(([k, label, unit]) => {
              const ch = m.changes_pct?.[k];
              return (<div className="card stat" key={k}><span className="muted">{label}</span>
                <b>{unit}{m.current[k] ?? '–'}</b>
                {ch != null && <span className={(k === 'cpa' ? ch < 0 : ch > 0) ? 'up' : 'down'}>{ch > 0 ? '+' : ''}{ch}% vs last month</span>}</div>);
            })}
          </div>
          <label>Report (editable)</label>
          <textarea value={report.narrative} onChange={e => setReport({ ...report, narrative: e.target.value })} />
          <p><button className="btn ghost" onClick={() => navigator.clipboard.writeText(report.narrative)}>Copy text</button></p>
        </section>
      )}

      <h2 style={{ marginTop: 32 }}>Past reports</h2>
      {history.length === 0 && <p className="muted">Nothing yet.</p>}
      <ul className="clean">{history.map(h => (
        <li key={h.id}><a href="#" onClick={e => { e.preventDefault(); setReport(h); window.scrollTo(0, 0); }}>{h.client_name} · {h.period}</a></li>
      ))}</ul>
    </main>
  );
      }
