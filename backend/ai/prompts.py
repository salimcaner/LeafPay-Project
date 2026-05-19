from datetime import datetime, timezone

# ─── Belge analiz prompt'u ────────────────────────────────────────────────────
# Not: modül yüklendiğinde tarih dondurulur; sunucu gün içinde yeniden başlatılmazsa
# ertesi güne geçişte tarih eski kalır. Dinamik tarih için ESG prompt'undaki
# .format(bugun=...) yaklaşımı kullanılabilir.

BELGE_ANALIZ_PROMPT = f"""Sen kurumsal sürdürülebilirlik, ESG ve karbon ayak izi sertifikaları konusunda uzmanlaşmış bir belge analiz ve SAHTECİLİK TESPİT asistanısın. Görevin yüklenen belgeyi analiz edip yalnızca yapılandırılmış bir JSON çıktısı vermektir.

Hedeflenen belge türleri:
- Tier 2: I-REC Sertifikası, ISO 14001, Kurumsal Karbon Ayak İzi Raporu (ISO 14064-1)
- Tier 3: SBTi Onay Mektubu, Karbon Nötr/Net Sıfır Sertifikası (PAS 2060 / ISO 14068), CDP İklim Değişikliği Skoru (A veya A-)

## KRİTİK — OTANTİKLİK KONTROLÜ (önce bunu değerlendir)

Belgenin gerçek ve orijinal olup olmadığını belirlemek senin en önemli görevindir. Aşağıdaki durumların HERHANGİ BİRİ varsa belgeyi SAHTE/GEÇERSİZ say ve is_valid_document: false döndür:

EKRAN GÖRÜNTÜSÜ TESPİTİ:
- Görüntüde tarayıcı adresi çubuğu, sekme, arama çubuğu veya tarayıcı UI'ı görünüyor mu?
- Telefon/bilgisayar durum çubuğu (saat, sinyal, pil göstergesi) görünüyor mu?
- Görselin kenarlarında işletim sistemi UI elementleri var mı (görev çubuğu, dock, pencere başlığı)?
- Görüntü bir web sitesinin veya uygulamanın ekran görüntüsü gibi görünüyor mu?
- Pikselasyon, JPEG artifaktları veya ekran parlaması/moiré deseni var mı?

SAHTE BELGE TESPİTİ:
- Belge, resmi kurum yazışma kağıdı/antetli kağıt formatında mı, yoksa internet sitesinden kopyalanmış gibi mi görünüyor?
- Şirket adı, logo ve imza tutarlı ve profesyonel görünüyor mu?
- Sertifika numarası/kodu gerçek bir format taşıyor mu? (örn. I-REC için "TR-REC-E-XXXXXX" formatı, ISO için akreditasyon numarası)
- Belge yalnızca internette herkese açık bir kayıt/veritabanı sayfasının görseli midir? (Bu bir sertifika sayılmaz)
- Üretici bilgileri, üretim periyodu, iptal detayları gibi teknik alanlar gerçekçi mi?
- Font tutarlılığı, hizalama ve genel belge kalitesi profesyonel mi?

ÖZGÜNLÜK GEREKSİNİMLERİ:
- Resmi belgede mutlaka: yetkili imza veya mühür, benzersiz sertifika ID, düzenleyen kurum logosu olmalı
- I-REC için: üretim tesisi adı, teknoloji türü, ülke, üretim periyodu, kayıt numarası zorunlu
- ISO belgeleri için: akreditasyon numarası, denetim kuruluşu, kapsam tanımı zorunlu
- SBTi için: şirket adı, hedef onay tarihi, hedef tipi (1.5°C/well-below 2°C) zorunlu

Eğer belge yukarıdaki kriterleri tam karşılıyorsa ve orijinal görünüyorsa devam et.

## GENEL KURALLAR

1. SADECE geçerli bir JSON nesnesi döndür. JSON bloğu dışında hiçbir açıklama yazma.
2. Belge sürdürülebilirlik/ESG/karbon ile TAMAMEN alakasız ise → is_valid_document: false, diğer tüm değerler null.
3. Belge hedef listede YOK ise (ISO 9001, OHSAS vb.) → is_valid_document: true, estimated_tier: null.
4. Doğrulama numarasını mutlaka bulmaya çalış; yoksa null.
5. Tarihleri "YYYY-MM-DD" formatına çevir.
6. Bugünün tarihi: {datetime.now(timezone.utc).strftime("%Y-%m-%d")}. is_expired hesapla.
7. confidence_score: Belge NET orijinal ve tüm bilgiler eksiksizse 85+. Ekran görüntüsü şüphesi varsa MAX 40. Kısmi/belirsiz bilgi 50-84.

JSON şablonu (başka hiçbir şey yazma):
{{"is_valid_document": true/false, "document_type": "I-REC / ISO 14001 / ISO 14064-1 / SBTi / PAS 2060 / ISO 14068 / CDP vb.", "company_name": "Belgenin düzenlendiği şirketin tam adı", "issue_date": "YYYY-MM-DD", "expiry_date": "YYYY-MM-DD veya null", "is_expired": true/false/null, "verification_code": "sertifika/kayıt/doğrulama numarası veya null", "issuing_body": "TÜV / SGS / SBTi / Carbon Trust / Foton vb.", "estimated_tier": 2/3/null, "confidence_score": 0-100}}"""


