const CUSTOMER_VIEW_LABELS = {
  dashboard: "Ana Sayfa",
  wallet: "VERA Cuzdani",
  "green-choices": "Yesil Secimlerim",
  orders: "Siparislerim",
  campaigns: "Kampanyalar",
  profile: "Profil ve Ayarlar",
};

function getCustomerRoot() {
  return document.getElementById("customer-root");
}

function fmtNumber(value, digits) {
  return new Intl.NumberFormat("tr-TR", digits ? { minimumFractionDigits: digits, maximumFractionDigits: digits } : {}).format(value);
}

function getStatusClass(status) {
  if (/(teslim|tamam)/i.test(status)) return "status-badge--success";
  if (/(hazir|kargo)/i.test(status)) return "status-badge--pending";
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
  const featuredCampaigns = CUSTOMER_PANEL_DATA.campaigns.slice(0, 3);

  root.innerHTML = `
    <section class="customer-wrap">
      <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 class="text-[2.1rem] lg:text-[2.4rem] font-black text-leaf-900 tracking-tight leading-[1.05]">Merhaba, ${profile.name}</h1>
          <p class="mt-1.5 text-leaf-800/65 text-sm max-w-2xl">Bugun yaptigin yesil secimler LeafPay ekosisteminde puana, etkiye ve yeni kupon firsatlarina donusuyor. Bu ay <b class="text-leaf-700">${fmtNumber(profile.monthlyEarned)}</b> VERA kazandin.</p>
        </div>
        <span class="pill-mono"><span class="w-1.5 h-1.5 rounded-full bg-leaf-500"></span>Canli panel · 18 Mayis 2026</span>
      </div>

      <div class="customer-grid hero-grid mb-5">
        <div class="card-dark relative overflow-hidden tier-elevated">
          <div class="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-leaf-500/20 blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-10 -left-8 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none"></div>
          <div class="relative flex items-start justify-between gap-4">
            <div>
              <div class="eyebrow text-amber-400 mb-2">Kullanici Ozeti</div>
              <div class="text-2xl font-black tracking-tight">${fmtNumber(profile.veraBalance)} VERA</div>
              <div class="text-sm text-white/60 mt-1">Aktif bakiye · ${profile.couponsAvailable} kupon kullanima hazir</div>
            </div>
            <div class="relative w-20 h-20 flex-shrink-0">
              <div class="absolute inset-0 rounded-full badge-ring spin-slow opacity-90"></div>
              <div class="absolute inset-[5px] rounded-full bg-leaf-500 flex items-center justify-center text-white font-black text-xl">${getInitials(profile.fullName)}</div>
            </div>
          </div>

          <div class="mt-5 grid grid-cols-3 gap-3">
            <div>
              <div class="eyebrow text-amber-400/80">Bu ay</div>
              <div class="text-lg font-bold tabular-nums mt-1">+${fmtNumber(profile.monthlyEarned)}</div>
            </div>
            <div>
              <div class="eyebrow text-amber-400/80">Yesil secim</div>
              <div class="text-lg font-bold tabular-nums mt-1">${fmtNumber(profile.greenChoicesCount)}</div>
            </div>
            <div>
              <div class="eyebrow text-amber-400/80">Siparis</div>
              <div class="text-lg font-bold tabular-nums mt-1">${fmtNumber(profile.completedOrders)}</div>
            </div>
          </div>

          <div class="mt-5">
            <div class="flex items-center justify-between text-[11px] mb-1.5">
              <span class="text-white/55 font-mono">Aylik kupon hedefine ilerleme</span>
              <span class="text-amber-400 font-mono font-semibold">%71</span>
            </div>
            <div class="progress-bar bg-white/10"><div class="progress-fill" style="width:71%; background:#F5B656;"></div></div>
            <div class="mt-2 text-[11px] text-white/45">4.000 VERA hedefine 1.160 puan kaldi</div>
          </div>
        </div>

        <div class="card relative overflow-hidden">
          <div class="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-leaf-100/70 blur-3xl pointer-events-none"></div>
          <div class="relative">
            <div class="eyebrow">One Cikan Kampanyalar</div>
            <div class="font-bold text-leaf-900 mt-1 text-lg">Bugun senin icin secilenler</div>
            <div class="mini-list mt-4">
              ${featuredCampaigns.map((campaign) => `
                <div class="campaign-item">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <div class="font-semibold text-sm text-leaf-900">${campaign.title}</div>
                      <div class="text-xs text-leaf-800/55 mt-1">${campaign.brand} · ${campaign.highlight}</div>
                    </div>
                    <span class="coupon-badge ${getCouponClass(campaign.type)}">${campaign.cost} VERA</span>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </div>

      <div class="stats-grid mb-5">
        <div class="stat-card">
          <div class="eyebrow">Toplam VERA</div>
          <div class="mt-3 metric-number text-[2.35rem] leading-none">${fmtNumber(profile.veraBalance)}</div>
          <div class="mt-2 text-[11px] text-leaf-800/50 font-mono">Kullanilabilir bakiye</div>
        </div>
        <div class="stat-card">
          <div class="eyebrow">Bu Ay Kazanilan</div>
          <div class="mt-3 metric-number text-[2.35rem] leading-none">+${fmtNumber(profile.monthlyEarned)}</div>
          <div class="mt-2 text-[11px] text-leaf-800/50 font-mono">Gecen aya gore +14%</div>
        </div>
        <div class="stat-card">
          <div class="eyebrow">Onlenen Plastik</div>
          <div class="mt-3 metric-number text-[2.35rem] leading-none">${fmtNumber(profile.plasticSavedKg, 1)} kg</div>
          <div class="mt-2 text-[11px] text-leaf-800/50 font-mono">≈ 192 sise etkisi</div>
        </div>
        <div class="stat-card">
          <div class="eyebrow">Karbon Etkisi</div>
          <div class="mt-3 metric-number text-[2.35rem] leading-none">${fmtNumber(profile.carbonSavedKg, 1)} kg</div>
          <div class="mt-2 text-[11px] text-leaf-800/50 font-mono">≈ 19 agacin gunluk emilimi</div>
        </div>
      </div>

      <div class="section-grid">
        <div class="card">
          <div class="flex items-center justify-between gap-3 mb-4">
            <div>
              <div class="eyebrow">Son Aktiviteler</div>
              <div class="font-bold text-leaf-900 mt-1 text-lg">Kazandigin VERA hareketleri</div>
            </div>
            <span class="pill-mono">${activities.length} hareket</span>
          </div>
          <div class="mini-list">
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

        <div class="card">
          <div class="eyebrow">Cevresel Katki</div>
          <div class="font-bold text-leaf-900 mt-1 text-lg">Secimlerinin bu ayki etkisi</div>
          <div class="impact-grid mt-4">
            <div class="activity-item">
              <div class="text-[11px] font-mono text-leaf-700">Karton tercih</div>
              <div class="metric-number text-2xl mt-2">11</div>
              <div class="text-xs text-leaf-800/55 mt-1">sipariste kullanildi</div>
            </div>
            <div class="activity-item">
              <div class="text-[11px] font-mono text-leaf-700">Agac bagisi</div>
              <div class="metric-number text-2xl mt-2">${profile.treeDonationCount}</div>
              <div class="text-xs text-leaf-800/55 mt-1">aktif destek</div>
            </div>
            <div class="activity-item">
              <div class="text-[11px] font-mono text-leaf-700">Dijital fis</div>
              <div class="metric-number text-2xl mt-2">9</div>
              <div class="text-xs text-leaf-800/55 mt-1">basili fis onlendi</div>
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
          <h1 class="text-[2.05rem] lg:text-[2.3rem] font-black text-leaf-900 tracking-tight leading-[1.05]">VERA Cuzdani</h1>
          <p class="mt-1.5 text-leaf-800/65 text-sm max-w-2xl">Bakiyeni takip et, kupona donustur ve tum hareketlerini tek ekranda gor.</p>
        </div>
        <span class="pill-mono">${fmtNumber(profile.couponsAvailable)} kullanilabilir kupon</span>
      </div>

      <div class="section-grid mb-5">
        <div class="card-dark relative overflow-hidden">
          <div class="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-leaf-500/20 blur-3xl"></div>
          <div class="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <div class="eyebrow text-amber-400 mb-2">Mevcut Bakiye</div>
              <div class="text-[2.6rem] font-black leading-none">${fmtNumber(profile.veraBalance)}</div>
              <div class="text-sm text-white/55 mt-2">Son 30 gunde +${fmtNumber(profile.monthlyEarned)} VERA</div>
            </div>
            <div class="text-right">
              <div class="eyebrow text-amber-400/80">Kupon esigi</div>
              <div class="text-xl font-bold mt-1">500 VERA</div>
              <div class="text-[11px] text-white/45 mt-1">Minimum donusum</div>
            </div>
          </div>
          <div class="stats-grid mt-5">
            <div class="stat-card bg-white/5 border-white/10">
              <div class="eyebrow text-amber-400/85">Kazanilan</div>
              <div class="text-2xl font-black text-white mt-2">+3.980</div>
            </div>
            <div class="stat-card bg-white/5 border-white/10">
              <div class="eyebrow text-amber-400/85">Harcanan</div>
              <div class="text-2xl font-black text-white mt-2">-1.140</div>
            </div>
          </div>
        </div>

        <div class="wallet-convert">
          <div class="eyebrow">Kupona Donustur</div>
          <div class="font-bold text-leaf-900 mt-1 text-lg">Hazir kampanyalar</div>
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
            <div class="font-bold text-leaf-900 mt-1 text-lg">Son islem gecmisi</div>
          </div>
          <span class="pill-mono">${CUSTOMER_PANEL_DATA.walletMovements.length} satir</span>
        </div>

        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Tur</th>
                <th>Kaynak</th>
                <th>Tutar</th>
                <th>Bakiye</th>
              </tr>
            </thead>
            <tbody>
              ${CUSTOMER_PANEL_DATA.walletMovements.map((item) => `
                <tr>
                  <td>${item.date}</td>
                  <td><span class="status-badge ${item.type === "Kullanim" ? "status-badge--pending" : "status-badge--success"}">${item.type}</span></td>
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

function renderGreenChoicesView() {
  const root = getCustomerRoot();
  if (!root) return;

  setCustomerBodyAttributes();
  const choices = CUSTOMER_PANEL_DATA.greenChoices;

  root.innerHTML = `
    <section class="customer-wrap">
      <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 class="text-[2.05rem] lg:text-[2.3rem] font-black text-leaf-900 tracking-tight leading-[1.05]">Yesil Secimlerim</h1>
          <p class="mt-1.5 text-leaf-800/65 text-sm max-w-2xl">Her sipariste yaptigin cevreci secimler, kazandirdigi VERA puani ve satici bilgisi ile birlikte listelenir.</p>
        </div>
        <span class="pill-mono">${choices.length} kayit</span>
      </div>

      <div class="choice-grid mb-5">
        ${choices.slice(0, 4).map((item) => `
          <div class="card">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="eyebrow">${item.option}</div>
                <div class="font-bold text-leaf-900 mt-1">${item.seller}</div>
                <div class="text-xs text-leaf-800/55 mt-1">${item.orderId} · ${item.date}</div>
              </div>
              <span class="choice-badge choice-badge--success">+${item.vera} VERA</span>
            </div>
            <div class="mt-4 text-sm text-leaf-800/65">${item.note}</div>
            <div class="mt-4 pt-4 border-t border-leaf-100 flex items-center justify-between">
              <span class="mono-mini">${item.status}</span>
              <button class="action-button action-button--ghost">Siparisi ac</button>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="card">
        <div class="flex items-center justify-between gap-3 mb-4">
          <div>
            <div class="eyebrow">Tum Secimler</div>
            <div class="font-bold text-leaf-900 mt-1 text-lg">Siparis bazli detay listesi</div>
          </div>
        </div>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Yesil Secim</th>
                <th>Siparis ID</th>
                <th>Tarih</th>
                <th>Satici</th>
                <th>VERA</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              ${choices.map((item) => `
                <tr>
                  <td>${item.option}</td>
                  <td class="mono-mini">${item.orderId}</td>
                  <td>${item.date}</td>
                  <td>${item.seller}</td>
                  <td class="text-leaf-700 font-semibold">+${item.vera}</td>
                  <td><span class="status-badge ${getStatusClass(item.status)}">${item.status}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}

function renderOrdersView() {
  const root = getCustomerRoot();
  if (!root) return;

  setCustomerBodyAttributes();
  const orders = CUSTOMER_PANEL_DATA.orders;

  root.innerHTML = `
    <section class="customer-wrap">
      <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 class="text-[2.05rem] lg:text-[2.3rem] font-black text-leaf-900 tracking-tight leading-[1.05]">Siparislerim</h1>
          <p class="mt-1.5 text-leaf-800/65 text-sm max-w-2xl">Siparis listende yesil opsiyon kullanimi, kazanilan VERA ve durum takibi ayni tabloda gorulur.</p>
        </div>
        <span class="pill-mono">${orders.length} siparis</span>
      </div>

      <div class="card">
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Siparis</th>
                <th>Satici</th>
                <th>Tarih</th>
                <th>Toplam</th>
                <th>Yesil Secim</th>
                <th>VERA</th>
                <th>Durum</th>
                <th>Detay</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map((item) => `
                <tr>
                  <td class="mono-mini">${item.id}</td>
                  <td>${item.seller}</td>
                  <td>${item.date}</td>
                  <td>${item.total}</td>
                  <td>${item.green}</td>
                  <td class="text-leaf-700 font-semibold">+${item.vera}</td>
                  <td><span class="status-badge ${getStatusClass(item.status)}">${item.status}</span></td>
                  <td><button class="action-button action-button--ghost">Detay</button></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}

function renderCampaignsView() {
  const root = getCustomerRoot();
  if (!root) return;

  setCustomerBodyAttributes();
  const campaigns = CUSTOMER_PANEL_DATA.campaigns;

  root.innerHTML = `
    <section class="customer-wrap">
      <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 class="text-[2.05rem] lg:text-[2.3rem] font-black text-leaf-900 tracking-tight leading-[1.05]">Kampanyalar ve Kuponlar</h1>
          <p class="mt-1.5 text-leaf-800/65 text-sm max-w-2xl">VERA ile alinabilecek kuponlar, aktif kullanimlar ve suresi yaklasan teklifler burada listelenir.</p>
        </div>
        <span class="pill-mono">${campaigns.length} kampanya</span>
      </div>

      <div class="coupon-grid">
        ${campaigns.map((item) => `
          <div class="coupon-item">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="eyebrow">${item.brand}</div>
                <div class="font-bold text-leaf-900 mt-1">${item.title}</div>
              </div>
              <span class="coupon-badge ${getCouponClass(item.type)}">${item.type === "used" ? "Kullanildi" : item.expiresIn}</span>
            </div>
            <div class="text-sm text-leaf-800/65 mt-3">${item.highlight}</div>
            <div class="mt-4 pt-4 border-t border-leaf-100 flex items-center justify-between">
              <div>
                <div class="mono-mini">Maliyet</div>
                <div class="font-bold text-leaf-900 mt-1">${item.cost} VERA</div>
              </div>
              <button class="action-button ${item.type === "used" ? "action-button--ghost" : "action-button--primary"}">${item.type === "used" ? "Arsiv" : "Kupon Al"}</button>
            </div>
          </div>
        `).join("")}
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
          <p class="mt-1.5 text-leaf-800/65 text-sm max-w-2xl">Kullanici bilgilerin, bildirim tercihlerin, varsayilan yesil secimlerin ve guvenlik alanlarin tek yerde yonetilir.</p>
        </div>
        <span class="pill-mono">Uye since ${profile.memberSince}</span>
      </div>

      <div class="profile-grid">
        <div class="customer-grid">
          <div class="card">
            <div class="eyebrow">Kullanici Bilgileri</div>
            <div class="font-bold text-leaf-900 mt-1 text-lg">Hesap profili</div>
            <div class="field-stack mt-4">
              <div class="field-row">
                <div class="field">
                  <label>Ad Soyad</label>
                  <input value="${profile.fullName}" readonly>
                </div>
                <div class="field">
                  <label>Sehir</label>
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
                ["Siparis guncellemeleri", notifications.order],
                ["Kampanya ve kupon firsatlari", notifications.campaign],
                ["LeafPay duyurulari", notifications.marketing],
                ["Bagis ve etki raporlari", notifications.donation],
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
            <div class="eyebrow">Yesil Tercih Varsayilanlari</div>
            <div class="font-bold text-leaf-900 mt-1 text-lg">Siparis oncesi otomatik secimler</div>
            <div class="mini-list mt-4">
              ${[
                ["Karton paketlemeyi oncele", defaults.packaging],
                ["Dijital fis varsayilan olsun", defaults.digitalReceipt],
                ["Birlesik teslimat uygunsa aktif et", defaults.consolidatedShipping],
                ["Agac bagisini manuel sec", defaults.treeDonation],
              ].map(([label, enabled]) => `
                <div class="setting-item flex items-center justify-between gap-4">
                  <div class="text-sm font-medium text-leaf-900">${label}</div>
                  <div class="setting-switch ${enabled ? "" : "off"}"><span></span></div>
                </div>
              `).join("")}
            </div>
          </div>

          <div class="card">
            <div class="eyebrow">Hesap Guvenligi</div>
            <div class="font-bold text-leaf-900 mt-1 text-lg">Guvenlik islemleri</div>
            <div class="mini-list mt-4">
              <div class="setting-item">
                <div class="font-semibold text-sm text-leaf-900">Sifre guncelleme</div>
                <div class="text-xs text-leaf-800/55 mt-1">Son degisiklik 26 Nisan 2026</div>
                <button class="action-button action-button--ghost mt-4">Sifreyi yenile</button>
              </div>
              <div class="setting-item">
                <div class="font-semibold text-sm text-leaf-900">Iki adimli dogrulama</div>
                <div class="text-xs text-leaf-800/55 mt-1">Telefon dogrulamasi aktif degil</div>
                <button class="action-button action-button--primary mt-4">2FA etkinlestir</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
