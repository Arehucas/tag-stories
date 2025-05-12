import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";

export async function GET(req: NextRequest, { params }: { params: Promise<{ providerId: string }> }) {
  const { providerId } = await params;
  const db = await getDb();
  // Buscar solo por slug (que puede ser shortId o slug personalizado)
  const provider = await db.collection("providers").findOne({ slug: providerId });
  if (!provider) {
    return NextResponse.json({ error: "Provider no encontrado" }, { status: 404 });
  }
  // Solo devolvemos los campos necesarios
  return NextResponse.json({
    nombre: provider.nombre,
    direccion: provider.direccion,
    logo_url: provider.logo_url,
    instagram_handle: provider.instagram_handle,
    instrucciones: provider.instrucciones || "Haz una foto de tu experiencia y descárgala. Sube la imagen a tu Instagram Story mencionando al local para conseguir tu recompensa.",
  });
} 