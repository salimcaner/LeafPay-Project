const BRANDS = [
  { name: "Yeşilköy Tekstil", cat: "Tekstil", tier: 3, cartons: 12847, color: "from-leaf-200 to-leaf-300", initial: "YT", established: 2018 },
  { name: "Doğa Giyim", cat: "Tekstil", tier: 2, cartons: 8230, color: "from-amber-400/40 to-amber-500/30", initial: "DG", established: 2020 },
  { name: "Kartonist", cat: "Ev & Yaşam", tier: 3, cartons: 21504, color: "from-leaf-300 to-leaf-500", initial: "Kr", established: 2019 },
  { name: "Anadolu Doğal", cat: "Gıda", tier: 2, cartons: 6912, color: "from-leaf-100 to-leaf-200", initial: "AD", established: 2017 },
  { name: "Lale Organic", cat: "Kozmetik", tier: 1, cartons: 1284, color: "from-amber-400/30 to-leaf-200", initial: "LO", established: 2022 },
  { name: "Bambu Studio", cat: "Ev & Yaşam", tier: 3, cartons: 9483, color: "from-leaf-400 to-leaf-600", initial: "BS", established: 2021 },
  { name: "Yeşil Sepet", cat: "Gıda", tier: 2, cartons: 5621, color: "from-leaf-200 to-leaf-400", initial: "YS", established: 2019 },
  { name: "Çınar Kozmetik", cat: "Kozmetik", tier: 3, cartons: 11250, color: "from-leaf-300 to-amber-400/40", initial: "ÇK", established: 2020 }
];

const CATS = ["Tümü", "Tekstil", "Ev & Yaşam", "Gıda", "Kozmetik"];

const directoryState = {
  query: "",
  cat: "Tümü",
  tier: 0
};

const dashboardState = {
  tab: "aktivite"
};

function tierBadge(tier, size = "sm") {
  const sizes = {
    xs: "w-6 h-6 text-[8px]",
    sm: "w-8 h-8 text-[9px]",
    md: "w-12 h-12 text-[10px]"
  };
  const colors = {
    1: "bg-leaf-100 text-leaf-700 border-leaf-300",
    2: "bg-leaf-500 text-white border-leaf-600",
    3: "bg-leaf-800 text-white border-amber-500"
  };

  return `
    <div class="relative rounded-full border-2 flex items-center justify-center font-bold ${sizes[size]} ${colors[tier]}">
      T${tier}
    </div>
  `;
}

function filteredBrands() {
  return BRANDS.filter((brand) => {
    if (directoryState.cat !== "Tümü" && brand.cat !== directoryState.cat) {
      return false;
    }
    if (directoryState.tier && brand.tier !== directoryState.tier) {
      return false;
    }
    if (directoryState.query && !brand.name.toLowerCase().includes(directoryState.query.toLowerCase())) {
      return false;
    }
    return true;
  });
}

