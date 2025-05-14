import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { getServerSession } from 'next-auth';
import { ObjectId } from "mongodb";

// Defino el tipo para update
interface UpdateCampaign {
  nombre?: string;
  descripcion?: string;
  numStories?: number;
  updatedAt: Date;
  isActive?: boolean;
  requiredStories?: number;
  templateId?: any;
}

async function checkProviderAccess(providerId: string) {
  const session = await getServerSession();

  // BYPASS SOLO EN DESARROLLO PARA DEMO
  if (
    process.env.NODE_ENV === "development" &&
    (!session || !session.user?.email)
  ) {
    const db = await getDb();
    const provider = await db.collection('providers').findOne({
      $or: [
        { _id: providerId } as any,
        { shortId: providerId },
        { slug: providerId },
        { email: providerId },
      ],
    });
    if (provider && provider.email === "demo@demo.com") {
      return { session: { user: { email: provider.email } }, db, provider };
    }
    return null;
  }

  // Lógica original
  if (!session || !session.user?.email) return null;
  const db = await getDb();
  const provider = await db.collection('providers').findOne({
    $or: [
      { _id: providerId } as any,
      { shortId: providerId },
      { slug: providerId },
      { email: providerId },
    ],
  });
  if (!provider) return null;
  if (provider.email !== session.user.email) return null;
  return { session, db, provider };
}

// GET: Obtener campaña activa de un provider
export async function GET(req: NextRequest, { params }: { params: Promise<{ providerId: string }> }) {
  const { providerId } = await params;
  const access = await checkProviderAccess(providerId);
  if (!access) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  const campaign = await access.db.collection('campaigns').findOne({ providerId, isActive: true });
  if (!campaign) {
    return NextResponse.json({ error: 'No hay campaña activa' }, { status: 404 });
  }
  return NextResponse.json(campaign);
}

// POST: Crear campaña para un provider (permite múltiples)
export async function POST(req: NextRequest, { params }: { params: Promise<{ providerId: string }> }) {
  const { providerId } = await params;
  const access = await checkProviderAccess(providerId);
  if (!access) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  const body = await req.json();
  if (!body.nombre || typeof body.nombre !== 'string') {
    return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
  }
  // Buscar el templateId según overlayPreference del provider
  const templateType = access.provider.overlayPreference === 'dark-overlay' ? 'defaultDark' : 'defaultLight';
  const template = await access.db.collection('templates').findOne({ type: templateType, isActive: true });
  if (!template) {
    return NextResponse.json({ error: 'No hay plantilla por defecto disponible' }, { status: 500 });
  }
  // Verificar si es la primera campaña del provider
  const existingCampaignCount = await access.db.collection('campaigns').countDocuments({ providerId, deleted: { $ne: true } });
  const isFirstCampaign = existingCampaignCount === 0;
  const campaign = {
    providerId,
    nombre: body.nombre,
    descripcion: typeof body.descripcion === 'string' ? body.descripcion : '',
    isActive: isFirstCampaign,
    requiredStories: body.requiredStories ?? 1,
    templateId: template._id,
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false,
  };
  const result = await access.db.collection('campaigns').insertOne(campaign);
  return NextResponse.json({ ...campaign, _id: result.insertedId });
}

// PATCH: Editar campaña por ID (activar/desactivar, cambiar nombre, etc)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ providerId: string }> }) {
  const { providerId } = await params;
  const access = await checkProviderAccess(providerId);
  if (!access) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  const body = await req.json();
  if (!body.campaignId) return NextResponse.json({ error: 'Falta campaignId' }, { status: 400 });
  const campaign = await access.db.collection('campaigns').findOne({ _id: new ObjectId(body.campaignId), providerId });
  if (!campaign) return NextResponse.json({ error: 'No existe campaña' }, { status: 404 });
  const update: any = { updatedAt: new Date() };
  let nombreCambiado = false;
  if (typeof body.nombre === 'string' && body.nombre.trim()) {
    update.nombre = body.nombre.trim();
    nombreCambiado = body.nombre.trim() !== campaign.nombre;
  }
  if (typeof body.descripcion === 'string') {
    update.descripcion = body.descripcion;
  }
  if (typeof body.isActive === 'boolean') {
    update.isActive = body.isActive;
    if (body.isActive) {
      // Desactivar cualquier otra campaña activa
      await access.db.collection('campaigns').updateMany({ providerId, isActive: true, _id: { $ne: campaign._id } }, { $set: { isActive: false } });
    }
  }
  if (body.requiredStories && [1,2,5,10,20].includes(body.requiredStories)) {
    update.requiredStories = body.requiredStories;
  }
  if (body.templateId) {
    try {
      update.templateId = new ObjectId(body.templateId);
    } catch {}
  }
  await access.db.collection('campaigns').updateOne({ _id: campaign._id }, { $set: update });
  // Si cambió el nombre, actualizar campaignName en las stories asociadas
  if (nombreCambiado) {
    await access.db.collection('storySubmissions').updateMany(
      { $or: [
          { campaignId: campaign._id },
          { campaignId: campaign._id.toString() }
        ] },
      { $set: { campaignName: update.nombre } }
    );
  }
  const updated = await access.db.collection('campaigns').findOne({ _id: campaign._id });
  return NextResponse.json(updated);
}

// DELETE: Softdelete de campaña
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ providerId: string }> }) {
  const { providerId } = await params;
  const access = await checkProviderAccess(providerId);
  if (!access) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  const body = await req.json();
  if (!body.campaignId) return NextResponse.json({ error: 'Falta campaignId' }, { status: 400 });
  const campaign = await access.db.collection('campaigns').findOne({ _id: new ObjectId(body.campaignId), providerId });
  if (!campaign) return NextResponse.json({ error: 'No existe campaña' }, { status: 404 });
  await access.db.collection('campaigns').updateOne(
    { _id: campaign._id },
    { $set: { deleted: true, updatedAt: new Date() } }
  );
  return NextResponse.json({ ok: true });
} 