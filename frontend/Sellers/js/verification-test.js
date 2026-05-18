/* ============================================================
 * Doğrulama Testi · SPA görünümü (Sellers/index.html içinde)
 *  - renderVerificationTest()  → #dashboard-root içine render eder
 *  - 4 alt görünüm: intro → test → analyzing → result
 *  - localStorage:
 *      leafpay_verification_draft   (partial cevap + section index)
 *      leafpay_verification_result  (final, sadece submit sonrası)
 *  - Final submit edilmeden rozet/tier/skor görünmez
 * ============================================================ */

const VT_DRAFT_KEY  = "leafpay_verification_draft";
const VT_RESULT_KEY = "leafpay_verification_result";

function _vtAuthHeader() {
  const token = (typeof getAuthState === "function") ? (getAuthState().token || "") : "";
  return "Bearer " + token;
}

async function _vtApi(path, opts) {
  try {
    const base = typeof getApiBaseUrl === "function" ? getApiBaseUrl() : "";
    const res = await fetch(base + path, Object.assign({ headers: {
      "Authorization": _vtAuthHeader(), "Content-Type": "application/json",
    } }, opts));
    if (!res.ok) return null;
    return await res.json();
  } catch (e) { return null; }
}

let _vtDraftTimer = null;

/* ─────────── DATA ───────────
 * COMMON_SECTIONS: tüm sektörlere sorulur, sırayla
 * SECTOR_SECTIONS: profile.sector cevabına göre sona eklenir
 * vtGetActiveSections() → ortak + sektör spesifik birleşik, no field otomatik
 * --------------------------------------------- */

