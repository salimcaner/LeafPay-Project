/* ============================================================
 * Rozet Durumu sayfası
 *  - localStorage: leafpay_verification_result okur
 *  - Sonuç yoksa: empty-state göster (rozet/tier/skor/cert/timeline yok)
 *  - Sonuç varsa: tam rozet UI'ı göster
 *  - "Değerlendirme Testini Başlat" → verification-test.html
 * ============================================================ */

const BS_RESULT_KEY = "leafpay_verification_result";
const BS_DRAFT_KEY  = "leafpay_verification_draft";

function getVerificationResult() {
  try {
    const raw = localStorage.getItem(BS_RESULT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.status !== "completed") return null;
    return parsed;
  } catch (e) {
    return null;
  }
}

function hasDraft() {
  try {
    const raw = localStorage.getItem(BS_DRAFT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return !!parsed && parsed.answers && Object.keys(parsed.answers).length > 0;
  } catch (e) {
    return false;
  }
}

async function renderBadgeStatus() {
  const root = document.getElementById("dashboard-root");
  if (!root) return;
  const targetView = "rozet-durumu";

  // Optimistic render from localStorage cache
  const cached = getVerificationResult();
  if (cached) {
    renderBadgeCompleted(root, cached);
  } else {
    renderBadgeEmpty(root, hasDraft());
  }
  bindBadgeStatusEvents();

  // Fetch authoritative data from server
  let apiData = null;
  try {
    const token = (typeof getAuthState === "function") ? (getAuthState().token || "") : "";
    const base = typeof getApiBaseUrl === "function" ? getApiBaseUrl() : "";
    const res = await fetch(base + "/satici/rozet", {
      headers: { "Authorization": "Bearer " + token },
    });
    if (res.ok) apiData = await res.json();
  } catch (e) { /* keep cached render */ }

  if (document.body.getAttribute("data-seller-view") !== targetView) return;
  if (!apiData) return;

  const apiRozet   = apiData.aktif_rozet;
  const apiBelgeler = Array.isArray(apiData.belgeler) ? apiData.belgeler : [];
  const hasDraftApi = !!(apiData.taslak && apiData.taslak.cevaplar && Object.keys(apiData.taslak.cevaplar).length > 0);

  if (apiRozet) {
    const result = {
      status: "completed",
      score:      apiRozet.skor || 0,
      tier:       apiRozet.tier || 0,
      badgeId:    apiRozet.rozet_id || "—",
      earnedAt:   apiRozet.kazanim_tarihi  ? apiRozet.kazanim_tarihi.slice(0, 10)  : "—",
      validUntil: apiRozet.gecerlilik_sonu ? apiRozet.gecerlilik_sonu.slice(0, 10) : "—",
      trustScore: apiRozet.guven_skoru || apiRozet.skor || 0,
      answers:    apiRozet.cevaplar || {},
      breakdown:  Array.isArray(apiRozet.kirilim) ? apiRozet.kirilim : [],
      certs: apiBelgeler.map((b) => ({
        id:    b.soru_id,
        title: (typeof vtFindQuestionTitle === "function") ? vtFindQuestionTitle(b.soru_id) : b.soru_id,
        name:  b.dosya_adi,
      })),
    };
    try { localStorage.setItem(BS_RESULT_KEY, JSON.stringify(result)); } catch (e) { /* ignore */ }
    if (document.body.getAttribute("data-seller-view") !== targetView) return;
    renderBadgeCompleted(root, result);
  } else {
    if (cached) {
      try { localStorage.removeItem(BS_RESULT_KEY); } catch (e) { /* ignore */ }
    }
    if (document.body.getAttribute("data-seller-view") !== targetView) return;
    renderBadgeEmpty(root, hasDraftApi);
  }
  bindBadgeStatusEvents();
}

/* ------------ EMPTY STATE ------------ */
function renderBadgeEmpty(root, draftActive) {
  if (draftActive === undefined) draftActive = hasDraft();
  const ctaLabel = draftActive ? "Teste devam et" : "Değerlendirme Testini Başlat";
  const draftBadge = draftActive
    ? `<span class="pill-mono" style="background:#FFFBF1;border-color:#F1D69B;color:#C77A0F;">
         <span class="w-1.5 h-1.5 rounded-full" style="background:#EF9F27;"></span>
         Taslak cevaplar saklandı
       </span>`
    : `<span class="pill-mono">
         <span class="w-1.5 h-1.5 rounded-full" style="background:#1D9E75;"></span>
         Henüz değerlendirilmedi
       </span>`;

  root.innerHTML = `
    <section class="badge-wrap">
      <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 class="text-[2.1rem] lg:text-[2.4rem] font-black text-leaf-900 tracking-tight leading-[1.05]">Rozet Durumu</h1>
          <p class="mt-1.5 text-leaf-800/65 text-sm max-w-xl">LeafPay sertifikasyon seviyeni, AI güven skorunu ve geçerli belgelerini buradan takip et.</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">${draftBadge}</div>
      </div>

      <div class="badge-grid">

        <!-- HERO empty -->
        <div class="badge-area-hero empty-state-hero">
          <div class="empty-badge-disc">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div class="eyebrow-mono" style="color:#F5B656;">LEAFPAY ROZETİ</div>
          <h2 class="text-2xl lg:text-3xl font-black tracking-tight mt-1.5">Rozet henüz oluşturulmadı</h2>
          <p class="text-sm text-white/65 mt-2 max-w-md mx-auto">Rozet seviyeni görmek için önce doğrulama testini tamamla.</p>
          <div class="mt-6 flex flex-wrap gap-2 justify-center">
            <button class="btn-amber" data-badge-cta>
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              ${ctaLabel}
            </button>
          </div>
        </div>

        <!-- TIERS empty -->
        <div class="badge-area-tiers badge-card">
          <div class="flex items-end justify-between mb-5 flex-wrap gap-3">
            <div>
              <div class="eyebrow-mono">Tier Seviyeleri</div>
              <h3 class="font-bold text-leaf-900 mt-1 text-lg">3 seviyeli sertifikasyon</h3>
              <p class="text-xs text-leaf-800/55 mt-1">Tier bilgisi için testi çözmelisin.</p>
            </div>
          </div>
          <div class="grid sm:grid-cols-3 gap-3">
            ${[1,2,3].map((n) => `
              <div class="tier-card empty">
                <div class="flex items-start justify-between mb-3">
                  <div class="tier-glyph">0${n}</div>
                  <span class="text-[9px] font-mono text-leaf-800/40 bg-leaf-50 border border-leaf-200 px-1.5 py-0.5 rounded">kilitli</span>
                </div>
                <div class="font-bold text-base text-leaf-900/40">${["Başlangıç","Onaylı","Doğrulanmış"][n-1]}</div>
                <div class="text-[11px] text-leaf-800/40 mt-1">Test sonucundan sonra atanır.</div>
                <div class="mt-3 pt-3 border-t border-leaf-100 grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div><div class="text-leaf-800/45">Test skoru</div><div class="text-leaf-800/45 font-semibold mt-0.5">${["40 – 64","65 – 84","85 – 100"][n-1]}</div></div>
                  <div><div class="text-leaf-800/45">VERA ödülü</div><div class="text-leaf-800/45 font-semibold mt-0.5">${["+20","+50","+80"][n-1]} / seçim</div></div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- TEST INTRO empty -->
        <div class="badge-area-test badge-card">
          <div class="flex items-start justify-between flex-wrap gap-3 mb-5">
            <div>
              <div class="eyebrow-mono">AI Değerlendirme Testi</div>
              <h3 class="font-bold text-leaf-900 mt-1 text-lg">Rozet seviyeni belirleyen test</h3>
              <p class="text-xs text-leaf-800/60 mt-1 max-w-xl">Doğrulama testi tamamlanmadı. 5 bölüm + AI doğrulama sonrası rozet ataması yapılır.</p>
            </div>
          </div>

          <div class="empty-card mb-5" style="min-height:160px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/></svg>
            <div class="empty-title">Henüz test sonucu yok</div>
            <div class="empty-sub">Testi tamamladıktan sonra son sonuç, bölüm kırılımı ve süre burada görünecek.</div>
          </div>

          <button class="btn-amber" data-badge-cta style="width:100%;justify-content:center;padding:14px;font-size:14px;">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            ${ctaLabel}
          </button>
        </div>

        <!-- TRUST empty -->
        <div class="badge-area-trust badge-card">
          <div class="flex items-start justify-between mb-4 flex-wrap gap-3">
            <div>
              <div class="eyebrow-mono">AI Güven Skoru</div>
              <h3 class="font-bold text-leaf-900 mt-1 text-lg">Doğrulama kırılımı</h3>
            </div>
          </div>
          <div class="empty-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
            <div class="empty-title">Güven skoru henüz hesaplanmadı</div>
            <div class="empty-sub">Güven skoru test kaydedildikten sonra hesaplanır.</div>
          </div>
        </div>

        <!-- CERTS empty -->
        <div class="badge-area-certs badge-card">
          <div class="flex items-start justify-between mb-4 flex-wrap gap-2">
            <div>
              <div class="eyebrow-mono">Belgeler & Sertifikalar</div>
              <h3 class="font-bold text-leaf-900 mt-1 text-lg">Aktif & yenileme gerekenler</h3>
            </div>
          </div>
          <div class="empty-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <div class="empty-title">Henüz belge yüklenmedi</div>
            <div class="empty-sub">Belgeler test sırasında yüklendikten sonra burada görünür.</div>
          </div>
        </div>

        <!-- TIMELINE empty -->
        <div class="badge-area-time badge-card">
          <div class="flex items-start justify-between mb-5 flex-wrap gap-2">
            <div>
              <div class="eyebrow-mono">Rozet Tarihçesi</div>
              <h3 class="font-bold text-leaf-900 mt-1 text-lg">Yükseliş ve doğrulama günlüğü</h3>
            </div>
          </div>
          <div class="empty-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <div class="empty-title">Henüz değerlendirme geçmişi yok</div>
            <div class="empty-sub">İlk testini tamamladıktan sonra tüm tarihler burada listelenir.</div>
          </div>
        </div>

        <!-- EMBED empty -->
        <div class="badge-area-embed badge-card">
          <div class="eyebrow-mono">Rozeti Paylaş</div>
          <h3 class="font-bold text-leaf-900 mt-1 text-lg">Sitende & e-posta imzanda göster</h3>
          <p class="text-xs text-leaf-800/60 mt-1.5">Rozet oluşturulduktan sonra gömme kodu ve public profil linki burada görünür.</p>
          <div class="empty-card mt-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            <div class="empty-title">Paylaşım hazır değil</div>
            <div class="empty-sub">Test tamamlandığında otomatik aktif olur.</div>
          </div>
        </div>
      </div>
    </section>
  `;
}

/* ------------ COMPLETED STATE ------------ */
function renderBadgeCompleted(root, result) {
  const score = Math.round(result.score || 0);
  const trustScore = Math.round(result.trustScore || score);
  const tier = result.tier;
  const badgeId = result.badgeId || "—";
  const earnedAt = result.earnedAt || "—";
  const validUntil = result.validUntil || "—";
  const breakdown = Array.isArray(result.breakdown) ? result.breakdown : [];
  const certs = Array.isArray(result.certs) ? result.certs : [];

  const tierName = ["Aday", "Başlangıç", "Onaylı", "Doğrulanmış"][tier] || "Doğrulanmış";

  // gauge dash: circumference = 2*pi*80 = 502.65
  const dashOffset = Math.max(0, 502.65 - (trustScore / 100) * 502.65);

  root.innerHTML = `
    <section class="badge-wrap">
      <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 class="text-[2.1rem] lg:text-[2.4rem] font-black text-leaf-900 tracking-tight leading-[1.05]">Rozet Durumu</h1>
          <p class="mt-1.5 text-leaf-800/65 text-sm max-w-xl">LeafPay sertifikasyon seviyeni, AI güven skorunu ve geçerli belgelerini buradan takip et.</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <span class="pill-mono"><span class="w-1.5 h-1.5 rounded-full" style="background:#1D9E75;"></span>Doğrulanmış · ${escapeHtml(badgeId)}</span>
        </div>
      </div>

      <div class="badge-grid">

        <!-- HERO -->
        <div class="badge-area-hero badge-card-dark" style="box-shadow:0 28px 56px -16px rgba(29,158,117,0.40), 0 10px 24px -8px rgba(29,158,117,0.20);">
          <div class="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none" style="background:rgba(29,158,117,.2); filter:blur(40px);"></div>
          <div class="relative grid lg:grid-cols-[auto,1fr] gap-7 items-center">
            <div class="relative w-[180px] h-[180px] mx-auto">
              <div class="absolute inset-0 rounded-full badge-ring spin-slow-bs opacity-90"></div>
              <div class="absolute inset-[10px] rounded-full bg-leaf-500 flex items-center justify-center">
                <div class="absolute inset-3 rounded-full border-2 border-dashed border-white/30"></div>
                <div class="relative text-center text-white">
                  <div class="text-[9px] font-mono uppercase tracking-widest text-white/70">Tier</div>
                  <div class="text-[3rem] font-black leading-none">${tier}</div>
                  <div class="text-[9px] font-mono uppercase tracking-widest text-amber-300 mt-1">Doğrulanmış ✓</div>
                </div>
              </div>
              <div class="absolute -top-1 -right-1 w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-leaf-900 shadow-lg">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 14.5 8.5 21 9.3 16 13.9 17.3 20.5 12 17.3 6.7 20.5 8 13.9 3 9.3 9.5 8.5z"/></svg>
              </div>
            </div>

            <div>
              <div class="text-[11px] font-mono text-amber-400 tracking-widest mb-1.5">LEAFPAY ROZETİ</div>
              <h2 class="text-3xl lg:text-4xl font-black tracking-tight leading-tight">Tier ${tier} · ${escapeHtml(tierName)} Yeşil Satıcı</h2>
              <p class="text-sm text-white/65 mt-2 max-w-xl">AI doğrulamasından geçmiş ve aktif yeşil seçim kampanyasına sahip satıcı.</p>

              <div class="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <div class="text-[10px] font-mono text-amber-400/80 tracking-widest uppercase">Rozet ID</div>
                  <div class="font-mono text-sm font-semibold text-white mt-1 truncate">${escapeHtml(badgeId)}</div>
                </div>
                <div>
                  <div class="text-[10px] font-mono text-amber-400/80 tracking-widest uppercase">Geçerli</div>
                  <div class="font-mono text-sm font-semibold text-white mt-1">${escapeHtml(validUntil)}</div>
                </div>
                <div>
                  <div class="text-[10px] font-mono text-amber-400/80 tracking-widest uppercase">Kazanım</div>
                  <div class="font-mono text-sm font-semibold text-white mt-1">${escapeHtml(earnedAt)}</div>
                </div>
                <div>
                  <div class="text-[10px] font-mono text-amber-400/80 tracking-widest uppercase">Güven</div>
                  <div class="font-mono text-sm font-semibold text-amber-400 mt-1">${trustScore} / 100</div>
                </div>
              </div>

              <div class="mt-6 flex flex-wrap gap-2">
                <button class="btn-amber" data-badge-cta>
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
                  Testi yeniden çöz
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- TIER YÜKSELTMEti -->
        <div class="badge-area-upgrade badge-card" id="bs-upgrade-card">
          ${bsUpgradeCardMarkup(tier)}
        </div>

        <!-- TIERS -->
        <div class="badge-area-tiers badge-card">
          <div class="flex items-end justify-between mb-5 flex-wrap gap-3">
            <div>
              <div class="eyebrow-mono">Tier Seviyeleri</div>
              <h3 class="font-bold text-leaf-900 mt-1 text-lg">3 seviyeli sertifikasyon</h3>
              <p class="text-xs text-leaf-800/55 mt-1">Test skoruna göre tier ataması otomatik yapılır.</p>
            </div>
            <span class="pill-mono">Mevcut: Tier ${tier}</span>
          </div>
          <div class="grid sm:grid-cols-3 gap-3">
            ${[1,2,3].map((n) => {
              const cls = tier === n ? "current" : (tier > n ? "earned" : "future");
              const tag = tier === n
                ? `<span class="text-[9px] font-mono text-amber-300 bg-white/10 border border-white/20 px-1.5 py-0.5 rounded">● mevcut</span>`
                : (tier > n
                    ? `<span class="text-[9px] font-mono text-leaf-700 bg-leaf-50 border border-leaf-200 px-1.5 py-0.5 rounded">✓ kazanıldı</span>`
                    : `<span class="text-[9px] font-mono text-leaf-700 bg-leaf-50 border border-leaf-200 px-1.5 py-0.5 rounded">kilitli</span>`);
              const nameClass = cls === "current" ? "" : "text-leaf-900";
              const txtMuted = cls === "current" ? "text-white/70" : "text-leaf-800/65";
              const labelMuted = cls === "current" ? "text-white/55" : "text-leaf-800/55";
              const valColor = cls === "current" ? "text-amber-300" : "text-leaf-700";
              return `
                <div class="tier-card ${cls}">
                  <div class="flex items-start justify-between mb-3">
                    <div class="tier-glyph">0${n}</div>
                    ${tag}
                  </div>
                  <div class="font-bold text-base ${nameClass}">${["Başlangıç","Onaylı","Doğrulanmış"][n-1]}</div>
                  <div class="text-[11px] ${txtMuted} mt-1">${["Temel yeşil uygulamalar.","Sertifika + operasyon kanıtı.","En yüksek seviye · tam onay."][n-1]}</div>
                  <div class="mt-3 pt-3 border-t ${cls === "current" ? "border-white/15" : "border-leaf-100"} grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div><div class="${labelMuted}">Test skoru</div><div class="${valColor} font-semibold mt-0.5">${["40 – 64","65 – 84","85 – 100"][n-1]}</div></div>
                    <div><div class="${labelMuted}">VERA ödülü</div><div class="${valColor} font-semibold mt-0.5">+${[20,50,80][n-1]} / seçim</div></div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <!-- TEST result -->
        <div class="badge-area-test badge-card">
          <div class="flex items-start justify-between flex-wrap gap-3 mb-5">
            <div>
              <div class="eyebrow-mono">AI Değerlendirme Testi</div>
              <h3 class="font-bold text-leaf-900 mt-1 text-lg">Son sonuç</h3>
              <p class="text-xs text-leaf-800/60 mt-1 max-w-xl">Bölüm bazlı kırılım aşağıda.</p>
            </div>
            <span class="pill-mono"><span class="w-1.5 h-1.5 rounded-full" style="background:#1D9E75;"></span>Son test · ${escapeHtml(earnedAt)}</span>
          </div>

          <div class="bg-leaf-50 border border-leaf-200 rounded-2xl p-4 flex flex-wrap items-center gap-4 mb-5">
            <div class="relative w-14 h-14 flex-shrink-0">
              <div class="absolute inset-0 rounded-full badge-ring spin-slow-bs opacity-90"></div>
              <div class="absolute inset-[3px] rounded-full bg-leaf-500 flex items-center justify-center text-white text-[14px] font-black">T${tier}</div>
            </div>
            <div class="flex-1 min-w-[180px]">
              <div class="text-[10px] font-mono text-leaf-600 tracking-widest">SON SONUÇ</div>
              <div class="text-sm font-bold text-leaf-900 mt-0.5">${score} / 100 — Tier ${tier} · ${escapeHtml(tierName)}</div>
              <div class="text-[11px] text-leaf-800/60 font-mono mt-0.5">${breakdown.length} bölüm değerlendirildi</div>
            </div>
            <button class="text-[10px] font-mono font-semibold text-leaf-700 hover:text-leaf-900 transition" data-badge-cta>Testi yeniden çöz →</button>
          </div>

          <div class="space-y-3.5">
            ${breakdown.map((b) => `
              <div>
                <div class="flex items-center justify-between text-sm mb-1.5">
                  <span class="font-semibold text-leaf-900">${escapeHtml(b.title)}</span>
                  <span class="font-mono text-leaf-700 tabular-nums">${b.score}/${b.max} · %${b.pct}</span>
                </div>
                <div class="badge-progress h-2">
                  <div class="badge-progress-fill" style="width:${b.pct}%; background:${b.pct >= 70 ? "#1D9E75" : (b.pct >= 40 ? "#EF9F27" : "#F5B656")};"></div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- TRUST gauge -->
        <div class="badge-area-trust badge-card">
          <div class="flex items-start justify-between mb-4 flex-wrap gap-3">
            <div>
              <div class="eyebrow-mono">AI Güven Skoru</div>
              <h3 class="font-bold text-leaf-900 mt-1 text-lg">Doğrulama kırılımı</h3>
            </div>
            <span class="pill-mono">TÜRKAK onaylı</span>
          </div>

          <div class="grid sm:grid-cols-[auto,1fr] gap-5 items-center">
            <div class="gauge">
              <svg viewBox="0 0 200 200" class="w-full h-full" style="transform:rotate(-90deg);">
                <circle cx="100" cy="100" r="80" fill="none" stroke="#E1F5EE" stroke-width="20"/>
                <circle cx="100" cy="100" r="80" fill="none" stroke="url(#trust-grad-bs)" stroke-width="20" stroke-linecap="round" stroke-dasharray="502.65" stroke-dashoffset="${dashOffset}"/>
                <defs>
                  <linearGradient id="trust-grad-bs" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#1D9E75"/>
                    <stop offset="100%" stop-color="#085041"/>
                  </linearGradient>
                </defs>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <div class="metric-num text-[2.6rem] tabular-nums leading-none">${trustScore}</div>
                <div class="text-[10px] font-mono text-leaf-600 tracking-widest mt-0.5">/ 100</div>
              </div>
            </div>

            <div class="min-w-0">
              ${breakdown.slice(0, 5).map((b) => `
                <div class="gauge-row">
                  <span class="g-name">${escapeHtml(b.title)}</span>
                  <div class="g-track"><div class="g-fill" style="width:${b.pct}%;${b.pct < 80 ? "background:#F5B656;" : ""}"></div></div>
                  <span class="g-pct">${b.pct}</span>
                </div>
              `).join("")}
            </div>
          </div>
        </div>

        <!-- CERTS -->
        <div class="badge-area-certs badge-card">
          <div class="flex items-start justify-between mb-4 flex-wrap gap-2">
            <div>
              <div class="eyebrow-mono">Belgeler & Sertifikalar</div>
              <h3 class="font-bold text-leaf-900 mt-1 text-lg">Test sırasında yüklenen belgeler</h3>
            </div>
          </div>
          <div>
            ${certs.length === 0
              ? `<div class="empty-card">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <div class="empty-title">Bu testte belge yüklenmedi</div>
                  <div class="empty-sub">Belge yüklendikten sonra burada listelenir.</div>
                </div>`
              : certs.map((c) => `
                <div class="cert-row">
                  <div class="cert-icon">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-semibold text-sm text-leaf-900">${escapeHtml(c.title)}</span>
                      <span class="text-[9px] font-mono text-leaf-700 bg-leaf-50 border border-leaf-200 px-1.5 py-0.5 rounded">geçerli</span>
                    </div>
                    <div class="text-[11px] text-leaf-800/60 font-mono mt-0.5">${escapeHtml(c.name || "")}${c.size ? " · " + escapeHtml(c.size) : ""}</div>
                  </div>
                </div>
              `).join("")
            }
          </div>
        </div>

        <!-- TIMELINE -->
        <div class="badge-area-time badge-card">
          <div class="flex items-start justify-between mb-5 flex-wrap gap-2">
            <div>
              <div class="eyebrow-mono">Rozet Tarihçesi</div>
              <h3 class="font-bold text-leaf-900 mt-1 text-lg">Yükseliş ve doğrulama günlüğü</h3>
            </div>
          </div>
          <div class="timeline">
            <div class="timeline-item">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[11px] font-mono text-leaf-600">${escapeHtml(earnedAt)}</span>
                <span class="text-[9px] font-mono text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded">tier ataması</span>
              </div>
              <div class="font-semibold text-leaf-900 text-sm">Tier ${tier} — ${escapeHtml(tierName)} statüsü kazanıldı</div>
              <div class="text-[11px] text-leaf-800/55 mt-0.5">AI değerlendirme testi sonucu: ${score}/100</div>
            </div>
            <div class="timeline-item">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[11px] font-mono text-leaf-600">${escapeHtml(earnedAt)}</span>
              </div>
              <div class="font-semibold text-leaf-900 text-sm">Doğrulama testi tamamlandı</div>
              <div class="text-[11px] text-leaf-800/55 mt-0.5">${Object.keys(result.answers || {}).length} cevap kaydedildi, AI çapraz kontrol yapıldı.</div>
            </div>
          </div>
        </div>

        <!-- EMBED -->
        <div class="badge-area-embed badge-card">
          <div class="eyebrow-mono">Rozeti Paylaş</div>
          <h3 class="font-bold text-leaf-900 mt-1 text-lg">Sitende & e-posta imzanda göster</h3>
          <p class="text-xs text-leaf-800/60 mt-1.5">Public profil ya da gömme kodu kullanarak müşterilerine bu sertifikayı kanıtlayabilirsin.</p>
          <div class="mt-4 bg-leaf-50 border border-leaf-200 rounded-2xl p-4 flex items-center gap-3">
            <div class="relative w-12 h-12 flex-shrink-0">
              <div class="absolute inset-0 rounded-full badge-ring spin-slow-bs opacity-90"></div>
              <div class="absolute inset-[3px] rounded-full bg-leaf-500 flex items-center justify-center text-white text-[12px] font-black">T${tier}</div>
            </div>
            <div class="min-w-0">
              <div class="text-[10px] font-mono text-leaf-600 tracking-widest">LEAFPAY · TIER ${tier}</div>
              <div class="text-sm font-bold text-leaf-900 truncate" data-company-name>—</div>
              <div class="text-[11px] text-leaf-800/55 font-mono truncate">leafpay.io/r/${escapeHtml(badgeId)}</div>
            </div>
          </div>
          <div class="mt-4">
            <div class="text-[10px] font-mono uppercase tracking-widest text-leaf-600/80 mb-1.5">Gömme kodu</div>
            <div class="bg-leaf-900 text-leaf-100 rounded-2xl p-3 font-mono text-[11px] leading-relaxed overflow-x-auto">
&lt;a href="leafpay.io/r/${escapeHtml(badgeId)}"&gt;<br/>
&nbsp;&nbsp;&lt;img src="leafpay.io/badge/${escapeHtml(badgeId)}.svg" /&gt;<br/>
&lt;/a&gt;
            </div>
          </div>
        </div>

      </div>
    </section>
  `;

  if (typeof applyCompanyInfo === "function") applyCompanyInfo();
  bsBindUpgradeEvents(result);
}

/* ============================================================
 * TİER YÜKSELTME KARTI
 * ============================================================ */
function bsUpgradeCardMarkup(currentTier) {
  const stepHtml = (label, state) => {
    const cls = state === "active" ? "active" : state === "done" ? "done" : "locked";
    const icon = state === "done" ? "✓ " : "";
    return `<span class="upgrade-step ${cls}">${icon}${escapeHtml(label)}</span>`;
  };
  const arrowHtml = `<span class="upgrade-step-arrow">→</span>`;

  const steps = `
    <div class="upgrade-steps">
      ${stepHtml("Tier 1", currentTier > 1 ? "done" : "active")}
      ${arrowHtml}
      ${stepHtml("Tier 2", currentTier === 2 ? "active" : currentTier > 2 ? "done" : "locked")}
      ${arrowHtml}
      ${stepHtml("Tier 3", currentTier === 3 ? "active" : "locked")}
    </div>
  `;

  if (currentTier >= 3) {
    return `
      <div class="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <div class="eyebrow-mono">Tier Yükseltme</div>
          <h3 class="font-bold text-leaf-900 mt-1 text-lg">Sertifikasyon Durumu</h3>
        </div>
      </div>
      ${steps}
      <div class="upgrade-max-banner">
        <div class="upgrade-max-icon">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 14.5 8.5 21 9.3 16 13.9 17.3 20.5 12 17.3 6.7 20.5 8 13.9 3 9.3 9.5 8.5z"/></svg>
        </div>
        <div>
          <div class="font-bold text-sm text-leaf-900">En yüksek sertifikasyon seviyesindesiniz</div>
          <div class="text-xs text-leaf-800/60 mt-0.5">Tier 3 — Doğrulanmış statüsüne ulaştınız. Tebrikler!</div>
        </div>
      </div>
    `;
  }

  const nextTier = currentTier + 1;

  return `
    <div class="flex items-start justify-between flex-wrap gap-3 mb-4">
      <div>
        <div class="eyebrow-mono">Tier Yükseltme</div>
        <h3 class="font-bold text-leaf-900 mt-1 text-lg">Tier ${nextTier}'e yükselt</h3>
        <p class="text-xs text-leaf-800/60 mt-1">Sertifika belgenizi yükleyin. AI belgeyi analiz eder, uygunsa tierınız otomatik yükselir.</p>
      </div>
      <span class="pill-mono">PDF · JPG · PNG · 50 MB</span>
    </div>
    ${steps}
    <div class="mt-4">
      <input type="file" id="upg-file-input" class="hidden" accept=".pdf,.jpg,.jpeg,.png" />
      <div id="upg-drop-zone" class="bs-esg-drop" style="padding:28px 24px;">
        <div id="upg-drop-content">
          <div class="bs-esg-icon-wrap" style="width:48px;height:48px;margin-bottom:12px;">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div class="font-semibold text-sm text-leaf-900">Belge yükle</div>
          <div class="text-xs text-leaf-800/55 font-mono mt-1">PDF · JPG · PNG · Maks. 50 MB</div>
        </div>
      </div>
      <div id="upg-error" class="bs-esg-error"></div>
      <button id="upg-analyze-btn" class="bs-analyze-btn" disabled>
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        Belgeyi Doğrula
      </button>
    </div>
    <div id="upg-result" style="display:none;margin-top:14px;"></div>
  `;
}

function bsBindUpgradeEvents(currentResult) {
  const card = document.getElementById("bs-upgrade-card");
  if (!card) return;

  const fileInput = card.querySelector("#upg-file-input");
  const dropZone  = card.querySelector("#upg-drop-zone");
  const analyzeBtn = card.querySelector("#upg-analyze-btn");
  const errorEl   = card.querySelector("#upg-error");
  if (!fileInput || !dropZone || !analyzeBtn) return;

  let selectedFile = null;

  dropZone.addEventListener("click", () => fileInput.click());
  dropZone.addEventListener("dragover",  (e) => { e.preventDefault(); dropZone.classList.add("drag-over"); });
  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault(); dropZone.classList.remove("drag-over");
    const f = e.dataTransfer?.files[0];
    if (f) _upgSetFile(f, dropZone, errorEl, analyzeBtn, (x) => { selectedFile = x; });
  });
  fileInput.addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (f) _upgSetFile(f, dropZone, errorEl, analyzeBtn, (x) => { selectedFile = x; });
  });
  analyzeBtn.addEventListener("click", () => {
    if (selectedFile) bsHandleTierUpgrade(selectedFile, card, currentResult);
  });
}

function _upgSetFile(file, dropZone, errorEl, analyzeBtn, onSet) {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!["pdf","jpg","jpeg","png"].includes(ext)) {
    errorEl.textContent = "Desteklenmeyen dosya türü. PDF, JPG veya PNG yükleyin.";
    errorEl.style.display = "block"; return;
  }
  if (file.size > 50 * 1024 * 1024) {
    errorEl.textContent = "Dosya boyutu 50 MB sınırını aşıyor.";
    errorEl.style.display = "block"; return;
  }
  errorEl.style.display = "none";
  onSet(file);

  const sizeFmt = file.size < 1024 * 1024
    ? (file.size / 1024).toFixed(0) + " KB"
    : (file.size / (1024 * 1024)).toFixed(1) + " MB";

  dropZone.classList.add("has-file");
  dropZone.querySelector("#upg-drop-content").innerHTML = `
    <div class="bs-esg-file-row">
      <div class="bs-esg-file-icon">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      </div>
      <div class="text-left">
        <div class="font-semibold text-sm text-leaf-900">${escapeHtml(file.name)}</div>
        <div class="text-xs font-mono text-leaf-800/55 mt-0.5">${escapeHtml(sizeFmt)} · ${ext.toUpperCase()}</div>
      </div>
      <button class="bs-esg-remove" id="upg-remove-btn" title="Kaldır">✕</button>
    </div>
  `;
  dropZone.querySelector("#upg-remove-btn").addEventListener("click", (e) => {
    e.stopPropagation(); onSet(null);
    dropZone.classList.remove("has-file");
    dropZone.querySelector("#upg-drop-content").innerHTML = `
      <div class="bs-esg-icon-wrap" style="width:48px;height:48px;margin-bottom:12px;">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      </div>
      <div class="font-semibold text-sm text-leaf-900">Belge yükle</div>
      <div class="text-xs text-leaf-800/55 font-mono mt-1">PDF · JPG · PNG · Maks. 50 MB</div>
    `;
    analyzeBtn.disabled = true;
  });
  analyzeBtn.disabled = false;
}

async function bsHandleTierUpgrade(file, card, currentResult) {
  const analyzeBtn = card.querySelector("#upg-analyze-btn");
  const dropZone   = card.querySelector("#upg-drop-zone");
  const resultEl   = card.querySelector("#upg-result");

  if (analyzeBtn) { analyzeBtn.disabled = true; analyzeBtn.innerHTML = `<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg> Analiz ediliyor...`; }
  if (dropZone) dropZone.style.pointerEvents = "none";

  try {
    const token = (typeof getAuthState === "function") ? (getAuthState().token || "") : "";
    const base  = (typeof getApiBaseUrl === "function") ? getApiBaseUrl() : "";

    const formData = new FormData();
    formData.append("dosya", file);

    const res = await fetch(base + "/satici/rozet/tier-yukselme", {
      method: "POST",
      headers: { "Authorization": "Bearer " + token },
      body: formData,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      _bsUpgradeShowError(card, analyzeBtn, dropZone, data.detail || "Sunucu hatası.");
      return;
    }

    if (!data.yukseltildi) {
      _bsUpgradeShowError(card, analyzeBtn, dropZone, data.mesaj || "Belge uygun değil.");
      return;
    }

    const yeniTier = data.yeni_tier;
    const docType  = data.analiz?.document_type || "Belge";
    const issuer   = data.analiz?.issuing_body   || "";

    if (currentResult) {
      currentResult.tier = yeniTier;
      try { localStorage.setItem(BS_RESULT_KEY, JSON.stringify(currentResult)); } catch (e) {}
    }

    if (resultEl) {
      resultEl.style.display = "block";
      resultEl.innerHTML = `
        <div class="upgrade-success-banner">
          <div class="upgrade-success-icon">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <div class="font-bold text-sm text-leaf-900">Tier ${yeniTier}'e yükseltildiniz!</div>
            <div class="text-xs text-leaf-800/60 mt-0.5">${escapeHtml(docType)}${issuer ? " · " + escapeHtml(issuer) : ""} doğrulandı.</div>
          </div>
        </div>
      `;
    }

    setTimeout(() => {
      const root = document.getElementById("dashboard-root");
      if (root && currentResult) {
        renderBadgeCompleted(root, currentResult);
        bindBadgeStatusEvents();
      }
    }, 1500);

  } catch (err) {
    _bsUpgradeShowError(card, analyzeBtn, dropZone, "Bağlantı hatası. Tekrar deneyin.");
  }
}

function _bsUpgradeShowError(card, analyzeBtn, dropZone, message) {
  if (analyzeBtn) {
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Belgeyi Doğrula`;
  }
  if (dropZone) dropZone.style.pointerEvents = "";
  const errEl = card.querySelector("#upg-error");
  if (errEl) { errEl.textContent = message; errEl.style.display = "block"; }
}

function bindBadgeStatusEvents() {
  document.querySelectorAll("[data-badge-cta]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      bsOpenMethodSelector();
    });
  });
}

