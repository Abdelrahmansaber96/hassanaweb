const fs = require("node:fs/promises");
const path = require("node:path");
const { MongoClient } = require("mongodb");

const DEFAULT_SITE_URL = "https://www.hassana-ksa.com";
const DB_NAME = "hassanavet";
const COLLECTION = "products";
const STATIC_PUBLIC_PATHS = ["/", "/products"];
const SITEMAP_BLOCKED_PATHS = ["/dashboard", "/dashboard/*", "/cart"];
const MONGO_CLIENT_OPTIONS = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
  socketTimeoutMS: 10000,
};

function normalizeSiteUrl(value) {
  if (!value) {
    return undefined;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return undefined;
  }

  const candidate = trimmedValue.startsWith("http://") || trimmedValue.startsWith("https://")
    ? trimmedValue
    : `https://${trimmedValue}`;

  try {
    return new URL(candidate).toString().replace(/\/$/, "");
  } catch {
    return undefined;
  }
}

function resolveSiteUrl() {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
    DEFAULT_SITE_URL,
    "http://localhost:3000",
  ];

  for (const candidate of candidates) {
    const normalizedUrl = normalizeSiteUrl(candidate);

    if (normalizedUrl) {
      return normalizedUrl;
    }
  }

  return "http://localhost:3000";
}

function normalizeDate(value) {
  if (!value) {
    return undefined;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate.toISOString();
}

async function readStaticProducts() {
  const filePath = path.join(process.cwd(), "src", "data", "products.json");
  const fileContent = await fs.readFile(filePath, "utf8");
  const parsedProducts = JSON.parse(fileContent);

  return Array.isArray(parsedProducts) ? parsedProducts : [];
}

async function readMongoProducts() {
  if (!process.env.MONGODB_URI) {
    return [];
  }

  const client = new MongoClient(process.env.MONGODB_URI, MONGO_CLIENT_OPTIONS);

  try {
    await client.connect();

    return await client
      .db(DB_NAME)
      .collection(COLLECTION)
      .find({}, { projection: { _id: 0, id: 1, createdAt: 1, updatedAt: 1 } })
      .toArray();
  } catch {
    return [];
  } finally {
    await client.close().catch(() => undefined);
  }
}

async function readProductsForSitemap() {
  const mongoProducts = await readMongoProducts();

  if (mongoProducts.length > 0) {
    return mongoProducts;
  }

  return readStaticProducts();
}

function getPathMetadata(pathname) {
  if (pathname === "/") {
    return { changefreq: "daily", priority: 1 };
  }

  if (pathname === "/products") {
    return { changefreq: "daily", priority: 0.9 };
  }

  if (pathname.startsWith("/products/")) {
    return { changefreq: "weekly", priority: 0.8 };
  }

  return { changefreq: "weekly", priority: 0.7 };
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: resolveSiteUrl(),
  generateRobotsTxt: true,
  changefreq: "weekly",
  priority: 0.7,
  autoLastmod: true,
  exclude: [...SITEMAP_BLOCKED_PATHS, "/products/[id]"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: SITEMAP_BLOCKED_PATHS,
      },
    ],
  },
  transform: async (config, pathname) => {
    if (pathname.includes("[") || pathname.includes("]")) {
      return null;
    }

    const metadata = getPathMetadata(pathname);

    return {
      loc: pathname,
      changefreq: metadata.changefreq,
      priority: metadata.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    };
  },
  additionalPaths: async () => {
    const products = await readProductsForSitemap();
    const seenPaths = new Set();
    const currentTimestamp = new Date().toISOString();

    const publicPageEntries = STATIC_PUBLIC_PATHS.map((pathname) => {
      const metadata = getPathMetadata(pathname);
      seenPaths.add(pathname);

      return {
        loc: pathname,
        changefreq: metadata.changefreq,
        priority: metadata.priority,
        lastmod: currentTimestamp,
      };
    });

    const productEntries = products.flatMap((product) => {
      const productId = typeof product?.id === "string" ? product.id.trim() : "";

      if (!productId) {
        return [];
      }

      const loc = `/products/${encodeURIComponent(productId)}`;

      if (seenPaths.has(loc)) {
        return [];
      }

      seenPaths.add(loc);

      return {
        loc,
        changefreq: "weekly",
        priority: 0.8,
        lastmod:
          normalizeDate(product.updatedAt) ??
          normalizeDate(product.createdAt) ??
          currentTimestamp,
      };
    });

    return [...publicPageEntries, ...productEntries];
  },
};