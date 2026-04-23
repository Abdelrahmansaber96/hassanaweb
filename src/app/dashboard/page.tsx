"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product, Category } from "@/lib/products";
import {
  CATEGORY_ICONS,
  CATEGORY_OPTIONS,
  CATEGORY_LABELS as LABELS,
  formatProductPrice,
  getDiscountedProductPrice,
  getNumericProductPrice,
  getProductDiscountPercentage,
  isProductInCategory,
  isProductInOffers,
  isRemoteImageUrl,
} from "@/lib/products";

const emptyForm = {
  name: "",
  category: CATEGORY_OPTIONS[0].value as Category,
  manufacturer: "",
  description: "",
  form: "",
  variants: "",
  imageUrl: "",
  price: "",
  offerEnabled: false,
  discountPercentage: "",
  inStock: true,
};

type FormState = typeof emptyForm;

function getFormStateFromProduct(product: Product): FormState {
  return {
    name: product.name,
    category: product.category,
    manufacturer: product.manufacturer,
    description: product.description ?? "",
    form: product.form ?? "",
    variants: product.variants.join(", "),
    imageUrl: product.images[0] ?? "",
    price: typeof product.price === "number" ? String(product.price) : "",
    offerEnabled: product.offer?.enabled === true,
    discountPercentage:
      product.offer?.enabled === true ? String(product.offer.discountPercentage) : "",
    inStock: product.inStock !== false,
  };
}

