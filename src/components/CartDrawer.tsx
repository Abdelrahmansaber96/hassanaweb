"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import {
  CATEGORY_ICONS,
  formatProductPrice,
  getCartLinePrice,
  getCartPricingSummary,
  getCartWhatsAppMessage,
} from "@/lib/products";
import { useEffect } from "react";
import WhatsAppOrderButton from "@/components/WhatsAppOrderButton";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, clearCart, totalCount } =
    useCart();
  const pricingSummary = getCartPricingSummary(items);
  const hasPricedItems = pricingSummary.pricedItems > 0;
  const hasUnpricedItems = pricingSummary.unpricedItems > 0;

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer panel – slides from the left edge (RTL end) */}
          <motion.aside
            key="drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed top-0 left-0 bottom-0 z-[70] w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-l from-[#1a5c3a]/5 to-[#2d8a56]/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1a5c3a]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#1a5c3a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-[#1a1a2e] text-lg">سلة الطلبات</h2>
                  <p className="text-xs text-gray-500">{totalCount} منتج</p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-500 hover:text-gray-800"
                aria-label="إغلاق السلة"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              <AnimatePresence initial={false}>
                {items.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center h-64 text-center gap-4"
                  >
                    <span className="text-6xl">🛒</span>
                    <p className="text-gray-500 font-medium">سلتك فارغة</p>
                    <p className="text-gray-400 text-sm">أضف منتجات للمتابعة</p>
                    <Link
                      href="/products"
                      onClick={closeCart}
                      className="mt-2 px-5 py-2.5 rounded-2xl gradient-primary text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                      تصفح المنتجات
                    </Link>
                  </motion.div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      transition={{ duration: 0.22 }}
                      className="flex gap-3 bg-gray-50 rounded-2xl p-3"
                    >
                      {/* Product icon */}
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1a5c3a]/10 to-[#2d8a56]/10 flex items-center justify-center flex-none text-2xl">
                        {CATEGORY_ICONS[item.product.category]}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.product.id}`}
                          onClick={closeCart}
                          className="font-semibold text-sm text-[#1a1a2e] leading-tight line-clamp-2 hover:text-[#1a5c3a] transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-[#1a5c3a] font-bold text-xs mt-1">
                          الكمية: {item.quantity}
                        </p>
                        <div className="mt-2 space-y-1 text-xs">
                          <p className="font-semibold text-[#1a1a2e]">
                            سعر الوحدة: <span className="text-[#1a5c3a]">{formatProductPrice(item.product.price)}</span>
                          </p>
                          <p className="text-gray-500">
                            إجمالي الصنف: <span className="font-bold text-[#1a1a2e]">{formatProductPrice(getCartLinePrice(item))}</span>
                          </p>
                        </div>

                        {/* Qty controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQty(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-7 h-7 rounded-lg border border-gray-200 hover:border-[#1a5c3a] flex items-center justify-center text-gray-600 hover:text-[#1a5c3a] transition-colors disabled:opacity-40 text-base font-bold"
                          >
                            −
                          </button>
                          <span className="text-sm font-bold text-[#1a1a2e] w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg border border-gray-200 hover:border-[#1a5c3a] flex items-center justify-center text-gray-600 hover:text-[#1a5c3a] transition-colors text-base font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="w-8 h-8 rounded-xl hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors flex-none self-start"
                        aria-label="حذف من السلة"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer – summary + checkout */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-gray-100 space-y-4 bg-white">
                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between font-extrabold text-lg text-[#1a1a2e]">
                    <span>إجمالي المنتجات</span>
                    <span className="gradient-primary-text">{totalCount} قطعة</span>
                  </div>
                  {hasPricedItems && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{hasUnpricedItems ? "إجمالي المنتجات المسعّرة" : "الإجمالي التقديري"}</span>
                      <span className="font-bold text-[#1a5c3a]">
                        {formatProductPrice(pricingSummary.subtotal)}
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-gray-400">
                    {hasUnpricedItems
                      ? "بعض المنتجات ما زالت بسعر عند الطلب."
                      : hasPricedItems
                        ? "الإجمالي محسوب حسب الكميات الحالية داخل السلة."
                        : "سيتم تحديد الأسعار عند تأكيد الطلب عبر واتساب."}
                  </p>
                </div>

                {/* CTA buttons */}
                <div className="flex flex-col gap-2.5">
                  <WhatsAppOrderButton
                    message={getCartWhatsAppMessage(items)}
                    onTargetOpen={closeCart}
                    className="flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl bg-green-500 text-white font-bold shadow-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    تأكيد الطلب عبر واتساب
                  </WhatsAppOrderButton>

                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-[#1a5c3a] hover:text-[#1a5c3a] transition-colors"
                  >
                    عرض السلة كاملة
                  </Link>
                </div>

                {/* Clear cart */}
                <button
                  onClick={clearCart}
                  className="w-full text-xs text-gray-400 hover:text-red-500 transition-colors py-1"
                >
                  مسح جميع المنتجات
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
