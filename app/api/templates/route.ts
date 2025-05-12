import { getServerSession } from 'next-auth';
import { getDb } from '@/lib/mongo';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession();
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
  return NextResponse.json(templates);
} 