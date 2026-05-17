document.addEventListener("DOMContentLoaded", () => {
  const authState = requireAuth("../login-page/login.html", "satici");
  if (!authState) return;

  renderSidebar();
  renderTopbar();
  renderDashboard();
  bindLayoutEvents();
  applyCompanyInfo();
});
