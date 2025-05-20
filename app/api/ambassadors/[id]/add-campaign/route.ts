import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';

export async function PATCH(req: NextRequest, context: { params: any }) {
  try {
    const { id } = context.params;
    const body = await req.json();
    const { campaignId } = body;
    if (!campaignId) {
      return NextResponse.json({ error: 'Falta campaignId' }, { status: 400 });
    }
    const db = await getDb();
    await db.collection('ambassadors').updateOne(
      { _id: new ObjectId(id) },
      { $addToSet: { campaigns: new ObjectId(campaignId) }, $set: { updatedAt: new Date() } }
    );
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
} 