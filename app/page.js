export default function Home() {
  return (
    <main className="wrap">
      <section className="hero">
        <h1>Monthly client reports, written in 2 minutes instead of 2 hours.</h1>
        <p>Upload your Google Ads, Meta or GA4 export. Recapo calculates the numbers and writes the story: what worked, what didn&apos;t, and what to do next. No integrations. No dashboards to set up.</p>
        <p><a className="btn" href="/login">Try 3 reports free</a> &nbsp; <a className="btn ghost" href="/pricing">See pricing</a></p>
      </section>
      <section className="grid">
        <div className="card"><h3>1. Upload a CSV</h3><p className="muted">Export from any ad platform. Recapo recognizes the usual columns automatically.</p></div>
        <div className="card"><h3>2. Numbers are exact</h3><p className="muted">Spend, CTR, CPA, ROAS and month-over-month change are calculated in code, never guessed by AI.</p></div>
        <div className="card"><h3>3. Send it to your client</h3><p className="muted">A clear summary and three next actions in your voice. Edit, copy, done.</p></div>
      </section>
      <section className="hero"><h2>Built for freelancers and small agencies</h2>
        <p>If you write the same &quot;here&apos;s what happened this month&quot; email for five clients, Recapo gives you those hours back.</p></section>
    </main>
  );
    }
