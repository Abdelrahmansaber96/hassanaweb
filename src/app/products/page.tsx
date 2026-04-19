import { Suspense } from "react";
import { FadeIn } from "@/components/AnimationHelpers";
import { readProductsWithFallback } from "@/lib/products-server";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await readProductsWithFallback();

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
          <ProductsClient initialProducts={products} />
        </Suspense>
      </div>
    </div>
  );
}
