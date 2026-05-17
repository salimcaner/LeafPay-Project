const loginState = {
  view: 'login-selection',
};

const loginRoot = document.getElementById('app-root');
const registrationPageHref = '../registration-page/registration.html';

function navigateLogin(view) {
  loginState.view = view;
  renderLogin();
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
              <h3 class="font-bold text-base text-leaf-900">Satıcı / Şirket Girişi</h3>
              <p class="text-sm text-leaf-800/60 mt-0.5">Account ID ve şifren ile yönetim paneline geç.</p>
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
  return `
    <div class="form-shell leaf-shadow relative fade-in">
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
        <div class="field">
          <label>E-posta</label>
          <input type="email" required class="form-input" placeholder="ornek@eposta.com" />
        </div>

        <div class="field">
          <label>Şifre</label>
          <input type="password" required class="form-input" placeholder="********" />
        </div>

        <button type="submit" class="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full btn-primary font-semibold mt-1">
          Giriş Yap
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
  return `
    <div class="form-shell leaf-shadow relative fade-in">
      <button type="button" data-login-view="login-selection" class="absolute top-4 right-4 text-leaf-800/35 hover:text-leaf-800 transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg>
      </button>

      <div class="flex gap-1 p-1 bg-leaf-100/70 rounded-2xl mb-5">
        <button type="button" data-login-view="customer-login" class="tab-btn">Müşteri</button>
        <div class="tab-btn active">Satıcı / Şirket</div>
      </div>

      <div class="eyebrow mb-2">03 - Satıcı Girişi</div>
      <h2 class="text-2xl lg:text-[2rem] font-black text-leaf-900 tracking-tight leading-tight">Şirket paneline geç.</h2>
      <p class="mt-1.5 text-sm text-leaf-800/65">Account ID ve şifre ile yönetim hesabına doğrudan eriş.</p>

      <form id="seller-login-form" class="mt-5 space-y-3.5">
        <div class="field">
          <label>Account ID</label>
          <input type="text" required class="form-input" placeholder="LP-SELLER-001" />
        </div>

        <div class="field">
          <label>Şifre</label>
          <input type="password" required class="form-input" placeholder="********" />
        </div>

        <button type="submit" class="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full btn-primary font-semibold mt-1">
          Giriş Yap
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
  event.preventDefault();

  if (event.target.id === 'customer-login-form') {
    alert('Müşteri girişi yapılıyor...');
    window.location.href = registrationPageHref;
    return;
  }

  if (event.target.id === 'seller-login-form') {
    alert('Satıcı girişi yapılıyor...');
    window.location.href = registrationPageHref;
  }
});

document.addEventListener('DOMContentLoaded', renderLogin);
