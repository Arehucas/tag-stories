import { getDb } from "./mongo.ts";

async function main() {
  const db = await getDb();
  const providers = await db.collection("providers").find({}).toArray();
  console.log("Proveedores en la base de datos:");
  console.log(JSON.stringify(providers, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 