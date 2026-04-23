export interface WhatsAppContact {
  label: string;
  number: string;
}

const DEFAULT_SITE_URL = "https://www.hassana-ksa.com";

function normalizePhoneNumber(value: string) {
  return value.replace(/\D/g, "");
}

function parseWhatsAppContacts(value?: string) {
  if (!value) {
    return [] as WhatsAppContact[];
  }

  return value
    .split(",")
    .map((entry, index) => {
      const trimmedEntry = entry.trim();

      if (!trimmedEntry) {
        return null;
      }

      const separatorIndex = trimmedEntry.lastIndexOf(":");
      const rawLabel = separatorIndex === -1
        ? `واتساب ${index + 1}`
        : trimmedEntry.slice(0, separatorIndex).trim() || `واتساب ${index + 1}`;
      const rawNumber = separatorIndex === -1
        ? trimmedEntry
        : trimmedEntry.slice(separatorIndex + 1).trim();
      const normalizedNumber = normalizePhoneNumber(rawNumber);

      if (!normalizedNumber) {
        return null;
      }

      return {
        label: rawLabel,
        number: normalizedNumber,
      } satisfies WhatsAppContact;
    })
    .filter((contact): contact is WhatsAppContact => Boolean(contact));
}

const configuredWhatsAppContacts = parseWhatsAppContacts(
  process.env.NEXT_PUBLIC_WHATSAPP_CONTACTS
);

const whatsappContacts = configuredWhatsAppContacts.length > 0
  ? configuredWhatsAppContacts
  : [
      {
        label: "الطلبات الرئيسية",
        number: "+966502343985",
      },
    ];

function buildWhatsAppHref(number: string, message?: string) {
  const baseHref = `https://wa.me/${number}`;

  if (!message) {
    return baseHref;
  }

  return `${baseHref}?text=${encodeURIComponent(message)}`;
}

const primaryWhatsAppContact = whatsappContacts[0];

export const siteConfig = {
  name: "حصانة فيت",
  tagline: "صيدلية بيطرية",
  summary:
    "أدوية بيطرية ومكملات ومعدات بيطرية موثوقة لرعاية الماشية داخل المملكة.",
  description:
    "صيدلية بيطرية - حصانة فيت تقدم أدوية بيطرية موثوقة، فيتامينات، ومستلزمات المواشي مع توصيل سريع ودعم فني 24/24.",
  keywords: [
    "حصانة فيت",
    "صيدلية بيطرية",
    "أدوية بيطرية",
    "معدات بيطرية",
    "مضادات حيوية",
    "مكملات بيطرية",
    "رعاية الماشية",
    "الأغنام والإبل",
    "السعودية",
  ],
  locale: "ar_SA",
  contact: {
    whatsappContacts,
    whatsappNumber: primaryWhatsAppContact.number,
    whatsappHref: buildWhatsAppHref(primaryWhatsAppContact.number),
    phoneDisplay: "+966 50 234 3985",
    phoneHref: "tel:+966502343985",
    email: "info@hassanavet.com",
    emailHref: "mailto:info@hassanavet.com",
    address: "حائل، المملكة العربية السعودية",
  },
} as const;

export function getConfiguredSiteUrl() {
  const candidates = [process.env.NEXT_PUBLIC_SITE_URL, DEFAULT_SITE_URL];

  for (const candidate of candidates) {
    const configuredUrl = candidate?.trim();

    if (!configuredUrl) {
      continue;
    }

    try {
      return new URL(configuredUrl);
    } catch {
      continue;
    }
  }

  return undefined;
}

export function getWhatsAppUrl(message?: string) {
  return buildWhatsAppHref(siteConfig.contact.whatsappNumber, message);
}

export function getWhatsAppTargets(message?: string) {
  return siteConfig.contact.whatsappContacts.map((contact) => ({
    ...contact,
    href: buildWhatsAppHref(contact.number, message),
  }));
}