import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';

export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { storyId } = body;
    if (!storyId) {
      return NextResponse.json({ error: 'Falta storyId' }, { status: 400 });
    }
    const db = await getDb();
    await db.collection('ambassadors').updateOne(
      { _id: new ObjectId(id) },
      { $addToSet: { stories: new ObjectId(storyId) }, $set: { updatedAt: new Date() } }
    );
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
} 