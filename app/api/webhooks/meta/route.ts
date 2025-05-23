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

// Helper para extraer subimagen de un ImageData (acepta cualquier tipo compatible)
function getSubImageData(imageData: any, x: number, y: number, w: number, h: number): any {
  const { data, width } = imageData;
  const subData = new Uint8ClampedArray(w * h * 4);
  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {
      const srcIdx = ((y + row) * width + (x + col)) * 4;
      const dstIdx = (row * w + col) * 4;
      subData[dstIdx] = data[srcIdx];
      subData[dstIdx + 1] = data[srcIdx + 1];
      subData[dstIdx + 2] = data[srcIdx + 2];
      subData[dstIdx + 3] = data[srcIdx + 3];
    }
  }
  // node-canvas ImageData constructor
  return new (imageData.constructor)(subData, w, h);
}

// Blockwise pHash
function blockwisePhash(imageData: any, grid: number = 10): string[] {
  const cellW = Math.floor(imageData.width / grid);
  const cellH = Math.floor(imageData.height / grid);
  const hashes: string[] = [];
  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < grid; x++) {
      const cell = getSubImageData(imageData, x * cellW, y * cellH, cellW, cellH);
      hashes.push(bmvbhash(cell, 8));
    }
  }
  return hashes;
}

function compareBlockwisePhash(arr1: string[], arr2: string[], hammingThreshold: number = 5): number {
  let matches = 0;
  for (let i = 0; i < arr1.length; i++) {
    if (hammingDistance(arr1[i], arr2[i]) <= hammingThreshold) matches++;
  }
  return matches / arr1.length;
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
      // --- Soporte para entry.changes[] (menciones clásicas) ---
      if (Array.isArray(entry.changes)) {
        for (const change of entry.changes) {
          const { field, value } = change;
          if (field === 'mention' && value.media && value.sender && value.recipient) {
            const recipientId = value.recipient.id;
            const senderId = value.sender.id;
            const mediaUrl = value.media.image || value.media.media_url;
            const mediaId = value.media.id;
            // Buscar stories pending creadas en las últimas 24h
            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const pendingStories = await db.collection('storySubmissions').find({
              status: 'pending',
              createdAt: { $gte: yesterday }
            }).toArray();
            // Descargar imagen y calcular pHash (si es posible)
            let incomingPhash = null;
            let receivedImageData = null;
            let receivedBlockwisePhashArray = null;
            try {
              const imgRes = await fetch(mediaUrl);
              const arrBuf = await imgRes.arrayBuffer();
              const buf = Buffer.from(arrBuf);
              const img = new Image();
              img.src = buf;
              // Escalar a 1080x1920 antes de calcular blockwise
              const TARGET_WIDTH = 1080;
              const TARGET_HEIGHT = 1920;
              const canvas = createCanvas(TARGET_WIDTH, TARGET_HEIGHT);
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);
              receivedImageData = ctx.getImageData(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
              incomingPhash = bmvbhash(receivedImageData, 16);
              receivedBlockwisePhashArray = blockwisePhash(receivedImageData, 10);
            } catch (e) {
              console.error('[WEBHOOK][ERROR IMG PHASH]', e);
            }
            // Guardar SIEMPRE el raw webhook
            await db.collection('rawStories').insertOne({
              webhookBody: body,
              media_id: mediaId,
              media_url: mediaUrl,
              phash: incomingPhash,
              blockwisePhashArray: receivedBlockwisePhashArray,
              timestamp: Date.now(),
            });
            // Matching solo si hay stories y blockwisePhashArray
            let storyValidated = false;
            let storyValidado = null;
            if (pendingStories.length && receivedBlockwisePhashArray) {
              for (const story of pendingStories) {
                if (!story.blockwisePhashArray || !story.imageUrl) continue;
                try {
                  const matchRatio = compareBlockwisePhash(story.blockwisePhashArray, receivedBlockwisePhashArray, 5);
                  console.log('[WEBHOOK][BLOCKWISE MATCH DEBUG][24h]', {
                    storyId: story._id,
                    matchRatio,
                  });
                  if (matchRatio >= 0.92 && !storyValidated) {
                    await db.collection('storySubmissions').updateOne(
                      { _id: story._id },
                      {
                        $set: {
                          status: 'validated',
                          validatedBy: 'auto',
                          validatedAt: new Date(),
                          validationMethod: 'blockwise-phash',
                          validationScore: matchRatio,
                          rawStoryId: null
                        }
                      }
                    );
                    console.log('[WEBHOOK][STORY VALIDADA AUTO][blockwise][24h]', {
                      storyId: story._id,
                      matchRatio,
                    });
                    storyValidated = true;
                    storyValidado = story;
                    break;
                  }
                } catch (e) {
                  console.error('[WEBHOOK][ERROR BLOCKWISE MATCH][24h]', e);
                }
              }
            }
            if (storyValidated && storyValidado) {
              if (storyValidado.ambassadorId) {
                const provider = await db.collection('providers').findOne({ instagram_user_id: recipientId });
                const accessToken = provider?.instagram_access_token;
                if (accessToken) {
                  const username = await getInstagramUsername(senderId, accessToken);
                  if (username) {
                    const ambassador = await db.collection('ambassadors').findOne({ _id: new ObjectId(storyValidado.ambassadorId) });
                    if (ambassador && ambassador.igName !== username) {
                      await db.collection('ambassadors').updateOne(
                        { _id: new ObjectId(storyValidado.ambassadorId) },
                        { $set: { igName: username, updatedAt: new Date() } }
                      );
                      await mergeAmbassadorsByIgName(username, storyValidado.ambassadorId.toString());
                      console.log('[WEBHOOK][AMBASSADOR IGNAME ACTUALIZADO Y MERGEADO][blockwise][24h]', {
                        ambassadorId: storyValidado.ambassadorId,
                        nuevoIgName: username
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
      // --- Soporte para entry.messaging[] (story_mention en mensajes) ---
      if (Array.isArray(entry.messaging)) {
        for (const msg of entry.messaging) {
          if (
            msg.message &&
            Array.isArray(msg.message.attachments)
          ) {
            for (const att of msg.message.attachments) {
              if (att.type === 'story_mention' && att.payload && att.payload.url) {
                const recipientId = msg.recipient?.id;
                const senderId = msg.sender?.id;
                const mediaUrl = att.payload.url;
                const mediaId = att.payload.asset_id || null;
                // Buscar stories pending creadas en las últimas 24h
                const now = new Date();
                const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                const pendingStories = await db.collection('storySubmissions').find({
                  status: 'pending',
                  createdAt: { $gte: yesterday }
                }).toArray();
                // Descargar imagen y calcular pHash (si es posible)
                let incomingPhash = null;
                let receivedImageData = null;
                let receivedBlockwisePhashArray = null;
                try {
                  const imgRes = await fetch(mediaUrl);
                  const arrBuf = await imgRes.arrayBuffer();
                  const buf = Buffer.from(arrBuf);
                  const img = new Image();
                  img.src = buf;
                  // Escalar a 1080x1920 antes de calcular blockwise
                  const TARGET_WIDTH = 1080;
                  const TARGET_HEIGHT = 1920;
                  const canvas = createCanvas(TARGET_WIDTH, TARGET_HEIGHT);
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(img, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);
                  receivedImageData = ctx.getImageData(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
                  incomingPhash = bmvbhash(receivedImageData, 16);
                  receivedBlockwisePhashArray = blockwisePhash(receivedImageData, 10);
                } catch (e) {
                  console.error('[WEBHOOK][ERROR IMG PHASH][messaging]', e);
                }
                // Guardar SIEMPRE el raw webhook
                await db.collection('rawStories').insertOne({
                  webhookBody: body,
                  media_id: mediaId,
                  media_url: mediaUrl,
                  phash: incomingPhash,
                  blockwisePhashArray: receivedBlockwisePhashArray,
                  timestamp: Date.now(),
                });
                // Matching solo si hay stories y blockwisePhashArray
                let storyValidated = false;
                let storyValidado = null;
                if (pendingStories.length && receivedBlockwisePhashArray) {
                  for (const story of pendingStories) {
                    if (!story.blockwisePhashArray || !story.imageUrl) continue;
                    try {
                      const matchRatio = compareBlockwisePhash(story.blockwisePhashArray, receivedBlockwisePhashArray, 5);
                      console.log('[WEBHOOK][BLOCKWISE MATCH DEBUG][messaging][24h]', {
                        storyId: story._id,
                        matchRatio,
                      });
                      if (matchRatio >= 0.92 && !storyValidated) {
                        await db.collection('storySubmissions').updateOne(
                          { _id: story._id },
                          {
                            $set: {
                              status: 'validated',
                              validatedBy: 'auto',
                              validatedAt: new Date(),
                              validationMethod: 'blockwise-phash',
                              validationScore: matchRatio,
                              rawStoryId: null
                            }
                          }
                        );
                        console.log('[WEBHOOK][STORY VALIDADA AUTO][blockwise][messaging][24h]', {
                          storyId: story._id,
                          matchRatio,
                        });
                        storyValidated = true;
                        storyValidado = story;
                        break;
                      }
                    } catch (e) {
                      console.error('[WEBHOOK][ERROR BLOCKWISE MATCH][messaging][24h]', e);
                    }
                  }
                }
                // Log explícito de evento messaging
                console.log('[WEBHOOK][RAW MESSAGING EVENT]', {
                  senderId,
                  recipientId,
                  mediaUrl,
                  mediaId,
                  timestamp: msg.timestamp
                });
                if (storyValidated && storyValidado) {
                  if (storyValidado.ambassadorId) {
                    const provider = await db.collection('providers').findOne({ instagram_user_id: recipientId });
                    const accessToken = provider?.instagram_access_token;
                    if (accessToken) {
                      const username = await getInstagramUsername(senderId, accessToken);
                      if (username) {
                        const ambassador = await db.collection('ambassadors').findOne({ _id: new ObjectId(storyValidado.ambassadorId) });
                        if (ambassador && ambassador.igName !== username) {
                          await db.collection('ambassadors').updateOne(
                            { _id: new ObjectId(storyValidado.ambassadorId) },
                            { $set: { igName: username, updatedAt: new Date() } }
                          );
                          await mergeAmbassadorsByIgName(username, storyValidado.ambassadorId.toString());
                          console.log('[WEBHOOK][AMBASSADOR IGNAME ACTUALIZADO Y MERGEADO][blockwise][messaging][24h]', {
                            ambassadorId: storyValidado.ambassadorId,
                            nuevoIgName: username
                          });
                        }
                      }
                    }
                  }
                }
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