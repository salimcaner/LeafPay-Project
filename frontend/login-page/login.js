const loginState = {
  view: 'login-selection',
  loading: false,
  error: '',
  formData: {
    musteri: { e_posta: '', sifre: '' },
    satici: { e_posta: '', sifre: '' },
  },
};

const loginRoot = document.getElementById('app-root');
const registrationPageHref = '../registration-page/registration.html';
const sellerDashboardHref = '../Sellers/index.html';
const customerRedirectHref = '../landing-page/landingpage.html';

function getRedirectForRole(role) {
  return role === 'satici' ? sellerDashboardHref : customerRedirectHref;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getRoleFormData(role) {
  return loginState.formData[role] || { e_posta: '', sifre: '' };
}

function navigateLogin(view) {
  loginState.view = view;
  loginState.error = '';
  loginState.loading = false;
  renderLogin();
}

function getErrorMarkup() {
  if (!loginState.error) return '';
  return `<div class="form-alert form-alert--error">${escapeHtml(loginState.error)}</div>`;
}

function getSubmitLabel() {
  return loginState.loading ? 'İşleniyor...' : 'Giriş Yap';
}

function getLoginSelectionView() {
  return `
    <div class="form-shell leaf-shadow fade-in">
      <div class="flex gap-1 p-1 bg-leaf-100/70 rounded-2xl mb-5">
        <a href="${registrationPageHref}" class="tab-btn">Kayıt Ol</a>
        <div class="tab-btn active">Giriş Yap</div>
      </div>

      <div class="eyebrow mb-2">01 - Giriş Tipi</div>
      <h2 class="text-2xl lg:text-[2rem] font-black text-leaf-900 tracking-tight leading-tight">Hesabına dön.</h2>
      <p class="mt-1.5 text-sm text-leaf-800/65">Giriş yapmak istediğin hesap türünü seç ve aynı akış içinde ilerle.</p>

      <div class="mt-5 space-y-3">
        <button type="button" data-login-view="customer-login" class="choice-card">
          <div class="choice-card__icon choice-card__icon--leaf">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          </div>
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="font-bold text-base text-leaf-900">Müşteri Girişi</h3>
              <p class="text-sm text-leaf-800/60 mt-0.5">E-posta ve şifren ile hesabına giriş yap.</p>
            </div>
            <span class="text-leaf-500 mt-1">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.25" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6"/></svg>
            </span>
          </div>
        </button>

        <button type="button" data-login-view="seller-login" class="choice-card">
          <div class="choice-card__icon choice-card__icon--amber">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </div>
          <div class="flex items-start justify-between gap-4">
            <div>
<<<<<<< HEAD
=======
              <h3 class="font-bold text-base text-leaf-900">Satici / Sirket Girisi</h3>
              <p class="text-sm text-leaf-800/60 mt-0.5">Account ID ve sifren ile yonetim paneline gec.</p>
>>>>>>> origin/feature/login/registration-page
              <h3 class="font-bold text-base text-leaf-900">Satıcı / Şirket Girişi</h3>
              <p class="text-sm text-leaf-800/60 mt-0.5">Kurumsal e-posta ve şifre ile yönetim paneline geç.</p>
            </div>
            <span class="text-amber-500 mt-1">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.25" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6"/></svg>
            </span>
          </div>
        </button>
      </div>

      <div class="mt-5 text-center text-sm text-leaf-800/70">
        Hesabın yok mu?
        <a href="${registrationPageHref}" class="font-semibold text-leaf-700 hover:text-leaf-500 transition">Kayıt Ol</a>
      </div>
    </div>
  `;
}

function getCustomerLoginView() {
  const values = getRoleFormData('musteri');
  return `
    <div class="form-shell leaf-shadow relative fade-in ${loginState.loading ? 'is-loading' : ''}">
      <button type="button" data-login-view="login-selection" class="absolute top-4 right-4 text-leaf-800/35 hover:text-leaf-800 transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg>
      </button>

      <div class="flex gap-1 p-1 bg-leaf-100/70 rounded-2xl mb-5">
        <div class="tab-btn active">Müşteri</div>
        <button type="button" data-login-view="seller-login" class="tab-btn">Satıcı / Şirket</button>
      </div>

      <div class="eyebrow mb-2">02 - Müşteri Girişi</div>
      <h2 class="text-2xl lg:text-[2rem] font-black text-leaf-900 tracking-tight leading-tight">Tekrar hoş geldin.</h2>
      <p class="mt-1.5 text-sm text-leaf-800/65">Müşteri hesabına devam etmek için e-posta ve şifreni gir.</p>

      <form id="customer-login-form" class="mt-5 space-y-3.5">
        ${getErrorMarkup()}
        <div class="field">
          <label>E-posta</label>
          <input name="e_posta" type="email" required class="form-input" placeholder="ornek@eposta.com" value="${escapeHtml(values.e_posta)}" />
        </div>

        <div class="field">
          <label>Şifre</label>
          <input name="sifre" type="password" required class="form-input" placeholder="********" value="${escapeHtml(values.sifre)}" />
        </div>

        <button type="submit" ${loginState.loading ? 'disabled' : ''} class="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full btn-primary font-semibold mt-1">
          ${getSubmitLabel()}
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6"/></svg>
        </button>
      </form>

      <div class="mt-4 text-center text-sm text-leaf-800/70">
        Hesabın yok mu?
        <a href="${registrationPageHref}" class="font-semibold text-leaf-700 hover:text-leaf-500 transition">Kayıt Ol</a>
      </div>
    </div>
  `;
}

function getSellerLoginView() {
  const values = getRoleFormData('satici');
  return `
    <div class="form-shell leaf-shadow relative fade-in ${loginState.loading ? 'is-loading' : ''}">
      <button type="button" data-login-view="login-selection" class="absolute top-4 right-4 text-leaf-800/35 hover:text-leaf-800 transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg>
      </button>

      <div class="flex gap-1 p-1 bg-leaf-100/70 rounded-2xl mb-5">
        <button type="button" data-login-view="customer-login" class="tab-btn">Müşteri</button>
        <div class="tab-btn active">Satıcı / Şirket</div>
      </div>

      <div class="eyebrow mb-2">03 - Satıcı Girişi</div>
      <h2 class="text-2xl lg:text-[2rem] font-black text-leaf-900 tracking-tight leading-tight">Şirket paneline geç.</h2>
      <p class="mt-1.5 text-sm text-leaf-800/65">Kurumsal e-posta ve şifre ile yönetim hesabına doğrudan eriş.</p>

      <form id="seller-login-form" class="mt-5 space-y-3.5">
        ${getErrorMarkup()}
        <div class="field">
          <label>Kurumsal E-posta</label>
          <input name="e_posta" type="email" required class="form-input" placeholder="marka@sirket.com" value="${escapeHtml(values.e_posta)}" />
        </div>

        <div class="field">
          <label>Şifre</label>
          <input name="sifre" type="password" required class="form-input" placeholder="********" value="${escapeHtml(values.sifre)}" />
        </div>

        <button type="submit" ${loginState.loading ? 'disabled' : ''} class="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full btn-primary font-semibold mt-1">
          ${getSubmitLabel()}
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6"/></svg>
        </button>
      </form>

      <div class="mt-4 text-center text-sm text-leaf-800/70">
        Hesabın yok mu?
        <a href="${registrationPageHref}" class="font-semibold text-leaf-700 hover:text-leaf-500 transition">Kayıt Ol</a>
      </div>
    </div>
  `;
}

function renderLogin() {
  const views = {
    'login-selection': getLoginSelectionView,
    'customer-login': getCustomerLoginView,
    'seller-login': getSellerLoginView,
  };

  const template = views[loginState.view] || getLoginSelectionView;
  loginRoot.innerHTML = template();
}

async function handleLoginSubmit(role, form) {
  const formData = new FormData(form);
  const credentials = {
    e_posta: String(formData.get('e_posta') || '').trim(),
    sifre: String(formData.get('sifre') || '').trim(),
  };

  loginState.formData[role] = credentials;

  if (!credentials.e_posta) {
    loginState.error = 'E-posta alanı zorunludur.';
    renderLogin();
    return;
  }

  if (!credentials.sifre) {
    loginState.error = 'Şifre alanı zorunludur.';
    renderLogin();
    return;
  }

  loginState.loading = true;
  loginState.error = '';
  renderLogin();

  try {
    const authResult = await login(role, credentials);
    if (authResult.token && authResult.user) {
      persistAuth(authResult);
    }
    window.location.href = getRedirectForRole(role);
  } catch (error) {
    loginState.error = error.message || 'Giriş işlemi başarısız oldu.';
    loginState.loading = false;
    renderLogin();
  }
}

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-login-view]');
  if (trigger) {
    navigateLogin(trigger.dataset.loginView);
    return;
  }

  if (event.target.closest('#home-link') || event.target.closest('#mobile-home-link')) {
    event.preventDefault();
    navigateLogin('login-selection');
  }
});

document.addEventListener('submit', (event) => {
  if (event.target.id !== 'customer-login-form' && event.target.id !== 'seller-login-form') return;

  event.preventDefault();
  const role = event.target.id === 'seller-login-form' ? 'satici' : 'musteri';
  handleLoginSubmit(role, event.target);
});

document.addEventListener('DOMContentLoaded', () => {
  if (redirectAuthenticated(getRedirectForRole('satici'), 'satici')) return;
  if (redirectAuthenticated(getRedirectForRole('musteri'), 'musteri')) return;
  renderLogin();
});
