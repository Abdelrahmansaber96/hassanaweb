"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/AnimationHelpers";
import ProductCard from "@/components/ProductCard";
import WhatsAppOrderButton from "@/components/WhatsAppOrderButton";
import {
  getNumericProductPrice,
  getProductWhatsAppMessage,
  formatProductPrice,
  CATEGORY_LABELS,
  isRemoteImageUrl,
  type Product,
} from "@/lib/products";
import { useCart } from "@/context/CartContext";

const categoryIcons: Record<string, string> = {
  antibacterials: "💊",
  "feed-products": "🌾",
  "anti-inflammatory-analgesics": "💉",
  "vitamins-minerals-amino-acids": "🌿",
  anthelmintics: "🔬",
  anticoccidials: "🛡️",
  antiprotozoals: "🧫",
  miscellaneous: "🧪",
};

const placeholderGradients: Record<string, string> = {
  antibacterials: "from-blue-100 to-indigo-200",
  "feed-products": "from-amber-100 to-yellow-200",
  "anti-inflammatory-analgesics": "from-rose-100 to-pink-200",
  "vitamins-minerals-amino-acids": "from-green-100 to-teal-100",
  anthelmintics: "from-purple-100 to-violet-200",
  anticoccidials: "from-sky-100 to-cyan-200",
  antiprotozoals: "from-orange-100 to-amber-200",
  miscellaneous: "from-gray-100 to-slate-200",
};

interface Props {
  product: Product;
  related: Product[];
}

