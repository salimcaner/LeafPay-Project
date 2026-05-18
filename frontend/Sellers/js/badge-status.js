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

function renderBadgeStatus() {
  const root = document.getElementById("dashboard-root");
  if (!root) return;

  const result = getVerificationResult();

  if (!result) {
    renderBadgeEmpty(root);
  } else {
    renderBadgeCompleted(root, result);
  }

  bindBadgeStatusEvents();
}

/* ------------ EMPTY STATE ------------ */
function renderBadgeEmpty(root) {
  const draftActive = hasDraft();
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
}

function bindBadgeStatusEvents() {
  document.querySelectorAll("[data-badge-cta]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (typeof renderVerificationTest === "function") {
        renderVerificationTest();
      }
    });
  });
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
