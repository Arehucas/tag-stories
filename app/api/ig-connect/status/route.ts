import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDb } from '@/lib/mongo';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user?.email) {
    return NextResponse.json({ hasIGToken: false });
  }
  const db = await getDb();
  const user = await db.collection('users').findOne({ email: session.user.email });
  return NextResponse.json({ hasIGToken: !!user?.instagram_access_token });
} 