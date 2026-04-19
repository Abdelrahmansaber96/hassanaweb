import { NextRequest, NextResponse } from "next/server";
import { readProducts, addProduct } from "@/lib/products-server";
import { products as staticProducts, type Product } from "@/lib/products";
import { requireDashboardAccess } from "@/lib/dashboard-auth";

const READ_TIMEOUT_MS = 800;

export async function GET() {
  try {
    const products = await Promise.race<Product[]>([
      readProducts().catch(() => []),
      new Promise<Product[]>((resolve) => {
        setTimeout(() => resolve([]), READ_TIMEOUT_MS);
      }),
    ]);
    if (products && products.length > 0) {
      return NextResponse.json(products);
    }
    return NextResponse.json(staticProducts);
  } catch {
    return NextResponse.json(staticProducts);
  }
}

export async function POST(request: NextRequest) {
  const authResponse = await requireDashboardAccess(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const body = await request.json();

    if (!body.name || !body.category) {
      return NextResponse.json(
        { error: "الحقول المطلوبة: الاسم، الفئة" },
        { status: 400 }
      );
    }

    const newProduct: Product = {
      id: body.id || Date.now().toString(),
      name: String(body.name),
      slug: body.slug || String(body.name).toLowerCase().replace(/\s+/g, "-"),
      category: body.category,
      categoryName: body.categoryName || body.category,
      form: body.form || null,
      variants: body.variants || [],
      manufacturer: String(body.manufacturer || ""),
      active_ingredients: body.active_ingredients || [],
      description: body.description || null,
      indications: body.indications || null,
      dosage: body.dosage || null,
      withdrawal_period: body.withdrawal_period || null,
      storage: body.storage || null,
      images: body.images || [],
      inStock: body.inStock !== false,
    };

    await addProduct(newProduct);

    return NextResponse.json(newProduct, { status: 201 });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
