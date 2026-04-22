"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/AnimationHelpers";
import ProductCard from "@/components/ProductCard";
import WhatsAppConsultBanner from "@/components/WhatsAppConsultBanner";
import {
  CATEGORY_HOME_GRADIENTS,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  type Category,
  type Product,
} from "@/lib/products";
import { siteConfig } from "@/lib/site";

const DEFAULT_HERO_IMAGE = "/hero-vet-scene.svg";
const CUSTOM_HERO_IMAGE = "/hero.png";

const heroBenefits = [
  { icon: "🛡️", title: "جودة مضمونة", text: "منتجات معتمدة ومختارة بعناية" },
  { icon: "🚚", title: "شحن سريع وآمن", text: "تجهيز يومي ووصول سريع داخل المملكة" },
  { icon: "🎧", title: "دعم فني متخصص", text: "مساعدة مباشرة لاختيار المنتج الأنسب" },
];

interface HomePageClientProps {
  productCount: number;
  categoryCounts: Array<{
    category: Category;
    count: number;
  }>;
  showcaseProducts: Product[];
  moreProducts: Product[];
}

export default function HomePageClient({
  productCount,
  categoryCounts,
  showcaseProducts,
  moreProducts,
}: HomePageClientProps) {
  const heroHighlights = [
    { value: String(productCount), label: "منتج متوفر" },
    { value: String(Object.keys(CATEGORY_LABELS).length), label: "تصنيفات علاجية" },
    { value: "24/7", label: "طلب مباشر" },
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#081827]">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${CUSTOM_HERO_IMAGE}), url(${DEFAULT_HERO_IMAGE})`,
            backgroundPosition: "center top, center center",
            backgroundRepeat: "no-repeat, no-repeat",
            backgroundSize: "cover, cover",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,52,90,0.10)_0%,rgba(11,82,56,0.18)_24%,rgba(5,19,33,0.50)_56%,rgba(4,13,24,0.88)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,231,133,0.28),transparent_18%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_20%)]" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-20 sm:pb-24 lg:pb-28 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-md"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-[0_4px_14px_rgba(4,13,24,0.18)]">
              <Image
                src="/hassana.png"
                alt="شعار حصانة فيت"
                width={22}
                height={22}
                className="h-[22px] w-[22px] object-contain"
                priority
              />
            </span>
            {siteConfig.tagline}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-[0.95] tracking-tight [text-shadow:0_6px_26px_rgba(0,0,0,0.34)] sm:text-5xl lg:text-7xl"
          >
            كل ما تحتاجه
            <br />
            <span className="text-[#C9EF57]">لرعاية ماشيتك</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-white/90 sm:text-lg"
          >
            أدوية ومنتجات بيطرية متخصصة لصحة الحيوان، من المضادات الحيوية والفيتامينات إلى المعدات البيطرية والمكملات.
            اختر بسرعة، واطلب مباشرة، ووصل طلبك بثقة.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="mt-7 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#72C13C] to-[#2D8A56] px-7 py-4 text-base font-extrabold text-white shadow-[0_12px_30px_rgba(47,138,86,0.35)] transition-transform hover:scale-[1.02]"
            >
              تسوّق الآن
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17" />
              </svg>
            </Link>
            <a
              href={siteConfig.contact.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-[#0B2237]/55 px-7 py-4 text-base font-bold text-white backdrop-blur-md transition-colors hover:bg-[#0B2237]/72"
            >
              اطلب عبر واتساب
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.34 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2.5"
          >
            {heroHighlights.map((item) => (
              <div
                key={item.label}
                className="rounded-full border border-white/18 bg-[#0A2437]/48 px-4 py-3 text-white shadow-[0_10px_24px_rgba(3,14,24,0.18)] backdrop-blur-md"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl font-extrabold text-[#D8F96C]">{item.value}</span>
                  <span className="text-xs font-semibold text-white/78">{item.label}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="overflow-hidden rounded-[30px] border border-white/30 bg-white/88 shadow-[0_18px_45px_rgba(6,18,36,0.22)] backdrop-blur-xl">
            <div className="grid gap-px bg-slate-200/70 md:grid-cols-3">
              {heroBenefits.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.18 + index * 0.08 }}
                  className="bg-white px-5 py-5 text-[#12314E]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF5EF] text-3xl shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#4F647A]">{item.text}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a2e]">
              تصفح حسب التصنيف
            </h2>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryCounts.map(({ category, count }) => (
              <StaggerItem key={category}>
                <Link href={`/products?category=${category}`} className={`relative block rounded-2xl overflow-hidden bg-gradient-to-br ${CATEGORY_HOME_GRADIENTS[category] || "from-gray-600 to-gray-400"} group`}>
                  <div className="relative p-8 flex flex-col items-center text-white text-center gap-3">
                    <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{CATEGORY_ICONS[category] || "📦"}</span>
                    <h3 className="text-lg font-bold">{CATEGORY_LABELS[category]}</h3>
                    <p className="text-white/70 text-xs leading-relaxed">{count} منتج</p>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-white/80 group-hover:text-white transition-colors">
                      تصفح المنتجات
                      <svg className="w-3.5 h-3.5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="bg-[#d4a017] py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-3 text-[#1a1a2e]">
          <span className="text-lg">🌿</span>
          <p className="text-sm font-bold text-center">منتجات بيطرية معتمدة — {productCount} منتج من {Object.keys(CATEGORY_LABELS).length} تصنيفات — تواصل معنا عبر واتساب!</p>
          <span className="text-lg">🌿</span>
        </div>
      </section>

      <section className="py-14 bg-[#f7f9f8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-[#d4a017] uppercase tracking-widest mb-1">منتجاتنا</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a2e]">أحدث المنتجات المتوفرة</h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-[#1a5c3a] hover:underline hidden sm:inline-flex items-center gap-1">
              عرض الكل
              <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </FadeIn>

          <div className="flex items-stretch gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
            {showcaseProducts.map((product, index) => (
              <motion.div key={product.id} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06, duration: 0.4 }} className="h-full flex-none w-[250px]">
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <WhatsAppConsultBanner />

      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-[#1a5c3a] uppercase tracking-widest mb-1">تشكيلة متنوعة</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a2e]">اكتشف المزيد من منتجاتنا</h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-[#1a5c3a] hover:underline hidden sm:inline-flex items-center gap-1">
              عرض الكل
              <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-2 items-stretch sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {moreProducts.map((product) => (
              <StaggerItem key={product.id} className="h-full"><ProductCard product={product} /></StaggerItem>
            ))}
          </StaggerContainer>

          <FadeIn className="text-center mt-10">
            <Link href="/products" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg border-2 border-[#1a5c3a] text-[#1a5c3a] font-bold text-sm hover:bg-[#1a5c3a] hover:text-white transition-all duration-200">
              عرض جميع المنتجات
              <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 bg-[#f7f9f8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: "🏆", title: "جودة معتمدة", text: "جميع المنتجات معتمدة بيطرياً" },
              { icon: "🚚", title: "توصيل سريع", text: "شحن لجميع مناطق المملكة" },
              { icon: "💬", title: "استشارة مجانية", text: "فريقنا البيطري متاح عبر واتساب" },
              { icon: "🔒", title: "طلب آمن", text: "طلب مأمون مع حفاظ على الخصوصية" },
            ].map((item) => (
              <StaggerItem key={item.title}>
                <div className="bg-white rounded-xl p-5 card-shadow text-center">
                  <span className="text-3xl">{item.icon}</span>
                  <h3 className="font-bold text-[#1a1a2e] mt-2 mb-1 text-sm">{item.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.text}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="py-16 bg-white">
        <FadeIn className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#1a5c3a] to-[#0f3d26] rounded-2xl p-10 sm:p-14 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#d4a017]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#2d8a56]/20 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">استشارة تفرق</h2>
              <p className="text-white/60 mb-8 max-w-xl mx-auto text-sm leading-relaxed">
                تواصل مع فريقنا البيطري المتخصص عبر واتساب للحصول على توصيات شخصية وطلب سريع. خبرة أكثر من 15 عاماً في رعاية الماشية.
              </p>
              <a href={siteConfig.contact.whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-[#d4a017] text-[#1a1a2e] font-bold text-sm hover:bg-[#f0c940] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                راسلنا عبر واتساب
              </a>
            </div>
          </div>
        </FadeIn>
      </section>
    </>
  );
}