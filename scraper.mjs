import https from 'https';
import { JSDOM } from 'jsdom';
import fs from 'fs';

const BASE_URL = 'https://www.saudi-pharma.net';
const MAIN_PAGE = `${BASE_URL}/ar/division/animal-health`;

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'ar' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchPage(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function getProductLinks() {
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

function extractProductData(html, url) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // Extract name
  const h1 = doc.querySelector('h1');
  const h2 = doc.querySelector('h2');
  const name = h2 ? h2.textContent.trim() : (h1 ? h1.textContent.trim() : null);

  // Extract slug from URL
  const slug = url.split('/product/')[1] || '';

  // Extract structured data from dt/dd pairs
  const data = {};
  const dtElements = doc.querySelectorAll('dt');
  dtElements.forEach(dt => {
    const label = dt.textContent.trim();
    const dd = dt.nextElementSibling;
    if (dd && dd.tagName === 'DD') {
      const text = dd.textContent.trim();
      if (label.includes('الاسم العام')) data.genericName = text;
      else if (label.includes('التركيز')) data.concentration = text;
      else if (label.includes('الفئة العلاجية')) data.category = text;
      else if (label.includes('الشكل')) data.form = text;
      else if (label.includes('التعبئة')) data.packaging = text;
      else if (label.includes('قطاع')) data.division = text;
    }
  });

  // Extract indications
  let indications = null;
  const h3s = doc.querySelectorAll('h3');
  for (const h3 of h3s) {
    if (h3.textContent.includes('دواعي الاستعمال')) {
      let content = '';
      let sibling = h3.nextElementSibling;
      while (sibling && sibling.tagName !== 'H3' && sibling.tagName !== 'H2') {
        const text = sibling.textContent.trim();
        if (text && !text.includes('الشركة السعودية')) {
          content += text + ' ';
        }
        sibling = sibling.nextElementSibling;
      }
      if (!content) {
        // Try getting text from parent/container
        const parent = h3.parentElement;
        if (parent) {
          const allChildren = parent.children;
          let found = false;
          for (const child of allChildren) {
            if (child === h3) { found = true; continue; }
            if (found && child.tagName !== 'H3') {
              const t = child.textContent.trim();
              if (t && !t.includes('الشركة السعودية')) content += t + ' ';
            }
            if (found && child.tagName === 'H3') break;
          }
        }
      }
      indications = content.trim() || null;
      break;
    }
  }

  // Extract images
  const images = new Set();
  doc.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src') || '';
    if (src.includes('/storage/products/')) {
      const fullSrc = src.startsWith('http') ? src : BASE_URL + src;
      images.add(fullSrc);
    }
  });

  // Extract dosage section
  let dosage = null;
  for (const h3 of h3s) {
    if (h3.textContent.includes('الجرعة') || h3.textContent.includes('طريقة الاستعمال')) {
      let content = '';
      let sibling = h3.nextElementSibling;
      while (sibling && sibling.tagName !== 'H3' && sibling.tagName !== 'H2') {
        const text = sibling.textContent.trim();
        if (text && !text.includes('الشركة السعودية')) content += text + ' ';
        sibling = sibling.nextElementSibling;
      }
      if (content.trim()) dosage = content.trim();
      break;
    }
  }

  // Extract withdrawal period
  let withdrawalPeriod = null;
  for (const h3 of h3s) {
    if (h3.textContent.includes('فترة السحب') || h3.textContent.includes('فترة الانسحاب')) {
      let content = '';
      let sibling = h3.nextElementSibling;
      while (sibling && sibling.tagName !== 'H3' && sibling.tagName !== 'H2') {
        const text = sibling.textContent.trim();
        if (text && !text.includes('الشركة السعودية')) content += text + ' ';
        sibling = sibling.nextElementSibling;
      }
      if (content.trim()) withdrawalPeriod = content.trim();
      break;
    }
  }

  // Extract storage
  let storage = null;
  for (const h3 of h3s) {
    if (h3.textContent.includes('التخزين') || h3.textContent.includes('ظروف الحفظ')) {
      let content = '';
      let sibling = h3.nextElementSibling;
      while (sibling && sibling.tagName !== 'H3' && sibling.tagName !== 'H2') {
        const text = sibling.textContent.trim();
        if (text && !text.includes('الشركة السعودية')) content += text + ' ';
        sibling = sibling.nextElementSibling;
      }
      if (content.trim()) storage = content.trim();
      break;
    }
  }

  // Try to extract from the full page text for sections we might have missed
  const bodyText = doc.body ? doc.body.textContent : '';
  
  // Parse dosage from indications if embedded
  if (!dosage) {
    // Check if dosage info is in the body text
    const dosageMatch = bodyText.match(/الجرعة[:\s]+([\s\S]*?)(?=فترة السحب|التخزين|الحيوانات المستهدفة|$)/);
    if (dosageMatch) dosage = dosageMatch[1].trim().substring(0, 500) || null;
  }

  if (!withdrawalPeriod) {
    const wpMatch = bodyText.match(/فترة السحب[:\s]+([\s\S]*?)(?=التخزين|الحيوانات المستهدفة|$)/);
    if (wpMatch) withdrawalPeriod = wpMatch[1].trim().substring(0, 300) || null;
  }

  if (!storage) {
    const stMatch = bodyText.match(/(?:التخزين|ظروف الحفظ)[:\s]+([\s\S]*?)(?=الحيوانات المستهدفة|$)/);
    if (stMatch) storage = stMatch[1].trim().substring(0, 300) || null;
  }

  return {
    name,
    slug: decodeURIComponent(slug),
    category: data.category || null,
    genericName: data.genericName || null,
    concentration: data.concentration || null,
    form: data.form || null,
    packaging: data.packaging || null,
    indications,
    dosage,
    withdrawalPeriod,
    storage,
    images: [...images]
  };
}

