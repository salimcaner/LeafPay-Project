const state = {
  view: 'selection',
  formData: {},
};

const appRoot = document.getElementById('app-root');
const loginPageHref = '../login-page/login.html';

function navigate(view) {
  state.view = view;
  render();
}

function getSelectionView() {
  return `
    <div class="form-shell leaf-shadow fade-in">
      <div class="flex gap-1 p-1 bg-leaf-100/70 rounded-2xl mb-5">
        <div class="tab-btn active">Kayit Ol</div>
        <a href="${loginPageHref}" class="tab-btn">Giris Yap</a>
      </div>

      <div class="eyebrow mb-2">01 - Rol Secimi</div>
      <h2 class="text-2xl lg:text-[2rem] font-black text-leaf-900 tracking-tight leading-tight">Aramiza katil.</h2>
      <p class="mt-1.5 text-sm text-leaf-800/65">Surdurulebilir ekonomideki rolunu sec ve mevcut kayit akisina devam et.</p>

      <div class="mt-5 space-y-3">
        <button type="button" data-view="customer" class="choice-card">
          <div class="choice-card__icon choice-card__icon--leaf">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          </div>
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="font-bold text-base text-leaf-900">Musteri Ol</h3>
              <p class="text-sm text-leaf-800/60 mt-0.5">Surdurulebilir alisveris yap, VERA puan kazan.</p>
            </div>
            <span class="text-leaf-500 mt-1">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.25" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6"/></svg>
            </span>
          </div>
        </button>

        <button type="button" data-view="seller-step-1" class="choice-card">
          <div class="choice-card__icon choice-card__icon--amber">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </div>
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="font-bold text-base text-leaf-900">Satici / Marka Ol</h3>
              <p class="text-sm text-leaf-800/60 mt-0.5">Iki adimli basvuru ile markani yesil ekonomiye kaydet.</p>
            </div>
            <span class="text-amber-500 mt-1">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.25" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6"/></svg>
            </span>
          </div>
        </button>
      </div>

      <div class="mt-5 text-center text-sm text-leaf-800/70">
        Zaten hesabin var mi?
        <a href="${loginPageHref}" class="font-semibold text-leaf-700 hover:text-leaf-500 transition">Giris Yap</a>
      </div>
    </div>
  `;
}

function getCustomerView() {
  return `
    <div class="form-shell leaf-shadow relative fade-in">
      <button type="button" data-view="selection" class="absolute top-4 right-4 text-leaf-800/35 hover:text-leaf-800 transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg>
      </button>

      <div class="flex gap-1 p-1 bg-leaf-100/70 rounded-2xl mb-5">
        <div class="tab-btn active">Musteri Kaydi</div>
        <button type="button" data-view="seller-step-1" class="tab-btn">Satici Kaydi</button>
      </div>

      <div class="eyebrow mb-2">02 - Musteri Kaydi</div>
      <h2 class="text-2xl lg:text-[2rem] font-black text-leaf-900 tracking-tight leading-tight">Hesabini olustur.</h2>
      <p class="mt-1.5 text-sm text-leaf-800/65">Form sirasi ayni kalir, sadece deneyim yeni arayuze uyarlanir.</p>

      <form id="customer-form" class="mt-5 space-y-3.5">
        <div class="grid grid-cols-2 gap-3">
          <div class="field">
            <label>Ad</label>
            <input type="text" required class="form-input" placeholder="Ahmet" />
          </div>
          <div class="field">
            <label>Soyad</label>
            <input type="text" required class="form-input" placeholder="Yilmaz" />
          </div>
        </div>

        <div class="field">
          <label>E-posta</label>
          <input type="email" required class="form-input" placeholder="ornek@eposta.com" />
        </div>

        <div class="field">
          <label>Telefon Numarasi</label>
          <input type="tel" required class="form-input" placeholder="05XX XXX XX XX" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="field">
            <label>Sifre</label>
            <input type="password" required class="form-input" placeholder="********" />
          </div>
          <div class="field">
            <label>Sifre Tekrar</label>
            <input type="password" required class="form-input" placeholder="********" />
          </div>
        </div>

        <button type="submit" class="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full btn-primary font-semibold mt-1">
          Kayit Ol
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6"/></svg>
        </button>
      </form>

      <div class="mt-4 text-center text-sm text-leaf-800/70">
        Zaten hesabin var mi?
        <a href="${loginPageHref}" class="font-semibold text-leaf-700 hover:text-leaf-500 transition">Giris Yap</a>
      </div>
    </div>
  `;
}

