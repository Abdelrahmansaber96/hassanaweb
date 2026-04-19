import { NextRequest, NextResponse } from "next/server";
import { readProducts, deleteProduct, updateProduct } from "@/lib/products-server";
import { products as staticProducts } from "@/lib/products";
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
    const parsedPrice = parsePriceInput(body.price);

    if (!parsedPrice.valid) {
      return NextResponse.json(
        { error: "السعر يجب أن يكون رقمًا صحيحًا أو فارغًا" },
        { status: 400 }
      );
    }

    const updated = await updateProduct(id, { price: parsedPrice.price });

    if (!updated) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ success: true, price: parsedPrice.price });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
