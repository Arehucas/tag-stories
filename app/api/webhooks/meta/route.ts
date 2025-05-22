import { NextRequest, NextResponse } from 'next/server';

// Verificador seguro generado
const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || 'taunMetaWebhook2024';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Procesar eventos de Instagram (menciones en stories)
  if (body.object === 'instagram' && Array.isArray(body.entry)) {
    for (const entry of body.entry) {
      if (Array.isArray(entry.changes)) {
        for (const change of entry.changes) {
          if (change.field === 'mention' && change.value) {
            const mentionedUserId = change.value.to?.id;
            const mentionedUsername = change.value.to?.username;
            const fromUserId = change.value.from?.id;
            const fromUsername = change.value.from?.username;
            const mediaId = change.value.media_id;
            // Buscar si el usuario mencionado tiene token IG
            const db = await (await import('@/lib/mongo')).getDb();
            const provider = await db.collection('providers').findOne({ instagram_user_id: mentionedUserId });
            if (provider && provider.instagram_access_token) {
              // Mostrar en consola la información relevante
              console.log('[IG MENTION]', {
                mentionedUserId,
                mentionedUsername,
                fromUserId,
                fromUsername,
                mediaId,
                time: entry.time,
                providerEmail: provider.email,
              });
              // Obtener detalles enriquecidos de la story
              try {
                const storyRes = await fetch(`https://graph.instagram.com/${mediaId}?fields=id,media_type,media_url,thumbnail_url,timestamp,caption,permalink&access_token=${provider.instagram_access_token}`);
                if (storyRes.ok) {
                  const storyData = await storyRes.json();
                  console.log('[IG STORY DETAILS]', storyData);
                } else {
                  const error = await storyRes.text();
                  console.log('[IG STORY DETAILS ERROR]', error);
                }
              } catch (err) {
                console.log('[IG STORY DETAILS EXCEPTION]', err);
              }
            }
          }
        }
      }
    }
  } else {
    // Log genérico para otros eventos
    console.log('Evento recibido de Meta:', JSON.stringify(body));
  }
  return new NextResponse('EVENT_RECEIVED', { status: 200 });
} 