import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import type { NextRequest } from 'next/server';

const ALLOWED_STATUSES = ['pending', 'validated', 'redeemed', 'rejected'];

export async function GET(request: Request, context: { params: { storyId: string } }) {
  const { storyId } = context.params;
  if (!storyId) {
    return NextResponse.json({ error: 'Falta storyId' }, { status: 400 });
  }
  const db = await getDb();
  const story = await db.collection('storySubmissions').findOne({ _id: new ObjectId(storyId) });
  if (!story) {
    return NextResponse.json({ error: 'Story no encontrada' }, { status: 404 });
  }
  let campaignNombre = undefined;
  if (story.campaignId) {
    let campaignObjectId;
    try {
      campaignObjectId = typeof story.campaignId === 'string' ? new ObjectId(story.campaignId) : story.campaignId;
    } catch {
      campaignObjectId = null;
    }
    if (campaignObjectId) {
      const campaign = await db.collection('campaigns').findOne({ _id: campaignObjectId });
      if (campaign && campaign.nombre) {
        campaignNombre = campaign.nombre;
      }
    }
  }
  return NextResponse.json({ ...story, _id: story._id?.toString?.() || story.id || "", campaignNombre });
}

export async function PATCH(req: NextRequest, context: { params: { storyId: string } }) {
  const params = await context.params;
  const { storyId } = params;
  if (!storyId) {
    return NextResponse.json({ error: 'Falta storyId' }, { status: 400 });
  }
  const { status } = await req.json();
  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Estado no válido' }, { status: 400 });
  }
  const db = await getDb();
  const result = await db.collection('storySubmissions').updateOne(
    { _id: new ObjectId(storyId) },
    { $set: { status } }
  );
  if (result.modifiedCount === 0) {
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, context: { params: { storyId: string } }) {
  const params = await context.params;
  const { storyId } = params;
  if (!storyId) {
    return NextResponse.json({ error: 'Falta storyId' }, { status: 400 });
  }
  const db = await getDb();
  const result = await db.collection('storySubmissions').deleteOne({ _id: new ObjectId(storyId) });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: 'No se pudo borrar' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
} 