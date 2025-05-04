import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI as string;
let client: MongoClient | null = null;
let db: Db | null = null;

export async function getMongoClient() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

export async function getDb() {
  if (!db) {
    const client = await getMongoClient();
    db = client.db();
  }
  return db;
} 