import seedData from "@/data/products.json";
import { getWhatsAppUrl, siteConfig } from "@/lib/site";

const VITAMINS_MINERALS_CATEGORY_ID = "vitamins-minerals";
const NEW_ARRIVALS_CATEGORY_ID = "new-arrivals";

const CATEGORY_DEFINITIONS = [
  {
    id: NEW_ARRIVALS_CATEGORY_ID,
    label: "جديدنا",
    icon: "✨",
    badgeClass: "bg-indigo-100 text-indigo-700",
    cardPlaceholderGradient: "from-indigo-50 to-blue-100",
    detailPlaceholderGradient: "from-indigo-100 to-blue-200",
    homeGradient: "from-indigo-600 to-sky-500",
  },
  {
    id: "offers-discounts-up-to-50",
    label: "عروض وخصومات تصل إلى 50%",
    icon: "🏷️",
    badgeClass: "bg-red-100 text-red-700",
    cardPlaceholderGradient: "from-red-50 to-orange-100",
    detailPlaceholderGradient: "from-red-100 to-orange-200",
    homeGradient: "from-red-600 to-orange-500",
  },
  {
    id: "antibiotics",
    label: "مضادات حيوية",
    icon: "💊",
    badgeClass: "bg-rose-100 text-rose-700",
    cardPlaceholderGradient: "from-rose-50 to-red-100",
    detailPlaceholderGradient: "from-rose-100 to-red-200",
    homeGradient: "from-[#1a5c3a] to-[#2d8a56]",
  },
  {
    id: "anti-inflammatory-analgesics-antipyretics",
    label: "مضادات التهاب ومسكنات وخافض حرارة",
    icon: "💉",
    badgeClass: "bg-amber-100 text-amber-700",
    cardPlaceholderGradient: "from-amber-50 to-orange-100",
    detailPlaceholderGradient: "from-amber-100 to-orange-200",
    homeGradient: "from-rose-600 to-pink-500",
  },
  {
    id: "hormones",
    label: "أدوية هرمونات",
    icon: "⚗️",
    badgeClass: "bg-purple-100 text-purple-700",
    cardPlaceholderGradient: "from-purple-50 to-fuchsia-100",
    detailPlaceholderGradient: "from-purple-100 to-fuchsia-200",
    homeGradient: "from-purple-600 to-fuchsia-500",
  },
  {
    id: "dewormers-mange-parasites",
    label: "أدوية ديدان وجرب وطفيليات",
    icon: "🐛",
    badgeClass: "bg-sky-100 text-sky-700",
    cardPlaceholderGradient: "from-sky-50 to-cyan-100",
    detailPlaceholderGradient: "from-sky-100 to-cyan-200",
    homeGradient: "from-cyan-600 to-sky-500",
  },
  {
    id: "blood-parasites-heyam",
    label: "أدوية طفيليات دم وهيام",
    icon: "🩸",
    badgeClass: "bg-fuchsia-100 text-fuchsia-700",
    cardPlaceholderGradient: "from-fuchsia-50 to-pink-100",
    detailPlaceholderGradient: "from-fuchsia-100 to-pink-200",
    homeGradient: "from-fuchsia-600 to-rose-500",
  },
  {
    id: VITAMINS_MINERALS_CATEGORY_ID,
    label: "فيتامينات ومعادن",
    icon: "🧬",
    badgeClass: "bg-emerald-100 text-emerald-700",
    cardPlaceholderGradient: "from-emerald-50 to-teal-100",
    detailPlaceholderGradient: "from-emerald-100 to-teal-200",
    homeGradient: "from-emerald-600 to-teal-500",
  },
  {
    id: "milk",
    label: "حليب",
    icon: "🥛",
    badgeClass: "bg-blue-100 text-blue-700",
    cardPlaceholderGradient: "from-blue-50 to-sky-100",
    detailPlaceholderGradient: "from-blue-100 to-sky-200",
    homeGradient: "from-sky-600 to-blue-500",
  },
  {
    id: "fattening-bone-growth",
    label: "أدوية تسمين ونمو عظام (مزاين: إبل / غنم)",
    icon: "🦴",
    badgeClass: "bg-yellow-100 text-yellow-800",
    cardPlaceholderGradient: "from-yellow-50 to-amber-100",
    detailPlaceholderGradient: "from-yellow-100 to-amber-200",
    homeGradient: "from-[#8B6914] to-[#d4a017]",
  },
  {
    id: "poultry-medicines",
    label: "أدوية دواجن",
    icon: "🐔",
    badgeClass: "bg-orange-100 text-orange-700",
    cardPlaceholderGradient: "from-orange-50 to-amber-100",
    detailPlaceholderGradient: "from-orange-100 to-amber-200",
    homeGradient: "from-orange-600 to-amber-500",
  },
  {
    id: "pets-birds",
    label: "أدوية قطط وكلاب وطيور زينة",
    icon: "🐾",
    badgeClass: "bg-violet-100 text-violet-700",
    cardPlaceholderGradient: "from-violet-50 to-purple-100",
    detailPlaceholderGradient: "from-violet-100 to-purple-200",
    homeGradient: "from-violet-600 to-indigo-500",
  },
  {
    id: "vaccines",
    label: "تطعيمات",
    icon: "🛡️",
    badgeClass: "bg-cyan-100 text-cyan-700",
    cardPlaceholderGradient: "from-cyan-50 to-sky-100",
    detailPlaceholderGradient: "from-cyan-100 to-sky-200",
    homeGradient: "from-sky-600 to-cyan-500",
  },
  {
    id: "veterinary-equipment",
    label: "معدات بيطرية",
    icon: "🧰",
    badgeClass: "bg-slate-100 text-slate-700",
    cardPlaceholderGradient: "from-slate-50 to-gray-100",
    detailPlaceholderGradient: "from-slate-100 to-gray-200",
    homeGradient: "from-slate-700 to-slate-500",
  },
  {
    id: "ointments-creams-sprays",
    label: "مراهم وكريمات وبخاخات",
    icon: "🧴",
    badgeClass: "bg-teal-100 text-teal-700",
    cardPlaceholderGradient: "from-teal-50 to-emerald-100",
    detailPlaceholderGradient: "from-teal-100 to-emerald-200",
    homeGradient: "from-teal-600 to-emerald-500",
  },
  {
    id: "others",
    label: "أخرى",
    icon: "📦",
    badgeClass: "bg-stone-100 text-stone-700",
    cardPlaceholderGradient: "from-stone-50 to-zinc-100",
    detailPlaceholderGradient: "from-stone-100 to-zinc-200",
    homeGradient: "from-stone-600 to-neutral-500",
  },
] as const;

