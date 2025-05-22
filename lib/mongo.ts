import clientPromise from './mongoPromise';
import { Db } from 'mongodb';

let db: Db | null = null;

export async function getDb() {
  if (!db) {
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB;
    db = dbName ? client.db(dbName) : client.db();
  }
  return db;
} 