const COMMON_SECTIONS = [
  {
    id: "profile", title: "Şirket Profili", meta: "4 soru",
    questions: [
      {
        id: "sector", type: "radio",
        text: "Hangi sektörde faaliyet gösteriyorsunuz?",
        hint: "Seçtiğin sektöre özel ek bir bölüm açılır.",
        options: [
          { value: "tekstil",    label: "Tekstil & Hazır Giyim", desc: "Konfeksiyon, dokuma, deri" },
          { value: "gida",       label: "Gıda & İçecek", desc: "Üretim, ambalajlama, dağıtım" },
          { value: "ev",         label: "Ev & Yaşam", desc: "Mobilya, mutfak, dekor" },
          { value: "kozmetik",   label: "Kozmetik & Kişisel Bakım" },
          { value: "elektronik", label: "Elektronik" },
          { value: "diger",      label: "Diğer" },
        ],
        // dallandırma sorusu — eşit puan (sektör seçimi puanı etkilemez)
        scoreMap: { tekstil: 5, gida: 5, ev: 5, kozmetik: 5, elektronik: 5, diger: 5 },
      },
      {
        id: "company_size", type: "radio",
        text: "Şirketinizin büyüklüğü?",
        hint: "Daha büyük şirketlerden daha katı kriterler beklenir.",
        options: [
          { value: "micro",  label: "1 – 10 kişi", desc: "Mikro işletme" },
          { value: "small",  label: "11 – 50 kişi", desc: "Küçük ölçekli" },
          { value: "medium", label: "51 – 250 kişi", desc: "Orta ölçekli" },
          { value: "large",  label: "251+ kişi", desc: "Büyük ölçekli" },
        ],
        scoreMap: { micro: 4, small: 6, medium: 8, large: 10 },
      },
      {
        id: "sustain_yrs", type: "scale",
        text: "Sürdürülebilirlik uygulamalarına ne kadar süredir yatırım yapıyorsunuz?",
        hint: "Yıl bazında ortalama.",
        scale: { min: 1, max: 5, leftLabel: "0–1 yıl", rightLabel: "5+ yıl" },
        scoreMap: { 1: 2, 2: 4, 3: 6, 4: 8, 5: 10 },
      },
      {
        id: "sustain_team", type: "radio",
        text: "Sürdürülebilirlikten sorumlu özel bir ekibiniz var mı?",
        options: [
          { value: "team",    label: "Ayrı bir sürdürülebilirlik ekibi var", desc: "Tam zamanlı, en az 2 kişi" },
          { value: "role",    label: "Tam zamanlı bir sorumlu var" },
          { value: "partime", label: "Diğer roller yarı zamanlı yürütüyor" },
          { value: "no",      label: "Henüz yok" },
        ],
        scoreMap: { team: 10, role: 7, partime: 4, no: 1 },
      },
    ],
  },

  {
    id: "energy", title: "Enerji & Operasyon", meta: "4 soru",
    questions: [
      {
        id: "renewable_share", type: "scale",
        text: "Operasyonunuzdaki yenilenebilir enerji oranı?",
        hint: "Toplam elektrik tüketiminizin yenilenebilir kaynaklı yüzdesi.",
        scale: { min: 1, max: 5, leftLabel: "%0–10", rightLabel: "%75+" },
        scoreMap: { 1: 1, 2: 3, 3: 5, 4: 8, 5: 10 },
      },
      {
        id: "own_generation", type: "radio",
        text: "Kendi yenilenebilir enerji üretiminiz var mı? (GES/RES/biyokütle)",
        options: [
          { value: "lic_full",    label: "Lisanslı tesis (ihtiyacın çoğunu karşılar)" },
          { value: "lic_partial", label: "Çatı GES / kısmi karşılama" },
          { value: "planned",     label: "Yatırım planımız onaylandı" },
          { value: "no",          label: "Henüz yok" },
        ],
        scoreMap: { lic_full: 10, lic_partial: 7, planned: 3, no: 0 },
      },
      {
        id: "iso_50001", type: "radio",
        text: "ISO 50001 (Enerji Yönetim Sistemi) sertifikanız var mı?",
        options: [
          { value: "yes",         label: "Sertifikalı + aktif izleme", desc: "TÜRKAK akredite" },
          { value: "in_progress", label: "Süreç devam ediyor" },
          { value: "no",          label: "Hayır" },
        ],
        scoreMap: { yes: 10, in_progress: 5, no: 0 },
      },
      {
        id: "energy_tracking", type: "radio",
        text: "Enerji tüketiminizi nasıl takip ediyorsunuz?",
        options: [
          { value: "realtime", label: "Gerçek zamanlı sayaç + dashboard" },
          { value: "monthly",  label: "Aylık fatura bazlı izleme" },
          { value: "annual",   label: "Sadece yıllık özet" },
          { value: "no",       label: "Sistemli takip yok" },
        ],
        scoreMap: { realtime: 10, monthly: 6, annual: 3, no: 0 },
      },
    ],
  },

  {
    id: "packaging", title: "Ambalaj & Tedarik", meta: "4 soru",
    questions: [
      {
        id: "pack_material", type: "multi",
        text: "Hangi ambalaj malzemelerini kullanıyorsunuz?",
        hint: "Birden fazla seçebilirsiniz.",
        options: [
          { value: "fsc_karton",          label: "FSC sertifikalı karton", desc: "En çok puan getiren seçenek" },
          { value: "gd_karton",           label: "Geri dönüşümlü karton" },
          { value: "biyo_plastik",        label: "Biyo-plastik / kompostlanabilir" },
          { value: "gd_plastik",          label: "Geri dönüşümlü plastik" },
          { value: "tek_kullan_plastik",  label: "Tek kullanımlık plastik" },
          { value: "cam",                 label: "Cam" },
        ],
        scoreMap: { fsc_karton: 5, gd_karton: 3, biyo_plastik: 4, gd_plastik: 2, tek_kullan_plastik: -3, cam: 3 },
        scoreCap: 10,
      },
      {
        id: "cardboard_ratio", type: "scale",
        text: "Sevkiyatlarınızın yaklaşık yüzde kaçı karton/biyolojik ambalaj kullanıyor?",
        scale: { min: 1, max: 5, leftLabel: "%0–20", rightLabel: "%80+" },
        scoreMap: { 1: 2, 2: 4, 3: 6, 4: 8, 5: 10 },
      },
      {
        id: "supplier_audit", type: "radio",
        text: "Ambalaj tedarikçilerinizi sürdürülebilirlik kriterleriyle denetliyor musunuz?",
        options: [
          { value: "yearly",     label: "Yıllık denetim yapıyoruz", desc: "Belge + saha ziyareti" },
          { value: "docs",       label: "Sadece belge taleple denetliyoruz" },
          { value: "occasional", label: "Ara sıra, ihtiyaç olduğunda" },
          { value: "never",      label: "Hayır, denetlemiyoruz" },
        ],
        scoreMap: { yearly: 10, docs: 6, occasional: 3, never: 0 },
      },
      {
        id: "local_supply", type: "scale",
        text: "Tedarikçilerinizin ne kadarı yurt içinde?",
        scale: { min: 1, max: 5, leftLabel: "%0–25", rightLabel: "%75+" },
        scoreMap: { 1: 2, 2: 3, 3: 5, 4: 7, 5: 9 },
      },
    ],
  },

  {
    id: "waste", title: "Atık & Döngüsellik", meta: "4 soru",
    questions: [
      {
        id: "waste_sort", type: "scale",
        text: "Operasyondaki atıklarınızın yüzde kaçı ayrıştırılarak geri dönüşüme gidiyor?",
        scale: { min: 1, max: 5, leftLabel: "%0–20", rightLabel: "%80+" },
        scoreMap: { 1: 1, 2: 3, 3: 6, 4: 8, 5: 10 },
      },
      {
        id: "takeback", type: "radio",
        text: "Müşterilere ürün/ambalaj geri alım programı sunuyor musunuz?",
        options: [
          { value: "active",  label: "Aktif geri alım + indirim/puan teşviki" },
          { value: "pilot",   label: "Pilot program çalışıyor" },
          { value: "planned", label: "Planlama aşamasında" },
          { value: "no",      label: "Henüz yok" },
        ],
        scoreMap: { active: 10, pilot: 6, planned: 3, no: 0 },
      },
      {
        id: "return_rate", type: "scale",
        text: "İade oranınız ne kadar? (düşük olması iyi, ters çevrim karbonu yüksek)",
        scale: { min: 1, max: 5, leftLabel: "%20+", rightLabel: "%2 altı" },
        scoreMap: { 1: 1, 2: 3, 3: 5, 4: 8, 5: 10 },
      },
      {
        id: "circular_practice", type: "multi",
        text: "Hangi döngüsel ekonomi uygulamalarını kullanıyorsunuz?",
        hint: "Uygulanan tüm yöntemleri seçin.",
        options: [
          { value: "repair",    label: "Tamir / yenileme hizmeti" },
          { value: "resale",    label: "İkinci el satış kanalı" },
          { value: "refill",    label: "Dolum/yeniden kullanım sistemi" },
          { value: "modular",   label: "Modüler tasarım (parça değişimi)" },
          { value: "rental",    label: "Kiralama modeli" },
          { value: "none",      label: "Henüz uygulanmıyor" },
        ],
        scoreMap: { repair: 3, resale: 3, refill: 3, modular: 3, rental: 3, none: 0 },
        scoreCap: 10,
      },
    ],
  },

  {
    id: "logistics", title: "Lojistik & Kargo", meta: "3 soru",
    questions: [
      {
        id: "cargo_type", type: "multi",
        text: "Hangi kargo seçeneklerini sunuyorsunuz?",
        options: [
          { value: "carbon_neutral", label: "Karbon nötr kargo (sertifikalı)" },
          { value: "consolidated",   label: "Toplu / konsolide teslimat" },
          { value: "next_day",       label: "Ertesi gün ekspres" },
          { value: "same_day",       label: "Aynı gün teslimat" },
          { value: "pickup",         label: "Kargo noktasından teslim alma" },
        ],
        scoreMap: { carbon_neutral: 4, consolidated: 4, pickup: 3, next_day: 0, same_day: -1 },
        scoreCap: 10,
      },
      {
        id: "cargo_partners", type: "multi",
        text: "Hangi kargo firmalarıyla çalışıyorsunuz?",
        options: [
          { value: "aras",  label: "Aras Kargo" },
          { value: "mng",   label: "MNG" },
          { value: "yk",    label: "Yurtiçi Kargo" },
          { value: "ups",   label: "UPS" },
          { value: "ptt",   label: "PTT" },
          { value: "gepps", label: "Gepps · Yeşil filo" },
        ],
        scoreMap: { gepps: 4, aras: 1, mng: 1, yk: 1, ups: 1, ptt: 1 },
        scoreCap: 6,
      },
      {
        id: "route_optim", type: "radio",
        text: "Sevkiyat rotalarınızı optimize ediyor musunuz?",
        options: [
          { value: "ai",      label: "AI tabanlı rota optimizasyonu kullanıyoruz" },
          { value: "manual",  label: "Manuel olarak haftalık planlıyoruz" },
          { value: "partner", label: "Kargo firması yönetiyor" },
          { value: "no",      label: "Hayır" },
        ],
        scoreMap: { ai: 9, manual: 5, partner: 3, no: 0 },
      },
    ],
  },

  {
    id: "carbon", title: "Karbon İzlemesi", meta: "3 soru",
    questions: [
      {
        id: "carbon_track", type: "radio",
        text: "Karbon ayak izinizi ne sıklıkla ölçüyorsunuz?",
        options: [
          { value: "monthly",   label: "Aylık olarak otomatik takip" },
          { value: "quarterly", label: "Çeyreklik raporluyoruz" },
          { value: "yearly",    label: "Yıllık ölçüyoruz" },
          { value: "rarely",    label: "Henüz sistemli ölçüm yok" },
        ],
        scoreMap: { monthly: 10, quarterly: 7, yearly: 4, rarely: 1 },
      },
      {
        id: "co2_target", type: "scale",
        text: "Yıllık karbon azaltma hedefiniz var mı? Ne kadar?",
        scale: { min: 1, max: 5, leftLabel: "Hedef yok", rightLabel: "%20+ /yıl" },
        scoreMap: { 1: 1, 2: 3, 3: 6, 4: 8, 5: 10 },
      },
      {
        id: "offset", type: "multi",
        text: "Karbon dengeleme stratejiniz?",
        hint: "Uyguladığınız tüm yöntemleri seçin.",
        options: [
          { value: "renewable", label: "Yenilenebilir enerji satın alma" },
          { value: "tree",      label: "Ağaçlandırma ortaklığı" },
          { value: "credits",   label: "Sertifikalı karbon kredisi" },
          { value: "inhouse",   label: "İç süreçleri optimize etme" },
          { value: "none",      label: "Henüz dengeleme yok" },
        ],
        scoreMap: { renewable: 4, tree: 3, credits: 3, inhouse: 2, none: 0 },
        scoreCap: 8,
      },
    ],
  },

  {
    id: "social", title: "Sosyal & Şeffaflık", meta: "4 soru",
    questions: [
      {
        id: "wage_policy", type: "radio",
        text: "Çalışan ücret politikanız nedir?",
        hint: "Tüm çalışanlar — tedarikçiler dahil.",
        options: [
          { value: "living",    label: "Yaşam ücreti politikası uyguluyoruz", desc: "Asgari ücretin belirgin üstü" },
          { value: "above_min", label: "Asgari ücretin üstünde ödüyoruz" },
          { value: "min",       label: "Sadece asgari ücret" },
          { value: "unknown",   label: "Bu yönde özel bir politikamız yok" },
        ],
        scoreMap: { living: 10, above_min: 7, min: 3, unknown: 0 },
      },
      {
        id: "supplier_code", type: "radio",
        text: "Tedarikçiler için bir Davranış Kuralları (Code of Conduct) belgeniz var mı?",
        options: [
          { value: "signed",     label: "Tüm tedarikçiler imzalı + denetim yapılıyor" },
          { value: "shared",     label: "Belge var, paylaşıyoruz ama denetim yok" },
          { value: "draft",      label: "Taslak hazırlanıyor" },
          { value: "no",         label: "Henüz yok" },
        ],
        scoreMap: { signed: 10, shared: 6, draft: 3, no: 0 },
      },
      {
        id: "public_report", type: "radio",
        text: "Kamuya açık sürdürülebilirlik raporu yayınlıyor musunuz?",
        hint: "GRI / SASB / TSRS gibi standartlara uygun.",
        options: [
          { value: "annual_std", label: "Yıllık, standart uyumlu rapor yayınlıyoruz" },
          { value: "annual",     label: "Yıllık iç rapor (kamuya açık değil)" },
          { value: "rare",       label: "Düzensiz / ara sıra" },
          { value: "no",         label: "Hayır" },
        ],
        scoreMap: { annual_std: 10, annual: 5, rare: 2, no: 0 },
      },
      {
        id: "third_party_audit", type: "radio",
        text: "Sürdürülebilirlik verileriniz bağımsız 3. taraf doğrulamasından geçiyor mu?",
        options: [
          { value: "full",    label: "Tam doğrulama (akredite kuruluş, yıllık)" },
          { value: "partial", label: "Bazı verilerimiz doğrulanıyor" },
          { value: "planned", label: "Planlama aşamasında" },
          { value: "no",      label: "Hayır" },
        ],
        scoreMap: { full: 10, partial: 6, planned: 3, no: 0 },
      },
    ],
  },

  {
    id: "documents", title: "Belge Yükleme", meta: "6 belge",
    questions: [
      { id: "doc_irec", type: "file", docTier: 2,
        text: "I-REC Sertifikası",
        hint: "Yenilenebilir enerji kayıt sertifikası — Tier 2'nin kapısını açar.",
        placeholder: "I-REC sertifikası", optional: true },
      { id: "doc_iso14001", type: "file", docTier: 2,
        text: "ISO 14001 — Çevre Yönetim Sistemi",
        hint: "TÜRKAK veya eşdeğer akredite kurum onaylı — Tier 2'nin kapısını açar.",
        placeholder: "ISO 14001 sertifikası", optional: true },
      { id: "doc_iso14064", type: "file", docTier: 2,
        text: "Kurumsal Karbon Ayak İzi Raporu (ISO 14064-1)",
        hint: "Bağımsız doğrulanmış karbon raporu — Tier 2'nin kapısını açar.",
        placeholder: "ISO 14064-1 raporu", optional: true },
      { id: "doc_sbti", type: "file", docTier: 3,
        text: "SBTi Onay Mektubu",
        hint: "Science Based Targets initiative resmi onayı — Tier 3'ün kapısını açar.",
        placeholder: "SBTi onay mektubu", optional: true },
      { id: "doc_pas2060", type: "file", docTier: 3,
        text: "Karbon Nötr / Net Sıfır Sertifikası (PAS 2060 / ISO 14068)",
        hint: "Karbon nötrlük beyanı sertifikası — Tier 3'ün kapısını açar.",
        placeholder: "PAS 2060 / ISO 14068 sertifikası", optional: true },
      { id: "doc_cdp", type: "file", docTier: 3,
        text: "CDP İklim Değişikliği Skoru (A veya A-)",
        hint: "Carbon Disclosure Project resmi A/A- belgesi — Tier 3'ün kapısını açar.",
        placeholder: "CDP skor belgesi", optional: true },
    ],
  },
];

