import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { providerId, campaignId, imageUrl, ambassadorId, originalPhash, blockwisePhashArray } = body;
    if (!providerId || !campaignId || !imageUrl || !ambassadorId) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    const db = await getDb();
    const campaign = await db.collection('campaigns').findOne({ _id: new ObjectId(campaignId) });
    if (!campaign) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 403 });
    }
    // Obtener el instagram_business_id del provider si existe
    let instagramBusinessId = null;
    const provider = await db.collection('providers').findOne({
      $or: [
        { _id: providerId } as any,
        { shortId: providerId },
        { slug: providerId },
        { email: providerId },
      ],
    });
    if (provider && provider.instagram_business_id) {
      instagramBusinessId = provider.instagram_business_id;
    }
    const submission = {
      providerId,
      instagram_business_id: instagramBusinessId || null,
      campaignId: new ObjectId(campaignId),
      campaignName: campaign.nombre,
      templateId: campaign.templateId,
      imageUrl, // URL de la imagen en Cloudinary
      status: 'pending',
      createdAt: new Date(),
      ambassadorId: new ObjectId(ambassadorId),
      originalPhash: originalPhash || null,
      blockwisePhashArray: blockwisePhashArray || null,
      validatedBy: null, // 'auto' | 'manual' | null
      validatedAt: null,
      validationMethod: null, // 'phash' | 'manual' | null
      validationScore: null,
      rawStoryId: null,
    };
    const result = await db.collection('storySubmissions').insertOne(submission);
    return NextResponse.json({ id: result.insertedId });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get('providerId');
    const campaignId = searchParams.get('campaignId');
    if (!providerId) {
      return NextResponse.json({ error: 'Falta providerId' }, { status: 400 });
    }
    const db = await getDb();
    // BYPASS SOLO EN DESARROLLO PARA DEMO
    if (
      process.env.NODE_ENV === "development" &&
      (!session || !session.user?.email)
    ) {
      const provider = await db.collection('providers').findOne({
        $or: [
          { _id: providerId } as any,
          { shortId: providerId },
          { slug: providerId },
          { email: providerId },
        ],
      });
      if (provider && provider.email === "demo@demo.com") {
        const filter: any = { providerId };
        if (campaignId) {
          try {
            filter.campaignId = new ObjectId(campaignId);
          } catch {
            filter.campaignId = campaignId;
          }
        }
        const stories = await db
          .collection('storySubmissions')
          .find(filter)
          .sort({ createdAt: -1 })
          .toArray();
        const storiesWithId = stories.map(s => ({
          ...s,
          _id: s._id?.toString?.() || s.id || "",
        }));
        return NextResponse.json(storiesWithId);
      }
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    // Lógica original
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    // Verificar que el providerId pertenece al usuario autenticado
    const provider = await db.collection('providers').findOne({
      $or: [
        { _id: providerId } as any,
        { shortId: providerId },
        { slug: providerId },
        { email: providerId },
      ],
    });
    if (!provider || provider.email !== session.user.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    const filter: any = { providerId };
    if (campaignId) {
      try {
        filter.campaignId = new ObjectId(campaignId);
      } catch {
        filter.campaignId = campaignId;
      }
    }
    const stories = await db
      .collection('storySubmissions')
      .find(filter)
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