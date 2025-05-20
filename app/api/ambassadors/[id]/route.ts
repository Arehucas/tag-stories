import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest, context: { params: any }) {
  try {
    const params = await context.params;
    const { id } = params;
    const db = await getDb();
    const ambassador = await db.collection('ambassadors').findOne({ _id: new ObjectId(id) });
    if (!ambassador) {
      return NextResponse.json({ error: 'Ambassador no encontrado' }, { status: 404 });
    }
    return NextResponse.json({
      _id: ambassador._id,
      igName: ambassador.igName,
      createdAt: ambassador.createdAt,
      updatedAt: ambassador.updatedAt,
      stories: ambassador.stories,
      campaigns: ambassador.campaigns,
      providers: ambassador.providers,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

/**
 * Fusiona todos los ambassadors con el mismo igName en el ambassador principal (ambassadorId).
 * Mueve stories, providers y campaigns, elimina duplicados y borra los ambassadors fusionados.
 */
async function mergeAmbassadorsByIgName(igName: string, ambassadorId: string) {
  const db = await getDb();
  const mainId = new ObjectId(ambassadorId);
  // Buscar todos los ambassadors con ese igName (case-insensitive), excepto el actual
  const others = await db.collection('ambassadors').find({
    igName: { $regex: `^${igName}$`, $options: 'i' },
    _id: { $ne: mainId }
  }).toArray();
  if (!others.length) return;
  // Acumular stories, providers y campaigns
  let allStories: ObjectId[] = [];
  let allProviders: string[] = [];
  let allCampaigns: ObjectId[] = [];
  for (const amb of others) {
    allStories = allStories.concat(amb.stories || []);
    allProviders = allProviders.concat(amb.providers || []);
    allCampaigns = allCampaigns.concat(amb.campaigns || []);
  }
  // Añadir los del principal
  const main = await db.collection('ambassadors').findOne({ _id: mainId });
  if (main) {
    allStories = allStories.concat(main.stories || []);
    allProviders = allProviders.concat(main.providers || []);
    allCampaigns = allCampaigns.concat(main.campaigns || []);
  }
  // Eliminar duplicados
  allStories = Array.from(new Set(allStories.map(s => s.toString()))).map(s => new ObjectId(s));
  allProviders = Array.from(new Set(allProviders));
  allCampaigns = Array.from(new Set(allCampaigns.map(c => c.toString()))).map(c => new ObjectId(c));
  // Actualizar el principal
  await db.collection('ambassadors').updateOne(
    { _id: mainId },
    { $set: { stories: allStories, providers: allProviders, campaigns: allCampaigns, updatedAt: new Date() } }
  );
  // Actualizar las stories para que apunten al ambassador principal
  await db.collection('storySubmissions').updateMany(
    { ambassadorId: { $in: others.map(a => a._id) } },
    { $set: { ambassadorId: mainId } }
  );
  // Borrar los ambassadors fusionados
  await db.collection('ambassadors').deleteMany({ _id: { $in: others.map(a => a._id) } });
}

export async function PATCH(req: NextRequest, context: { params: any }) {
  try {
    const params = await context.params;
    const { id } = params;
    const { igName } = await req.json();
    if (typeof igName !== 'string' || igName.trim().length === 0) {
      return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 });
    }
    const db = await getDb();
    const result = await db.collection('ambassadors').updateOne(
      { _id: new ObjectId(id) },
      { $set: { igName, updatedAt: new Date() } }
    );
    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 404 });
    }
    // Llamar a la función de merge tras actualizar el igName
    await mergeAmbassadorsByIgName(igName, id);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
} 