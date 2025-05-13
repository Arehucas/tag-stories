import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Log en la terminal del servidor
  // eslint-disable-next-line no-console
  console.log('[FRONTEND LOG]', JSON.stringify(body, null, 2));
  return NextResponse.json({ ok: true });
} 