/* ============================================================
 * YÖNTEM SEÇİCİ
 * ============================================================ */
function bsOpenMethodSelector() {
  const root = document.getElementById("dashboard-root");
  if (!root) return;

  root.innerHTML = `
    <section class="badge-wrap">
      <div class="mb-8">
        <div class="eyebrow-mono mb-2">Rozet Durumu</div>
        <h1 class="text-[2.1rem] lg:text-[2.4rem] font-black text-leaf-900 tracking-tight leading-[1.05]">Değerlendirme yöntemini seç</h1>
        <p class="mt-2 text-leaf-800/65 text-sm max-w-xl">Sertifikasyon sürecini iki farklı yöntemle başlatabilirsin. Her ikisi de aynı AI analizi ve rozet sistemini kullanır.</p>
      </div>

      <div class="bs-method-grid">
        <!-- Test -->
        <button class="bs-method-card" data-method="test">
          <div class="bs-method-icon bs-method-icon--green">
            <svg class="w-7 h-7 text-leaf-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="9" y1="13" x2="15" y2="13"/>
              <line x1="9" y1="17" x2="12" y2="17"/>
            </svg>
          </div>
          <div class="eyebrow-mono">Yöntem 01</div>
          <h2 class="text-lg font-black text-leaf-900 mt-1 leading-snug">Sertifikasyon Testini Çöz</h2>
          <p class="text-sm text-leaf-800/60 mt-2 leading-relaxed">Bölümlere ayrılmış sorulara cevap ver. Gerekli belgeleri test sırasında yükle. AI analizi ile tier belirlenir.</p>
          <div class="bs-method-tags">
            <span class="bs-method-tag">5 bölüm</span>
            <span class="bs-method-tag">~20 dk</span>
            <span class="bs-method-tag">Belge yükleme</span>
            <span class="bs-method-tag">AI doğrulama</span>
          </div>
          <div class="bs-method-cta">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            Teste Başla
          </div>
        </button>

        <!-- ESG -->
        <button class="bs-method-card bs-method-card--esg" data-method="esg">
          <div class="bs-method-icon bs-method-icon--amber">
            <svg class="w-7 h-7 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div class="eyebrow-mono">Yöntem 02</div>
          <h2 class="text-lg font-black text-leaf-900 mt-1 leading-snug">ESG Raporu Yükle</h2>
          <p class="text-sm text-leaf-800/60 mt-2 leading-relaxed">Hazırladığın ESG veya sürdürülebilirlik raporunu yükle. Yapay zeka raporu analiz eder, tier atar ve yol haritası oluşturur.</p>
          <div class="bs-method-tags">
            <span class="bs-method-tag">PDF / JPG / PNG</span>
            <span class="bs-method-tag">AI analiz</span>
            <span class="bs-method-tag">Anında sonuç</span>
          </div>
          <div class="bs-method-cta">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Raporu Yükle
          </div>
        </button>
      </div>
    </section>
  `;

  root.querySelectorAll("[data-method]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const method = btn.dataset.method;
      if (method === "test") {
        if (typeof renderVerificationTest === "function") renderVerificationTest();
      } else if (method === "esg") {
        renderEsgFlow();
      }
    });
  });
}

