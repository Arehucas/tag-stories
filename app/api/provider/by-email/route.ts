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