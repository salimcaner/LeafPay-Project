const state = {
  view: 'selection',
  formData: {
    musteri: {
      musteri_ad: '',
      musteri_soyad: '',
      e_posta: '',
      telefon_no: '',
      sifre: '',
      sifre_tekrar: '',
    },
    satici: {
      sirket_adi: '',
      vergi_no: '',
      sirket_turu: '',
      sektor: '',
      yetkili_ad: '',
      yetkili_soyad: '',
      e_posta: '',
      telefon_no: '',
      sifre: '',
      sifre_tekrar: '',
    },
  },
  loading: false,
  error: '',
};

const appRoot = document.getElementById('app-root');
const loginPageHref = '../login-page/login.html';
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

function navigate(view) {
  state.view = view;
  state.error = '';
  state.loading = false;
  render();
}

function getErrorMarkup() {
  if (!state.error) return '';
  return `<div class="form-alert form-alert--error">${escapeHtml(state.error)}</div>`;
}

function getSubmitLabel(defaultLabel) {
  return state.loading ? 'İşleniyor...' : defaultLabel;
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
  const values = state.formData.musteri;
  return `
    <div class="form-shell leaf-shadow relative fade-in ${state.loading ? 'is-loading' : ''}">
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
        ${getErrorMarkup()}
        <div class="grid grid-cols-2 gap-3">
          <div class="field">
            <label>Ad</label>
            <input name="musteri_ad" type="text" required class="form-input" placeholder="Ahmet" value="${escapeHtml(values.musteri_ad)}" />
          </div>
          <div class="field">
            <label>Soyad</label>
<<<<<<< HEAD
            <input type="text" required class="form-input" placeholder="Yilmaz" />
=======
            <input name="musteri_soyad" type="text" required class="form-input" placeholder="Yılmaz" value="${escapeHtml(values.musteri_soyad)}" />
>>>>>>> 9d9abfa (login ve registration ekranlarının backend bağlantısı yapıldı)
          </div>
        </div>

        <div class="field">
          <label>E-posta</label>
          <input name="e_posta" type="email" required class="form-input" placeholder="ornek@eposta.com" value="${escapeHtml(values.e_posta)}" />
        </div>

        <div class="field">
<<<<<<< HEAD
          <label>Telefon Numarasi</label>
          <input type="tel" required class="form-input" placeholder="05XX XXX XX XX" />
=======
          <label>Telefon Numarası</label>
          <input name="telefon_no" type="tel" required class="form-input" placeholder="05XX XXX XX XX" value="${escapeHtml(values.telefon_no)}" />
>>>>>>> 9d9abfa (login ve registration ekranlarının backend bağlantısı yapıldı)
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="field">
<<<<<<< HEAD
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
=======
            <label>Şifre</label>
            <input name="sifre" type="password" required class="form-input" placeholder="********" value="${escapeHtml(values.sifre)}" />
          </div>
          <div class="field">
            <label>Şifre Tekrar</label>
            <input name="sifre_tekrar" type="password" required class="form-input" placeholder="********" value="${escapeHtml(values.sifre_tekrar)}" />
          </div>
        </div>

        <button type="submit" ${state.loading ? 'disabled' : ''} class="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full btn-primary font-semibold mt-1">
          ${getSubmitLabel('Kayıt Ol')}
>>>>>>> 9d9abfa (login ve registration ekranlarının backend bağlantısı yapıldı)
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
  const values = state.formData.satici;
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
        ${getErrorMarkup()}
        <div class="field">
<<<<<<< HEAD
          <label>Sirket Adi (Ticari Unvan)</label>
          <input type="text" name="companyName" required class="form-input" placeholder="Orn: Yesilkoy Tekstil A.S." />
        </div>

        <div class="field">
          <label>Vergi Numarasi</label>
          <input type="text" name="taxNumber" required class="form-input" placeholder="10 Haneli Vergi No" pattern="[0-9]{10}" title="Lutfen 10 haneli vergi numaranizi girin" />
          <div class="hint">Tuzel kisi basvurularinda 10 haneli vergi numarasi kullanilir.</div>
=======
          <label>Şirket Adı (Ticari Unvan)</label>
          <input type="text" name="sirket_adi" required class="form-input" placeholder="Örn: Yeşilköy Tekstil A.Ş." value="${escapeHtml(values.sirket_adi)}" />
        </div>

        <div class="field">
          <label>Vergi Numarası</label>
          <input type="text" name="vergi_no" required class="form-input" placeholder="10 Haneli Vergi No" pattern="[0-9]{10}" title="Lütfen 10 haneli vergi numaranızı girin" value="${escapeHtml(values.vergi_no)}" />
          <div class="hint">Tüzel kişi başvurularında 10 haneli vergi numarası kullanılır.</div>
>>>>>>> 9d9abfa (login ve registration ekranlarının backend bağlantısı yapıldı)
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="field">
<<<<<<< HEAD
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
=======
            <label>Şirket Türü</label>
            <select name="sirket_turu" required class="form-input select-input">
              <option value="" ${values.sirket_turu ? '' : 'selected'} disabled>Seçiniz</option>
              <option value="Anonim Şirket (A.Ş.)" ${values.sirket_turu === 'Anonim Şirket (A.Ş.)' ? 'selected' : ''}>Anonim Şirket (A.Ş.)</option>
              <option value="Limited Şirket (Ltd. Şti.)" ${values.sirket_turu === 'Limited Şirket (Ltd. Şti.)' ? 'selected' : ''}>Limited Şirket (Ltd. Şti.)</option>
              <option value="Şahıs Şirketi" ${values.sirket_turu === 'Şahıs Şirketi' ? 'selected' : ''}>Şahıs Şirketi</option>
              <option value="Diğer" ${values.sirket_turu === 'Diğer' ? 'selected' : ''}>Diğer</option>
            </select>
          </div>
          <div class="field">
            <label>Sektör</label>
            <select name="sektor" required class="form-input select-input">
              <option value="" ${values.sektor ? '' : 'selected'} disabled>Seçiniz</option>
              <option value="Tekstil" ${values.sektor === 'Tekstil' ? 'selected' : ''}>Tekstil</option>
              <option value="Gıda" ${values.sektor === 'Gıda' ? 'selected' : ''}>Gıda</option>
              <option value="Kozmetik" ${values.sektor === 'Kozmetik' ? 'selected' : ''}>Kozmetik</option>
              <option value="Ev & Yaşam" ${values.sektor === 'Ev & Yaşam' ? 'selected' : ''}>Ev & Yaşam</option>
              <option value="Teknoloji" ${values.sektor === 'Teknoloji' ? 'selected' : ''}>Teknoloji</option>
              <option value="Diğer" ${values.sektor === 'Diğer' ? 'selected' : ''}>Diğer</option>
>>>>>>> 9d9abfa (login ve registration ekranlarının backend bağlantısı yapıldı)
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
  const values = state.formData.satici;
  return `
    <div class="form-shell leaf-shadow relative fade-in ${state.loading ? 'is-loading' : ''}">
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
        ${getErrorMarkup()}
        <div class="grid grid-cols-2 gap-3">
          <div class="field">
<<<<<<< HEAD
            <label>Yetkili Adi</label>
            <input type="text" required class="form-input" placeholder="Ayse" />
          </div>
          <div class="field">
            <label>Soyadi</label>
            <input type="text" required class="form-input" placeholder="Kaya" />
=======
            <label>Yetkili Adı</label>
            <input name="yetkili_ad" type="text" required class="form-input" placeholder="Ayşe" value="${escapeHtml(values.yetkili_ad)}" />
          </div>
          <div class="field">
            <label>Soyadı</label>
            <input name="yetkili_soyad" type="text" required class="form-input" placeholder="Kaya" value="${escapeHtml(values.yetkili_soyad)}" />
>>>>>>> 9d9abfa (login ve registration ekranlarının backend bağlantısı yapıldı)
          </div>
        </div>

        <div class="field">
          <label>Kurumsal E-posta</label>
          <input name="e_posta" type="email" required class="form-input" placeholder="ayse@sirket.com" value="${escapeHtml(values.e_posta)}" />
        </div>

        <div class="field">
<<<<<<< HEAD
          <label>Iletisim Numarasi</label>
          <input type="tel" required class="form-input" placeholder="05XX XXX XX XX" />
=======
          <label>İletişim Numarası</label>
          <input name="telefon_no" type="tel" required class="form-input" placeholder="05XX XXX XX XX" value="${escapeHtml(values.telefon_no)}" />
>>>>>>> 9d9abfa (login ve registration ekranlarının backend bağlantısı yapıldı)
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="field">
<<<<<<< HEAD
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
=======
            <label>Şifre</label>
            <input name="sifre" type="password" required class="form-input" placeholder="********" value="${escapeHtml(values.sifre)}" />
          </div>
          <div class="field">
            <label>Şifre Tekrar</label>
            <input name="sifre_tekrar" type="password" required class="form-input" placeholder="********" value="${escapeHtml(values.sifre_tekrar)}" />
          </div>
        </div>

        <button type="submit" ${state.loading ? 'disabled' : ''} class="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full btn-primary font-semibold mt-1">
          ${getSubmitLabel('Kaydı Tamamla')}
>>>>>>> 9d9abfa (login ve registration ekranlarının backend bağlantısı yapıldı)
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

function normalizeText(value) {
  return String(value || '').trim();
}

function validateRequired(fields) {
  for (const [key, value] of Object.entries(fields)) {
    if (!normalizeText(value)) {
      return `${key} alanı zorunludur.`;
    }
  }
  return '';
}

async function handleCustomerRegister(form) {
  const formData = new FormData(form);
  state.formData.musteri = {
    musteri_ad: normalizeText(formData.get('musteri_ad')),
    musteri_soyad: normalizeText(formData.get('musteri_soyad')),
    e_posta: normalizeText(formData.get('e_posta')),
    telefon_no: normalizeText(formData.get('telefon_no')),
    sifre: normalizeText(formData.get('sifre')),
    sifre_tekrar: normalizeText(formData.get('sifre_tekrar')),
  };

  const payload = {
    musteri_ad: state.formData.musteri.musteri_ad,
    musteri_soyad: state.formData.musteri.musteri_soyad,
    e_posta: state.formData.musteri.e_posta,
    telefon_no: state.formData.musteri.telefon_no,
    sifre: state.formData.musteri.sifre,
  };

  state.error = validateRequired({
    Ad: payload.musteri_ad,
    Soyad: payload.musteri_soyad,
    'E-posta': payload.e_posta,
    'Telefon numarası': payload.telefon_no,
    Şifre: payload.sifre,
  });

  if (!state.error && payload.sifre !== state.formData.musteri.sifre_tekrar) {
    state.error = 'Şifre tekrar alanı eşleşmiyor.';
  }

  if (state.error) {
    render();
    return;
  }

  state.loading = true;
  render();

  try {
    const registerResult = await register('musteri', payload);
    if (registerResult.token && registerResult.user) {
      persistAuth(registerResult);
      window.location.href = getRedirectForRole('musteri');
      return;
    }

    window.location.href = loginPageHref;
  } catch (error) {
    state.loading = false;
    state.error = error.message || 'Kayıt işlemi başarısız oldu.';
    render();
  }
}

function handleSellerStep1(form) {
  const formData = new FormData(form);
  state.formData.satici = {
    ...state.formData.satici,
    sirket_adi: normalizeText(formData.get('sirket_adi')),
    vergi_no: normalizeText(formData.get('vergi_no')),
    sirket_turu: normalizeText(formData.get('sirket_turu')),
    sektor: normalizeText(formData.get('sektor')),
  };

  state.error = validateRequired({
    'Şirket adı': state.formData.satici.sirket_adi,
    'Vergi numarası': state.formData.satici.vergi_no,
    'Şirket türü': state.formData.satici.sirket_turu,
    Sektör: state.formData.satici.sektor,
  });

  if (state.error) {
    render();
    return;
  }

  navigate('seller-step-2');
}

async function handleSellerRegister(form) {
  const formData = new FormData(form);
  state.formData.satici = {
    ...state.formData.satici,
    yetkili_ad: normalizeText(formData.get('yetkili_ad')),
    yetkili_soyad: normalizeText(formData.get('yetkili_soyad')),
    e_posta: normalizeText(formData.get('e_posta')),
    telefon_no: normalizeText(formData.get('telefon_no')),
    sifre: normalizeText(formData.get('sifre')),
    sifre_tekrar: normalizeText(formData.get('sifre_tekrar')),
  };

  const payload = {
    sirket_adi: state.formData.satici.sirket_adi,
    vergi_no: state.formData.satici.vergi_no,
    sirket_turu: state.formData.satici.sirket_turu,
    sektor: state.formData.satici.sektor,
    yetkili_ad: state.formData.satici.yetkili_ad,
    yetkili_soyad: state.formData.satici.yetkili_soyad,
    e_posta: state.formData.satici.e_posta,
    telefon_no: state.formData.satici.telefon_no,
    sifre: state.formData.satici.sifre,
  };

  state.error = validateRequired({
    'Şirket adı': payload.sirket_adi,
    'Vergi numarası': payload.vergi_no,
    'Şirket türü': payload.sirket_turu,
    Sektör: payload.sektor,
    'Yetkili adı': payload.yetkili_ad,
    'Yetkili soyadı': payload.yetkili_soyad,
    'Kurumsal e-posta': payload.e_posta,
    'İletişim numarası': payload.telefon_no,
    Şifre: payload.sifre,
  });

  if (!state.error && payload.sifre !== state.formData.satici.sifre_tekrar) {
    state.error = 'Şifre tekrar alanı eşleşmiyor.';
  }

  if (state.error) {
    render();
    return;
  }

  state.loading = true;
  render();

  try {
    const registerResult = await register('satici', payload);
    if (registerResult.token && registerResult.user) {
      persistAuth(registerResult);
      window.location.href = getRedirectForRole('satici');
      return;
    }

    window.location.href = loginPageHref;
  } catch (error) {
    state.loading = false;
    state.error = error.message || 'Kayıt işlemi başarısız oldu.';
    render();
  }
}

document.addEventListener('click', (event) => {
  const viewTrigger = event.target.closest('[data-view]');
  if (viewTrigger) {
    navigate(viewTrigger.dataset.view);
    return;
  }

  if (event.target.closest('#home-link') || event.target.closest('#mobile-home-link')) {
    event.preventDefault();
    state.formData.musteri = {
      musteri_ad: '',
      musteri_soyad: '',
      e_posta: '',
      telefon_no: '',
      sifre: '',
      sifre_tekrar: '',
    };
    state.formData.satici = {
      sirket_adi: '',
      vergi_no: '',
      sirket_turu: '',
      sektor: '',
      yetkili_ad: '',
      yetkili_soyad: '',
      e_posta: '',
      telefon_no: '',
      sifre: '',
      sifre_tekrar: '',
    };
    navigate('selection');
  }
});

document.addEventListener('submit', (event) => {
  if (!['customer-form', 'seller-form-1', 'seller-form-2'].includes(event.target.id)) return;

  event.preventDefault();

  if (event.target.id === 'customer-form') {
<<<<<<< HEAD
    alert('Musteri kaydiniz basariyla olusturuldu!');
    window.location.href = loginPageHref;
=======
    handleCustomerRegister(event.target);
>>>>>>> 9d9abfa (login ve registration ekranlarının backend bağlantısı yapıldı)
    return;
  }

  if (event.target.id === 'seller-form-1') {
    handleSellerStep1(event.target);
    return;
  }

<<<<<<< HEAD
  if (event.target.id === 'seller-form-2') {
    alert('Satici kaydiniz basariyla alindi. Onay sureciniz baslatildi.');
    window.location.href = loginPageHref;
  }
=======
  handleSellerRegister(event.target);
>>>>>>> 9d9abfa (login ve registration ekranlarının backend bağlantısı yapıldı)
});

document.addEventListener('DOMContentLoaded', () => {
  if (redirectAuthenticated(getRedirectForRole('satici'), 'satici')) return;
  if (redirectAuthenticated(getRedirectForRole('musteri'), 'musteri')) return;
  render();
});