/* ============================================================
 * ESG RAPORU YÜKLEME AKIŞI
 * ============================================================ */
let _esgMsgInterval = null;

function renderEsgFlow() {
  const root = document.getElementById("dashboard-root");
  if (!root) return;

  root.innerHTML = `
    <section class="badge-wrap">
      <div class="mb-6">
        <button data-esg-back class="inline-flex items-center gap-1.5 text-sm font-medium text-leaf-700 hover:text-leaf-900 transition">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          Geri dön
        </button>
      </div>

      <div class="bs-esg-wrap">
        <div class="eyebrow-mono mb-2">ESG Raporu Analizi</div>
        <h1 class="text-[2rem] lg:text-[2.3rem] font-black text-leaf-900 tracking-tight leading-[1.05]">Raporunu yükle,<br>AI analiz etsin.</h1>
        <p class="mt-2 text-leaf-800/65 text-sm max-w-lg">PDF veya görsel formatındaki ESG / sürdürülebilirlik raporunu yükle. Yapay zeka içeriği analiz edecek, sürdürülebilirlik seviyeni belirleyecek ve kişisel bir yol haritası oluşturacak.</p>

        <div class="mt-8">
          <input type="file" id="esg-file-input" class="hidden" accept=".pdf,.jpg,.jpeg,.png" />

          <div id="esg-drop-zone" class="bs-esg-drop">
            <div id="esg-drop-content">
              <div class="bs-esg-icon-wrap">
                <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div class="font-bold text-leaf-900 text-base">Raporu buraya sürükle veya tıkla</div>
              <div class="text-sm text-leaf-800/55 mt-1.5 font-mono">PDF · JPG · PNG &nbsp;·&nbsp; Maks. 50 MB</div>
            </div>
          </div>

          <div id="esg-error" class="bs-esg-error"></div>

          <button id="esg-analyze-btn" class="bs-analyze-btn" disabled>
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            AI Analizi Başlat
          </button>
        </div>

        <div class="bs-esg-info-grid">
          <div class="bs-esg-info-card">
            <div class="bs-esg-info-emoji">🌍</div>
            <div class="font-bold text-sm text-leaf-900">Çevre (E)</div>
            <div class="text-xs text-leaf-800/55 mt-1 leading-relaxed">Karbon emisyonları, enerji verimliliği, atık ve su yönetimi</div>
          </div>
          <div class="bs-esg-info-card">
            <div class="bs-esg-info-emoji">👥</div>
            <div class="font-bold text-sm text-leaf-900">Sosyal (S)</div>
            <div class="text-xs text-leaf-800/55 mt-1 leading-relaxed">Çalışan hakları, toplum katkısı, tedarik zinciri etiği</div>
          </div>
          <div class="bs-esg-info-card">
            <div class="bs-esg-info-emoji">🏛️</div>
            <div class="font-bold text-sm text-leaf-900">Yönetişim (G)</div>
            <div class="text-xs text-leaf-800/55 mt-1 leading-relaxed">Şeffaflık, risk yönetimi, etik iş standartları</div>
          </div>
        </div>
      </div>
    </section>
  `;

  const fileInput = root.querySelector("#esg-file-input");
  const dropZone = root.querySelector("#esg-drop-zone");
  const analyzeBtn = root.querySelector("#esg-analyze-btn");
  const errorEl = root.querySelector("#esg-error");
  let selectedFile = null;

  root.querySelector("[data-esg-back]").addEventListener("click", () => bsOpenMethodSelector());

  dropZone.addEventListener("click", () => fileInput.click());
  dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("drag-over"); });
  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");
    const file = e.dataTransfer?.files[0];
    if (file) _esgSetFile(file, dropZone, errorEl, analyzeBtn, (f) => { selectedFile = f; });
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) _esgSetFile(file, dropZone, errorEl, analyzeBtn, (f) => { selectedFile = f; });
  });

  analyzeBtn.addEventListener("click", () => {
    if (selectedFile) handleEsgUpload(selectedFile);
  });
}

