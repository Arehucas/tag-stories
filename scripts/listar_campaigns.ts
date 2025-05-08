import "dotenv/config";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;
if (!uri) throw new Error("MONGODB_URI no está definida en el entorno");

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const campaigns = await db.collection("campaigns").find({}).toArray();
  campaigns.forEach(c => {
    console.log({ providerId: c.providerId, nombre: c.nombre, _id: c._id });
  });
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 