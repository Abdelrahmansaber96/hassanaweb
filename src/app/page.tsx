import HomePageClient from "@/components/HomePageClient";
import { CATEGORY_LABELS, type Category } from "@/lib/products";
import { readProductsWithFallback } from "@/lib/products-server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await readProductsWithFallback();
  const categoryCounts = Object.entries(
    products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Partial<Record<Category, number>>)
  )
    .filter(([category]) => category in CATEGORY_LABELS)
    .sort((a, b) => b[1]! - a[1]!)
    .slice(0, 6)
    .map(([category, count]) => ({
      category: category as Category,
      count: count ?? 0,
    }));

  return (
    <HomePageClient
      productCount={products.length}
      categoryCounts={categoryCounts}
      showcaseProducts={products.slice(0, 8)}
      moreProducts={products.slice(8, 16)}
    />
  );
}

