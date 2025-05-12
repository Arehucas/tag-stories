import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB!;

async function seedTemplates() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const templates = db.collection('templates');

  const now = new Date();

  const defaultTemplates = [
    {
      _id: new ObjectId(),
      templateName: 'Basic Light',
      providerParentId: null,
      logoSize: 280,
      marginBottom: 50,
      marginRight: 50,
      displayLogo: true,
      displayText: true,
      igText: { size: 32, color: '#222', opacity: 0.9 },
      addressText: { size: 24, color: '#222', opacity: 0.7 },
      overlayUrl: '/overlays/overlay-white-default.png',
      plan: 'free',
      type: 'defaultLight',
      description: 'Plantilla clara por defecto',
      createdAt: now,
      updatedAt: now,
      isActive: true,
      previewUrl: '/overlays/overlay-white-default.png',
      order: 1,
      tags: ['default', 'light'],
      supportedFormats: ['jpg', 'png'],
      aspectRatio: '1:1',
    },
    {
      _id: new ObjectId(),
      templateName: 'Basic Dark',
      providerParentId: null,
      logoSize: 280,
      marginBottom: 50,
      marginRight: 50,
      displayLogo: true,
      displayText: true,
      igText: { size: 32, color: '#fff', opacity: 0.9 },
      addressText: { size: 24, color: '#fff', opacity: 0.7 },
      overlayUrl: '/overlays/overlay-dark-default.png',
      plan: 'free',
      type: 'defaultDark',
      description: 'Plantilla oscura por defecto',
      createdAt: now,
      updatedAt: now,
      isActive: true,
      previewUrl: '/overlays/overlay-dark-default.png',
      order: 2,
      tags: ['default', 'dark'],
      supportedFormats: ['jpg', 'png'],
      aspectRatio: '1:1',
    },
  ];

  await templates.deleteMany({ type: { $in: ['defaultLight', 'defaultDark'] } });
  await templates.insertMany(defaultTemplates);
  console.log('Plantillas por defecto insertadas');
  await client.close();
}

seedTemplates(); 