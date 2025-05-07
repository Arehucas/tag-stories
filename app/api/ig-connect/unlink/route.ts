import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDb } from '@/lib/mongo';

export async function POST() {
  const session = await getServerSession();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const db = await getDb();
  await db.collection('providers').updateOne(
    { email: session.user.email },
    { $unset: { instagram_access_token: "" } }
  );
  return NextResponse.json({ ok: true });
} 