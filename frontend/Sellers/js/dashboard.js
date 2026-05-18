const DASHBOARD_DEFAULTS = {
  layout: "a",
  density: "comfortable",
  accent: "dark",
};

const DASHBOARD_STATE = {
  activeMonth: "current",
  monthInputs: {
    current: {
      electricity: 4200,
      gas: 320,
      fuel: 240,
      cargo: 14500,
      plastic: 58,
      cardboard: 312,
    },
    last: {
      electricity: 3980,
      gas: 340,
      fuel: 260,
      cargo: 13200,
      plastic: 72,
      cardboard: 284,
    },
  },
};

const CO2_FACTORS = {
  electricity: { factor: 0.42, label: "Elektrik", unit: "kWh", color: "#1D9E75" },
  gas: { factor: 2.0, label: "Dogalgaz", unit: "m3", color: "#0F6A4F" },
  fuel: { factor: 2.31, label: "Arac yakiti", unit: "litre", color: "#085041" },
  cargo: { factor: 0.12, label: "Kargo", unit: "km", color: "#4FB893" },
  plastic: { factor: 6.0, label: "Plastik amb.", unit: "kg", color: "#EF9F27" },
  cardboard: { factor: 1.1, label: "Karton amb.", unit: "kg", color: "#F5B656" },
};

const SECTOR_AVG = 5200;

const DASHBOARD_SUMMARY = {
  greeting: {
    company: "Koton",
    monthlySales: 8247,
    nextTierSteps: 2,
    liveLabel: "Veri canli · 18 May",
  },
  badge: {
    tier: 3,
    title: "Tier 3 · Dogrulanmis",
    meta: "Mayis 2026 · LP-TR-2026-KTN-4471",
    trust: 94,
    kaiPerSelection: 80,
    validUntil: "2026-12",
    tierProgress: 62,
    progressMeta: "3 sertifika gerekli · 1 audit · 2 kampanya",
  },
  kpis: [
    {
      eyebrow: "Bu Ay · Yesil Urun Satisi",
      value: "8.247",
      unit: "adet",
      delta: "+22%",
      deltaLabel: "gecen aya gore",
      icon: "trend",
      sparkline: [32, 28, 24, 30, 22, 26, 18, 20, 12, 14, 8, 6],
    },
    {
      eyebrow: "Bu Ay · KAI Dagitimi",
      value: "124.5K",
      unit: "puan",
      helper: "≈ 249 kupon karsiligi",
      progressLabel: "Hedef 150K",
      progress: 83,
      progressAccent: "amber",
      icon: "bolt",
    },
    {
      eyebrow: "Bu Ay · Onlenen Plastik",
      value: "412",
      unit: "kg",
      helper: "≈ 16.480 plastik sise degerinde",
      progressLabel: "Yillik hedef",
      progress: 41,
      progressAccent: "leaf",
      icon: "plus",
    },
  ],
  roadmap: {
    stepTitle: "Tier 4 yol haritan",
    currentStep: 3,
    totalSteps: 5,
    progress: 42,
    steps: [
      { title: "Sertifika", detail: "ISO 14001", done: true },
      { title: "AI Dogrulama", detail: "94/100", done: true },
      { title: "Operasyon Audit", detail: "devam · %42", current: true },
      { title: "Etki Raporu", detail: "bekleyen" },
      { title: "Tier 4 Onayi", detail: "bekleyen" },
    ],
    nextActionTitle: "Siradaki adim: Operasyon raporu yukle",
    nextActionText: "Tamamlamasi ortalama 3-5 is gunu · gecikmede uyarilirsin",
  },
  trendProduct: {
    eyebrow: "Trend Yesil Urun · Mayis",
    title: "Organik Karton Kutu — Large",
    description: "FSC sertifikali, %100 geri donusumlu. Mayis ayinda en cok satan yesil urun.",
    sku: "SKU: KTN-KRT-LG-01",
    badge: "#1 — kategoride lider",
    category: "Karton kategori",
    sales: "1.847",
    revenue: "₺128K",
    kai: "+80",
    trend: "+24%",
    strip: [12, 16, 14, 18, 15, 22, 19, 17, 21, 24, 20, 28, 26, 23, 30, 32, 28, 33, 38, 35, 40, 42, 44, 41, 46, 49, 52, 55, 58, 62],
  },
};

