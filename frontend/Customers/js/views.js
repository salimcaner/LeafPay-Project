const CUSTOMER_VIEW_LABELS = {
  dashboard: "Ana Sayfa",
  wallet: "VERA Cüzdanı",
  profile: "Profil ve Ayarlar",
};

function getCustomerRoot() {
  return document.getElementById("customer-root");
}

function fmtNumber(value, digits) {
  return new Intl.NumberFormat("tr-TR", digits ? { minimumFractionDigits: digits, maximumFractionDigits: digits } : {}).format(value);
}

function getStatusClass(status) {
  if (/(teslim|tamamlandı|tamamlandi)/i.test(status)) return "status-badge--success";
  if (/(hazır|hazir|kargo)/i.test(status)) return "status-badge--pending";
  return "status-badge--muted";
}

function getCouponClass(type) {
  if (type === "used") return "coupon-badge--used";
  if (type === "expiring") return "coupon-badge--expiring";
  return "coupon-badge--active";
}

function getInitials(name) {
  return String(name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "ML";
}

function setCustomerBodyAttributes() {
  document.body.setAttribute("data-customer-accent", "leaf");
}

function renderCustomerDashboard() {
  const root = getCustomerRoot();
  if (!root) return;

  setCustomerBodyAttributes();
  const profile = getCustomerProfile();
  const activities = CUSTOMER_PANEL_DATA.activities;

  root.innerHTML = `
    <section class="customer-wrap">
      <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 class="text-[2.1rem] lg:text-[2.4rem] font-black text-leaf-900 tracking-tight leading-[1.05]">Merhaba, ${profile.name}</h1>
          <p class="mt-1.5 text-leaf-800/65 text-sm max-w-2xl">Bugün yaptığın yeşil seçimler LeafPay ekosisteminde puana, etkiye ve yeni kupon fırsatlarına dönüşüyor.</p>
        </div>
        <span class="pill-mono"><span class="w-1.5 h-1.5 rounded-full bg-leaf-500"></span>Canlı panel · 18 Mayıs 2026</span>
      </div>

      <div class="dashboard-top-grid mb-5">
        <div class="card-dark relative overflow-hidden tier-elevated">
          <div class="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-leaf-500/20 blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-10 -left-8 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none"></div>
          <div class="relative flex items-start justify-between gap-4">
            <div>
              <div class="eyebrow text-amber-400 mb-2">Kullanıcı Özeti</div>
              <div class="text-3xl font-black tracking-tight">${fmtNumber(profile.veraBalance)} VERA</div>
              <div class="text-sm text-white/60 mt-1">Aktif bakiye · ${profile.couponsAvailable} kupon kullanıma hazır</div>
            </div>
            <div class="relative w-20 h-20 flex-shrink-0">
              <div class="absolute inset-0 rounded-full badge-ring spin-slow opacity-90"></div>
              <div class="absolute inset-[5px] rounded-full bg-leaf-500 flex items-center justify-center text-white font-black text-xl">${getInitials(profile.fullName)}</div>
            </div>
          </div>
          <div class="mt-5 grid grid-cols-4 gap-3">
            <div>
              <div class="eyebrow text-amber-400/80">Bu ay</div>
              <div class="text-xl font-bold tabular-nums mt-1">+${fmtNumber(profile.monthlyEarned)}</div>
            </div>
            <div>
              <div class="eyebrow text-amber-400/80">Yeşil seçim</div>
              <div class="text-xl font-bold tabular-nums mt-1">${fmtNumber(profile.greenChoicesCount)}</div>
            </div>
            <div>
              <div class="eyebrow text-amber-400/80">Sipariş</div>
              <div class="text-xl font-bold tabular-nums mt-1">${fmtNumber(profile.completedOrders)}</div>
            </div>
            <div>
              <div class="eyebrow text-amber-400/80">Kupon</div>
              <div class="text-xl font-bold tabular-nums mt-1">${profile.couponsAvailable}</div>
            </div>
          </div>
        </div>

        <div class="dashboard-stats-col">
          <div class="stat-card">
            <div class="eyebrow">Toplam VERA</div>
            <div class="mt-2 metric-number text-[2.1rem] leading-none">${fmtNumber(profile.veraBalance)}</div>
            <div class="mt-1.5 text-[11px] text-leaf-800/50 font-mono">Kullanılabilir bakiye</div>
          </div>
          <div class="stat-card">
            <div class="eyebrow">Bu Ay Kazanılan</div>
            <div class="mt-2 metric-number text-[2.1rem] leading-none">+${fmtNumber(profile.monthlyEarned)}</div>
            <div class="mt-1.5 text-[11px] text-leaf-800/50 font-mono">Geçen aya göre +14%</div>
          </div>
          <div class="stat-card">
            <div class="eyebrow">Önlenen Plastik</div>
            <div class="mt-2 metric-number text-[2.1rem] leading-none">${fmtNumber(profile.plasticSavedKg, 1)} kg</div>
            <div class="mt-1.5 text-[11px] text-leaf-800/50 font-mono">≈ 192 şişe etkisi</div>
          </div>
          <div class="stat-card">
            <div class="eyebrow">Karbon Etkisi</div>
            <div class="mt-2 metric-number text-[2.1rem] leading-none">${fmtNumber(profile.carbonSavedKg, 1)} kg</div>
            <div class="mt-1.5 text-[11px] text-leaf-800/50 font-mono">≈ 19 ağacın günlük emilimi</div>
          </div>
        </div>
      </div>

      <div class="dashboard-bottom-grid">
        <div class="card h-full">
          <div class="flex items-center justify-between gap-3 mb-4">
            <div>
              <div class="eyebrow">Son Aktiviteler</div>
              <div class="font-bold text-leaf-900 mt-1 text-lg">Kazandığın VERA hareketleri</div>
            </div>
            <span class="pill-mono">${activities.length} hareket</span>
          </div>
          <div class="mini-list flex-1">
            ${activities.map((item) => `
              <div class="activity-item">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <div class="font-semibold text-sm text-leaf-900">${item.title}</div>
                    <div class="text-xs text-leaf-800/55 mt-1">${item.brand} · ${item.detail}</div>
                  </div>
                  <div class="text-right">
                    <div class="font-bold text-leaf-700 text-sm">+${item.vera} VERA</div>
                    <div class="text-[11px] text-leaf-800/40 mt-1">${item.date}</div>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="card h-full">
          <div class="eyebrow">Çevresel Katkı</div>
          <div class="font-bold text-leaf-900 mt-1 text-lg">Seçimlerinin bu ayki etkisi</div>
          <div class="impact-grid mt-4">
            <div class="activity-item">
              <div class="text-[11px] font-mono text-leaf-700">Karton tercih</div>
              <div class="metric-number text-2xl mt-2">11</div>
              <div class="text-xs text-leaf-800/55 mt-1">siparişte kullanıldı</div>
            </div>
            <div class="activity-item">
              <div class="text-[11px] font-mono text-leaf-700">Ağaç bağışı</div>
              <div class="metric-number text-2xl mt-2">${profile.treeDonationCount}</div>
              <div class="text-xs text-leaf-800/55 mt-1">aktif destek</div>
            </div>
            <div class="activity-item">
              <div class="text-[11px] font-mono text-leaf-700">Dijital fiş</div>
              <div class="metric-number text-2xl mt-2">9</div>
              <div class="text-xs text-leaf-800/55 mt-1">basılı fiş önlendi</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderWalletView() {
  const root = getCustomerRoot();
  if (!root) return;

  setCustomerBodyAttributes();
  const profile = getCustomerProfile();
  const campaigns = CUSTOMER_PANEL_DATA.campaigns.filter((item) => item.type !== "used").slice(0, 4);

  root.innerHTML = `
    <section class="customer-wrap">
      <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 class="text-[2.05rem] lg:text-[2.3rem] font-black text-leaf-900 tracking-tight leading-[1.05]">Cüzdan</h1>
          <p class="mt-1.5 text-leaf-800/65 text-sm max-w-2xl">VERA bakiyeni takip et, kupona dönüştür ve tüm hareketlerini tek ekranda gör.</p>
        </div>
        <span class="pill-mono">${fmtNumber(profile.couponsAvailable)} kullanılabilir kupon</span>
      </div>

      <div class="section-grid mb-5">
        <div class="card-dark relative overflow-hidden">
          <div class="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-leaf-500/20 blur-3xl"></div>
          <div class="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <div class="eyebrow text-amber-400 mb-2">Mevcut Bakiye</div>
              <div class="text-[2.6rem] font-black leading-none">${fmtNumber(profile.veraBalance)}</div>
              <div class="text-sm text-white/55 mt-2">TL karşılığıyla kullanıma hazır VERA bakiyen</div>
            </div>
            <div class="text-right">
              <div class="eyebrow text-amber-400/80">TL karşılığı</div>
              <div class="text-xl font-bold mt-1">${fmtNumber(profile.veraBalance)} TL</div>
              <div class="text-[11px] text-white/45 mt-1">Anında kullanılabilir değer</div>
            </div>
          </div>
          <div class="stats-grid mt-5">
            <div class="stat-card bg-white/5 border-white/10">
              <div class="eyebrow text-amber-400/85">Bu ay eklenen</div>
              <div class="text-2xl font-black text-white mt-2">+${fmtNumber(profile.monthlyEarned)}</div>
            </div>
            <div class="stat-card bg-white/5 border-white/10">
              <div class="eyebrow text-amber-400/85">Kullanılabilir değer</div>
              <div class="text-2xl font-black text-white mt-2">${fmtNumber(profile.veraBalance)} TL</div>
            </div>
          </div>
        </div>

        <div class="wallet-convert">
          <div class="eyebrow">Kupona Dönüştür</div>
          <div class="font-bold text-leaf-900 mt-1 text-lg">Hazır kampanyalar</div>
          <div class="mini-list mt-4">
            ${campaigns.map((item) => `
              <div class="campaign-item">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="font-semibold text-sm text-leaf-900">${item.title}</div>
                    <div class="text-xs text-leaf-800/55 mt-1">${item.brand} · ${item.highlight}</div>
                  </div>
                  <button class="action-button action-button--primary">${item.cost} VERA</button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>

      <div class="card mb-5">
        <div class="flex items-center justify-between gap-3 mb-4">
          <div>
            <div class="eyebrow">Puan Hareketleri</div>
            <div class="font-bold text-leaf-900 mt-1 text-lg">Son işlem geçmişi</div>
          </div>
          <span class="pill-mono">${CUSTOMER_PANEL_DATA.walletMovements.length} satır</span>
        </div>

        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Tür</th>
                <th>Kaynak</th>
                <th>Tutar</th>
                <th>Bakiye</th>
              </tr>
            </thead>
            <tbody>
              ${CUSTOMER_PANEL_DATA.walletMovements.map((item) => `
                <tr>
                  <td>${item.date}</td>
                  <td><span class="status-badge ${item.type === "Kullanım" ? "status-badge--pending" : "status-badge--success"}">${item.type}</span></td>
                  <td>${item.source}</td>
                  <td class="${item.amount.startsWith("-") ? "text-amber-700" : "text-leaf-700"} font-semibold">${item.amount}</td>
                  <td class="mono-mini">${item.balance} VERA</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}

function renderProfileView() {
  const root = getCustomerRoot();
  if (!root) return;

  setCustomerBodyAttributes();
  const profile = getCustomerProfile();
  const notifications = CUSTOMER_PANEL_DATA.notifications;
  const defaults = CUSTOMER_PANEL_DATA.defaults;

  root.innerHTML = `
    <section class="customer-wrap">
      <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 class="text-[2.05rem] lg:text-[2.3rem] font-black text-leaf-900 tracking-tight leading-[1.05]">Profil ve Ayarlar</h1>
          <p class="mt-1.5 text-leaf-800/65 text-sm max-w-2xl">Kullanıcı bilgilerin, bildirim tercihlerin, varsayılan yeşil seçimlerin ve güvenlik alanların tek yerde yönetilir.</p>
        </div>
        <span class="pill-mono">Üyelik başlangıcı ${profile.memberSince}</span>
      </div>

      <div class="profile-grid">
        <div class="customer-grid">
          <div class="card">
            <div class="eyebrow">Kullanıcı Bilgileri</div>
            <div class="font-bold text-leaf-900 mt-1 text-lg">Hesap profili</div>
            <div class="field-stack mt-4">
              <div class="field-row">
                <div class="field">
                  <label>Ad Soyad</label>
                  <input value="${profile.fullName}" readonly>
                </div>
                <div class="field">
                  <label>Şehir</label>
                  <input value="${profile.city}" readonly>
                </div>
              </div>
              <div class="field-row">
                <div class="field">
                  <label>E-posta</label>
                  <input value="${profile.email}" readonly>
                </div>
                <div class="field">
                  <label>Telefon</label>
                  <input value="${profile.phone}" readonly>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="eyebrow">Bildirim Tercihleri</div>
            <div class="font-bold text-leaf-900 mt-1 text-lg">Hangi konularda haber almak istiyorsun?</div>
            <div class="mini-list mt-4">
              ${[
                ["Sipariş güncellemeleri", notifications.order],
                ["Kampanya ve kupon fırsatları", notifications.campaign],
                ["LeafPay duyuruları", notifications.marketing],
                ["Bağış ve etki raporları", notifications.donation],
              ].map(([label, enabled]) => `
                <div class="setting-item flex items-center justify-between gap-4">
                  <div class="text-sm font-medium text-leaf-900">${label}</div>
                  <div class="setting-switch ${enabled ? "" : "off"}"><span></span></div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>

        <div class="customer-grid">
          <div class="card">
            <div class="eyebrow">Yeşil Tercih Varsayılanları</div>
            <div class="font-bold text-leaf-900 mt-1 text-lg">Sipariş öncesi otomatik seçimler</div>
            <div class="mini-list mt-4">
              ${[
                ["Karton paketlemeyi öncele", defaults.packaging],
                ["Dijital fiş varsayılan olsun", defaults.digitalReceipt],
                ["Birleşik teslimat uygunsa aktif et", defaults.consolidatedShipping],
                ["Ağaç bağışını manuel seç", defaults.treeDonation],
              ].map(([label, enabled]) => `
                <div class="setting-item flex items-center justify-between gap-4">
                  <div class="text-sm font-medium text-leaf-900">${label}</div>
                  <div class="setting-switch ${enabled ? "" : "off"}"><span></span></div>
                </div>
              `).join("")}
            </div>
          </div>

          <div class="card">
            <div class="eyebrow">Hesap Güvenliği</div>
            <div class="font-bold text-leaf-900 mt-1 text-lg">Güvenlik işlemleri</div>
            <div class="mini-list mt-4">
              <div class="setting-item">
                <div class="font-semibold text-sm text-leaf-900">Şifre güncelleme</div>
                <div class="text-xs text-leaf-800/55 mt-1">Son değişiklik 26 Nisan 2026</div>
                <button class="action-button action-button--ghost mt-4">Şifreyi yenile</button>
              </div>
              <div class="setting-item">
                <div class="font-semibold text-sm text-leaf-900">İki adımlı doğrulama</div>
                <div class="text-xs text-leaf-800/55 mt-1">Telefon doğrulaması aktif değil</div>
                <button class="action-button action-button--primary mt-4">2FA etkinleştir</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
