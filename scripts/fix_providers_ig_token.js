const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI; // Debe estar en tu .env
const dbName = process.env.MONGODB_DB;

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = dbName ? client.db(dbName) : client.db();
    const result = await db.collection("providers").updateMany(
      { instagram_access_token: { $exists: false } },
      { $set: { instagram_access_token: null } }
    );
    console.log(`Documentos actualizados: ${result.modifiedCount}`);
  } finally {
    await client.close();
  }
}

main().catch(console.error); 