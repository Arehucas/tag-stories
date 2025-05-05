import "dotenv/config";
import { MongoClient } from "mongodb";
import { nanoid } from 'nanoid';

const uri = process.env.MONGODB_URI as string;
if (!uri) throw new Error("MONGODB_URI no está definida en el entorno");

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const providers = db.collection("providers");
  const email = "fake@provider.com";
  try {
    const shortId = nanoid(6);
    const slug = shortId;
    const result = await providers.insertOne({
      nombre: "Fake Local",
      direccion: "Calle Falsa 123",
      ciudad: "Faketown",
      instagram_handle: "fakelocal",
      logo_url: "https://dummyimage.com/200x200/23243a/f8f8f8.png&text=Fake",
      email,
      shortId,
      slug,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("Provider fake insertado:", result.insertedId);
  } catch (err) {
    console.error("Error al insertar provider fake:", err);
  }
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 