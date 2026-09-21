const plans = [
  { name: 'Starter', price: '$29', pop: false, items: ['10 reports / month', 'Unlimited clients', 'Editable narrative', 'Google Ads, Meta, GA4 CSVs'] },
  { name: 'Agency', price: '$49', pop: true, items: ['40 reports / month', 'Unlimited clients', 'Your agency name on reports', 'Priority support'] },
];
export default function Pricing() {
  return (
    <main className="wrap">
      <h1>Simple pricing</h1><p className="muted">Start with 3 free reports. Cancel anytime.</p>
      <div className="grid">
        {plans.map(p => (
          <div key={p.name} className={'card' + (p.pop ? ' pop' : '')}>
            <h3>{p.name}</h3><div className="price">{p.price}<span className="muted" style={{ fontSize: '1rem' }}>/mo</span></div>
            <ul className="clean">{p.items.map(i => <li key={i}>✓ {i}</li>)}</ul>
            <a className="btn" href="/login">Start free</a>
          </div>
        ))}
      </div>
    </main>
  );
  }
