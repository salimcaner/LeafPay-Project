const SELLER_VIEW_LABELS = {
  dashboard: "Anasayfa",
  "karbon-ayak-izi": "Karbon Ayak Izi",
  istatistikler: "İstatistikler",
  "yesil-secenekler": "Yeşil Ürünler",
  "rozet-durumu": "Rozet Durumu",
  "ai-yol-haritasi": "AI Yol Haritasi",
};

function renderSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  sidebar.className = "sidebar";
  sidebar.innerHTML = `
    <div class="flex flex-col h-full overflow-y-auto">
      <div class="px-5 py-5 border-b border-leaf-100 flex-shrink-0">
        <a href="#" class="flex items-center gap-2.5">
          <span class="w-8 h-8 rounded-full bg-leaf-500 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" class="w-4 h-4 text-white" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3C7.46 19.79 8.79 20 10 20a8 8 0 0 0 8-8c0-2-1-3.83-1-3.83Z"/></svg>
          </span>
          <span class="font-bold text-leaf-800 text-base tracking-tight">LeafPay</span>
          <span class="text-[10px] font-mono text-leaf-600 bg-leaf-50 px-1.5 py-0.5 rounded-md border border-leaf-200">Panel</span>
        </a>
      </div>

      <nav class="px-3 py-4 flex-1 space-y-1">
        <a href="#" class="sidebar-link active" data-nav="dashboard">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
          Ana Sayfa
        </a>
        <a href="#" class="sidebar-link" data-nav="istatistikler">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"/></svg>
          İstatistikler
        </a>
        <a href="#" class="sidebar-link" data-nav="yesil-secenekler">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3C7.46 19.79 8.79 20 10 20a8 8 0 0 0 8-8c0-2-1-3.83-1-3.83Z"/></svg>
          Yeşil Ürünler
        </a>
        <a href="#" class="sidebar-link" data-nav="karbon-ayak-izi">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v3"></path><path d="M12 18v3"></path><path d="M4.93 4.93l2.12 2.12"></path><path d="M16.95 16.95l2.12 2.12"></path><path d="M3 12h3"></path><path d="M18 12h3"></path><path d="M4.93 19.07l2.12-2.12"></path><path d="M16.95 7.05l2.12-2.12"></path><circle cx="12" cy="12" r="4"></circle></svg>
          Karbon Ayak Izi
        </a>
        <a href="#" class="sidebar-link" data-nav="rozet-durumu">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Rozet Durumu
        </a>
        <a href="#" class="sidebar-link" data-nav="ai-yol-haritasi">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 10v6M4.22 4.22l4.24 4.24m7.08 7.08 4.24 4.24M1 12h6m10 0h6M4.22 19.78l4.24-4.24m7.08-7.08 4.24-4.24"/></svg>
            AI Yol Haritası
          </a>
      </nav>
    </div>

    <div class="px-5 py-4 border-t border-leaf-100 bg-white flex-shrink-0">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-full bg-leaf-100 flex items-center justify-center text-leaf-700 font-bold text-sm flex-shrink-0" data-company-initials>KT</div>
          <div class="min-w-0">
            <div class="font-semibold text-sm text-leaf-900 truncate" data-company-name>Koton Mağazacılık</div>
            <div class="text-[11px] font-mono text-leaf-600 truncate mt-0.5">Tier 3 · Aktif</div>
          </div>
        </div>
        <button type="button" data-logout-button class="w-9 h-9 rounded-[10px] border border-leaf-200 bg-white flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors flex-shrink-0 shadow-sm text-leaf-700 hover:text-red-700" aria-label="Çıkış yap">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
      </div>
    </div>
  `;
}

function handleLogout() {
  logout();
  window.location.href = "../login-page/login.html";
}

function renderTopbar() {
  const topbar = document.getElementById("topbar");
  if (!topbar) return;

  topbar.className = "topbar nav-blur bg-paper/80 border-b border-leaf-100";
  topbar.innerHTML = `
    <div class="flex items-center gap-3">
      <button type="button" class="mobile-menu-button lg:hidden" data-open-sidebar aria-label="Menüyü aç">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
      <div>
        <span class="text-[10px] font-mono uppercase tracking-[0.18em] text-leaf-700" data-topbar-section>Anasayfa</span>
        <span class="text-[10px] font-mono text-leaf-800/30 mx-1.5">/</span>
        <span class="text-[10px] font-mono text-leaf-800/55" data-company-name>Koton Mağazacılık</span>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <span class="hidden sm:flex items-center gap-1.5 text-xs font-mono text-leaf-700 bg-leaf-50 border border-leaf-200 px-3 py-1.5 rounded-full">
        <span class="w-1.5 h-1.5 rounded-full bg-leaf-500 animate-pulse"></span>
        Mayıs 2026
      </span>
      <div class="profile-menu">
        <button type="button" data-profile-toggle class="flex items-center gap-1.5 pl-0.5 pr-2 py-0.5 rounded-full hover:bg-leaf-50 border border-transparent hover:border-leaf-200 transition group">
          <span class="w-8 h-8 rounded-full bg-gradient-to-br from-leaf-500 to-leaf-700 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white shadow-sm" data-company-initials>KT</span>
        </button>
        <div class="profile-dropdown" id="profile-dropdown">
          <a href="#" class="hover:bg-leaf-50 hover:text-leaf-700 transition-colors">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Profil
          </a>
          <a href="../login-page/login.html" data-logout-link class="danger hover:bg-red-50 transition-colors">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Çıkış Yap
          </a>
        </div>
      </div>
    </div>
  `;
}

