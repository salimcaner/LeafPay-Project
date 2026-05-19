const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";
const AUTH_ROLE_KEY = "auth_role";
const LEAFPAY_COMPANY_KEY = "leafpay_company";

function getApiBaseUrl() {
  const globalConfig = window.LEAFPAY_CONFIG || {};
  const metaTag = document.querySelector('meta[name="leafpay-api-base-url"]');
  const metaValue = metaTag ? metaTag.getAttribute("content") : "";
  const baseUrl = globalConfig.API_BASE_URL || metaValue || "";
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");

  if (!normalizedBaseUrl) {
    throw new Error("API base URL tanımlı değil. `frontend/shared/env.js` içindeki `API_BASE_URL` değerini kontrol edin.");
  }

  if (!/^https?:\/\//i.test(normalizedBaseUrl)) {
    throw new Error("API base URL mutlak bir adres olmalı. Örnek: http://127.0.0.1:8000");
  }

  return normalizedBaseUrl;
}

async function apiRequest(path, options = {}) {
  const url = `${getApiBaseUrl()}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    const error = new Error(extractErrorMessage(payload) || "İstek başarısız oldu.");
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

function extractErrorMessage(payload) {
  if (!payload) return "";
  if (typeof payload.detail === "string") return payload.detail;

  if (Array.isArray(payload.detail)) {
    return payload.detail
      .map((item) => item && (item.msg || item.message || String(item)))
      .filter(Boolean)
      .join(" ");
  }

  return payload.message || payload.error || payload.mesaj || "";
}

function normalizeUserResponse(payload, role) {
  return {
    token: payload?.access_token || payload?.token || null,
    user: payload?.satici || payload?.musteri || payload?.user || payload?.data || null,
    role,
    message: payload?.mesaj || payload?.message || "",
  };
}

async function login(role, credentials) {
  const endpoint = role === "satici" ? "/satici/giris" : "/musteri/giris";
  const payload = await apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  return normalizeUserResponse(payload, role);
}

async function register(role, formData) {
  const endpoint = role === "satici" ? "/satici/kayit" : "/musteri/kayit";
  const payload = await apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(formData),
  });
  return normalizeUserResponse(payload, role);
}

function persistAuth(authState) {
  if (!authState?.token || !authState?.user) return;

  localStorage.setItem(AUTH_TOKEN_KEY, authState.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authState.user));
  localStorage.setItem(AUTH_ROLE_KEY, authState.role || "");

  if (authState.role === "satici" && authState.user.sirket_adi) {
    localStorage.setItem(LEAFPAY_COMPANY_KEY, authState.user.sirket_adi);
  }
}

function getAuthState() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const role = localStorage.getItem(AUTH_ROLE_KEY);
  const rawUser = localStorage.getItem(AUTH_USER_KEY);

  let user = null;
  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    user = null;
  }

  return {
    token,
    role,
    user,
    isAuthenticated: Boolean(token),
  };
}

function logout() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_ROLE_KEY);
  localStorage.removeItem(LEAFPAY_COMPANY_KEY);
}

function requireAuth(redirectHref, allowedRole) {
  const authState = getAuthState();
  const roleMatches = !allowedRole || authState.role === allowedRole;

  if (!authState.token || !roleMatches) {
    logout();
    window.location.href = redirectHref;
    return null;
  }

  return authState;
}

function redirectAuthenticated(redirectHref, allowedRole) {
  const authState = getAuthState();
  if (!authState.token) return false;
  if (allowedRole && authState.role !== allowedRole) return false;

  window.location.href = redirectHref;
  return true;
}
