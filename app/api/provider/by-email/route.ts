import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { getServerSession } from 'next-auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  }
  if (email !== session.user.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  const db = await getDb();
  const provider = await db.collection("providers").findOne({ email });
  console.log("[BY-EMAIL] Resultado de búsqueda:", provider);
  if (!provider) {
    return NextResponse.json({ error: "Provider no encontrado" }, { status: 404 });
  }
  return NextResponse.json(provider);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const body = await req.json();
  const { email, nombre, direccion, ciudad, instagram_handle, logo_url, overlayPreference } = body;
  if (!email) {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  }
  if (email !== session.user.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  const db = await getDb();
  await db.collection("providers").updateOne(
    { email },
    {
      $set: {
        nombre,
        direccion,
        ciudad,
        instagram_handle,
        logo_url,
        overlayPreference,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date(), email },
    }
  );

  const provider = await db.collection("providers").findOne({ email });

  if (provider && provider.shortId) {
    const templateType = overlayPreference === 'dark-overlay' ? 'defaultDark' : 'defaultLight';
    const template = await db.collection('templates').findOne({ type: templateType, isActive: true });
    if (template) {
      await db.collection("campaigns").updateOne(
        { providerId: provider.shortId },
        { $set: { templateId: template._id } }
      );
    }
  }

  return NextResponse.json(
    provider ? { ...JSON.parse(JSON.stringify(provider)), _id: provider._id?.toString() } : null
  );
} 