function getDashboardRoot() {
  return document.getElementById("dashboard-root");
}

function fmtNum(value) {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value);
}

function setDashboardBodyAttributes() {
  document.body.setAttribute("data-layout", DASHBOARD_DEFAULTS.layout);
  document.body.setAttribute("data-density", DASHBOARD_DEFAULTS.density);
  document.body.setAttribute("data-accent", DASHBOARD_DEFAULTS.accent);
}

function getTrendSparklineMarkup(points) {
  const step = 200 / (points.length - 1);
  const line = points.map((point, index) => `${index * step},${point}`).join(" ");
  return `
    <svg class="mt-3 w-full h-10" viewBox="0 0 200 40" preserveAspectRatio="none">
      <polyline points="${line}" fill="none" stroke="#1D9E75" stroke-width="2"></polyline>
      <polyline points="${line} 200,40 0,40" fill="#1D9E75" opacity=".10"></polyline>
    </svg>
  `;
}

function getTrendBarsMarkup(points) {
  const max = Math.max(...points);
  return points.map((value, index) => {
    const height = (value / max) * 100;
    const isLast = index === points.length - 1;
    const color = isLast ? "#EF9F27" : (index > 24 ? "#168562" : "#8DD3B7");
    return `<div class="flex-1 rounded-t-sm" style="height:${height}%; background:${color};"></div>`;
  }).join("");
}

function getMetricIcon(type) {
  if (type === "bolt") {
    return `<svg class="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 3 14h7l-1 8 10-12h-7z"></path></svg>`;
  }

  if (type === "plus") {
    return `<svg class="w-4 h-4 text-leaf-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><path d="M12 3v18M3 12h18"></path></svg>`;
  }

  return `<svg class="w-4 h-4 text-leaf-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`;
}

function getKpiCardMarkup(kpi) {
  const progressMarkup = typeof kpi.progress === "number"
    ? `
      <div class="mt-3">
        <div class="flex justify-between text-[10px] text-leaf-800/45 font-mono mb-1">
          <span>${kpi.progressLabel}</span>
          <span class="${kpi.progressAccent === "amber" ? "text-amber-500" : "text-leaf-700"} font-semibold">%${kpi.progress}</span>
        </div>
        <div class="progress-bar"><div class="progress-fill${kpi.progressAccent === "amber" ? " progress-fill--amber" : ""}" style="width:${kpi.progress}%"></div></div>
      </div>
    `
    : "";

  const extraMarkup = kpi.sparkline
    ? getTrendSparklineMarkup(kpi.sparkline)
    : `<div class="mt-3 text-[11px] text-leaf-800/50 font-mono">${kpi.helper}</div>${progressMarkup}`;

  const deltaMarkup = kpi.delta
    ? `
      <div class="mt-3 flex items-center gap-2">
        <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-leaf-700 bg-leaf-50 px-2 py-0.5 rounded-full border border-leaf-200">
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"></path></svg>
          ${kpi.delta}
        </span>
        <span class="text-[11px] text-leaf-800/45 font-mono">${kpi.deltaLabel}</span>
      </div>
      ${extraMarkup}
    `
    : extraMarkup;

  return `
    <div class="stat-card">
      <div class="flex items-start justify-between">
        <div class="eyebrow">${kpi.eyebrow}</div>
        ${getMetricIcon(kpi.icon)}
      </div>
      <div class="mt-3 flex items-baseline gap-2">
        <div class="metric-number metric-xl text-[2.4rem] leading-none tabular-nums">${kpi.value}</div>
        <div class="text-sm text-leaf-800/55">${kpi.unit}</div>
      </div>
      ${deltaMarkup}
    </div>
  `;
}

function getRoadmapStepMarkup(step, index) {
  if (step.current) {
    return `
      <div class="text-center bg-amber-50 rounded-lg p-2 border border-amber-200">
        <div class="font-semibold text-amber-700">${step.title}</div>
        <div class="text-amber-600/80 mt-0.5 font-mono">${step.detail}</div>
      </div>
    `;
  }

  const titleClass = step.done ? "text-leaf-800" : "text-leaf-800/55";
  const detailClass = step.done ? "text-leaf-600/80" : "text-leaf-600/40";
  return `
    <div class="text-center">
      <div class="font-semibold ${titleClass}">${step.title}</div>
      <div class="${detailClass} mt-0.5">${step.detail}</div>
    </div>
  `;
}