function _esgSetFile(file, dropZone, errorEl, analyzeBtn, onSet) {
  const allowed = ["application/pdf", "image/jpeg", "image/png"];
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const extAllowed = ["pdf", "jpg", "jpeg", "png"].includes(ext);

  if (!allowed.includes(file.type) && !extAllowed) {
    errorEl.textContent = "Desteklenmeyen dosya türü. Lütfen PDF, JPG veya PNG yükleyin.";
    errorEl.style.display = "block";
    return;
  }
  if (file.size > 50 * 1024 * 1024) {
    errorEl.textContent = "Dosya boyutu 50 MB sınırını aşıyor.";
    errorEl.style.display = "block";
    return;
  }

  errorEl.style.display = "none";
  onSet(file);

  const content = dropZone.querySelector("#esg-drop-content");
  const sizeFmt = file.size < 1024 * 1024
    ? (file.size / 1024).toFixed(0) + " KB"
    : (file.size / (1024 * 1024)).toFixed(1) + " MB";

  dropZone.classList.add("has-file");
  content.innerHTML = `
    <div class="bs-esg-file-row">
      <div class="bs-esg-file-icon">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      </div>
      <div class="text-left">
        <div class="font-semibold text-sm text-leaf-900">${escapeHtml(file.name)}</div>
        <div class="text-xs font-mono text-leaf-800/55 mt-0.5">${escapeHtml(sizeFmt)} · ${ext.toUpperCase()}</div>
      </div>
      <button class="bs-esg-remove" data-esg-remove title="Kaldır">✕</button>
    </div>
  `;

  content.querySelector("[data-esg-remove]").addEventListener("click", (e) => {
    e.stopPropagation();
    onSet(null);
    dropZone.classList.remove("has-file");
    content.innerHTML = `
      <div class="bs-esg-icon-wrap">
        <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      </div>
      <div class="font-bold text-leaf-900 text-base">Raporu buraya sürükle veya tıkla</div>
      <div class="text-sm text-leaf-800/55 mt-1.5 font-mono">PDF · JPG · PNG &nbsp;·&nbsp; Maks. 50 MB</div>
    `;
    analyzeBtn.disabled = true;
  });

  analyzeBtn.disabled = false;
}

