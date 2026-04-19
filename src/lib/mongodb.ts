import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const isProduction = process.env.NODE_ENV === "production";
const serverSelectionTimeoutMS = isProduction ? 5000 : 800;
const connectTimeoutMS = isProduction ? 5000 : 800;
const socketTimeoutMS = isProduction ? 10000 : 1500;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise() {
  if (!uri) {
    throw new Error("Please add MONGODB_URI to your .env.local file");
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS,
    connectTimeoutMS,
    socketTimeoutMS,
  });

  return client.connect();
}

export async function getMongoClient() {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = createClientPromise();
    }

    return global._mongoClientPromise;
  }

  return createClientPromise();
}
