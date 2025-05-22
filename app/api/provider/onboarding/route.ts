import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { nanoid } from 'nanoid';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  const body = await req.json();
  const { nombre, direccion, ciudad, instagram_handle, logo_url, email, overlayPreference } = body;
  const finalLogoUrl = logo_url || '/logos/logo-provider-default.jpg';

  // BYPASS SOLO EN DESARROLLO PARA DEMO
  if (
    process.env.NODE_ENV === "development" &&
    (!session || !session.user?.email) &&
    email === "demo@demo.com"
  ) {
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
    const updatedProvider = result && result.value ? result.value : null;
    return NextResponse.json(
      updatedProvider ? { ...JSON.parse(JSON.stringify(updatedProvider)), _id: updatedProvider._id.toString() } : null
    );
  }

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
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
  const updatedProvider = result && result.value ? result.value : null;
  return NextResponse.json(
    updatedProvider ? { ...JSON.parse(JSON.stringify(updatedProvider)), _id: updatedProvider._id.toString() } : null
  );
} 