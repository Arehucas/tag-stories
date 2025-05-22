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
  console.log('[WEBHOOK][RAW BODY]', JSON.stringify(body));
  // Loguear cualquier evento de Instagram recibido
  if (body.object === 'instagram' && Array.isArray(body.entry)) {
    for (const entry of body.entry) {
      if (Array.isArray(entry.changes)) {
        for (const change of entry.changes) {
          console.log('[IG WEBHOOK EVENT]', {
            field: change.field,
            value: change.value,
            entryId: entry.id,
            time: entry.time,
          });
        }
      }
    }
  } else {
    // Log genérico para otros eventos
    console.log('Evento recibido de Meta:', JSON.stringify(body));
  }
  return new NextResponse('EVENT_RECEIVED', { status: 200 });
} 