import seedData from "@/data/products.json";
import { getWhatsAppUrl, siteConfig } from "@/lib/site";

export type Category =
  | "antibacterials"
  | "feed-products"
  | "anti-inflammatory-analgesics"
  | "vitamins-minerals-amino-acids"
  | "miscellaneous"
  | "anthelmintics"
  | "anticoccidials"
  | "antiprotozoals";

export interface ActiveIngredient {
  name: string;
  concentration: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: Category;
  categoryName: string;
  price?: number | null;
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

export const CATEGORY_LABELS: Record<Category, string> = {
  antibacterials: "مضادات حيوية",
  "feed-products": "معدات بيطرية",
  "anti-inflammatory-analgesics": "مضادات الالتهاب والمسكنات",
  "vitamins-minerals-amino-acids": "الفيتامينات والمعادن",
  miscellaneous: "منتجات متنوعة",
  anthelmintics: "طاردات الديدان",
  anticoccidials: "مضادات الأكريات",
  antiprotozoals: "مضادات الأوالي",
};

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

export function formatProductPrice(price: number | null | undefined): string {
  const numericPrice = getNumericProductPrice(price);

  if (numericPrice === null) {
    return "السعر عند الطلب";
  }

  return sarCurrencyFormatter.format(numericPrice);
}

export function getCartLinePrice(item: CartItem): number | null {
  const unitPrice = getNumericProductPrice(item.product.price);

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
export const products: Product[] = seedData as Product[];
