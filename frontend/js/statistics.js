const STATISTICS_DEFAULTS = {
  layout: "a",
  density: "comfortable",
  accent: "leaf",
};

const STAT_TR_MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

const STAT_OPTION_DISPLAY = {
  karton_paketleme: "Karton Paketleme",
  karbon_notr_kargo: "Karbon Nötr Kargo",
  agac_dikme_bagis: "Ağaç Dikme Bağışı",
  minimal_etiket: "Minimal Etiket",
};

// Chart X positions matching the SVG viewBox 0 0 800 320
const STAT_X_POS = [80, 137, 194, 251, 308, 365, 422, 480, 537, 594, 651, 708];

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

// ─── Data computation ───────────────────────────────────────────────────────

function getGreenStatsForStatistics() {
  const logs = (typeof greenProductsState !== "undefined" ? greenProductsState.logs : null) || [];
  const now = Date.now();
  const DAY_MS = 86400000;
  const d = new Date();
  const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
  const lastMonthStart = new Date(d.getFullYear(), d.getMonth() - 1, 1).getTime();

  const total = logs.length;
  const vera = logs.reduce((s, l) => s + (l.vera_points || 0), 0);
  const uniqueUsers = new Set(logs.filter((l) => l.user_email).map((l) => l.user_email)).size;

  const thisMonth = logs.filter((l) => l.created_at >= monthStart);
  const lastMonth = logs.filter((l) => l.created_at >= lastMonthStart && l.created_at < monthStart);

  const calcDelta = (cur, prev) => {
    if (prev > 0) {
      const pct = Math.round(((cur - prev) / prev) * 100);
      return (pct >= 0 ? "+" : "") + pct + "%";
    }
    return cur > 0 ? "+100%" : null;
  };

  const delta = calcDelta(thisMonth.length, lastMonth.length);
  const veraDelta = calcDelta(
    thisMonth.reduce((s, l) => s + (l.vera_points || 0), 0),
    lastMonth.reduce((s, l) => s + (l.vera_points || 0), 0)
  );
  const thisMoUsers = new Set(thisMonth.filter((l) => l.user_email).map((l) => l.user_email)).size;
  const lastMoUsers = new Set(lastMonth.filter((l) => l.user_email).map((l) => l.user_email)).size;
  const usersDelta = calcDelta(thisMoUsers, lastMoUsers);

  const sparkline = Array.from({ length: 12 }, (_, i) => {
    const dayStart = now - (11 - i) * DAY_MS;
    const dayEnd = dayStart + DAY_MS;
    return logs.filter((l) => l.created_at >= dayStart && l.created_at < dayEnd).length;
  });

  return { total, vera, uniqueUsers, delta, veraDelta, usersDelta, sparkline, logs };
}

// ─── KPI helpers ────────────────────────────────────────────────────────────

function buildStatSparkline(points) {
  if (!points || !points.some((v) => v > 0)) return "";
  const max = Math.max(...points, 1);
  const n = points.length;
  const pts = points
    .map((v, i) => Math.round((i / (n - 1)) * 200) + "," + Math.round(38 - (v / max) * 32))
    .join(" ");
  return `<svg class="mt-3 w-full h-10" viewBox="0 0 200 40" preserveAspectRatio="none">
    <polyline points="${pts}" fill="none" stroke="#1D9E75" stroke-width="2"></polyline>
    <polyline points="${pts} 200,40 0,40" fill="#1D9E75" opacity=".10"></polyline>
  </svg>`;
}

function buildStatDelta(delta, isAmber) {
  if (!delta) return "";
  const isUp = !delta.startsWith("-");
  const arrow = isUp
    ? `<svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"></path></svg>`
    : `<svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path></svg>`;
  const c = isAmber ? "amber" : "leaf";
  return `<span class="inline-flex items-center gap-1 text-[11px] font-semibold text-${c}-700 bg-${c}-50 px-2 py-0.5 rounded-full border border-${c}-200">${arrow}${delta}</span>
    <span class="text-[11px] text-leaf-800/45 font-mono">önceki ay</span>`;
}