function getRoadmapStepperMarkup(roadmap) {
  return roadmap.steps.map((step, index) => {
    const lineMarkup = index < roadmap.steps.length - 1
      ? `<div class="step-line">${step.done || step.current ? `<div class="step-line-fill" style="width:${step.current ? roadmap.progress : 100}%${step.current ? "; background:#EF9F27;" : ""}"></div>` : ""}</div>`
      : "";

    const pillMarkup = step.done
      ? `<div class="step-pill bg-leaf-500 text-white">✓</div>`
      : step.current
        ? `<div class="step-pill bg-amber-500 text-white ring-4 ring-amber-100">${index + 1}</div>`
        : `<div class="step-pill bg-leaf-50 text-leaf-700 border border-leaf-200">${index + 1}</div>`;

    return `<div class="flex items-center ${index === roadmap.steps.length - 1 ? "" : "flex-1"}"><div class="flex flex-col items-center gap-2">${pillMarkup}</div>${lineMarkup}</div>`;
  }).join("");
}

function getTrendProductMarkup(product) {
  return `
    <div class="area-tren card relative overflow-hidden">
      <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <div class="eyebrow">${product.eyebrow}</div>
          <div class="font-bold text-leaf-900 mt-1 text-lg">Bu ayin one cikan urunu</div>
        </div>
        <span class="text-[11px] font-mono text-leaf-700 bg-leaf-50 border border-leaf-200 px-3 py-1.5 rounded-full">${product.badge}</span>
      </div>

      <div class="grid sm:grid-cols-5 gap-5 items-center">
        <div class="sm:col-span-2">
          <div class="aspect-square rounded-2xl bg-gradient-to-br from-leaf-50 to-leaf-200 relative overflow-hidden border border-leaf-200">
            <svg viewBox="0 0 200 200" class="absolute inset-0 w-full h-full">
              <defs>
                <pattern id="grid-p" width="14" height="14" patternUnits="userSpaceOnUse">
                  <path d="M0 14h14" stroke="rgba(8,80,65,.06)" stroke-width="1"></path>
                </pattern>
              </defs>
              <rect width="200" height="200" fill="url(#grid-p)"></rect>
              <g transform="translate(50,55)">
                <path d="M0 30 L50 5 L100 30 L100 80 L50 105 L0 80 Z" fill="#168562" stroke="#053A30" stroke-width="2" stroke-linejoin="round"></path>
                <path d="M0 30 L50 55 L100 30" fill="none" stroke="#053A30" stroke-width="2" stroke-linejoin="round"></path>
                <path d="M50 55 L50 105" fill="none" stroke="#053A30" stroke-width="2"></path>
                <g transform="translate(35,65)">
                  <circle r="14" fill="#F5B656"></circle>
                  <path d="M-6 6c-1-4 2-7 8-7 0 4-2 9-8 7Z" fill="#053A30"></path>
                </g>
              </g>
              <g transform="translate(140,12) rotate(8)">
                <rect width="48" height="20" rx="4" fill="#EF9F27"></rect>
                <text x="24" y="14" font-family="JetBrains Mono" font-size="10" font-weight="700" fill="#053A30" text-anchor="middle">${product.trend}</text>
              </g>
            </svg>
            <div class="absolute bottom-3 left-3 text-[10px] font-mono text-leaf-800/55 bg-white/80 backdrop-blur px-2 py-1 rounded-md">${product.sku}</div>
          </div>
        </div>

        <div class="sm:col-span-3 space-y-3">
          <div>
            <div class="text-[11px] font-mono uppercase tracking-widest text-leaf-600">${product.category}</div>
            <h3 class="text-xl font-black text-leaf-900 mt-1 leading-tight">${product.title}</h3>
            <p class="text-xs text-leaf-800/60 mt-1.5">${product.description}</p>
          </div>

          <div class="grid grid-cols-3 gap-2 pt-2">
            <div>
              <div class="eyebrow">Satis</div>
              <div class="font-black text-leaf-900 text-lg tabular-nums mt-0.5">${product.sales}</div>
              <div class="text-[10px] text-leaf-600/80 font-mono">adet</div>
            </div>
            <div>
              <div class="eyebrow">Gelir</div>
              <div class="font-black text-leaf-900 text-lg tabular-nums mt-0.5">${product.revenue}</div>
              <div class="text-[10px] text-leaf-600/80 font-mono">${product.trend} trend</div>
            </div>
            <div>
              <div class="eyebrow">KAI / satis</div>
              <div class="font-black text-leaf-900 text-lg tabular-nums mt-0.5">${product.kai}</div>
              <div class="text-[10px] text-leaf-600/80 font-mono">max odul</div>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <button class="text-xs font-semibold px-3.5 py-2 rounded-full text-white dashboard-accent-button">Urun sayfasi →</button>
            <button class="text-xs font-semibold px-3.5 py-2 rounded-full border border-leaf-200 text-leaf-700 hover:bg-leaf-50 transition">Kampanya baslat</button>
          </div>
        </div>
      </div>

      <div class="mt-5 pt-4 border-t border-leaf-100">
        <div class="flex items-center justify-between mb-2">
          <div class="text-[11px] font-mono uppercase tracking-widest text-leaf-600">Son 30 gun · satis</div>
          <div class="text-[11px] font-mono text-leaf-700 font-semibold">▲ ${product.trend}</div>
        </div>
        <div class="flex items-end gap-1 h-12">${getTrendBarsMarkup(product.strip)}</div>
      </div>
    </div>
  `;
}

