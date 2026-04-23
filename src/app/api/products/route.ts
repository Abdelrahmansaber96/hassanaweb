import { NextRequest, NextResponse } from "next/server";
import { readProducts, addProduct } from "@/lib/products-server";
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

function parseDiscountPercentageInput(value: unknown) {
  if (value === "" || value === null || value === undefined) {
    return { valid: true, discountPercentage: null as number | null };
  }

  const normalizedValue =
    typeof value === "number" ? value : Number(String(value).trim());

  if (!Number.isFinite(normalizedValue) || normalizedValue <= 0 || normalizedValue > 50) {
    return { valid: false, discountPercentage: null as number | null };
  }

  return { valid: true, discountPercentage: normalizedValue };
}

function parseOfferInput(value: unknown) {
  if (value === null || value === undefined) {
    return { valid: true, offer: null as Product["offer"] };
  }

  if (typeof value !== "object") {
    return { valid: false, offer: null as Product["offer"] };
  }

  const offerValue = value as {
    enabled?: unknown;
    discountPercentage?: unknown;
  };

  if (offerValue.enabled !== true) {
    return { valid: true, offer: null as Product["offer"] };
  }

  const parsedDiscountPercentage = parseDiscountPercentageInput(
    offerValue.discountPercentage
  );

  if (!parsedDiscountPercentage.valid || parsedDiscountPercentage.discountPercentage === null) {
    return { valid: false, offer: null as Product["offer"] };
  }

  return {
    valid: true,
    offer: {
      enabled: true,
      discountPercentage: parsedDiscountPercentage.discountPercentage,
    } satisfies NonNullable<Product["offer"]>,
  };
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
    const parsedOffer = parseOfferInput(body.offer);
    const name = String(body.name ?? "").trim();
    const category: unknown = body.category;

    if (!name || !category) {
      return NextResponse.json(
        { error: "الحقول المطلوبة: الاسم، الفئة" },
        { status: 400 }
      );
    }

    if (!isValidCategory(category)) {
      return NextResponse.json(
        { error: "الفئة المختارة غير صالحة" },
        { status: 400 }
      );
    }

    if (!parsedPrice.valid) {
      return NextResponse.json(
        { error: "السعر يجب أن يكون رقمًا صحيحًا أو فارغًا" },
        { status: 400 }
      );
    }

    if (!parsedOffer.valid) {
      return NextResponse.json(
        { error: "نسبة الخصم يجب أن تكون بين 1 و50" },
        { status: 400 }
      );
    }

    const newProduct: Product = {
      id: body.id || Date.now().toString(),
      name,
      slug: body.slug || buildProductSlug(name),
      category,
      categoryName: CATEGORY_LABELS[category],
      price: parsedPrice.price,
      offer: parsedOffer.offer,
      form: parseOptionalText(body.form),
      variants: parseStringArray(body.variants),
      manufacturer: String(body.manufacturer ?? "").trim(),
      active_ingredients: Array.isArray(body.active_ingredients)
        ? body.active_ingredients
        : [],
      description: parseOptionalText(body.description),
      indications: parseOptionalText(body.indications),
      dosage: body.dosage || null,
      withdrawal_period: parseOptionalText(body.withdrawal_period),
      storage: parseOptionalText(body.storage),
      images: parseStringArray(body.images),
      inStock: body.inStock !== false,
    };

    await addProduct(newProduct);

    return NextResponse.json(newProduct, { status: 201 });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
