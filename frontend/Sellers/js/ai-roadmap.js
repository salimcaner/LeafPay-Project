const AI_ROADMAP_VERIFICATION_RESULT_KEY = "leafpay_verification_result";
const SELLER_CARBON_RESULT_STORAGE_KEY = "leafpay_seller_carbon_result";


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
  if (!result || !result.ai) return null;
  const ai = result.ai;
  return {
    strengths: Array.isArray(ai.guclu_yonler) ? ai.guclu_yonler.slice(0, 3) : [],
    weaknesses: Array.isArray(ai.zayif_yonler) ? ai.zayif_yonler.slice(0, 3) : [],
    summary: ai.ozet || "",
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

function aiBuildTopActions(result) {
  if (!result || !result.ai || !Array.isArray(result.ai.oneriler) || !result.ai.oneriler.length) return [];
  return result.ai.oneriler.slice(0, 3);
}

const _EMPTY_ANALYSIS = `<div class="roadmap-card"><div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg><div class="font-bold text-leaf-900">AI analizi henüz üretilmedi</div><div class="text-sm text-leaf-800/60 mt-2">Doğrulama testini tamamladığında AI gerçek analizi burada gösterir.</div></div></div>`;

function getAiRoadmapAnalysisMarkup(result) {
  const insights = aiInferStrengthsAndWeaknesses(result);
  if (!insights) return _EMPTY_ANALYSIS;

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
        ${(insights.strengths.length || insights.weaknesses.length) ? `
        <div class="grid sm:grid-cols-2 gap-4 mt-5">
          ${insights.strengths.length ? `<div><div class="eyebrow text-amber-400/80 mb-2">Guclu Alanlar</div><div class="insight-list">${insights.strengths.map((item) => `<div class="insight-item bg-white/5 border-white/10 text-white/90">${item}</div>`).join("")}</div></div>` : ""}
          ${insights.weaknesses.length ? `<div><div class="eyebrow text-amber-400/80 mb-2">Zayif Alanlar</div><div class="insight-list">${insights.weaknesses.map((item) => `<div class="insight-item bg-white/5 border-white/10 text-white/90">${item}</div>`).join("")}</div></div>` : ""}
        </div>` : ""}
        ${insights.summary ? `<div class="mt-5 text-sm text-white/72">${insights.summary}</div>` : ""}
      </div>
    </div>
  `;
}

function getAiRoadmapStepsMarkup(result) {
  const hasSteps = result && result.ai && Array.isArray(result.ai.yol_haritasi) && result.ai.yol_haritasi.length;
  if (!hasSteps) {
    return `<div class="roadmap-card"><div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-6"></path></svg><div class="font-bold text-leaf-900">Yol haritası henüz üretilmedi</div><div class="text-sm text-leaf-800/60 mt-2">Doğrulama testini tamamladığında AI kişisel yol haritanı oluşturur.</div></div></div>`;
  }

  const isMaxTier = Number(result.tier) >= 3;
  const targetTier = isMaxTier ? 3 : Number(result.tier) + 1;
  const steps = result.ai.yol_haritasi.map((s) => ({
    title: s.baslik || "",
    description: s.aciklama || "",
    priority: s.oncelik || "orta",
    impact: s.etki_puani || 10,
    status: s.durum || "yapilacak",
    cta: s.eylem || "Baslat",
  }));
  const doneCount = steps.filter((s) => s.status === "tamamlandi").length;

  return `
    <div class="roadmap-card">
      <div class="flex items-start justify-between gap-3 flex-wrap mb-5">
        <div>
          <div class="eyebrow">Tier Yukselme Yol Haritasi · AI Olusturdu</div>
          <div class="font-bold text-leaf-900 mt-1 text-lg">${isMaxTier ? "Maksimum tier seviyesindesin" : `Tier ${result.tier}'den Tier ${targetTier}'ye gecis planin`}</div>
          <div class="text-xs text-leaf-800/60 mt-1">${isMaxTier ? "Odak noktasi mevcut seviyeyi korumak ve yenileme adimlarini kacirmamak." : "AI, bir ust seviyeye cikis icin en etkili adimlari onceliklendirdi."}</div>
        </div>
        <span class="roadmap-pill">${doneCount}/${steps.length} tamamlandi</span>
      </div>
      <div class="roadmap-stepper">
        ${steps.map((step, index) => `
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
  const actions = aiBuildTopActions(result);
  const hasActions = actions.length > 0;

  return `
    <div class="roadmap-card">
      <div class="eyebrow">Oncelikli Aksiyonlar</div>
      <div class="font-bold text-leaf-900 mt-1 text-lg">AI'in sectigi ilk 3 aksiyon</div>
      ${!hasActions
        ? `<div class="empty-state mt-4"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 2 7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4Z"></path></svg><div class="font-bold text-leaf-900">Aksiyon önerisi henüz üretilmedi</div><div class="text-sm text-leaf-800/60 mt-2">Doğrulama testini tamamladığında AI en kritik 3 adımı burada sıralar.</div></div>`
        : `<div class="action-list mt-4">${actions.map((item, index) => `<div class="action-item"><div class="flex items-center gap-3"><div class="step-marker ${index === 0 ? "progress" : "todo"}">${index + 1}</div><div class="font-semibold text-leaf-900">${item}</div></div></div>`).join("")}</div>`}
    </div>
  `;
}

function getAiRoadmapSummaryMarkup(result) {
  const hasAi = result && result.ai;
  const aiSteps = (hasAi && Array.isArray(result.ai.yol_haritasi) && result.ai.yol_haritasi.length)
    ? result.ai.yol_haritasi : null;
  const completed = aiSteps ? aiSteps.filter((s) => s.durum === "tamamlandi").length : 0;
  const total = aiSteps ? aiSteps.length : 0;

  const score = hasAi && result.ai.skor != null ? result.ai.skor : (result ? result.score : 0);
  const tier = result ? Number(result.tier) : 0;
  let progress = 0;
  if (tier === 0) progress = Math.round(Math.min(score / 40, 1) * 100);
  else if (tier === 1) progress = Math.round(Math.min((score - 40) / 20, 1) * 100);
  else if (tier === 2) progress = Math.round(Math.min((score - 60) / 20, 1) * 100);
  else progress = 100;

  const nextLevel = !result ? "Tier bilgisi yok" : (tier >= 3 ? "Tier 3 korunuyor" : `Tier ${tier + 1}`);

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

function _aiRoadmapRender(root, verificationResult, carbonResult) {
  const hasAi = verificationResult && verificationResult.ai;
  root.innerHTML = `
    <section class="roadmap-view">
      <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 class="text-[2.1rem] lg:text-[2.4rem] font-black text-leaf-900 tracking-tight leading-[1.05]">AI Yol Haritasi</h1>
          <p class="mt-1.5 text-leaf-800/65 text-sm max-w-2xl">Dogrulama testinden cikan AI analizi, tier yukselme adimlari ve karbon ayak izi iyilestirme plani ayni panelde birlesir.</p>
        </div>
        <div class="flex items-center gap-2"><span class="roadmap-pill"><span class="w-1.5 h-1.5 rounded-full bg-leaf-500"></span>${hasAi ? "AI analizi hazir" : "Analiz bekleniyor"}</span></div>
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

