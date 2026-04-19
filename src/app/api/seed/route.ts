import { NextRequest, NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";
import { CATEGORY_LABELS, products as seedProducts } from "@/lib/products";

export async function POST(request: NextRequest) {
  // Protect with the dashboard secret to prevent public access
  const authHeader = request.headers.get("authorization");
  const secret = process.env.DASHBOARD_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await getMongoClient();
    const db = client.db("hassanavet");

    // Build categories from CATEGORY_LABELS
    const catCol = db.collection("categories");
    await catCol.deleteMany({});
    const categories = Object.entries(CATEGORY_LABELS).map(([id, name]) => {
      const count = seedProducts.filter((product) => product.category === id).length;
      return { id, name, productCount: count };
    });
    if (categories.length > 0) {
      await catCol.insertMany(categories);
    }

    // Seed products
    const prodCol = db.collection("products");
    await prodCol.deleteMany({});
    if (seedProducts.length > 0) {
      await prodCol.insertMany(seedProducts.map((product) => ({ ...product })));
    }

    // Create indexes for fast lookup
    await prodCol.createIndex({ id: 1 }, { unique: true });
    await prodCol.createIndex({ slug: 1 });
    await prodCol.createIndex({ category: 1 });

    return NextResponse.json({
      success: true,
      categories: categories.length,
      products: seedProducts.length,
      message: `تم إدراج ${seedProducts.length} منتج في ${categories.length} تصنيف بنجاح`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "فشل تهيئة قاعدة البيانات", detail: String(err) },
      { status: 500 }
    );
  }
}
