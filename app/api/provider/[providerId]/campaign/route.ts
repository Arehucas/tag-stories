import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { getServerSession } from 'next-auth';

// Defino el tipo para update
interface UpdateCampaign {
  nombre?: string;
  descripcion?: string;
  numStories?: number;
  updatedAt: Date;
  isActive?: boolean;
  requiredStories?: number;
  overlayType?: string;
  overlayUrl?: string;
}

async function checkProviderAccess(providerId: string) {
  const session = await getServerSession();
  if (!session || !session.user?.email) return null;
  const db = await getDb();
  // Buscar provider por email, shortId o slug
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

// GET: Obtener campaña de un provider
export async function GET(req: NextRequest, { params }: { params: Promise<{ providerId: string }> }) {
  const { providerId } = await params;
  const access = await checkProviderAccess(providerId);
  if (!access) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  const campaign = await access.db.collection('campaigns').findOne({ providerId });
  if (!campaign) {
    return NextResponse.json({ error: 'No hay campaña' }, { status: 404 });
  }
  return NextResponse.json(campaign);
}

// POST: Crear campaña para un provider (solo si no existe)
export async function POST(req: NextRequest, { params }: { params: Promise<{ providerId: string }> }) {
  const { providerId } = await params;
  const access = await checkProviderAccess(providerId);
  if (!access) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  const exists = await access.db.collection('campaigns').findOne({ providerId });
  if (exists) {
    return NextResponse.json({ error: 'Ya existe campaña' }, { status: 400 });
  }
  const body = await req.json();
  if (!body.nombre || typeof body.nombre !== 'string') {
    return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
  }
  let overlayType = 'default';
  let overlayUrl = '/overlays/overlay-white-default.png';
  if (access.provider.overlayPreference === 'dark-overlay') {
    overlayUrl = '/overlays/overlay-dark-default.png';
  }
  if (body.overlayType) overlayType = body.overlayType;
  if (body.overlayUrl) overlayUrl = body.overlayUrl;
  const campaign = {
    providerId,
    nombre: body.nombre,
    descripcion: typeof body.descripcion === 'string' ? body.descripcion : '',
    isActive: true,
    requiredStories: body.requiredStories ?? 1,
    overlayType,
    overlayUrl,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const result = await access.db.collection('campaigns').insertOne(campaign);
  return NextResponse.json({ ...campaign, _id: result.insertedId });
}

// PATCH: Editar campaña (nombre, activar/desactivar)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ providerId: string }> }) {
  const { providerId } = await params;
  const access = await checkProviderAccess(providerId);
  if (!access) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  const campaign = await access.db.collection('campaigns').findOne({ providerId });
  if (!campaign) {
    return NextResponse.json({ error: 'No hay campaña' }, { status: 404 });
  }
  const body = await req.json();
  const update: UpdateCampaign = { updatedAt: new Date() };
  if (typeof body.nombre === 'string' && body.nombre.trim()) {
    update.nombre = body.nombre.trim();
  }
  if (typeof body.descripcion === 'string') {
    update.descripcion = body.descripcion;
  }
  if (typeof body.isActive === 'boolean') {
    update.isActive = body.isActive;
  }
  if (body.requiredStories && [1,2,5,10,20].includes(body.requiredStories)) {
    update.requiredStories = body.requiredStories;
  }
  if (typeof body.overlayType === 'string') {
    (update as any).overlayType = body.overlayType;
  }
  if (typeof body.overlayUrl === 'string') {
    (update as any).overlayUrl = body.overlayUrl;
  }
  await access.db.collection('campaigns').updateOne({ providerId }, { $set: update });
  const updated = await access.db.collection('campaigns').findOne({ providerId });
  return NextResponse.json(updated);
} 