function getDashboardMarkup() {
  const summary = DASHBOARD_SUMMARY;
  const currentMonthLabel = DASHBOARD_STATE.activeMonth === "current" ? "Bu Ay" : "Onceki Ay";

  return `
    <section class="dashboard-wrap">
      <div class="greeting flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 class="text-[2.1rem] lg:text-[2.4rem] font-black text-leaf-900 tracking-tight leading-[1.05]">Merhaba, <span data-company-short>${summary.greeting.company}</span></h1>
          <p class="mt-1.5 text-leaf-800/65 text-sm max-w-lg">Bu ay ${fmtNum(summary.greeting.monthlySales)} yesil urun satisi yaptin. Tier 4'e yukselmen icin <b class="text-leaf-700">${summary.greeting.nextTierSteps} adim</b> kaldi.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="pill-mono"><span class="w-1.5 h-1.5 rounded-full bg-leaf-500"></span>${summary.greeting.liveLabel}</span>
        </div>
      </div>

      <div class="dash-grid">
        <div class="area-tier card-dark bg-leaf-800 relative overflow-hidden tier-elevated">
          <div class="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-leaf-500/20 blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none"></div>

          <div class="relative flex items-start justify-between gap-4">
            <div>
              <div class="eyebrow text-amber-400 mb-1.5">Rozet Durumu</div>
              <div class="text-2xl font-black tracking-tight">${summary.badge.title}</div>
              <div class="text-sm text-white/55 mt-1">${summary.badge.meta}</div>
            </div>
            <div class="relative w-20 h-20 flex-shrink-0">
              <div class="absolute inset-0 rounded-full badge-ring spin-slow opacity-90"></div>
              <div class="absolute inset-[5px] rounded-full bg-leaf-500 flex items-center justify-center">
                <div class="absolute inset-2 rounded-full border border-dashed border-white/30"></div>
                <svg viewBox="0 0 24 24" class="w-7 h-7 text-white relative" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 13-9 0 7-3 16-13 16Z"></path><path d="M4 20c1-5 4-9 9-12"></path></svg>
              </div>
            </div>
          </div>

          <div class="mt-5 h-px bg-white/10"></div>

          <div class="mt-4 grid grid-cols-3 gap-3">
            <div>
              <div class="eyebrow text-amber-400/80">Guven</div>
              <div class="text-lg font-bold tabular-nums mt-1">${summary.badge.trust}<span class="text-sm text-white/40">/100</span></div>
            </div>
            <div>
              <div class="eyebrow text-amber-400/80">KAI / secim</div>
              <div class="text-lg font-bold tabular-nums mt-1">+${summary.badge.kaiPerSelection}</div>
            </div>
            <div>
              <div class="eyebrow text-amber-400/80">Gecerli</div>
              <div class="text-lg font-bold tabular-nums mt-1">${summary.badge.validUntil}</div>
            </div>
          </div>

          <div class="mt-5">
            <div class="flex items-center justify-between text-[11px] mb-1.5">
              <span class="text-white/55 font-mono">Tier 4 ilerleme</span>
              <span class="text-amber-400 font-mono font-semibold">%${summary.badge.tierProgress}</span>
            </div>
            <div class="progress-bar bg-white/10"><div class="progress-fill progress-fill--amber" style="width:${summary.badge.tierProgress}%"></div></div>
            <div class="mt-2 text-[11px] text-white/45">${summary.badge.progressMeta}</div>
          </div>
        </div>

        <div class="area-kpi">
          <div class="kpi-grid">
            ${summary.kpis.map(getKpiCardMarkup).join("")}
          </div>
        </div>

        <div class="area-road card">
          <div class="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <div class="eyebrow">AI Yol Haritasi</div>
              <div class="font-bold text-leaf-900 mt-1 text-lg">${summary.roadmap.stepTitle}</div>
            </div>
            <span class="pill-mono">Adim ${summary.roadmap.currentStep}/${summary.roadmap.totalSteps}</span>
          </div>

          <div class="flex items-center mb-5" id="roadmap-steps">
            ${getRoadmapStepperMarkup(summary.roadmap)}
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-5 gap-2 text-[11px]">
            ${summary.roadmap.steps.map(getRoadmapStepMarkup).join("")}
          </div>

          <div class="mt-5 flex items-center justify-between bg-leaf-50 border border-leaf-200 rounded-2xl px-4 py-3 gap-3 flex-wrap">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-200 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
              </div>
              <div>
                <div class="text-sm font-bold text-leaf-900">${summary.roadmap.nextActionTitle}</div>
                <div class="text-xs text-leaf-800/60 mt-0.5">${summary.roadmap.nextActionText}</div>
              </div>
            </div>
            <button class="text-xs font-semibold px-4 py-2 rounded-full text-white dashboard-accent-button">Adimi tamamla →</button>
          </div>
        </div>

        <div class="area-carb card relative overflow-hidden">
          <div class="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-leaf-100/60 blur-3xl pointer-events-none"></div>
          <div class="relative">
            <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <div class="eyebrow">Karbon Ayak Izi · Hesapla</div>
                <div class="font-bold text-leaf-900 mt-1 text-lg">Aylik operasyonel emisyonun</div>
              </div>
              <div class="flex gap-1.5">
                <button class="seg-btn ${DASHBOARD_STATE.activeMonth === "current" ? "active" : ""}" data-month-tab="current">Bu Ay</button>
                <button class="seg-btn ${DASHBOARD_STATE.activeMonth === "last" ? "active" : ""}" data-month-tab="last">Onceki</button>
              </div>
            </div>

            <p class="text-xs text-leaf-800/55 mb-5 max-w-xl">Bilgilerini gir, aninda <b class="text-leaf-700">kg CO2e/ay</b> sonucunu gorup Tier seviyene etkisini ogren.</p>

            <div class="grid sm:grid-cols-2 gap-3" id="co2-form">
              ${getCO2FieldMarkup("electricity", "Elektrik tuketimi", "kWh/ay")}
              ${getCO2FieldMarkup("gas", "Dogalgaz tuketimi", "m3/ay")}
              ${getCO2FieldMarkup("fuel", "Arac yakiti (benzin)", "litre/ay")}
              ${getCO2FieldMarkup("cargo", "Kargo mesafesi", "km/ay")}
              ${getCO2FieldMarkup("plastic", "Plastik ambalaj", "kg/ay")}
              ${getCO2FieldMarkup("cardboard", "Karton ambalaj", "kg/ay")}
            </div>

            <div class="mt-5 rounded-2xl border border-leaf-200 bg-gradient-to-br from-leaf-50 to-white p-5">
              <div class="flex items-end justify-between flex-wrap gap-3 mb-4">
                <div>
                  <div class="eyebrow">Toplam · ${currentMonthLabel}</div>
                  <div class="mt-1 flex items-baseline gap-2">
                    <span class="metric-number text-[2.6rem] leading-none tabular-nums" id="co2-total">—</span>
                    <span class="text-sm text-leaf-800/60 font-mono">kg CO2e</span>
                  </div>
                  <div class="text-xs text-leaf-800/55 mt-1.5" id="co2-equiv">— agac esdeger karsiligi</div>
                </div>
                <div class="text-right">
                  <div class="eyebrow text-amber-600">Sektor Ortalamasi</div>
                  <div class="mt-1 font-mono text-leaf-900 text-lg tabular-nums" id="co2-vs-avg">—</div>
                  <div class="text-xs text-leaf-800/55 mt-0.5">5.200 kg CO2e benchmark</div>
                </div>
              </div>

              <div class="space-y-2" id="co2-breakdown"></div>
            </div>
          </div>
        </div>

        ${getTrendProductMarkup(summary.trendProduct)}
      </div>
    </section>
  `;
}

