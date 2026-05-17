function renderDashboard() {
  const dashboardRoot = document.getElementById("dashboard-root");
  if (!dashboardRoot) return;

  dashboardRoot.innerHTML = `
    <div class="dashboard-wrap px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-8">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="text-[2rem] lg:text-[2.35rem] font-black text-leaf-900 tracking-tight">Merhaba, <span data-company-short>Koton</span></h1>
          <p class="mt-1 dashboard-subtitle">Bu ay sürdürülebilir alışverişe güçlü katkı sağlıyorsunuz.</p>
        </div>
      </div>

      <div class="grid lg:grid-cols-12 gap-5">
        <div class="lg:col-span-4 bg-leaf-800 text-white rounded-3xl p-6 relative overflow-hidden tier-elevated">
          <div class="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-leaf-500/20 blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none"></div>
          <div class="relative flex items-start justify-between">
            <div>
              <div class="text-[10px] font-mono uppercase tracking-widest text-amber-400 mb-1">Rozet Durumu</div>
              <div class="text-2xl font-black">Tier 3</div>
              <div class="text-sm text-white/60 mt-0.5">Doğrulanmış ✅</div>
            </div>
            <div class="relative w-20 h-20 flex-shrink-0">
              <div class="absolute inset-0 rounded-full badge-ring spin-slow opacity-90"></div>
              <div class="absolute inset-[5px] rounded-full bg-leaf-500 flex items-center justify-center">
                <div class="absolute inset-2 rounded-full border border-dashed border-white/30"></div>
                <svg viewBox="0 0 24 24" class="w-7 h-7 text-white relative" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3C7.46 19.79 8.79 20 10 20a8 8 0 0 0 8-8c0-2-1-3.83-1-3.83Z"/></svg>
              </div>
            </div>
          </div>
          <div class="mt-5 h-px bg-white/10"></div>
          <div class="mt-4 space-y-2">
            <div class="flex items-center gap-2 text-[12px] text-white/70"><span class="text-amber-400">✓</span> En yüksek KAI ödülü (+80/seçim)</div>
            <div class="flex items-center gap-2 text-[12px] text-white/70"><span class="text-amber-400">✓</span> Dizinde üst sıra</div>
            <div class="flex items-center gap-2 text-[12px] text-white/70"><span class="text-amber-400">✓</span> Aylık kampanya hakkı</div>
          </div>
          <div class="mt-5 flex items-center gap-1.5">
            <div class="h-1.5 w-8 bg-amber-400 rounded-full"></div>
            <div class="h-1.5 w-8 bg-amber-400 rounded-full"></div>
            <div class="h-1.5 w-8 bg-amber-400 rounded-full"></div>
            <span class="text-[10px] font-mono text-white/40 ml-2">Güven seviyesi: Tam</span>
          </div>
        </div>

        <div class="lg:col-span-8 grid sm:grid-cols-2 gap-5">
          <div class="stat-card">
            <div class="eyebrow text-leaf-600 mb-3">Bu Ay · Yeşil Seçim</div>
            <div class="flex items-end justify-between">
              <div>
                <div class="text-4xl metric-number tabular-nums">1.240</div>
                <div class="text-sm text-leaf-800/60 mt-1">müşteri yeşil seçim yaptı</div>
              </div>
              <div class="text-right">
                <div class="inline-flex items-center gap-1 text-xs font-semibold text-leaf-600 bg-leaf-50 px-2 py-1 rounded-full border border-leaf-200">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg>
                  +18%
                </div>
              </div>
            </div>
            <div class="mt-4">
              <div class="flex justify-between text-xs text-leaf-800/50 mb-1.5">
                <span>Aylık hedef: 1.500</span>
                <span class="font-semibold text-leaf-700">%83</span>
              </div>
              <div class="progress-bar"><div class="progress-fill" style="width:83%"></div></div>
            </div>
          </div>

          <div class="stat-card">
            <div class="eyebrow text-leaf-600 mb-3">Bu Ay · KAI Puan</div>
            <div class="flex items-end justify-between">
              <div>
                <div class="text-4xl metric-number tabular-nums">62.000</div>
                <div class="text-sm text-leaf-800/60 mt-1">puan kullanıcılara dağıtıldı</div>
              </div>
              <div class="w-10 h-10 rounded-2xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></svg>
              </div>
            </div>
            <div class="mt-4 text-xs text-leaf-800/50 font-mono">≈ 124 kupon karşılığı</div>
          </div>

          <div class="stat-card">
            <div class="eyebrow text-leaf-600 mb-3">Bu Ay · Önlenen Plastik</div>
            <div class="flex items-end justify-between">
              <div>
                <div class="text-4xl metric-number tabular-nums">1.240</div>
                <div class="text-sm text-leaf-800/60 mt-1">plastik ambalaj yerine karton</div>
              </div>
              <div class="w-10 h-10 rounded-2xl bg-leaf-50 flex items-center justify-center flex-shrink-0 border border-leaf-200">
                <svg class="w-5 h-5 text-leaf-500" viewBox="0 0 24 24" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3C7.46 19.79 8.79 20 10 20a8 8 0 0 0 8-8c0-2-1-3.83-1-3.83Z"/></svg>
              </div>
            </div>
            <div class="mt-4">
              <div class="flex justify-between text-xs text-leaf-800/50 mb-1.5">
                <span>Karton tercih oranı</span>
                <span class="font-semibold text-leaf-700">%73</span>
              </div>
              <div class="progress-bar"><div class="progress-fill" style="width:73%"></div></div>
            </div>
          </div>

          <div class="stat-card border-leaf-200 bg-gradient-to-br from-leaf-50 to-white">
            <div class="eyebrow text-leaf-600 mb-3">AI Güven Skoru</div>
            <div class="flex items-end justify-between">
              <div>
                <div class="text-4xl metric-number tabular-nums">94<span class="text-2xl text-leaf-800/40">/100</span></div>
                <div class="text-sm text-leaf-800/60 mt-1">ISO 14001 doğrulaması</div>
              </div>
              <div class="text-right">
                <div class="text-[10px] font-mono text-leaf-600 bg-leaf-100 px-2 py-1 rounded-lg border border-leaf-200">TÜRKAK onaylı</div>
              </div>
            </div>
            <div class="mt-4">
              <div class="progress-bar"><div class="progress-fill bg-leaf-600" style="width:94%"></div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid lg:grid-cols-12 gap-5">
        <div class="lg:col-span-5 bg-white rounded-3xl p-6 border border-leaf-100">
          <div class="flex items-center justify-between mb-5">
            <div>
              <div class="eyebrow text-leaf-600 mb-1">Tanımlı Seçenekler</div>
              <div class="font-bold text-leaf-900">Yeşil Seçeneklerim</div>
            </div>
            <button class="w-8 h-8 rounded-xl bg-leaf-500 flex items-center justify-center btn-primary transition flex-shrink-0">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
            </button>
          </div>

          <div class="space-y-2.5">
            <div class="green-opt">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-9 h-9 rounded-xl bg-leaf-50 border border-leaf-200 flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-leaf-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                </div>
                <div class="min-w-0">
                  <div class="font-semibold text-sm text-leaf-900 truncate">Karton ambalaj</div>
                  <div class="text-[11px] text-leaf-800/50 font-mono">+80 KAI / seçim</div>
                </div>
              </div>
              <div class="toggle flex-shrink-0" data-toggle><div class="knob"></div></div>
            </div>

            <div class="green-opt">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-9 h-9 rounded-xl bg-leaf-50 border border-leaf-200 flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-leaf-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1m8-1a1 1 0 0 1-1 1H9m4-1V8a1 1 0 0 1 1-1h2.586a1 1 0 0 1 .707.293l3.414 3.414a1 1 0 0 1 .293.707V16a1 1 0 0 1-1 1h-1m-6.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm7 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/></svg>
                </div>
                <div class="min-w-0">
                  <div class="font-semibold text-sm text-leaf-900 truncate">Toplu teslimat</div>
                  <div class="text-[11px] text-leaf-800/50 font-mono">+50 KAI / seçim</div>
                </div>
              </div>
              <div class="toggle flex-shrink-0" data-toggle><div class="knob"></div></div>
            </div>

            <div class="green-opt">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-9 h-9 rounded-xl bg-leaf-50 border border-leaf-200 flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-leaf-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m21 16-4 4-4-4m4 4V4M3 8l4-4 4 4M7 4v16"/></svg>
                </div>
                <div class="min-w-0">
                  <div class="font-semibold text-sm text-leaf-900 truncate">Minimalist paket</div>
                  <div class="text-[11px] text-leaf-800/50 font-mono">+30 KAI / seçim</div>
                </div>
              </div>
              <div class="toggle off flex-shrink-0" data-toggle><div class="knob"></div></div>
            </div>

            <div class="green-opt opacity-60 border-dashed cursor-pointer hover:opacity-100 hover:border-leaf-400 transition-all">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-leaf-50 border border-dashed border-leaf-300 flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-leaf-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                </div>
                <span class="text-sm text-leaf-800/50">Yeni seçenek ekle</span>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-7 space-y-5">
          <div class="bg-leaf-900 text-white rounded-3xl p-6 relative overflow-hidden">
            <div class="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-leaf-500/20 blur-3xl pointer-events-none"></div>
            <div class="relative flex items-start justify-between flex-wrap gap-4">
              <div>
                <div class="eyebrow text-amber-400 mb-1">Aktif Belge</div>
                <div class="font-bold text-lg">ISO 14001 — Çevre Yönetim</div>
                <div class="text-sm text-white/60 mt-0.5">TÜRKAK tarafından düzenlendi</div>
              </div>
              <div class="flex items-center gap-2 bg-leaf-500/20 border border-leaf-500/30 px-3 py-1.5 rounded-full">
                <span class="w-1.5 h-1.5 rounded-full bg-leaf-400 animate-pulse"></span>
                <span class="text-[11px] font-mono text-leaf-200">Geçerli · 2026-12</span>
              </div>
            </div>
            <div class="mt-5 grid grid-cols-4 gap-3">
              <div class="text-center"><div class="text-xs font-mono text-white/40 mb-1">Belge tipi</div><div class="text-sm font-semibold">ISO 14001</div></div>
              <div class="text-center"><div class="text-xs font-mono text-white/40 mb-1">Eşleşme</div><div class="text-sm font-semibold text-leaf-300">Tam ✓</div></div>
              <div class="text-center"><div class="text-xs font-mono text-white/40 mb-1">Güven</div><div class="text-sm font-semibold text-amber-400">94/100</div></div>
              <div class="text-center"><div class="text-xs font-mono text-white/40 mb-1">Manipülasyon</div><div class="text-sm font-semibold text-leaf-300">Yok ✓</div></div>
            </div>
          </div>

          <div class="bg-white rounded-3xl p-6 border border-leaf-100">
            <div class="flex items-center justify-between mb-4">
              <div>
                <div class="eyebrow text-leaf-600 mb-1">Son 24 Saat</div>
                <div class="font-bold text-leaf-900">Son Aktivite</div>
              </div>
              <button class="text-xs font-semibold text-leaf-600 hover:text-leaf-800 transition">Tümünü gör →</button>
            </div>
            <div class="space-y-0.5">
              <div class="activity-row">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-leaf-100 flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-leaf-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                  </div>
                  <div><div class="text-sm font-semibold text-leaf-900">Karton ambalaj seçildi</div><div class="text-[11px] text-leaf-800/50">Kullanıcı #4821 · az önce</div></div>
                </div>
                <div class="text-right flex-shrink-0"><div class="text-sm font-bold text-leaf-600">+80 KAI</div></div>
              </div>

              <div class="activity-row">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-leaf-100 flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-leaf-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                  </div>
                  <div><div class="text-sm font-semibold text-leaf-900">Toplu teslimat seçildi</div><div class="text-[11px] text-leaf-800/50">Kullanıcı #3109 · 12 dk önce</div></div>
                </div>
                <div class="text-right flex-shrink-0"><div class="text-sm font-bold text-leaf-600">+50 KAI</div></div>
              </div>

              <div class="activity-row">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-leaf-100 flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-leaf-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                  </div>
                  <div><div class="text-sm font-semibold text-leaf-900">Karton ambalaj seçildi</div><div class="text-[11px] text-leaf-800/50">Kullanıcı #7742 · 28 dk önce</div></div>
                </div>
                <div class="text-right flex-shrink-0"><div class="text-sm font-bold text-leaf-600">+80 KAI</div></div>
              </div>

              <div class="activity-row">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 border border-amber-200">
                    <svg class="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 2 3 14h7l-1 8 10-12h-7z"/></svg>
                  </div>
                  <div><div class="text-sm font-semibold text-leaf-900">Kupon kullanıldı</div><div class="text-[11px] text-leaf-800/50">Kullanıcı #2287 · 1 sa önce</div></div>
                </div>
                <div class="text-right flex-shrink-0"><div class="text-sm font-bold text-amber-500">−500 KAI</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl p-6 border border-leaf-100">
        <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <div class="eyebrow text-leaf-600 mb-1">Aylık Trend</div>
            <div class="font-bold text-leaf-900">Yeşil Seçim Grafiği</div>
          </div>
          <div class="flex items-center gap-2">
            <button class="text-xs font-semibold px-3 py-1.5 rounded-full bg-leaf-500 text-white">Bu Ay</button>
            <button class="text-xs font-semibold px-3 py-1.5 rounded-full border border-leaf-200 text-leaf-700 hover:bg-leaf-50 transition">Son 3 Ay</button>
          </div>
        </div>
        <div class="flex items-end gap-2 h-32">
          <div class="flex-1 flex flex-col items-center gap-1"><div class="w-full bg-leaf-100 rounded-t-lg h-[40%]"></div><span class="text-[10px] font-mono text-leaf-800/40">1</span></div>
          <div class="flex-1 flex flex-col items-center gap-1"><div class="w-full bg-leaf-200 rounded-t-lg h-[55%]"></div><span class="text-[10px] font-mono text-leaf-800/40">2</span></div>
          <div class="flex-1 flex flex-col items-center gap-1"><div class="w-full bg-leaf-300 rounded-t-lg h-[45%]"></div><span class="text-[10px] font-mono text-leaf-800/40">3</span></div>
          <div class="flex-1 flex flex-col items-center gap-1"><div class="w-full bg-leaf-400 rounded-t-lg h-[68%]"></div><span class="text-[10px] font-mono text-leaf-800/40">4</span></div>
          <div class="flex-1 flex flex-col items-center gap-1"><div class="w-full bg-leaf-300 rounded-t-lg h-[52%]"></div><span class="text-[10px] font-mono text-leaf-800/40">5</span></div>
          <div class="flex-1 flex flex-col items-center gap-1"><div class="w-full bg-leaf-400 rounded-t-lg h-[75%]"></div><span class="text-[10px] font-mono text-leaf-800/40">6</span></div>
          <div class="flex-1 flex flex-col items-center gap-1"><div class="w-full bg-leaf-500 rounded-t-lg h-[88%]"></div><span class="text-[10px] font-mono text-leaf-800/40">7</span></div>
          <div class="flex-1 flex flex-col items-center gap-1"><div class="w-full bg-leaf-400 rounded-t-lg h-[72%]"></div><span class="text-[10px] font-mono text-leaf-800/40">8</span></div>
          <div class="flex-1 flex flex-col items-center gap-1"><div class="w-full bg-leaf-500 rounded-t-lg h-[92%]"></div><span class="text-[10px] font-mono text-leaf-800/40">9</span></div>
          <div class="flex-1 flex flex-col items-center gap-1"><div class="w-full bg-leaf-600 rounded-t-lg h-full"></div><span class="text-[10px] font-mono text-leaf-800/40">10</span></div>
          <div class="flex-1 flex flex-col items-center gap-1"><div class="w-full bg-leaf-500 rounded-t-lg h-[85%]"></div><span class="text-[10px] font-mono text-leaf-800/40">11</span></div>
          <div class="flex-1 flex flex-col items-center gap-1"><div class="w-full bg-leaf-300 rounded-t-lg opacity-50 h-[60%]"></div><span class="text-[10px] font-mono text-leaf-800/40">12</span></div>
          <div class="flex-1 flex flex-col items-center gap-1"><div class="w-full bg-leaf-200 rounded-t-lg opacity-40 border-2 border-dashed border-leaf-400 h-[45%]"></div><span class="text-[10px] font-mono text-leaf-800/40">13</span></div>
        </div>
        <div class="mt-4 flex items-center gap-4 text-xs text-leaf-800/50">
          <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-leaf-500 inline-block"></span>Yeşil seçim sayısı</div>
          <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-leaf-200 border border-dashed border-leaf-400 inline-block"></span>Tahmini</div>
        </div>
      </div>
    </div>
  `;

  dashboardRoot.querySelectorAll("[data-toggle]").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      toggle.classList.toggle("off");
    });
  });
}
