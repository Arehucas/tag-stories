import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDb } from '@/lib/mongo';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const { code } = await req.json();
  if (!code) {
    return NextResponse.json({ error: 'Falta el código de Instagram' }, { status: 400 });
  }
  // Intercambiar el código por el access token
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_CLIENT_ID!,
    client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
    grant_type: 'authorization_code',
    redirect_uri: 'https://www.taun.me/ig-connect/callback',
    code,
  });
  const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (!tokenRes.ok) {
    const error = await tokenRes.text();
    return NextResponse.json({ error }, { status: 400 });
  }
  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;
  if (!accessToken) {
    return NextResponse.json({ error: 'No se recibió access_token' }, { status: 400 });
  }
  // Guardar el access token en el usuario
  const db = await getDb();
  await db.collection('users').updateOne(
    { email: session.user.email },
    { $set: { instagram_access_token: accessToken } }
  );
  return NextResponse.json({ ok: true });
} 