export type Category = (typeof CATEGORY_DEFINITIONS)[number]["id"];
export const OFFERS_CATEGORY: Category = "offers-discounts-up-to-50";

export interface ActiveIngredient {
  name: string;
  concentration: string | null;
}

export interface ProductOffer {
  enabled: boolean;
  discountPercentage: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: Category;
  categoryName: string;
  price?: number | null;
  offer: ProductOffer | null;
  form: string | null;
  variants: string[];
  manufacturer: string;
  active_ingredients: ActiveIngredient[];
  description: string | null;
  indications: string | null;
  dosage: Record<string, string> | string | null;
  withdrawal_period: string | null;
  storage: string | null;
  images: string[];
  inStock: boolean;
}

type CategoryDefinition = (typeof CATEGORY_DEFINITIONS)[number];

type LegacyCategory =
  | "antibacterials"
  | "feed-products"
  | "anti-inflammatory-analgesics"
  | "vitamins-minerals-amino-acids"
  | "miscellaneous"
  | "anthelmintics"
  | "anticoccidials"
  | "antiprotozoals";

type RawProduct = Partial<Omit<Product, "category" | "categoryName">> & {
  id?: string;
  name?: string;
  slug?: string;
  category?: string | null;
  categoryName?: string | null;
  manufacturer?: string | null;
  form?: string | null;
  variants?: unknown;
  active_ingredients?: unknown;
  description?: string | null;
  indications?: string | null;
  dosage?: Record<string, string> | string | null;
  withdrawal_period?: string | null;
  storage?: string | null;
  images?: unknown;
  inStock?: boolean;
  price?: unknown;
  offer?: unknown;
};

function mapCategoryValues<T>(
  select: (category: CategoryDefinition) => T
): Record<Category, T> {
  return Object.fromEntries(
    CATEGORY_DEFINITIONS.map((category) => [category.id, select(category)])
  ) as Record<Category, T>;
}

export const CATEGORY_LABELS = mapCategoryValues((category) => category.label);

export const CATEGORY_ICONS = mapCategoryValues((category) => category.icon);