function setActiveSellerView(view) {
  document.body.setAttribute("data-seller-view", view);

  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.classList.toggle("active", link.dataset.nav === view);
  });

  const title = SELLER_VIEW_LABELS[view] || SELLER_VIEW_LABELS.dashboard;
  document.querySelectorAll("[data-topbar-section]").forEach((element) => {
    element.textContent = title;
  });
}

function bindLayoutEvents() {
  const sidebarOpenButton = document.querySelector("[data-open-sidebar]");
  const logoutButton = document.querySelector("[data-logout-button]");
  const logoutLink = document.querySelector("[data-logout-link]");
  const profileToggle = document.querySelector("[data-profile-toggle]");
  const profileDropdown = document.getElementById("profile-dropdown");

  if (!document.querySelector(".mobile-sidebar-backdrop")) {
    const backdrop = document.createElement("button");
    backdrop.type = "button";
    backdrop.className = "mobile-sidebar-backdrop";
    backdrop.setAttribute("aria-label", "Menüyü kapat");
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", () => {
      document.body.classList.remove("sidebar-open");
    });
  }

  if (sidebarOpenButton) {
    sidebarOpenButton.addEventListener("click", () => {
      document.body.classList.add("sidebar-open");
    });
  }

  if (profileToggle && profileDropdown) {
    profileToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      profileDropdown.classList.toggle("open");
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", handleLogout);
  }

  if (logoutLink) {
    logoutLink.addEventListener("click", (event) => {
      event.preventDefault();
      handleLogout();
    });
  }

  document.addEventListener("click", (event) => {
    if (profileDropdown && !event.target.closest(".profile-menu")) {
      profileDropdown.classList.remove("open");
    }
  });

  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const view = link.dataset.nav;

      if (view === "dashboard") {
        renderDashboard();
      } else if (view === "istatistikler" && typeof renderStatistics === "function") {
        renderStatistics();
      } else if (view === "yesil-secenekler") {
        renderGreenOptions();
      } else if (view === "karbon-ayak-izi" && typeof renderCarbonCalculator === "function") {
        renderCarbonCalculator();
      } else if (view === "rozet-durumu") {
        renderBadgeStatus();
      } else if (view === "ai-yol-haritasi" && typeof renderAiRoadmap === "function") {
        renderAiRoadmap();
      }

      setActiveSellerView(view);
      applyCompanyInfo();
    });
  });
}

function applyCompanyInfo() {
  let company = "";
  try {
    company = (localStorage.getItem("leafpay_company") || "").trim();
  } catch (error) {
    company = "";
  }

  if (!company) {
    try {
      const authState = typeof getAuthState === "function" ? getAuthState() : null;
      company = (authState?.user?.sirket_adi || "").trim();
      if (company) {
        localStorage.setItem("leafpay_company", company);
      }
    } catch (error) {
      company = "";
    }
  }

  if (!company) return;

  const suffixRe = /\b(a\.?\s*ş\.?|ltd\.?\s*şti\.?|limited(?:\s+şirketi)?|anonim(?:\s+şirketi)?|şirketi|ticaret|sanayi|san\.?|tic\.?|paz\.?|hizmetleri?|mağazacılık|kooperatifi?)\b/gi;
  let short = company.replace(suffixRe, "").replace(/[.,]/g, " ").replace(/\s+/g, " ").trim();
  if (!short) short = company;
  const shortWords = short.split(" ").filter(Boolean);
  const greeting = shortWords.slice(0, 2).join(" ");
  const initials = shortWords.slice(0, 2).map((word) => word[0]).join("").toUpperCase() || company.slice(0, 2).toUpperCase();

  document.querySelectorAll("[data-company-name]").forEach((element) => {
    element.textContent = company;
  });
  document.querySelectorAll("[data-company-short]").forEach((element) => {
    element.textContent = greeting;
  });
  document.querySelectorAll("[data-company-initials]").forEach((element) => {
    element.textContent = initials;
  });
}
