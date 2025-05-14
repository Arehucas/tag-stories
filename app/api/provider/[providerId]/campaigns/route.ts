import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { getServerSession } from 'next-auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ providerId: string }> }) {
  const { providerId } = await params;
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
      const campaigns = await db.collection('campaigns')
        .find({ providerId })
        .sort({ createdAt: -1 })
        .toArray();
      return NextResponse.json(campaigns);
    }
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const db = await getDb();
  const campaigns = await db.collection('campaigns')
    .find({ providerId })
    .sort({ createdAt: -1 })
    .toArray();
  return NextResponse.json(campaigns);
} 