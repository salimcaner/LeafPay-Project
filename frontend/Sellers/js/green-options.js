const OPTIONS = [
  {
    id: "karton_paketleme",
    name: "Karton Paketleme",
    desc: "Plastik yerine FSC sertifikalı karton ambalaj.",
    vera: 80,
    bg: "#F1FAF6",
    fg: "#168562",
    icon: '<g><path d="M21 8 12 13 3 8m0 0 9-5 9 5M3 8v8l9 5 9-5V8"></path></g>',
  },
  {
    id: "karbon_notr_kargo",
    name: "Karbon Nötr Kargo",
    desc: "Karbon dengelemeli yeşil filo kargo seçeneği.",
    vera: 50,
    bg: "#F1FAF6",
    fg: "#0F6A4F",
    icon: '<g><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V15a1 1 0 0 0 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle></g>',
  },
  {
    id: "agac_dikme_bagis",
    name: "Ağaç Dikme Bağışı",
    desc: "Her siparişle TEMA ortaklığında ağaç dikilir.",
    vera: 40,
    bg: "#FBF0DC",
    fg: "#C77A0F",
    icon: '<g><path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 13-9 0 7-3 16-13 16Z"></path><path d="M4 20c1-5 4-9 9-12"></path></g>',
  },
  {
    id: "minimal_etiket",
    name: "Minimal Etiket",
    desc: "Etiketsiz/QR tabanlı dijital ürün bilgisi.",
    vera: 30,
    bg: "#F1FAF6",
    fg: "#168562",
    icon: '<g><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></g>',
  },
];

const OPT_BY_ID = Object.fromEntries(OPTIONS.map((option) => [option.id, option]));

const PRODUCTS = [
  "KTN-KRT-LG-01",
  "KTN-TSH-M-12",
  "KTN-JNS-32-04",
  "KTN-CKT-S-09",
  "KTN-DRS-L-21",
  "KTN-BAG-XL-05",
];

const USERS = [
  "ayse.kara@example.com",
  "mert.demir@example.com",
  "zeynep.ay@example.com",
  "can.oz@example.com",
  "eda.celik@example.com",
  "ali.yilmaz@example.com",
  "ipek.tas@example.com",
  "kerem.gunes@example.com",
];

const greenProductsState = {
  logs: [],
  activeOpts: {
    karton_paketleme: true,
    karbon_notr_kargo: true,
    agac_dikme_bagis: false,
    minimal_etiket: true,
  },
  filterOpt: null,
  search: "",
  range: "24h",
  refreshing: false,
  loading: false,
  liveTimer: null,
};

