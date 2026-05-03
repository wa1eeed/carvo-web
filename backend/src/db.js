import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'carvo.db');

// Ensure data directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// --- Schema ---
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title_en TEXT NOT NULL,
    title_ar TEXT,
    category TEXT NOT NULL,
    short_description_en TEXT,
    short_description_ar TEXT,
    long_description_en TEXT,
    long_description_ar TEXT,
    icon_key TEXT,
    cover_image TEXT,
    highlights TEXT,
    process_steps TEXT,
    faq TEXT,
    cta_label_en TEXT DEFAULT 'Request Service',
    cta_label_ar TEXT DEFAULT 'اطلب الخدمة',
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    seo_title TEXT,
    seo_description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS site_content (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ai_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    company_overview TEXT,
    knowledge_base TEXT,
    persona_instructions TEXT,
    primary_language TEXT DEFAULT 'ar',
    accent TEXT DEFAULT 'saudi',
    voice_name TEXT DEFAULT 'Kore',
    chat_mode TEXT DEFAULT 'professional',
    welcome_message_en TEXT,
    welcome_message_ar TEXT,
    enable_voice INTEGER DEFAULT 1,
    enable_chat INTEGER DEFAULT 1,
    model_chat TEXT DEFAULT 'gemini-2.0-flash',
    model_voice TEXT DEFAULT 'gemini-2.0-flash-live-001',
    gemini_api_key TEXT DEFAULT '',
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_en TEXT,
    question_ar TEXT,
    answer_en TEXT,
    answer_ar TEXT,
    category TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    phone TEXT,
    company TEXT,
    service_slug TEXT,
    message TEXT,
    type TEXT DEFAULT 'contact',
    source TEXT,
    status TEXT DEFAULT 'new',
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chat_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    role TEXT,
    content TEXT,
    mode TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// --- Seed defaults if empty ---
const aiRow = db.prepare('SELECT id FROM ai_settings WHERE id = 1').get();
if (!aiRow) {
  db.prepare(`
    INSERT INTO ai_settings (
      id, company_overview, knowledge_base, persona_instructions,
      primary_language, accent, voice_name, chat_mode,
      welcome_message_en, welcome_message_ar
    ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'CARVO is Saudi Arabia\'s premier ecosystem for high-value vehicle recovery, secure storage, and technical asset management. We serve insurance companies, SOS service providers, fleet operators, and individuals across the Kingdom.',
    `CARVO Core Services:
1. Towing & SOS — 24/7 roadside recovery across KSA with flatbed solutions.
2. Estimation — Data-driven vehicle valuation for buying, selling, and insurance.
3. Inspection — 150+ point technical inspection by certified inspectors with digital reports.
4. Repair — Full repair services through certified technical network with genuine parts.
5. Warehousing — Climate-controlled, 24/7 secured storage in Riyadh, Jeddah, Dammam.
6. Selling & Auctions — Maximize vehicle value via verified buyer platform.

Coverage: Riyadh, Jeddah, Dammam, and 15+ national hubs.
Reliability: 99.9% uptime, master-certified technicians.
B2B Partners: Insurance companies, fleet managers, SOS providers.
Contact: 9200 12345 / info@carvo.sa`,
    'You are the CARVO assistant. Be concise, professional, and warm. When users describe vehicle problems, identify the most relevant service and explain next steps. Always offer to dispatch help or capture a callback. Never invent prices — instead, route pricing questions to a human agent.',
    'ar',
    'saudi',
    'Kore',
    'professional',
    'Welcome to CARVO. How can our dispatch team help you today?',
    'حياك الله في كارفو. كيف يقدر فريق الإرسال يساعدك اليوم؟'
  );
}

const settingsKeys = [
  ['hero_video_url', 'https://carvo.sico.sa/gps.mp4'],
  ['hero_eyebrow_en', 'KSA Logistics Active'],
  ['hero_eyebrow_ar', 'منظومة كارفو اللوجستية تعمل'],
  ['hero_title_en', 'PRECISION VEHICLE LOGISTICS FOR THE KINGDOM'],
  ['hero_title_ar', 'لوجستيات السيارات الدقيقة للمملكة'],
  ['hero_subtitle_en', 'Full-stack recovery, inspection, storage and dispatch infrastructure trusted by insurance companies, SOS providers, and fleet operators across Saudi Arabia.'],
  ['hero_subtitle_ar', 'منظومة متكاملة لاسترجاع المركبات والفحص والتخزين والإرسال، موثوقة من شركات التأمين ومزودي خدمات المساعدة على الطريق وأساطيل الشركات في المملكة.'],
  ['phone', '9200 12345'],
  ['email', 'info@carvo.sa'],
  ['address_en', 'Riyadh, Saudi Arabia'],
  ['address_ar', 'الرياض، المملكة العربية السعودية'],
  ['stats_uptime', '99.9'],
  ['stats_hubs', '15'],
  ['stats_partners', '40'],
  ['stats_response_min', '30'],
];

const insertContent = db.prepare('INSERT OR IGNORE INTO site_content (key, value) VALUES (?, ?)');
for (const [k, v] of settingsKeys) insertContent.run(k, v);

// Seed default services if empty
const serviceCount = db.prepare('SELECT COUNT(*) as c FROM services').get().c;
if (serviceCount === 0) {
  const defaultServices = [
    {
      slug: 'towing-sos',
      title_en: 'Towing & SOS',
      title_ar: 'السحب والإنقاذ',
      category: 'SOS',
      short_description_en: '24/7 roadside assistance for any mishap. Our dedicated team gets you back on the road, fast.',
      short_description_ar: 'مساعدة على الطريق ٢٤/٧ لأي طارئ. فريقنا المتخصص يعيدك للطريق بسرعة.',
      long_description_en: 'CARVO operates Saudi Arabia\'s most responsive recovery network. Whether it\'s an insurance claim, a stranded fleet vehicle, or a luxury car after an incident, our flatbed and wheel-lift fleet is dispatched within minutes through our AI-optimized routing system. Insurance partners and SOS providers integrate directly with our dispatch API.',
      long_description_ar: 'تشغّل كارفو شبكة الاستجابة الأسرع في المملكة. سواء كانت مطالبة تأمين، أو مركبة أسطول متعطلة، أو سيارة فاخرة بعد حادث، يتم إرسال أسطولنا خلال دقائق عبر نظام التوجيه الذكي. شركاء التأمين ومزودو الخدمات يتكاملون مباشرة مع واجهة الإرسال.',
      icon_key: 'towing-sos',
      highlights: JSON.stringify(['متاح ٢٤/٧', 'استرجاع طارئ', 'حلول شاحنة مسطحة', 'تكامل مع التأمين']),
      process_steps: JSON.stringify([
        { title: 'Request', desc: 'Customer or insurance partner submits a recovery request via app, portal, or API.' },
        { title: 'Dispatch', desc: 'AI matches the closest qualified operator with the right equipment.' },
        { title: 'Recovery', desc: 'Certified driver arrives, performs safe pickup, and confirms condition with photos.' },
        { title: 'Delivery', desc: 'Vehicle is delivered to the agreed destination with a full digital handover report.' }
      ]),
      sort_order: 1,
    },
    {
      slug: 'estimation',
      title_en: 'Estimation',
      title_ar: 'التقدير',
      category: 'Estimation',
      short_description_en: 'Receive precise, data-driven vehicle estimates for buying, selling, or insurance using advanced algorithms.',
      short_description_ar: 'تقديرات دقيقة مبنية على البيانات للشراء والبيع وأغراض التأمين عبر خوارزميات متقدمة.',
      long_description_en: 'Our estimation engine combines real-time market data, condition reports, and historical transactions to produce defensible valuations. Insurance companies use CARVO estimates for total-loss assessments and salvage decisions.',
      long_description_ar: 'يجمع محرك التقدير لدينا بين بيانات السوق الفورية وتقارير الحالة والمعاملات التاريخية لإنتاج تقييمات موثوقة. شركات التأمين تستخدم تقديرات كارفو لتقييم الخسارة الكلية وقرارات الإنقاذ.',
      icon_key: 'estimation',
      highlights: JSON.stringify(['تسعير مبني على البيانات', 'تقييم فوري', 'دعم شركات التأمين']),
      process_steps: JSON.stringify([
        { title: 'Submit', desc: 'Provide vehicle details and condition data via the portal.' },
        { title: 'Analyze', desc: 'Our engine cross-references market data and prior records.' },
        { title: 'Report', desc: 'Receive a defensible PDF report within minutes.' }
      ]),
      sort_order: 2,
    },
    {
      slug: 'inspection',
      title_en: 'Inspection',
      title_ar: 'الفحص',
      category: 'Inspection',
      short_description_en: 'Meticulous vehicle examination from certified inspectors, complete with a thorough, transparent report.',
      short_description_ar: 'فحص دقيق للمركبة من فاحصين معتمدين مع تقرير شامل وشفاف.',
      long_description_en: 'A 150+ point technical inspection conducted at our facilities or on-site at the customer\'s location. Reports are delivered digitally with high-resolution images and certified findings.',
      long_description_ar: 'فحص تقني يشمل أكثر من ١٥٠ نقطة في منشآتنا أو في موقع العميل. تُسلم التقارير رقمياً مع صور عالية الدقة ونتائج معتمدة.',
      icon_key: 'inspection',
      highlights: JSON.stringify(['فاحصون معتمدون', 'أكثر من ١٥٠ نقطة فحص', 'تقارير رقمية']),
      process_steps: JSON.stringify([
        { title: 'Schedule', desc: 'Pick a slot at our facility or request mobile inspection.' },
        { title: 'Inspect', desc: 'Certified inspector runs the full diagnostic checklist.' },
        { title: 'Report', desc: 'Digital report delivered with images and recommendations.' }
      ]),
      sort_order: 3,
    },
    {
      slug: 'repair',
      title_en: 'Repair',
      title_ar: 'الإصلاح',
      category: 'Repair',
      short_description_en: 'Access certified technicians for top-notch maintenance, from sudden breakdowns to specialized repairs.',
      short_description_ar: 'وصول لشبكة فنيين معتمدين للصيانة عالية الجودة، من الأعطال المفاجئة إلى الإصلاحات المتخصصة.',
      long_description_en: 'CARVO\'s certified repair network covers everything from light mechanical to heavy collision. Insurance partners benefit from streamlined parts-ordering and direct claims integration.',
      long_description_ar: 'تغطي شبكة الإصلاح المعتمدة لدى كارفو كل شيء من الميكانيكي الخفيف إلى التصادمات الثقيلة. شركاء التأمين يستفيدون من تكامل مباشر للمطالبات وطلب القطع.',
      icon_key: 'repair',
      highlights: JSON.stringify(['فنيون معتمدون', 'قطع غيار أصلية', 'إنجاز سريع']),
      process_steps: JSON.stringify([
        { title: 'Diagnose', desc: 'Technicians identify root cause and prepare estimate.' },
        { title: 'Approve', desc: 'You or your insurance partner approves the scope.' },
        { title: 'Repair', desc: 'Repairs executed using genuine parts.' },
        { title: 'Deliver', desc: 'Vehicle returned with a full repair report.' }
      ]),
      sort_order: 4,
    },
    {
      slug: 'warehousing',
      title_en: 'Warehousing',
      title_ar: 'التخزين',
      category: 'Warehousing',
      short_description_en: 'Store your vehicle in our state-of-the-art facilities, prioritizing security, accessibility, and preservation.',
      short_description_ar: 'خزّن مركبتك في منشآتنا المتطورة بأعلى معايير الأمن وسهولة الوصول والحفاظ على الحالة.',
      long_description_en: 'Climate-controlled storage in Riyadh, Jeddah and Dammam. Designed for insurance hold-ups, fleet rotation, and luxury vehicle preservation. Every vehicle is logged, photographed, and tracked.',
      long_description_ar: 'تخزين بمناخ مضبوط في الرياض وجدة والدمام. مصمم لاحتجازات التأمين، وتدوير الأساطيل، والحفاظ على المركبات الفاخرة. كل مركبة تُسجَّل وتُصوَّر ويُتتبع موقعها.',
      icon_key: 'warehousing',
      highlights: JSON.stringify(['تحكم بالمناخ', 'أمن ٢٤/٧', 'خدمة توصيل واستلام']),
      process_steps: JSON.stringify([
        { title: 'Intake', desc: 'Vehicle arrives, is inspected and photographed.' },
        { title: 'Store', desc: 'Assigned a tracked bay in a climate-controlled hall.' },
        { title: 'Retrieve', desc: 'On-demand release with full audit trail.' }
      ]),
      sort_order: 5,
    },
    {
      slug: 'selling-auctions',
      title_en: 'Selling & Auctions',
      title_ar: 'البيع والمزادات',
      category: 'Selling',
      short_description_en: "Maximize your vehicle's value on our user-friendly platform, designed for enthusiasts, individuals, and businesses.",
      short_description_ar: 'حقّق أعلى قيمة لمركبتك على منصتنا سهلة الاستخدام، المصممة للأفراد والشركات والهواة.',
      long_description_en: 'Sell directly or through curated auctions to a verified buyer base. Insurance salvage, fleet retirements and private sales all flow through one secure platform.',
      long_description_ar: 'بِع مباشرة أو عبر مزادات منسقة لقاعدة مشترين موثقين. خردة التأمين وتقاعد الأساطيل والبيع الخاص كلها تمر عبر منصة آمنة واحدة.',
      icon_key: 'selling-auctions',
      highlights: JSON.stringify(['جمهور واسع', 'مشترون موثوقون', 'مدفوعات آمنة']),
      process_steps: JSON.stringify([
        { title: 'List', desc: 'Submit listing and receive valuation.' },
        { title: 'Promote', desc: 'Listing exposed to verified buyer network.' },
        { title: 'Settle', desc: 'Secure transaction and handover.' }
      ]),
      sort_order: 6,
    },
  ];

  const insertSvc = db.prepare(`
    INSERT INTO services (
      slug, title_en, title_ar, category,
      short_description_en, short_description_ar,
      long_description_en, long_description_ar,
      icon_key, highlights, process_steps, sort_order, is_active
    ) VALUES (
      @slug, @title_en, @title_ar, @category,
      @short_description_en, @short_description_ar,
      @long_description_en, @long_description_ar,
      @icon_key, @highlights, @process_steps, @sort_order, 1
    )
  `);
  for (const s of defaultServices) insertSvc.run(s);
}

// Seed default FAQs
const faqCount = db.prepare('SELECT COUNT(*) as c FROM faqs').get().c;
if (faqCount === 0) {
  const defaultFaqs = [
    {
      question_en: 'Do you serve insurance companies and SOS providers?',
      question_ar: 'هل تخدمون شركات التأمين ومزودي خدمات المساعدة على الطريق؟',
      answer_en: 'Yes. CARVO is built for B2B integration. We serve major Saudi insurance companies and SOS providers via direct API and dedicated dispatch desks.',
      answer_ar: 'نعم. كارفو مبنية للتكامل B2B. نخدم كبرى شركات التأمين ومزودي SOS في السعودية عبر واجهة برمجية مباشرة ومكاتب إرسال مخصصة.',
      category: 'B2B', sort_order: 1
    },
    {
      question_en: 'How fast is your average response time?',
      question_ar: 'كم متوسط وقت الاستجابة لديكم؟',
      answer_en: 'Average dispatch arrival is under 30 minutes inside major metros, with 24/7 coverage across 15+ national hubs.',
      answer_ar: 'متوسط الوصول أقل من ٣٠ دقيقة داخل المدن الكبرى، مع تغطية ٢٤/٧ عبر أكثر من ١٥ مركزاً وطنياً.',
      category: 'Operations', sort_order: 2
    },
    {
      question_en: 'Which cities do you cover?',
      question_ar: 'ما هي المدن التي تغطونها؟',
      answer_en: 'Primary hubs in Riyadh, Jeddah, Dammam, and full national reach via partner network.',
      answer_ar: 'مراكز رئيسية في الرياض وجدة والدمام، وتغطية وطنية شاملة عبر شبكة الشركاء.',
      category: 'Coverage', sort_order: 3
    },
    {
      question_en: 'How can I become a partner?',
      question_ar: 'كيف أصبح شريكاً؟',
      answer_en: 'Submit a partnership request via the Partners section. Our B2B team will reach out within one business day.',
      answer_ar: 'قدّم طلب شراكة عبر قسم الشركاء. يتواصل فريق B2B خلال يوم عمل واحد.',
      category: 'Partnership', sort_order: 4
    },
  ];
  const insertFaq = db.prepare(`
    INSERT INTO faqs (question_en, question_ar, answer_en, answer_ar, category, sort_order, is_active)
    VALUES (@question_en, @question_ar, @answer_en, @answer_ar, @category, @sort_order, 1)
  `);
  for (const f of defaultFaqs) insertFaq.run(f);
}

export default db;
