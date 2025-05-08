import { getDb } from '../lib/mongo';
import { ObjectId } from 'mongodb';

async function migrarStories() {
  const db = await getDb();
  const stories = await db.collection('storySubmissions').find({}).toArray();
  let actualizadas = 0;
  for (const story of stories) {
    if (!story.providerId) continue;
    // Buscar campaña activa
    const campaign = await db.collection('campaigns').findOne({ providerId: story.providerId, isActive: true });
    const campaignId = campaign ? campaign._id : null;
    const res = await db.collection('storySubmissions').updateOne(
      { _id: story._id },
      { $set: { campaignId } }
    );
    if (res.modifiedCount > 0) actualizadas++;
  }
  console.log(`Stories actualizadas: ${actualizadas}`);
  process.exit(0);
}

migrarStories().catch(e => { console.error(e); process.exit(1); }); 