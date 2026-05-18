function renderCustomerSidebar() {
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
          <span class="text-[10px] font-mono text-leaf-600 bg-leaf-50 px-1.5 py-0.5 rounded-md border border-leaf-200">User</span>
        </a>
      </div>

      <nav class="px-3 py-4 flex-1 space-y-1">
        <a href="#" class="sidebar-link active" data-nav="dashboard">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
          Ana Sayfa
        </a>
        <a href="#" class="sidebar-link" data-nav="wallet">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"></path><path d="M16 5v5h5"></path></svg>
          VERA Cuzdani
        </a>
        <a href="#" class="sidebar-link" data-nav="green-choices">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3C7.46 19.79 8.79 20 10 20a8 8 0 0 0 8-8c0-2-1-3.83-1-3.83Z"/></svg>
          Yesil Secimlerim
        </a>
        <a href="#" class="sidebar-link" data-nav="orders">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"></path><path d="M14 2v6h6"></path></svg>
          Siparislerim
        </a>
        <a href="#" class="sidebar-link" data-nav="campaigns">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18"></path><path d="M7 7h.01M17 17h.01"></path><path d="M7 7 3 12l4 5 10-10 4 5-4 5H7l-4-5 4-5"></path></svg>
          Kampanyalar
        </a>
      </nav>
    </div>

    <div class="px-5 py-4 border-t border-leaf-100 bg-white flex-shrink-0">
      <div class="flex items-center justify-between gap-3">
        <a href="#" class="flex items-center gap-3 min-w-0 flex-1 no-underline" data-nav-shortcut="profile">
          <div class="w-10 h-10 rounded-full bg-leaf-100 flex items-center justify-center text-leaf-700 font-bold text-sm flex-shrink-0" data-customer-initials>ML</div>
          <div class="min-w-0">
            <div class="font-semibold text-sm text-leaf-900 truncate" data-customer-name>Melike</div>
            <div class="text-[11px] font-mono text-leaf-600 truncate mt-0.5">VERA Club · Aktif</div>
          </div>
        </a>
        <button type="button" data-logout-button class="w-9 h-9 rounded-[10px] border border-leaf-200 bg-white flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors flex-shrink-0 shadow-sm text-leaf-700 hover:text-red-700" aria-label="Cikis yap">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
      </div>
    </div>
  `;
}

function renderCustomerTopbar() {
  const topbar = document.getElementById("topbar");
  if (!topbar) return;

  topbar.className = "topbar nav-blur bg-paper/80 border-b border-leaf-100";
  topbar.innerHTML = `
    <div class="flex items-center gap-3">
      <button type="button" class="mobile-menu-button lg:hidden" data-open-sidebar aria-label="Menuyu ac">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
      <div>
        <span class="text-[10px] font-mono uppercase tracking-[0.18em] text-leaf-700" data-topbar-section>Ana Sayfa</span>
        <span class="text-[10px] font-mono text-leaf-800/30 mx-1.5">/</span>
        <span class="text-[10px] font-mono text-leaf-800/55" data-customer-name>Melike</span>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <span class="hidden sm:flex items-center gap-1.5 text-xs font-mono text-leaf-700 bg-leaf-50 border border-leaf-200 px-3 py-1.5 rounded-full">
        <span class="w-1.5 h-1.5 rounded-full bg-leaf-500 animate-pulse"></span>
        18 Mayis 2026
      </span>
      <div class="profile-menu">
        <button type="button" data-profile-toggle class="flex items-center gap-1.5 pl-0.5 pr-2 py-0.5 rounded-full hover:bg-leaf-50 border border-transparent hover:border-leaf-200 transition group">
          <span class="w-8 h-8 rounded-full bg-gradient-to-br from-leaf-500 to-leaf-700 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white shadow-sm" data-customer-initials>ML</span>
        </button>
        <div class="profile-dropdown" id="profile-dropdown">
          <a href="#" data-nav-shortcut="profile">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Profil
          </a>
          <a href="../login-page/login.html" data-logout-link class="danger hover:bg-red-50 transition-colors">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Cikis Yap
          </a>
        </div>
      </div>
    </div>
  `;
}

function setActiveCustomerView(view) {
  document.body.setAttribute("data-customer-view", view);
  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.classList.toggle("active", link.dataset.nav === view);
  });

  const title = CUSTOMER_VIEW_LABELS[view] || CUSTOMER_VIEW_LABELS.dashboard;
  document.querySelectorAll("[data-topbar-section]").forEach((element) => {
    element.textContent = title;
  });
}

function handleCustomerLogout() {
  logout();
  window.location.href = "../login-page/login.html";
}

function applyCustomerInfo() {
  const profile = getCustomerProfile();
  document.querySelectorAll("[data-customer-name]").forEach((element) => {
    element.textContent = profile.name;
  });
  document.querySelectorAll("[data-customer-initials]").forEach((element) => {
    element.textContent = getInitials(profile.fullName);
  });
}

function bindCustomerLayoutEvents(onNavigate) {
  const sidebarOpenButton = document.querySelector("[data-open-sidebar]");
  const logoutButton = document.querySelector("[data-logout-button]");
  const logoutLink = document.querySelector("[data-logout-link]");
  const profileToggle = document.querySelector("[data-profile-toggle]");
  const profileDropdown = document.getElementById("profile-dropdown");

  if (!document.querySelector(".mobile-sidebar-backdrop")) {
    const backdrop = document.createElement("button");
    backdrop.type = "button";
    backdrop.className = "mobile-sidebar-backdrop";
    backdrop.setAttribute("aria-label", "Menuyu kapat");
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", () => document.body.classList.remove("sidebar-open"));
  }

  if (sidebarOpenButton) {
    sidebarOpenButton.addEventListener("click", () => document.body.classList.add("sidebar-open"));
  }

  if (profileToggle && profileDropdown) {
    profileToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      profileDropdown.classList.toggle("open");
    });
  }

  if (logoutButton) logoutButton.addEventListener("click", handleCustomerLogout);
  if (logoutLink) {
    logoutLink.addEventListener("click", (event) => {
      event.preventDefault();
      handleCustomerLogout();
    });
  }

  document.addEventListener("click", (event) => {
    if (profileDropdown && !event.target.closest(".profile-menu")) {
      profileDropdown.classList.remove("open");
    }
  });

  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      onNavigate(link.dataset.nav);
      document.body.classList.remove("sidebar-open");
    });
  });

  document.querySelectorAll("[data-nav-shortcut]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      onNavigate(link.dataset.navShortcut);
      if (profileDropdown) profileDropdown.classList.remove("open");
    });
  });
}