function renderDirectory() {
  const root = document.getElementById("directory-root");
  if (!root) {
    return;
  }

  const filtered = filteredBrands();

  root.innerHTML = `
    <div>
      <div class="bg-white rounded-3xl border border-leaf-100 p-3 sm:p-4 leaf-shadow flex flex-col lg:flex-row gap-3 lg:items-center">
        <div class="relative flex-1">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-leaf-800/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            id="directory-query"
            value="${directoryState.query.replace(/"/g, "&quot;")}"
            placeholder="Marka ara..."
            class="w-full pl-11 pr-4 py-3 bg-leaf-50/60 rounded-2xl text-sm placeholder-leaf-800/40 outline-none focus:bg-white focus:ring-2 focus:ring-leaf-300 transition"
          />
        </div>
        <div class="flex gap-2 overflow-x-auto scroll-fade -mx-1 px-1">
          ${CATS.map((cat) => `
            <button
              data-cat="${cat}"
              class="directory-cat px-4 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition ${directoryState.cat === cat ? "bg-leaf-800 text-white" : "bg-leaf-50/60 text-leaf-800/70 hover:bg-leaf-100"}"
            >
              ${cat}
            </button>
          `).join("")}
        </div>
        <div class="flex gap-1.5 bg-leaf-50/60 rounded-2xl p-1.5">
          ${[0, 1, 2, 3].map((tier) => `
            <button
              data-tier="${tier}"
              title="${tier === 0 ? "Tüm tier" : `Tier ${tier}`}"
              class="directory-tier px-3 py-2 rounded-xl text-xs font-bold transition ${directoryState.tier === tier ? "bg-white text-leaf-800 shadow" : "text-leaf-800/50 hover:text-leaf-800"}"
            >
              ${tier === 0 ? "Tier" : `T${tier}`}
            </button>
          `).join("")}
        </div>
      </div>

      <div class="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        ${filtered.map((brand) => `
          <article class="group bg-white rounded-3xl border border-leaf-100 overflow-hidden hover:border-leaf-300 hover:-translate-y-1 transition-all duration-300">
            <div class="relative h-32 bg-gradient-to-br ${brand.color} overflow-hidden">
              <div class="absolute inset-0 dotted-grid opacity-30"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-leaf-900/70 font-black text-5xl font-mono">${brand.initial}</div>
              </div>
              <div class="absolute top-3 right-3">
                ${tierBadge(brand.tier, "sm")}
              </div>
              ${brand.tier === 3 ? '<div class="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500 text-leaf-900 text-[10px] font-bold uppercase tracking-wider">★ Öne çıkan</div>' : ""}
            </div>
            <div class="p-5">
              <div class="flex items-center justify-between mb-1">
                <h3 class="font-bold text-leaf-900 group-hover:text-leaf-600 transition">${brand.name}</h3>
                <span class="text-[10px] font-mono text-leaf-800/40">est. ${brand.established}</span>
              </div>
              <div class="text-xs text-leaf-800/60">${brand.cat}</div>
              <div class="mt-4 pt-4 border-t border-leaf-100 flex items-center justify-between">
                <div>
                  <div class="text-[10px] font-mono uppercase tracking-widest text-leaf-800/40">Bu ay</div>
                  <div class="text-sm font-bold text-leaf-900 mt-0.5">
                    <span class="text-leaf-600">${brand.cartons.toLocaleString("tr-TR")}</span> karton seçildi
                  </div>
                </div>
                <button class="w-9 h-9 rounded-xl bg-leaf-50 text-leaf-700 group-hover:bg-leaf-500 group-hover:text-white transition flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6"/></svg>
                </button>
              </div>
            </div>
          </article>
        `).join("")}
        ${filtered.length === 0 ? '<div class="col-span-full text-center py-12 text-leaf-800/50">Bu filtrelerle eşleşen marka bulunamadı.</div>' : ""}
      </div>

      <div class="mt-8 flex items-center justify-between text-sm">
        <div class="text-leaf-800/50 font-mono">${filtered.length} / ${BRANDS.length} marka</div>
      </div>
    </div>
  `;

  const queryInput = root.querySelector("#directory-query");
  queryInput.addEventListener("input", (event) => {
    directoryState.query = event.target.value;
    renderDirectory();
  });

  root.querySelectorAll(".directory-cat").forEach((button) => {
    button.addEventListener("click", () => {
      directoryState.cat = button.dataset.cat;
      renderDirectory();
    });
  });

  root.querySelectorAll(".directory-tier").forEach((button) => {
    button.addEventListener("click", () => {
      directoryState.tier = Number(button.dataset.tier);
      renderDirectory();
    });
  });
}

