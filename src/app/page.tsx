import HomePageClient from "@/components/HomePageClient";
import { CATEGORY_ORDER, type Category } from "@/lib/products";
import { readProductsWithFallback } from "@/lib/products-server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await readProductsWithFallback();
  const counts = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Partial<Record<Category, number>>);

  const categoryCounts = CATEGORY_ORDER.map((category) => ({
    category,
    count: counts[category] ?? 0,
  }))
    .filter((item) => item.count > 0)
    .slice(0, 6);

  return (
    <HomePageClient
      productCount={products.length}
      categoryCounts={categoryCounts}
      showcaseProducts={products.slice(0, 8)}
      moreProducts={products.slice(8, 16)}
    />
  );
}