function fmtVeraStat(n) {
  if (n >= 1000000) return (Math.round(n / 100000) / 10).toLocaleString("tr-TR") + "M";
  if (n >= 1000) return Math.round(n / 1000).toLocaleString("tr-TR") + "K";
  return n.toLocaleString("tr-TR");
}

// ─── Option breakdown bars ───────────────────────────────────────────────────

function buildStatOptionBars(logs) {
  const counts = {};
  logs.forEach((l) => {
    const name = STAT_OPTION_DISPLAY[l.option] || l.option || "Diğer";
    counts[name] = (counts[name] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = logs.length;
  if (!sorted.length) {
    return '<p class="text-leaf-800/40 text-sm py-4 text-center">Henüz webhook logu yok</p>';
  }
  const COLORS = ["#1D9E75", "#168562", "#4FB893", "#8DD3B7", "#BFE7D6"];
  return sorted
    .slice(0, 5)
    .map(([name, count], i) => {
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      return `<div>
        <div class="flex justify-between text-xs mb-1.5">
          <span class="text-leaf-900 font-semibold">${name}</span>
          <span class="font-mono text-leaf-600 tabular-nums">${count.toLocaleString("tr-TR")} · %${pct}</span>
        </div>
        <div class="progress-bar h-2"><div class="progress-fill" style="width:${pct}%; background:${COLORS[i] || COLORS[0]};"></div></div>
      </div>`;
    })
    .join("");
}

// ─── Monthly area chart ──────────────────────────────────────────────────────

function buildMonthlyChart(logs) {
  const now = new Date();
  const currentKey = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");

  // Generate last 12 months
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
    const isJan = d.getMonth() === 0;
    const isFirst = i === 0;
    const label = STAT_TR_MONTHS[d.getMonth()] + (isJan || isFirst ? " " + String(d.getFullYear()).slice(2) : "");
    return { key, label, isCurrentYear: d.getFullYear() === now.getFullYear() };
  });

  // Group logs by month-key
  const byMonth = {};
  logs.forEach((l) => {
    const key = new Date(l.created_at).toISOString().slice(0, 7);
    if (!byMonth[key]) byMonth[key] = { users: new Set(), count: 0 };
    byMonth[key].count++;
    if (l.user_email) byMonth[key].users.add(l.user_email);
  });

  const data = months.map((m) => ({
    ...m,
    count: byMonth[m.key]?.count || 0,
    users: byMonth[m.key]?.users.size || 0,
  }));

  const currentIdx = data.findIndex((m) => m.key === currentKey);
  const splitIdx = currentIdx >= 0 ? currentIdx : data.length - 1;

  // Y scale
  const maxUsers = Math.max(...data.map((d) => d.users), 1);
  const rawStep = Math.ceil(maxUsers / 5);
  const magnitude = Math.pow(10, Math.max(0, Math.floor(Math.log10(rawStep || 1))));
  const niceStep = Math.max(1, Math.ceil(rawStep / magnitude) * magnitude);
  const gridMax = niceStep * 5;
  const yFor = (v) => Math.round(280 - (v / gridMax) * 240);

  // Grid
  const gridLines = [5, 4, 3, 2, 1]
    .map((i) => {
      const y = yFor(niceStep * i);
      return `<line x1="50" y1="${y}" x2="780" y2="${y}"></line>`;
    })
    .join("");
  const gridLabels = [5, 4, 3, 2, 1]
    .map((i) => {
      const v = niceStep * i;
      const y = yFor(v);
      const label = v >= 1000 ? v / 1000 + "K" : v;
      return `<text x="42" y="${y + 4}" text-anchor="end">${label}</text>`;
    })
    .join("");

  // Solid points (up to and including current month)
  const solidData = data.slice(0, splitIdx + 1);
  const solidPts = solidData.map((d, i) => STAT_X_POS[i] + "," + yFor(d.users)).join(" ");
  const firstX = STAT_X_POS[0];
  const lastSolidX = STAT_X_POS[splitIdx];

  // Area fill path
  const areaPath =
    solidData.length > 1
      ? `M ${solidPts.replace(/ /g, " L ")} L ${lastSolidX},280 L ${firstX},280 Z`
      : "";

  // Dots
  const dots = solidData
    .map((d, i) => {
      const x = STAT_X_POS[i];
      const y = yFor(d.users);
      if (i === splitIdx) {
        return `<circle cx="${x}" cy="${y}" r="6" fill="#EF9F27" opacity=".18"></circle>
                <circle cx="${x}" cy="${y}" r="4.5" fill="#EF9F27" stroke="white" stroke-width="2"></circle>`;
      }
      return `<circle cx="${x}" cy="${y}" r="3.5" fill="white" stroke="#1D9E75" stroke-width="2"></circle>`;
    })
    .join("");

  // Tooltip
  const curD = solidData[splitIdx];
  const curX = STAT_X_POS[splitIdx];
  const curY = yFor(curD.users);
  const tooltipLabel = curD.key === currentKey ? "GÜNCEL" : "SON AY";
  const tooltipShiftX = splitIdx >= 10 ? -110 : -58;
  const tooltip = `<g transform="translate(${curX}, ${curY})">
    <line x1="0" y1="0" x2="0" y2="${280 - curY}" stroke="#EF9F27" stroke-width="1" stroke-dasharray="3 4" opacity=".7"></line>
    <g transform="translate(${tooltipShiftX}, -52)">
      <rect width="128" height="42" rx="8" fill="#053A30"></rect>
      <text x="10" y="16" fill="rgba(255,255,255,.6)" font-family="JetBrains Mono" font-size="9" letter-spacing=".06em">${curD.label.toUpperCase()} · ${tooltipLabel}</text>
      <text x="10" y="32" fill="white" font-family="Inter" font-size="13" font-weight="800">${curD.users.toLocaleString("tr-TR")} kullanıcı</text>
    </g>
  </g>`;

  // Month labels
  const monthLabels = data
    .map((d, i) => {
      const isFuture = i > splitIdx;
      const isCurrent = d.key === currentKey;
      const attrs = isCurrent
        ? `fill="#EF9F27" font-weight="700"`
        : isFuture
        ? `fill="rgba(8,80,65,.25)"`
        : "";
      return `<text x="${STAT_X_POS[i]}" y="300" text-anchor="middle" ${attrs}>${d.label}</text>`;
    })
    .join("");

  return `<svg viewBox="0 0 800 320" class="w-full h-auto" preserveAspectRatio="none">
    <defs>
      <linearGradient id="area-gradient" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#1D9E75" stop-opacity=".22"></stop>
        <stop offset="100%" stop-color="#1D9E75" stop-opacity="0"></stop>
      </linearGradient>
    </defs>
    <g class="chart-grid">${gridLines}</g>
    <g class="chart-axis">${gridLabels}</g>
    ${areaPath ? `<path d="${areaPath}" fill="url(#area-gradient)"></path>` : ""}
    ${solidPts ? `<polyline points="${solidPts}" fill="none" stroke="#1D9E75" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>` : ""}
    <g>${dots}</g>
    ${tooltip}
    <g class="chart-axis">${monthLabels}</g>
  </svg>`;
}

// ─── Hero bottom stats ───────────────────────────────────────────────────────

function buildHeroStats(logs) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const thisMonth = logs.filter((l) => l.created_at >= monthStart);
  const prevLogs = logs.filter((l) => l.created_at < monthStart);

  const activeUsers = new Set(thisMonth.filter((l) => l.user_email).map((l) => l.user_email)).size;
  const prevEmails = new Set(prevLogs.filter((l) => l.user_email).map((l) => l.user_email));
  const newUsers = new Set(
    thisMonth.filter((l) => l.user_email && !prevEmails.has(l.user_email)).map((l) => l.user_email)
  ).size;

  const emailCounts = {};
  logs.forEach((l) => {
    if (l.user_email) emailCounts[l.user_email] = (emailCounts[l.user_email] || 0) + 1;
  });
  const totalUnique = Object.keys(emailCounts).length;
  const repeatCount = Object.values(emailCounts).filter((c) => c > 1).length;
  const repeatPct = totalUnique > 0 ? Math.round((repeatCount / totalUnique) * 100) : 0;
  const avgOrders = totalUnique > 0 ? (logs.length / totalUnique).toFixed(1) : "0";

  return { activeUsers, newUsers, repeatPct, avgOrders };
}

