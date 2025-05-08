import "dotenv/config";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;
if (!uri) throw new Error("MONGODB_URI no está definida en el entorno");

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const providers = await db.collection("providers").find({}).toArray();
  providers.forEach(p => {
    console.log({ shortId: p.shortId, email: p.email, nombre: p.nombre });
  });
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 