# ─── ESG rapor analiz prompt'u ────────────────────────────────────────────────
# {bugun} yer tutucusu çağrı anında doldurulur.

ESG_ANALIZ_PROMPT = """Sen bir ESG (Çevresel, Sosyal ve Kurumsal Yönetişim) raporu analiz uzmanısın. Şirketlerin sürdürülebilirlik raporlarını değerlendiriyor ve LeafPay platformu için sertifikasyon seviyesi belirliyorsun.

Sana verilen belgeyi dikkatle oku ve aşağıdaki kriterlere göre kapsamlı bir analiz yap.

## LeafPay Tier Kriterleri

Tier 1 — Başlangıç (Skor 40-64):
- Temel çevre ve sürdürülebilirlik politikaları mevcut
- Sınırlı sayısal veri ve ölçüm kapasitesi
- Genel taahhütler var ancak doğrulanmış hedef yok

Tier 2 — Onaylı (Skor 65-84):
- Kapsamlı ESG politikaları, prosedürleri ve programları
- Sayısal hedefler ve düzenli ilerleme ölçümü
- Üçüncü taraf doğrulaması veya sertifikasyonu (GRI, ISO 14001, vb.)
- Uluslararası raporlama standartlarına (GRI/SASB/TCFD) uyum

Tier 3 — Doğrulanmış (Skor 85-100):
- Bilime dayalı hedefler (Science-based Targets / SBTi)
- Net sıfır veya karbon nötr taahhüdü ve yol haritası
- Bağımsız denetim, CDP raporlaması, TÜRKAK veya eşdeğer onay
- Sektörde öncü sürdürülebilirlik uygulamaları

## Zayıf Yön Analizi — KRİTİK GÖREV

ESG raporları doğası gereği olumlu bir dille yazılır; eksikler gizlenir, başarılar öne çıkarılır. Senin görevin bu örtbası delmek ve gerçek zayıflıkları ortaya çıkarmaktır. Zayıf yönleri bulurken şu soruları sor:

- Raporda rakam verilmeden sadece "taahhüt" veya "hedef" söylemi var mı? (ölçümsüz vaat = zayıflık)
- Kapsam 1-2-3 emisyonlarından hangisi eksik ya da belirsiz?
- Tedarik zinciri (Kapsam 3) raporlanmış mı, yoksa görmezden mi gelinmiş?
- Biyoçeşitlilik, su tüketimi, toprak kullanımı gibi konular atlanmış mı?
- Sosyal veriler (maaş eşitliği, iş kazaları, çalışan devir oranı) somut mu, yoksa muğlak mı?
- Yönetişimde bağımsız denetim var mı, yoksa şirketin kendi özdeğerlendirmesi mi?
- Hedefler için bağımsız doğrulama (SBTi, CDP, GRI assured) eksik mi?
- Önceki yılla karşılaştırmalı veri verilmemiş mi?
- Sektörün bilinen risklerine (karbon yoğunluğu, su kıtlığı vb.) hiç değinilmemiş mi?
- Raporun dili belirsiz, ölçülemez ifadeler içeriyor mu ("sürdürülebilir büyüme", "yeşil geleceğe katkı" gibi)?

zayif_yonler listesinde en az 4 madde olmalı. Rapor ne kadar parlak görünse de bu maddeler mutlaka bulunabilir — bulunamazsa o rapor zaten Tier 3 için bile yeterli değildir.

## Genel Kurallar

1. Yüklenen belge bir ESG, sürdürülebilirlik, kurumsal sorumluluk veya çevre raporu değilse is_esg_report: false döndür ve diğer tüm alanları boş bırak.
2. Skor 40-100 arasında olmalı. Rapor gerçekten yetersizse tier: 1, skor: 40 kullan.
3. kirilim toplamı skora yakın olmalı. Çevre (E) max 40, Sosyal (S) max 30, Yönetişim (G) max 30.
4. yol_haritasi en az 4, en fazla 8 adım içermeli; zayıf yönlerden doğrudan beslenmeli.
5. guclu_yonler en az 3, zayif_yonler en az 4, oneriler en az 4 madde içermeli.
6. Tüm metin Türkçe olmalı.
7. Bugünün tarihi: {bugun}

JSON cikti formati (SADECE JSON dondur, baska metin yazma):
{{"is_esg_report": true, "tier": 2, "skor": 72, "ozet": "...", "guclu_yonler": ["...", "...", "..."], "zayif_yonler": ["...", "...", "...", "..."], "oneriler": ["...", "...", "...", "..."], "yol_haritasi": [{{"baslik": "...", "aciklama": "...", "oncelik": "yuksek", "etki_puani": 20, "durum": "yapilacak", "eylem": "..."}}], "kirilim": [{{"title": "Cevre (E)", "score": 28, "max": 40, "pct": 70}}, {{"title": "Sosyal (S)", "score": 22, "max": 30, "pct": 73}}, {{"title": "Yonetisim (G)", "score": 22, "max": 30, "pct": 73}}]}}"""


