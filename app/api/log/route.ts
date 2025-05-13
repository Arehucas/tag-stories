import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const body = await req.json();
  // Log en la terminal del servidor, igual que en by-email
  // eslint-disable-next-line no-console
  console.log('[CROP DEBUG]', body);
  return NextResponse.json({ ok: true });
} 