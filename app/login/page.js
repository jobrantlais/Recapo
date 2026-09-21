'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const [mode, setMode] = useState('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setBusy(true); setMsg('');
    const fn = mode === 'signup' ? supabase.auth.signUp : supabase.auth.signInWithPassword;
    const { data, error } = await fn.call(supabase.auth, { email, password });
    setBusy(false);
    if (error) return setMsg(error.message);
    if (data.session) window.location.href = '/dashboard';
    else setMsg('Check your email to confirm your account, then log in.');
  }

  return (
    <main className="wrap" style={{ maxWidth: 420 }}>
      <h1>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
      <form onSubmit={submit} className="card">
        <label>Email</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
        <label>Password</label><input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} />
        <p><button className="btn" disabled={busy}>{busy ? 'Please wait…' : mode === 'signup' ? 'Sign up free' : 'Log in'}</button></p>
        {msg && <div className="err">{msg}</div>}
      </form>
      <p className="muted" style={{ cursor: 'pointer' }} onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}>
        {mode === 'signup' ? 'Already have an account? Log in' : 'New here? Sign up'}
      </p>
    </main>
  );
    }7
