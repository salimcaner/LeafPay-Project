const STATISTICS_DEFAULTS = {
  layout: "a",
  density: "comfortable",
  accent: "leaf",
};

function getStatisticsRoot() {
  return document.getElementById("dashboard-root");
}

function setStatisticsBodyAttributes() {
  document.body.setAttribute("data-layout", STATISTICS_DEFAULTS.layout);
  document.body.setAttribute("data-density", STATISTICS_DEFAULTS.density);
  document.body.setAttribute("data-accent", STATISTICS_DEFAULTS.accent);
}

function bindStatisticsEvents() {
  document.querySelectorAll("#date-range button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("#date-range button").forEach((item) => {
        item.classList.remove("active");
      });

      button.classList.add("active");
    });
  });
}

function getStatisticsMarkup() {
  return `
    <section class="stats-wrap statistics-view">
      <div class="page-title flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 class="text-[2.1rem] lg:text-[2.4rem] font-black text-leaf-900 tracking-tight leading-[1.05]">İstatistikler</h1>
          <p class="mt-1.5 text-leaf-800/65 text-sm max-w-xl">Yeşil ekonomiye katkın - sayılar, eğilimler ve dönüşüm. Son güncelleme <b class="text-leaf-700">18 Mayıs 2026 · 14:32</b>.</p>
        </div>
      </div>
      <div class="stats-grid">
        <div class="area-kpis">
          <div class="kpi-grid">
            <div class="stat-card">
              <div class="flex items-start justify-between">
                <div class="eyebrow">Toplam Yeşil Seçim</div>
                <div class="w-8 h-8 rounded-xl bg-leaf-50 border border-leaf-200 flex items-center justify-center">
                  <svg class="w-4 h-4 text-leaf-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 13-9 0 7-3 16-13 16Z"></path><path d="M4 20c1-5 4-9 9-12"></path></svg>
                </div>
              </div>
              <div class="mt-3 flex items-baseline gap-2">
                <div class="metric-number metric-xl text-[2.4rem] leading-none tabular-nums">24.812</div>
              </div>
              <div class="mt-2 text-[11px] text-leaf-800/50 font-mono">son 90 günde · ortalama 276/gün</div>
              <div class="mt-3 flex items-center gap-2">
                <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-leaf-700 bg-leaf-50 px-2 py-0.5 rounded-full border border-leaf-200">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"></path></svg>
                  +31%
                </span>
                <span class="text-[11px] text-leaf-800/45 font-mono">önceki dönem</span>
              </div>
              <svg class="mt-3 w-full h-10" viewBox="0 0 200 40" preserveAspectRatio="none">
                <polyline points="0,34 18,30 36,28 54,24 72,26 90,20 108,16 126,18 144,12 162,14 180,8 200,5" fill="none" stroke="#1D9E75" stroke-width="2"></polyline>
                <polyline points="0,34 18,30 36,28 54,24 72,26 90,20 108,16 126,18 144,12 162,14 180,8 200,5 200,40 0,40" fill="#1D9E75" opacity=".10"></polyline>
              </svg>
            </div>

            <div class="stat-card">
              <div class="flex items-start justify-between">
                <div class="eyebrow">Dağıtılan VERA Puanı</div>
                <div class="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <svg class="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 3 14h7l-1 8 10-12h-7z"></path></svg>
                </div>
              </div>
              <div class="mt-3 flex items-baseline gap-2">
                <div class="metric-number metric-xl text-[2.4rem] leading-none tabular-nums">1,84M</div>
                <span class="text-sm text-leaf-800/55 font-mono">VERA</span>
              </div>
              <div class="mt-2 text-[11px] text-leaf-800/50 font-mono">≈ ₺184.500 değerinde kupon</div>
              <div class="mt-3 flex items-center gap-2">
                <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"></path></svg>
                  +24%
                </span>
                <span class="text-[11px] text-leaf-800/45 font-mono">önceki dönem</span>
              </div>
              <div class="mt-3">
                <div class="flex justify-between text-[10px] text-leaf-800/45 font-mono mb-1">
                  <span>Kullanım oranı</span><span class="text-amber-600 font-semibold">%67</span>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width:67%; background:#EF9F27;"></div></div>
              </div>
            </div>

            <div class="stat-card">
              <div class="flex items-start justify-between">
                <div class="eyebrow">Önlenen Plastik</div>
                <div class="w-8 h-8 rounded-xl bg-leaf-50 border border-leaf-200 flex items-center justify-center">
                  <svg class="w-4 h-4 text-leaf-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h8v3l-1 2v12a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V7L8 5z"></path><path d="M8 7h8"></path></svg>
                </div>
              </div>
              <div class="mt-3 flex items-baseline gap-2">
                <div class="metric-number metric-xl text-[2.4rem] leading-none tabular-nums">1.238</div>
                <span class="text-sm text-leaf-800/55 font-mono">kg</span>
              </div>
              <div class="mt-2 text-[11px] text-leaf-800/50 font-mono">≈ 49.520 plastik şişe değerinde</div>
              <div class="mt-3 flex items-center gap-2">
                <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-leaf-700 bg-leaf-50 px-2 py-0.5 rounded-full border border-leaf-200">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"></path></svg>
                  +18%
                </span>
                <span class="text-[11px] text-leaf-800/45 font-mono">önceki dönem</span>
              </div>
              <div class="mt-3">
                <div class="flex justify-between text-[10px] text-leaf-800/45 font-mono mb-1">
                  <span>Yıllık hedef 3.000 kg</span><span class="text-leaf-700 font-semibold">%41</span>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width:41%;"></div></div>
              </div>
            </div>

            <div class="stat-card bg-gradient-to-br from-leaf-50 to-white">
              <div class="flex items-start justify-between">
                <div class="eyebrow">Dönüşüm Oranı</div>
                <div class="w-8 h-8 rounded-xl bg-white border border-leaf-200 flex items-center justify-center">
                  <svg class="w-4 h-4 text-leaf-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 1 4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="m7 23-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                </div>
              </div>
              <div class="mt-3 flex items-baseline gap-2">
                <div class="metric-number metric-xl text-[2.4rem] leading-none tabular-nums">%64,2</div>
              </div>
              <div class="mt-2 text-[11px] text-leaf-800/50 font-mono">100 alışverişin 64'ünde yeşil seçim</div>
              <div class="mt-3 flex items-center gap-2">
                <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-leaf-700 bg-leaf-50 px-2 py-0.5 rounded-full border border-leaf-200">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"></path></svg>
                  +5,4 puan
                </span>
                <span class="text-[11px] text-leaf-800/45 font-mono">önceki dönem</span>
              </div>
              <div class="mt-3 space-y-1.5">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] text-leaf-800/60 font-mono w-12 flex-shrink-0">sen</span>
                  <div class="flex-1 progress-bar"><div class="progress-fill" style="width:64.2%;"></div></div>
                  <span class="text-[10px] font-mono text-leaf-700 font-semibold w-10 text-right">%64,2</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] text-leaf-800/60 font-mono w-12 flex-shrink-0">sektör</span>
                  <div class="flex-1 progress-bar"><div class="progress-fill" style="width:38%; background:#8DD3B7;"></div></div>
                  <span class="text-[10px] font-mono text-leaf-800/55 w-10 text-right">%38,0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="area-hero card">
          <div class="flex items-start justify-between mb-5 flex-wrap gap-3">
            <div>
              <div class="eyebrow">Tarihe Göre</div>
              <h2 class="font-black text-leaf-900 mt-1 text-xl">Yeşil Seçimli Sipariş Veren Kullanıcı Sayısı</h2>
              <p class="text-xs text-leaf-800/55 mt-1">Aylık biricik (unique) kullanıcı. Mayıs ayı için 18 günlük veri kullanılmıştır.</p>
            </div>
            <div class="flex items-center gap-4 text-[11px] font-mono text-leaf-800/60">
              <div class="flex items-center gap-1.5"><span class="w-3 h-1 rounded-full" style="background:#1D9E75"></span>2026</div>
              <div class="flex items-center gap-1.5"><span class="w-3 h-1 rounded-full" style="background:#8DD3B7"></span>2025</div>
              <div class="flex items-center gap-1.5"><span class="w-3 h-1 rounded-full border-t border-dashed" style="border-color:#1D9E75"></span>Tahmini</div>
            </div>
          </div>

          <div class="relative">
            <svg viewBox="0 0 800 320" class="w-full h-auto" preserveAspectRatio="none">
              <defs>
                <linearGradient id="area-gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#1D9E75" stop-opacity=".22"></stop>
                  <stop offset="100%" stop-color="#1D9E75" stop-opacity="0"></stop>
                </linearGradient>
              </defs>

              <g class="chart-grid">
                <line x1="50" y1="40" x2="780" y2="40"></line>
                <line x1="50" y1="100" x2="780" y2="100"></line>
                <line x1="50" y1="160" x2="780" y2="160"></line>
                <line x1="50" y1="220" x2="780" y2="220"></line>
                <line x1="50" y1="280" x2="780" y2="280"></line>
              </g>
              <g class="chart-axis">
                <text x="42" y="44" text-anchor="end">1500</text>
                <text x="42" y="104" text-anchor="end">1200</text>
                <text x="42" y="164" text-anchor="end">900</text>
                <text x="42" y="224" text-anchor="end">600</text>
                <text x="42" y="284" text-anchor="end">300</text>
              </g>

              <polyline points="80,232 137,220 194,206 251,190 308,178 365,166 422,150" fill="none" stroke="#8DD3B7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="0"></polyline>

              <path d="M 80 144 L 137 134 L 194 124 L 251 110 L 308 96 L 365 82 L 422 70 L 480 64 L 537 56 L 594 50 L 651 44 L 708 38 L 708 280 L 80 280 Z" fill="url(#area-gradient)"></path>

              <polyline points="80,144 137,134 194,124 251,110 308,96 365,82" fill="none" stroke="#1D9E75" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
              <polyline points="365,82 422,70" fill="none" stroke="#1D9E75" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
              <polyline points="422,70 480,64 537,56 594,50 651,44 708,38" fill="none" stroke="#1D9E75" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="5 5" opacity=".55"></polyline>

              <g>
                <circle cx="80" cy="144" r="3.5" fill="white" stroke="#1D9E75" stroke-width="2"></circle>
                <circle cx="137" cy="134" r="3.5" fill="white" stroke="#1D9E75" stroke-width="2"></circle>
                <circle cx="194" cy="124" r="3.5" fill="white" stroke="#1D9E75" stroke-width="2"></circle>
                <circle cx="251" cy="110" r="3.5" fill="white" stroke="#1D9E75" stroke-width="2"></circle>
                <circle cx="308" cy="96" r="3.5" fill="white" stroke="#1D9E75" stroke-width="2"></circle>
                <circle cx="365" cy="82" r="3.5" fill="white" stroke="#1D9E75" stroke-width="2"></circle>
                <circle cx="422" cy="70" r="6" fill="#EF9F27" opacity=".18"></circle>
                <circle cx="422" cy="70" r="4.5" fill="#EF9F27" stroke="white" stroke-width="2"></circle>
              </g>

              <g transform="translate(422, 70)">
                <line x1="0" y1="0" x2="0" y2="210" stroke="#EF9F27" stroke-width="1" stroke-dasharray="3 4" opacity=".7"></line>
                <g transform="translate(-58, -52)">
                  <rect width="116" height="42" rx="8" fill="#053A30"></rect>
                  <text x="10" y="16" fill="rgba(255,255,255,.6)" font-family="JetBrains Mono" font-size="9" letter-spacing=".06em">MAY 2026 · KISMI</text>
                  <text x="10" y="32" fill="white" font-family="Inter" font-size="13" font-weight="800">1.310 kullanıcı</text>
                </g>
              </g>

              <g class="chart-axis">
                <text x="80" y="300" text-anchor="middle">Ara 25</text>
                <text x="137" y="300" text-anchor="middle">Oca 26</text>
                <text x="194" y="300" text-anchor="middle">Şub</text>
                <text x="251" y="300" text-anchor="middle">Mar</text>
                <text x="308" y="300" text-anchor="middle">Nis</text>
                <text x="365" y="300" text-anchor="middle">May</text>
                <text x="422" y="300" text-anchor="middle" fill="#EF9F27" font-weight="700">May·18</text>
                <text x="480" y="300" text-anchor="middle" fill="rgba(8,80,65,.30)">Haz</text>
                <text x="537" y="300" text-anchor="middle" fill="rgba(8,80,65,.30)">Tem</text>
                <text x="594" y="300" text-anchor="middle" fill="rgba(8,80,65,.30)">Ağu</text>
                <text x="651" y="300" text-anchor="middle" fill="rgba(8,80,65,.30)">Eyl</text>
                <text x="708" y="300" text-anchor="middle" fill="rgba(8,80,65,.30)">Eki</text>
              </g>
            </svg>
          </div>

          <div class="mt-4 pt-4 border-t border-leaf-100 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div class="eyebrow">Aktif Kullanıcı</div>
              <div class="font-black text-leaf-900 text-lg tabular-nums mt-1">1.310</div>
              <div class="text-[10px] text-leaf-600/80 font-mono">bu ay biricik</div>
            </div>
            <div>
              <div class="eyebrow">Yeni Kullanıcı</div>
              <div class="font-black text-leaf-900 text-lg tabular-nums mt-1">428</div>
              <div class="text-[10px] text-leaf-600/80 font-mono">+%18 YoY</div>
            </div>
            <div>
              <div class="eyebrow">Tekrarlayan</div>
              <div class="font-black text-leaf-900 text-lg tabular-nums mt-1">%67</div>
              <div class="text-[10px] text-leaf-600/80 font-mono">en az 2 sipariş</div>
            </div>
            <div>
              <div class="eyebrow">Ort. Sipariş / Kullanıcı</div>
              <div class="font-black text-leaf-900 text-lg tabular-nums mt-1">2,8</div>
              <div class="text-[10px] text-leaf-600/80 font-mono">son 30 gün</div>
            </div>
          </div>
        </div>

        <div class="area-conv card">
          <div class="flex items-start justify-between mb-4">
            <div>
              <div class="eyebrow">Dönüşüm Detayı</div>
              <div class="font-bold text-leaf-900 mt-1 text-lg">Yeşil seçim oranı</div>
            </div>
            <span class="pill-mono">son 90 gün</span>
          </div>

          <div class="flex items-center gap-5 flex-wrap">
            <div class="relative w-[180px] h-[180px] flex-shrink-0">
              <svg viewBox="0 0 200 200" class="w-full h-full -rotate-90">
                <circle cx="100" cy="100" r="80" fill="none" class="donut-track" stroke-width="22"></circle>
                <circle cx="100" cy="100" r="80" fill="none" class="donut-fill" stroke-width="22" stroke-dasharray="502.65" stroke-dashoffset="180"></circle>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <div class="text-[10px] font-mono text-leaf-600 tracking-widest">DÖNÜŞÜM</div>
                <div class="text-[2rem] metric-number tabular-nums leading-none mt-0.5">%64,2</div>
                <div class="text-[10px] text-leaf-700 font-semibold mt-1">▲ +5,4 puan</div>
              </div>
            </div>

            <div class="flex-1 min-w-[180px] space-y-2.5">
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-sm" style="background:var(--accent);"></span>
                  <span class="text-leaf-900 font-semibold">Yeşil seçim</span>
                </div>
                <span class="font-mono text-leaf-800 tabular-nums">15.928</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-sm bg-leaf-100"></span>
                  <span class="text-leaf-800/70">Standart</span>
                </div>
                <span class="font-mono text-leaf-800/60 tabular-nums">8.884</span>
              </div>
              <div class="h-px bg-leaf-100"></div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-leaf-800/55 font-mono">Toplam sipariş</span>
                <span class="font-mono font-semibold text-leaf-900 tabular-nums">24.812</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-leaf-800/55 font-mono">Sektör ort.</span>
                <span class="font-mono text-leaf-800/65 tabular-nums">%38,0</span>
              </div>
            </div>
          </div>
        </div>

        <div class="area-bdwn card">
          <div class="flex items-start justify-between mb-4 flex-wrap gap-3">
            <div>
              <div class="eyebrow">Yeşil Seçim · Kategoriye Göre</div>
              <div class="font-bold text-leaf-900 mt-1 text-lg">Hangi seçenek ne kadar tercih edildi</div>
            </div>
          </div>

          <div class="space-y-3.5">
            <div>
              <div class="flex justify-between text-xs mb-1.5">
                <span class="text-leaf-900 font-semibold">Karton ambalaj</span>
                <span class="font-mono text-leaf-600 tabular-nums">11.418 · %46</span>
              </div>
              <div class="progress-bar h-2"><div class="progress-fill" style="width:46%;"></div></div>
            </div>
            <div>
              <div class="flex justify-between text-xs mb-1.5">
                <span class="text-leaf-900 font-semibold">Toplu teslimat</span>
                <span class="font-mono text-leaf-600 tabular-nums">7.220 · %29</span>
              </div>
              <div class="progress-bar h-2"><div class="progress-fill" style="width:29%; background:#168562;"></div></div>
            </div>
            <div>
              <div class="flex justify-between text-xs mb-1.5">
                <span class="text-leaf-900 font-semibold">Minimalist paket</span>
                <span class="font-mono text-leaf-600 tabular-nums">3.890 · %16</span>
              </div>
              <div class="progress-bar h-2"><div class="progress-fill" style="width:16%; background:#4FB893;"></div></div>
            </div>
            <div>
              <div class="flex justify-between text-xs mb-1.5">
                <span class="text-leaf-900 font-semibold">Karbon nötr kargo</span>
                <span class="font-mono text-leaf-600 tabular-nums">2.284 · %9</span>
              </div>
              <div class="progress-bar h-2"><div class="progress-fill" style="width:9%; background:#8DD3B7;"></div></div>
            </div>
          </div>

          <div class="mt-5 pt-4 border-t border-leaf-100">
            <div class="eyebrow mb-2">Aylık Plastik Önleme · birikimli</div>
            <div class="flex items-end gap-1 h-16">
              <div class="flex-1 flex flex-col items-center gap-1"><div class="w-full rounded-t-sm bg-leaf-200" style="height:35%"></div><span class="text-[9px] font-mono text-leaf-800/40">Ara</span></div>
              <div class="flex-1 flex flex-col items-center gap-1"><div class="w-full rounded-t-sm bg-leaf-300" style="height:48%"></div><span class="text-[9px] font-mono text-leaf-800/40">Oca</span></div>
              <div class="flex-1 flex flex-col items-center gap-1"><div class="w-full rounded-t-sm bg-leaf-400" style="height:62%"></div><span class="text-[9px] font-mono text-leaf-800/40">Şub</span></div>
              <div class="flex-1 flex flex-col items-center gap-1"><div class="w-full rounded-t-sm bg-leaf-400" style="height:74%"></div><span class="text-[9px] font-mono text-leaf-800/40">Mar</span></div>
              <div class="flex-1 flex flex-col items-center gap-1"><div class="w-full rounded-t-sm bg-leaf-500" style="height:88%"></div><span class="text-[9px] font-mono text-leaf-800/40">Nis</span></div>
              <div class="flex-1 flex flex-col items-center gap-1"><div class="w-full rounded-t-sm bg-amber-500" style="height:100%"></div><span class="text-[9px] font-mono text-leaf-800/40 font-semibold">May</span></div>
            </div>
            <div class="flex items-center justify-between mt-2 text-[10px] font-mono text-leaf-800/45">
              <span>248 kg/ay başlangıç</span>
              <span class="text-leaf-700 font-semibold">412 kg · Mayıs</span>
            </div>
          </div>
        </div>

        <div class="area-plat card relative overflow-hidden">
          <div class="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-leaf-100/60 blur-3xl pointer-events-none"></div>
          <div class="relative">
            <div class="flex items-start justify-between mb-5 flex-wrap gap-3">
              <div>
                <div class="eyebrow">Platform Karşılaştırma</div>
                <h2 class="font-black text-leaf-900 mt-1 text-xl">Farklı platforlara göre yeşil seçim</h2>
                <p class="text-xs text-leaf-800/55 mt-1">Aynı ürünün farklı kanallardan satın alınmasında müşterilerin yeşil seçim seçme oranı.</p>
              </div>

              <button class="inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-leaf-50 border border-leaf-200 hover:bg-white transition group flex-shrink-0">
                <span class="w-7 h-7 rounded-full bg-gradient-to-br from-leaf-500 to-leaf-700 flex items-center justify-center text-white">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                </span>
                <div class="text-left leading-tight pr-1">
                  <div class="text-[9px] font-mono uppercase tracking-widest text-leaf-600/70">Ürün</div>
                  <div class="text-xs font-bold text-leaf-900">Organik Karton Kutu - Large</div>
                </div>
                <svg class="w-3 h-3 text-leaf-800/40 group-hover:text-leaf-800/70 transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
            </div>

            <div class="flex flex-wrap items-stretch gap-3 mb-5">
              <div class="flex-1 min-w-[200px] bg-leaf-50 border border-leaf-200 rounded-2xl px-4 py-3">
                <div class="eyebrow">En Yüksek Dönüşüm</div>
                <div class="mt-1 flex items-baseline gap-2">
                  <span class="font-black text-leaf-900 text-xl tabular-nums">%79,4</span>
                  <span class="text-xs text-leaf-700 font-semibold">LeafPay Marketplace</span>
                </div>
              </div>
              <div class="flex-1 min-w-[200px] bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                <div class="eyebrow text-amber-700">En Düşük Dönüşüm</div>
                <div class="mt-1 flex items-baseline gap-2">
                  <span class="font-black text-amber-700 text-xl tabular-nums">%22,1</span>
                  <span class="text-xs text-amber-700/80 font-semibold">N11</span>
                </div>
              </div>
              <div class="flex-1 min-w-[200px] bg-white border border-leaf-100 rounded-2xl px-4 py-3">
                <div class="eyebrow">Toplam Sipariş</div>
                <div class="mt-1 flex items-baseline gap-2">
                  <span class="font-black text-leaf-900 text-xl tabular-nums">1.847</span>
                  <span class="text-xs text-leaf-800/60 font-mono">6 kanal · 988 yeşil</span>
                </div>
              </div>
            </div>

            <div>
              <div class="plat-row">
                <div class="plat-glyph" style="background:#1D9E75;">LP</div>
                <div class="plat-body">
                  <div>
                    <div class="plat-name">LeafPay Marketplace</div>
                    <div class="plat-meta">642 sipariş · 510 yeşil seçim</div>
                  </div>
                  <div class="plat-track"><div class="plat-fill" style="width:79.4%; background:#1D9E75;"></div></div>
                  <div class="plat-pct">%79,4</div>
                </div>
              </div>

              <div class="plat-row">
                <div class="plat-glyph" style="background:#168562;">DW</div>
                <div class="plat-body">
                  <div>
                    <div class="plat-name">Direkt Web Sitesi</div>
                    <div class="plat-meta">185 sipariş · 107 yeşil seçim</div>
                  </div>
                  <div class="plat-track"><div class="plat-fill" style="width:57.8%; background:#168562;"></div></div>
                  <div class="plat-pct">%57,8</div>
                </div>
              </div>

              <div class="plat-row">
                <div class="plat-glyph" style="background:#F5B656;">TY</div>
                <div class="plat-body">
                  <div>
                    <div class="plat-name">Trendyol</div>
                    <div class="plat-meta">420 sipariş · 178 yeşil seçim</div>
                  </div>
                  <div class="plat-track"><div class="plat-fill" style="width:42.4%; background:#4FB893;"></div></div>
                  <div class="plat-pct">%42,4</div>
                </div>
              </div>

              <div class="plat-row">
                <div class="plat-glyph" style="background:#EF9F27;">HB</div>
                <div class="plat-body">
                  <div>
                    <div class="plat-name">Hepsiburada</div>
                    <div class="plat-meta">285 sipariş · 108 yeşil seçim</div>
                  </div>
                  <div class="plat-track"><div class="plat-fill" style="width:37.9%; background:#8DD3B7;"></div></div>
                  <div class="plat-pct">%37,9</div>
                </div>
              </div>

              <div class="plat-row">
                <div class="plat-glyph" style="background:#085041;">AZ</div>
                <div class="plat-body">
                  <div>
                    <div class="plat-name">Amazon TR</div>
                    <div class="plat-meta">220 sipariş · 64 yeşil seçim</div>
                  </div>
                  <div class="plat-track"><div class="plat-fill" style="width:29.1%; background:#BFE7D6;"></div></div>
                  <div class="plat-pct">%29,1</div>
                </div>
              </div>

              <div class="plat-row">
                <div class="plat-glyph" style="background:#0F6A4F;">N1</div>
                <div class="plat-body">
                  <div>
                    <div class="plat-name">N11</div>
                    <div class="plat-meta">95 sipariş · 21 yeşil seçim</div>
                  </div>
                  <div class="plat-track">
                    <div class="plat-fill" style="width:22.1%; background:#E1F5EE; border:1px solid #BFE7D6; box-sizing:border-box;"></div>
                  </div>
                  <div class="plat-pct">%22,1</div>
                </div>
              </div>
            </div>

            <div class="mt-5 pt-4 border-t border-leaf-100 flex items-start gap-3 text-xs">
              <div class="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              </div>
              <div>
                <div class="font-bold text-leaf-900">Çıkarım: LeafPay kanalında dönüşüm 2,1× daha yüksek.</div>
                <div class="text-leaf-800/65 mt-0.5">Yeşil seçimi varsayılan + öne çıkan kampanyalar, dönüşümü Trendyol/Hepsiburada'ya göre belirgin artırıyor. Diğer kanallarda da "yeşil seçenek" rozetini öne çıkarmayı öneriyoruz.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderStatistics() {
  const statisticsRoot = getStatisticsRoot();
  if (!statisticsRoot) return;

  setStatisticsBodyAttributes();
  statisticsRoot.innerHTML = getStatisticsMarkup();
  bindStatisticsEvents();
}
