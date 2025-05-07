import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDb } from '@/lib/mongo';

export async function GET() {
  const session = await getServerSession();
  if (!session || !session.user?.email) {
    return NextResponse.json({ hasIGToken: false });
  }
  const db = await getDb();
  const provider = await db.collection('providers').findOne({ email: session.user.email });
  return NextResponse.json({ hasIGToken: !!provider?.instagram_access_token });
} 