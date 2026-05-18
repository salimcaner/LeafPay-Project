const AI_ROADMAP_VERIFICATION_RESULT_KEY = "leafpay_verification_result";
const SELLER_CARBON_RESULT_STORAGE_KEY = "leafpay_seller_carbon_result";

const ROADMAP_TEMPLATES = {
  1: {
    targetTier: 2,
    progress: 38,
    steps: [
      { title: "Temel cevre politikasini belgeye bagla", description: "Sirketin operasyon, ambalaj ve tedarik kararlarini kapsayan yazili cevre politikasi hazirla ve ic onaya bagla.", priority: "yuksek", impact: 18, status: "devam", cta: "Politika sablonu ac" },
      { title: "FSC veya geri donusumlu ambalaj kanitlarini yukle", description: "Karton tedarikcisi belgeleri ve son alis faturalarini dogrulama dosyasina ekle.", priority: "yuksek", impact: 22, status: "yapilacak", cta: "Belge hazirla" },
      { title: "Kargo seceneklerinde birlesik teslimati aktif et", description: "Musteriye daha dusuk emisyonlu teslimat secenegi sunarak lojistik skorunu yukseltebilirsin.", priority: "orta", impact: 14, status: "yapilacak", cta: "Kargo akisini guncelle" },
      { title: "Aylik karbon olcum rutini baslat", description: "Elektrik, kargo ve ambalaj verisini aylik duzende izleyip AI analizine sabit veri girisi sagla.", priority: "orta", impact: 10, status: "yapilacak", cta: "Takvim olustur" },
    ],
  },
  2: {
    targetTier: 3,
    progress: 67,
    steps: [
      { title: "ISO 14001 veya muadil sistemi tamamla", description: "Cevresel yonetim sistemini belgeleyen sertifikanin guncel surumunu AI testine ekle.", priority: "yuksek", impact: 24, status: "yapilacak", cta: "Sertifika yukle" },
      { title: "Operasyonel audit raporunu guncelle", description: "Uretim, depolama ve tedarik sureclerini kapsayan bagimsiz audit raporu Tier 3'e geciste kritik agirlik tasiyor.", priority: "yuksek", impact: 20, status: "devam", cta: "Audit planla" },
      { title: "Karbon notr kargo secenegini varsayilanlastir", description: "Musteri checkout akisini yesil teslimat odakli yeniden duzenleyerek guven skorunu artir.", priority: "orta", impact: 16, status: "yapilacak", cta: "Checkout guncelle" },
      { title: "Tedarikci denetim frekansini yillik standarda cek", description: "Belge talebi yerine yillik kontrol listesi ve denetim kaydi tut.", priority: "orta", impact: 12, status: "tamamlandi", cta: "Kayitlari gor" },
    ],
  },
  3: {
    targetTier: 3,
    progress: 92,
    steps: [
      { title: "Belgeleri yenileme takvimine bagla", description: "ISO/FSC ve audit dosyalarinin son kullanma tarihlerinden once yenileme gorevi ac.", priority: "yuksek", impact: 12, status: "devam", cta: "Takvim kur" },
      { title: "Aylik karbon raporunu istikrarla koru", description: "Mevcut dusuk emisyon seviyesini sabitlemek icin enerji ve kargo trendini aylik takip et.", priority: "orta", impact: 10, status: "yapilacak", cta: "Raporu ac" },
      { title: "Kampanya ve rozet verisini public profilde guncelle", description: "Tier 3 guven sinyalini landing ve checkout ekranlarinda guncel tut.", priority: "dusuk", impact: 8, status: "tamamlandi", cta: "Profili gor" },
    ],
  },
};

