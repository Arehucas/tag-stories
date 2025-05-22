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
  // Aquí puedes procesar los eventos recibidos de Meta
  console.log('Evento recibido de Meta:', JSON.stringify(body));
  return new NextResponse('EVENT_RECEIVED', { status: 200 });
} 