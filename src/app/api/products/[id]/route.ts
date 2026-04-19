import { NextRequest, NextResponse } from "next/server";
import { readProducts, deleteProduct } from "@/lib/products-server";
import { products as staticProducts } from "@/lib/products";
import { requireDashboardAccess } from "@/lib/dashboard-auth";

const READ_TIMEOUT_MS = 800;

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  let products;
  try {
    products = await Promise.race([
      readProducts().catch(() => []),
      new Promise<typeof staticProducts>((resolve) => {
        setTimeout(() => resolve([]), READ_TIMEOUT_MS);
      }),
    ]);
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
