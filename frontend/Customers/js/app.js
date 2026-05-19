const CUSTOMER_RENDERERS = {
  dashboard: renderCustomerDashboard,
  wallet: renderWalletView,
  profile: renderProfileView,
};

function updateCustomerQuery(view) {
  const url = new URL(window.location.href);
  url.searchParams.set("view", view);
  window.history.replaceState({}, "", url);
}

function renderCustomerView(view) {
  const renderer = CUSTOMER_RENDERERS[view] || CUSTOMER_RENDERERS.dashboard;
  renderer();
  setActiveCustomerView(view in CUSTOMER_RENDERERS ? view : "dashboard");
  applyCustomerInfo();
  updateCustomerQuery(view in CUSTOMER_RENDERERS ? view : "dashboard");
}

document.addEventListener("DOMContentLoaded", () => {
  const authState = requireAuth("../login-page/login.html", "musteri");
  if (!authState) return;

  renderCustomerSidebar();
  renderCustomerTopbar();

  const initialView = new URLSearchParams(window.location.search).get("view") || "dashboard";
  renderCustomerView(initialView);
  bindCustomerLayoutEvents(renderCustomerView);
  applyCustomerInfo();
});
