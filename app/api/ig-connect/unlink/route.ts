import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDb } from '@/lib/mongo';

export async function POST() {
  const session = await getServerSession();
  // BYPASS SOLO EN DESARROLLO PARA DEMO
  if (
    process.env.NODE_ENV === "development" &&
    (!session || !session.user?.email)
  ) {
    const db = await getDb();
    await db.collection('providers').updateOne(
      { email: "demo@demo.com" },
      { $set: { instagram_access_token: null } }
    );
    return NextResponse.json({ ok: true, demo: true });
  }
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const db = await getDb();
  await db.collection('providers').updateOne(
    { email: session.user.email },
    { $set: { instagram_access_token: null, instagram_user_id: null } }
  );
  return NextResponse.json({ ok: true });
} 