async function renderAiRoadmap() {
  const root = getAiRoadmapRoot();
  if (!root) return;

  document.body.setAttribute("data-layout", "a");
  document.body.setAttribute("data-density", "comfortable");
  document.body.setAttribute("data-accent", "leaf");

  let verificationResult = getAiRoadmapVerificationResult();
  const carbonResult = getAiRoadmapCarbonResult();

  // Hemen mevcut veriyle göster (boş state olsa bile)
  _aiRoadmapRender(root, verificationResult, carbonResult);

  // AI verisi localStorage'da yoksa Supabase'den çek ve hydrate et
  if (verificationResult && !verificationResult.ai) {
    try {
      const token = (typeof getAuthState === "function") ? (getAuthState().token || "") : "";
      const base = typeof getApiBaseUrl === "function" ? getApiBaseUrl() : "";
      const res = await fetch(base + "/satici/rozet", {
        headers: { "Authorization": "Bearer " + token },
      });
      if (res.ok) {
        const data = await res.json();
        const aktif = data.aktif_rozet;
        if (aktif && aktif.ai_analiz) {
          verificationResult.ai = aktif.ai_analiz;
          // Aynı zamanda localStorage'ı güncelle
          try { localStorage.setItem(AI_ROADMAP_VERIFICATION_RESULT_KEY, JSON.stringify(verificationResult)); } catch (e) { /* ignore */ }
          // Yeniden render et — bu sefer AI verisiyle
          _aiRoadmapRender(root, verificationResult, carbonResult);
        }
      }
    } catch (e) { /* sessiz hata — ilk render zaten gösterildi */ }
  }
}
