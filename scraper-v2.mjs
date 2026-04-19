import https from 'https';
import { JSDOM } from 'jsdom';
import fs from 'fs';

const BASE_URL = 'https://www.saudi-pharma.net';
const MAIN_PAGE = `${BASE_URL}/ar/division/animal-health`;

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept-Language': 'ar,en;q=0.5' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const loc = res.headers.location.startsWith('http') ? res.headers.location : BASE_URL + res.headers.location;
        return fetchPage(loc).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout: ' + url)); });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Get all product links from the main animal-health page
async function getAllProductLinks() {
  console.log('Fetching main page...');
  const html = await fetchPage(MAIN_PAGE);
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const links = new Set();
  doc.querySelectorAll('a[href*="/ar/product/"]').forEach(a => {
    const href = a.getAttribute('href');
    if (href) {
      const full = href.startsWith('http') ? href : BASE_URL + href;
      links.add(full);
    }
  });
  console.log(`Found ${links.size} unique product links`);
  return [...links];
}

// Extract data from a single product page
function extractProduct(html, url) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // Name from h1
  const h1 = doc.querySelector('h1');
  const name = h1 ? h1.textContent.trim() : null;
  
  // Slug from URL
  const slug = decodeURIComponent(url.split('/product/')[1] || '');

  // DT/DD structured data
  const fields = {};
  const dts = doc.querySelectorAll('dt');
  for (const dt of dts) {
    const label = dt.textContent.trim();
    const dd = dt.nextElementSibling;
    if (dd && dd.tagName === 'DD') {
      const value = dd.textContent.trim();
      if (label.includes('الاسم العام')) fields.genericName = value;
      else if (label.includes('التركيز')) fields.concentration = value;
      else if (label.includes('الفئة العلاجية')) fields.category = value;
      else if (label.includes('الشكل')) fields.form = value;
      else if (label.includes('التعبئة')) fields.packaging = value;
      else if (label.includes('قطاع')) fields.division = value;
    }
  }

  // H3 sections
  const sections = {};
  const h3s = doc.querySelectorAll('h3');
  for (const h3 of h3s) {
    const title = h3.textContent.trim();
    let content = '';
    let sib = h3.nextElementSibling;
    while (sib && !['H2', 'H3'].includes(sib.tagName)) {
      const text = sib.textContent.trim();
      if (text) content += text + '\n';
      sib = sib.nextElementSibling;
    }
    content = content.trim();
    if (content) {
      if (title.includes('دواعي الاستعمال')) sections.indications = content;
      else if (title.includes('الجرعة') || title.includes('طريقة الاستعمال')) sections.dosage = content;
      else if (title.includes('فترة السحب') || title.includes('فترة الانسحاب')) sections.withdrawal = content;
      else if (title.includes('التخزين') || title.includes('ظروف الحفظ')) sections.storage = content;
      else if (title.includes('الوصف') || title.includes('التوصيف')) sections.description = content;
    }
  }

  // Images - unique product images only
  const images = new Set();
  doc.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src') || '';
    if (src.includes('/storage/products/')) {
      const fullSrc = src.startsWith('http') ? src : BASE_URL + src;
      images.add(fullSrc);
    }
  });

  return {
    name,
    slug,
    category: fields.category || null,
    genericName: fields.genericName || null,
    concentration: fields.concentration || null,
    form: fields.form || null,
    packaging: fields.packaging || null,
    indications: sections.indications || null,
    dosage: sections.dosage || null,
    withdrawal: sections.withdrawal || null,
    storage: sections.storage || null,
    description: sections.description || null,
    images: [...images],
  };
}

// Parse dosage text into structured format by animal type
function parseDosageFromText(text) {
  if (!text) return null;

  const animalPatterns = [
    { key: 'دواجن', patterns: ['الدواجن', 'دواجن', 'الطيور', 'طيور', 'الدجاج', 'دجاج'] },
    { key: 'أبقار', patterns: ['الأبقار', 'أبقار', 'العجول', 'عجول', 'المواشي', 'الماشية', 'الأنعام'] },
    { key: 'أغنام', patterns: ['الأغنام', 'أغنام'] },
    { key: 'ماعز', patterns: ['الماعز', 'ماعز'] },
    { key: 'إبل', patterns: ['الإبل', 'إبل', 'الجمال', 'جمال'] },
    { key: 'خيول', patterns: ['الخيول', 'خيول'] },
  ];

  const result = {};
  let found = false;

  for (const animal of animalPatterns) {
    for (const pat of animal.patterns) {
      if (text.includes(pat)) {
        const regex = new RegExp(`(?:${animal.patterns.join('|')})\\s*[:：]?\\s*([^\\n]*(?:\\n(?!(?:${animalPatterns.map(a => a.patterns[0]).join('|')}))[^\\n]*)*)`, 'i');
        const match = text.match(regex);
        if (match && match[1]) {
          const dose = match[1].trim().replace(/\n+/g, ' ').substring(0, 500);
          if (dose) { result[animal.key] = dose; found = true; }
        }
        break;
      }
    }
  }

  return found ? result : text;
}