function renderDashboard() {
  const root = document.getElementById("dashboard-root");
  if (!root) {
    return;
  }

  const points = 1840;
  const goal = 2000;
  const pct = Math.round((points / goal) * 100);

  const activityItems = [
    { brand: "Kartonist", detail: "Karton ambalaj seçimi", amount: "+80", when: "2 saat önce", tier: 3 },
    { brand: "Yeşilköy Tekstil", detail: "Karton ambalaj seçimi", amount: "+80", when: "Dün", tier: 3 },
    { brand: "Lale Organic", detail: "Karton ambalaj seçimi", amount: "+30", when: "3 gün önce", tier: 1 },
    { brand: "Bambu Studio", detail: "Hoşgeldin bonusu", amount: "+50", when: "5 gün önce", tier: 3 }
  ];

  const couponItems = [
    { brand: "Kartonist", val: "50₺", code: "KARTO50", exp: "12 gün" },
    { brand: "Bambu Studio", val: "15%", code: "BAMBU15", exp: "4 gün" },
    { brand: "Yeşil Sepet", val: "25₺", code: "YS25", exp: "21 gün" },
    { brand: "Çınar Kozmetik", val: "10%", code: "CINAR10", exp: "8 gün" }
  ];

  root.innerHTML = `
    <div class="bg-white rounded-3xl p-2 leaf-shadow text-leaf-900">
      <div class="flex items-center justify-between px-4 py-2.5 border-b border-leaf-100">
        <div class="flex gap-1.5">
          <div class="w-2.5 h-2.5 rounded-full bg-leaf-200"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-leaf-200"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-leaf-200"></div>
        </div>
        <div class="text-[11px] font-mono text-leaf-800/40">app.leafpay.com / cüzdan</div>
        <div class="w-12"></div>
      </div>

      <div class="p-6">
        <div class="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div class="text-xs font-mono uppercase tracking-widest text-leaf-800/50">VERA cüzdan</div>
            <div class="mt-1 flex items-baseline gap-2">
              <div class="text-5xl font-black text-leaf-800 tabular-nums">${points.toLocaleString("tr-TR")}</div>
              <div class="text-sm text-leaf-800/60 font-medium">VERA</div>
            </div>
            <div class="mt-1 text-xs text-leaf-600 font-medium">+240 bu hafta</div>
          </div>
          <div class="px-4 py-3 rounded-2xl bg-leaf-50 border border-leaf-100">
            <div class="text-[10px] font-mono uppercase tracking-widest text-leaf-800/50">Kupona çevir</div>
            <div class="mt-1 text-sm font-bold text-leaf-900">${goal - points} VERA kaldı</div>
          </div>
        </div>

        <div class="mt-6">
          <div class="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-leaf-800/50 mb-2">
            <span>500 VERA = 1 kupon</span>
            <span>${pct}%</span>
          </div>
          <div class="h-3 bg-leaf-100 rounded-full overflow-hidden relative">
            <div class="h-full bg-gradient-to-r from-leaf-500 to-leaf-400 rounded-full relative" style="width:${pct}%">
              <div class="absolute inset-0 bg-white/20"></div>
            </div>
            ${[0, 25, 50, 75, 100].map((p) => `<div class="absolute top-0 bottom-0 w-px bg-white/60" style="left:${p}%"></div>`).join("")}
          </div>
          <div class="flex justify-between text-[10px] font-mono text-leaf-800/40 mt-1.5">
            <span>0</span><span>500</span><span>1000</span><span>1500</span><span>2000</span>
          </div>
        </div>

        <div class="mt-7 flex gap-1.5 p-1.5 bg-leaf-50 rounded-2xl w-fit">
          ${[
            ["aktivite", "Son aktivite"],
            ["kupon", "Kuponlar"]
          ].map(([key, label]) => `
            <button data-dashboard-tab="${key}" class="dashboard-tab px-4 py-1.5 rounded-xl text-sm font-medium transition ${dashboardState.tab === key ? "bg-white text-leaf-900 shadow-sm" : "text-leaf-800/60 hover:text-leaf-800"}">${label}</button>
          `).join("")}
        </div>

        ${dashboardState.tab === "aktivite" ? `
          <ul class="mt-5 space-y-2">
            ${activityItems.map((item) => `
              <li class="flex items-center justify-between p-3 rounded-2xl hover:bg-leaf-50/60 transition">
                <div class="flex items-center gap-3">
                  ${tierBadge(item.tier, "sm")}
                  <div>
                    <div class="font-semibold text-sm">${item.brand}</div>
                    <div class="text-xs text-leaf-800/50">${item.detail}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-leaf-600 tabular-nums">${item.amount}</div>
                  <div class="text-[11px] text-leaf-800/40">${item.when}</div>
                </div>
              </li>
            `).join("")}
          </ul>
        ` : `
          <div class="mt-5 grid sm:grid-cols-2 gap-3">
            ${couponItems.map((item) => `
              <div class="relative p-4 rounded-2xl bg-gradient-to-br from-leaf-50 to-white border border-dashed border-leaf-300 hover:border-leaf-500 transition group cursor-pointer">
                <div class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-leaf-800"></div>
                <div class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full bg-leaf-800"></div>
                <div class="text-xs text-leaf-800/50">${item.brand}</div>
                <div class="text-2xl font-black text-leaf-900 mt-0.5">${item.val} <span class="text-sm font-normal text-leaf-800/50">indirim</span></div>
                <div class="mt-2 flex items-center justify-between">
                  <span class="font-mono text-[11px] tracking-wider text-leaf-700 bg-white px-2 py-0.5 rounded">${item.code}</span>
                  <span class="text-[10px] text-leaf-800/50">${item.exp} kaldı</span>
                </div>
              </div>
            `).join("")}
          </div>
        `}
      </div>
    </div>
  `;

  root.querySelectorAll(".dashboard-tab").forEach((button) => {
    button.addEventListener("click", () => {
      dashboardState.tab = button.dataset.dashboardTab;
      renderDashboard();
    });
  });
}

