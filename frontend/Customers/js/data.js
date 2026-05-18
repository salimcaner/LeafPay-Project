const CUSTOMER_PANEL_DATA = {
  customer: {
    name: "Melike",
    email: "melike.yilmaz@eposta.com",
    phone: "+90 532 412 19 84",
    city: "Istanbul",
    memberSince: "Mart 2025",
    veraBalance: 2840,
    monthlyEarned: 620,
    greenChoicesCount: 18,
    plasticSavedKg: 4.8,
    carbonSavedKg: 32.5,
    treeDonationCount: 6,
    couponsAvailable: 6,
    completedOrders: 24,
  },
  campaigns: [
    { id: "CP-201", title: "Kartonist 75 TL Indirim", brand: "Kartonist", cost: 900, expiresIn: "12 gun", type: "active", highlight: "FSC serisi urunlerde gecerli" },
    { id: "CP-202", title: "%15 Bambu Studio Kuponu", brand: "Bambu Studio", cost: 650, expiresIn: "4 gun", type: "expiring", highlight: "Ev & yasam koleksiyonu" },
    { id: "CP-203", title: "Yesilkoy Tekstil 120 TL", brand: "Yesilkoy Tekstil", cost: 1400, expiresIn: "18 gun", type: "active", highlight: "Yeni sezon secili urunler" },
    { id: "CP-204", title: "%10 Cinar Kozmetik", brand: "Cinar Kozmetik", cost: 520, expiresIn: "Kullanildi", type: "used", highlight: "Nisan kampanyasi kullanildi" },
    { id: "CP-205", title: "Anadolu Dogal 50 TL", brand: "Anadolu Dogal", cost: 500, expiresIn: "28 gun", type: "active", highlight: "Minimum 400 TL sepet" },
    { id: "CP-206", title: "Lale Organic 90 TL", brand: "Lale Organic", cost: 980, expiresIn: "7 gun", type: "expiring", highlight: "Temiz icerik koleksiyonu" },
  ],
  activities: [
    { title: "Karton paketleme secildi", brand: "Kartonist", date: "Bugun · 14:20", vera: 80, detail: "Siparis #LP-49381" },
    { title: "Karbon notr kargo secildi", brand: "Yesilkoy Tekstil", date: "Dun · 20:15", vera: 45, detail: "Siparis #LP-49274" },
    { title: "Agac dikme bagisi eklendi", brand: "Bambu Studio", date: "15 Mayis 2026", vera: 65, detail: "Siparis #LP-48910" },
    { title: "Dijital fis tercih edildi", brand: "Lale Organic", date: "13 Mayis 2026", vera: 25, detail: "Siparis #LP-48702" },
  ],
  greenChoices: [
    { option: "Karton paketleme", orderId: "LP-49381", date: "18 Mayis 2026", seller: "Kartonist", vera: 80, status: "Teslim edildi", note: "Plastiksiz koruyucu dolgu kullanildi" },
    { option: "Karbon notr kargo", orderId: "LP-49274", date: "17 Mayis 2026", seller: "Yesilkoy Tekstil", vera: 45, status: "Kargoda", note: "Offset sertifikasi tanimlandi" },
    { option: "Agac dikme bagisi", orderId: "LP-48910", date: "15 Mayis 2026", seller: "Bambu Studio", vera: 65, status: "Teslim edildi", note: "Ege bolgesi fidan programi" },
    { option: "Minimal etiket", orderId: "LP-48788", date: "12 Mayis 2026", seller: "Anadolu Dogal", vera: 20, status: "Teslim edildi", note: "Tek etiketli sevkiyat" },
    { option: "Dijital fis", orderId: "LP-48702", date: "13 Mayis 2026", seller: "Lale Organic", vera: 25, status: "Teslim edildi", note: "E-posta ile fis teslimi" },
    { option: "Birlesik teslimat", orderId: "LP-48165", date: "07 Mayis 2026", seller: "Cinar Kozmetik", vera: 35, status: "Tamamlandi", note: "Iki siparis tek pakette birlestirildi" },
  ],
  orders: [
    { id: "LP-49381", seller: "Kartonist", date: "18 Mayis 2026", total: "1.240 TL", green: "Karton paketleme", vera: 80, status: "Teslim edildi" },
    { id: "LP-49274", seller: "Yesilkoy Tekstil", date: "17 Mayis 2026", total: "890 TL", green: "Karbon notr kargo", vera: 45, status: "Kargoda" },
    { id: "LP-48910", seller: "Bambu Studio", date: "15 Mayis 2026", total: "2.140 TL", green: "Agac dikme bagisi", vera: 65, status: "Teslim edildi" },
    { id: "LP-48788", seller: "Anadolu Dogal", date: "12 Mayis 2026", total: "560 TL", green: "Minimal etiket", vera: 20, status: "Teslim edildi" },
    { id: "LP-48702", seller: "Lale Organic", date: "13 Mayis 2026", total: "720 TL", green: "Dijital fis", vera: 25, status: "Hazirlaniyor" },
    { id: "LP-48165", seller: "Cinar Kozmetik", date: "07 Mayis 2026", total: "1.090 TL", green: "Birlesik teslimat", vera: 35, status: "Tamamlandi" },
  ],
  walletMovements: [
    { date: "18 Mayis 2026", type: "Kazanim", source: "Karton paketleme · Kartonist", amount: "+80 VERA", balance: "2.840" },
    { date: "17 Mayis 2026", type: "Kazanim", source: "Karbon notr kargo · Yesilkoy Tekstil", amount: "+45 VERA", balance: "2.760" },
    { date: "15 Mayis 2026", type: "Kazanim", source: "Agac dikme bagisi · Bambu Studio", amount: "+65 VERA", balance: "2.715" },
    { date: "12 Mayis 2026", type: "Kullanim", source: "Bambu Studio %15 kupon", amount: "-650 VERA", balance: "2.650" },
    { date: "03 Mayis 2026", type: "Bonus", source: "Aylik yesil seri gorevi", amount: "+120 VERA", balance: "3.300" },
    { date: "28 Nisan 2026", type: "Kullanim", source: "Kartonist 50 TL kupon", amount: "-500 VERA", balance: "3.180" },
  ],
  notifications: {
    marketing: true,
    order: true,
    campaign: true,
    donation: false,
  },
  defaults: {
    packaging: true,
    digitalReceipt: true,
    consolidatedShipping: false,
    treeDonation: false,
  },
};

function getCustomerProfile() {
  const authState = typeof getAuthState === "function" ? getAuthState() : null;
  const user = authState?.user || {};

  const firstName = user.musteri_ad || user.ad || CUSTOMER_PANEL_DATA.customer.name;
  const lastName = user.musteri_soyad || user.soyad || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    ...CUSTOMER_PANEL_DATA.customer,
    name: firstName,
    fullName: fullName || CUSTOMER_PANEL_DATA.customer.name,
    email: user.e_posta || CUSTOMER_PANEL_DATA.customer.email,
    phone: user.telefon_no || CUSTOMER_PANEL_DATA.customer.phone,
  };
}
