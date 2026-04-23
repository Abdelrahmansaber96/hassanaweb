"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  CATEGORY_BADGE_CLASSES,
  CATEGORY_CARD_PLACEHOLDER_GRADIENTS,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  formatProductPrice,
  getDiscountedProductPrice,
  getNumericProductPrice,
  getProductDiscountPercentage,
  isRemoteImageUrl,
  type Product,
} from "@/lib/products";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

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
  const basePrice = getNumericProductPrice(product.price);
  const discountedPrice = getDiscountedProductPrice(product);
  const discountPercentage = getProductDiscountPercentage(product);
  const hasDiscount =
    basePrice !== null &&
    discountedPrice !== null &&
    discountPercentage !== null &&
    discountedPrice < basePrice;

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
          className={`relative aspect-[5/4] ${hasImage ? "bg-[linear-gradient(180deg,#ffffff_0%,#f8fbf9_100%)]" : `bg-gradient-to-br ${CATEGORY_CARD_PLACEHOLDER_GRADIENTS[product.category] || "from-gray-50 to-gray-100"}`} flex items-center justify-center overflow-hidden`}
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
                <span className="text-4xl">{CATEGORY_ICONS[product.category] || "💊"}</span>
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
          <span className={`inline-flex max-w-[72%] items-center truncate rounded-full px-3 py-1 text-xs font-bold ${CATEGORY_BADGE_CLASSES[product.category] || "bg-gray-100 text-gray-600"}`}>
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

        {hasDiscount && (
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold text-red-600">
              🏷️ خصم {discountPercentage}%
            </span>
          </div>
        )}

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

          <div className="flex items-center justify-center rounded-2xl border border-[#e0ebe3] bg-[#f8fbf9] px-3 py-3 text-center">
            <div>
              <p className="text-[10px] font-bold text-gray-400">
                {hasDiscount ? "السعر بعد الخصم" : "السعر"}
              </p>
              <p className={`mt-1 text-sm font-extrabold ${hasDiscount ? "text-[#d0671c]" : "text-[#1a5c3a]"}`}>
                {formatProductPrice(hasDiscount ? discountedPrice : product.price)}
              </p>
              {hasDiscount && (
                <p className="mt-1 text-[11px] font-bold text-gray-400 line-through">
                  {formatProductPrice(basePrice)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
