"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { type Product, CATEGORY_LABELS, getProductWhatsAppMessage, isRemoteImageUrl } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import WhatsAppOrderButton from "@/components/WhatsAppOrderButton";

interface ProductCardProps {
  product: Product;
}

const categoryColors: Record<string, string> = {
  antibacterials: "bg-red-100 text-red-700",
  "feed-products": "bg-amber-100 text-amber-700",
  "anti-inflammatory-analgesics": "bg-purple-100 text-purple-700",
  "vitamins-minerals-amino-acids": "bg-green-100 text-green-700",
  miscellaneous: "bg-gray-100 text-gray-700",
  anthelmintics: "bg-blue-100 text-blue-700",
  anticoccidials: "bg-teal-100 text-teal-700",
  antiprotozoals: "bg-indigo-100 text-indigo-700",
};

const categoryIcons: Record<string, string> = {
  antibacterials: "💊",
  "feed-products": "🌾",
  "anti-inflammatory-analgesics": "💉",
  "vitamins-minerals-amino-acids": "🌿",
  miscellaneous: "🧪",
  anthelmintics: "🔬",
  anticoccidials: "🛡️",
  antiprotozoals: "🧫",
};

const placeholderGradients: Record<string, string> = {
  antibacterials: "from-red-50 to-rose-100",
  "feed-products": "from-amber-50 to-orange-100",
  "anti-inflammatory-analgesics": "from-purple-50 to-pink-100",
  "vitamins-minerals-amino-acids": "from-green-50 to-teal-100",
  miscellaneous: "from-gray-50 to-slate-100",
  anthelmintics: "from-blue-50 to-indigo-100",
  anticoccidials: "from-teal-50 to-cyan-100",
  antiprotozoals: "from-indigo-50 to-violet-100",
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = !imageFailed && product.images && product.images.length > 0 ? product.images[0] : null;
  const hasImage = Boolean(imageSrc);
  const isRemoteImage = isRemoteImageUrl(imageSrc);
  const productDescription =
    product.description ||
    product.indications ||
    "تفاصيل المنتج متاحة داخل صفحة المنتج وطلبه مباشر عبر واتساب.";
  const primaryIngredient = product.active_ingredients?.[0]
    ? [
        product.active_ingredients[0].name,
        product.active_ingredients[0].concentration,
      ]
        .filter(Boolean)
        .join(" ")
    : "التركيبة موضحة داخل صفحة المنتج";
  const packagingLabel =
    product.variants?.[0] ||
    product.active_ingredients?.[0]?.concentration ||
    "—";

  return (
    <motion.div
      className="group flex h-full min-h-[29rem] flex-col overflow-hidden rounded-[28px] border border-[#dbe6df] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfb_100%)] shadow-[0_10px_30px_rgba(15,37,26,0.08)] transition-all duration-300"
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ duration: 0.25 }}
    >
      {/* Image area */}
      <Link
        href={`/products/${product.id}`}
        className="relative block overflow-hidden border-b border-[#edf3ee]"
      >
        <div
          className={`relative aspect-[5/4] ${hasImage ? "bg-[linear-gradient(180deg,#ffffff_0%,#f8fbf9_100%)]" : `bg-gradient-to-br ${placeholderGradients[product.category] || "from-gray-50 to-gray-100"}`} flex items-center justify-center overflow-hidden`}
        >
          {hasImage ? (
            <Image
              src={imageSrc!}
              alt={product.name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              loading="lazy"
              unoptimized={isRemoteImage}
              referrerPolicy={isRemoteImage ? "no-referrer" : undefined}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="flex h-24 w-24 items-center justify-center rounded-[26px] border border-white/50 bg-white/70 backdrop-blur-sm shadow-[0_12px_30px_rgba(29,55,41,0.12)]">
                <span className="text-4xl">{categoryIcons[product.category] || "💊"}</span>
              </div>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-[#244236] shadow-sm">
                {CATEGORY_LABELS[product.category] || product.categoryName}
              </span>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0b2d1d]/10 via-transparent to-transparent" />

          {/* Out of stock overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-500 bg-white px-4 py-1.5 rounded-full shadow">
                نفد من المخزون
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <span className={`inline-flex max-w-[72%] items-center truncate rounded-full px-3 py-1 text-xs font-bold ${categoryColors[product.category] || "bg-gray-100 text-gray-600"}`}>
            {CATEGORY_LABELS[product.category] || product.categoryName}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
              product.inStock
                ? "bg-[#eaf6ee] text-[#1b6a41]"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {product.inStock ? "متوفر" : "غير متوفر"}
          </span>
        </div>

        <div className="mt-3 grid min-h-[4.5rem] grid-cols-2 gap-2">
          <div className="rounded-2xl bg-[#f5f8f6] px-3 py-2">
            <p className="text-[10px] font-bold text-gray-400">الشكل الدوائي</p>
            <p className="mt-1 truncate text-xs font-semibold text-[#294439]">
              {product.form || "—"}
            </p>
          </div>
          <div className="rounded-2xl bg-[#f5f8f6] px-3 py-2">
            <p className="text-[10px] font-bold text-gray-400">العبوة أو التركيز</p>
            <p className="mt-1 truncate text-xs font-semibold text-[#294439]">
              {packagingLabel}
            </p>
          </div>
        </div>

        <Link href={`/products/${product.id}`} className="mt-4 block min-h-[3rem]">
          <h3 className="text-base font-extrabold leading-6 text-[#1a1a2e] transition-colors hover:text-[#1a5c3a] line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <p className="mt-2 min-h-[4.5rem] text-sm leading-7 text-gray-500 line-clamp-3">
          {productDescription}
        </p>

        <div className="mt-3 rounded-2xl border border-[#edf2ee] bg-white/90 px-3 py-3">
          <p className="text-[10px] font-bold text-gray-400">المادة الفعالة</p>
          <p className="mt-1 truncate text-xs font-semibold text-[#253a32]">
            {primaryIngredient}
          </p>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          {product.inStock ? (
            <motion.button
              onClick={() => addItem(product)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#1a5c3a]/12 bg-[#1a5c3a]/8 px-3 py-3 text-sm font-bold text-[#1a5c3a] transition-colors hover:bg-[#1a5c3a]/14"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              aria-label="أضف إلى السلة"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              أضف للسلة
            </motion.button>
          ) : (
            <Link
              href={`/products/${product.id}`}
              className="inline-flex items-center justify-center rounded-2xl border border-[#d8e5db] bg-[#f8fbf9] px-3 py-3 text-sm font-bold text-[#365448] transition-colors hover:bg-[#f0f6f2]"
            >
              عرض التفاصيل
            </Link>
          )}

          <WhatsAppOrderButton
            message={getProductWhatsAppMessage(product)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-3 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(37,211,102,0.24)] transition-colors hover:bg-[#20ba58]"
              aria-label={`اطلب ${product.name} عبر واتساب`}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              واتساب
          </WhatsAppOrderButton>
        </div>
      </div>
    </motion.div>
  );
}
