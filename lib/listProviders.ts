import { getDb } from "./mongo.ts";

async function main() {
  const db = await getDb();
  const providers = await db.collection("providers").find({}).toArray();
}

main().catch((err) => {
  process.exit(1);
}); 