const SECTOR_SECTIONS = {
  tekstil: {
    id: "sector_tekstil", title: "Tekstil-Spesifik Kontroller", meta: "3 soru",
    questions: [
      {
        id: "chemical_program", type: "radio",
        text: "Kimyasal yönetim programınız var mı? (ZDHC / OEKO-TEX)",
        hint: "Tekstilde tehlikeli madde sıfırlama standartları.",
        options: [
          { value: "zdhc_oeko", label: "Her ikisinde de aktifiz (ZDHC + OEKO-TEX)" },
          { value: "one",       label: "Bunlardan birine sahibiz" },
          { value: "planning",  label: "Hazırlık sürecindeyiz" },
          { value: "no",        label: "Henüz yok" },
        ],
        scoreMap: { zdhc_oeko: 10, one: 7, planning: 3, no: 0 },
      },
      {
        id: "water_intensity", type: "scale",
        text: "Kg ürün başına su tüketiminizi takip edip azaltıyor musunuz?",
        hint: "Tekstil endüstrisinin en kritik metriği.",
        scale: { min: 1, max: 5, leftLabel: "Takip yok", rightLabel: "Hedefli + düşüş trendi" },
        scoreMap: { 1: 1, 2: 3, 3: 6, 4: 8, 5: 10 },
      },
      {
        id: "organic_ratio", type: "scale",
        text: "Organik / geri dönüşümlü hammadde (GOTS, GRS, organik pamuk) oranınız?",
        scale: { min: 1, max: 5, leftLabel: "%0–10", rightLabel: "%70+" },
        scoreMap: { 1: 1, 2: 3, 3: 5, 4: 8, 5: 10 },
      },
    ],
  },

  gida: {
    id: "sector_gida", title: "Gıda-Spesifik Kontroller", meta: "3 soru",
    questions: [
      {
        id: "animal_welfare", type: "radio",
        text: "Hayvan refahı sertifikalı kaynak kullanıyor musunuz?",
        hint: "Kafes-siz, hormonsuz, RSPCA / Cage-Free vb.",
        options: [
          { value: "full",    label: "Tüm hayvansal ürünler sertifikalı" },
          { value: "partial", label: "Belirli ürünlerde sertifikalı" },
          { value: "na",      label: "Vegan / hayvansal ürün yok" },
          { value: "no",      label: "Sertifika kullanmıyoruz" },
        ],
        scoreMap: { full: 10, partial: 6, na: 10, no: 0 },
      },
      {
        id: "organic_food", type: "scale",
        text: "Organik sertifikalı ürünlerinizin (toplam içindeki) oranı?",
        scale: { min: 1, max: 5, leftLabel: "%0–10", rightLabel: "%70+" },
        scoreMap: { 1: 1, 2: 3, 3: 5, 4: 8, 5: 10 },
      },
      {
        id: "food_waste", type: "radio",
        text: "Gıda israfını azaltmak için aktif bir programınız var mı?",
        options: [
          { value: "donation",   label: "Bağış + raf ömrü optimizasyonu + ölçüm" },
          { value: "donation_only", label: "Sadece bağış yapıyoruz" },
          { value: "internal",   label: "İç süreçlerde optimize ediyoruz" },
          { value: "no",         label: "Henüz yok" },
        ],
        scoreMap: { donation: 10, donation_only: 6, internal: 4, no: 0 },
      },
    ],
  },

  ev: {
    id: "sector_ev", title: "Ev & Yaşam-Spesifik Kontroller", meta: "3 soru",
    questions: [
      {
        id: "durability_design", type: "radio",
        text: "Ürünlerinizi uzun ömürlü tasarlıyor musunuz?",
        hint: "Modüler parça, dayanıklı malzeme, garanti süresi.",
        options: [
          { value: "designed",  label: "Uzun ömür kriteri ile tasarlanıyor + 5+ yıl garanti" },
          { value: "warranty",  label: "Standart üstü garanti veriyoruz (3-5 yıl)" },
          { value: "standard",  label: "Yasal asgari garanti" },
          { value: "no",        label: "Özel bir politikamız yok" },
        ],
        scoreMap: { designed: 10, warranty: 7, standard: 3, no: 0 },
      },
      {
        id: "repair_program", type: "radio",
        text: "Müşterilere tamir hizmeti / yedek parça temini sunuyor musunuz?",
        options: [
          { value: "in_house", label: "Kendi tamir merkezimiz + parça stoğumuz var" },
          { value: "network",  label: "Anlaşmalı tamir ağı kullanıyoruz" },
          { value: "parts",    label: "Sadece yedek parça satıyoruz" },
          { value: "no",       label: "Hayır" },
        ],
        scoreMap: { in_house: 10, network: 7, parts: 5, no: 0 },
      },
      {
        id: "origin_trace", type: "radio",
        text: "Hammadde menşeini ürün bazında izleyebiliyor musunuz?",
        options: [
          { value: "full",    label: "Tüm hammaddeler için tedarik zinciri izlenebilir" },
          { value: "primary", label: "Ana malzemeler (ahşap, metal) için izlenebilir" },
          { value: "partial", label: "Sınırlı ürünlerde" },
          { value: "no",      label: "İzlenemiyor" },
        ],
        scoreMap: { full: 10, primary: 7, partial: 4, no: 0 },
      },
    ],
  },

  kozmetik: {
    id: "sector_kozmetik", title: "Kozmetik-Spesifik Kontroller", meta: "3 soru",
    questions: [
      {
        id: "cruelty_free", type: "radio",
        text: "Hayvan deneyi politikanız nedir?",
        hint: "Cruelty-Free / Leaping Bunny / PETA sertifikalarına dikkat.",
        options: [
          { value: "certified", label: "Leaping Bunny / PETA sertifikalıyız" },
          { value: "policy",    label: "Hayvan deneyi yapmama politikamız var" },
          { value: "legal",     label: "Sadece yasal zorunluluk olan pazarlarda" },
          { value: "yes",       label: "Yapıyoruz" },
        ],
        scoreMap: { certified: 10, policy: 7, legal: 3, yes: 0 },
      },
      {
        id: "microplastic_free", type: "radio",
        text: "Ürünlerinizde mikro-plastik kullanımı?",
        options: [
          { value: "free_certified", label: "Tüm ürünler mikro-plastik içermiyor (sertifikalı)" },
          { value: "free_policy",    label: "Kullanmıyoruz (sertifika yok)" },
          { value: "phasing",        label: "Kademeli olarak çıkarıyoruz" },
          { value: "yes",            label: "Hâlâ kullanıyoruz" },
        ],
        scoreMap: { free_certified: 10, free_policy: 7, phasing: 4, yes: 0 },
      },
      {
        id: "refill_program", type: "radio",
        text: "Dolum / yeniden kullanım programınız var mı?",
        options: [
          { value: "wide",   label: "Geniş ürün yelpazesinde dolum noktaları" },
          { value: "select", label: "Seçili ürünlerde dolum" },
          { value: "pilot",  label: "Pilot dönemde" },
          { value: "no",     label: "Yok" },
        ],
        scoreMap: { wide: 10, select: 7, pilot: 3, no: 0 },
      },
    ],
  },

  elektronik: {
    id: "sector_elektronik", title: "Elektronik-Spesifik Kontroller", meta: "3 soru",
    questions: [
      {
        id: "ewaste", type: "radio",
        text: "E-atık geri toplama programınız var mı?",
        hint: "Kullanım ömrü dolan elektronik için.",
        options: [
          { value: "active_inc", label: "Aktif toplama + indirim/puan teşviki" },
          { value: "active",     label: "Toplama noktaları var (teşvik yok)" },
          { value: "partner",    label: "Üçüncü taraf çözüm ortağı kullanıyoruz" },
          { value: "no",         label: "Yok" },
        ],
        scoreMap: { active_inc: 10, active: 7, partner: 5, no: 0 },
      },
      {
        id: "repairability", type: "scale",
        text: "Ürünlerinizin tamir edilebilirlik skoru? (Fransa Repairability Index benzeri)",
        hint: "Modüler tasarım, yedek parça erişimi, tamir kılavuzu.",
        scale: { min: 1, max: 5, leftLabel: "Düşük", rightLabel: "Çok yüksek" },
        scoreMap: { 1: 1, 2: 3, 3: 5, 4: 8, 5: 10 },
      },
      {
        id: "energy_label_ratio", type: "scale",
        text: "Yüksek enerji verimliliği (A / A+) etiketli ürün oranınız?",
        scale: { min: 1, max: 5, leftLabel: "%0–20", rightLabel: "%80+" },
        scoreMap: { 1: 1, 2: 3, 3: 5, 4: 8, 5: 10 },
      },
    ],
  },
};