function getCO2FieldMarkup(key, label, unit) {
  const value = DASHBOARD_STATE.monthInputs[DASHBOARD_STATE.activeMonth][key];
  return `
    <div class="field">
      <label>${label}</label>
      <div class="field-row">
        <input type="number" min="0" step="1" value="${value}" data-co2-input="${key}">
        <span class="unit">${unit}</span>
      </div>
    </div>
  `;
}

function calculateCO2() {
  const breakdown = [];
  let total = 0;

  Object.entries(CO2_FACTORS).forEach(([key, definition]) => {
    const value = Math.max(0, Number(DASHBOARD_STATE.monthInputs[DASHBOARD_STATE.activeMonth][key]) || 0);
    const co2 = value * definition.factor;
    total += co2;
    breakdown.push({
      key,
      co2,
      color: definition.color,
      label: definition.label,
    });
  });

  breakdown.sort((left, right) => right.co2 - left.co2);
  return { total, breakdown };
}

function renderCO2Result() {
  const totalElement = document.getElementById("co2-total");
  const equivElement = document.getElementById("co2-equiv");
  const compareElement = document.getElementById("co2-vs-avg");
  const breakdownElement = document.getElementById("co2-breakdown");
  if (!totalElement || !equivElement || !compareElement || !breakdownElement) return;

  const { total, breakdown } = calculateCO2();
  totalElement.textContent = fmtNum(total);

  const trees = total / 1.75;
  equivElement.textContent = `≈ ${fmtNum(trees)} olgun agacin aylik emilimi`;

  const difference = total - SECTOR_AVG;
  const percentage = SECTOR_AVG ? (difference / SECTOR_AVG) * 100 : 0;
  compareElement.innerHTML = difference < 0
    ? `<span class="text-leaf-600">▼ %${fmtNum(Math.abs(percentage))} daha az</span>`
    : `<span class="text-amber-600">▲ %${fmtNum(Math.abs(percentage))} daha fazla</span>`;

  const maxValue = Math.max(...breakdown.map((item) => item.co2), 1);
  breakdownElement.innerHTML = breakdown.map((item) => {
    const width = (item.co2 / maxValue) * 100;
    const share = total ? (item.co2 / total) * 100 : 0;
    return `
      <div class="bar-row">
        <span class="bar-name">${item.label}</span>
        <div class="bar-track">
          <div class="bar-fill" style="width:${width}%; background:${item.color};"></div>
        </div>
        <span class="bar-value">${fmtNum(item.co2)} <span class="text-leaf-800/40">· %${fmtNum(share)}</span></span>
      </div>
    `;
  }).join("");
}

function bindDashboardEvents() {
  document.querySelectorAll("[data-month-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      DASHBOARD_STATE.activeMonth = button.dataset.monthTab;
      renderDashboard();
    });
  });

  document.querySelectorAll("[data-co2-input]").forEach((input) => {
    input.addEventListener("input", () => {
      DASHBOARD_STATE.monthInputs[DASHBOARD_STATE.activeMonth][input.dataset.co2Input] = Number(input.value || 0);
      renderCO2Result();
    });
  });
}

function renderDashboard() {
  const dashboardRoot = getDashboardRoot();
  if (!dashboardRoot) return;

  setDashboardBodyAttributes();
  dashboardRoot.innerHTML = getDashboardMarkup();
  bindDashboardEvents();
  renderCO2Result();
}
