import { getMongoClient } from "./mongodb";
import {
  normalizeProducts,
  products as staticProducts,
  type Product,
} from "./products";

const DB_NAME = "hassanavet";
const COLLECTION = "products";
let hasSeededStaticProducts = false;

async function getCol() {
  const client = await getMongoClient();
  return client.db(DB_NAME).collection(COLLECTION);
}

async function ensureStaticProductsSeeded() {
  const col = await getCol();

  if (hasSeededStaticProducts || staticProducts.length === 0) {
    return col;
  }

  const existingProductCount = await col.estimatedDocumentCount();

  if (existingProductCount > 0) {
    hasSeededStaticProducts = true;
    return col;
  }

  await col.bulkWrite(
    staticProducts.map((product) => ({
      updateOne: {
        filter: { id: product.id },
        update: { $setOnInsert: product },
        upsert: true,
      },
    })),
    { ordered: false }
  );

  hasSeededStaticProducts = true;

  return col;
}

export async function readProducts(): Promise<Product[]> {
  const col = await getCol();
  const products = (await col.find({}, { projection: { _id: 0 } }).toArray()) as Array<Record<string, unknown>>;
  return normalizeProducts(products);
}

export async function readProductsWithFallback(): Promise<Product[]> {
  try {
    const products = await readProducts().catch(() => []);

    if (products.length > 0) {
      return products;
    }

    return staticProducts;
  } catch {
    return staticProducts;
  }
}

export async function addProduct(product: Product): Promise<void> {
  const col = await ensureStaticProductsSeeded();
  await col.insertOne({ ...product });
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<boolean> {
  const col = await ensureStaticProductsSeeded();
  const result = await col.updateOne({ id }, { $set: updates });
  return result.matchedCount > 0;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const col = await ensureStaticProductsSeeded();
  const result = await col.deleteOne({ id });
  return result.deletedCount > 0;
}
