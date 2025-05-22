import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDb } from '@/lib/mongo';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  // BYPASS SOLO EN DESARROLLO PARA DEMO
  if (
    process.env.NODE_ENV === "development" &&
    (!session || !session.user?.email)
  ) {
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: 'Falta el código de Instagram' }, { status: 400 });
    }
    const db = await getDb();
    await db.collection('providers').updateOne(
      { email: "demo@demo.com" },
      { $set: { instagram_access_token: "demo-token" } }
    );
    await db.collection('users').updateOne(
      { email: "demo@demo.com" },
      { $unset: { instagram_access_token: "" } }
    );
    return NextResponse.json({ ok: true, demo: true });
  }
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const { code } = await req.json();
  if (!code) {
    return NextResponse.json({ error: 'Falta el código de Instagram' }, { status: 400 });
  }
  // Intercambiar el código por el access token
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
  if (!redirectUri) {
    return NextResponse.json({ error: 'Falta la variable de entorno INSTAGRAM_REDIRECT_URI' }, { status: 500 });
  }
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_CLIENT_ID!,
    client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
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
  // Obtener el user_id de Instagram usando el access_token
  const userRes = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
  if (!userRes.ok) {
    const error = await userRes.text();
    return NextResponse.json({ error: 'No se pudo obtener el user_id de Instagram', details: error }, { status: 400 });
  }
  const userData = await userRes.json();
  const instagramUserId = userData.id;
  // Guardar el access token y el user_id en el provider
  const db = await getDb();
  await db.collection('providers').updateOne(
    { email: session.user.email },
    { $set: { instagram_access_token: accessToken, instagram_user_id: instagramUserId } }
  );
  // Eliminar el campo en users si existe
  await db.collection('users').updateOne(
    { email: session.user.email },
    { $unset: { instagram_access_token: "" } }
  );
  return NextResponse.json({ ok: true });
} 