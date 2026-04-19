import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const serverSelectionTimeoutMS = 5000;
const connectTimeoutMS = 5000;
const socketTimeoutMS = 10000;

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
      global._mongoClientPromise = createClientPromise().catch((error) => {
        global._mongoClientPromise = undefined;
        throw error;
      });
    }

    return global._mongoClientPromise;
  }

  return createClientPromise();
}
