import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";

export async function GET(req: NextRequest) {
  console.log("********* BY-EMAIL ENDPOINT EJECUTÁNDOSE *********");
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  }
  console.log("[BY-EMAIL] Email recibido:", email);
  const db = await getDb();
  const provider = await db.collection("providers").findOne({ email });
  console.log("[BY-EMAIL] Resultado de búsqueda:", provider);
  if (!provider) {
    return NextResponse.json({ error: "Provider no encontrado" }, { status: 404 });
  }
  return NextResponse.json(provider);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, nombre, direccion, ciudad, instagram_handle, logo_url } = body;
  if (!email) {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
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
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date(), email },
    },
    { upsert: true, returnDocument: "after" }
  );
  // @ts-expect-error: result.value puede ser undefined según el tipado de MongoDB, pero está bien para este flujo
  const provider = result.value;
  return NextResponse.json(
    provider ? { ...JSON.parse(JSON.stringify(provider)), _id: provider._id?.toString() } : null
  );
} 