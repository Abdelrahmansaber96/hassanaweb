import { getMongoClient } from "./mongodb";
import { products as staticProducts, type Product } from "./products";

const DB_NAME = "hassanavet";
const COLLECTION = "products";
const READ_TIMEOUT_MS = 800;

async function getCol() {
  const client = await getMongoClient();
  return client.db(DB_NAME).collection(COLLECTION);
}

export async function readProducts(): Promise<Product[]> {
  const col = await getCol();
  return col
      .find({}, { projection: { _id: 0 } })
      .toArray() as unknown as Promise<Product[]>;
}

export async function readProductsWithFallback(): Promise<Product[]> {
  try {
    const products = await Promise.race<Product[]>([
      readProducts().catch(() => []),
      new Promise<Product[]>((resolve) => {
        setTimeout(() => resolve([]), READ_TIMEOUT_MS);
      }),
    ]);

    if (products.length > 0) {
      return products;
    }

    return staticProducts;
  } catch {
    return staticProducts;
  }
}

export async function addProduct(product: Product): Promise<void> {
  const col = await getCol();
  await col.insertOne({ ...product });
}

export async function deleteProduct(id: string): Promise<boolean> {
  const col = await getCol();
  const result = await col.deleteOne({ id });
  return result.deletedCount > 0;
}
