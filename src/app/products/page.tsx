import { Suspense } from "react";
import { FadeIn } from "@/components/AnimationHelpers";
import { readProductsWithFallback } from "@/lib/products-server";
import type { Product } from "@/lib/products";
import ProductsClient from "./ProductsClient";

function shuffleProducts<T>(products: T[]) {
  const shuffledProducts = [...products];

  for (let index = shuffledProducts.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [shuffledProducts[index], shuffledProducts[randomIndex]] = [
      shuffledProducts[randomIndex],
      shuffledProducts[index],
    ];
  }

  return shuffledProducts;
}

function buildDiverseRandomizedProducts(products: Product[]) {
  const productsByCategory = new Map<string, Product[]>();

  for (const product of products) {
    const categoryProducts = productsByCategory.get(product.category) ?? [];

    categoryProducts.push(product);
    productsByCategory.set(product.category, categoryProducts);
  }

  for (const [category, categoryProducts] of productsByCategory.entries()) {
    productsByCategory.set(category, shuffleProducts(categoryProducts));
  }

  const randomizedProducts: Product[] = [];

  while (randomizedProducts.length < products.length) {
    const roundCategories = shuffleProducts(
      Array.from(productsByCategory.entries())
        .filter(([, categoryProducts]) => categoryProducts.length > 0)
        .map(([category]) => category)
    );

    for (const category of roundCategories) {
      const categoryProducts = productsByCategory.get(category);

      if (!categoryProducts || categoryProducts.length === 0) {
        continue;
      }

      const nextProduct = categoryProducts.pop();

      if (nextProduct) {
        randomizedProducts.push(nextProduct);
      }
    }
  }

  return randomizedProducts;
}

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await readProductsWithFallback();
  const randomizedProducts = buildDiverseRandomizedProducts(products);

  return (
    <div className="pb-20 min-h-screen bg-[#f7f9f8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeIn className="mb-10 pt-10">
          <p className="text-sm font-semibold text-[#1a5c3a] uppercase tracking-widest mb-2">
            كتالوجنا
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1a1a2e]">
            جميع المنتجات
          </h1>
        </FadeIn>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-[#1a5c3a] border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <ProductsClient
            initialProducts={products}
            randomizedProducts={randomizedProducts}
          />
        </Suspense>
      </div>
    </div>
  );
}