// ─── Donut: top green option ─────────────────────────────────────────────────

function buildDonutMarkup(logs) {
  const counts = {};
  logs.forEach((l) => {
    const name = STAT_OPTION_DISPLAY[l.option] || l.option || "Diğer";
    counts[name] = (counts[name] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = logs.length;

  if (!sorted.length || total === 0) {
    return `<p class="text-center text-leaf-800/40 text-sm py-10">Henüz webhook logu yok</p>`;
  }

  const [topName, topCount] = sorted[0];
  const topPct = Math.round((topCount / total) * 100);
  const offset = Math.round(502.65 * (1 - topPct / 100));
  const shortName = topName.length > 14 ? topName.slice(0, 14) + "…" : topName;
  const COLORS = ["var(--accent)", "#168562", "#4FB893", "#8DD3B7"];

  const legend = sorted
    .slice(0, 4)
    .map(
      ([name, count], i) => `
    <div class="flex items-center justify-between text-sm">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-sm" style="background:${COLORS[i]};"></span>
        <span class="${i === 0 ? "text-leaf-900 font-semibold" : "text-leaf-800/70"}">${name}</span>
      </div>
      <span class="font-mono text-leaf-800 tabular-nums">${count.toLocaleString("tr-TR")}</span>
    </div>`
    )
    .join("");

  return `<div class="flex items-center gap-5 flex-wrap">
    <div class="relative w-[180px] h-[180px] flex-shrink-0">
      <svg viewBox="0 0 200 200" class="w-full h-full -rotate-90">
        <circle cx="100" cy="100" r="80" fill="none" class="donut-track" stroke-width="22"></circle>
        <circle cx="100" cy="100" r="80" fill="none" class="donut-fill" stroke-width="22" stroke-dasharray="502.65" stroke-dashoffset="${offset}"></circle>
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <div class="text-[10px] font-mono text-leaf-600 tracking-widest">EN POPÜLER</div>
        <div class="text-[2rem] metric-number tabular-nums leading-none mt-0.5">%${topPct}</div>
        <div class="text-[10px] text-leaf-700 font-semibold mt-1 text-center px-4">${shortName}</div>
      </div>
    </div>
    <div class="flex-1 min-w-[180px] space-y-2.5">
      ${legend}
      <div class="h-px bg-leaf-100"></div>
      <div class="flex items-center justify-between text-xs">
        <span class="text-leaf-800/55 font-mono">Toplam yeşil seçim</span>
        <span class="font-mono font-semibold text-leaf-900 tabular-nums">${total.toLocaleString("tr-TR")}</span>
      </div>
    </div>
  </div>`;
}

// ─── Monthly mini bars ───────────────────────────────────────────────────────

function buildMonthlyMiniBars(logs) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
    return { key, label: STAT_TR_MONTHS[d.getMonth()] };
  });

  const byMonth = {};
  logs.forEach((l) => {
    const key = new Date(l.created_at).toISOString().slice(0, 7);
    byMonth[key] = (byMonth[key] || 0) + 1;
  });

  const data = months.map((m) => ({ ...m, count: byMonth[m.key] || 0 }));
  const max = Math.max(...data.map((d) => d.count), 1);
  const COLORS = ["bg-leaf-200", "bg-leaf-300", "bg-leaf-400", "bg-leaf-400", "bg-leaf-500", "bg-amber-500"];

  const bars = data
    .map((d, i) => {
      const pct = Math.max(4, Math.round((d.count / max) * 100));
      const isCurrent = i === data.length - 1;
      return `<div class="flex-1 flex flex-col items-center gap-1">
        <div class="w-full rounded-t-sm ${COLORS[i]}" style="height:${pct}%"></div>
        <span class="text-[9px] font-mono text-leaf-800/40${isCurrent ? " font-semibold" : ""}">${d.label}</span>
      </div>`;
    })
    .join("");

  const firstMonth = data[0];
  const lastMonth = data[data.length - 1];

  return `<div class="flex items-end gap-1 h-16">${bars}</div>
    <div class="flex items-center justify-between mt-2 text-[10px] font-mono text-leaf-800/45">
      <span>${firstMonth.count} seçim · ${firstMonth.label}</span>
      <span class="text-leaf-700 font-semibold">${lastMonth.count} seçim · ${lastMonth.label}</span>
    </div>`;
}

