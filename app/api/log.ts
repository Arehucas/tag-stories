import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Log en la terminal del servidor, igual que en by-email
  // eslint-disable-next-line no-console
  console.log('[CROP DEBUG]', body);
  return NextResponse.json({ ok: true });
} 