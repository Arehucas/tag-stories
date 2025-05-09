import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

// Defino el tipo para update
interface UpdateCampaign {
  nombre?: string;
  descripcion?: string;
  numStories?: number;
  updatedAt: Date;
  isActive?: boolean;
  requiredStories?: number;
}

// GET: Obtener campaña de un provider
export async function GET(req: NextRequest, { params }: { params: Promise<{ providerId: string }> }) {
  const { providerId } = await params;
  const db = await getDb();
  const campaign = await db.collection('campaigns').findOne({ providerId });
  if (!campaign) {
    return NextResponse.json({ error: 'No hay campaña' }, { status: 404 });
  }
  return NextResponse.json(campaign);
}

// POST: Crear campaña para un provider (solo si no existe)
export async function POST(req: NextRequest, { params }: { params: Promise<{ providerId: string }> }) {
  const { providerId } = await params;
  const db = await getDb();
  const exists = await db.collection('campaigns').findOne({ providerId });
  if (exists) {
    return NextResponse.json({ error: 'Ya existe campaña' }, { status: 400 });
  }
  const body = await req.json();
  if (!body.nombre || typeof body.nombre !== 'string') {
    return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
  }
  const campaign = {
    providerId,
    nombre: body.nombre,
    descripcion: typeof body.descripcion === 'string' ? body.descripcion : '',
    isActive: true,
    requiredStories: body.requiredStories ?? 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const result = await db.collection('campaigns').insertOne(campaign);
  return NextResponse.json({ ...campaign, _id: result.insertedId });
}

// PATCH: Editar campaña (nombre, activar/desactivar)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ providerId: string }> }) {
  const { providerId } = await params;
  const db = await getDb();
  const campaign = await db.collection('campaigns').findOne({ providerId });
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
  await db.collection('campaigns').updateOne({ providerId }, { $set: update });
  const updated = await db.collection('campaigns').findOne({ providerId });
  return NextResponse.json(updated);
} 