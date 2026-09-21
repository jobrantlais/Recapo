import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import engine from '../../../lib/reportEngine';

export async function POST(req) {
  const token = (req.headers.get('authorization') || '').replace('Bearer ', '');
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user } } = await sb.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });

  const limit = Number(process.env.FREE_REPORT_LIMIT || 3);
  const { count } = await sb.from('reports').select('id', { count: 'exact', head: true });
  if ((count || 0) >= limit) return NextResponse.json({ error: 'Free reports used up. Paid plans are coming soon.' }, { status: 402 });

  const { csv, clientName, agencyName, tone } = await req.json();
  if (!csv || csv.length > 2_000_000) return NextResponse.json({ error: 'Upload a CSV under 2 MB.' }, { status: 400 });
  try {
    const { data, narrative } = await engine.generateReport(csv, { clientName, agencyName, tone }, process.env.ANTHROPIC_API_KEY);
    const { data: row, error } = await sb.from('reports')
      .insert({ client_name: clientName || 'Client', period: data.period.current, metrics: data, narrative })
      .select().single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ report: row });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
      }