/* aktif sectionları döner: ortak + (varsa) seçili sektörün spesifik bölümü.
 * `no` field otomatik atanır (01, 02, ...). */
function vtGetActiveSections() {
  const list = COMMON_SECTIONS.slice();
  const sector = vtState && vtState.answers && vtState.answers.sector;
  if (sector && SECTOR_SECTIONS[sector]) {
    list.push(SECTOR_SECTIONS[sector]);
  }
  return list.map((s, i) => Object.assign({}, s, { no: String(i + 1).padStart(2, "0") }));
}

function vtGetTotalQuestions() {
  return vtGetActiveSections().reduce((a, s) => a + s.questions.length, 0);
}

/* qid'den soru başlığı bulur — common + tüm sector'ları tarar (stale answers için). */
function vtFindQuestionTitle(qid) {
  for (let i = 0; i < COMMON_SECTIONS.length; i++) {
    const qs = COMMON_SECTIONS[i].questions;
    for (let j = 0; j < qs.length; j++) if (qs[j].id === qid) return qs[j].text;
  }
  const keys = Object.keys(SECTOR_SECTIONS);
  for (let k = 0; k < keys.length; k++) {
    const qs = SECTOR_SECTIONS[keys[k]].questions;
    for (let j = 0; j < qs.length; j++) if (qs[j].id === qid) return qs[j].text;
  }
  return qid;
}

const VT_ANALYZING_TASKS = [
  { label: "Cevap matrisi oluşturuluyor", ms: 700 },
  { label: "Yüklenen belgeler işleniyor (OCR)", ms: 1100 },
  { label: "Cevap-belge çapraz kontrol", ms: 1500 },
  { label: "Sektör benchmark karşılaştırma", ms: 900 },
  { label: "Manipülasyon ve tutarlılık kontrolü", ms: 1100 },
  { label: "Skor hesaplanıyor", ms: 600 },
];

const vtState = {
  view: "intro",
  answers: {},
  secIdx: 0,
  shake: false,
  result: null,
};

/* ─────────── HELPERS ─────────── */
function vtLoadDraft() {
  try {
    const raw = localStorage.getItem(VT_DRAFT_KEY);
    if (!raw) {
      vtState.answers = {};
      vtState.secIdx  = 0;
    } else {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        vtState.answers = parsed.answers || {};
        vtState.secIdx  = Number.isInteger(parsed.secIdx) ? parsed.secIdx : 0;
      }
    }
  } catch (e) {
    vtState.answers = {};
    vtState.secIdx  = 0;
  }
  // Sync from server; server data takes precedence over stale localStorage cache
  _vtApi("/satici/rozet").then((data) => {
    if (!data || !data.taslak) return;
    const draft = data.taslak;
    vtState.answers = draft.cevaplar || {};
    vtState.secIdx  = typeof draft.aktif_bolum_idx === "number" ? draft.aktif_bolum_idx : 0;
    try {
      localStorage.setItem(VT_DRAFT_KEY, JSON.stringify({
        status: "draft", answers: vtState.answers, secIdx: vtState.secIdx,
        updatedAt: new Date().toISOString(),
      }));
    } catch (e) { /* ignore */ }
    vtRender();
  });
}

function vtSaveDraft() {
  try {
    localStorage.setItem(VT_DRAFT_KEY, JSON.stringify({
      status: "draft",
      answers: vtState.answers,
      secIdx: vtState.secIdx,
      updatedAt: new Date().toISOString(),
    }));
  } catch (e) { /* ignore */ }
  clearTimeout(_vtDraftTimer);
  _vtDraftTimer = setTimeout(() => {
    _vtApi("/satici/rozet/draft", {
      method: "POST",
      body: JSON.stringify({
        cevaplar: vtState.answers,
        aktif_bolum_idx: vtState.secIdx,
        sektor: vtState.answers.sector || null,
      }),
    });
  }, 1500);
}

function vtClearDraft() {
  try { localStorage.removeItem(VT_DRAFT_KEY); } catch (e) { /* ignore */ }
  _vtApi("/satici/rozet/draft", { method: "DELETE" });
}

function vtAnsweredCount() {
  let n = 0;
  vtGetActiveSections().forEach((s) => s.questions.forEach((q) => {
    const v = vtState.answers[q.id];
    if (v != null && v !== "" && !(Array.isArray(v) && v.length === 0)) n++;
  }));
  return n;
}

function vtSectionAnsweredCount(sec) {
  return sec.questions.filter((q) => {
    const v = vtState.answers[q.id];
    return v != null && v !== "" && !(Array.isArray(v) && v.length === 0);
  }).length;
}

function vtIsSectionDone(sIdx) {
  const sec = vtGetActiveSections()[sIdx];
  return sec.questions.every((q) => {
    if (q.type === "file" && q.optional) return true;
    const v = vtState.answers[q.id];
    return v != null && v !== "" && !(Array.isArray(v) && v.length === 0);
  });
}

function vtCalculateScore(answers) {
  let raw = 0;
  let maxRaw = 0;
  const breakdown = [];

  vtGetActiveSections().forEach((section) => {
    let secRaw = 0;
    let secMax = 0;
    section.questions.forEach((q) => {
      const ans = answers[q.id];
      let qMax = 10;
      let qScore = 0;

      if (q.type === "radio") {
        const map = q.scoreMap || {};
        qMax = Math.max(...Object.values(map));
        if (ans != null) qScore = map[ans] || 0;
      } else if (q.type === "multi") {
        const map = q.scoreMap || {};
        qMax = q.scoreCap || Math.max(...Object.values(map));
        if (Array.isArray(ans)) {
          qScore = ans.reduce((a, k) => a + (map[k] || 0), 0);
          qScore = Math.max(0, Math.min(qMax, qScore));
        }
      } else if (q.type === "scale") {
        const map = q.scoreMap || {};
        qMax = Math.max(...Object.values(map));
        if (ans != null) qScore = map[ans] || 0;
      } else if (q.type === "number") {
        qMax = 5;
        if (ans != null && ans !== "") qScore = 5;
      } else if (q.type === "file") {
        qMax = q.score || 6;
        if (ans) qScore = qMax;
      }
      secRaw += qScore;
      secMax += qMax;
    });
    raw += secRaw;
    maxRaw += secMax;
    breakdown.push({
      id: section.id, title: section.title,
      score: secRaw, max: secMax,
      pct: secMax ? Math.round((secRaw / secMax) * 100) : 0,
    });
  });

  const normalized = maxRaw ? Math.round((raw / maxRaw) * 100) : 0;
  let tier = 0;
  if (normalized >= 85) tier = 3;
  else if (normalized >= 65) tier = 2;
  else if (normalized >= 40) tier = 1;
  return { score: normalized, tier, breakdown };
}

function vtBuildBadgeId() {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const year = new Date().getFullYear();
  let prefix = "STR";
  try {
    const company = (localStorage.getItem("leafpay_company") || "").replace(/[^A-Za-zÇĞİÖŞÜçğıöşü]/g, "");
    if (company) prefix = company.slice(0, 3).toUpperCase();
  } catch (e) { /* ignore */ }
  return `LP-TR-${year}-${prefix}-${rand}`;
}

function vtIsoDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function vtEscapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function vtBackToBadge() {
  if (typeof renderBadgeStatus === "function") {
    renderBadgeStatus();
    document.querySelectorAll("[data-nav]").forEach((l) => l.classList.remove("active"));
    const link = document.querySelector('[data-nav="rozet-durumu"]');
    if (link) link.classList.add("active");
    if (typeof applyCompanyInfo === "function") applyCompanyInfo();
  }
}

/* ─────────── PUBLIC ENTRY ─────────── */
function renderVerificationTest(opts) {
  const reset = opts && opts.reset === true;
  if (reset) {
    vtState.answers = {};
    vtState.secIdx  = 0;
    vtState.result  = null;
    vtClearDraft();
  } else {
    vtLoadDraft();
  }
  vtState.view = "intro";
  vtRender();
}

function vtRender() {
  const root = document.getElementById("dashboard-root");
  if (!root) return;
  // sektör değişince section sayısı değişebilir → secIdx'i clamp et
  const activeLen = vtGetActiveSections().length;
  if (vtState.secIdx >= activeLen) vtState.secIdx = Math.max(0, activeLen - 1);
  if (vtState.secIdx < 0) vtState.secIdx = 0;
  if (vtState.view === "intro")     return vtRenderIntro(root);
  if (vtState.view === "test")      return vtRenderTest(root);
  if (vtState.view === "analyzing") return vtRenderAnalyzing(root);
  if (vtState.view === "result")    return vtRenderResult(root);
}

