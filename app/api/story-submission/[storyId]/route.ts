import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';

const ALLOWED_STATUSES = ['pending', 'validated', 'redeemed', 'rejected'];

export async function GET(request: Request, context: any): Promise<Response> {
  const session = await getServerSession();
  const { storyId } = await context.params;
  if (!storyId) {
    return NextResponse.json({ error: 'Falta storyId' }, { status: 400 });
  }
  const db = await getDb();
  // BYPASS SOLO EN DESARROLLO PARA DEMO
  if (
    process.env.NODE_ENV === "development" &&
    (!session || !session.user?.email)
  ) {
    const story = await db.collection('storySubmissions').findOne({ _id: new ObjectId(storyId) });
    if (!story) {
      return NextResponse.json({ error: 'Story no encontrada' }, { status: 404 });
    }
    const provider = await db.collection('providers').findOne({ slug: story.providerId });
    if (provider && provider.email === "demo@demo.com") {
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
      return NextResponse.json({ ...story, _id: story._id?.toString?.() || story.id || '', campaignNombre });
    }
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  // Lógica original
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const story = await db.collection('storySubmissions').findOne({ _id: new ObjectId(storyId) });
  if (!story) {
    return NextResponse.json({ error: 'Story no encontrada' }, { status: 404 });
  }
  const provider = await db.collection('providers').findOne({ slug: story.providerId });
  if (!provider || provider.email !== session.user.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
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
  return NextResponse.json({ ...story, _id: story._id?.toString?.() || story.id || '', campaignNombre });
}

export async function PATCH(request: Request, context: any): Promise<Response> {
  const session = await getServerSession();
  const { storyId } = await context.params;
  if (!storyId) {
    return NextResponse.json({ error: 'Falta storyId' }, { status: 400 });
  }
  const db = await getDb();
  // BYPASS SOLO EN DESARROLLO PARA DEMO
  if (
    process.env.NODE_ENV === "development" &&
    (!session || !session.user?.email)
  ) {
    const story = await db.collection('storySubmissions').findOne({ _id: new ObjectId(storyId) });
    if (!story) {
      return NextResponse.json({ error: 'Story no encontrada' }, { status: 404 });
    }
    const provider = await db.collection('providers').findOne({ slug: story.providerId });
    if (provider && provider.email === "demo@demo.com") {
      const { status } = await request.json();
      if (!ALLOWED_STATUSES.includes(status)) {
        return NextResponse.json({ error: 'Estado no válido' }, { status: 400 });
      }
      const result = await db.collection('storySubmissions').updateOne(
        { _id: new ObjectId(storyId) },
        { $set: { status } }
      );
      if (result.modifiedCount === 0) {
        return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 404 });
      }
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  // Lógica original
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const story = await db.collection('storySubmissions').findOne({ _id: new ObjectId(storyId) });
  if (!story) {
    return NextResponse.json({ error: 'Story no encontrada' }, { status: 404 });
  }
  const provider = await db.collection('providers').findOne({ slug: story.providerId });
  if (!provider || provider.email !== session.user.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  const { status } = await request.json();
  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Estado no válido' }, { status: 400 });
  }
  const result = await db.collection('storySubmissions').updateOne(
    { _id: new ObjectId(storyId) },
    { $set: { status } }
  );
  if (result.modifiedCount === 0) {
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, context: any): Promise<Response> {
  const session = await getServerSession();
  const { storyId } = await context.params;
  if (!storyId) {
    return NextResponse.json({ error: 'Falta storyId' }, { status: 400 });
  }
  const db = await getDb();
  // BYPASS SOLO EN DESARROLLO PARA DEMO
  if (
    process.env.NODE_ENV === "development" &&
    (!session || !session.user?.email)
  ) {
    const story = await db.collection('storySubmissions').findOne({ _id: new ObjectId(storyId) });
    if (!story) {
      return NextResponse.json({ error: 'Story no encontrada' }, { status: 404 });
    }
    const provider = await db.collection('providers').findOne({ slug: story.providerId });
    if (provider && provider.email === "demo@demo.com") {
      const result = await db.collection('storySubmissions').deleteOne({ _id: new ObjectId(storyId) });
      if (result.deletedCount === 0) {
        return NextResponse.json({ error: 'No se pudo borrar' }, { status: 404 });
      }
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  // Lógica original
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const story = await db.collection('storySubmissions').findOne({ _id: new ObjectId(storyId) });
  if (!story) {
    return NextResponse.json({ error: 'Story no encontrada' }, { status: 404 });
  }
  const provider = await db.collection('providers').findOne({ slug: story.providerId });
  if (!provider || provider.email !== session.user.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  const result = await db.collection('storySubmissions').deleteOne({ _id: new ObjectId(storyId) });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: 'No se pudo borrar' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
} 