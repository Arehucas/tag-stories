import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';

export async function GET(
  req: NextRequest,
  context: { params: any }
) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const db = await getDb();
  try {
    const templateId = context.params?.templateId;
    const template = await db.collection('templates').findOne({ _id: new ObjectId(templateId) });
    if (!template) {
      return NextResponse.json({ error: 'Template no encontrada' }, { status: 404 });
    }
    return NextResponse.json(template);
  } catch (e) {
    return NextResponse.json({ error: 'ID inválido o error de servidor' }, { status: 400 });
  }
} 