(() => {
  "use strict";

  const storage = {
    get(key, fallback) {
      try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch { /* Local storage may be disabled. */ }
    }
  };

  const copy = {
    en: {
      illustrative: "Illustrative workspace",
      stored: "Draft saved locally. No information was sent.",
      themeDark: "Switch to dark mode",
      themeLight: "Switch to light mode",
      openMenu: "Open menu",
      closeMenu: "Close menu"
    },
    ar: {
      illustrative: "مساحة عمل توضيحية",
      stored: "حُفظت المسودة محليًا. لم تُرسل أي معلومات.",
      themeDark: "التبديل إلى الوضع الداكن",
      themeLight: "التبديل إلى الوضع الفاتح",
      openMenu: "فتح القائمة",
      closeMenu: "إغلاق القائمة"
    }
  };

  const groups = [
    { id: "core", en: "Core workspace", ar: "مساحة العمل الأساسية" },
    { id: "trade", en: "Trade operations", ar: "عمليات التجارة" },
    { id: "relationships", en: "Relationships", ar: "العلاقات" },
    { id: "tools", en: "My tools", ar: "أدواتي" },
    { id: "intelligence", en: "Market intelligence", ar: "معلومات السوق" },
    { id: "evidence", en: "Sources & evidence", ar: "المصادر والأدلة" },
    { id: "analysis", en: "Analysis", ar: "التحليل" }
  ];

  const modules = [
    {
      id: "overview", group: "core", icon: "⌂", en: "Home dashboard", ar: "الصفحة الرئيسية",
      descEn: "A decision-ready view of today’s operational priorities.", descAr: "عرض جاهز للقرار يوضح أولويات التشغيل اليوم.",
      kpis: [["Open actions", "18", "+4 today", "الإجراءات المفتوحة", "+4 اليوم"], ["Active contracts", "12", "8 purchase · 4 sales", "العقود النشطة", "8 شراء · 4 بيع"], ["Shipments moving", "7", "2 need attention", "الشحنات المتحركة", "2 تحتاج متابعة"], ["Evidence coverage", "86%", "reviewed records", "تغطية الأدلة", "سجلات مراجعة"]],
      panelEn: "Operating pulse", panelAr: "نبض العمليات", sideEn: "Priority queue", sideAr: "قائمة الأولويات",
      rows: [["!", "Document review", "Contract evidence due", "Today", "مراجعة مستند", "دليل العقد مستحق", "اليوم"], ["↗", "Customer shipment", "ETA update requested", "Open", "شحنة عميل", "تحديث الوصول مطلوب", "مفتوح"], ["✓", "Price source", "Daily settlement verified", "Ready", "مصدر سعر", "تم التحقق من التسوية اليومية", "جاهز"]]
    },
    {
      id: "products", group: "core", icon: "◇", en: "Products", ar: "المنتجات",
      descEn: "Track the products, grades, origins, and market context that matter to the company.", descAr: "تابع المنتجات والدرجات والمناشئ وسياق السوق المهم للشركة.",
      kpis: [["Tracked products", "14", "9 active", "المنتجات المتابعة", "9 نشطة"], ["Price series", "31", "7 updated today", "سلاسل الأسعار", "7 محدثة اليوم"], ["Origins", "11", "verified labels", "المناشئ", "تسميات موثقة"], ["Reports", "24", "6 this week", "التقارير", "6 هذا الأسبوع"]],
      panelEn: "Product activity", panelAr: "نشاط المنتجات", sideEn: "Recently reviewed", sideAr: "تمت مراجعتها مؤخرًا",
      rows: [["BP", "Black pepper", "Vietnam · 550 MC", "Current", "فلفل أسود", "فيتنام · 550 MC", "حالي"], ["CW", "Cassia whole", "Vietnam · grade A", "Review", "قرفة كاسيا", "فيتنام · درجة A", "مراجعة"], ["WW", "Walnut", "China · crop 2026", "Current", "جوز", "الصين · محصول 2026", "حالي"]]
    },
    {
      id: "business", group: "trade", icon: "▣", en: "My Business", ar: "أعمالي",
      descEn: "A structured view of company commitments, exposure, and commercial performance.", descAr: "عرض منظم لالتزامات الشركة وانكشافها وأدائها التجاري.",
      kpis: [["Committed value", "$428K", "across active deals", "القيمة الملتزم بها", "ضمن الصفقات النشطة"], ["Purchase exposure", "$271K", "8 contracts", "انكشاف الشراء", "8 عقود"], ["Sales exposure", "$157K", "4 contracts", "انكشاف البيع", "4 عقود"], ["Gross margin", "8.4%", "recorded deals", "الهامش الإجمالي", "الصفقات المسجلة"]],
      panelEn: "Commercial balance", panelAr: "التوازن التجاري", sideEn: "Business signals", sideAr: "إشارات الأعمال",
      rows: [["$", "Purchase position", "Two arrivals this month", "Tracked", "مركز الشراء", "وصول شحنتين هذا الشهر", "متابع"], ["↗", "Sales allocation", "61% assigned", "Active", "تخصيص المبيعات", "61% مخصص", "نشط"], ["◎", "Margin review", "One exception flagged", "Review", "مراجعة الهامش", "استثناء واحد", "مراجعة"]]
    },
    {
      id: "orders", group: "trade", icon: "▤", en: "Orders", ar: "الطلبات",
      descEn: "Move requests from intent to confirmed, traceable commercial work.", descAr: "حوّل الطلبات من النية إلى عمل تجاري مؤكد وقابل للتتبع.",
      kpis: [["New", "6", "awaiting review", "جديدة", "بانتظار المراجعة"], ["In progress", "9", "across 4 products", "قيد التنفيذ", "ضمن 4 منتجات"], ["Confirmed", "22", "this quarter", "مؤكدة", "هذا الربع"], ["Exceptions", "2", "need a decision", "الاستثناءات", "تحتاج قرارًا"]],
      panelEn: "Order flow", panelAr: "تدفق الطلبات", sideEn: "Latest orders", sideAr: "أحدث الطلبات",
      rows: [["01", "ORD-2618", "Black pepper · 18 MT", "Confirmed", "ORD-2618", "فلفل أسود · 18 طن", "مؤكد"], ["02", "ORD-2619", "Cassia · 9 MT", "Review", "ORD-2619", "كاسيا · 9 طن", "مراجعة"], ["03", "ORD-2620", "Walnut · 24 MT", "New", "ORD-2620", "جوز · 24 طن", "جديد"]]
    },
    {
      id: "my-work", group: "trade", icon: "✓", en: "My Work", ar: "أعمالي اليومية",
      descEn: "A focused queue for responsibilities, deadlines, and follow-up.", descAr: "قائمة مركزة للمسؤوليات والمواعيد والمتابعة.",
      kpis: [["Due today", "7", "3 high priority", "مستحق اليوم", "3 عالية الأولوية"], ["This week", "21", "across 5 teams", "هذا الأسبوع", "ضمن 5 فرق"], ["Completed", "38", "last 30 days", "مكتملة", "آخر 30 يومًا"], ["Blocked", "3", "waiting on evidence", "متوقفة", "بانتظار دليل"]],
      panelEn: "Completion cadence", panelAr: "وتيرة الإنجاز", sideEn: "Today’s queue", sideAr: "قائمة اليوم",
      rows: [["A", "Confirm freight quote", "Shipment SH-048", "Today", "تأكيد عرض الشحن", "الشحنة SH-048", "اليوم"], ["B", "Review signed contract", "Contract PC-118", "Today", "مراجعة العقد الموقع", "العقد PC-118", "اليوم"], ["C", "Approve supplier evidence", "Offer 46722661712", "Next", "اعتماد دليل المورد", "العرض 46722661712", "التالي"]]
    },
    {
      id: "contracts", group: "trade", icon: "▧", en: "Contracts", ar: "العقود",
      descEn: "Keep purchase and sales terms, signed documents, and fulfillment state together.", descAr: "اجمع شروط الشراء والبيع والمستندات الموقعة وحالة التنفيذ معًا.",
      kpis: [["Purchase contracts", "8", "$271K value", "عقود الشراء", "بقيمة 271 ألف$"], ["Sales contracts", "4", "$157K value", "عقود البيع", "بقيمة 157 ألف$"], ["Signed", "10", "2 awaiting signature", "موقعة", "2 بانتظار التوقيع"], ["Fulfilled", "67%", "by contracted quantity", "منفذة", "حسب الكمية المتعاقدة"]],
      panelEn: "Contracted value", panelAr: "قيمة العقود", sideEn: "Contract register", sideAr: "سجل العقود",
      rows: [["P", "PC-118", "Vietnam pepper · purchase", "Signed", "PC-118", "فلفل فيتنام · شراء", "موقع"], ["S", "SC-072", "Cassia · sale", "Active", "SC-072", "كاسيا · بيع", "نشط"], ["P", "PC-119", "Walnut · purchase", "Review", "PC-119", "جوز · شراء", "مراجعة"]]
    },
    {
      id: "shipments", group: "trade", icon: "⇧", en: "Shipments", ar: "الشحنات",
      descEn: "Manage both incoming shipments and customer shipments without mixing their records.", descAr: "أدر الشحنات الواردة وشحنات العملاء دون خلط سجلاتهما.",
      kpis: [["Incoming", "5", "3 vessels", "واردة", "3 سفن"], ["Customer shipments", "2", "goods sold and moving", "شحنات العملاء", "بضائع مباعة ومتحركة"], ["Arriving soon", "3", "within 14 days", "تصل قريبًا", "خلال 14 يومًا"], ["Documents due", "4", "before clearance", "مستندات مطلوبة", "قبل التخليص"]],
      panelEn: "Shipment timeline", panelAr: "الخط الزمني للشحنات", sideEn: "Movement register", sideAr: "سجل الحركة",
      rows: [["IN", "SH-048 · Incoming", "ETA 22 Oct · Mersin", "On track", "SH-048 · واردة", "الوصول 22 أكتوبر · مرسين", "منتظمة"], ["CU", "CS-014 · Customer", "9 MT sold · in transit", "Moving", "CS-014 · عميل", "9 طن مباعة · ترانزيت", "متحركة"], ["IN", "SH-049 · Incoming", "Docs under review", "Review", "SH-049 · واردة", "المستندات قيد المراجعة", "مراجعة"]]
    },
    {
      id: "supplier-reviews", group: "trade", icon: "◉", en: "Supplier reviews", ar: "مراجعات الموردين",
      descEn: "Review supplier offers, source material, approvals, and registration readiness.", descAr: "راجع عروض الموردين والمواد المصدرية والاعتمادات وجاهزية التسجيل.",
      kpis: [["Offers", "17", "from 8 suppliers", "العروض", "من 8 موردين"], ["Needs review", "5", "new evidence", "تحتاج مراجعة", "أدلة جديدة"], ["Confirmed", "9", "comparison eligible", "مؤكدة", "صالحة للمقارنة"], ["Rejected", "3", "reasons recorded", "مرفوضة", "الأسباب مسجلة"]],
      panelEn: "Offer comparison", panelAr: "مقارنة العروض", sideEn: "Review queue", sideAr: "قائمة المراجعة",
      rows: [["VN", "Alyeraf", "Pepper · USD 5,700/MT", "Review", "أليراف", "فلفل · 5,700 دولار/طن", "مراجعة"], ["CN", "Eastern Foods", "Walnut · FOB", "Confirmed", "إيسترن فودز", "جوز · FOB", "مؤكد"], ["ID", "Spice Origin", "Clove · CIF", "Review", "سبايس أوريجن", "قرنفل · CIF", "مراجعة"]]
    },
    {
      id: "operation-room", group: "trade", icon: "◎", en: "Operation Room", ar: "غرفة العمليات",
      descEn: "Coordinate milestones, exceptions, and the append-only history of each operation.", descAr: "نسّق المراحل والاستثناءات والتاريخ التراكمي لكل عملية.",
      kpis: [["Readiness", "82%", "recorded fields", "الجاهزية", "الحقول المسجلة"], ["Milestones", "14", "next 30 days", "المراحل", "خلال 30 يومًا"], ["Exceptions", "3", "owners assigned", "الاستثناءات", "تم تعيين المسؤولين"], ["Audit events", "126", "this quarter", "أحداث التدقيق", "هذا الربع"]],
      panelEn: "Operational readiness", panelAr: "الجاهزية التشغيلية", sideEn: "Active exceptions", sideAr: "الاستثناءات النشطة",
      rows: [["!", "Bill of lading", "Original not recorded", "Owner", "بوليصة الشحن", "الأصل غير مسجل", "مسؤول"], ["↻", "ETA correction", "Source retained", "Logged", "تصحيح الوصول", "تم حفظ المصدر", "مسجل"], ["✓", "Booking", "Carrier reference verified", "Ready", "الحجز", "مرجع الناقل موثق", "جاهز"]]
    },
    {
      id: "customers", group: "relationships", icon: "♙", en: "Customers", ar: "العملاء",
      descEn: "Manage accounts, access, payment policies, and commercial context at scale.", descAr: "أدر الحسابات والوصول وسياسات الدفع والسياق التجاري على نطاق واسع.",
      kpis: [["Active", "48", "approved accounts", "نشطة", "حسابات معتمدة"], ["Pending", "6", "activation required", "معلقة", "تحتاج تفعيلًا"], ["No deposit", "9", "approved policy", "دون عربون", "سياسة معتمدة"], ["Follow-ups", "12", "this week", "متابعات", "هذا الأسبوع"]],
      panelEn: "Customer activity", panelAr: "نشاط العملاء", sideEn: "Account directory", sideAr: "دليل الحسابات",
      rows: [["AH", "Ahmed Trading", "Customer direct · 10%", "Active", "أحمد للتجارة", "العميل مباشرة · 10%", "نشط"], ["RG", "Rosemary GmbH", "Third-party payer", "Pending", "روز ماري", "دافع طرف ثالث", "معلق"], ["AT", "Atlas Markets", "No deposit required", "Active", "أسواق أطلس", "لا يتطلب عربونًا", "نشط"]]
    },
    {
      id: "documents", group: "tools", icon: "▱", en: "Documents & OCR", ar: "المستندات والاستخراج",
      descEn: "Extract structured facts from documents and route them through human review.", descAr: "استخرج حقائق منظمة من المستندات ومررها عبر مراجعة بشرية.",
      kpis: [["Processed", "236", "documents", "تمت معالجتها", "مستندًا"], ["To review", "11", "uncertain fields", "للمراجعة", "حقول غير مؤكدة"], ["Linked", "91%", "to records", "مرتبطة", "بالسجلات"], ["Pages", "1,482", "searchable", "الصفحات", "قابلة للبحث"]],
      panelEn: "Document throughput", panelAr: "معالجة المستندات", sideEn: "Extraction queue", sideAr: "قائمة الاستخراج",
      rows: [["PDF", "Signed contract", "12 fields extracted", "Review", "عقد موقع", "12 حقلًا مستخرجًا", "مراجعة"], ["BL", "Bill of lading", "Shipment matched", "Linked", "بوليصة شحن", "تمت مطابقة الشحنة", "مرتبط"], ["INV", "Commercial invoice", "Total needs confirmation", "Review", "فاتورة تجارية", "المجموع يحتاج تأكيدًا", "مراجعة"]]
    },
    {
      id: "market-intelligence", group: "intelligence", icon: "⌁", en: "Market intelligence", ar: "معلومات السوق",
      descEn: "Bring prices, reports, harvests, weather, freight, and news into an evidence-aware view.", descAr: "اجمع الأسعار والتقارير والمحاصيل والطقس والشحن والأخبار في عرض واعٍ بالأدلة.",
      kpis: [["Price updates", "38", "today", "تحديثات الأسعار", "اليوم"], ["Market reports", "12", "this week", "تقارير السوق", "هذا الأسبوع"], ["Sources", "27", "monitored", "المصادر", "تحت المراقبة"], ["Alerts", "5", "material changes", "التنبيهات", "تغييرات جوهرية"]],
      panelEn: "Market movement", panelAr: "حركة السوق", sideEn: "Latest intelligence", sideAr: "أحدث المعلومات",
      rows: [["P", "Black pepper", "Reference price updated", "Current", "فلفل أسود", "تم تحديث السعر المرجعي", "حالي"], ["W", "Weather signal", "Harvest region rainfall", "Watch", "إشارة الطقس", "أمطار منطقة الحصاد", "مراقبة"], ["F", "Freight lane", "Mersin route changed", "Review", "خط الشحن", "تغير مسار مرسين", "مراجعة"]]
    },
    {
      id: "sources-evidence", group: "evidence", icon: "◇", en: "Sources & evidence", ar: "المصادر والأدلة",
      descEn: "Connect every material claim to a visible source, review state, and correction history.", descAr: "اربط كل ادعاء جوهري بمصدر واضح وحالة مراجعة وسجل تصحيحات.",
      kpis: [["Sources", "84", "registered", "المصادر", "مسجلة"], ["Claims", "319", "mapped", "الادعاءات", "مرتبطة"], ["Conflicts", "7", "open", "التعارضات", "مفتوحة"], ["Coverage", "88%", "priority records", "التغطية", "السجلات المهمة"]],
      panelEn: "Evidence coverage", panelAr: "تغطية الأدلة", sideEn: "Evidence review", sideAr: "مراجعة الأدلة",
      rows: [["S", "Settlement source", "Exact contract mapped", "Verified", "مصدر التسوية", "تم ربط العقد المحدد", "موثق"], ["C", "Conflicting ETA", "Two sources retained", "Review", "تعارض الوصول", "تم حفظ مصدرين", "مراجعة"], ["D", "Document hash", "Original preserved", "Verified", "بصمة المستند", "تم حفظ الأصل", "موثق"]]
    },
    {
      id: "analysis", group: "analysis", icon: "⌘", en: "AI analysis", ar: "التحليل الذكي",
      descEn: "Use structured records and evidence to support review—not to invent missing operational facts.", descAr: "استخدم السجلات المنظمة والأدلة لدعم المراجعة، لا لاختلاق حقائق تشغيلية ناقصة.",
      kpis: [["Analyses", "19", "saved this month", "التحليلات", "محفوظة هذا الشهر"], ["Evidence-linked", "94%", "of outputs", "مرتبطة بأدلة", "من النتائج"], ["Needs review", "4", "human decision", "تحتاج مراجعة", "قرار بشري"], ["Benchmarks", "8", "validated", "المعايير", "تم التحقق منها"]],
      panelEn: "Analysis activity", panelAr: "نشاط التحليل", sideEn: "Review-ready outputs", sideAr: "نتائج جاهزة للمراجعة",
      rows: [["AI", "Price variance", "3 sources cited", "Review", "تباين السعر", "3 مصادر موثقة", "مراجعة"], ["AI", "Shipment risk", "Missing fact disclosed", "Ready", "مخاطر الشحنة", "تم إظهار المعلومة الناقصة", "جاهز"], ["AI", "Supplier comparison", "Basis normalized", "Ready", "مقارنة الموردين", "تم توحيد الأساس", "جاهز"]]
    }
  ];

  const els = {
    html: document.documentElement,
    language: document.getElementById("language-toggle"),
    theme: document.getElementById("theme-toggle"),
    mobileButton: document.getElementById("mobile-menu-button"),
    mobileMenu: document.getElementById("mobile-menu"),
    moduleNav: document.getElementById("module-nav"),
    tourControls: document.getElementById("tour-controls"),
    currentView: document.getElementById("current-view"),
    content: document.getElementById("dashboard-content"),
    dialog: document.getElementById("demo-dialog"),
    form: document.getElementById("demo-form"),
    formStatus: document.getElementById("form-status"),
    promotionBanner: document.getElementById("promotion-banner"),
    promotionBadge: document.getElementById("promotion-badge"),
    promotionTitle: document.getElementById("promotion-title"),
    promotionDescription: document.getElementById("promotion-description"),
    promotionDates: document.getElementById("promotion-dates"),
    setupPrice: document.getElementById("full-setup-price"),
    setupPriceOriginal: document.getElementById("full-setup-price-original"),
    annualPrice: document.getElementById("full-annual-price"),
    monthlyPrice: document.getElementById("full-monthly-price")
  };

  let locale = storage.get("nazrah-public-locale", "en") === "ar" ? "ar" : "en";
  let activeModule = "overview";
  let websiteSettings = null;

  function tx(en, ar) { return locale === "ar" ? ar : en; }

  function applyLocale() {
    els.html.lang = locale;
    els.html.dir = locale === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-en][data-ar]").forEach(node => {
      node.textContent = node.dataset[locale];
    });
    els.language.textContent = locale === "en" ? "العربية" : "English";
    storage.set("nazrah-public-locale", locale);
    renderNavigation();
    renderModule(activeModule);
    renderWebsiteSettings();
    if (els.formStatus.textContent) els.formStatus.textContent = copy[locale].stored;
  }

  function formatUsd(cents) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(cents / 100);
  }

  function formatMonthlyUsd(annualFeeCents) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(annualFeeCents / 1_200);
  }

  function localizedValue(value, fallback = "") {
    if (!value || typeof value !== "object") return fallback;
    const selected = value[locale];
    return typeof selected === "string" ? selected : fallback;
  }

  function renderWebsiteSettings() {
    if (!websiteSettings) return;
    const setupFeeCents = Number(websiteSettings.setupFeeCents);
    const annualFeeCents = Number(websiteSettings.annualFeeCents);
    if (!Number.isSafeInteger(setupFeeCents) || setupFeeCents < 0) return;
    if (!Number.isSafeInteger(annualFeeCents) || annualFeeCents < 0) return;

    const promotion = websiteSettings.promotion && typeof websiteSettings.promotion === "object"
      ? websiteSettings.promotion
      : null;
    const promotionPrice = Number(promotion?.setupFeeCents);
    const promotionActive = promotion?.active === true
      && Number.isSafeInteger(promotionPrice)
      && promotionPrice >= 0
      && promotionPrice < setupFeeCents;

    els.setupPrice.textContent = formatUsd(promotionActive ? promotionPrice : setupFeeCents);
    els.annualPrice.textContent = formatUsd(annualFeeCents);
    els.monthlyPrice.textContent = formatMonthlyUsd(annualFeeCents);
    els.setupPriceOriginal.hidden = !promotionActive;
    els.setupPriceOriginal.textContent = promotionActive ? formatUsd(setupFeeCents) : "";
    els.promotionBanner.hidden = !promotionActive;
    if (!promotionActive) return;

    els.promotionBadge.textContent = localizedValue(promotion.badge, tx("LIMITED OFFER", "عرض محدود"));
    els.promotionTitle.textContent = localizedValue(promotion.title);
    els.promotionDescription.textContent = localizedValue(promotion.description);
    const start = typeof promotion.startsOn === "string" ? promotion.startsOn : "";
    const end = typeof promotion.endsOn === "string" ? promotion.endsOn : "";
    els.promotionDates.textContent = start && end
      ? tx(`${start} to ${end}`, `${start} إلى ${end}`)
      : end
        ? tx(`Until ${end}`, `حتى ${end}`)
        : start
          ? tx(`From ${start}`, `من ${start}`)
          : "";
  }

  async function loadWebsiteSettings() {
    const localPreview = location.hostname === "127.0.0.1" || location.hostname === "localhost";
    const url = localPreview
      ? "http://127.0.0.1:3013/api/public/website-settings"
      : els.html.dataset.websiteSettingsUrl;
    if (!url) return;
    try {
      const response = await fetch(url, { credentials: "omit", headers: { Accept: "application/json" } });
      if (!response.ok) return;
      websiteSettings = await response.json();
      renderWebsiteSettings();
    } catch {
      // The bundled public price remains visible when the dashboard API is unavailable.
    }
  }

  function applyTheme(theme) {
    const dark = theme === "dark";
    els.html.classList.toggle("dark", dark);
    els.theme.setAttribute("aria-label", dark ? copy[locale].themeLight : copy[locale].themeDark);
    storage.set("nazrah-public-theme", dark ? "dark" : "light");
  }

  function renderNavigation() {
    els.moduleNav.innerHTML = groups.map(group => {
      const items = modules.filter(module => module.group === group.id);
      return `<div class="module-group-label">${tx(group.en, group.ar)}</div>${items.map(module => `
        <button type="button" data-module="${module.id}" class="${module.id === activeModule ? "active" : ""}" aria-pressed="${module.id === activeModule}" title="${tx("Preview this section", "معاينة هذا القسم")}">
          <span aria-hidden="true">${module.icon}</span><span>${tx(module.en, module.ar)}</span>
        </button>`).join("")}`;
    }).join("");

    els.tourControls.innerHTML = groups.map(group => {
      const first = modules.find(module => module.group === group.id);
      const current = modules.find(module => module.id === activeModule);
      return `<button type="button" data-group="${group.id}" data-module="${first.id}" class="${current.group === group.id ? "active" : ""}">${tx(group.en, group.ar)}</button>`;
    }).join("");
  }

  function renderModule(moduleId) {
    const module = modules.find(item => item.id === moduleId) || modules[0];
    activeModule = module.id;
    els.currentView.textContent = tx(module.en, module.ar);

    const bars = [38, 58, 44, 76, 63, 88, 72, 94, 81, 100];
    const kpis = module.kpis.map(item => `
      <article class="demo-kpi"><span>${tx(item[0], item[3])}</span><strong>${item[1]}</strong><small>${tx(item[2], item[4])}</small></article>`).join("");
    const rows = module.rows.map(item => `
      <div class="demo-list-row"><span>${item[0]}</span><div><strong>${tx(item[1], item[4])}</strong><small>${tx(item[2], item[5])}</small></div><b>${tx(item[3], item[6])}</b></div>`).join("");

    els.content.innerHTML = `
      <p class="demo-kicker">[ ${tx("INTERACTIVE WORKSPACE PREVIEW", "معاينة تفاعلية لمساحة العمل")} ]</p>
      <div class="demo-head">
        <div><h3>${tx(module.en, module.ar)}</h3><p>${tx(module.descEn, module.descAr)}</p></div>
        <span class="illustrative-badge">${tx("Sample interface · example data", "واجهة نموذجية · بيانات مثال")}</span>
      </div>
      <div class="demo-kpis">${kpis}</div>
      <div class="demo-grid">
        <section class="demo-panel demo-panel-chart"><div class="demo-panel-heading"><div><h4>${tx(module.panelEn, module.panelAr)}</h4><span class="demo-panel-sub">${tx("Example trend · not live company data", "اتجاه نموذجي · ليس بيانات شركة حية")}</span></div><span class="demo-live-label">${tx("Preview", "معاينة")}</span></div><div class="demo-chart" aria-label="${tx("Example chart", "رسم نموذجي")}">${bars.map((bar, index) => `<i style="--bar:${bar}%;--bar-delay:${index * 28}ms"></i>`).join("")}</div></section>
        <section class="demo-panel"><div class="demo-panel-heading"><h4>${tx(module.sideEn, module.sideAr)}</h4><span class="demo-live-label">${tx("3 items", "3 عناصر")}</span></div><div class="demo-list">${rows}</div></section>
      </div>`;
    renderNavigation();
  }

  function selectModule(moduleId) {
    renderModule(moduleId);
    if (window.innerWidth < 821) {
      document.querySelector(`[data-module="${moduleId}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }

  els.moduleNav.addEventListener("click", event => {
    const button = event.target.closest("[data-module]");
    if (button) selectModule(button.dataset.module);
  });
  els.tourControls.addEventListener("click", event => {
    const button = event.target.closest("[data-module]");
    if (button) selectModule(button.dataset.module);
  });

  els.language.addEventListener("click", () => {
    locale = locale === "en" ? "ar" : "en";
    applyLocale();
    applyTheme(storage.get("nazrah-public-theme", "light"));
  });

  els.theme.addEventListener("click", () => {
    applyTheme(els.html.classList.contains("dark") ? "light" : "dark");
  });

  els.mobileButton.addEventListener("click", () => {
    const expanded = els.mobileButton.getAttribute("aria-expanded") === "true";
    els.mobileButton.setAttribute("aria-expanded", String(!expanded));
    els.mobileButton.setAttribute("aria-label", expanded ? copy[locale].openMenu : copy[locale].closeMenu);
    els.mobileMenu.hidden = expanded;
  });

  els.mobileMenu.addEventListener("click", event => {
    if (!event.target.closest("a")) return;
    els.mobileMenu.hidden = true;
    els.mobileButton.setAttribute("aria-expanded", "false");
    els.mobileButton.setAttribute("aria-label", copy[locale].openMenu);
  });

  document.querySelectorAll(".demo-trigger").forEach(button => {
    button.addEventListener("click", () => {
      els.formStatus.textContent = "";
      els.dialog.showModal();
    });
  });

  els.form.addEventListener("submit", event => {
    const submitter = event.submitter;
    if (!submitter || submitter.value === "cancel") return;
    event.preventDefault();
    if (!els.form.reportValidity()) return;
    const data = new FormData(els.form);
    const draft = {
      company: data.get("company"),
      email: data.get("email"),
      business: data.get("business"),
      plan: data.get("plan"),
      modules: data.getAll("module"),
      savedAt: new Date().toISOString()
    };
    storage.set("nazrah-demo-request-draft", JSON.stringify(draft));
    els.formStatus.textContent = copy[locale].stored;
  });

  function initializeSectionReveals() {
    const sections = Array.from(document.querySelectorAll("main > section"));
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      sections.forEach(section => section.classList.add("is-visible"));
      return;
    }

    els.html.classList.add("motion-ready");
    const revealTargets = [...sections];
    sections.forEach(section => {
      section.classList.add("reveal-section");
      const items = section.querySelectorAll(".hero-copy, .hero-blueprint, .section-heading, .product-frame, .tour-controls, .capability-card, .feature-story, .integration-card, .workflow-list > li, .pricing-card, .trust-list > article, .final-cta-card");
      items.forEach((item, index) => {
        item.classList.add("reveal-item");
        item.style.setProperty("--reveal-delay", `${Math.min(index * 95, 475)}ms`);
        revealTargets.push(item);
      });
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.09, rootMargin: "0px 0px -6% 0px" });

    revealTargets.forEach(target => observer.observe(target));
  }

  const storedTheme = storage.get("nazrah-public-theme", "");
  const initialTheme = storedTheme || (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  applyLocale();
  applyTheme(initialTheme);
  renderModule(activeModule);
  initializeSectionReveals();
  void loadWebsiteSettings();
})();
