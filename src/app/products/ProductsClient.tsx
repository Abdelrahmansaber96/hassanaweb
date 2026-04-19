"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/AnimationHelpers";
import ProductCard from "@/components/ProductCard";
import type { Product, Category } from "@/lib/products";
import { CATEGORY_LABELS } from "@/lib/products";

const categoryOptions: { value: Category | "all"; label: string }[] = [
  { value: "all", label: "جميع الفئات" },
  { value: "antibacterials", label: "💊 مضادات الجراثيم" },
  { value: "feed-products", label: "🌾 منتجات علفية" },
  { value: "anti-inflammatory-analgesics", label: "💉 مضادات الالتهاب والمسكنات" },
  { value: "vitamins-minerals-amino-acids", label: "🌿 الفيتامينات والمعادن" },
  { value: "anthelmintics", label: "🔬 طاردات الديدان" },
  { value: "anticoccidials", label: "🛡️ مضادات الأكريات" },
  { value: "antiprotozoals", label: "🧫 مضادات الأوالي" },
  { value: "miscellaneous", label: "🧪 منتجات متنوعة" },
];

const sortOptions = [
  { value: "default", label: "افتراضي" },
  { value: "name-asc", label: "الاسم: أ ← ي" },
  { value: "name-desc", label: "الاسم: ي ← أ" },
];

interface Props {
  initialProducts: Product[];
}

const PAGE_SIZE = 24;

function isCategory(value: string | null): value is Category {
  return value !== null && value in CATEGORY_LABELS;
}

export default function ProductsClient({ initialProducts }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const category: Category | "all" = isCategory(categoryParam)
    ? categoryParam
    : "all";
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [searchFocused, setSearchFocused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const updateCategory = (nextCategory: Category | "all") => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextCategory === "all") {
      params.delete("category");
    } else {
      params.set("category", nextCategory);
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;

    router.replace(nextUrl, { scroll: false });
    setVisibleCount(PAGE_SIZE);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setVisibleCount(PAGE_SIZE);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    setVisibleCount(PAGE_SIZE);
  };

  const clearFilters = () => {
    setSearch("");
    setSort("default");
    updateCategory("all");
  };

  const filtered = useMemo(() => {
    let result = [...initialProducts];

    if (category !== "all") {
      result = result.filter((p) => p.category === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q) ||
          (p.categoryName || "").toLowerCase().includes(q) ||
          (p.form || "").toLowerCase().includes(q) ||
          (p.active_ingredients || []).some((ai) => ai.name.toLowerCase().includes(q))
      );
    }

    switch (sort) {
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return result;
  }, [initialProducts, category, search, sort]);

  const activeFilters =
    (category !== "all" ? 1 : 0) + (search.trim() ? 1 : 0);

  const visibleProducts = filtered.slice(0, visibleCount);

  return (
    <>
      {/* Filters Bar */}
      <FadeIn delay={0.1}>
        <div className="bg-white rounded-3xl p-5 card-shadow mb-8 flex flex-wrap gap-4 items-end">
          {/* Search */}
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">بحث</label>
            <div className="relative">
              <svg
                className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                  searchFocused ? "text-[#1a5c3a]" : "text-gray-400"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <motion.input
                type="text"
                placeholder="ابحث عن منتج..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                animate={{ borderColor: searchFocused ? "#1a5c3a" : "#e5e7eb" }}
                className="w-full pr-9 pl-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Category filter */}
          <div className="min-w-40">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">الفئة</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => updateCategory(e.target.value as Category | "all")}
                className="w-full appearance-none px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5c3a] bg-white cursor-pointer"
              >
                {categoryOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Sort */}
          <div className="min-w-44">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">ترتيب حسب</label>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5c3a] bg-white cursor-pointer"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Clear */}
          <AnimatePresence>
            {activeFilters > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={clearFilters}
                className="px-4 py-2.5 rounded-xl bg-red-50 text-red-500 text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                حذف ({activeFilters})
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </FadeIn>

      {/* Active filter pills */}
      <AnimatePresence>
        {activeFilters > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 mb-6"
          >
            {category !== "all" && (
              <span className="px-3 py-1 rounded-full bg-[#2d8a56]/10 text-[#2d8a56] text-xs font-medium">
                الفئة: {CATEGORY_LABELS[category]}
              </span>
            )}
            {search.trim() && (
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                بحث: &quot;{search}&quot;
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result count */}
      <p className="text-gray-500 text-sm mb-6">
        عرض {visibleProducts.length} من أصل {filtered.length} منتج
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <FadeIn className="text-center py-20">
          <span className="text-5xl mb-4 block">🔍</span>
          <h3 className="text-xl font-bold text-[#1a1a2e] mb-2">لا توجد منتجات</h3>
          <p className="text-gray-500 text-sm">جرب تعديل هذا الفلتر أو كلمة البحث.</p>
        </FadeIn>
      ) : (
        <>
          <StaggerContainer className="grid grid-cols-1 items-stretch sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visibleProducts.map((product) => (
            <StaggerItem key={product.id} className="h-full">
              <ProductCard product={product} />
            </StaggerItem>
          ))}
          </StaggerContainer>

          {filtered.length > visibleCount && (
            <FadeIn className="flex justify-center mt-8">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                className="px-6 py-3 rounded-2xl border border-[#1a5c3a]/20 text-[#1a5c3a] font-semibold hover:bg-[#1a5c3a]/5 transition-colors"
              >
                عرض المزيد
              </button>
            </FadeIn>
          )}
        </>
      )}
    </>
  );
}