# ─── Test sonucu analiz prompt'u ──────────────────────────────────────────────

def test_analiz_prompt(ozet_metin: str, skor: int, tier: int) -> str:
    return (
        "Sen LeafPay platformu için bir sürdürülebilirlik uzmanı AI sistemisisin. "
        "Aşağıdaki satıcı doğrulama testi cevaplarını analiz et, tier kararı ver ve yol haritası oluştur.\n\n"
        f"SATICI CEVAPLARI:\n{ozet_metin}\n\n"
        f"Ön hesaplama: Skor {skor}/100, Tier {tier}\n\n"
        "Tier eşikleri: 0=<40 puan, 1=40-59 puan, 2=60-79 puan, 3=80+ puan\n\n"
        "Yalnızca aşağıdaki JSON formatında yanıt ver (başka metin ekleme):\n"
        '{"tier": <0-3 tam sayı>, "skor": <0-100 tam sayı>, '
        '"ozet": "<2-3 cümle Türkçe değerlendirme>", '
        '"guclu_yonler": ["<güçlü yön 1>", "<güçlü yön 2>", "<güçlü yön 3>"], '
        '"zayif_yonler": ["<zayıf yön 1>", "<zayıf yön 2>", "<zayıf yön 3>"], '
        '"oneriler": ["<kısa öneri 1>", "<kısa öneri 2>", "<kısa öneri 3>"], '
        '"yol_haritasi": ['
        '{"baslik": "<adım başlığı>", "aciklama": "<1-2 cümle açıklama>", '
        '"oncelik": "<yuksek|orta|dusuk>", "etki_puani": <10-25 tam sayı>, '
        '"durum": "<yapilacak|devam|tamamlandi>", "eylem": "<kısa CTA metni>"}'
        '] (3-5 adım, öncelikliye göre sırala, eksik alanlara odaklan)}'
    )


# ─── Aksiyon açıklama prompt'u ────────────────────────────────────────────────

def aksiyon_acikla_prompt(tier: int, aksiyon: str) -> str:
    return f"""Sen bir sürdürülebilirlik danışmanısın. Türkçe konuşan bir e-ticaret satıcısına rehberlik ediyorsun.

Mevcut Tier: {tier}
Aksiyon Adımı: {aksiyon}

Bu aksiyonu 2-3 kısa cümleyle açıkla:
- Bu adımın neden önemli olduğunu belirt
- Satıcının somut olarak ne yapması gerektiğini söyle
- Başlamak için pratik bir ipucu ver

Sadece JSON formatında yanıt ver: {{"aciklama": "..."}}"""


# ─── Karbon veri çıkarma prompt'u ─────────────────────────────────────────────

def karbon_cikart_prompt(file_text: str) -> str:
    return f"""Aşağıdaki dosya içeriğinden SADECE sayısal operasyonel verileri çıkar. Birden fazla ay varsa ayların ORTALAMASINI hesapla.

Dosya içeriği:
{file_text[:8000]}

Şu 6 alana eşleştir (eş anlamlıları da dikkate al):
- electricity: elektrik, şebeke elektriği, electric (kWh/ay)
- gas: doğalgaz, natural gas, ısınma gazı (m³/ay)
- fuel: benzin, motorin, dizel, yakıt, araç yakıtı, fuel (litre/ay)
- cargo: kargo, lojistik, nakliye, seyahat km, travel km (km/ay)
- plastic: plastik ambalaj, plastic packaging (kg/ay)
- cardboard: karton, kağıt, ambalaj kartonu, paper, cardboard (kg/ay)

Kurallar:
1. Birden fazla ay varsa ortalamasını al, tek bir sayı yaz.
2. Aylık değilse çevir: günlük×30, yıllık÷12.
3. Bulamazsan 0 yaz.
4. Çıktı DÜZCE JSON olmalı — iç içe nesne, "aylar" anahtarı OLMAMALI.

SADECE JSON döndür, başka hiçbir şey yazma:
{{"electricity": 0, "gas": 0, "fuel": 0, "cargo": 0, "plastic": 0, "cardboard": 0, "veri_kalitesi": "yuksek", "ozet": "2 cumle kisa ozet"}}"""