// Map Arabic generic names to scientific names
function resolveActiveIngredients(genericName, concentration) {
  if (!genericName) return [];
  
  const nameMap = {
    'إنروفلوكساسين': 'Enrofloxacin',
    'أوكسي تتراسكلين هيدروكلوريد': 'Oxytetracycline HCl',
    'أوكسي تتراسكلين': 'Oxytetracycline',
    'أوكسي تتراسايكلين': 'Oxytetracycline',
    'أوكسيتتراسيكلين': 'Oxytetracycline',
    'إيفرمكتين': 'Ivermectin',
    'إفرمكتين': 'Ivermectin',
    'أمبروليوم هيدروكلوريد': 'Amprolium HCl',
    'أمبروليوم': 'Amprolium',
    'تايلوزين طرطرات': 'Tylosin Tartrate',
    'تايلوزين': 'Tylosin',
    'سلفاديميدين الصوديوم': 'Sulfadimidine Sodium',
    'سلفاديميدين': 'Sulfadimidine',
    'سلفاميثازين': 'Sulfamethazine',
    'دوكسي سايكلين هيكليت': 'Doxycycline Hyclate',
    'دوكسي سايكلين': 'Doxycycline',
    'دوكسيسيكلين': 'Doxycycline',
    'فلورفنيكول': 'Florfenicol',
    'فلورفينيكول': 'Florfenicol',
    'ماربوفلوكساسين': 'Marbofloxacin',
    'تيلميكوسين': 'Tilmicosin',
    'تلميكوسين': 'Tilmicosin',
    'كيتوبروفين': 'Ketoprofen',
    'ميلوكسيكام': 'Meloxicam',
    'ديكساميثازون': 'Dexamethasone',
    'ميتاميزول الصوديوم': 'Metamizole Sodium',
    'فينيل بوتازون': 'Phenylbutazone',
    'ليفاميزول هيدروكلوريد': 'Levamisole HCl',
    'ليفاميزول': 'Levamisole',
    'كلوزانتيل': 'Closantel',
    'رافوكسانيد': 'Rafoxanide',
    'ألبيندازول': 'Albendazole',
    'تولترازوريل': 'Toltrazuril',
    'سلفاكلوزين الصوديوم': 'Sulfaclozine Sodium',
    'سلفاكلوزين': 'Sulfaclozine',
    'تراي ميثوبريم': 'Trimethoprim',
    'ترايميثوبريم': 'Trimethoprim',
    'سلفاديازين': 'Sulfadiazine',
    'سيبروفلوكساسين': 'Ciprofloxacin',
    'كوليستين سلفات': 'Colistin Sulfate',
    'كولستين سلفات': 'Colistin Sulfate',
    'كوليستين': 'Colistin',
    'جنتاميسين سلفات': 'Gentamicin Sulfate',
    'جنتاميسين': 'Gentamicin',
    'لينكومايسين': 'Lincomycin',
    'سبكتينومايسين': 'Spectinomycin',
    'نيوميسين سلفات': 'Neomycin Sulfate',
    'نيوميسين': 'Neomycin',
    'فوسفومايسين': 'Fosfomycin',
    'إريثروميسين': 'Erythromycin',
    'سبايراميسين': 'Spiramycin',
    'أموكسيسيلين': 'Amoxicillin',
    'أموكسيسللين': 'Amoxicillin',
    'بنسلين': 'Penicillin',
    'ستربتومايسين': 'Streptomycin',
    'ديكلوفيناك الصوديوم': 'Diclofenac Sodium',
    'ديكلوفيناك': 'Diclofenac',
    'فلونيكسين ميجلومين': 'Flunixin Meglumine',
    'فلونكسين': 'Flunixin',
    'ميترونيدازول': 'Metronidazole',
    'سيلينيوم': 'Selenium',
    'فيتامين أ': 'Vitamin A',
    'فيتامين د3': 'Vitamin D3',
    'فيتامين هـ': 'Vitamin E',
    'فيتامين ك3': 'Vitamin K3',
    'فيتامين سي': 'Vitamin C',
    'أحماض أمينية': 'Amino Acids',
    'معادن': 'Minerals',
    'فيتامينات': 'Vitamins',
    'بيوتين': 'Biotin',
    'بروبيونات الصوديوم': 'Sodium Propionate',
    'مونينسين الصوديوم': 'Monensin Sodium',
    'سالينومايسين الصوديوم': 'Salinomycin Sodium',
    'هالوفوجينون بروميد هيدرات': 'Halofuginone Hydrobromide',
    'هالوفوجينون': 'Halofuginone',
    'كلورتتراسيكلين': 'Chlortetracycline',
  };

  // Handle compound ingredients separated by + or ،
  const parts = genericName.split(/\s*[+]\s*/);
  if (parts.length > 1) {
    return parts.map(part => {
      const trimmed = part.trim();
      const scientific = nameMap[trimmed] || trimmed;
      return { name: scientific, concentration: null };
    });
  }

  // Handle "فيتامينات، معادن، أحماض أمينية" type
  if (genericName.includes('فيتامينات') && genericName.includes('معادن')) {
    return [{ name: 'Vitamins, Minerals, Amino Acids', concentration: concentration || null }];
  }

  // Handle comma-separated compound names
  if (genericName.includes('،') || genericName.includes(',')) {
    const subParts = genericName.split(/[،,]/);
    return subParts.map(part => {
      const trimmed = part.trim();
      const scientific = nameMap[trimmed] || trimmed;
      return { name: scientific, concentration: null };
    });
  }

  const scientific = nameMap[genericName] || genericName;
  return [{ name: scientific, concentration: concentration || null }];
}

