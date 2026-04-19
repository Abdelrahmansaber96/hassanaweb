import { NextRequest, NextResponse } from "next/server";
import { readProducts, addProduct } from "@/lib/products-server";
import { products as staticProducts, type Product } from "@/lib/products";
import { requireDashboardAccess } from "@/lib/dashboard-auth";

function parsePriceInput(value: unknown) {
  if (value === "" || value === null || value === undefined) {
    return { valid: true, price: null as number | null };
  }

  const normalizedValue =
    typeof value === "number" ? value : Number(String(value).trim());

  if (!Number.isFinite(normalizedValue) || normalizedValue < 0) {
    return { valid: false, price: null as number | null };
  }

  return { valid: true, price: normalizedValue };
}

export async function GET() {
  try {
    const products = await readProducts().catch(() => []);
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
    const parsedPrice = parsePriceInput(body.price);

    if (!body.name || !body.category) {
      return NextResponse.json(
        { error: "الحقول المطلوبة: الاسم، الفئة" },
        { status: 400 }
      );
    }

    if (!parsedPrice.valid) {
      return NextResponse.json(
        { error: "السعر يجب أن يكون رقمًا صحيحًا أو فارغًا" },
        { status: 400 }
      );
    }

    const newProduct: Product = {
      id: body.id || Date.now().toString(),
      name: String(body.name),
      slug: body.slug || String(body.name).toLowerCase().replace(/\s+/g, "-"),
      category: body.category,
      categoryName: body.categoryName || body.category,
      price: parsedPrice.price,
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
