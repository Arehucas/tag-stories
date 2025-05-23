import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';

// DELETE: Borra stories pendientes asociadas a una campaña
export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const segments = url.pathname.split('/');
  const campaignId = segments[segments.length - 2];
  const db = await getDb();
  // BYPASS SOLO EN DESARROLLO PARA DEMO
  const session = await getServerSession();
  if (
    process.env.NODE_ENV === "development" &&
    (!session || !session.user?.email)
  ) {
    const campaign = await db.collection('campaigns').findOne({ _id: new ObjectId(campaignId) });
    if (campaign) {
      const provider = await db.collection('providers').findOne({ shortId: campaign.providerId });
      if (provider && provider.email === "demo@demo.com") {
        const result = await db.collection('storySubmissions').deleteMany({ campaignId: new ObjectId(campaignId), status: 'pending' });
        return NextResponse.json({ deletedCount: result.deletedCount });
      }
    }
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  // Lógica original
  if (!campaignId || !ObjectId.isValid(campaignId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }
  const result = await db.collection('storySubmissions').deleteMany({ campaignId: new ObjectId(campaignId), status: 'pending' });
  return NextResponse.json({ deletedCount: result.deletedCount });
}

// GET: Devuelve el número de stories en estado 'pending' o 'tagged' para la campaña
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const segments = url.pathname.split('/');
  const campaignId = segments[segments.length - 2];
  const db = await getDb();
  // BYPASS SOLO EN DESARROLLO PARA DEMO
  const session = await getServerSession();
  if (
    process.env.NODE_ENV === "development" &&
    (!session || !session.user?.email)
  ) {
    const campaign = await db.collection('campaigns').findOne({ _id: new ObjectId(campaignId) });
    if (campaign) {
      const provider = await db.collection('providers').findOne({ shortId: campaign.providerId });
      if (provider && provider.email === "demo@demo.com") {
        const count = await db.collection('storySubmissions').countDocuments({
          campaignId: new ObjectId(campaignId),
          status: { $in: ['pending', 'tagged'] }
        });
        return NextResponse.json({ count });
      }
    }
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  // Lógica original
  if (!campaignId || !ObjectId.isValid(campaignId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }
  const count = await db.collection('storySubmissions').countDocuments({
    campaignId: new ObjectId(campaignId),
    status: { $in: ['pending', 'tagged'] }
  });
  return NextResponse.json({ count });
} 