function renderImpact() {
  const root = document.getElementById("impact-root");
  if (!root) {
    return;
  }

  root.innerHTML = `
    <div class="grid lg:grid-cols-3 gap-8 lg:gap-12">
      <div class="bg-white rounded-3xl p-8 lg:p-10 border border-leaf-100 relative overflow-hidden">
        <div class="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-leaf-50"></div>
        <div class="relative">
          <div class="text-[10px] font-mono uppercase tracking-widest text-leaf-600 mb-4">Ambalaj etkisi</div>
          <div class="relative">
            <div class="flex items-baseline gap-1">
              <span class="impact-count font-black tabular-nums tracking-tight text-6xl lg:text-7xl text-leaf-700" data-target="18400">0</span>
            </div>
            <div class="mt-3 font-medium leading-snug max-w-xs text-leaf-800/80">sürdürülebilir tercih yapıldu</div>
            <div class="mt-1.5 font-mono text-[11px] uppercase tracking-widest text-leaf-600">Türkiye geneli</div>
          </div>
        </div>
      </div>
      <div class="bg-leaf-800 text-white rounded-3xl p-8 lg:p-10 relative overflow-hidden">
        <div class="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-leaf-500/20 blur-2xl"></div>
        <div class="relative">
          <div class="text-[10px] font-mono uppercase tracking-widest text-amber-400 mb-4">Doğrulama</div>
          <div class="relative">
            <div class="flex items-baseline gap-1">
              <span class="impact-count font-black tabular-nums tracking-tight text-6xl lg:text-7xl text-amber-400" data-target="87">0</span>
            </div>
            <div class="mt-3 font-medium leading-snug max-w-xs text-white/80">marka LeafPay tarafından doğrulandı</div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-3xl p-8 lg:p-10 border border-leaf-100 relative overflow-hidden">
        <div class="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-500">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></svg>
        </div>
        <div class="relative">
          <div class="text-[10px] font-mono uppercase tracking-widest text-leaf-600 mb-4">Ödül akışı</div>
          <div class="relative">
            <div class="flex items-baseline gap-1">
              <span class="impact-count font-black tabular-nums tracking-tight text-6xl lg:text-7xl text-leaf-700" data-target="124000">0</span>
            </div>
            <div class="mt-3 font-medium leading-snug max-w-xs text-leaf-800/80">VERA puan kullanıcılara dağıtıldı</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function setupRevealObserver() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach((element) => io.observe(element));
}

function setupImpactAnimation() {
  const root = document.getElementById("impact-root");
  if (!root) {
    return;
  }

  const animate = () => {
    root.querySelectorAll(".impact-count").forEach((element) => {
      const target = Number(element.dataset.target);
      const duration = 2000;
      let startTime = null;

      const step = (time) => {
        if (!startTime) {
          startTime = time;
        }
        const progress = Math.min(1, (time - startTime) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = Math.round(target * eased).toLocaleString("tr-TR");
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    });

    root.querySelectorAll(".impact-bar").forEach((element) => {
      element.style.width = element.dataset.width || "0%";
    });
  };

  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (entry && entry.isIntersecting) {
      animate();
      observer.disconnect();
    }
  }, { threshold: 0.3 });

  observer.observe(root);
}

document.addEventListener("DOMContentLoaded", () => {
  renderDirectory();
  renderDashboard();
  renderImpact();
  setupRevealObserver();
  setupImpactAnimation();
});