const ROADMAP_MOCK_ANALYSIS = {
  1: {
    strengths: ["Temel ambalaj farkindaligi", "Yerel tedarik kullanimi", "Yesil secenek aktivasyonu"],
    weaknesses: ["Belge eksigi", "Lojistik optimizasyon dusuk", "Karbon olcumu duzensiz"],
    summary: "AI analizi sirketin temel yesil uygulamalari kurdugunu gosteriyor ancak belge ve standart surec eksigi nedeniyle Tier 2 esigine tam ulasilmiyor.",
  },
  2: {
    strengths: ["Ambalaj orani guclu", "Tedarikci belgeleri mevcut", "Karbon takibi olgunluk kazaniyor"],
    weaknesses: ["Audit guncellemesi gerekli", "ISO/EMS kapsaminda bosluklar var", "Karbon notr teslimat yaygin degil"],
    summary: "AI, operasyonel altyapinin Tier 3'e yakin oldugunu; ancak resmi belge derinligi ve audit kapanislarinin tamamlanmasi gerektigini tespit etti.",
  },
  3: {
    strengths: ["Yuksek guven skoru", "Guncel sertifikasyon yapisi", "Tutarlı yesil operasyon performansi"],
    weaknesses: ["Belge yenileme takibi", "Karbon verisini daha sik guncelleme", "Kamuya acik raporlama"],
    summary: "AI degerlendirmesi maksimum tier seviyesine ulastigini gosteriyor. Odak noktasi mevcut seviyeyi korumak ve yenileme disiplinini kaybetmemek olmali.",
  },
};

function getAiRoadmapRoot() {
  return document.getElementById("dashboard-root");
}

