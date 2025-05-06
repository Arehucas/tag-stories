import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { providerId, colorCode } = body;
    if (!providerId || !Array.isArray(colorCode) || colorCode.length !== 4) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    const db = await getDb();
    const submission = {
      providerId,
      colorCode, // array de 4 colores: [{r,g,b}]
      status: 'pending',
      createdAt: new Date(),
    };
    const result = await db.collection('storySubmissions').insertOne(submission);
    return NextResponse.json({ id: result.insertedId });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get('providerId');
    if (!providerId) {
      return NextResponse.json({ error: 'Falta providerId' }, { status: 400 });
    }
    const db = await getDb();
    const stories = await db
      .collection('storySubmissions')
      .find({ providerId, status: 'pending' })
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json(stories);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
} 