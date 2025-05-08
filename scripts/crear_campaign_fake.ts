import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI as string;
if (!uri) throw new Error("MONGODB_URI no está definida en el entorno");

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const providers = db.collection("providers");
  const campaigns = db.collection("campaigns");
  const email = "fake@provider.com";
  try {
    // Buscar el provider fake
    const provider = await providers.findOne({ email });
    if (!provider) throw new Error("No se encontró el provider fake. Ejecuta primero crear_provider_fake.ts");
    // Crear campaña demo
    const result = await campaigns.insertOne({
      providerId: provider.shortId,
      nombre: "Campaña Demo",
      descripcion: "Esta es una campaña de prueba para el provider demo.",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("Campaña fake insertada:", result.insertedId);
  } catch (err) {
    console.error("Error al insertar campaña fake:", err);
  }
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 