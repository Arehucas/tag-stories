import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';

export async function GET(
  req: NextRequest,
  context: { params: any }
) {
  const session = await getServerSession();
  const db = await getDb();
  const params = await context.params;
  const templateId = params.templateId;

  // BYPASS SOLO EN DESARROLLO PARA DEMO
  if (
    process.env.NODE_ENV === "development" &&
    (!session || !session.user?.email)
  ) {
    const template = await db.collection('templates').findOne({ _id: new ObjectId(templateId) });
    // Permitir acceso si existe el template (modo demo)
    if (template) {
      return NextResponse.json(template);
    }
    return NextResponse.json({ error: 'Template no encontrada' }, { status: 404 });
  }

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  try {
    let template;
    if (templateId === 'defaultDark' || templateId === 'defaultLight') {
      template = await db.collection('templates').findOne({ type: templateId });
    } else if (ObjectId.isValid(templateId)) {
      template = await db.collection('templates').findOne({ _id: new ObjectId(templateId) });
    } else {
      return NextResponse.json({ error: 'ID inválido o error de servidor' }, { status: 400 });
    }
    if (!template) {
      return NextResponse.json({ error: 'Template no encontrada' }, { status: 404 });
    }
    return NextResponse.json(template);
  } catch (e) {
    return NextResponse.json({ error: 'ID inválido o error de servidor' }, { status: 400 });
  }
} 