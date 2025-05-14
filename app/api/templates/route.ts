import { getServerSession } from 'next-auth';
import { getDb } from '@/lib/mongo';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession();
  // BYPASS SOLO EN DESARROLLO PARA DEMO
  if (
    process.env.NODE_ENV === "development" &&
    (!session || !session.user?.email)
  ) {
    const db = await getDb();
    // Demo: mostrar todas las plantillas activas
    const templates = await db.collection('templates')
      .find({ isActive: true })
      .sort({ order: 1 })
      .toArray();
    return NextResponse.json(Array.isArray(templates) ? templates : []);
  }
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const db = await getDb();
  const user = await db.collection('users').findOne({ email: session.user.email });
  const plan = user?.plan || 'free';
  // Mostrar plantillas del plan del usuario o inferiores
  const allowedPlans = plan === 'pro' ? ['free', 'pro'] : ['free'];
  const templates = await db.collection('templates')
    .find({ isActive: true, plan: { $in: allowedPlans } })
    .sort({ order: 1 })
    .toArray();
  return NextResponse.json(Array.isArray(templates) ? templates : []);
} 