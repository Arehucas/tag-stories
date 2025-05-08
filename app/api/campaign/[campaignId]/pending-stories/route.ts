import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';

// DELETE: Borra stories pendientes asociadas a una campaña
export async function DELETE(req: NextRequest, context: { params: { campaignId: string } }) {
  const { campaignId } = context.params;
  const db = await getDb();
  if (!ObjectId.isValid(campaignId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }
  const result = await db.collection('storySubmissions').deleteMany({ campaignId: new ObjectId(campaignId), status: 'pending' });
  return NextResponse.json({ deletedCount: result.deletedCount });
}

// GET: Devuelve el número de stories en estado 'pending' o 'tagged' para la campaña
export async function GET(req: NextRequest, context: { params: { campaignId: string } }) {
  const { campaignId } = context.params;
  const db = await getDb();
  if (!ObjectId.isValid(campaignId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }
  const count = await db.collection('storySubmissions').countDocuments({
    campaignId: new ObjectId(campaignId),
    status: { $in: ['pending', 'tagged'] }
  });
  return NextResponse.json({ count });
} 