export const CATEGORY_BADGE_CLASSES = mapCategoryValues(
  (category) => category.badgeClass
);

export const CATEGORY_CARD_PLACEHOLDER_GRADIENTS = mapCategoryValues(
  (category) => category.cardPlaceholderGradient
);

export const CATEGORY_DETAIL_PLACEHOLDER_GRADIENTS = mapCategoryValues(
  (category) => category.detailPlaceholderGradient
);

export const CATEGORY_HOME_GRADIENTS = mapCategoryValues(
  (category) => category.homeGradient
);

export const CATEGORY_OPTIONS: Array<{
  value: Category;
  label: string;
  icon: string;
}> = CATEGORY_DEFINITIONS.map((category) => ({
  value: category.id,
  label: category.label,
  icon: category.icon,
}));

export const CATEGORY_ORDER: Category[] = CATEGORY_DEFINITIONS.map(
  (category) => category.id
);

const LIVESTOCK_KEYWORDS = [
  "الأبقار",
  "الابقار",
  "المواشي",
  "الأغنام",
  "الاغنام",
  "الماعز",
  "الجمال",
  "الإبل",
  "الابل",
  "الخيول",
  "العجول",
  "المهور",
  "الحملان",
  "المجترات",
];

const POULTRY_KEYWORDS = [
  "الدواجن",
  "الدجاج",
  "الديوك الرومية",
  "الرومي",
  "البياض",
  "الأمهات",
  "الحمام",
];

const PET_BIRD_KEYWORDS = [
  "الكلاب",
  "القطط",
  "طيور الأقفاص",
  "طيور الزينة",
  "الحمام",
  "الأرانب",
];

const VACCINE_KEYWORDS = ["لقاح", "تطعيم", "تحصين", "vaccine"];

const EQUIPMENT_KEYWORDS = [
  "معدات",
  "أداة",
  "أدوات",
  "فحص",
  "مزلق",
  "التشحيم",
  "تشحيم",
  "الذراع والأيدي والأدوات",
];

const TOPICAL_KEYWORDS = [
  "مرهم",
  "كريم",
  "بخاخ",
  "جل",
  "الجلد",
  "موضعي",
  "مطهر",
  "skin",
  "ointment",
  "cream",
  "spray",
  "gel",
];

const HORMONE_KEYWORDS = [
  "هرمون",
  "هرمونات",
  "hormone",
  "hormonal",
  "hormones",
  "اوكسيتوسين",
  "أوكسيتوسين",
  "oxytocin",
  "كلوبروستنول",
  "cloprostenol",
  "دينوبروست",
  "dinoprost",
  "بوسيريلين",
  "buserelin",
  "بروجستيرون",
  "progesterone",
  "استروجين",
  "estrogen",
  "إستراديول",
  "estradiol",
  "جونادوريلين",
  "gonadorelin",
  "gonadotropin",
  "gonadotropins",
  "hcg",
  "gnrh",
  "ديكساميثازون",
  "ديكساميتازون",
  "dexamethasone",
] as const;

const OFFER_CATEGORY_SIGNALS = [
  "offers-discounts-up-to-50",
  "offers-discounts",
  "offers",
  "discounts",
  "offer",
  "discount",
  "عروض",
  "عرض",
  "خصومات",
  "عروض وخصومات",
  "عروض وخصومات تصل الى 50%",
  "عروض وخصومات تصل إلى 50%",
] as const;

const NEW_ARRIVALS_CATEGORY_SIGNALS = [
  NEW_ARRIVALS_CATEGORY_ID,
  "جديدنا",
  "new arrivals",
  "new-arrivals",
] as const;

const MILK_CATEGORY_SIGNALS = [
  "milk",
  "حليب",
  "منتجات حليب",
  "milk products",
  "milk replacer",
  "بديل حليب",
] as const;

const OTHER_CATEGORY_SIGNALS = [
  "other",
  "others",
  "misc",
  "miscellaneous",
  "أخرى",
  "اخرى",
] as const;

const BLOOD_PARASITE_KEYWORDS = [
  "طفيليات دم",
  "هيام",
  "بابيزيا",
  "ثيليريا",
  "أنابلازما",
  "trypanosoma",
  "babesia",
  "theileria",
  "anaplasma",
];

