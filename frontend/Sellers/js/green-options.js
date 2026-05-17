const OPTION_LABELS = {
  karton_paketleme:  "Karton Paketleme",
  karbon_notr_kargo: "Karbon Nötr Kargo",
  agac_dikme_bagis:  "Ağaç Dikme Bağışı",
  minimal_etiket:    "Minimal Etiket",
};

function renderGreenOptions() {
  const root = document.getElementById("dashboard-root");
  if (!root) return;

  root.innerHTML = `
    <div class="px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 class="text-[2rem] font-black text-leaf-900 tracking-tight">Yeşil Seçenekler</h1>
        <p class="mt-1 text-sm text-leaf-800/60">Entegrasyonunuzdan gelen webhook hareketleri.</p>
      </div>

      <!-- İstatistik kartları -->
      <div class="grid sm:grid-cols-3 gap-4" id="green-stats">
        <div class="bg-white rounded-2xl p-5 border border-leaf-100">
          <div class="text-[10px] font-mono uppercase tracking-widest text-leaf-600 mb-2">Toplam Webhook</div>
          <div class="text-3xl font-black text-leaf-900" id="gs-total">—</div>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-leaf-100">
          <div class="text-[10px] font-mono uppercase tracking-widest text-leaf-600 mb-2">Vera Puan Verildi</div>
          <div class="text-3xl font-black text-leaf-600" id="gs-vp">—</div>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-leaf-100">
          <div class="text-[10px] font-mono uppercase tracking-widest text-leaf-600 mb-2">Benzersiz Müşteri</div>
          <div class="text-3xl font-black text-leaf-900" id="gs-users">—</div>
        </div>
      </div>

      <!-- Webhook log tablosu -->
      <div class="bg-white rounded-3xl border border-leaf-100 overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-leaf-100">
          <div class="font-bold text-leaf-900">Webhook Hareketleri</div>
          <button
            onclick="loadGreenLogs()"
            class="text-xs font-semibold text-leaf-600 hover:text-leaf-800 transition"
          >Yenile ↻</button>
        </div>

        <div id="green-log-list">
          <div class="text-center py-10 text-leaf-800/40 text-sm">Yükleniyor…</div>
        </div>
      </div>
    </div>
  `;

  loadGreenLogs();
}

async function loadGreenLogs() {
  const list  = document.getElementById("green-log-list");
  const total = document.getElementById("gs-total");
  const vp    = document.getElementById("gs-vp");
  const users = document.getElementById("gs-users");
  if (!list) return;

  const { token } = getAuthState();
  if (!token) return;

  try {
    const data = await apiRequest("/satici/webhook-logs", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const logs = data.logs || [];

    if (total) total.textContent = logs.length;
    if (vp)    vp.textContent    = "+" + logs.reduce((s, l) => s + (l.vera_points || 0), 0) + " VP";
    if (users) users.textContent = new Set(logs.map(l => l.user_email)).size;

    if (logs.length === 0) {
      list.innerHTML = `<div class="text-center py-10 text-leaf-800/40 text-sm">Henüz webhook gelmedi.<br>Trendyol demosundan bir alışveriş yapın.</div>`;
      return;
    }

    list.innerHTML = `
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-leaf-100 text-[11px] font-mono uppercase tracking-widest text-leaf-800/50">
            <th class="text-left px-6 py-3">Seçenek</th>
            <th class="text-left px-6 py-3">Ürün</th>
            <th class="text-left px-6 py-3">Müşteri</th>
            <th class="text-left px-6 py-3">Sipariş</th>
            <th class="text-left px-6 py-3">Vera Puan</th>
            <th class="text-left px-6 py-3">Zaman</th>
          </tr>
        </thead>
        <tbody>
          ${logs.map(log => `
            <tr class="border-b border-leaf-50 hover:bg-leaf-50/50 transition-colors">
              <td class="px-6 py-3 font-semibold text-leaf-900">
                ${OPTION_LABELS[log.option] || log.option}
              </td>
              <td class="px-6 py-3 font-mono text-xs text-leaf-800/70">${log.product_id}</td>
              <td class="px-6 py-3 text-leaf-800/70">${log.user_email}</td>
              <td class="px-6 py-3 font-mono text-xs text-leaf-800/50">${log.order_id}</td>
              <td class="px-6 py-3">
                <span class="bg-leaf-100 text-leaf-700 font-bold text-xs px-2 py-1 rounded-full">+${log.vera_points} VP</span>
              </td>
              <td class="px-6 py-3 font-mono text-xs text-leaf-800/50">
                ${new Date(log.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } catch (e) {
    list.innerHTML = `<div class="text-center py-10 text-red-400 text-sm">Veriler yüklenemedi.</div>`;
  }
}