// Map generic names to scientific active ingredient names
function getActiveIngredient(genericName, concentration) {
  if (!genericName) return [];
  
  const nameMap = {
    'إنروفلوكساسين': 'Enrofloxacin',
    'أوكسي تتراسايكلين': 'Oxytetracycline',
    'أوكسي تتراسيكلين هيدروكلوريد': 'Oxytetracycline Hydrochloride',
    'إيفرمكتين': 'Ivermectin',
    'إفرمكتين': 'Ivermectin',
    'أمبروليوم هيدروكلوريد': 'Amprolium Hydrochloride',
    'تايلوزين طرطرات': 'Tylosin Tartrate',
    'تايلوزين': 'Tylosin',
    'ديكلوفيناك الصوديوم': 'Diclofenac Sodium',
    'سلفاديميدين الصوديوم': 'Sulfadimidine Sodium',
    'سلفاديميدين': 'Sulfadimidine',
    'دوكسي سايكلين هيكليت': 'Doxycycline Hyclate',
    'دوكسي سايكلين': 'Doxycycline',
    'فلورفنيكول': 'Florfenicol',
    'ماربوفلوكساسين': 'Marbofloxacin',
    'تيلميكوسين': 'Tilmicosin',
    'كيتوبروفين': 'Ketoprofen',
    'ميلوكسيكام': 'Meloxicam',
    'ديكساميثازون': 'Dexamethasone',
    'ميتاميزول الصوديوم': 'Metamizole Sodium',
    'فينيل بوتازون': 'Phenylbutazone',
    'ليفاميزول هيدروكلوريد': 'Levamisole Hydrochloride',
    'كلوزانتيل': 'Closantel',
    'رافوكسانيد': 'Rafoxanide',
    'ألبيندازول': 'Albendazole',
    'تولترازوريل': 'Toltrazuril',
    'ميترونيدازول': 'Metronidazole',
    'سلفاكلوزين الصوديوم': 'Sulfaclozine Sodium',
    'تراي ميثوبريم + سلفاديازين': 'Trimethoprim + Sulfadiazine',
    'تراي ميثوبريم': 'Trimethoprim',
    'سيبروفلوكساسين': 'Ciprofloxacin',
    'إريثروميسين': 'Erythromycin',
    'كوليستين سلفات': 'Colistin Sulfate',
    'جنتاميسين سلفات': 'Gentamicin Sulfate',
    'لينكومايسين + سبكتينومايسين': 'Lincomycin + Spectinomycin',
    'لينكومايسين': 'Lincomycin',
    'سبكتينومايسين': 'Spectinomycin',
    'سبايراميسين': 'Spiramycin',
    'نيوميسين سلفات': 'Neomycin Sulfate',
    'فوسفومايسين': 'Fosfomycin',
    'سيانوكوبالامين': 'Cyanocobalamin',
    'فيتامين أ': 'Vitamin A',
    'فيتامين د3': 'Vitamin D3',
    'فيتامين هـ': 'Vitamin E',
    'فيتامين ك3': 'Vitamin K3',
    'فيتامين سي': 'Vitamin C',
    'سيلينيوم': 'Selenium',
    'أحماض أمينية': 'Amino Acids',
  };

  const scientificName = nameMap[genericName] || genericName;
  
  return [{
    name: scientificName,
    concentration: concentration || null
  }];
}

