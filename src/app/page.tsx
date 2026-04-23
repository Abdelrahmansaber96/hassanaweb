import HomePageClient from "@/components/HomePageClient";
import { CATEGORY_ORDER, isProductInCategory, isProductInOffers, type Category } from "@/lib/products";
import { readProductsWithFallback } from "@/lib/products-server";

function shuffleProducts<T>(products: T[]) {
  const shuffledProducts = [...products];

  for (let index = shuffledProducts.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [shuffledProducts[index], shuffledProducts[randomIndex]] = [
      shuffledProducts[randomIndex],
      shuffledProducts[index],
    ];
  }

  return shuffledProducts;
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await readProductsWithFallback();
  const randomizedProducts = shuffleProducts(products);
  const offerProducts = shuffleProducts(
    products.filter((product) => isProductInOffers(product))
  ).slice(0, 8);
  const nonOfferProducts = randomizedProducts.filter(
    (product) => !isProductInOffers(product)
  );
  const primaryHomeProducts =
    nonOfferProducts.length > 0 ? nonOfferProducts : randomizedProducts;

  const categoryCounts = CATEGORY_ORDER.map((category) => ({
    category,
    count: products.filter((product) => isProductInCategory(product, category)).length,
  }));

  return (
    <HomePageClient
      productCount={products.length}
      categoryCounts={categoryCounts}
      offerProducts={offerProducts}
      showcaseProducts={primaryHomeProducts.slice(0, 8)}
      moreProducts={primaryHomeProducts.slice(8, 16)}
    />
  );
}

