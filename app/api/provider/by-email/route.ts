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
  const result = await db.collection("providers").findOneAndUpdate(
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
    },
    { upsert: true, returnDocument: "after" }
  );
  // @ts-expect-error: result.value puede ser undefined según el tipado de MongoDB, pero está bien para este flujo
  const provider = result.value;

  // Si hay campaña para este provider, actualiza overlayType y overlayUrl
  if (provider) {
    const providerIds = [provider._id?.toString(), provider.shortId, provider.slug, provider.email].filter(Boolean);
    const campaign = await db.collection("campaigns").findOne({ providerId: { $in: providerIds } });
    if (campaign) {
      const overlayUrl = overlayPreference === 'dark-overlay'
        ? '/overlays/overlay-dark-default.png'
        : '/overlays/overlay-white-default.png';
      await db.collection("campaigns").updateOne(
        { providerId: campaign.providerId },
        { $set: { overlayType: 'default', overlayUrl } }
      );
    }
  }

  return NextResponse.json(
    provider ? { ...JSON.parse(JSON.stringify(provider)), _id: provider._id?.toString() } : null
  );
} 