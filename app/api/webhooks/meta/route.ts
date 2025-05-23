import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { getInstagramUsername } from '@/lib/utils';
import { bmvbhash } from 'blockhash-core';
import fetch from 'node-fetch';
import { createCanvas, Image } from 'canvas';

// Verificador seguro generado
const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || 'taunMetaWebhook2024';

function hammingDistance(a: string, b: string): number {
  if (!a || !b || a.length !== b.length) return Infinity;
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) dist++;
  }
  return dist;
}

async function mergeAmbassadorsByIgName(igName: string, ambassadorId: string) {
  // Copiado de app/api/ambassadors/[id]/route.ts
  const db = await getDb();
  const mainId = new ObjectId(ambassadorId);
  const others = await db.collection('ambassadors').find({
    igName: { $regex: `^${igName}$`, $options: 'i' },
    _id: { $ne: mainId }
  }).toArray();
  if (!others.length) return;
  let allStories: any[] = [];
  let allProviders: any[] = [];
  let allCampaigns: any[] = [];
  for (const amb of others) {
    allStories = allStories.concat(amb.stories || []);
    allProviders = allProviders.concat(amb.providers || []);
    allCampaigns = allCampaigns.concat(amb.campaigns || []);
  }
  const main = await db.collection('ambassadors').findOne({ _id: mainId });
  if (main) {
    allStories = allStories.concat(main.stories || []);
    allProviders = allProviders.concat(main.providers || []);
    allCampaigns = allCampaigns.concat(main.campaigns || []);
  }
  allStories = Array.from(new Set(allStories.map(s => s.toString()))).map(s => new ObjectId(s));
  allProviders = Array.from(new Set(allProviders));
  allCampaigns = Array.from(new Set(allCampaigns.map(c => c.toString()))).map(c => new ObjectId(c));
  await db.collection('ambassadors').updateOne(
    { _id: mainId },
    { $set: { stories: allStories, providers: allProviders, campaigns: allCampaigns, updatedAt: new Date() } }
  );
  await db.collection('storySubmissions').updateMany(
    { ambassadorId: { $in: others.map(a => a._id) } },
    { $set: { ambassadorId: mainId } }
  );
  await db.collection('ambassadors').deleteMany({ _id: { $in: others.map(a => a._id) } });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log('[WEBHOOK][RAW BODY]', JSON.stringify(body));
  if (body.object === 'instagram' && Array.isArray(body.entry)) {
    const db = await getDb();
    for (const entry of body.entry) {
      if (Array.isArray(entry.changes)) {
        for (const change of entry.changes) {
          const { field, value } = change;
          if (field === 'mention' && value.media && value.sender && value.recipient) {
            const recipientId = value.recipient.id; // IG user id del provider
            const senderId = value.sender.id; // IG user id del usuario
            const mediaUrl = value.media.image || value.media.media_url;
            const mediaId = value.media.id;
            // Buscar stories pendientes para ese provider
            const pendingStories = await db.collection('storySubmissions').find({
              providerInstagramUserId: recipientId,
              status: 'pending'
            }).toArray();
            // Descargar imagen y calcular pHash (si es posible)
            let incomingPhash = null;
            try {
              const imgRes = await fetch(mediaUrl);
              const buf = await imgRes.buffer();
              const img = new Image();
              img.src = buf;
              const canvas = createCanvas(img.width, img.height);
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);
              const imageData = ctx.getImageData(0, 0, img.width, img.height);
              incomingPhash = bmvbhash(imageData, 16);
            } catch (e) {
              console.error('[WEBHOOK][ERROR IMG PHASH]', e);
            }
            // Guardar SIEMPRE el raw webhook
            const rawResult = await db.collection('rawStories').insertOne({
              webhookBody: body,
              media_id: mediaId,
              media_url: mediaUrl,
              phash: incomingPhash,
              timestamp: Date.now(),
              // storyId: solo si hay match
            });
            // Comparar con stories pendientes SOLO si hay stories y phash
            if (pendingStories.length && incomingPhash) {
              let matchedStory = null;
              let minDistance = Infinity;
              for (const story of pendingStories) {
                if (!story.originalPhash) continue;
                const dist = hammingDistance(story.originalPhash, incomingPhash);
                if (dist < minDistance) {
                  minDistance = dist;
                  matchedStory = story;
                }
              }
              const UMBRAL = 5;
              if (matchedStory && minDistance <= UMBRAL) {
                // Actualizar story
                await db.collection('storySubmissions').updateOne(
                  { _id: matchedStory._id },
                  {
                    $set: {
                      status: 'validated',
                      validatedBy: 'auto',
                      validatedAt: new Date(),
                      validationMethod: 'phash',
                      validationScore: minDistance,
                      rawStoryId: rawResult.insertedId
                    }
                  }
                );
                // LOG DETALLADO
                console.log('[WEBHOOK][STORY VALIDADA AUTO]', {
                  storyId: matchedStory._id,
                  provider: recipientId,
                  usuarioIG: senderId,
                  incomingPhash,
                  originalPhash: matchedStory.originalPhash,
                  distancia: minDistance,
                  campaignId: matchedStory.campaignId
                });
                // --- Lógica ambassador: actualizar igName y merge ---
                if (matchedStory.ambassadorId) {
                  // Obtener access token del provider
                  const provider = await db.collection('providers').findOne({ instagram_user_id: recipientId });
                  const accessToken = provider?.instagram_access_token;
                  if (accessToken) {
                    const username = await getInstagramUsername(senderId, accessToken);
                    if (username) {
                      const ambassador = await db.collection('ambassadors').findOne({ _id: new ObjectId(matchedStory.ambassadorId) });
                      if (ambassador && ambassador.igName !== username) {
                        await db.collection('ambassadors').updateOne(
                          { _id: new ObjectId(matchedStory.ambassadorId) },
                          { $set: { igName: username, updatedAt: new Date() } }
                        );
                        await mergeAmbassadorsByIgName(username, matchedStory.ambassadorId.toString());
                        console.log('[WEBHOOK][AMBASSADOR IGNAME ACTUALIZADO Y MERGEADO]', {
                          ambassadorId: matchedStory.ambassadorId,
                          nuevoIgName: username
                        });
                      }
                    }
                  }
                }
              } else {
                console.log('[WEBHOOK][NO PHASH MATCH]', { incomingPhash, minDistance });
              }
            }
          }
        }
      }
    }
  } else {
    console.log('Evento recibido de Meta:', JSON.stringify(body));
  }
  return new NextResponse('EVENT_RECEIVED', { status: 200 });
} 