function getSellerStep1View() {
  return `
    <div class="form-shell leaf-shadow relative fade-in">
      <button type="button" data-view="selection" class="absolute top-4 right-4 text-leaf-800/35 hover:text-leaf-800 transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg>
      </button>

      <div class="flex gap-1 p-1 bg-leaf-100/70 rounded-2xl mb-5">
        <button type="button" data-view="customer" class="tab-btn">Musteri</button>
        <div class="tab-btn active">Satici</div>
      </div>

      <div class="eyebrow mb-2">03 - Satici Hesabi</div>
      <h2 class="text-2xl lg:text-[2rem] font-black text-leaf-900 tracking-tight leading-tight">Satici kaydini baslat.</h2>
      <p class="mt-1.5 text-sm text-leaf-800/65">Ilk adimda sirket bilgilerini aliyoruz, ikinci adim mevcut akista aynen devam eder.</p>

      <div class="step-indicator">
        <span class="active"></span>
        <span></span>
      </div>

      <form id="seller-form-1" class="space-y-3.5">
        <div class="field">
          <label>Sirket Adi (Ticari Unvan)</label>
          <input type="text" name="companyName" required class="form-input" placeholder="Orn: Yesilkoy Tekstil A.S." />
        </div>

        <div class="field">
          <label>Vergi Numarasi</label>
          <input type="text" name="taxNumber" required class="form-input" placeholder="10 Haneli Vergi No" pattern="[0-9]{10}" title="Lutfen 10 haneli vergi numaranizi girin" />
          <div class="hint">Tuzel kisi basvurularinda 10 haneli vergi numarasi kullanilir.</div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="field">
            <label>Sirket Turu</label>
            <select name="companyType" required class="form-input select-input">
              <option value="" disabled selected>Seciniz</option>
              <option value="as">Anonim Sirket (A.S.)</option>
              <option value="ltd">Limited Sirket (Ltd. Sti.)</option>
              <option value="sahis">Sahis Sirketi</option>
              <option value="diger">Diger</option>
            </select>
          </div>
          <div class="field">
            <label>Sektor</label>
            <select name="sector" required class="form-input select-input">
              <option value="" disabled selected>Seciniz</option>
              <option value="tekstil">Tekstil</option>
              <option value="gida">Gida</option>
              <option value="kozmetik">Kozmetik</option>
              <option value="ev-yasam">Ev & Yasam</option>
              <option value="teknoloji">Teknoloji</option>
              <option value="diger">Diger</option>
            </select>
          </div>
        </div>

        <button type="submit" class="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full btn-primary font-semibold mt-1">
          Ileri
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6"/></svg>
        </button>
      </form>

      <div class="mt-4 text-center text-sm text-leaf-800/70">
        Zaten hesabin var mi?
        <a href="${loginPageHref}" class="font-semibold text-leaf-700 hover:text-leaf-500 transition">Giris Yap</a>
      </div>
    </div>
  `;
}

function getSellerStep2View() {
  return `
    <div class="form-shell leaf-shadow relative fade-in">
      <button type="button" data-view="seller-step-1" class="absolute top-4 right-4 text-leaf-800/35 hover:text-leaf-800 transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg>
      </button>

      <div class="flex gap-1 p-1 bg-leaf-100/70 rounded-2xl mb-5">
        <button type="button" data-view="customer" class="tab-btn">Musteri</button>
        <div class="tab-btn active">Satici</div>
      </div>

      <div class="eyebrow mb-2">04 - Yetkili Bilgileri</div>
      <h2 class="text-2xl lg:text-[2rem] font-black text-leaf-900 tracking-tight leading-tight">Kaydi tamamla.</h2>
      <p class="mt-1.5 text-sm text-leaf-800/65">Ikinci adim mevcut submit davranisi ile aynen korunur.</p>

      <div class="step-indicator">
        <span class="active"></span>
        <span class="active"></span>
      </div>

      <form id="seller-form-2" class="space-y-3.5">
        <div class="grid grid-cols-2 gap-3">
          <div class="field">
            <label>Yetkili Adi</label>
            <input type="text" required class="form-input" placeholder="Ayse" />
          </div>
          <div class="field">
            <label>Soyadi</label>
            <input type="text" required class="form-input" placeholder="Kaya" />
          </div>
        </div>

        <div class="field">
          <label>Kurumsal E-posta</label>
          <input type="email" required class="form-input" placeholder="ayse@sirket.com" />
        </div>

        <div class="field">
          <label>Iletisim Numarasi</label>
          <input type="tel" required class="form-input" placeholder="05XX XXX XX XX" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="field">
            <label>Sifre</label>
            <input type="password" required class="form-input" placeholder="********" />
          </div>
          <div class="field">
            <label>Sifre Tekrar</label>
            <input type="password" required class="form-input" placeholder="********" />
          </div>
        </div>

        <button type="submit" class="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full btn-primary font-semibold mt-1">
          Kaydi Tamamla
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
        </button>
      </form>

      <div class="mt-4 text-center text-sm text-leaf-800/70">
        Zaten hesabin var mi?
        <a href="${loginPageHref}" class="font-semibold text-leaf-700 hover:text-leaf-500 transition">Giris Yap</a>
      </div>
    </div>
  `;
}

function render() {
  const views = {
    selection: getSelectionView,
    customer: getCustomerView,
    'seller-step-1': getSellerStep1View,
    'seller-step-2': getSellerStep2View,
  };

  const template = views[state.view] || getSelectionView;
  appRoot.innerHTML = template();
}

document.addEventListener('click', (event) => {
  const viewTrigger = event.target.closest('[data-view]');
  if (viewTrigger) {
    navigate(viewTrigger.dataset.view);
    return;
  }

  if (event.target.closest('#home-link') || event.target.closest('#mobile-home-link')) {
    event.preventDefault();
    state.formData = {};
    navigate('selection');
  }
});

document.addEventListener('submit', (event) => {
  event.preventDefault();

  if (event.target.id === 'customer-form') {
    alert('Musteri kaydiniz basariyla olusturuldu!');
    window.location.href = loginPageHref;
    return;
  }

  if (event.target.id === 'seller-form-1') {
    const formData = new FormData(event.target);
    state.formData = Object.fromEntries(formData.entries());
    navigate('seller-step-2');
    return;
  }

  if (event.target.id === 'seller-form-2') {
    alert('Satici kaydiniz basariyla alindi. Onay sureciniz baslatildi.');
    window.location.href = loginPageHref;
  }
});

document.addEventListener('DOMContentLoaded', render);
