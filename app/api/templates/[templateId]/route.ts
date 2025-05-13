import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';

export async function GET(
  req: NextRequest,
  { params }: { params: Record<string, string> }
) {
  const db = await getDb();
  try {
    const template = await db.collection('templates').findOne({ _id: new ObjectId(params.templateId) });
    if (!template) {
      return NextResponse.json({ error: 'Template no encontrada' }, { status: 404 });
    }
    return NextResponse.json(template);
  } catch (e) {
    return NextResponse.json({ error: 'ID inválido o error de servidor' }, { status: 400 });
  }
} 