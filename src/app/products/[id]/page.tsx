import { notFound } from "next/navigation";
import { readProductsWithFallback } from "@/lib/products-server";
import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const products = await readProductsWithFallback();

  const product = products.find((p) => p.id === id);
  if (!product) notFound();

  const related = products
    .filter((p) => p.id !== id && p.category === product.category)
    .slice(0, 4);

  return <ProductDetailClient product={product} related={related} />;
}