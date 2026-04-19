"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product, Category } from "@/lib/products";
import { CATEGORY_LABELS as LABELS } from "@/lib/products";

const CATEGORY_ICONS: Record<string, string> = {
  antibacterials: "💊",
  "feed-products": "🌾",
  "anti-inflammatory-analgesics": "💉",
  "vitamins-minerals-amino-acids": "🌿",
  anthelmintics: "🔬",
  anticoccidials: "🛡️",
  antiprotozoals: "🧫",
  miscellaneous: "🧪",
};

const emptyForm = {
  name: "",
  category: "antibacterials" as Category,
  description: "",
  manufacturer: "",
  inStock: true,
};

type FormState = typeof emptyForm;

export default function DashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<Category | "all">("all");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/dashboard/login");
    router.refresh();
  };

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      const data: Product[] = await res.json();
      setProducts(data);
    } catch {
      showToast("خطأ في تحميل المنتجات", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        ...form,
      };
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "خطأ");
      }
      await fetchProducts();
      setForm(emptyForm);
      setShowForm(false);
      showToast("✅ تمت إضافة المنتج بنجاح", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "حدث خطأ أثناء الإضافة", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await fetchProducts();
      setDeleteId(null);
      showToast("🗑️ تم حذف المنتج بنجاح", "success");
    } catch {
      showToast("حدث خطأ أثناء الحذف", "error");
    } finally {
      setDeleting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      search === "" ||
      p.name.includes(search) ||
      p.manufacturer.includes(search);
    const matchCat = filterCat === "all" || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const stats = {
    total: products.length,
    inStock: products.filter((p) => p.inStock !== false).length,
    outOfStock: products.filter((p) => p.inStock === false).length,
    categories: new Set(products.map((p) => p.category)).size,
  };

  const field = (
    label: string,
    key: keyof FormState,
    type: string = "text",
    required = false
  ) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={form[key] as string | number}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5c3a] transition-colors"
      />
    </div>
  );

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#f0f4ff]">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -60, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -60, x: "-50%" }}
            className={`fixed top-28 left-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl text-white text-sm font-bold whitespace-nowrap ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => !deleting && setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🗑️</span>
              </div>
              <h3 className="text-xl font-extrabold text-[#1a1a2e] mb-2">تأكيد الحذف</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                هل أنت متأكد من حذف هذا المنتج؟
                <br />
                <span className="text-red-500 font-semibold">لا يمكن التراجع عن هذا الإجراء.</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                  {deleting ? "جارٍ الحذف..." : "نعم، احذف"}
                </button>
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:border-gray-300 transition-colors disabled:opacity-60"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto pt-24"
            onClick={() => !submitting && setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mb-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Form Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-extrabold text-[#1a1a2e]">إضافة منتج جديد</h2>
                  <p className="text-xs text-gray-400 mt-0.5">أدخل بيانات المنتج بالكامل</p>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Name */}
                {field("اسم المنتج", "name", "text", true)}

                {/* Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      الفئة <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={form.category}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, category: e.target.value as Category }))
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5c3a] bg-white"
                    >
                      {Object.entries(LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{CATEGORY_ICONS[key] || "📦"} {label}</option>
                      ))}
                    </select>
                  </div>
                  {field("الشركة المصنّعة", "manufacturer", "text", true)}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">الوصف</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5c3a] transition-colors resize-none"
                  />
                </div>

                {/* Checkbox */}
                <div className="flex flex-wrap gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                        form.inStock ? "bg-[#1a5c3a] border-[#1a5c3a]" : "border-gray-300"
                      }`}
                      onClick={() => setForm((f) => ({ ...f, inStock: !f.inStock }))}
                    >
                      {form.inStock && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700 font-medium">✅ متوفر في المخزون</span>
                  </label>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#1a5c3a] to-[#2d8a56] text-white font-bold text-sm shadow-lg hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {submitting ? "جارٍ الحفظ..." : "حفظ المنتج"}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setForm(emptyForm); }}
                    className="px-6 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:border-gray-300 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <p className="text-xs font-semibold text-[#1a5c3a] uppercase tracking-widest mb-1">
              الإدارة
            </p>
            <h1 className="text-3xl font-extrabold text-[#1a1a2e]">لوحة التحكم</h1>
            <p className="text-gray-500 text-sm mt-1">إدارة منتجات صيدلية حصانة البيطرية</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/products"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[#1a5c3a]/30 text-[#1a5c3a] text-sm font-semibold hover:border-[#1a5c3a] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              عرض المتجر
            </Link>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setForm(emptyForm); setShowForm(true); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1a5c3a] to-[#2d8a56] text-white text-sm font-bold shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              إضافة منتج
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 hover:border-red-400 transition-colors"
              title="تسجيل الخروج"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              خروج
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "إجمالي المنتجات", value: stats.total, icon: "📦", color: "from-blue-500 to-indigo-600" },
            { label: "متوفر في المخزون", value: stats.inStock, icon: "✅", color: "from-green-500 to-emerald-600" },
            { label: "نفد من المخزون", value: stats.outOfStock, icon: "⚠️", color: "from-orange-400 to-red-500" },
            { label: "منتجات مميزة", value: stats.categories, icon: "📂", color: "from-purple-500 to-pink-500" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl mb-3`}>
                {s.icon}
              </div>
              <p className="text-2xl font-extrabold text-[#1a1a2e]">{loading ? "—" : s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Products Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Table Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 border-b border-gray-100">
            <h2 className="font-extrabold text-[#1a1a2e] text-lg">
              قائمة المنتجات
              <span className="mr-2 text-sm font-normal text-gray-400">
                ({filteredProducts.length} منتج)
              </span>
            </h2>
            <div className="flex gap-3 flex-wrap">
              {/* Search */}
              <div className="relative">
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="بحث..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-9 pl-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5c3a] w-40"
                />
              </div>
              {/* Category Filter */}
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value as Category | "all")}
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5c3a] bg-white"
              >
                <option value="all">جميع الفئات</option>
                {Object.entries(LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{CATEGORY_ICONS[key] || "📦"} {label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-[#1a5c3a] border-t-transparent rounded-full"
              />
              <span className="text-sm">جارٍ تحميل المنتجات...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center">
              <span className="text-4xl block mb-3">🔍</span>
              <p className="text-gray-500 text-sm font-medium">لا توجد منتجات مطابقة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs font-semibold">
                    <th className="text-right px-5 py-3.5">#</th>
                    <th className="text-right px-5 py-3.5">المنتج</th>
                    <th className="text-right px-5 py-3.5">الفئة</th>
                    <th className="text-right px-5 py-3.5">المخزون</th>
                    <th className="text-right px-5 py-3.5">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <AnimatePresence>
                    {filteredProducts.map((product, index) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-blue-50/40 transition-colors group"
                      >
                        {/* Index */}
                        <td className="px-5 py-4 text-gray-400 font-mono text-xs">
                          {index + 1}
                        </td>

                        {/* Name + Badge */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-lg flex-none">
                              {CATEGORY_ICONS[product.category]}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-[#1a1a2e] leading-tight truncate max-w-[200px]">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">{product.manufacturer}</p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium whitespace-nowrap">
                            {LABELS[product.category] || product.category}
                          </span>
                        </td>

                        {/* Stock */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              product.inStock !== false
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                product.inStock !== false ? "bg-green-500" : "bg-red-500"
                              }`}
                            />
                            {product.inStock !== false ? "متوفر" : "نفد"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/products/${product.id}`}
                              target="_blank"
                              className="p-2 rounded-xl bg-blue-50 text-[#1a5c3a] hover:bg-blue-100 transition-colors"
                              title="عرض المنتج"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Link>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setDeleteId(product.id)}
                              className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                              title="حذف المنتج"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          {!loading && products.length > 0 && (
            <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                إجمالي {products.length} منتج — {stats.inStock} متوفر، {stats.outOfStock} نفد
              </p>
              <div className="flex items-center gap-3">
                {[
                  { label: "تطعيمات", cat: "vaccines" as Category },
                  { label: "أدوية", cat: "medicine" as Category },
                  { label: "فيتامينات", cat: "vitamins" as Category },
                  { label: "مكملات", cat: "supplements" as Category },
                ].map((item) => (
                  <span key={item.cat} className="text-xs text-gray-400">
                    {CATEGORY_ICONS[item.cat]} {products.filter((p) => p.category === item.cat).length}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