/* ─────────── INTRO ─────────── */
function vtRenderIntro(root) {
  const draftExists = vtAnsweredCount() > 0;
  root.innerHTML = `
    <div class="vt-body">
      <div class="mb-6">
        <button class="vt-back-btn" data-vt-back>
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Rozet durumuna dön
        </button>
      </div>

      <div class="text-center mb-10">
        <span class="vt-pill-mono mb-5"><span class="w-1.5 h-1.5 rounded-full bg-leaf-500 animate-pulse"></span>AI Doğrulama Testi · v2.4</span>
        <h1 class="text-[2.4rem] lg:text-[2.9rem] font-black text-leaf-900 tracking-tight leading-[1.05] mt-4">Rozet doğrulama testi</h1>
        <p class="mt-4 text-leaf-800/70 text-base max-w-xl mx-auto">${vtGetActiveSections().length} bölümden oluşan ${vtGetTotalQuestions()} soruluk değerlendirme. AI, cevaplarını yüklediğin belgelerle çapraz kontrol edip rozet seviyeni belirler.</p>
      </div>

      <div class="grid sm:grid-cols-3 gap-3 mb-8">
        <div class="bg-white border border-leaf-100 rounded-2xl p-4 text-center">
          <div class="vt-eyebrow">Süre</div>
          <div class="vt-metric-num text-2xl mt-1">~18 dk</div>
          <div class="text-[11px] text-leaf-800/60 font-mono mt-1">otomatik kaydedilir</div>
        </div>
        <div class="bg-white border border-leaf-100 rounded-2xl p-4 text-center">
          <div class="vt-eyebrow">Soru</div>
          <div class="vt-metric-num text-2xl mt-1">${vtGetTotalQuestions()}</div>
          <div class="text-[11px] text-leaf-800/60 font-mono mt-1">${vtGetActiveSections().length} bölüm · sektöre özel</div>
        </div>
        <div class="bg-white border border-leaf-100 rounded-2xl p-4 text-center">
          <div class="vt-eyebrow">Geçerlilik</div>
          <div class="vt-metric-num text-2xl mt-1">6 ay</div>
          <div class="text-[11px] text-leaf-800/60 font-mono mt-1">tekrar açılabilir</div>
        </div>
      </div>

      <div class="bg-white rounded-3xl border border-leaf-100 p-6 mb-6">
        <div class="vt-eyebrow mb-3">Bölümler</div>
        <ol class="space-y-2.5">
          ${vtGetActiveSections().map((s, i) => `
            <li class="flex items-center gap-3">
              <span class="rail-dot">${s.no}</span>
              <div class="flex-1">
                <div class="text-sm font-semibold text-leaf-900">${vtEscapeHtml(s.title)}</div>
                <div class="text-[11px] font-mono text-leaf-800/55">${vtEscapeHtml(s.meta)}</div>
              </div>
              <span class="text-[10px] font-mono text-leaf-600/70">${i === vtGetActiveSections().length - 1 ? "sonra AI doğrulama" : ""}</span>
            </li>`).join("")}
          <li class="flex items-center gap-3 pt-2 mt-2 border-t border-leaf-100">
            <span class="rail-dot" style="background:#FFFBF1;color:#C77A0F;border-color:#F1D69B;">AI</span>
            <div class="flex-1">
              <div class="text-sm font-semibold text-leaf-900">AI Doğrulama & Analiz</div>
              <div class="text-[11px] font-mono text-leaf-800/55">cevap-belge çapraz kontrol · otomatik</div>
            </div>
            <span class="text-[10px] font-mono text-amber-700">~30 sn</span>
          </li>
        </ol>
        ${vtState.answers.sector ? "" : `<p class="text-[11px] font-mono text-leaf-800/55 mt-4 pt-3 border-t border-leaf-100">+ İlk sorudaki sektör seçiminize göre 1 ek bölüm açılır (3 soru).</p>`}
      </div>

      <div class="bg-leaf-900 text-white rounded-3xl p-6 mb-8">
        <div class="vt-eyebrow text-amber-400 mb-3">Skor → Tier eşlemesi</div>
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-white/5 rounded-xl p-3 border border-white/10">
            <div class="font-mono text-[10px] text-white/55">40 – 64 puan</div>
            <div class="text-base font-bold mt-1">Tier 1</div>
            <div class="text-[10px] text-white/55 font-mono mt-0.5">Başlangıç · +20 VERA</div>
          </div>
          <div class="bg-white/5 rounded-xl p-3 border border-white/10">
            <div class="font-mono text-[10px] text-white/55">65 – 84 puan</div>
            <div class="text-base font-bold mt-1">Tier 2</div>
            <div class="text-[10px] text-white/55 font-mono mt-0.5">Onaylı · +50 VERA</div>
          </div>
          <div class="bg-leaf-500/15 rounded-xl p-3 border border-leaf-500/30">
            <div class="font-mono text-[10px] text-amber-400">85 – 100 puan</div>
            <div class="text-base font-bold mt-1">Tier 3</div>
            <div class="text-[10px] text-amber-300 font-mono mt-0.5">Doğrulanmış · +80 VERA</div>
          </div>
        </div>
        <div class="mt-3 text-[11px] text-white/55"><b class="text-amber-400">40 puan altı</b> rozetsiz statüde kalır — eksiklerini gidermen önerilir.</div>
      </div>

      <button id="vt-start" class="vt-btn-primary w-full justify-center text-base py-4">
        ${draftExists ? "Teste devam et" : "Testi başlat"}
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
  `;

  document.getElementById("vt-start").addEventListener("click", () => {
    vtState.view = "test";
    vtRender();
  });
  vtBindBackBtn();
}

/* ─────────── TEST ─────────── */
function vtRenderTest(root) {
  const section = vtGetActiveSections()[vtState.secIdx];
  const isLastSection = vtState.secIdx === vtGetActiveSections().length - 1;
  const totalA = vtAnsweredCount();
  const secA = vtSectionAnsweredCount(section);

  root.innerHTML = `
    <div class="vt-shell">
      <aside class="vt-rail">
        <div class="vt-eyebrow mb-4">Test Bölümleri</div>
        <div class="space-y-1.5">
          ${vtGetActiveSections().map((s, i) => {
            const done = vtIsSectionDone(i);
            const cls = i === vtState.secIdx ? "active" : (done ? "done" : "");
            const dotInner = (done && i !== vtState.secIdx)
              ? `<svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
              : s.no;
            return `
              <div class="rail-step ${cls}" data-rail-idx="${i}">
                <div class="rail-dot">${dotInner}</div>
                <div class="flex-1 min-w-0">
                  <div class="rail-name">${vtEscapeHtml(s.title)}</div>
                  <div class="rail-meta">${vtEscapeHtml(s.meta)}</div>
                </div>
              </div>`;
          }).join("")}
          <div class="rail-step" style="opacity:.6;pointer-events:none;">
            <div class="rail-dot" style="background:#FFFBF1;color:#C77A0F;border-color:#F1D69B;">AI</div>
            <div class="flex-1">
              <div class="rail-name">AI Doğrulama</div>
              <div class="rail-meta">otomatik</div>
            </div>
          </div>
        </div>

        <div class="mt-6 pt-5 border-t border-leaf-100">
          <div class="flex justify-between text-[11px] font-mono text-leaf-800/55 mb-2">
            <span>Toplam ilerleme</span>
            <span class="text-leaf-700 font-bold">${totalA}/${vtGetTotalQuestions()}</span>
          </div>
          <div class="vt-progress">
            <div class="vt-progress-fill" style="width:${(totalA / vtGetTotalQuestions()) * 100}%"></div>
          </div>
        </div>

        <button class="vt-back-btn mt-5" data-vt-back style="width:100%;justify-content:center;">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Rozet durumuna dön
        </button>
      </aside>

      <div class="vt-body">
        <div class="flex items-start justify-between mb-2 flex-wrap gap-2">
          <div>
            <div class="vt-eyebrow">Bölüm ${section.no} / ${vtGetActiveSections().length} · ${vtEscapeHtml(section.title)}</div>
            <h2 class="text-2xl font-black text-leaf-900 mt-1 tracking-tight">${vtEscapeHtml(section.title)}</h2>
          </div>
          <span class="vt-pill-mono">${secA}/${section.questions.length} cevaplandı</span>
        </div>

        <div class="vt-progress mt-5 mb-7">
          <div class="vt-progress-fill" style="width:${(secA / section.questions.length) * 100}%"></div>
        </div>

        <div id="vt-questions" class="space-y-5 ${vtState.shake ? "vt-shake" : ""}">
          ${section.questions.map((q, qi) => `
            <div id="q-${q.id}" class="q-card">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <div class="q-meta">Soru ${section.no}.${qi + 1}${q.optional ? " · OPSİYONEL" : ""}</div>
                  <div class="q-text">${vtEscapeHtml(q.text)}</div>
                  ${q.hint ? `<div class="q-hint">${vtEscapeHtml(q.hint)}</div>` : ""}
                </div>
              </div>
              ${vtRenderQuestion(q)}
            </div>
          `).join("")}
        </div>

        <div class="mt-8 flex flex-wrap items-center justify-between gap-3">
          <button id="vt-prev" class="vt-btn-secondary" ${vtState.secIdx === 0 ? "disabled" : ""}>
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Önceki bölüm
          </button>
          <span class="text-[11px] font-mono text-leaf-800/50">Cevapların otomatik kaydedildi</span>
          <button id="vt-next" class="vt-btn-primary">
            ${isLastSection ? "Testi gönder · AI değerlendirsin" : "Sonraki bölüm"}
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;

  vtBindTestEvents(section, isLastSection);
  vtBindBackBtn();
}