function mulberry32(seed) {
  return function seededRandom() {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function seedLogs() {
  const random = mulberry32(20260518);
  const logs = [];
  const now = Date.now();

  for (let index = 0; index < 38; index += 1) {
    const option = OPTIONS[Math.floor(random() * OPTIONS.length)];
    const minutesAgo = Math.floor(random() * 60 * 24);

    logs.push({
      id: `wh_${1000 + index}`,
      option: option.id,
      product_id: PRODUCTS[Math.floor(random() * PRODUCTS.length)],
      user_email: USERS[Math.floor(random() * USERS.length)],
      order_id: `TR-${240000 + Math.floor(random() * 9999)}`,
      vera_points: option.vera,
      created_at: now - (minutesAgo * 60000),
    });
  }

  return logs.sort((left, right) => right.created_at - left.created_at);
}

function relTime(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "az önce";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} dk önce`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} sa önce`;

  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

function fmtNum(value) {
  return new Intl.NumberFormat("tr-TR").format(value);
}

function normalizeGreenLog(log, index) {
  return {
    id: log.id || log.log_id || `wh_api_${index}`,
    option: log.option,
    product_id: log.product_id || "-",
    user_email: log.user_email || "-",
    order_id: log.order_id || "-",
    vera_points: Number(log.vera_points || 0),
    created_at: Number.isFinite(Date.parse(log.created_at))
      ? new Date(log.created_at).getTime()
      : Date.now(),
    _new: false,
  };
}

async function fetchGreenLogs() {
  const { token } = getAuthState();
  if (!token) {
    greenProductsState.logs = [];
    return;
  }

  const payload = await apiRequest("/satici/webhook-logs", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const logs = Array.isArray(payload?.logs) ? payload.logs : [];
  greenProductsState.logs = logs.map(normalizeGreenLog);
}

function getGreenRangeMs() {
  return {
    "1h": 3600000,
    "24h": 86400000,
    "7d": 7 * 86400000,
  }[greenProductsState.range];
}

function getGreenLogsInRange() {
  const rangeMs = getGreenRangeMs();
  return greenProductsState.logs.filter((log) => !rangeMs || (Date.now() - log.created_at <= rangeMs));
}

function getFilteredGreenLogs() {
  const rangeMs = getGreenRangeMs();
  const query = greenProductsState.search.trim().toLowerCase();

  return greenProductsState.logs.filter((log) => {
    if (rangeMs && Date.now() - log.created_at > rangeMs) return false;
    if (greenProductsState.filterOpt && log.option !== greenProductsState.filterOpt) return false;
    if (!query) return true;

    return log.product_id.toLowerCase().includes(query)
      || log.user_email.toLowerCase().includes(query)
      || log.order_id.toLowerCase().includes(query);
  });
}

function getGreenStats() {
  const inRange = getGreenLogsInRange();
  const total = inRange.length;
  const vera = inRange.reduce((sum, log) => sum + log.vera_points, 0);
  const users = new Set(inRange.map((log) => log.user_email)).size;
  const products = new Set(inRange.map((log) => log.product_id)).size;
  const byOpt = OPTIONS.map((option) => {
    const count = inRange.filter((log) => log.option === option.id).length;
    return {
      opt: option,
      count,
      pct: total ? Math.round((count / total) * 100) : 0,
    };
  });

  const buckets = new Array(24).fill(0);
  const now = Date.now();
  inRange.forEach((log) => {
    const hourAgo = Math.floor((now - log.created_at) / 3600000);
    if (hourAgo >= 0 && hourAgo < 24) {
      buckets[23 - hourAgo] += 1;
    }
  });

  return {
    total,
    vera,
    users,
    products,
    byOpt,
    buckets,
    maxBucket: Math.max(1, ...buckets),
  };
}

function getGreenOptionCardMarkup(option, stat) {
  const enabled = greenProductsState.activeOpts[option.id];
  const isFiltered = greenProductsState.filterOpt === option.id;
  const progressColor = isFiltered ? "#F5B656" : "var(--accent)";
  const progressBg = isFiltered ? "rgba(255,255,255,.10)" : "#E1F5EE";
  const dividerColor = isFiltered ? "rgba(255,255,255,.10)" : "#F1FAF6";
  const footerColor = isFiltered ? "rgba(255,255,255,.5)" : "rgba(8,80,65,.5)";
  const glyphBg = isFiltered ? "rgba(255,255,255,.10)" : option.bg;
  const glyphColor = isFiltered ? "#F5B656" : option.fg;
  const titleColor = isFiltered ? "white" : "#053A30";

  return `
    <div class="opt-card ${isFiltered ? "active" : ""}" data-green-filter="${option.id}">
      <div class="flex items-start justify-between mb-3">
        <div class="opt-glyph" style="background:${glyphBg}; color:${glyphColor};">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${option.icon}</svg>
        </div>
        <button type="button" class="toggle ${enabled ? "" : "off"}" data-green-toggle="${option.id}" aria-label="${option.name} durumunu değiştir">
          <span class="knob"></span>
        </button>
      </div>
      <div class="opt-name">${option.name}</div>
      <div class="opt-meta mt-1" style="line-height:1.35; height:2.7em; overflow:hidden;">${option.desc}</div>

      <div class="mt-3 pt-3 border-t" style="border-color:${dividerColor};">
        <div class="flex items-end justify-between">
          <div>
            <div class="opt-eyebrow">Hareket</div>
            <div class="text-xl font-black tabular-nums mt-0.5" style="color:${titleColor};">${stat.count}</div>
          </div>
          <span class="opt-vera">+${option.vera} VP</span>
        </div>
        <div class="mt-2 progress-bar" style="background:${progressBg};">
          <div class="progress-fill" style="width:${stat.pct}%; background:${progressColor};"></div>
        </div>
        <div class="flex justify-between mt-1 text-[10px] font-mono" style="color:${footerColor};">
          <span>tüm hareketlerin %${stat.pct}</span>
          <span>${enabled ? "açık" : "kapalı"}</span>
        </div>
      </div>
    </div>
  `;
}

function getGreenLogRowMarkup(log) {
  const option = OPT_BY_ID[log.option];

  return `
    <tr class="log-row" style="${log._new ? "background:#FFFBF1;" : ""}">
      <td>
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style="background:${option.bg}; color:${option.fg};">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${option.icon}</svg>
          </div>
          <span class="font-semibold text-leaf-900 text-[13px]">${option.name}</span>
        </div>
      </td>
      <td class="mono-mini text-leaf-800">${log.product_id}</td>
      <td>
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0" style="background:#E1F5EE; color:#168562;">
            ${log.user_email[0].toUpperCase()}
          </div>
          <span class="text-leaf-800/80 text-[13px]">${log.user_email}</span>
        </div>
      </td>
      <td class="mono-mini">${log.order_id}</td>
      <td>
        <span class="badge-mini" style="background:#FBF0DC; color:#C77A0F; border:1px solid #F1D69B;">+${log.vera_points} VP</span>
      </td>
      <td class="mono-mini">
        ${log._new ? '<span class="inline-flex items-center gap-1 text-leaf-700 font-bold mr-1">●</span>' : ""}
        ${relTime(log.created_at)}
      </td>
      <td>
        <button type="button" class="text-leaf-600 hover:text-leaf-900 transition" aria-label="Detayı görüntüle">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </td>
    </tr>
  `;
}

function getGreenOptionsMarkup() {
  const stats = getGreenStats();
  const filteredLogs = getFilteredGreenLogs();

  return `
    <section class="green-wrap green-wrap-view">
      <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 class="text-[2.1rem] lg:text-[2.4rem] font-black text-leaf-900 tracking-tight leading-[1.05]">Yeşil Ürünler</h1>
          <p class="mt-1.5 text-leaf-800/65 text-sm max-w-xl">Entegrasyondan gelen webhook hareketleri ve aktif yeşil seçeneklerin yönetimi.</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <div class="green-seg">
            <button type="button" class="seg-btn ${greenProductsState.range === "1h" ? "active" : ""}" data-green-range="1h">1 sa</button>
            <button type="button" class="seg-btn ${greenProductsState.range === "24h" ? "active" : ""}" data-green-range="24h">24 sa</button>
            <button type="button" class="seg-btn ${greenProductsState.range === "7d" ? "active" : ""}" data-green-range="7d">7 gün</button>
          </div>
          <button type="button" data-green-refresh class="text-xs font-semibold px-3 py-2 rounded-full border border-leaf-200 bg-white text-leaf-700 hover:bg-leaf-50 transition inline-flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 ${greenProductsState.refreshing ? "animate-spin" : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.74 9.74 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            Yenile
          </button>
        </div>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="card">
          <div class="flex items-start justify-between">
            <div class="eyebrow">Toplam Webhook</div>
            <svg class="w-4 h-4 text-leaf-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="metric-number text-[2.2rem] leading-none tabular-nums">${fmtNum(stats.total)}</span>
            <span class="text-xs text-leaf-800/55 font-mono">hareket</span>
          </div>
          <div class="bars mt-4">
            ${stats.buckets.map((value) => `<div class="bar ${value === stats.maxBucket && value > 0 ? "hi" : ""}" style="height:${Math.max(8, (value / stats.maxBucket) * 100)}%;"></div>`).join("")}
          </div>
          <div class="flex justify-between mt-1 text-[10px] font-mono text-leaf-800/40">
            <span>24sa önce</span><span>şimdi</span>
          </div>
        </div>

        <div class="card">
          <div class="flex items-start justify-between">
            <div class="eyebrow">Dağıtılan VERA Puan</div>
            <svg class="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 3 14h7l-1 8 10-12h-7z"></path></svg>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="metric-number text-[2.2rem] leading-none tabular-nums">+${fmtNum(stats.vera)}</span>
            <span class="text-xs text-leaf-800/55 font-mono">VP</span>
          </div>
          <div class="text-[11px] text-leaf-800/55 font-mono mt-1">≈ ₺${fmtNum(Math.round(stats.vera / 10))} kupon değerinde</div>
          <div class="mt-4 progress-bar">
            <div class="progress-fill" style="width:${Math.min(100, (stats.vera / 5000) * 100)}%; background:#EF9F27;"></div>
          </div>
          <div class="flex justify-between mt-1.5 text-[10px] font-mono text-leaf-800/40">
            <span>Aylık hedef 5.000 VP</span>
            <span class="text-amber-600 font-semibold">%${Math.min(100, Math.round((stats.vera / 5000) * 100))}</span>
          </div>
        </div>

        <div class="card">
          <div class="flex items-start justify-between">
            <div class="eyebrow">Benzersiz Müşteri</div>
            <svg class="w-4 h-4 text-leaf-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="metric-number text-[2.2rem] leading-none tabular-nums">${fmtNum(stats.users)}</span>
            <span class="text-xs text-leaf-800/55 font-mono">kullanıcı</span>
          </div>
          <div class="text-[11px] text-leaf-800/55 font-mono mt-1">${(stats.total / Math.max(1, stats.users)).toFixed(1)} hareket / kullanıcı</div>
          <div class="mt-3 flex -space-x-1.5">
            ${USERS.slice(0, 5).map((user, index) => `<div class="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-leaf-700" style="background:${["#BFE7D6", "#8DD3B7", "#4FB893", "#F5B656", "#FBF0DC"][index]};">${user[0].toUpperCase()}</div>`).join("")}
            ${stats.users > 5 ? `<div class="w-7 h-7 rounded-full border-2 border-white bg-leaf-100 text-leaf-700 text-[10px] font-bold flex items-center justify-center">+${stats.users - 5}</div>` : ""}
          </div>
        </div>

        <div class="card">
          <div class="flex items-start justify-between">
            <div class="eyebrow">Etkin Ürün</div>
            <svg class="w-4 h-4 text-leaf-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="metric-number text-[2.2rem] leading-none tabular-nums">${fmtNum(stats.products)}</span>
            <span class="text-xs text-leaf-800/55 font-mono">SKU</span>
          </div>
          <div class="text-[11px] text-leaf-800/55 font-mono mt-1">yeşil seçim alan</div>
          <div class="mt-3 flex items-center gap-2 text-[11px] text-leaf-700 font-mono">
            <span class="badge-mini bg-leaf-50 border border-leaf-200 text-leaf-700">▲ +18% YoY</span>
          </div>
        </div>
      </div>

      <div class="card mb-6">
        <div class="flex items-start justify-between mb-5 flex-wrap gap-2">
          <div>
            <div class="eyebrow">Yeşil Seçenekler · Yönetim</div>
            <h3 class="font-bold text-leaf-900 mt-1 text-lg">Aktif seçeneklerin · 4 tip</h3>
            <p class="text-xs text-leaf-800/55 mt-1">Müşteri ödeme akışında gösterilen seçenekler. Aç/kapa anlık yansır, webhook tetiklenmesi durur.</p>
          </div>
          <button type="button" class="text-xs font-semibold px-3 py-1.5 rounded-full text-white inline-flex items-center gap-1.5" style="background:var(--accent);">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
            Yeni seçenek
          </button>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          ${stats.byOpt.map((item) => getGreenOptionCardMarkup(item.opt, item)).join("")}
        </div>

        ${greenProductsState.filterOpt ? `
          <div class="mt-4 flex items-center justify-between bg-leaf-50 border border-leaf-200 rounded-2xl px-4 py-2.5 text-xs">
            <span class="text-leaf-800 font-medium">
              Filtre aktif: <b class="text-leaf-900">${OPT_BY_ID[greenProductsState.filterOpt].name}</b>
            </span>
            <button type="button" data-green-clear-filter class="text-leaf-700 font-mono font-semibold hover:text-leaf-900">Temizle ×</button>
          </div>
        ` : ""}
      </div>

      <div class="card green-log-card">
        <div class="flex items-center justify-between flex-wrap gap-3 px-6 py-4 border-b border-leaf-100">
          <div class="flex items-center gap-3">
            <div>
              <div class="eyebrow">Canlı Akış</div>
              <div class="font-bold text-leaf-900 mt-0.5">Webhook Hareketleri</div>
            </div>
            <span class="pill-mono"><span class="w-1.5 h-1.5 rounded-full bg-leaf-500 animate-pulse"></span>${fmtNum(filteredLogs.length)} kayıt</span>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <div class="input-row" style="max-width:240px;">
              <span class="icon">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
              </span>
              <input type="text" placeholder="Ürün, müşteri veya sipariş ara…" value="${greenProductsState.search.replace(/"/g, "&quot;")}" data-green-search>
            </div>
            <button type="button" data-green-export class="text-xs font-semibold px-3 py-2 rounded-full border border-leaf-200 bg-white text-leaf-700 hover:bg-leaf-50 transition inline-flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              CSV indir
            </button>
          </div>
        </div>

        ${greenProductsState.loading ? `
          <div class="text-center py-16 px-6">
            <div class="text-leaf-900 font-bold">Yükleniyor</div>
            <div class="text-xs text-leaf-800/55 mt-1">Webhook kayıtları alınıyor.</div>
          </div>
        ` : filteredLogs.length === 0 ? `
          <div class="text-center py-16 px-6">
            <div class="w-14 h-14 rounded-2xl bg-leaf-50 border border-leaf-200 flex items-center justify-center mx-auto mb-3">
              <svg class="w-7 h-7 text-leaf-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
            </div>
            <div class="text-leaf-900 font-bold">Hareket bulunamadı</div>
            <div class="text-xs text-leaf-800/55 mt-1">${greenProductsState.search ? `"${greenProductsState.search}" aramasına uyan kayıt yok.` : "Backend tarafında henüz webhook kaydı yok."}</div>
          </div>
        ` : `
          <div style="overflow-x:auto;">
            <table class="log-table">
              <thead>
                <tr>
                  <th>Seçenek</th>
                  <th>Ürün</th>
                  <th>Müşteri</th>
                  <th>Sipariş</th>
                  <th>Vera Puan</th>
                  <th>Zaman</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${filteredLogs.slice(0, 40).map((log) => getGreenLogRowMarkup(log)).join("")}
              </tbody>
            </table>
          </div>
        `}

        ${filteredLogs.length > 40 ? `
          <div class="px-6 py-3 border-t border-leaf-100 text-center text-xs font-mono text-leaf-800/55">
            İlk 40 hareket gösteriliyor · Tümünü görmek için CSV indir
          </div>
        ` : ""}
      </div>
    </section>
  `;
}

function attachGreenOptionsEvents() {
  document.querySelectorAll("[data-green-range]").forEach((button) => {
    button.addEventListener("click", () => {
      greenProductsState.range = button.dataset.greenRange;
      rerenderGreenOptions();
    });
  });

  document.querySelectorAll("[data-green-filter]").forEach((card) => {
    card.addEventListener("click", () => {
      const { greenFilter } = card.dataset;
      greenProductsState.filterOpt = greenProductsState.filterOpt === greenFilter ? null : greenFilter;
      rerenderGreenOptions();
    });
  });

  document.querySelectorAll("[data-green-toggle]").forEach((toggle) => {
    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const { greenToggle } = toggle.dataset;
      greenProductsState.activeOpts[greenToggle] = !greenProductsState.activeOpts[greenToggle];
      rerenderGreenOptions();
    });
  });

  const searchInput = document.querySelector("[data-green-search]");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      greenProductsState.search = searchInput.value;
      rerenderGreenOptions();
    });
  }

  const refreshButton = document.querySelector("[data-green-refresh]");
  if (refreshButton) {
    refreshButton.addEventListener("click", async () => {
      greenProductsState.refreshing = true;
      rerenderGreenOptions();

      try {
        await fetchGreenLogs();
      } catch (error) {
        console.error("Yeşil ürün logları alınamadı:", error);
      } finally {
        greenProductsState.refreshing = false;
        rerenderGreenOptions();
      }
    });
  }

  const clearFilterButton = document.querySelector("[data-green-clear-filter]");
  if (clearFilterButton) {
    clearFilterButton.addEventListener("click", () => {
      greenProductsState.filterOpt = null;
      rerenderGreenOptions();
    });
  }

  const exportButton = document.querySelector("[data-green-export]");
  if (exportButton) {
    exportButton.addEventListener("click", () => {});
  }
}

function restartGreenLiveTimer() {
  if (greenProductsState.liveTimer) {
    window.clearInterval(greenProductsState.liveTimer);
  }

  greenProductsState.liveTimer = window.setInterval(async () => {
    const viewRoot = document.querySelector(".green-wrap-view");
    if (!viewRoot || document.body.getAttribute("data-seller-view") !== "yesil-secenekler") {
      window.clearInterval(greenProductsState.liveTimer);
      greenProductsState.liveTimer = null;
      return;
    }

    try {
      const previousFirstId = greenProductsState.logs[0]?.id || null;
      await fetchGreenLogs();
      if (greenProductsState.logs[0] && greenProductsState.logs[0].id !== previousFirstId) {
        greenProductsState.logs[0]._new = true;
      }
      rerenderGreenOptions();
    } catch (error) {
      console.error("Yeşil ürün canlı güncelleme alınamadı:", error);
    }
  }, 15000);
}

function rerenderGreenOptions() {
  const root = document.getElementById("dashboard-root");
  if (!root || document.body.getAttribute("data-seller-view") !== "yesil-secenekler") return;

  root.innerHTML = getGreenOptionsMarkup();
  attachGreenOptionsEvents();
}

async function renderGreenOptions() {
  const root = document.getElementById("dashboard-root");
  if (!root) return;

  document.body.setAttribute("data-seller-view", "yesil-secenekler");
  document.body.setAttribute("data-density", "comfortable");
  document.body.setAttribute("data-accent", "leaf");

  greenProductsState.loading = true;
  rerenderGreenOptions();

  try {
    await fetchGreenLogs();
  } catch (error) {
    console.error("Yeşil ürün logları alınamadı:", error);
    if (!greenProductsState.logs.length) {
      greenProductsState.logs = [];
    }
  } finally {
    greenProductsState.loading = false;
  }

  rerenderGreenOptions();
  restartGreenLiveTimer();
}