function getAiRoadmapVerificationResult() {
  try {
    const raw = localStorage.getItem(AI_ROADMAP_VERIFICATION_RESULT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.status === "completed" ? parsed : null;
  } catch (error) {
    return null;
  }
}

function getAiRoadmapCarbonResult() {
  try {
    const raw = localStorage.getItem(SELLER_CARBON_RESULT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed.total === "number" && Array.isArray(parsed.breakdown) ? parsed : null;
  } catch (error) {
    return null;
  }
}

function aiFmtNum(value) {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value);
}

function aiGetPriorityBadge(priority) {
  const map = {
    yuksek: ['priority-high', 'Oncelik · Yuksek'],
    orta: ['priority-medium', 'Oncelik · Orta'],
    dusuk: ['priority-low', 'Oncelik · Dusuk'],
  };
  const pair = map[priority] || map.orta;
  return `<span class="priority-badge ${pair[0]}">${pair[1]}</span>`;
}

function aiGetStatusBadge(status) {
  const map = {
    yapilacak: ['status-todo', 'Yapilacak'],
    devam: ['status-progress', 'Devam ediyor'],
    tamamlandi: ['status-done', 'Tamamlandi'],
  };
  const pair = map[status] || map.yapilacak;
  return `<span class="status-badge ${pair[0]}">${pair[1]}</span>`;
}

function aiGetStepMarker(status, index) {
  if (status === "tamamlandi") return `<div class="step-marker done">✓</div>`;
  if (status === "devam") return `<div class="step-marker progress">${index + 1}</div>`;
  return `<div class="step-marker todo">${index + 1}</div>`;
}

function aiInferStrengthsAndWeaknesses(result) {
  const tier = Math.max(1, Number(result && result.tier ? result.tier : 1));
  const defaults = ROADMAP_MOCK_ANALYSIS[tier] || ROADMAP_MOCK_ANALYSIS[1];
  const breakdown = Array.isArray(result && result.breakdown) ? result.breakdown : [];
  const strengths = [];
  const weaknesses = [];

  breakdown.forEach((item) => {
    if (item.pct >= 70) strengths.push(`${item.title} guclu`);
    if (item.pct < 60) weaknesses.push(`${item.title} gelistirilmeli`);
  });

  return {
    strengths: strengths.length ? strengths.slice(0, 3) : defaults.strengths,
    weaknesses: weaknesses.length ? weaknesses.slice(0, 3) : defaults.weaknesses,
    summary: defaults.summary,
  };
}

function aiBuildCarbonRecommendations(carbonResult) {
  if (!carbonResult) return [];

  const total = carbonResult.total || 0;
  const breakdown = carbonResult.breakdown.slice().sort((a, b) => b.co2 - a.co2);
  const shares = {};
  breakdown.forEach((item) => {
    shares[item.key] = total ? (item.co2 / total) * 100 : 0;
  });

  return [
    { title: "Elektrik tuketimini azalt", reduction: `-${aiFmtNum((shares.electricity || 0) * 0.12)} kg CO2e / ay`, difficulty: "Orta", duration: "4-6 hafta", priority: shares.electricity > 20 ? "yuksek" : "orta", status: shares.electricity > 25 ? "yapilacak" : "devam", detail: "Vardiya bazli enerji takibi ve verimli ekipman planlamasi ile baz tuketim dusurulebilir." },
    { title: "Kargo rotalarini optimize et", reduction: `-${aiFmtNum((shares.cargo || 0) * 0.14)} kg CO2e / ay`, difficulty: "Orta", duration: "2-4 hafta", priority: shares.cargo > 15 ? "yuksek" : "orta", status: shares.cargo > 18 ? "yapilacak" : "devam", detail: "Konsolide sevkiyat ve karbon notr partner secimi lojistik etkisini hizli azaltir." },
    { title: "Plastik ambalaji azalt", reduction: `-${aiFmtNum((shares.plastic || 0) * 0.18)} kg CO2e / ay`, difficulty: "Orta", duration: "3-5 hafta", priority: shares.plastic > 10 ? "yuksek" : "orta", status: shares.plastic > 8 ? "yapilacak" : "devam", detail: "Tek kullanimlik plastik orani dogrudan guven skorunu da baskilar." },
    { title: "Karton/biyolojik ambalaj oranini artir", reduction: `-${aiFmtNum((shares.cardboard || 0) * 0.08)} kg CO2e / ay`, difficulty: "Dusuk", duration: "2-3 hafta", priority: "orta", status: "devam", detail: "FSC veya geri donusumlu ambalaj orani Tier gecisinde pozitif etki yaratir." },
    { title: "Yenilenebilir enerji veya karbon dengeleme kullan", reduction: `-${aiFmtNum(total * 0.07)} kg CO2e / ay`, difficulty: "Orta", duration: "1-2 hafta", priority: total > 5000 ? "yuksek" : "orta", status: "yapilacak", detail: "Yuksek toplam emisyon goruldugunde sertifikali offset veya yesil enerji alim modeli hizli denge yaratir." },
  ];
}

function aiBuildTopActions(result, carbonResult, steps, carbonRecommendations) {
  const actions = [];
  const certTitles = (result && result.certs ? result.certs : []).map((item) => item.id);

  if (certTitles.indexOf("iso14001") === -1) {
    actions.push("ISO 14001 belgesini yukle");
  } else if (steps.some((step) => step.title.toLowerCase().indexOf("audit") !== -1 && step.status !== "tamamlandi")) {
    actions.push("Operasyon audit raporunu guncelle");
  }

  if (carbonResult) {
    const topCarbon = carbonRecommendations.filter((item) => item.priority === "yuksek")[0];
    if (topCarbon && topCarbon.title.indexOf("Plastik") !== -1) actions.push("Plastik ambalaj oranini %20 azalt");
    else if (topCarbon && topCarbon.title.indexOf("Kargo") !== -1) actions.push("Kargo saglayicini karbon notr secenege gecir");
    else if (topCarbon && topCarbon.title.indexOf("Elektrik") !== -1) actions.push("Elektrik tuketimi icin aylik azaltim plani baslat");
  }

  const nextStep = steps.find((step) => step.status !== "tamamlandi");
  if (nextStep) actions.push(nextStep.title);
  if (actions.length < 3 && !carbonResult) actions.push("Karbon ayak izi hesaplamasini tamamla");

  return actions.filter((item, index) => actions.indexOf(item) === index).slice(0, 3);
}

function getAiRoadmapAnalysisMarkup(result) {
  if (!result) {
    return `<div class="roadmap-card"><div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg><div class="font-bold text-leaf-900">AI analizi olusturulmadi</div><div class="text-sm text-leaf-800/60 mt-2">AI analizi olusturmak icin once dogrulama testini tamamla.</div></div></div>`;
  }

  const insights = aiInferStrengthsAndWeaknesses(result);
  return `
    <div class="roadmap-card-dark relative overflow-hidden tier-elevated">
      <div class="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-leaf-500/20 blur-3xl"></div>
      <div class="relative">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div class="eyebrow text-amber-400 mb-2">AI Analiz Ozeti</div>
            <div class="text-2xl font-black tracking-tight">Tier ${result.tier} · Test skoru ${result.score}/100</div>
            <div class="text-sm text-white/60 mt-1">Guven skoru ${result.trustScore || result.score}/100 · Son analiz ${result.earnedAt || "—"}</div>
          </div>
          <span class="roadmap-pill" style="background:rgba(255,255,255,.06);color:#F5B656;border-color:rgba(255,255,255,.12);">${result.badgeId || "Rozet ID yok"}</span>
        </div>
        <div class="roadmap-kpi-grid mt-5">
          <div class="roadmap-stat bg-white/5 border-white/10"><div class="eyebrow text-amber-400/80">Mevcut Tier</div><div class="text-3xl font-black text-white mt-2">${result.tier}</div></div>
          <div class="roadmap-stat bg-white/5 border-white/10"><div class="eyebrow text-amber-400/80">Test Skoru</div><div class="text-3xl font-black text-white mt-2">${result.score}</div></div>
          <div class="roadmap-stat bg-white/5 border-white/10"><div class="eyebrow text-amber-400/80">Guven Skoru</div><div class="text-3xl font-black text-white mt-2">${result.trustScore || result.score}</div></div>
        </div>
        <div class="grid sm:grid-cols-2 gap-4 mt-5">
          <div><div class="eyebrow text-amber-400/80 mb-2">Guclu Alanlar</div><div class="insight-list">${insights.strengths.map((item) => `<div class="insight-item bg-white/5 border-white/10 text-white/90">${item}</div>`).join("")}</div></div>
          <div><div class="eyebrow text-amber-400/80 mb-2">Zayif Alanlar</div><div class="insight-list">${insights.weaknesses.map((item) => `<div class="insight-item bg-white/5 border-white/10 text-white/90">${item}</div>`).join("")}</div></div>
        </div>
        <div class="mt-5 text-sm text-white/72">${insights.summary}</div>
      </div>
    </div>
  `;
}

function getAiRoadmapStepsMarkup(result) {
  if (!result) {
    return `<div class="roadmap-card"><div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-6"></path></svg><div class="font-bold text-leaf-900">Tier yol haritasi kilitli</div><div class="text-sm text-leaf-800/60 mt-2">Yol haritasi olusmasi icin once dogrulama testini tamamla.</div></div></div>`;
  }

  const template = ROADMAP_TEMPLATES[result.tier] || ROADMAP_TEMPLATES[1];
  const isMaxTier = Number(result.tier) >= 3;
  return `
    <div class="roadmap-card">
      <div class="flex items-start justify-between gap-3 flex-wrap mb-5">
        <div>
          <div class="eyebrow">Tier Yukselme Yol Haritasi</div>
          <div class="font-bold text-leaf-900 mt-1 text-lg">${isMaxTier ? "Maksimum tier seviyesindesin" : `Tier ${result.tier}'den Tier ${template.targetTier}'ye gecis planin`}</div>
          <div class="text-xs text-leaf-800/60 mt-1">${isMaxTier ? "Odak noktasi mevcut seviyeyi korumak ve yenileme adimlarini kacirmamak." : "AI, bir ust seviyeye cikis icin en etkili adimlari onceliklendirdi."}</div>
        </div>
        <span class="roadmap-pill">${template.steps.filter((item) => item.status === "tamamlandi").length}/${template.steps.length} tamamlandi</span>
      </div>
      <div class="roadmap-stepper">
        ${template.steps.map((step, index) => `
          <div class="roadmap-step ${step.status === "devam" ? "current" : ""} ${step.status === "tamamlandi" ? "done" : ""}">
            ${aiGetStepMarker(step.status, index)}
            <div>
              <div class="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div class="font-semibold text-leaf-900 text-base">${step.title}</div>
                  <div class="text-sm text-leaf-800/62 mt-1">${step.description}</div>
                </div>
                <button class="roadmap-action-btn">${step.cta}</button>
              </div>
              <div class="step-meta">${aiGetPriorityBadge(step.priority)}${aiGetStatusBadge(step.status)}<span class="impact-badge">Etki · ${step.impact} puan</span></div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function getAiRoadmapCarbonMarkup(carbonResult) {
  if (!carbonResult) {
    return `<div class="roadmap-card"><div class="eyebrow">Karbon Ayak Izi Iyilestirme Plani</div><div class="font-bold text-leaf-900 mt-1 text-lg">Karbon verisi bulunamadi</div><div class="empty-state mt-4"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path><path d="M9 9h.01"></path><path d="M15 9h.01"></path><path d="M8 15c1 1 2.5 1.5 4 1.5s3-.5 4-1.5"></path></svg><div class="font-bold text-leaf-900">Karbon iyilestirme plani icin veri eksik</div><div class="text-sm text-leaf-800/60 mt-2">Karbon iyilestirme plani icin once karbon ayak izi hesaplamasini tamamla.</div></div></div>`;
  }

  const recommendations = aiBuildCarbonRecommendations(carbonResult);
  return `
    <div class="roadmap-card">
      <div class="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <div class="eyebrow">Karbon Ayak Izi Iyilestirme Plani</div>
          <div class="font-bold text-leaf-900 mt-1 text-lg">Aylik emisyonu azaltmak icin oneri seti</div>
          <div class="text-xs text-leaf-800/60 mt-1">Kayitli toplam sonuc: ${aiFmtNum(carbonResult.total)} kg CO2e · ${carbonResult.month === "last" ? "onceki ay" : "bu ay"}</div>
        </div>
        <span class="roadmap-pill">${recommendations.length} oneri</span>
      </div>
      <div class="carbon-list">
        ${recommendations.map((item) => `
          <div class="carbon-item">
            <div class="flex items-start justify-between gap-3 flex-wrap">
              <div><div class="font-semibold text-leaf-900">${item.title}</div><div class="text-sm text-leaf-800/62 mt-1">${item.detail}</div></div>
              ${aiGetStatusBadge(item.status)}
            </div>
            <div class="carbon-meta">
              <div class="meta-box"><div class="eyebrow">Beklenen Azaltim</div><div class="font-bold text-leaf-900 mt-1">${item.reduction}</div></div>
              <div class="meta-box"><div class="eyebrow">Zorluk</div><div class="font-bold text-leaf-900 mt-1">${item.difficulty}</div></div>
              <div class="meta-box"><div class="eyebrow">Tahmini Sure</div><div class="font-bold text-leaf-900 mt-1">${item.duration}</div></div>
              <div class="meta-box"><div class="eyebrow">Oncelik</div><div class="font-bold text-leaf-900 mt-1">${item.priority === "yuksek" ? "Yuksek" : "Orta"}</div></div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function getAiRoadmapPriorityActionsMarkup(result, carbonResult) {
  const template = result ? (ROADMAP_TEMPLATES[result.tier] || ROADMAP_TEMPLATES[1]) : { steps: [] };
  const carbonRecommendations = aiBuildCarbonRecommendations(carbonResult);
  const actions = result ? aiBuildTopActions(result, carbonResult, template.steps, carbonRecommendations) : [];

  return `
    <div class="roadmap-card">
      <div class="eyebrow">Oncelikli Aksiyonlar</div>
      <div class="font-bold text-leaf-900 mt-1 text-lg">AI'in sectigi ilk 3 aksiyon</div>
      ${!result ? `<div class="empty-state mt-4"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 2 7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4Z"></path></svg><div class="font-bold text-leaf-900">Aksiyon onerisi hazir degil</div><div class="text-sm text-leaf-800/60 mt-2">Dogrulama testi tamamlandiginda AI en kritik 3 adimi burada siralar.</div></div>` : `<div class="action-list mt-4">${actions.map((item, index) => `<div class="action-item"><div class="flex items-center gap-3"><div class="step-marker ${index === 0 ? "progress" : "todo"}">${index + 1}</div><div class="font-semibold text-leaf-900">${item}</div></div></div>`).join("")}</div>`}
    </div>
  `;
}

function getAiRoadmapSummaryMarkup(result) {
  const template = result ? (ROADMAP_TEMPLATES[result.tier] || ROADMAP_TEMPLATES[1]) : null;
  const completed = template ? template.steps.filter((item) => item.status === "tamamlandi").length : 0;
  const total = template ? template.steps.length : 0;
  const progress = template ? template.progress : 0;
  const nextLevel = !result ? "Tier bilgisi yok" : (Number(result.tier) >= 3 ? "Tier 3 korunuyor" : `Tier ${template.targetTier}`);

  return `
    <div class="summary-card">
      <div class="eyebrow">Genel Ilerleme Karti</div>
      <div class="font-bold text-leaf-900 mt-1 text-lg">Bir sonraki seviye durumu</div>
      ${!result ? `<div class="text-sm text-leaf-800/60 mt-3">Yuzdelik ilerleme gormek icin once dogrulama testi tamamlanmali.</div>` : `
        <div class="mt-4">
          <div class="flex items-center justify-between text-[11px] font-mono text-leaf-800/55 mb-1.5"><span>Tier ilerlemesi</span><span class="font-semibold text-leaf-700">%${progress}</span></div>
          <div class="roadmap-progress"><div class="roadmap-progress-fill" style="width:${progress}%"></div></div>
        </div>
        <div class="roadmap-kpi-grid mt-4">
          <div class="meta-box"><div class="eyebrow">Tamamlanan aksiyon</div><div class="font-bold text-leaf-900 mt-1">${completed}/${total}</div></div>
          <div class="meta-box"><div class="eyebrow">Bir sonraki seviye</div><div class="font-bold text-leaf-900 mt-1">${nextLevel}</div></div>
          <div class="meta-box"><div class="eyebrow">Guven skoru</div><div class="font-bold text-leaf-900 mt-1">${result.trustScore || result.score}/100</div></div>
        </div>
      `}
    </div>
  `;
}

function renderAiRoadmap() {
  const root = getAiRoadmapRoot();
  if (!root) return;

  document.body.setAttribute("data-layout", "a");
  document.body.setAttribute("data-density", "comfortable");
  document.body.setAttribute("data-accent", "leaf");

  const verificationResult = getAiRoadmapVerificationResult();
  const carbonResult = getAiRoadmapCarbonResult();

  root.innerHTML = `
    <section class="roadmap-view">
      <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 class="text-[2.1rem] lg:text-[2.4rem] font-black text-leaf-900 tracking-tight leading-[1.05]">AI Yol Haritasi</h1>
          <p class="mt-1.5 text-leaf-800/65 text-sm max-w-2xl">Dogrulama testinden cikan AI analizi, tier yukselme adimlari ve karbon ayak izi iyilestirme plani ayni panelde birlesir.</p>
        </div>
        <div class="flex items-center gap-2"><span class="roadmap-pill"><span class="w-1.5 h-1.5 rounded-full bg-leaf-500"></span>${verificationResult ? "AI analizi hazir" : "Analiz bekleniyor"}</span></div>
      </div>
      <div class="roadmap-grid">
        <div class="roadmap-stack">
          ${getAiRoadmapAnalysisMarkup(verificationResult)}
          ${getAiRoadmapStepsMarkup(verificationResult)}
          ${getAiRoadmapCarbonMarkup(carbonResult)}
        </div>
        <div class="roadmap-stack">
          ${getAiRoadmapPriorityActionsMarkup(verificationResult, carbonResult)}
          ${getAiRoadmapSummaryMarkup(verificationResult)}
        </div>
      </div>
    </section>
  `;
}