function vtRenderQuestion(q) {
  const value = vtState.answers[q.id];

  if (q.type === "radio") {
    return `
      <div class="space-y-2.5" data-q-id="${q.id}" data-q-type="radio">
        ${q.options.map((opt) => `
          <div class="opt ${value === opt.value ? "selected" : ""}" data-opt-value="${vtEscapeHtml(opt.value)}">
            <div class="opt-radio"></div>
            <div class="flex-1 min-w-0">
              <div class="opt-label">${vtEscapeHtml(opt.label)}</div>
              ${opt.desc ? `<div class="opt-desc">${vtEscapeHtml(opt.desc)}</div>` : ""}
            </div>
          </div>
        `).join("")}
      </div>`;
  }

  if (q.type === "multi") {
    const arr = Array.isArray(value) ? value : [];
    return `
      <div class="space-y-2.5" data-q-id="${q.id}" data-q-type="multi">
        ${q.options.map((opt) => `
          <div class="opt ${arr.includes(opt.value) ? "selected" : ""}" data-opt-value="${vtEscapeHtml(opt.value)}">
            <div class="opt-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
            <div class="flex-1 min-w-0">
              <div class="opt-label">${vtEscapeHtml(opt.label)}</div>
              ${opt.desc ? `<div class="opt-desc">${vtEscapeHtml(opt.desc)}</div>` : ""}
            </div>
          </div>
        `).join("")}
        <p class="text-[11px] text-leaf-800/55 font-mono pt-1">${arr.length} seçildi · birden fazla seçim yapabilirsiniz</p>
      </div>`;
  }

  if (q.type === "scale") {
    const cells = [];
    for (let i = q.scale.min; i <= q.scale.max; i++) cells.push(i);
    return `
      <div data-q-id="${q.id}" data-q-type="scale">
        <div class="scale-row">
          ${cells.map((n) => `
            <div class="scale-cell ${value === n ? "selected" : ""}" data-opt-value="${n}">
              <div class="scale-num">${n}</div>
            </div>
          `).join("")}
        </div>
        <div class="flex justify-between mt-3 text-[11px] font-mono text-leaf-800/55">
          <span>${vtEscapeHtml(q.scale.leftLabel)}</span>
          <span>${vtEscapeHtml(q.scale.rightLabel)}</span>
        </div>
      </div>`;
  }

  if (q.type === "number") {
    return `
      <div class="input-row max-w-md" data-q-id="${q.id}" data-q-type="number">
        <input type="number" min="0" placeholder="${vtEscapeHtml(q.placeholder || "")}" value="${vtEscapeHtml(value || "")}" />
        ${q.unit ? `<span class="unit">${vtEscapeHtml(q.unit)}</span>` : ""}
      </div>`;
  }

  if (q.type === "file") {
    const tierLabel = q.docTier === 2
      ? `<span class="text-[10px] font-mono font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-full">Tier 2 belgesi</span>`
      : q.docTier === 3
      ? `<span class="text-[10px] font-mono font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-1 rounded-full">Tier 3 belgesi</span>`
      : "";

    if (!value) {
      return `
        <div class="file-slot" data-q-id="${q.id}" data-q-type="file">
          <div class="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center" style="background:#E1F5EE;">
            <svg class="w-5 h-5 text-leaf-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-leaf-900">${vtEscapeHtml(q.placeholder || "Belge yükle")}</div>
            <div class="text-[11px] text-leaf-800/55 font-mono mt-0.5">PDF / PNG / JPG / WEBP · maks. 50 MB · opsiyonel</div>
          </div>
          ${tierLabel}
        </div>`;
    }

    if (value.analyzing) {
      return `
        <div class="file-slot" style="cursor:default;" data-q-id="${q.id}" data-q-type="file-analyzing">
          <div class="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center" style="background:#FBF0DC;">
            <svg class="w-5 h-5 text-amber-600 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-leaf-900">${vtEscapeHtml(value.name)}</div>
            <div class="text-[11px] text-amber-700 font-mono mt-0.5">AI belge analiz ediyor…</div>
          </div>
          ${tierLabel}
        </div>`;
    }

    const a = value.analysis || {};
    if (a.is_valid_document === true) {
      const expiredBadge = a.is_expired
        ? `<span class="text-[10px] font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded">Süresi dolmuş</span>`
        : `<span class="text-[10px] font-mono font-bold text-leaf-600 bg-leaf-50 border border-leaf-200 px-2 py-1 rounded">Geçerli ✓</span>`;
      const tierResult = a.estimated_tier
        ? `<span class="text-[10px] font-mono font-bold px-2 py-1 rounded" style="${a.estimated_tier === 3 ? "color:#7C3AED;background:#F5F3FF;border:1px solid #DDD6FE;" : "color:#1D4ED8;background:#EFF6FF;border:1px solid #BFDBFE;"}">Tier ${a.estimated_tier} ✓</span>`
        : "";
      return `
        <div class="file-slot filled" data-q-id="${q.id}" data-q-type="file">
          <div class="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center" style="background:#1D9E75;">
            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <div class="text-sm font-bold text-leaf-900">${vtEscapeHtml(a.document_type || value.name)}</div>
              ${tierResult} ${expiredBadge}
            </div>
            <div class="text-[11px] text-leaf-800/60 font-mono mt-0.5">
              ${a.company_name ? vtEscapeHtml(a.company_name) + " · " : ""}${a.issuing_body ? vtEscapeHtml(a.issuing_body) + " · " : ""}${a.expiry_date ? "Son: " + vtEscapeHtml(a.expiry_date) : ""}
            </div>
            ${a.verification_code ? `<div class="text-[10px] font-mono text-leaf-600 mt-0.5">Kod: ${vtEscapeHtml(a.verification_code)}</div>` : ""}
          </div>
          <button class="text-[10px] font-mono text-red-500 hover:text-red-700 px-2 py-1 rounded border border-red-200 hover:border-red-300 flex-shrink-0" data-q-clear="${q.id}">Kaldır</button>
        </div>`;
    }

    // Geçersiz veya hatalı belge
    return `
      <div class="file-slot filled" style="border-color:#FECACA;background:#FFF5F5;" data-q-id="${q.id}" data-q-type="file">
        <div class="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center" style="background:#FEE2E2;">
          <svg class="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-semibold text-red-800">${vtEscapeHtml(value.name)}</div>
          <div class="text-[11px] text-red-600 font-mono mt-0.5">${a.is_valid_document === false ? "Hedef belge türlerinden biri değil" : "Belge okunamadı"}</div>
        </div>
        <button class="text-[10px] font-mono text-leaf-600 hover:text-leaf-800 px-2 py-1 rounded border border-leaf-200 flex-shrink-0" data-q-clear="${q.id}">Tekrar dene</button>
      </div>`;
  }

  return "";
}

