const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

async function migrate() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const users = db.collection('users');
  const result = await users.updateMany(
    { plan: { $exists: false } },
    { $set: { plan: 'free' } }
  );
  console.log(`Usuarios actualizados: ${result.modifiedCount}`);
  await client.close();
}

migrate(); 