const FATTENING_KEYWORDS = [
  "تسمين",
  "نمو العظام",
  "العظام",
  "مزاين",
  "حجر ملحي",
  "ملح معدني",
  "مكمل غذائي معدني",
  "عالي الطاقة",
  "عالي الفيتامينات",
  "الشهية",
  "أكل التراب",
  "الصوف والرمل",
  "بروبيلين جليكول",
  "polyphagia",
];

const VITAMIN_KEYWORDS = [
  "فيتامين",
  "vitamin",
  "معادن",
  "minerals",
  "أحماض أمينية",
  "amino acids",
  "مكمل غذائي",
];

function hasAnyKeyword(text: string, keywords: readonly string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue === "" ? null : normalizedValue;
}

function hasCategorySignal(values: unknown[], signals: readonly string[]) {
  return values.some((value) => {
    const normalizedValue = normalizeText(value)?.toLowerCase();
    return normalizedValue ? signals.includes(normalizedValue) : false;
  });
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item).trim()).filter(Boolean);
}

function normalizeActiveIngredients(value: unknown): ActiveIngredient[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((ingredient) => {
      if (!ingredient || typeof ingredient !== "object") {
        return null;
      }

      const name = normalizeText((ingredient as { name?: unknown }).name);

      if (!name) {
        return null;
      }

      return {
        name,
        concentration:
          normalizeText(
            (ingredient as { concentration?: unknown }).concentration
          ) ?? null,
      };
    })
    .filter((ingredient): ingredient is ActiveIngredient => ingredient !== null);
}

function normalizePrice(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue =
    typeof value === "number" ? value : Number(String(value).trim());

  return Number.isFinite(numericValue) && numericValue >= 0
    ? numericValue
    : null;
}

function normalizeDiscountPercentage(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue =
    typeof value === "number" ? value : Number(String(value).trim());

  return Number.isFinite(numericValue) && numericValue > 0 && numericValue <= 50
    ? numericValue
    : null;
}

function normalizeOffer(value: unknown): ProductOffer | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const offerValue = value as {
    enabled?: unknown;
    discountPercentage?: unknown;
  };
  const discountPercentage = normalizeDiscountPercentage(
    offerValue.discountPercentage
  );

  if (offerValue.enabled !== true || discountPercentage === null) {
    return null;
  }

  return {
    enabled: true,
    discountPercentage,
  };
}

function isLegacyCategory(value: string | null | undefined): value is LegacyCategory {
  return (
    value === "antibacterials" ||
    value === "feed-products" ||
    value === "anti-inflammatory-analgesics" ||
    value === "vitamins-minerals-amino-acids" ||
    value === "miscellaneous" ||
    value === "anthelmintics" ||
    value === "anticoccidials" ||
    value === "antiprotozoals"
  );
}

export function isCategory(value: unknown): value is Category {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(CATEGORY_LABELS, value)
  );
}

function buildActiveIngredientsSearchText(product: RawProduct) {
  return normalizeActiveIngredients(product.active_ingredients)
    .flatMap((ingredient) =>
      [ingredient.name, ingredient.concentration].filter(Boolean)
    )
    .join(" ");
}

