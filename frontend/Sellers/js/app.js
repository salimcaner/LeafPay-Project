document.addEventListener("DOMContentLoaded", () => {
  const authState = requireAuth("../login-page/login.html", "satici");
  if (!authState) return;

  renderSidebar();
  renderTopbar();

  const initialView = new URLSearchParams(window.location.search).get("view");
  if (initialView === "rozet-durumu" && typeof renderBadgeStatus === "function") {
    renderBadgeStatus();
    document.querySelectorAll("[data-nav]").forEach((l) => l.classList.remove("active"));
    const link = document.querySelector('[data-nav="rozet-durumu"]');
    if (link) link.classList.add("active");
  } else if (initialView === "yesil-secenekler" && typeof renderGreenOptions === "function") {
    renderGreenOptions();
    document.querySelectorAll("[data-nav]").forEach((l) => l.classList.remove("active"));
    const link = document.querySelector('[data-nav="yesil-secenekler"]');
    if (link) link.classList.add("active");
  } else {
    renderDashboard();
  }

  bindLayoutEvents();
  applyCompanyInfo();
});