function _esgRenderAnalyzing(root, fileName) {
  if (_esgMsgInterval) { clearInterval(_esgMsgInterval); _esgMsgInterval = null; }

  const messages = [
    "ESG raporu okunuyor...",
    "Çevre politikaları analiz ediliyor...",
    "Karbon emisyon verileri değerlendiriliyor...",
    "Sosyal sorumluluk uygulamaları inceleniyor...",
    "Yönetişim standartları kontrol ediliyor...",
    "Tier seviyesi hesaplanıyor...",
    "Kişiselleştirilmiş yol haritası oluşturuluyor...",
  ];

  root.innerHTML = `
    <section class="badge-wrap">
      <div class="bs-esg-analyzing">
        <div class="bs-esg-spinner-wrap">
          <div class="bs-esg-spinner-track"></div>
          <div class="bs-esg-spinner-arc"></div>
          <div class="bs-esg-spinner-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3C7.46 19.79 8.79 20 10 20a8 8 0 0 0 8-8c0-2-1-3.83-1-3.83Z"/>
            </svg>
          </div>
        </div>

        <div class="eyebrow-mono mb-2">ESG Analizi</div>
        <h2 class="text-xl font-black text-leaf-900">Raporun analiz ediliyor</h2>
        <p class="text-sm text-leaf-800/55 mt-1 mb-5 font-mono">${escapeHtml(fileName)}</p>

        <div id="esg-analyzing-msg" class="bs-esg-analyzing-msg">${escapeHtml(messages[0])}</div>
      </div>
    </section>
  `;

  let idx = 0;
  const msgEl = root.querySelector("#esg-analyzing-msg");
  _esgMsgInterval = setInterval(() => {
    idx = (idx + 1) % messages.length;
    if (msgEl) msgEl.textContent = messages[idx];
  }, 1800);
}

