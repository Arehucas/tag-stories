import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Permitir body vacío
    const providers = Array.isArray(body.providers) ? body.providers : [];
    const campaigns = Array.isArray(body.campaigns) ? body.campaigns : [];
    const db = await getDb();
    const now = new Date();
    const ambassador = {
      igName: undefined,
      createdAt: now,
      updatedAt: now,
      stories: [],
      campaigns,
      providers,
    };
    const result = await db.collection('ambassadors').insertOne(ambassador);
    return NextResponse.json({ _id: result.insertedId });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
} 