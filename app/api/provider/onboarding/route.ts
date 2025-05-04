import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";

export async function POST(req: NextRequest) {
  console.log("[ONBOARDING] Petición recibida en /api/provider/onboarding");
  const body = await req.json();
  console.log("[ONBOARDING] Body recibido:", body);
  const { nombre, direccion, ciudad, instagram_handle, logo_url, email } = body;
  if (!nombre || !direccion || !ciudad || !instagram_handle || !logo_url || !email) {
    console.log("[ONBOARDING] Faltan campos obligatorios");
    return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
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
        email,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true, returnDocument: "after" }
  );
  // @ts-ignore
  const provider = result.value;
  console.log("[ONBOARDING] Resultado de upsert:", provider);
  if (provider && provider._id) {
    provider._id = provider._id.toString();
  }
  return NextResponse.json(provider ? JSON.parse(JSON.stringify(provider)) : null);
} 