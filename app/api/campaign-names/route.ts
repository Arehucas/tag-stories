import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  // BYPASS SOLO EN DESARROLLO PARA DEMO
  if (!session?.user?.email) {
    if (process.env.NODE_ENV === 'development') {
      // Permitir acceso en local/demo
    } else {
      return NextResponse.json({}, { status: 401 });
    }
  }
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get('ids');
  if (!idsParam) return NextResponse.json({});
  const ids = idsParam.split(',').filter(Boolean).map(id => ObjectId.isValid(id) ? new ObjectId(id) : null);
  const validIds = ids.filter((id): id is ObjectId => !!id);
  if (validIds.length === 0) return NextResponse.json({});
  const db = await getDb();
  const campaigns = await db.collection('campaigns').find({ _id: { $in: validIds } }).toArray();
  const result: Record<string, string> = {};
  for (const c of campaigns) {
    result[c._id.toString()] = c.nombre || '';
  }
  return NextResponse.json(result);
} 