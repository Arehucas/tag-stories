import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest, { params }: { params: Promise<{ providerId: string }> }) {
  const { providerId } = await params;
  const db = await getDb();
  let provider;
  // Permitir buscar por ObjectId o por slug/nombre
  if (ObjectId.isValid(providerId)) {
    provider = await db.collection("providers").findOne({ _id: new ObjectId(providerId) });
  } else {
    provider = await db.collection("providers").findOne({ slug: providerId });
    if (!provider) {
      provider = await db.collection("providers").findOne({ nombre: providerId });
    }
  }
  if (!provider) {
    return NextResponse.json({ error: "Provider no encontrado" }, { status: 404 });
  }
  // Solo devolvemos los campos necesarios
  return NextResponse.json({
    nombre: provider.nombre,
    logo: provider.logo_url,
    instagram: provider.instagram_handle,
    instrucciones: provider.instrucciones || "Haz una foto de tu experiencia y descárgala. Sube la imagen a tu Instagram Story mencionando al local para conseguir tu recompensa.",
  });
} 