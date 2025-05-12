import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB!;

async function createDemoUser() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const users = db.collection('users');

  const email = 'demo@demo.com';
  const now = new Date();

  const result = await users.updateOne(
    { email },
    {
      $set: {
        name: 'Demo User',
        email,
        plan: 'pro', // Cambia a 'free' si quieres probar el plan free
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  );

  console.log('Usuario demo creado/actualizado:', result.upsertedId || email);
  await client.close();
}

createDemoUser(); 