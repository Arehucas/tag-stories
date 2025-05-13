import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { nanoid } from 'nanoid';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const body = await req.json();
  const { nombre, direccion, ciudad, instagram_handle, logo_url, email, overlayPreference } = body;
  const finalLogoUrl = logo_url || '/logos/logo-provider-default.jpg';
  if (!nombre || !direccion || !ciudad || !instagram_handle || !email) {
    return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
  }
  if (email !== session.user.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  const db = await getDb();
  let provider = await db.collection("providers").findOne({ email });
  let shortId = provider?.shortId;
  let slug = provider?.slug;
  if (!provider) {
    shortId = nanoid(6);
    slug = shortId;
  }
  const result = await db.collection("providers").findOneAndUpdate(
    { email },
    {
      $set: {
        nombre,
        direccion,
        ciudad,
        instagram_handle,
        logo_url: finalLogoUrl,
        email,
        overlayPreference: overlayPreference || 'light-overlay',
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date(), shortId, slug },
    },
    { upsert: true, returnDocument: "after" }
  );
  // @ts-expect-error: result.value puede ser undefined según el tipado de MongoDB, pero está bien para este flujo
  provider = result.value;
  return NextResponse.json(
    provider ? { ...JSON.parse(JSON.stringify(provider)), _id: provider._id.toString() } : null
  );
} 