function parseVariantsInput(value: string): string[] {
  return value
    .split(/[\n,،]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildProductPayload(form: FormState) {
  const name = form.name.trim();
  const manufacturer = form.manufacturer.trim();
  const description = form.description.trim();
  const productForm = form.form.trim();
  const imageUrl = form.imageUrl.trim();

  return {
    name,
    category: form.category,
    categoryName: LABELS[form.category],
    manufacturer,
    description: description === "" ? null : description,
    form: productForm === "" ? null : productForm,
    variants: parseVariantsInput(form.variants),
    images: imageUrl === "" ? [] : [imageUrl],
    price: form.price === "" ? null : Number(form.price),
    offer: form.offerEnabled
      ? {
          enabled: true,
          discountPercentage: Number(form.discountPercentage.trim()),
        }
      : null,
    inStock: form.inStock,
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageInputKey, setImageInputKey] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<Category | "all">("all");
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [savingPriceId, setSavingPriceId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const isEditing = editingProductId !== null;

  const closeFormModal = useCallback(() => {
    setShowForm(false);
    setEditingProductId(null);
    setForm(emptyForm);
    setUploadingImage(false);
    setImageInputKey((current) => current + 1);
  }, []);

  const openCreateForm = () => {
    setEditingProductId(null);
    setForm(emptyForm);
    setImageInputKey((current) => current + 1);
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProductId(product.id);
    setForm(getFormStateFromProduct(product));
    setImageInputKey((current) => current + 1);
    setShowForm(true);
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
      setPriceDrafts(
        Object.fromEntries(
          data.map((product) => [
            product.id,
            typeof product.price === "number" ? String(product.price) : "",
          ])
        )
      );
    } catch {
      showToast("خطأ في تحميل المنتجات", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.set("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "فشل رفع الصورة");
      }

      const data = (await res.json()) as { url: string };
      setForm((current) => ({ ...current, imageUrl: data.url }));
      showToast("تم رفع صورة المنتج بنجاح", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "فشل رفع الصورة",
        "error"
      );
    } finally {
      setUploadingImage(false);
      setImageInputKey((current) => current + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (form.offerEnabled) {
      const parsedPrice = Number(form.price.trim());
      const parsedDiscountPercentage = Number(form.discountPercentage.trim());

      if (form.price.trim() === "" || !Number.isFinite(parsedPrice) || parsedPrice < 0) {
        showToast("حدد سعر المنتج أولًا قبل تفعيل الخصم", "error");
        setSubmitting(false);
        return;
      }

      if (
        form.discountPercentage.trim() === "" ||
        !Number.isFinite(parsedDiscountPercentage) ||
        parsedDiscountPercentage <= 0 ||
        parsedDiscountPercentage > 50
      ) {
        showToast("نسبة الخصم يجب أن تكون بين 1 و50", "error");
        setSubmitting(false);
        return;
      }
    }

    try {
      const body = buildProductPayload(form);
      const endpoint = isEditing
        ? `/api/products/${editingProductId}`
        : "/api/products";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "خطأ");
      }
      await fetchProducts();
      closeFormModal();
      showToast(
        isEditing ? "✅ تم تحديث المنتج بنجاح" : "✅ تمت إضافة المنتج بنجاح",
        "success"
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : "حدث خطأ أثناء الحفظ", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePriceSave = async (productId: string) => {
    const rawPrice = priceDrafts[productId] ?? "";
    const normalizedPrice = rawPrice.trim();

    if (normalizedPrice !== "") {
      const parsedPrice = Number(normalizedPrice);
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        showToast("السعر يجب أن يكون رقمًا صحيحًا أو فارغًا", "error");
        return;
      }
    }

    setSavingPriceId(productId);

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: normalizedPrice === "" ? null : Number(normalizedPrice),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "تعذر تحديث السعر");
      }

      await fetchProducts();
      showToast("تم تحديث السعر بنجاح", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "تعذر تحديث السعر",
        "error"
      );
    } finally {
      setSavingPriceId(null);
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
    const matchCat = filterCat === "all" || isProductInCategory(p, filterCat);
    return matchSearch && matchCat;
  });

  const stats = {
    total: products.length,
    inStock: products.filter((p) => p.inStock !== false).length,
    outOfStock: products.filter((p) => p.inStock === false).length,
    categories: new Set(products.map((p) => p.category)).size,
  };
  const categoryStats = CATEGORY_OPTIONS.map((option) => ({
    category: option.value,
    label: option.label,
    icon: option.icon,
    count: products.filter((product) => isProductInCategory(product, option.value)).length,
  }))
    .filter((option) => option.count > 0)
    .slice(0, 4);
  const previewImageUrl = form.imageUrl.trim();
  const canPreviewImage =
    previewImageUrl.startsWith("/") || isRemoteImageUrl(previewImageUrl);

  const field = (
    label: string,
    key: keyof FormState,
    type: string = "text",
    required = false,
    placeholder = ""
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
        placeholder={placeholder}
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
            onClick={() => {
              if (!submitting && !uploadingImage) {
                closeFormModal();
              }
            }}
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
                  <h2 className="text-xl font-extrabold text-[#1a1a2e]">
                    {isEditing ? "تعديل المنتج" : "إضافة منتج جديد"}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {isEditing
                      ? "حدّث بيانات المنتج والصورة والسعر من مكان واحد"
                      : "أدخل بيانات المنتج بالكامل وارفع صورته"}
                  </p>
                </div>
                <button
                  onClick={closeFormModal}
                  disabled={submitting || uploadingImage}
                  className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-500 disabled:opacity-60"
                >
                  ✕
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Name */}
                {field("اسم المنتج", "name", "text", true, "مثال: أمينوفيت 1 لتر")}

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
                      {CATEGORY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.icon} {option.label}</option>
                      ))}
                    </select>
                  </div>
                  {field("الشركة المصنّعة", "manufacturer", "text", true, "اسم الشركة المصنّعة")}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {field("الشكل الدوائي", "form", "text", false, "مثال: محلول فموي")}
                  {field("العبوات أو الأحجام", "variants", "text", false, "مثال: 250 مل، 1 لتر")}
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

                <div className="rounded-2xl border border-gray-200 bg-[#f8fbf9] p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-[#1a1a2e]">صورة المنتج</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        ارفع صورة من جهازك أو أضف رابط صورة مباشر.
                      </p>
                    </div>
                    {form.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, imageUrl: "" }))}
                        className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                      >
                        حذف الصورة الحالية
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-[180px,1fr]">
                    <div className="relative h-40 overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-white">
                      {previewImageUrl && canPreviewImage ? (
                        <Image
                          src={previewImageUrl}
                          alt={form.name || "صورة المنتج"}
                          fill
                          className="object-contain p-3"
                          sizes="180px"
                          unoptimized={isRemoteImageUrl(previewImageUrl)}
                          referrerPolicy={isRemoteImageUrl(previewImageUrl) ? "no-referrer" : undefined}
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400">
                          <span className="text-3xl">🖼️</span>
                          <span className="text-xs font-medium">
                            {previewImageUrl
                              ? "الرابط الحالي غير صالح للمعاينة"
                              : "لا توجد صورة مضافة"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <label
                          htmlFor="product-image-upload"
                          className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition-colors cursor-pointer ${
                            uploadingImage
                              ? "bg-gray-200 text-gray-500"
                              : "bg-[#1a5c3a] text-white hover:bg-[#13452b]"
                          }`}
                        >
                          {uploadingImage ? "جارٍ رفع الصورة..." : "رفع صورة من الجهاز"}
                        </label>
                        <input
                          key={imageInputKey}
                          id="product-image-upload"
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={handleImageUpload}
                          disabled={uploadingImage || submitting}
                          className="hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                          رابط الصورة
                        </label>
                        <input
                          type="url"
                          value={form.imageUrl}
                          onChange={(e) =>
                            setForm((current) => ({ ...current, imageUrl: e.target.value }))
                          }
                          placeholder="https://example.com/product.jpg"
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5c3a] transition-colors"
                        />
                      </div>

                      <p className="text-xs text-gray-500 leading-6">
                        الصورة المرفوعة ستُستخدم مباشرة في الكارت وصفحة المنتج. يمكنك لاحقًا استبدالها من نفس النموذج.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    السعر بالريال السعودي
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="مثال: 75"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5c3a] transition-colors"
                  />
                </div>

                <div className="rounded-2xl border border-[#f4d8c5] bg-[#fff7f1] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-[#1a1a2e]">عروض وخصومات</h3>
                      <p className="mt-1 text-xs leading-6 text-gray-500">
                        أضف المنتج إلى قسم العروض مع الاحتفاظ بتصنيفه الأساسي، وحدد نسبة الخصم التي تريدها.
                      </p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                          form.offerEnabled ? "bg-[#d0671c] border-[#d0671c]" : "border-gray-300"
                        }`}
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            offerEnabled: !current.offerEnabled,
                            discountPercentage: !current.offerEnabled
                              ? current.discountPercentage
                              : "",
                          }))
                        }
                      >
                        {form.offerEnabled && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700">🏷️ تفعيل العرض على هذا المنتج</span>
                    </label>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        نسبة الخصم %
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        step="1"
                        disabled={!form.offerEnabled}
                        value={form.discountPercentage}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            discountPercentage: e.target.value,
                          }))
                        }
                        placeholder="مثال: 20"
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#d0671c] transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                      />
                    </div>

                    <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
                      <p className="text-[11px] font-bold tracking-wide text-gray-400">السعر بعد الخصم</p>
                      <p className="mt-2 text-lg font-black text-[#d0671c]">
                        {form.offerEnabled &&
                        form.price.trim() !== "" &&
                        form.discountPercentage.trim() !== "" &&
                        Number.isFinite(Number(form.price)) &&
                        Number.isFinite(Number(form.discountPercentage))
                          ? formatProductPrice(
                              Number(form.price) * (1 - Number(form.discountPercentage) / 100)
                            )
                          : "أضف السعر ونسبة الخصم"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        يمكنك تحديد خصم من 1% إلى 50%، وسيظهر المنتج تلقائيًا داخل قسم العروض.
                      </p>
                    </div>
                  </div>
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
                    disabled={submitting || uploadingImage}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#1a5c3a] to-[#2d8a56] text-white font-bold text-sm shadow-lg hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {submitting
                      ? "جارٍ الحفظ..."
                      : isEditing
                        ? "حفظ التعديلات"
                        : "حفظ المنتج"}
                  </motion.button>
                  <button
                    type="button"
                    onClick={closeFormModal}
                    disabled={submitting || uploadingImage}
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
              onClick={openCreateForm}
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
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.icon} {option.label}</option>
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
                    <th className="text-right px-5 py-3.5">السعر</th>
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
                            <div className="relative w-11 h-11 overflow-hidden rounded-xl border border-gray-100 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-lg flex-none">
                              {product.images?.[0] ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="44px"
                                  unoptimized={isRemoteImageUrl(product.images[0])}
                                  referrerPolicy={
                                    isRemoteImageUrl(product.images[0])
                                      ? "no-referrer"
                                      : undefined
                                  }
                                />
                              ) : (
                                <span>{CATEGORY_ICONS[product.category]}</span>
                              )}
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
                          <div className="flex flex-wrap gap-1.5">
                            <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium whitespace-nowrap">
                              {LABELS[product.category] || product.category}
                            </span>
                            {isProductInOffers(product) && (
                              <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold whitespace-nowrap">
                                🏷️ عرض {getProductDiscountPercentage(product) ? `${getProductDiscountPercentage(product)}%` : ""}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4 min-w-[220px]">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={priceDrafts[product.id] ?? ""}
                              onChange={(e) =>
                                setPriceDrafts((drafts) => ({
                                  ...drafts,
                                  [product.id]: e.target.value,
                                }))
                              }
                              placeholder="بدون سعر"
                              className="w-28 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#1a5c3a]"
                            />
                            <button
                              type="button"
                              onClick={() => handlePriceSave(product.id)}
                              disabled={savingPriceId === product.id}
                              className="rounded-xl bg-[#1a5c3a] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#13452b] disabled:opacity-60"
                            >
                              {savingPriceId === product.id ? "جارٍ الحفظ" : "حفظ"}
                            </button>
                          </div>
                          {(() => {
                            const basePrice = getNumericProductPrice(product.price);
                            const discountedPrice = getDiscountedProductPrice(product);
                            const discountPercentage = getProductDiscountPercentage(product);
                            const hasDiscount =
                              basePrice !== null &&
                              discountedPrice !== null &&
                              discountPercentage !== null &&
                              discountedPrice < basePrice;

                            if (hasDiscount) {
                              return (
                                <div className="mt-2 space-y-1">
                                  <p className="text-[11px] font-bold text-gray-400 line-through">
                                    {formatProductPrice(basePrice)}
                                  </p>
                                  <p className="text-xs font-bold text-[#d0671c]">
                                    بعد الخصم: {formatProductPrice(discountedPrice)}
                                  </p>
                                </div>
                              );
                            }

                            return (
                              <p className="mt-2 text-xs font-semibold text-[#1a5c3a]">
                                {formatProductPrice(product.price)}
                              </p>
                            );
                          })()}
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
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openEditForm(product)}
                              className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                              title="تعديل المنتج"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </motion.button>
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
                {categoryStats.map((item) => (
                  <span key={item.category} className="text-xs text-gray-400">
                    {item.icon} {item.count}
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
