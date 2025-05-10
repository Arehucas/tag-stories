import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { providerId, imageUrl } = body;
    if (!providerId || !imageUrl) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    const db = await getDb();
    // Buscar campaña activa
    const campaign = await db.collection('campaigns').findOne({ providerId, isActive: true });
    if (!campaign) {
      return NextResponse.json({ error: 'No hay campaña activa' }, { status: 403 });
    }
    const submission = {
      providerId,
      campaignId: campaign._id,
      imageUrl, // URL de la imagen en Cloudinary
      status: 'pending',
      createdAt: new Date(),
    };
    const result = await db.collection('storySubmissions').insertOne(submission);
    return NextResponse.json({ id: result.insertedId });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get('providerId');
    if (!providerId) {
      return NextResponse.json({ error: 'Falta providerId' }, { status: 400 });
    }
    const db = await getDb();
    const stories = await db
      .collection('storySubmissions')
      .find({ providerId })
      .sort({ createdAt: -1 })
      .toArray();

    // Serializar _id
    const storiesWithId = stories.map(s => ({
      ...s,
      _id: s._id?.toString?.() || s.id || "",
    }));

    return NextResponse.json(storiesWithId);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
} 