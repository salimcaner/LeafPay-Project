document.addEventListener("DOMContentLoaded", () => {
  const authState = requireAuth("../login-page/login.html", "satici");
  if (!authState) return;

  renderSidebar();
  renderTopbar();

  const initialView = new URLSearchParams(window.location.search).get("view");
  if (initialView === "rozet-durumu" && typeof renderBadgeStatus === "function") {
    renderBadgeStatus();
    setActiveSellerView("rozet-durumu");
  } else if (initialView === "ai-yol-haritasi" && typeof renderAiRoadmap === "function") {
    renderAiRoadmap();
    setActiveSellerView("ai-yol-haritasi");
  } else if (initialView === "istatistikler" && typeof renderStatistics === "function") {
    renderStatistics();
    setActiveSellerView("istatistikler");
  } else if (initialView === "yesil-secenekler" && typeof renderGreenOptions === "function") {
    renderGreenOptions();
    setActiveSellerView("yesil-secenekler");
  } else {
    renderDashboard();
    setActiveSellerView("dashboard");
  }

  bindLayoutEvents();
  applyCompanyInfo();
});
