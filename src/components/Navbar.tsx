"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { CATEGORY_OPTIONS } from "@/lib/products";
import { siteConfig } from "@/lib/site";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/products", label: "جميع المنتجات" },
];

const categoryLinks = CATEGORY_OPTIONS.map((category) => ({
  href: `/products?category=${category.value}`,
  label: category.label,
  icon: category.icon,
  value: category.value,
}));

interface CategoryLinksProps {
  pathname: string | null;
  activeCategory: string | null;
  mobile?: boolean;
  onNavigate?: () => void;
}

function CategoryLinksList({
  pathname,
  activeCategory,
  mobile = false,
  onNavigate,
}: CategoryLinksProps) {
  if (mobile) {
    return (
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {categoryLinks.map((link) => {
          const isActive = pathname === "/products" && activeCategory === link.value;

          return (
            <Link
              key={link.value}
              href={link.href}
              onClick={onNavigate}
              className={`flex items-start gap-2 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#1a5c3a]/10 text-[#1a5c3a]"
                  : "text-gray-700 hover:bg-[#1a5c3a]/10 hover:text-[#1a5c3a]"
              }`}
            >
              <span className="pt-0.5">{link.icon}</span>
              <span className="leading-6">{link.label}</span>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
      {categoryLinks.map((link) => {
        const isActive = pathname === "/products" && activeCategory === link.value;

        return (
          <Link
            key={link.value}
            href={link.href}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
              isActive
                ? "border-[#1a5c3a] bg-[#1a5c3a]/10 text-[#1a5c3a]"
                : "border-gray-200 text-gray-600 hover:border-[#1a5c3a]/30 hover:bg-[#1a5c3a]/5 hover:text-[#1a5c3a]"
            }`}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

function SearchAwareCategoryLinks({
  pathname,
  mobile = false,
  onNavigate,
}: Omit<CategoryLinksProps, "activeCategory">) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  return (
    <CategoryLinksList
      pathname={pathname}
      activeCategory={activeCategory}
      mobile={mobile}
      onNavigate={onNavigate}
    />
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalCount, openCart } = useCart();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      {/* Top bar - promotional marquee */}
      <div className="bg-[#1a5c3a] text-white text-xs py-2 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          🐑 حصانة فيت — صيدلية بيطرية متخصصة في منتجات الأغنام والإبل &nbsp;&nbsp;🐪&nbsp;&nbsp; توصيل سريع لجميع مناطق المملكة &nbsp;&nbsp;💊&nbsp;&nbsp; أدوية وتطعيمات معتمدة بيطرياً &nbsp;&nbsp;📞&nbsp;&nbsp; تواصل معنا عبر واتساب &nbsp;&nbsp;🌿&nbsp;&nbsp; استشارات بيطرية مجانية
        </div>
      </div>

      <header
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass shadow-md"
            : "bg-white border-b border-gray-100"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-none">
            <Image
              src="/hassana.png"
              alt="حصانة فيت"
              width={44}
              height={44}
              className="h-11 w-auto object-contain"
              priority
            />
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-[#1a5c3a] text-base tracking-tight">
                حصانة فيت
              </span>
              <span className="text-[10px] text-gray-400 font-medium">صيدلية النخلة البيطرية</span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === "/products";

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[#1a5c3a]/10 text-[#1a5c3a]"
                      : "text-gray-600 hover:text-[#1a5c3a] hover:bg-[#1a5c3a]/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search icon */}
            <Link
              href="/products"
              className="flex w-9 h-9 rounded-lg hover:bg-gray-100 items-center justify-center text-gray-500 hover:text-[#1a5c3a] transition-colors"
              aria-label="بحث"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            {/* Cart button */}
            <button
              onClick={openCart}
              className="relative w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-[#1a5c3a] transition-colors"
              aria-label="سلة الطلبات"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#d4a017] text-white text-[10px] font-bold flex items-center justify-center">
                  {totalCount > 99 ? "99+" : totalCount}
                </span>
              )}
            </button>

            {/* WhatsApp - desktop only */}
            <a
              href={siteConfig.contact.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1a5c3a] text-white text-sm font-semibold hover:bg-[#0f3d26] transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              تواصل معنا
            </a>

            {/* Mobile toggle */}
            <button
              className="lg:hidden w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="تبديل القائمة"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>

        <div className="hidden lg:block border-t border-gray-100 bg-white/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <Suspense fallback={<CategoryLinksList pathname={pathname} activeCategory={null} />}>
              <SearchAwareCategoryLinks pathname={pathname} />
            </Suspense>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-4 flex flex-col gap-0.5"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-[#1a5c3a]/10 hover:text-[#1a5c3a] transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-3 border-t border-gray-100 pt-3">
                <p className="px-2 pb-2 text-xs font-bold text-gray-400">التصنيفات</p>
                <Suspense
                  fallback={
                    <CategoryLinksList
                      pathname={pathname}
                      activeCategory={null}
                      mobile
                      onNavigate={() => setMenuOpen(false)}
                    />
                  }
                >
                  <SearchAwareCategoryLinks
                    pathname={pathname}
                    mobile
                    onNavigate={() => setMenuOpen(false)}
                  />
                </Suspense>
              </div>

              <a
                href={siteConfig.contact.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 px-5 py-3 rounded-lg bg-[#1a5c3a] text-white text-sm font-semibold text-center"
                onClick={() => setMenuOpen(false)}
              >
                تواصل معنا عبر واتساب
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
