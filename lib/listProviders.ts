import { getDb } from "./mongo.ts";

async function main() {
  const db = await getDb();
  const providers = await db.collection("providers").find({}).toArray();
  console.log("Proveedores en la base de datos:");
  providers.forEach(p => {
    console.log(`Nombre: ${p.nombre}, shortId: ${p.shortId}, slug: ${p.slug}`);
  });
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 