function vtBindTestEvents(section, isLastSection) {
  document.querySelectorAll("[data-rail-idx]").forEach((el) => {
    el.addEventListener("click", () => {
      vtState.secIdx = parseInt(el.dataset.railIdx, 10);
      vtSaveDraft();
      vtRender();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll("[data-q-type='radio']").forEach((wrap) => {
    const qId = wrap.dataset.qId;
    wrap.querySelectorAll(".opt").forEach((opt) => {
      opt.addEventListener("click", () => {
        vtState.answers[qId] = opt.dataset.optValue;
        vtSaveDraft();
        vtRender();
      });
    });
  });

  document.querySelectorAll("[data-q-type='multi']").forEach((wrap) => {
    const qId = wrap.dataset.qId;
    wrap.querySelectorAll(".opt").forEach((opt) => {
      opt.addEventListener("click", () => {
        const val = opt.dataset.optValue;
        const arr = Array.isArray(vtState.answers[qId]) ? vtState.answers[qId].slice() : [];
        const idx = arr.indexOf(val);
        if (idx === -1) arr.push(val);
        else arr.splice(idx, 1);
        vtState.answers[qId] = arr;
        vtSaveDraft();
        vtRender();
      });
    });
  });

  document.querySelectorAll("[data-q-type='scale']").forEach((wrap) => {
    const qId = wrap.dataset.qId;
    wrap.querySelectorAll(".scale-cell").forEach((cell) => {
      cell.addEventListener("click", () => {
        vtState.answers[qId] = parseInt(cell.dataset.optValue, 10);
        vtSaveDraft();
        vtRender();
      });
    });
  });

  document.querySelectorAll("[data-q-type='number']").forEach((wrap) => {
    const qId = wrap.dataset.qId;
    const input = wrap.querySelector("input");
    if (!input) return;
    input.addEventListener("input", () => {
      vtState.answers[qId] = input.value;
      vtSaveDraft();
    });
  });

  document.querySelectorAll("[data-q-type='file']").forEach((wrap) => {
    const qId = wrap.dataset.qId;
    wrap.addEventListener("click", () => {
      const existing = vtState.answers[qId];
      if (existing && !existing.analyzing) return; // doluysa Kaldır butonu halleder
      if (existing && existing.analyzing) return; // analiz sırasında tıklamayı engelle

      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,.jpg,.jpeg,.png,.webp";
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const sizeMB = (file.size / 1024 / 1024).toFixed(1);
        vtState.answers[qId] = { name: file.name, size: sizeMB + " MB", analyzing: true };
        vtRender();

        try {
          const token = (typeof getAuthState === "function") ? (getAuthState().token || "") : "";
          const base = typeof getApiBaseUrl === "function" ? getApiBaseUrl() : "";
          const formData = new FormData();
          formData.append("dosya", file);
          const res = await fetch(base + "/satici/rozet/belge-analiz", {
            method: "POST",
            headers: { "Authorization": "Bearer " + token },
            body: formData,
          });
          const analysis = res.ok ? await res.json() : { is_valid_document: false };
          vtState.answers[qId] = { name: file.name, size: sizeMB + " MB", analysis };
        } catch (err) {
          vtState.answers[qId] = { name: file.name, size: sizeMB + " MB", analysis: { is_valid_document: false } };
        }
        vtSaveDraft();
        vtRender();
      };
      input.click();
    });
  });

  document.querySelectorAll("[data-q-clear]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const qId = btn.dataset.qClear;
      vtState.answers[qId] = null;
      vtSaveDraft();
      vtRender();
    });
  });

  const prevBtn = document.getElementById("vt-prev");
  if (prevBtn) prevBtn.addEventListener("click", () => {
    if (vtState.secIdx > 0) {
      vtState.secIdx--;
      vtSaveDraft();
      vtRender();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  const nextBtn = document.getElementById("vt-next");
  if (nextBtn) nextBtn.addEventListener("click", () => {
    const missing = section.questions.find((q) => {
      if (q.type === "file" && q.optional) return false;
      const v = vtState.answers[q.id];
      return v == null || v === "" || (Array.isArray(v) && v.length === 0);
    });
    if (missing) {
      vtState.shake = true;
      vtRender();
      setTimeout(() => { vtState.shake = false; }, 400);
      const el = document.getElementById("q-" + missing.id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (isLastSection) {
      vtState.view = "analyzing";
      vtRender();
    } else {
      vtState.secIdx++;
      vtSaveDraft();
      vtRender();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
}

/* ─────────── ANSWER SUMMARY ─────────── */
function vtBuildAnswerSummary() {
  const lines = [];
  vtGetActiveSections().forEach((sec) => {
    lines.push(`== ${sec.title} ==`);
    sec.questions.forEach((q) => {
      const val = vtState.answers[q.id];
      if (val == null || val === "" || (Array.isArray(val) && val.length === 0)) return;
      if (q.type === "file") {
        if (val && val.analysis) {
          const a = val.analysis;
          if (a.is_valid_document) {
            lines.push(`- ${q.text}: DOĞRULANDI — ${a.document_type || "?"} | Kurum: ${a.issuing_body || "?"} | Şirket: ${a.company_name || "?"} | Son: ${a.expiry_date || "belirtilmemiş"} | Tier: ${a.estimated_tier || "?"} | Kod: ${a.verification_code || "yok"}`);
          } else {
            lines.push(`- ${q.text}: GEÇERSİZ BELGE (${val.name})`);
          }
        }
        return;
      }
      let answerStr = "";
      if (q.type === "radio" && q.options) {
        const opt = q.options.find((o) => o.value === val);
        answerStr = opt ? opt.label : String(val);
      } else if (q.type === "multi" && q.options && Array.isArray(val)) {
        answerStr = val.map((v) => { const o = q.options.find((x) => x.value === v); return o ? o.label : v; }).join(", ");
      } else if (q.type === "scale" && q.scale) {
        answerStr = `${val}/5 (${q.scale.leftLabel} → ${q.scale.rightLabel})`;
      } else {
        answerStr = String(val);
      }
      lines.push(`- ${q.text}: ${answerStr}`);
    });
  });
  return lines.join("\n");
}

/* ─────────── ANALYZING ─────────── */
function vtRenderAnalyzing(root) {
  const filesCount = Object.values(vtState.answers).filter((v) => v && v.name).length;

  // Start AI call immediately so it runs in parallel with the animation
  const _computed = vtCalculateScore(vtState.answers);
  const _aiCallPromise = _vtApi("/satici/rozet/ai-analiz", {
    method: "POST",
    body: JSON.stringify({
      cevaplar: vtState.answers,
      ozet_metin: vtBuildAnswerSummary(),
      skor: _computed.score,
      tier: _computed.tier,
      guven_skoru: _computed.score,
      kirilim: _computed.breakdown,
      sektor: vtState.answers.sector || null,
    }),
  });

  root.innerHTML = `
    <div class="vt-body" style="min-height:70vh;display:flex;flex-direction:column;justify-content:center;">
      <div class="text-center mb-10">
        <div class="relative w-32 h-32 mx-auto mb-6">
          <div class="absolute inset-0 rounded-full vt-badge-ring vt-spin-slow opacity-90"></div>
          <div class="absolute inset-[8px] rounded-full bg-leaf-500 flex items-center justify-center">
            <svg class="w-12 h-12 text-white shimmer-dot" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
            </svg>
          </div>
        </div>
        <div class="vt-eyebrow text-amber-600 mb-2">AI Değerlendirme · Süreç #${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 90) + 10}</div>
        <h2 class="text-3xl lg:text-4xl font-black text-leaf-900 tracking-tight">Cevapların analiz ediliyor</h2>
        <p class="mt-3 text-leaf-800/65 text-base max-w-md mx-auto">AI, ${vtGetTotalQuestions()} cevabı ve ${filesCount} belgeyi çapraz kontrol ediyor.</p>
      </div>

      <div class="bg-white rounded-3xl border border-leaf-100 p-5 max-w-lg mx-auto w-full">
        <div class="space-y-3.5" id="vt-task-list">
          ${VT_ANALYZING_TASKS.map((t, i) => `
            <div class="flex items-center gap-3" data-task-idx="${i}">
              <div class="w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center" data-task-icon style="background:#E1F5EE;color:white;"></div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-leaf-800/40" data-task-label>${vtEscapeHtml(t.label)}</div>
                <div class="task-bar mt-1.5 hidden" data-task-bar><div class="task-bar-fill" data-task-fill style="width:0%;"></div></div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;

  const checkSvg = `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
  const dotSvg = `<span class="w-2 h-2 rounded-full bg-white shimmer-dot"></span>`;
  const stepRows = document.querySelectorAll("[data-task-idx]");
  let cumulative = 0;

  VT_ANALYZING_TASKS.forEach((task, i) => {
    setTimeout(() => {
      const row = stepRows[i];
      if (!row) return;
      row.querySelector("[data-task-label]").classList.remove("text-leaf-800/40");
      row.querySelector("[data-task-label]").classList.add("text-leaf-900");
      const icon = row.querySelector("[data-task-icon]");
      icon.style.background = "#F5B656";
      icon.innerHTML = dotSvg;
      const bar = row.querySelector("[data-task-bar]");
      const fill = row.querySelector("[data-task-fill]");
      bar.classList.remove("hidden");
      fill.style.transition = `width ${task.ms}ms linear`;
      fill.offsetWidth;
      fill.style.width = "100%";
    }, cumulative);

    cumulative += task.ms;

    setTimeout(() => {
      const row = stepRows[i];
      if (!row) return;
      const icon = row.querySelector("[data-task-icon]");
      icon.style.background = "#1D9E75";
      icon.innerHTML = checkSvg;
      const bar = row.querySelector("[data-task-bar]");
      if (bar) bar.classList.add("hidden");
    }, cumulative);
  });

  setTimeout(async () => {
    const apiRes = await _aiCallPromise;
    const now = new Date();
    const valid = new Date(now);
    valid.setMonth(valid.getMonth() + 6);

    const finalTier = (apiRes && apiRes.tier != null) ? apiRes.tier : _computed.tier;
    const finalScore = (apiRes && apiRes.skor != null) ? apiRes.skor : _computed.score;

    const certs = [];
    Object.keys(vtState.answers).forEach((qid) => {
      const v = vtState.answers[qid];
      if (v && v.name) {
        certs.push({ id: qid, title: vtFindQuestionTitle(qid), name: v.name, size: v.size });
      }
    });

    let badgeId = vtBuildBadgeId();
    let validUntilStr = vtIsoDate(valid);

    if (apiRes) {
      if (apiRes.rozet_id) badgeId = apiRes.rozet_id;
      if (apiRes.gecerlilik_sonu) validUntilStr = apiRes.gecerlilik_sonu.slice(0, 10);
    }

    const result = {
      status: "completed",
      score: finalScore,
      tier: finalTier,
      badgeId,
      earnedAt: vtIsoDate(now),
      validUntil: validUntilStr,
      trustScore: finalScore,
      answers: vtState.answers,
      breakdown: _computed.breakdown,
      certs,
      ai: apiRes ? (apiRes.ai || null) : null,
    };

    try { localStorage.setItem(VT_RESULT_KEY, JSON.stringify(result)); } catch (e) { /* ignore */ }
    vtClearDraft();

    vtState.result = result;
    vtState.view = "result";
    vtRender();
  }, cumulative + 400);
}

/* ─────────── RESULT ─────────── */
function vtRenderResult(root) {
  const r = vtState.result || (function () {
    try { return JSON.parse(localStorage.getItem(VT_RESULT_KEY) || "null"); } catch (e) { return null; }
  })();
  if (!r) {
    vtState.view = "intro";
    vtRender();
    return;
  }

  const { score, tier, breakdown, badgeId, validUntil } = r;
  const tierMeta = [
    { id: 0, name: "Rozetsiz",     desc: "Eksikleri tamamla, 6 ay sonra tekrar dene", color: "#6B7280", vera: "—" },
    { id: 1, name: "Başlangıç",    desc: "Temel yeşil uygulamalar",                   color: "#8DD3B7", vera: "+20" },
    { id: 2, name: "Onaylı",       desc: "Sertifika + AI doğrulaması",                color: "#1D9E75", vera: "+50" },
    { id: 3, name: "Doğrulanmış",  desc: "En yüksek seviye · tam onay",               color: "#053A30", vera: "+80" },
  ][tier];

  root.innerHTML = `
    <div class="vt-body">
      <div class="text-center mb-8">
        <span class="vt-pill-mono mb-4" style="background:#F1FAF6;">
          <span class="w-1.5 h-1.5 rounded-full bg-leaf-500"></span>
          Analiz tamamlandı · ${new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}
        </span>
        <h2 class="text-[2.4rem] font-black text-leaf-900 tracking-tight leading-tight mt-3">
          ${tier > 0 ? "Tebrikler! Rozetin atandı" : "Bu sefer rozet alamadın"}
        </h2>
        <p class="mt-2 text-leaf-800/65 text-base max-w-lg mx-auto">
          ${tier > 0
            ? `AI değerlendirmesi tamamlandı — Tier ${tier} ${vtEscapeHtml(tierMeta.name)} rozeti hesabına eklendi.`
            : "40 puanın altında kaldın. Eksiklerini gidermek için aşağıdaki önerilere göz at."}
        </p>
      </div>

      <div class="rounded-3xl p-7 text-white relative overflow-hidden mb-6" style="background:linear-gradient(135deg,#053A30,#085041);">
        <div class="absolute -top-12 -right-12 w-56 h-56 rounded-full pointer-events-none" style="background:rgba(29,158,117,.2);filter:blur(40px);"></div>
        <div class="absolute -bottom-10 -left-10 w-40 h-40 rounded-full pointer-events-none" style="background:rgba(245,182,86,.15);filter:blur(28px);"></div>

        <div class="relative grid sm:grid-cols-[auto,1fr] gap-6 items-center">
          <div class="relative w-[150px] h-[150px] mx-auto">
            <div class="absolute inset-0 rounded-full vt-badge-ring vt-spin-slow opacity-90"></div>
            <div class="absolute inset-[8px] rounded-full flex items-center justify-center text-center text-white" style="background:${tierMeta.color};">
              <div>
                <div class="text-[9px] font-mono uppercase tracking-widest text-white/70">Tier</div>
                <div class="text-[2.6rem] font-black leading-none">${tier || "—"}</div>
                <div class="text-[9px] font-mono uppercase tracking-widest text-amber-300 mt-0.5">${tier > 0 ? "Doğrulandı ✓" : "Yetersiz"}</div>
              </div>
            </div>
          </div>

          <div>
            <div class="text-[11px] font-mono text-amber-400 tracking-widest mb-1.5">SONUÇ</div>
            <h3 class="text-3xl font-black tracking-tight">Tier ${tier} · ${vtEscapeHtml(tierMeta.name)}</h3>
            <p class="text-sm text-white/65 mt-2">${vtEscapeHtml(tierMeta.desc)}</p>

            <div class="mt-5 grid grid-cols-3 gap-3">
              <div>
                <div class="text-[10px] font-mono text-amber-400/80 tracking-widest uppercase">Skor</div>
                <div class="font-black text-3xl tabular-nums mt-0.5">${score}<span class="text-base text-white/40">/100</span></div>
              </div>
              <div>
                <div class="text-[10px] font-mono text-amber-400/80 tracking-widest uppercase">VERA / seçim</div>
                <div class="font-black text-3xl tabular-nums mt-0.5">${vtEscapeHtml(tierMeta.vera)}</div>
              </div>
              <div>
                <div class="text-[10px] font-mono text-amber-400/80 tracking-widest uppercase">Geçerlilik</div>
                <div class="font-bold text-base mt-1">${vtEscapeHtml(validUntil)}</div>
                <div class="text-[10px] text-white/55 font-mono">${vtEscapeHtml(badgeId)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl border border-leaf-100 p-6 mb-6">
        <div class="flex items-start justify-between mb-5 flex-wrap gap-2">
          <div>
            <div class="vt-eyebrow">Bölüm Bazlı Kırılım</div>
            <h3 class="font-bold text-leaf-900 mt-1 text-lg">Hangi alanda ne kadar puan aldın</h3>
          </div>
          <span class="vt-pill-mono">${score}/100 toplam</span>
        </div>
        <div class="space-y-4">
          ${breakdown.map((b) => `
            <div>
              <div class="flex items-center justify-between text-sm mb-1.5">
                <span class="font-semibold text-leaf-900">${vtEscapeHtml(b.title)}</span>
                <span class="font-mono text-leaf-700 tabular-nums">${b.score}/${b.max} · %${b.pct}</span>
              </div>
              <div class="vt-progress" style="height:8px;">
                <div class="vt-progress-fill" style="width:${b.pct}%;background:${b.pct >= 70 ? "#1D9E75" : (b.pct >= 40 ? "#EF9F27" : "#F5B656")};"></div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      ${(function() {
        const ai = r.ai;
        const iconSvg = `<svg class="w-5 h-5 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>`;
        const iconBox = `<div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-300 flex items-center justify-center flex-shrink-0">${iconSvg}</div>`;
        if (ai && (ai.ozet || (ai.oneriler && ai.oneriler.length))) {
          const ozetHtml = ai.ozet ? `<p class="mt-2 text-sm text-leaf-800">${vtEscapeHtml(ai.ozet)}</p>` : "";
          const gucluHtml = (ai.guclu_yonler && ai.guclu_yonler.length) ? `
            <div class="mt-3">
              <div class="text-[10px] font-mono text-leaf-600 uppercase tracking-widest mb-1.5">Güçlü Yönler</div>
              <ul class="space-y-1.5 text-sm text-leaf-800">
                ${ai.guclu_yonler.map((g) => `<li class="flex items-start gap-2"><span class="w-1 h-1 rounded-full bg-leaf-500 mt-2 flex-shrink-0"></span><span>${vtEscapeHtml(g)}</span></li>`).join("")}
              </ul>
            </div>` : "";
          const oneriHtml = (ai.oneriler && ai.oneriler.length) ? `
            <div class="mt-3">
              <div class="text-[10px] font-mono text-amber-700 uppercase tracking-widest mb-1.5">Öneriler</div>
              <ul class="space-y-1.5 text-sm text-leaf-800">
                ${ai.oneriler.map((o) => `<li class="flex items-start gap-2"><span class="w-1 h-1 rounded-full bg-amber-700 mt-2 flex-shrink-0"></span><span>${vtEscapeHtml(o)}</span></li>`).join("")}
              </ul>
            </div>` : "";
          return `<div class="bg-amber-50 rounded-3xl border border-amber-200 p-6 mb-8">
            <div class="flex items-start gap-3">
              ${iconBox}
              <div class="flex-1 min-w-0">
                <div class="vt-eyebrow text-amber-700">Gemini AI Analizi</div>
                <h3 class="font-bold text-leaf-900 mt-1 text-base">LeafPay Sürdürülebilirlik Değerlendirmesi</h3>
                ${ozetHtml}${gucluHtml}${oneriHtml}
              </div>
            </div>
          </div>`;
        }
        const fallbackItems = breakdown.filter((b) => b.pct < 70).slice(0, 3).map((b) =>
          `<li class="flex items-start gap-2"><span class="w-1 h-1 rounded-full bg-amber-700 mt-2 flex-shrink-0"></span><span><b>${vtEscapeHtml(b.title)}</b> alanında %${b.pct} puan aldın — eksik cevapları gözden geçir, ilgili belgeleri yükle.</span></li>`
        ).join("") || `<li class="flex items-start gap-2"><span class="w-1 h-1 rounded-full bg-leaf-700 mt-2 flex-shrink-0"></span><span>Tüm bölümlerde güçlü skorların var. Mevcut seviyeni korumak için belgelerini düzenli güncelle.</span></li>`;
        return `<div class="bg-amber-50 rounded-3xl border border-amber-200 p-6 mb-8">
          <div class="flex items-start gap-3">
            ${iconBox}
            <div class="flex-1 min-w-0">
              <div class="vt-eyebrow text-amber-700">Daha üst tier için</div>
              <h3 class="font-bold text-leaf-900 mt-1 text-base">AI önerileri</h3>
              <ul class="mt-3 space-y-2 text-sm text-leaf-800">${fallbackItems}</ul>
            </div>
          </div>
        </div>`;
      })()}

      <div class="flex flex-wrap gap-3">
        <button id="vt-go-badge" class="vt-btn-primary flex-1 justify-center text-sm py-4">
          Rozet sayfasına dön
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
        <button id="vt-restart" class="vt-btn-secondary py-4 px-6">Yeni test başlat</button>
      </div>
    </div>
  `;

  const goBadgeBtn = document.getElementById("vt-go-badge");
  if (goBadgeBtn) goBadgeBtn.addEventListener("click", () => vtBackToBadge());

  const restartBtn = document.getElementById("vt-restart");
  if (restartBtn) restartBtn.addEventListener("click", () => {
    vtState.answers = {};
    vtState.secIdx = 0;
    vtState.result = null;
    try { localStorage.removeItem(VT_RESULT_KEY); } catch (e) { /* ignore */ }
    vtClearDraft();
    vtState.view = "intro";
    vtRender();
  });
}

function vtBindBackBtn() {
  document.querySelectorAll("[data-vt-back]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      vtBackToBadge();
    });
  });
}
