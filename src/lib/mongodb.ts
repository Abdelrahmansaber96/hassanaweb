import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise() {
  if (!uri) {
    throw new Error("Please add MONGODB_URI to your .env.local file");
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 800,
    connectTimeoutMS: 800,
    socketTimeoutMS: 1500,
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