// ─── Main markup ─────────────────────────────────────────────────────────────

function getStatisticsMarkup(stats) {
  const total = stats ? stats.total : 0;
  const vera = stats ? stats.vera : 0;
  const uniqueUsers = stats ? stats.uniqueUsers : 0;
  const logs = stats ? stats.logs : [];

  let companyName = "";
  try { companyName = (localStorage.getItem("leafpay_company") || "").trim(); } catch (e) { /* ignore */ }
  if (!companyName) {
    try {
      const authState = typeof getAuthState === "function" ? getAuthState() : null;
      companyName = (authState?.user?.sirket_adi || "").trim();
    } catch (e) { /* ignore */ }
  }
  const siteLabel = companyName ? companyName + " Sitesi" : "Şirket Web Sitesi";

  const veraDisplay = fmtVeraStat(vera);
  const kuponDisplay = fmtVeraStat(Math.round(vera / 10));
  const veraProgress = Math.min(100, vera > 0 ? Math.round((vera / 2000000) * 100) : 0);
  const sparklineSvg = stats ? buildStatSparkline(stats.sparkline) : "";
  const optionBars = buildStatOptionBars(logs);
  const chartSvg = buildMonthlyChart(logs);
  const heroS = buildHeroStats(logs);
  const donutMarkup = buildDonutMarkup(logs);
  const miniBarsMarkup = buildMonthlyMiniBars(logs);

  return `
    <section class="stats-wrap statistics-view">
      <div class="page-title flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 class="text-[2.1rem] lg:text-[2.4rem] font-black text-leaf-900 tracking-tight leading-[1.05]">İstatistikler</h1>
          <p class="mt-1.5 text-leaf-800/65 text-sm max-w-xl">Yeşil ekonomiye katkın - sayılar, eğilimler ve dönüşüm. Webhook loglarından hesaplanmıştır.</p>
        </div>
      </div>

      <div class="stats-grid">

        <!-- KPIs -->
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
                <div class="metric-number metric-xl text-[2.4rem] leading-none tabular-nums">${total.toLocaleString("tr-TR")}</div>
              </div>
              <div class="mt-2 text-[11px] text-leaf-800/50 font-mono">toplam webhook logu</div>
              <div class="mt-3 flex items-center gap-2">${buildStatDelta(stats?.delta, false)}</div>
              ${sparklineSvg}
            </div>

            <div class="stat-card">
              <div class="flex items-start justify-between">
                <div class="eyebrow">Dağıtılan VERA Puanı</div>
                <div class="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <svg class="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 3 14h7l-1 8 10-12h-7z"></path></svg>
                </div>
              </div>
              <div class="mt-3 flex items-baseline gap-2">
                <div class="metric-number metric-xl text-[2.4rem] leading-none tabular-nums">${veraDisplay}</div>
                <span class="text-sm text-leaf-800/55 font-mono">VERA</span>
              </div>
              <div class="mt-2 text-[11px] text-leaf-800/50 font-mono">≈ ${kuponDisplay} kupon karşılığı</div>
              <div class="mt-3 flex items-center gap-2">${buildStatDelta(stats?.veraDelta, true)}</div>
              <div class="mt-3">
                <div class="flex justify-between text-[10px] text-leaf-800/45 font-mono mb-1">
                  <span>2M VERA hedefine ilerleme</span><span class="text-amber-600 font-semibold">%${veraProgress}</span>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width:${veraProgress}%; background:#EF9F27;"></div></div>
              </div>
            </div>

            <div class="stat-card bg-gradient-to-br from-leaf-50 to-white">
              <div class="flex items-start justify-between">
                <div class="eyebrow">Benzersiz Müşteri</div>
                <div class="w-8 h-8 rounded-xl bg-white border border-leaf-200 flex items-center justify-center">
                  <svg class="w-4 h-4 text-leaf-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
              </div>
              <div class="mt-3 flex items-baseline gap-2">
                <div class="metric-number metric-xl text-[2.4rem] leading-none tabular-nums">${uniqueUsers.toLocaleString("tr-TR")}</div>
              </div>
              <div class="mt-2 text-[11px] text-leaf-800/50 font-mono">farklı e-posta adresi</div>
              <div class="mt-3 flex items-center gap-2">${buildStatDelta(stats?.usersDelta, false)}</div>
            </div>

          </div>
        </div>

        <!-- Monthly chart -->
        <div class="area-hero card">
          <div class="flex items-start justify-between mb-5 flex-wrap gap-3">
            <div>
              <div class="eyebrow">Tarihe Göre</div>
              <h2 class="font-black text-leaf-900 mt-1 text-xl">Yeşil Seçimli Sipariş Veren Kullanıcı Sayısı</h2>
              <p class="text-xs text-leaf-800/55 mt-1">Son 12 ay · aylık benzersiz e-posta sayısı.</p>
            </div>
            <div class="flex items-center gap-4 text-[11px] font-mono text-leaf-800/60">
              <div class="flex items-center gap-1.5"><span class="w-3 h-1 rounded-full" style="background:#1D9E75"></span>Webhook Logu</div>
              <div class="flex items-center gap-1.5"><span class="w-3 h-1 rounded-full" style="background:#EF9F27"></span>Güncel Ay</div>
            </div>
          </div>
          <div class="relative">${chartSvg}</div>
          <div class="mt-4 pt-4 border-t border-leaf-100 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div class="eyebrow">Bu Ay Kullanıcı</div>
              <div class="font-black text-leaf-900 text-lg tabular-nums mt-1">${heroS.activeUsers.toLocaleString("tr-TR")}</div>
              <div class="text-[10px] text-leaf-600/80 font-mono">benzersiz e-posta</div>
            </div>
            <div>
              <div class="eyebrow">Yeni Kullanıcı</div>
              <div class="font-black text-leaf-900 text-lg tabular-nums mt-1">${heroS.newUsers.toLocaleString("tr-TR")}</div>
              <div class="text-[10px] text-leaf-600/80 font-mono">bu ay ilk kez</div>
            </div>
            <div>
              <div class="eyebrow">Tekrarlayan</div>
              <div class="font-black text-leaf-900 text-lg tabular-nums mt-1">%${heroS.repeatPct}</div>
              <div class="text-[10px] text-leaf-600/80 font-mono">en az 2 seçim</div>
            </div>
            <div>
              <div class="eyebrow">Ort. Seçim / Kullanıcı</div>
              <div class="font-black text-leaf-900 text-lg tabular-nums mt-1">${heroS.avgOrders}</div>
              <div class="text-[10px] text-leaf-600/80 font-mono">tüm zamanlar</div>
            </div>
          </div>
        </div>

        <!-- Donut: top option -->
        <div class="area-conv card">
          <div class="flex items-start justify-between mb-4">
            <div>
              <div class="eyebrow">En Popüler Seçenek</div>
              <div class="font-bold text-leaf-900 mt-1 text-lg">Yeşil seçenek dağılımı</div>
            </div>
            <span class="pill-mono">tüm zamanlar</span>
          </div>
          ${donutMarkup}
        </div>

        <!-- Option breakdown -->
        <div class="area-bdwn card">
          <div class="flex items-start justify-between mb-4 flex-wrap gap-3">
            <div>
              <div class="eyebrow">Yeşil Seçim · Seçeneğe Göre</div>
              <div class="font-bold text-leaf-900 mt-1 text-lg">Hangi seçenek ne kadar tercih edildi</div>
            </div>
          </div>
          <div class="space-y-3.5">${optionBars}</div>
          <div class="mt-5 pt-4 border-t border-leaf-100">
            <div class="eyebrow mb-2">Aylık Seçim Sayısı · son 6 ay</div>
            ${miniBarsMarkup}
          </div>
        </div>

        <!-- Platform comparison — untouched -->
        <div class="area-plat card relative overflow-hidden">
          <div class="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-leaf-100/60 blur-3xl pointer-events-none"></div>
          <div class="relative">
            <div class="flex items-start justify-between mb-5 flex-wrap gap-3">
              <div>
                <div class="eyebrow">Platform Karşılaştırma</div>
                <h2 class="font-black text-leaf-900 mt-1 text-xl">Farklı platformlara göre yeşil seçim</h2>
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
                  <span class="font-black text-leaf-900 text-xl tabular-nums">%57,8</span>
                  <span class="text-xs text-leaf-700 font-semibold">${siteLabel}</span>
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
                  <span class="font-black text-leaf-900 text-xl tabular-nums">1.205</span>
                  <span class="text-xs text-leaf-800/60 font-mono">5 kanal · 478 yeşil</span>
                </div>
              </div>
            </div>
            <div>
              <div class="plat-row">
                <div class="plat-glyph" style="background:#168562;">DW</div>
                <div class="plat-body">
                  <div><div class="plat-name">${siteLabel}</div><div class="plat-meta">185 sipariş · 107 yeşil seçim</div></div>
                  <div class="plat-track"><div class="plat-fill" style="width:57.8%; background:#168562;"></div></div>
                  <div class="plat-pct">%57,8</div>
                </div>
              </div>
              <div class="plat-row">
                <div class="plat-glyph" style="background:#F5B656;">TY</div>
                <div class="plat-body">
                  <div><div class="plat-name">Trendyol</div><div class="plat-meta">420 sipariş · 178 yeşil seçim</div></div>
                  <div class="plat-track"><div class="plat-fill" style="width:42.4%; background:#4FB893;"></div></div>
                  <div class="plat-pct">%42,4</div>
                </div>
              </div>
              <div class="plat-row">
                <div class="plat-glyph" style="background:#EF9F27;">HB</div>
                <div class="plat-body">
                  <div><div class="plat-name">Hepsiburada</div><div class="plat-meta">285 sipariş · 108 yeşil seçim</div></div>
                  <div class="plat-track"><div class="plat-fill" style="width:37.9%; background:#8DD3B7;"></div></div>
                  <div class="plat-pct">%37,9</div>
                </div>
              </div>
              <div class="plat-row">
                <div class="plat-glyph" style="background:#085041;">AZ</div>
                <div class="plat-body">
                  <div><div class="plat-name">Amazon TR</div><div class="plat-meta">220 sipariş · 64 yeşil seçim</div></div>
                  <div class="plat-track"><div class="plat-fill" style="width:29.1%; background:#BFE7D6;"></div></div>
                  <div class="plat-pct">%29,1</div>
                </div>
              </div>
              <div class="plat-row">
                <div class="plat-glyph" style="background:#0F6A4F;">N1</div>
                <div class="plat-body">
                  <div><div class="plat-name">N11</div><div class="plat-meta">95 sipariş · 21 yeşil seçim</div></div>
                  <div class="plat-track"><div class="plat-fill" style="width:22.1%; background:#E1F5EE; border:1px solid #BFE7D6; box-sizing:border-box;"></div></div>
                  <div class="plat-pct">%22,1</div>
                </div>
              </div>
            </div>
            <div class="mt-5 pt-4 border-t border-leaf-100 flex items-start gap-3 text-xs">
              <div class="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              </div>
              <div>
                <div class="font-bold text-leaf-900">Çıkarım: Kendi sitende dönüşüm diğer kanallara göre belirgin daha yüksek.</div>
                <div class="text-leaf-800/65 mt-0.5">Yeşil seçimi varsayılan + öne çıkan kampanyalar, dönüşümü Trendyol/Hepsiburada'ya göre belirgin artırıyor. Diğer kanallarda da "yeşil seçenek" rozetini öne çıkarmayı öneriyoruz.</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  `;
}

// ─── Entry point ─────────────────────────────────────────────────────────────

async function renderStatistics() {
  const statisticsRoot = getStatisticsRoot();
  if (!statisticsRoot) return;

  setStatisticsBodyAttributes();

  if (
    typeof greenProductsState !== "undefined" &&
    !greenProductsState.logs.length &&
    typeof fetchGreenLogs === "function"
  ) {
    try {
      await fetchGreenLogs();
    } catch (e) {
      // continue with empty logs
    }
  }

  const stats = getGreenStatsForStatistics();
  statisticsRoot.innerHTML = getStatisticsMarkup(stats);
  bindStatisticsEvents();
}
