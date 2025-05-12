import { getDb } from './mongo';
import { ObjectId } from 'mongodb';

export async function getUserPlan(userId: string): Promise<'free' | 'pro' | 'enterprise'> {
  const db = await getDb();
  const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
  return user?.plan || 'free';
}

export async function getUserPlanByEmail(email: string): Promise<'free' | 'pro' | 'enterprise'> {
  const db = await getDb();
  const user = await db.collection('users').findOne({ email });
  return user?.plan || 'free';
}

export async function isUserPro(userId: string): Promise<boolean> {
  const db = await getDb();
  const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
  return user?.plan === 'pro' && (!user.planExpiresAt || user.planExpiresAt > new Date());
} 