// Map Arabic therapeutic category to English ID
function getCategoryId(arabicName) {
  const map = {
    'مضادات الجراثيم': 'antibacterials',
    'طاردات الديدان': 'anthelmintics',
    'مضادات الأكريات (الكوكسيديا)': 'anticoccidials',
    'مضادات الأكريات': 'anticoccidials',
    'مضادات الأوليات': 'antiprotozoals',
    'مضادات الأوالي': 'antiprotozoals',
    'مضادات الالتهاب والمسكنات': 'anti-inflammatory-analgesics',
    'الفيتامينات والمعادن والأحماض الأمينية': 'vitamins-minerals-amino-acids',
    'منتج علفي': 'feed-products',
    'المنتجات العلفية': 'feed-products',
    'منتجات متنوعة': 'miscellaneous',
    'مضادات الطفيليات الخارجية والداخلية': 'antiparasitics',
    'مضادات الطفيليات': 'antiparasitics',
    'مكملات غذائية': 'supplements',
    'مخاليط علفية': 'feed-premixes',
    'مطهرات': 'disinfectants',
  };
  return map[arabicName] || arabicName.toLowerCase().replace(/\s+/g, '-');
}

async function main() {
  try {
    const productUrls = await getAllProductLinks();
    
    console.log(`\nStarting to scrape ${productUrls.length} products...\n`);

    const allProducts = [];
    const allCategories = new Set();
    const errors = [];
    const BATCH = 5;

    for (let i = 0; i < productUrls.length; i += BATCH) {
      const batch = productUrls.slice(i, i + BATCH);
      const end = Math.min(i + BATCH, productUrls.length);
      process.stdout.write(`[${i + 1}-${end}/${productUrls.length}] `);

      const results = await Promise.all(batch.map(async (url) => {
        try {
          const html = await fetchPage(url);
          return extractProduct(html, url);
        } catch (err) {
          errors.push({ url, error: err.message });
          return null;
        }
      }));

      for (const p of results) {
        if (p) {
          allProducts.push(p);
          if (p.category) allCategories.add(p.category);
          process.stdout.write('.');
        } else {
          process.stdout.write('x');
        }
      }
      console.log();

      if (i + BATCH < productUrls.length) {
        await sleep(400);
      }
    }

    console.log(`\nScraped ${allProducts.length} products successfully`);
    if (errors.length) {
      console.log(`${errors.length} errors:`);
      errors.forEach(e => console.log(`  - ${e.url.split('/').pop()}: ${e.error}`));
    }
    console.log('Categories found:', [...allCategories]);

    // Organize products by category
    const categoryMap = {};

    for (const product of allProducts) {
      const catName = product.category || 'منتجات متنوعة';

      if (!categoryMap[catName]) {
        categoryMap[catName] = {
          id: getCategoryId(catName),
          name: catName,
          products: [],
        };
      }

      const activeIngredients = resolveActiveIngredients(product.genericName, product.concentration);

      // Try to parse dosage
      let dosage = product.dosage ? parseDosageFromText(product.dosage) : null;

      // Clean indications - remove {الحيوانات المستهدفة: ...}
      let indications = product.indications || null;
      if (indications) {
        indications = indications.replace(/\{[^}]*\}/g, '').trim();
        // Remove excess whitespace
        indications = indications.replace(/\n{3,}/g, '\n\n').trim();
      }

      // Try to extract withdrawal period from body text
      let withdrawalPeriod = product.withdrawal || null;
      let storageInfo = product.storage || null;

      // Build final product object
      categoryMap[catName].products.push({
        id: product.slug,
        name: product.name,
        slug: product.slug,
        category: catName,
        form: product.form || null,
        variants: product.packaging ? product.packaging.split(/[،,]/).map(s => s.trim()).filter(Boolean) : [],
        manufacturer: 'الشركة السعودية للصناعات الصيدلانية والمستحضرات الطبية',
        active_ingredients: activeIngredients,
        description: product.description || indications || null,
        indications: indications || null,
        dosage: dosage,
        withdrawal_period: withdrawalPeriod,
        storage: storageInfo,
        images: product.images,
      });
    }

    const finalData = {
      categories: Object.values(categoryMap),
    };

    const outputPath = 'saudi-pharma-products.json';
    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2), 'utf8');
    console.log(`\nSaved to ${outputPath}`);
    console.log(`Total categories: ${Object.keys(categoryMap).length}`);
    for (const [catName, cat] of Object.entries(categoryMap)) {
      console.log(`   ${catName}: ${cat.products.length} products`);
    }
    console.log(`Total products: ${allProducts.length}`);

  } catch (err) {
    console.error('Fatal error:', err);
  }
}

main();