function buildProductSearchText(product: RawProduct): string {
  const activeIngredients = buildActiveIngredientsSearchText(product);

  return [
    product.name,
    product.category,
    product.categoryName,
    product.form,
    product.manufacturer,
    product.description,
    product.indications,
    normalizeStringArray(product.variants).join(" "),
    normalizeStringArray(product.images).join(" "),
    activeIngredients,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function buildHormoneSearchText(product: RawProduct): string {
  return [
    product.name,
    product.category,
    product.categoryName,
    buildActiveIngredientsSearchText(product),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function isPoultryFocused(text: string) {
  return hasAnyKeyword(text, POULTRY_KEYWORDS) && !hasAnyKeyword(text, LIVESTOCK_KEYWORDS);
}

function isPetOrBirdFocused(text: string) {
  return hasAnyKeyword(text, PET_BIRD_KEYWORDS) && !hasAnyKeyword(text, LIVESTOCK_KEYWORDS);
}

function normalizeCategory(rawCategory: string | null | undefined, product: RawProduct): Category {
  if (
    rawCategory === "injectable-vitamins-minerals" ||
    rawCategory === "oral-vitamins-minerals"
  ) {
    return VITAMINS_MINERALS_CATEGORY_ID;
  }

  if (isCategory(rawCategory)) {
    return rawCategory;
  }

  if (hasCategorySignal([rawCategory, product.categoryName], OFFER_CATEGORY_SIGNALS)) {
    return "offers-discounts-up-to-50";
  }

  if (hasCategorySignal([rawCategory, product.categoryName], NEW_ARRIVALS_CATEGORY_SIGNALS)) {
    return NEW_ARRIVALS_CATEGORY_ID;
  }

  if (hasCategorySignal([rawCategory, product.categoryName], MILK_CATEGORY_SIGNALS)) {
    return "milk";
  }

  if (hasCategorySignal([rawCategory, product.categoryName], OTHER_CATEGORY_SIGNALS)) {
    return "others";
  }

  const searchText = buildProductSearchText(product);
  const hormoneSearchText = buildHormoneSearchText(product);

  if (hasAnyKeyword(searchText, VACCINE_KEYWORDS)) {
    return "vaccines";
  }

  if (hasAnyKeyword(searchText, BLOOD_PARASITE_KEYWORDS)) {
    return "blood-parasites-heyam";
  }

  if (hasAnyKeyword(hormoneSearchText, HORMONE_KEYWORDS)) {
    return "hormones";
  }

  if (hasAnyKeyword(searchText, EQUIPMENT_KEYWORDS)) {
    return "veterinary-equipment";
  }

  if (hasAnyKeyword(searchText, TOPICAL_KEYWORDS)) {
    return "ointments-creams-sprays";
  }

  if (isLegacyCategory(rawCategory)) {
    switch (rawCategory) {
      case "anti-inflammatory-analgesics":
        return "anti-inflammatory-analgesics-antipyretics";
      case "anthelmintics":
        return "dewormers-mange-parasites";
      case "anticoccidials":
        return "poultry-medicines";
      case "antiprotozoals":
        if (isPetOrBirdFocused(searchText)) {
          return "pets-birds";
        }

        return hasAnyKeyword(searchText, POULTRY_KEYWORDS)
          ? "poultry-medicines"
          : "blood-parasites-heyam";
      case "vitamins-minerals-amino-acids":
        return VITAMINS_MINERALS_CATEGORY_ID;
      case "feed-products":
        if (hasAnyKeyword(searchText, FATTENING_KEYWORDS)) {
          return "fattening-bone-growth";
        }

        return VITAMINS_MINERALS_CATEGORY_ID;
      case "antibacterials":
        if (isPoultryFocused(searchText)) {
          return "poultry-medicines";
        }

        if (isPetOrBirdFocused(searchText)) {
          return "pets-birds";
        }

        return "antibiotics";
      case "miscellaneous":
        return "others";
    }
  }

  if (hasAnyKeyword(searchText, VITAMIN_KEYWORDS)) {
    return VITAMINS_MINERALS_CATEGORY_ID;
  }

  if (isPoultryFocused(searchText)) {
    return "poultry-medicines";
  }

  if (isPetOrBirdFocused(searchText)) {
    return "pets-birds";
  }

  return "others";
}

function buildFallbackSlug(name: string, id: string) {
  return (name || id).toLowerCase().trim().replace(/\s+/g, "-");
}

function decodeProductRouteParam(value: string) {
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}

function extractTrailingNumericId(routeParam: string) {
  const match = routeParam.match(/-(\d+)$/);
  return match?.[1] ?? null;
}

export function normalizeProduct(product: RawProduct): Product {
  const id = String(product.id ?? product.slug ?? product.name ?? "").trim();
  const name = String(product.name ?? "").trim();
  const category = normalizeCategory(product.category, product);

  return {
    id,
    name,
    slug: String(product.slug ?? "").trim() || buildFallbackSlug(name, id),
    category,
    categoryName: CATEGORY_LABELS[category],
    price: normalizePrice(product.price),
    offer: normalizeOffer(product.offer),
    form: normalizeText(product.form),
    variants: normalizeStringArray(product.variants),
    manufacturer: String(product.manufacturer ?? "").trim(),
    active_ingredients: normalizeActiveIngredients(product.active_ingredients),
    description: normalizeText(product.description),
    indications: normalizeText(product.indications),
    dosage: product.dosage ?? null,
    withdrawal_period: normalizeText(product.withdrawal_period),
    storage: normalizeText(product.storage),
    images: normalizeStringArray(product.images),
    inStock: product.inStock !== false,
  };
}

export function normalizeProducts(items: RawProduct[]): Product[] {
  return items.map(normalizeProduct);
}

export function getProductRouteSegment(
  product: Pick<Product, "id" | "slug" | "name">
) {
  const id = String(product.id ?? "").trim();
  const slug = String(product.slug ?? "").trim() || buildFallbackSlug(product.name, id);

  if (!slug) {
    return id;
  }

  if (!id || slug === id) {
    return slug;
  }

  return `${slug}-${id}`;
}

export function getProductPath(product: Pick<Product, "id" | "slug" | "name">) {
  return `/products/${encodeURIComponent(getProductRouteSegment(product))}`;
}

export function findProductByRouteParam(products: Product[], routeParam: string) {
  const normalizedParam = decodeProductRouteParam(routeParam);

  if (!normalizedParam) {
    return undefined;
  }

  const directMatch = products.find(
    (product) =>
      product.id === normalizedParam ||
      product.slug === normalizedParam ||
      getProductRouteSegment(product) === normalizedParam
  );

  if (directMatch) {
    return directMatch;
  }

  const extractedId = extractTrailingNumericId(normalizedParam);

  if (!extractedId) {
    return undefined;
  }

  return products.find((product) => product.id === extractedId);
}

export const WHATSAPP_NUMBER = siteConfig.contact.whatsappNumber;

export interface CartItem {
  product: Product;
  quantity: number;
}

const sarCurrencyFormatter = new Intl.NumberFormat("ar-SA", {
  style: "currency",
  currency: "SAR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function getNumericProductPrice(
  price: number | null | undefined
): number | null {
  if (typeof price !== "number" || !Number.isFinite(price)) {
    return null;
  }

  return price;
}

export function getProductDiscountPercentage(product: Product): number | null {
  if (!product.offer?.enabled) {
    return null;
  }

  return normalizeDiscountPercentage(product.offer.discountPercentage);
}

export function isProductInOffers(product: Product): boolean {
  return product.category === OFFERS_CATEGORY || getProductDiscountPercentage(product) !== null;
}

export function isProductInCategory(product: Product, category: Category): boolean {
  return category === OFFERS_CATEGORY
    ? isProductInOffers(product)
    : product.category === category;
}

export function getDiscountedProductPrice(product: Product): number | null {
  const numericPrice = getNumericProductPrice(product.price);
  const discountPercentage = getProductDiscountPercentage(product);

  if (numericPrice === null) {
    return null;
  }

  if (discountPercentage === null) {
    return numericPrice;
  }

  return Number((numericPrice * (1 - discountPercentage / 100)).toFixed(2));
}

export function formatProductPrice(price: number | null | undefined): string {
  const numericPrice = getNumericProductPrice(price);

  if (numericPrice === null) {
    return "السعر عند الطلب";
  }

  return sarCurrencyFormatter.format(numericPrice);
}

export function getCartLinePrice(item: CartItem): number | null {
  const unitPrice = getDiscountedProductPrice(item.product);

  if (unitPrice === null) {
    return null;
  }

  return unitPrice * item.quantity;
}

export function getCartPricingSummary(items: CartItem[]) {
  return items.reduce(
    (summary, item) => {
      const linePrice = getCartLinePrice(item);

      if (linePrice === null) {
        summary.unpricedItems += 1;
        return summary;
      }

      summary.pricedItems += 1;
      summary.subtotal += linePrice;
      return summary;
    },
    { subtotal: 0, pricedItems: 0, unpricedItems: 0 }
  );
}

export function getProductWhatsAppMessage(product: Product): string {
  return `مرحباً، أود الاستفسار عن المنتج: ${product.name}`;
}

export function getWhatsAppLink(product: Product): string {
  return getWhatsAppUrl(getProductWhatsAppMessage(product));
}

export function getCartWhatsAppMessage(items: CartItem[]): string | undefined {
  if (items.length === 0) return undefined;
  const lines = items.map(
    (item, idx) =>
      `${idx + 1}. ${item.product.name} × ${item.quantity}`
  );
  return `مرحباً، أود طلب المنتجات التالية من حصانة فيت:\n\n${lines.join("\n")}\n\nشكراً 🌿`;
}

export function getCartWhatsAppLink(items: CartItem[]): string {
  return getWhatsAppUrl(getCartWhatsAppMessage(items));
}

export function isRemoteImageUrl(src: string | null | undefined): boolean {
  return typeof src === "string" && /^https?:\/\//i.test(src);
}

export const products: Product[] = normalizeProducts(seedData as RawProduct[]);
