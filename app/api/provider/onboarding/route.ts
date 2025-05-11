import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
  console.log("[ONBOARDING] Petición recibida en /api/provider/onboarding");
  const body = await req.json();
  console.log("[ONBOARDING] Body recibido:", body);
  const { nombre, direccion, ciudad, instagram_handle, logo_url, email, overlayPreference } = body;
  if (!nombre || !direccion || !ciudad || !instagram_handle || !logo_url || !email) {
    console.log("[ONBOARDING] Faltan campos obligatorios");
    return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
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
        logo_url,
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
  console.log("[ONBOARDING] Resultado de upsert:", provider);
  return NextResponse.json(
    provider ? { ...JSON.parse(JSON.stringify(provider)), _id: provider._id.toString() } : null
  );
} 