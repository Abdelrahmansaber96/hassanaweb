"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { getCartWhatsAppMessage } from "@/lib/products";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/AnimationHelpers";
import WhatsAppOrderButton from "@/components/WhatsAppOrderButton";

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

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, totalCount } = useCart();

  return (
    <div className="pb-20 min-h-screen bg-[#f7f9f8]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <FadeIn className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-[#1a5c3a] transition-colors">الرئيسية</Link>
          <svg className="w-3 h-3 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-[#1a1a2e] font-medium">سلة الطلبات</span>
        </FadeIn>

        {/* Page header */}
        <FadeIn className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1a1a2e]">سلة الطلبات</h1>
              {totalCount > 0 && (
                <p className="text-gray-500 mt-1">{totalCount} منتج في سلتك</p>
              )}
            </div>
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-sm text-red-400 hover:text-red-600 transition-colors font-medium flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                مسح السلة
              </button>
            )}
          </div>
        </FadeIn>

        {items.length === 0 ? (
          /* Empty state */
          <FadeIn>
            <div className="bg-white rounded-3xl card-shadow p-16 flex flex-col items-center justify-center text-center gap-5">
              <span className="text-7xl">🛒</span>
              <h2 className="text-xl font-bold text-[#1a1a2e]">سلتك فارغة</h2>
              <p className="text-gray-500 max-w-sm">
                لم تضف أي منتجات بعد. تصفح مجموعتنا واختر ما يناسبك.
              </p>
              <Link
                href="/products"
                className="mt-2 px-8 py-3.5 rounded-2xl gradient-primary text-white font-bold shadow-md hover:shadow-lg transition-all hover:scale-105"
              >
                تصفح المنتجات
              </Link>
            </div>
          </FadeIn>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items column */}
            <div className="lg:col-span-2 space-y-4">
              <StaggerContainer>
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <StaggerItem key={item.product.id}>
                      <motion.div
                        layout
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.22 }}
                        className="bg-white rounded-3xl card-shadow p-5 flex gap-4"
                      >
                        {/* Product visual */}
                        <Link
                          href={`/products/${item.product.id}`}
                          className={`flex-none w-20 h-20 rounded-2xl bg-gradient-to-br ${placeholderGradients[item.product.category]} flex items-center justify-center text-3xl hover:scale-105 transition-transform`}
                        >
                          {categoryIcons[item.product.category]}
                        </Link>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/products/${item.product.id}`}
                              className="font-bold text-[#1a1a2e] leading-tight hover:text-[#1a5c3a] transition-colors line-clamp-2"
                            >
                              {item.product.name}
                            </Link>
                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="flex-none w-8 h-8 rounded-xl hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors"
                              aria-label="حذف"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          <p className="text-xs text-gray-400 mt-0.5">{item.product.manufacturer}</p>

                          <div className="flex items-center justify-between mt-3">
                            {/* Qty controls */}
                            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1 border border-gray-100">
                              <button
                                onClick={() => updateQty(item.product.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:border-[#1a5c3a] flex items-center justify-center text-gray-600 hover:text-[#1a5c3a] transition-colors disabled:opacity-40 text-base font-bold"
                              >
                                −
                              </button>
                              <span className="text-sm font-bold text-[#1a1a2e] w-6 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQty(item.product.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:border-[#1a5c3a] flex items-center justify-center text-gray-600 hover:text-[#1a5c3a] transition-colors text-base font-bold"
                              >
                                +
                              </button>
                            </div>

                            {/* Line info */}
                            <div className="text-left">
                              <p className="font-semibold text-sm text-[#1a5c3a]">
                                الكمية: {item.quantity}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </AnimatePresence>
              </StaggerContainer>

              {/* Continue shopping */}
              <Link
                href="/products"
                className="flex items-center gap-2 text-sm text-[#1a5c3a] font-medium hover:underline mt-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                إضافة المزيد من المنتجات
              </Link>
            </div>

            {/* Order summary column */}
            <div className="lg:col-span-1">
              <FadeIn direction="left" delay={0.1}>
                <div className="bg-white rounded-3xl card-shadow p-6 sticky top-28">
                  <h2 className="text-lg font-bold text-[#1a1a2e] mb-5">ملخص الطلب</h2>

                  {/* Item breakdown */}
                  <div className="space-y-3 mb-5">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <span className="text-gray-600 line-clamp-1 flex-1 ml-2">
                          {item.product.name}
                        </span>
                        <span className="font-semibold text-[#1a1a2e] flex-none">
                          ×{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-dashed border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>عدد المنتجات</span>
                      <span>{totalCount} قطعة</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>التسعير</span>
                      <span className="text-green-600 font-medium">يُحدد عبر واتساب</span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <WhatsAppOrderButton
                    message={getCartWhatsAppMessage(items)}
                    className="flex items-center justify-center gap-2.5 w-full py-4 mt-6 rounded-2xl bg-green-500 text-white font-bold shadow-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    تأكيد الطلب عبر واتساب
                  </WhatsAppOrderButton>

                  {/* Trust note */}
                  <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                    <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    دفع آمن وموثوق عبر واتساب
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
