import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;
if (!uri) throw new Error("MONGODB_URI no está definida en el entorno");

// Añadir tipado para evitar error de TypeScript
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
const clientPromise = global._mongoClientPromise!;

export default clientPromise; 