function _esgRenderError(root, message) {
  if (_esgMsgInterval) { clearInterval(_esgMsgInterval); _esgMsgInterval = null; }

  root.innerHTML = `
    <section class="badge-wrap">
      <div class="max-w-md mx-auto text-center" style="padding: 80px 0;">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style="background:#FEF2F2;border:1px solid #FECACA;">
          <svg class="w-7 h-7" style="color:#EF4444;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 class="text-xl font-black text-leaf-900 mb-2">Analiz başarısız</h2>
        <p class="text-sm text-leaf-800/60 mb-7 leading-relaxed">${escapeHtml(message)}</p>
        <button data-esg-retry class="btn-amber">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.74"/></svg>
          Tekrar Dene
        </button>
      </div>
    </section>
  `;

  root.querySelector("[data-esg-retry]").addEventListener("click", () => renderEsgFlow());
}

async function handleEsgUpload(file) {
  const root = document.getElementById("dashboard-root");
  if (!root) return;

  _esgRenderAnalyzing(root, file.name);

  const startTime = Date.now();
  const MIN_ANIM_MS = 3500;

  try {
    const token = (typeof getAuthState === "function") ? (getAuthState().token || "") : "";
    const base  = (typeof getApiBaseUrl === "function") ? getApiBaseUrl() : "";

    const formData = new FormData();
    formData.append("dosya", file);

    const res = await fetch(base + "/satici/rozet/esg-analiz", {
      method: "POST",
      headers: { "Authorization": "Bearer " + token },
      body: formData,
    });

    const elapsed = Date.now() - startTime;
    if (elapsed < MIN_ANIM_MS) await new Promise(r => setTimeout(r, MIN_ANIM_MS - elapsed));

    if (_esgMsgInterval) { clearInterval(_esgMsgInterval); _esgMsgInterval = null; }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      _esgRenderError(root, errData.detail || "Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.");
      return;
    }

    const data = await res.json();

    const result = {
      status:     "completed",
      score:      data.skor || 0,
      tier:       data.tier || 0,
      badgeId:    data.rozet_id || "—",
      earnedAt:   data.kazanim_tarihi ? data.kazanim_tarihi.slice(0, 10) : new Date().toISOString().slice(0, 10),
      validUntil: data.gecerlilik_sonu ? data.gecerlilik_sonu.slice(0, 10) : "—",
      trustScore: data.skor || 0,
      answers:    { esg_raporu: { type: "esg_upload", name: file.name } },
      breakdown:  Array.isArray(data.kirilim) ? data.kirilim : [],
      certs:      [],
      ai:         data.ai || null,
      method:     "esg",
    };

    try { localStorage.setItem(BS_RESULT_KEY, JSON.stringify(result)); } catch (e) { /* ignore */ }

    renderBadgeCompleted(root, result);
    bindBadgeStatusEvents();

  } catch (err) {
    const elapsed = Date.now() - startTime;
    if (elapsed < MIN_ANIM_MS) await new Promise(r => setTimeout(r, MIN_ANIM_MS - elapsed));
    if (_esgMsgInterval) { clearInterval(_esgMsgInterval); _esgMsgInterval = null; }
    _esgRenderError(root, "Bağlantı hatası. İnternet bağlantınızı kontrol edip tekrar deneyin.");
  }
}

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
