import { NextRequest, NextResponse } from "next/server";
import { readProducts, deleteProduct, updateProduct } from "@/lib/products-server";
import {
  products as staticProducts,
  CATEGORY_LABELS,
  type Category,
  type Product,
} from "@/lib/products";
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

function parseOptionalText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue === "" ? null : normalizedValue;
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/[\n,،]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isValidCategory(value: unknown): value is Category {
  return typeof value === "string" && value in CATEGORY_LABELS;
}

function buildProductSlug(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "-");
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  let products;
  try {
    products = await readProducts().catch(() => []);
    if (!products || products.length === 0) products = staticProducts;
  } catch {
    products = staticProducts;
  }
  const product = products.find((p) => p.id === id);

  if (!product) {
    return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authResponse = await requireDashboardAccess(request);
  if (authResponse) {
    return authResponse;
  }

  const { id } = await context.params;
  const deleted = await deleteProduct(id);

  if (!deleted) {
    return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authResponse = await requireDashboardAccess(request);
  if (authResponse) {
    return authResponse;
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const updates: Partial<Product> = {};

    if ("price" in body) {
      const parsedPrice = parsePriceInput(body.price);

      if (!parsedPrice.valid) {
        return NextResponse.json(
          { error: "السعر يجب أن يكون رقمًا صحيحًا أو فارغًا" },
          { status: 400 }
        );
      }

      updates.price = parsedPrice.price;
    }

    if ("name" in body) {
      const name = String(body.name ?? "").trim();

      if (!name) {
        return NextResponse.json(
          { error: "اسم المنتج مطلوب" },
          { status: 400 }
        );
      }

      updates.name = name;
      updates.slug = buildProductSlug(name);
    }

    if ("category" in body) {
      const category: unknown = body.category;

      if (!isValidCategory(category)) {
        return NextResponse.json(
          { error: "الفئة المختارة غير صالحة" },
          { status: 400 }
        );
      }

      updates.category = category;
      updates.categoryName = CATEGORY_LABELS[category];
    }

    if ("manufacturer" in body) {
      updates.manufacturer = String(body.manufacturer ?? "").trim();
    }

    if ("description" in body) {
      updates.description = parseOptionalText(body.description);
    }

    if ("form" in body) {
      updates.form = parseOptionalText(body.form);
    }

    if ("variants" in body) {
      updates.variants = parseStringArray(body.variants);
    }

    if ("images" in body) {
      updates.images = parseStringArray(body.images);
    }

    if ("inStock" in body) {
      updates.inStock = body.inStock !== false;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "لا توجد بيانات لتحديثها" },
        { status: 400 }
      );
    }

    const updated = await updateProduct(id, updates);

    if (!updated) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ success: true, updates });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