export default function ProductDetailClient({ product, related }: Props) {
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [failedImages, setFailedImages] = useState<number[]>([]);
  const { addItem } = useCart();

  const hasImages = product.images && product.images.length > 0;
  const activeImage = hasImages ? product.images[activeImg] : null;
  const canRenderActiveImage = Boolean(activeImage) && !failedImages.includes(activeImg);
  const activeImageIsRemote = isRemoteImageUrl(activeImage);
  const unitPrice = getNumericProductPrice(product.price);
  const currentSelectionTotal = unitPrice === null ? null : unitPrice * qty;

  return (
    <div className="pb-20 min-h-screen bg-[#f7f9f8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Breadcrumb */}
        <FadeIn className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-[#1a5c3a] transition-colors">الرئيسية</Link>
          <svg className="w-3 h-3 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/products" className="hover:text-[#1a5c3a] transition-colors">المنتجات</Link>
          <svg className="w-3 h-3 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-[#1a1a2e] font-medium line-clamp-1">{product.name}</span>
        </FadeIn>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Left – Image */}
          <FadeIn direction="left">
            <div className="sticky top-28">
              <motion.div
                className={`relative h-96 sm:h-[480px] rounded-3xl bg-gradient-to-br ${placeholderGradients[product.category] || "from-gray-100 to-slate-200"} overflow-hidden card-shadow flex items-center justify-center mb-4`}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                {canRenderActiveImage ? (
                  <Image
                    src={activeImage!}
                    alt={product.name}
                    fill
                    className="object-contain p-6"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized={activeImageIsRemote}
                    referrerPolicy={activeImageIsRemote ? "no-referrer" : undefined}
                    onError={() => {
                      setFailedImages((current) =>
                        current.includes(activeImg) ? current : [...current, activeImg]
                      );
                    }}
                  />
                ) : (
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="w-36 h-36 rounded-3xl bg-white/70 backdrop-blur-md shadow-xl flex items-center justify-center">
                      <span className="text-7xl">{categoryIcons[product.category] || "📦"}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-600 bg-white/80 px-4 py-1.5 rounded-full">
                      {product.manufacturer}
                    </span>
                  </div>
                )}

                {product.form && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[#1a5c3a] to-[#2d8a56] text-white shadow">
                    {product.form}
                  </span>
                )}
              </motion.div>

              {/* Thumbnail strip */}
              {hasImages && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img, i) => (
                    <motion.button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`relative w-20 h-20 rounded-2xl overflow-hidden flex-none card-shadow border-2 ${activeImg === i ? "border-[#1a5c3a]" : "border-transparent"}`}
                      whileHover={{ scale: 1.06, y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                        loading="lazy"
                        unoptimized={isRemoteImageUrl(img)}
                        referrerPolicy={isRemoteImageUrl(img) ? "no-referrer" : undefined}
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>

          {/* Right – Info */}
          <FadeIn direction="right">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-full bg-[#1a5c3a]/10 text-[#1a5c3a] text-xs font-semibold">
                  {categoryIcons[product.category] || "📦"}{" "}
                  {CATEGORY_LABELS[product.category] || product.categoryName}
                </span>
                {product.form && (
                  <span className="px-3 py-1.5 rounded-full bg-[#2d8a56]/10 text-[#2d8a56] text-xs font-semibold">
                    💊 {product.form}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1a1a2e] leading-tight">
                {product.name}
              </h1>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-[#dbe6df] bg-white px-5 py-4 shadow-sm">
                  <p className="text-[11px] font-bold tracking-wide text-gray-400">سعر الوحدة</p>
                  <p className="mt-2 text-2xl font-black text-[#1a5c3a] sm:text-3xl">
                    {formatProductPrice(product.price)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {unitPrice === null
                      ? "يتم تأكيد السعر النهائي عند التواصل أو إتمام الطلب."
                      : "السعر المعروض لكل عبوة أو وحدة من المنتج."}
                  </p>
                </div>

                <div className="rounded-3xl border border-[#dbe6df] bg-[#f4f8f5] px-5 py-4 shadow-sm">
                  <p className="text-[11px] font-bold tracking-wide text-gray-400">إجمالي الكمية الحالية</p>
                  <p className="mt-2 text-2xl font-black text-[#1a1a2e] sm:text-3xl">
                    {formatProductPrice(currentSelectionTotal)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {unitPrice === null
                      ? "سيظهر الإجمالي هنا تلقائيًا عند إضافة سعر للمنتج من الداشبورد."
                      : `محسوب على كمية ${qty} ${qty === 1 ? "قطعة" : "قطع"}.`}
                  </p>
                </div>
              </div>

              {product.description && (
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4 text-[#1a5c3a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                مصنّع من قِبَل <span className="font-semibold text-[#1a1a2e]">{product.manufacturer}</span>
              </div>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#1a1a2e] mb-2">الأحجام المتوفرة</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Ingredients */}
              {product.active_ingredients && product.active_ingredients.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#1a1a2e] mb-2">المواد الفعالة</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.active_ingredients.map((ai, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                        {ai.name}{ai.concentration ? ` (${ai.concentration})` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className={`flex items-center gap-2 text-sm font-medium ${product.inStock !== false ? "text-green-600" : "text-red-500"}`}>
                <span className={`w-2 h-2 rounded-full ${product.inStock !== false ? "bg-green-500 animate-pulse" : "bg-red-400"}`} />
                {product.inStock !== false ? "متوفر" : "غير متوفر حالياً"}
              </div>

              {product.inStock !== false && (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-700">الكمية:</span>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-1.5 border border-gray-200">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={qty <= 1}
                      className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:border-[#1a5c3a] flex items-center justify-center text-gray-600 hover:text-[#1a5c3a] transition-colors disabled:opacity-40 text-lg font-bold shadow-sm"
                    >
                      −
                    </button>
                    <span className="text-base font-bold text-[#1a1a2e] w-8 text-center">{qty}</span>
                    <button
                      onClick={() => setQty((q) => q + 1)}
                      className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:border-[#1a5c3a] flex items-center justify-center text-gray-600 hover:text-[#1a5c3a] transition-colors text-lg font-bold shadow-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {product.inStock !== false && (
                  <motion.button
                    onClick={() => {
                      addItem(product, qty);
                      setAddedToCart(true);
                      setTimeout(() => setAddedToCart(false), 2000);
                    }}
                    className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl gradient-primary text-white font-bold shadow-lg transition-colors text-sm"
                    whileHover={{ scale: 1.03, boxShadow: "0 8px 30px rgba(26,92,58,0.25)" }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {addedToCart ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        تمت الإضافة!
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        أضف إلى السلة
                      </>
                    )}
                  </motion.button>
                )}
                <WhatsAppOrderButton
                  message={getProductWhatsAppMessage(product)}
                  className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-green-500 text-white font-bold shadow-lg hover:bg-green-600 transition-colors text-sm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  اطلب عبر واتساب
                </WhatsAppOrderButton>
                <Link
                  href="/products"
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-[#1a5c3a] hover:text-[#1a5c3a] transition-colors"
                >
                  العودة ←
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-20">
          {/* Indications */}
          {product.indications && (
            <FadeIn delay={0.1}>
              <div className="bg-white rounded-3xl p-8 card-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#1a5c3a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-[#1a1a2e]">دواعي الاستعمال</h2>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{product.indications}</p>
              </div>
            </FadeIn>
          )}

          {/* Dosage */}
          {product.dosage && (
            <FadeIn delay={0.2}>
              <div className="bg-white rounded-3xl p-8 card-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-teal-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#2d8a56]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-[#1a1a2e]">الجرعة وطريقة الإعطاء</h2>
                </div>
                {typeof product.dosage === "string" ? (
                  <p className="text-gray-600 text-sm leading-relaxed">{product.dosage}</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(product.dosage).map(([animal, dose]) => (
                      <div key={animal} className="flex gap-2 text-sm">
                        <span className="font-semibold text-[#1a1a2e] min-w-24">{animal}:</span>
                        <span className="text-gray-600">{dose}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FadeIn>
          )}

          {/* Withdrawal Period */}
          {product.withdrawal_period && (
            <FadeIn delay={0.3}>
              <div className="bg-white rounded-3xl p-8 card-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center">
                    <span className="text-lg">⏱️</span>
                  </div>
                  <h2 className="text-lg font-bold text-[#1a1a2e]">فترة السحب</h2>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{product.withdrawal_period}</p>
              </div>
            </FadeIn>
          )}

          {/* Storage */}
          {product.storage && (
            <FadeIn delay={0.4}>
              <div className="bg-white rounded-3xl p-8 card-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 flex items-center justify-center">
                    <span className="text-lg">🌡️</span>
                  </div>
                  <h2 className="text-lg font-bold text-[#1a1a2e]">التخزين</h2>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{product.storage}</p>
              </div>
            </FadeIn>
          )}
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section>
            <FadeIn className="mb-8">
              <h2 className="text-2xl font-extrabold text-[#1a1a2e]">منتجات ذات صلة</h2>
            </FadeIn>
            <StaggerContainer className="grid grid-cols-1 items-stretch sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <StaggerItem key={p.id} className="h-full">
                  <ProductCard product={p} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        )}
      </div>
    </div>
  );
}
