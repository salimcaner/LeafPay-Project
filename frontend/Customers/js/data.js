const CUSTOMER_PANEL_DATA = {
  customer: {
    name: "Melike",
    email: "melike.yilmaz@eposta.com",
    phone: "+90 532 412 19 84",
    city: "İstanbul",
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
    { id: "CP-201", title: "Koton 500 TL", brand: "Koton", cost: 500, expiresIn: "Süresiz", type: "active", highlight: "Hemen kullanıma hazır" },
    { id: "CP-202", title: "Eti 250 TL", brand: "Eti", cost: 250, expiresIn: "Süresiz", type: "active", highlight: "Hemen kullanıma hazır" },
    { id: "CP-203", title: "Flormar 750 TL", brand: "Flormar", cost: 750, expiresIn: "Süresiz", type: "active", highlight: "Hemen kullanıma hazır" },
  ],
  activities: [
    { title: "Karton paketleme seçildi", brand: "Kartonist", date: "Bugün · 14:20", vera: 80, detail: "Sipariş #LP-49381" },
    { title: "Karbon nötr kargo seçildi", brand: "Yeşilköy Tekstil", date: "Dün · 20:15", vera: 45, detail: "Sipariş #LP-49274" },
    { title: "Ağaç dikme bağışı eklendi", brand: "Bambu Studio", date: "15 Mayıs 2026", vera: 65, detail: "Sipariş #LP-48910" },
    { title: "Dijital fiş tercih edildi", brand: "Lale Organic", date: "13 Mayıs 2026", vera: 25, detail: "Sipariş #LP-48702" },
  ],
  greenChoices: [
    { option: "Karton paketleme", orderId: "LP-49381", date: "18 Mayıs 2026", seller: "Kartonist", vera: 80, status: "Teslim edildi", note: "Plastiksiz koruyucu dolgu kullanıldı" },
    { option: "Karbon nötr kargo", orderId: "LP-49274", date: "17 Mayıs 2026", seller: "Yeşilköy Tekstil", vera: 45, status: "Kargoda", note: "Offset sertifikası tanımlandı" },
    { option: "Ağaç dikme bağışı", orderId: "LP-48910", date: "15 Mayıs 2026", seller: "Bambu Studio", vera: 65, status: "Teslim edildi", note: "Ege bölgesi fidan programı" },
    { option: "Minimal etiket", orderId: "LP-48788", date: "12 Mayıs 2026", seller: "Anadolu Doğal", vera: 20, status: "Teslim edildi", note: "Tek etiketli sevkiyat" },
    { option: "Dijital fiş", orderId: "LP-48702", date: "13 Mayıs 2026", seller: "Lale Organic", vera: 25, status: "Teslim edildi", note: "E-posta ile fiş teslimi" },
    { option: "Birleşik teslimat", orderId: "LP-48165", date: "07 Mayıs 2026", seller: "Çınar Kozmetik", vera: 35, status: "Tamamlandı", note: "İki sipariş tek pakette birleştirildi" },
  ],
  orders: [
    { id: "LP-49381", seller: "Kartonist", date: "18 Mayıs 2026", total: "1.240 TL", green: "Karton paketleme", vera: 80, status: "Teslim edildi" },
    { id: "LP-49274", seller: "Yeşilköy Tekstil", date: "17 Mayıs 2026", total: "890 TL", green: "Karbon nötr kargo", vera: 45, status: "Kargoda" },
    { id: "LP-48910", seller: "Bambu Studio", date: "15 Mayıs 2026", total: "2.140 TL", green: "Ağaç dikme bağışı", vera: 65, status: "Teslim edildi" },
    { id: "LP-48788", seller: "Anadolu Doğal", date: "12 Mayıs 2026", total: "560 TL", green: "Minimal etiket", vera: 20, status: "Teslim edildi" },
    { id: "LP-48702", seller: "Lale Organic", date: "13 Mayıs 2026", total: "720 TL", green: "Dijital fiş", vera: 25, status: "Hazırlanıyor" },
    { id: "LP-48165", seller: "Çınar Kozmetik", date: "07 Mayıs 2026", total: "1.090 TL", green: "Birleşik teslimat", vera: 35, status: "Tamamlandı" },
  ],
  walletMovements: [
    { date: "18 Mayıs 2026", type: "Kazanım", source: "Karton paketleme · Kartonist", amount: "+80 VERA", balance: "2.840" },
    { date: "17 Mayıs 2026", type: "Kazanım", source: "Karbon nötr kargo · Yeşilköy Tekstil", amount: "+45 VERA", balance: "2.760" },
    { date: "15 Mayıs 2026", type: "Kazanım", source: "Ağaç dikme bağışı · Bambu Studio", amount: "+65 VERA", balance: "2.715" },
    { date: "12 Mayıs 2026", type: "Kullanım", source: "Bambu Studio %15 kupon", amount: "-650 VERA", balance: "2.650" },
    { date: "03 Mayıs 2026", type: "Bonus", source: "Aylık yeşil seri görevi", amount: "+120 VERA", balance: "3.300" },
    { date: "28 Nisan 2026", type: "Kullanım", source: "Kartonist 50 TL kupon", amount: "-500 VERA", balance: "3.180" },
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
