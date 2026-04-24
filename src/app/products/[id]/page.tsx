import { notFound, redirect } from "next/navigation";
import { readProductsWithFallback } from "@/lib/products-server";
import { findProductByRouteParam, getProductPath, getProductRouteSegment } from "@/lib/products";
import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id: routeParam } = await params;
  const products = await readProductsWithFallback();

  const normalizedRouteParam = (() => {
    try {
      return decodeURIComponent(routeParam).trim();
    } catch {
      return routeParam.trim();
    }
  })();

  const product = findProductByRouteParam(products, routeParam);
  if (!product) notFound();

  if (normalizedRouteParam !== getProductRouteSegment(product)) {
    redirect(getProductPath(product));
  }

  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return <ProductDetailClient product={product} related={related} />;
}