// Map Arabic category to English id
function getCategoryId(arabicName) {
  const map = {
    'مضادات الجراثيم': 'antibacterials',
    'طاردات الديدان': 'anthelmintics',
    'مضادات الأكريات (الكوكسيديا)': 'anticoccidials',
    'مضادات الأوليات': 'antiprotozoals',
    'مضادات الالتهاب والمسكنات': 'anti-inflammatory-analgesics',
    'الفيتامينات والمعادن والأحماض الأمينية': 'vitamins-minerals-amino-acids',
    'منتجات متنوعة': 'miscellaneous',
    'المنتجات العلفية': 'feed-products',
  };
  return map[arabicName] || arabicName.toLowerCase().replace(/\s+/g, '-');
}

function parseDosage(dosageText) {
  if (!dosageText) return null;
  
  const result = {};
  const animals = [
    { ar: 'دواجن', patterns: ['الدواجن', 'دواجن', 'الطيور', 'الدجاج'] },
    { ar: 'أبقار', patterns: ['الأبقار', 'أبقار', 'العجول'] },
    { ar: 'أغنام', patterns: ['الأغنام', 'أغنام'] },
    { ar: 'ماعز', patterns: ['الماعز', 'ماعز'] },
    { ar: 'إبل', patterns: ['الجمال', 'جمال', 'الإبل', 'إبل'] },
    { ar: 'خيول', patterns: ['الخيول', 'خيول'] },
  ];

  let hasAnimal = false;
  for (const animal of animals) {
    for (const pattern of animal.patterns) {
      if (dosageText.includes(pattern)) {
        // Try to extract the relevant dosage for this animal
        const regex = new RegExp(`(?:${animal.patterns.join('|')})[:\\s]*([^.]*\\.?)`, 'i');
        const match = dosageText.match(regex);
        if (match) {
          result[animal.ar] = match[1].trim();
          hasAnimal = true;
        }
        break;
      }
    }
  }

  if (!hasAnimal && dosageText.length > 0) {
    return dosageText;
  }

  return Object.keys(result).length > 0 ? result : null;
}

async function main() {
  try {
    const productUrls = await getProductLinks();
    
    const allProducts = [];
    const batchSize = 3;
    
    for (let i = 0; i < productUrls.length; i += batchSize) {
      const batch = productUrls.slice(i, i + batchSize);
      console.log(`Processing ${i + 1}-${Math.min(i + batchSize, productUrls.length)} of ${productUrls.length}...`);
      
      const results = await Promise.all(batch.map(async (url) => {
        try {
          const html = await fetchPage(url);
          return extractProductData(html, url);
        } catch (err) {
          console.error(`Error fetching ${url}: ${err.message}`);
          return null;
        }
      }));
      
      for (const product of results) {
        if (product) allProducts.push(product);
      }
      
      if (i + batchSize < productUrls.length) {
        await sleep(500);
      }
    }

    console.log(`\nTotal products scraped: ${allProducts.length}`);

    // Organize by category
    const categoryMap = {};
    
    for (const product of allProducts) {
      const catName = product.category || 'منتجات متنوعة';
      if (!categoryMap[catName]) {
        categoryMap[catName] = {
          id: getCategoryId(catName),
          name: catName,
          products: []
        };
      }

      const activeIngredients = getActiveIngredient(product.genericName, product.concentration);
      const dosage = parseDosage(product.dosage);

      categoryMap[catName].products.push({
        id: product.slug,
        name: product.name,
        slug: product.slug,
        category: catName,
        form: product.form || null,
        variants: product.packaging ? [product.packaging] : [],
        manufacturer: 'الشركة السعودية للصناعات الصيدلانية',
        active_ingredients: activeIngredients,
        description: product.indications || null,
        indications: product.indications || null,
        dosage: dosage,
        withdrawal_period: product.withdrawalPeriod || null,
        storage: product.storage || null,
        images: product.images
      });
    }

    const finalData = {
      categories: Object.values(categoryMap)
    };

    fs.writeFileSync('saudi-pharma-products.json', JSON.stringify(finalData, null, 2), 'utf8');
    console.log('\nJSON file saved as saudi-pharma-products.json');
    console.log(`Categories: ${Object.keys(categoryMap).length}`);
    for (const [name, cat] of Object.entries(categoryMap)) {
      console.log(`  ${name}: ${cat.products.length} products`);
    }
    
  } catch (err) {
    console.error('Fatal error:', err);
  }
}

main();
