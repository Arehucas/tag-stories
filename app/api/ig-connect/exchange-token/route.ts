import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDb } from '@/lib/mongo';

export async function POST(req: NextRequest) {
  const session = await getServerSession();

  // Validación de sesión
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  // Validación de variables de entorno
  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    console.error('Faltan variables de entorno Instagram', { clientId, clientSecret, redirectUri });
    return NextResponse.json({ error: 'Configuración de Instagram incompleta' }, { status: 500 });
  }

  // Validación de parámetro code
  const { code } = await req.json();
  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'Falta el código de Instagram' }, { status: 400 });
  }

  // Log de intento de intercambio
  console.log('[IG][DEBUG] redirect_uri usado en backend:', redirectUri);
  console.log('[IG] Intercambiando código', { clientId, redirectUri, code: code.slice(0, 5) + '...' });

  // Intercambio de código por token
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
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
    const errorText = await tokenRes.text();
    console.error('[IG] Error al intercambiar código:', errorText);
    return NextResponse.json({ error: 'Error de Instagram', details: errorText }, { status: 400 });
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;
  if (!accessToken) {
    console.error('[IG] No se recibió access_token', tokenData);
    return NextResponse.json({ error: 'No se recibió access_token', details: tokenData }, { status: 400 });
  }

  // Obtener el user_id de Instagram usando el access_token
  const userRes = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
  if (!userRes.ok) {
    const error = await userRes.text();
    console.error('[IG] No se pudo obtener el user_id de Instagram', error);
    return NextResponse.json({ error: 'No se pudo obtener el user_id de Instagram', details: error }, { status: 400 });
  }
  const userData = await userRes.json();
  const instagramUserId = userData.id;

  // --- Obtener el instagram_business_id (recipientId de los webhooks) ---
  let instagramBusinessId = null;
  try {
    // 1. Obtener las páginas de Facebook del usuario
    const accountsRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`);
    const accountsData = await accountsRes.json();
    if (accountsData.data && accountsData.data.length > 0) {
      // 2. Buscar la página que tenga una cuenta de Instagram conectada
      for (const page of accountsData.data) {
        const pageId = page.id;
        const pageRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}?fields=connected_instagram_account&access_token=${accessToken}`);
        const pageData = await pageRes.json();
        if (pageData.connected_instagram_account && pageData.connected_instagram_account.id) {
          instagramBusinessId = pageData.connected_instagram_account.id;
          break;
        }
      }
    }
    if (!instagramBusinessId) {
      console.warn('[IG] No se encontró instagram_business_id para el usuario', { email: session.user.email });
    }
  } catch (err) {
    console.error('[IG] Error obteniendo instagram_business_id', err);
  }

  // Guardar el access token, user_id y business_id en el provider
  const db = await getDb();
  await db.collection('providers').updateOne(
    { email: session.user.email },
    { $set: { instagram_access_token: accessToken, instagram_user_id: instagramUserId, instagram_business_id: instagramBusinessId } }
  );
  await db.collection('users').updateOne(
    { email: session.user.email },
    { $unset: { instagram_access_token: "" } }
  );

  console.log('[IG] Vinculación exitosa', { email: session.user.email, instagramUserId, instagramBusinessId });

  return NextResponse.json({ ok: true });
} 