import { getServerSession } from 'next-auth';
import { getDb } from '@/lib/mongo';

export async function GET(req: Request) {
  // @ts-ignore
  const session = await getServerSession();
  if (!session?.user?.email) {
    return new Response('Unauthorized', { status: 401 });
  }
  const db = await getDb();
  const user = await db.collection('users').findOne({ email: session.user.email });
  const plan = user?.plan || 'free';
  return Response.json({ plan });
} 