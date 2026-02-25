import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');

  if (!email) {
    return new NextResponse('Chybí email', { status: 400 });
  }

  await supabase
    .from('leads')
    .update({
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString(),
    })
    .eq('email', email.toLowerCase().trim());

  return new NextResponse(
    `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Odhlášeno</title></head>
<body style="background:#0a0a12;color:#f0f0f5;font-family:Arial,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;">
  <div style="text-align:center;padding:40px;">
    <h1 style="color:#39ff6e;">Odhlášeno ✓</h1>
    <p style="color:#8888aa;">Váš email byl odhlášen z odběru.</p>
    <a href="https://gowoker.com" style="color:#39ff6e;">← Zpět na Woker</a>
  </div>
</body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}
