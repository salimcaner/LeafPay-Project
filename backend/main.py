import base64
import io
import json
import os
import random
import string
import requests
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException, Depends, Header, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from schemas import SaticiKayit, MusteriKayit, GirisYap, WebhookPayload, RozetTaslakKayit, RozetTamamla, AIAnalizTalep, AksiyelAciklaRequest
from typing import Optional
from database import supabase
from security import sifreyi_hashle, sifreyi_dogrula, token_olustur, token_dogrula

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

bearer = HTTPBearer()

def aktif_kullanici(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    try:
        return token_dogrula(credentials.credentials)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

def sadece_satici(kullanici: dict = Depends(aktif_kullanici)) -> dict:
    if kullanici.get("rol") != "satici":
        raise HTTPException(status_code=403, detail="Bu işlem için satıcı girişi gerekli")
    return kullanici

def sadece_musteri(kullanici: dict = Depends(aktif_kullanici)) -> dict:
    if kullanici.get("rol") != "musteri":
        raise HTTPException(status_code=403, detail="Bu işlem için müşteri girişi gerekli")
    return kullanici

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"LeafPay": "Welcome to LeafPay"}


@app.post("/satici/kayit")
def satici_kayit_olustur(satici: SaticiKayit):
    satici_verisi = satici.model_dump()

    mevcut = supabase.table("saticilar").select("e_posta").eq("e_posta", satici_verisi["e_posta"]).execute()
    if mevcut.data:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kayıtlı")

    satici_verisi["sifre"] = sifreyi_hashle(satici_verisi["sifre"])

    try:
        response = supabase.table("saticilar").insert(satici_verisi).execute()
        kaydedilen_veri = response.data[0]
        del kaydedilen_veri["sifre"]
        return {"mesaj": "Satıcı başarıyla kaydedildi!", "data": kaydedilen_veri}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/musteri/kayit")
def musteri_kayit_olustur(musteri: MusteriKayit):
    musteri_verisi = musteri.model_dump()

    mevcut = supabase.table("musteriler").select("e_posta").eq("e_posta", musteri_verisi["e_posta"]).execute()
    if mevcut.data:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kayıtlı")

    musteri_verisi["sifre"] = sifreyi_hashle(musteri_verisi["sifre"])

    try:
        response = supabase.table("musteriler").insert(musteri_verisi).execute()
        kaydedilen_veri = response.data[0]
        del kaydedilen_veri["sifre"]
        return {"mesaj": "Müşteri başarıyla kaydedildi!", "data": kaydedilen_veri}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/satici/profil")
def satici_profil(kullanici: dict = Depends(sadece_satici)):
    sonuc = supabase.table("saticilar").select("*").eq("account_id", kullanici["id"]).execute()
    if not sonuc.data:
        raise HTTPException(status_code=404, detail="Satıcı bulunamadı")
    profil = sonuc.data[0]
    del profil["sifre"]
    return profil


@app.get("/musteri/profil")
def musteri_profil(kullanici: dict = Depends(sadece_musteri)):
    sonuc = supabase.table("musteriler").select("*").eq("musteri_id", kullanici["id"]).execute()
    if not sonuc.data:
        raise HTTPException(status_code=404, detail="Müşteri bulunamadı")
    profil = sonuc.data[0]
    del profil["sifre"]
    return profil


@app.post("/satici/giris")
def satici_giris(giris: GirisYap):
    sonuc = supabase.table("saticilar").select("*").eq("e_posta", giris.e_posta).execute()

    if not sonuc.data:
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı")

    satici = sonuc.data[0]

    if not sifreyi_dogrula(giris.sifre, satici["sifre"]):
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı")

    token = token_olustur(satici["account_id"], satici["e_posta"], "satici")

    return {
        "access_token": token,
        "token_type": "bearer",
        "satici": {
            "account_id": satici["account_id"],
            "sirket_adi": satici["sirket_adi"],
            "yetkili_ad": satici["yetkili_ad"],
            "yetkili_soyad": satici["yetkili_soyad"],
            "e_posta": satici["e_posta"],
        }
    }


@app.post("/webhook/trendyol/{webhook_id}")
def webhook_al(
    webhook_id: str,
    payload: WebhookPayload,
    x_leafpay_secret: Optional[str] = Header(None),
):
    try:
        satici_sonuc = supabase.table("saticilar").select("account_id, sirket_adi, webhook_secret").eq("webhook_id", webhook_id).execute()
        print("[WEBHOOK] satici sorgu sonucu:", satici_sonuc.data)
    except Exception as e:
        print("[WEBHOOK] satici sorgu HATA:", str(e))
        raise HTTPException(status_code=500, detail=f"Satıcı sorgu hatası: {str(e)}")

    if not satici_sonuc.data:
        raise HTTPException(status_code=404, detail="Webhook ID bulunamadı")

    satici = satici_sonuc.data[0]

    if x_leafpay_secret != satici["webhook_secret"]:
        print("[WEBHOOK] Secret eşleşmedi. Gelen:", x_leafpay_secret, "Beklenen:", satici["webhook_secret"])
        raise HTTPException(status_code=401, detail="Geçersiz secret key")

    log_verisi = {
        "satici_id": satici["account_id"],
        "product_id": payload.product_id,
        "option": payload.option,
        "user_email": payload.user_email,
        "order_id": payload.order_id,
        "vera_points": payload.vera_points,
    }
    print("[WEBHOOK] insert verisi:", log_verisi)

    try:
        supabase.table("webhook_logs").insert(log_verisi).execute()
        print("[WEBHOOK] insert başarılı")
    except Exception as e:
        print("[WEBHOOK] insert HATA:", str(e))
        raise HTTPException(status_code=500, detail=f"Insert hatası: {str(e)}")

    return {"status": "ok", "vera_points_awarded": payload.vera_points}


def _rozet_id_olustur(sektor: Optional[str]) -> str:
    yil = datetime.now(timezone.utc).year
    prefix = (sektor or "gn")[:2].upper()
    rastgele = "".join(random.choices(string.digits, k=4))
    return f"LP-{prefix}-{yil}-{rastgele}"


_BELGE_ANALIZ_PROMPT = f"""Sen kurumsal sürdürülebilirlik, ESG ve karbon ayak izi sertifikaları konusunda uzmanlaşmış bir belge analiz ve SAHTECİLİK TESPİT asistanısın. Görevin yüklenen belgeyi analiz edip yalnızca yapılandırılmış bir JSON çıktısı vermektir.

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


def _pdf_metni_cikart(content: bytes) -> str:
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(content))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception:
        return ""


def cagir_belge_analizi(content: bytes, mime_type: str) -> dict:
    hata = {"is_valid_document": False, "document_type": None, "company_name": None,
            "issue_date": None, "expiry_date": None, "is_expired": None,
            "verification_code": None, "issuing_body": None, "estimated_tier": None, "confidence_score": 0}

    if not GEMINI_API_KEY:
        return hata

    IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}

    if mime_type in IMAGE_TYPES:
        b64 = base64.b64encode(content).decode()
        message_content = [
            {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{b64}"}},
            {"type": "text", "text": _BELGE_ANALIZ_PROMPT},
        ]
    elif mime_type == "application/pdf":
        metin = _pdf_metni_cikart(content)
        if not metin or len(metin.strip()) < 30:
            return {**hata, "error": "taranmis_pdf"}
        message_content = [{"type": "text", "text": f"{_BELGE_ANALIZ_PROMPT}\n\nBELGE METNİ:\n{metin[:4000]}"}]
    else:
        return hata

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {"Authorization": f"Bearer {GEMINI_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": "google/gemini-2.0-flash-001",
        "messages": [{"role": "user", "content": message_content}],
        "response_format": {"type": "json_object"},
        "temperature": 0.1,
    }
    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=40)
        resp.raise_for_status()
        text = resp.json()["choices"][0]["message"]["content"]
        result = json.loads(text)
        if result.get("estimated_tier") is not None:
            result["estimated_tier"] = max(2, min(3, int(result["estimated_tier"])))
        result["confidence_score"] = max(0, min(100, int(result.get("confidence_score", 0))))
        return result
    except Exception as e:
        print(f"[BELGE] Hata: {e}")
        return hata


_ESG_ANALIZ_PROMPT = """Sen bir ESG (Çevresel, Sosyal ve Kurumsal Yönetişim) raporu analiz uzmanısın. Şirketlerin sürdürülebilirlik raporlarını değerlendiriyor ve LeafPay platformu için sertifikasyon seviyesi belirliyorsun.

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


def cagir_esg_analizi(content: bytes, mime_type: str) -> dict:
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="AI servisi yapılandırılmamış")

    bugun = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    sistem_prompt = _ESG_ANALIZ_PROMPT.format(bugun=bugun)

    IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
    if mime_type in IMAGE_TYPES:
        b64 = base64.b64encode(content).decode()
        message_content = [
            {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{b64}"}},
            {"type": "text", "text": sistem_prompt},
        ]
    elif mime_type == "application/pdf":
        metin = _pdf_metni_cikart(content)
        if not metin or len(metin.strip()) < 50:
            raise HTTPException(status_code=422, detail="Taranan (görüntü tabanlı) PDF desteklenmiyor. Lütfen metin içeren PDF veya JPG/PNG yükleyin.")
        message_content = [{"type": "text", "text": f"{sistem_prompt}\n\n--- ESG RAPORU İÇERİĞİ ---\n{metin[:18000]}"}]
    else:
        raise HTTPException(status_code=422, detail="Desteklenmeyen dosya türü. PDF, JPG veya PNG yükleyin.")

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {"Authorization": f"Bearer {GEMINI_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": "google/gemini-2.0-flash-001",
        "messages": [{"role": "user", "content": message_content}],
        "response_format": {"type": "json_object"},
        "temperature": 0.3,
    }
    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=90)
        resp.raise_for_status()
        text = resp.json()["choices"][0]["message"]["content"]
        return json.loads(text)
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ESG] Hata: {e}")
        raise HTTPException(status_code=502, detail="AI servisi yanıt vermedi. Lütfen tekrar deneyin.")


def cagir_gemini_analizi(ozet_metin: str, skor: int, tier: int) -> dict:
    fallback = {"tier": tier, "skor": skor, "ozet": "AI analizi tamamlandı.", "guclu_yonler": [], "zayif_yonler": [], "oneriler": []}
    if not GEMINI_API_KEY:
        return fallback

    prompt = (
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

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GEMINI_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "google/gemini-2.0-flash-001",
        "messages": [{"role": "user", "content": prompt}],
        "response_format": {"type": "json_object"},
        "temperature": 0.3,
    }
    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=30)
        resp.raise_for_status()
        text = resp.json()["choices"][0]["message"]["content"]
        result = json.loads(text)
        result["tier"] = max(0, min(3, int(result.get("tier", tier))))
        result["skor"] = max(0, min(100, int(result.get("skor", skor))))
        return result
    except Exception as e:
        print(f"[GEMINI] Hata: {e}")
        return fallback


@app.get("/satici/webhook-logs")
def satici_webhook_logs(kullanici: dict = Depends(sadece_satici)):
    sonuc = supabase.table("webhook_logs") \
        .select("*") \
        .eq("satici_id", kullanici["id"]) \
        .order("created_at", desc=True) \
        .limit(50) \
        .execute()
    return {"logs": sonuc.data}


# ──────────────────────────── ROZET ────────────────────────────

@app.get("/satici/rozet")
def rozet_durumu_getir(kullanici: dict = Depends(sadece_satici)):
    satici_id = kullanici["id"]

    taslak_sonuc = supabase.table("rozet_testleri") \
        .select("*") \
        .eq("satici_id", satici_id) \
        .eq("durum", "taslak") \
        .order("olusturma_tarihi", desc=True) \
        .limit(1) \
        .execute()

    aktif_sonuc = supabase.table("rozet_testleri") \
        .select("*") \
        .eq("satici_id", satici_id) \
        .eq("durum", "tamamlandi") \
        .order("tamamlanma_tarihi", desc=True) \
        .limit(1) \
        .execute()

    belgeler = []
    if aktif_sonuc.data:
        test_id = aktif_sonuc.data[0]["test_id"]
        belge_sonuc = supabase.table("rozet_belgeleri") \
            .select("soru_id, dosya_adi, storage_yolu, ai_dogrulandi, ai_skor") \
            .eq("test_id", test_id) \
            .execute()
        belgeler = belge_sonuc.data or []

    return {
        "taslak": taslak_sonuc.data[0] if taslak_sonuc.data else None,
        "aktif_rozet": aktif_sonuc.data[0] if aktif_sonuc.data else None,
        "belgeler": belgeler,
    }


@app.post("/satici/rozet/draft")
def rozet_taslak_kaydet(veri: RozetTaslakKayit, kullanici: dict = Depends(sadece_satici)):
    satici_id = kullanici["id"]

    mevcut = supabase.table("rozet_testleri") \
        .select("test_id") \
        .eq("satici_id", satici_id) \
        .eq("durum", "taslak") \
        .order("olusturma_tarihi", desc=True) \
        .limit(1) \
        .execute()

    payload = {
        "cevaplar": veri.cevaplar,
        "aktif_bolum_idx": veri.aktif_bolum_idx,
        "sektor": veri.sektor,
        "guncelleme_tarihi": datetime.now(timezone.utc).isoformat(),
    }

    if mevcut.data:
        test_id = mevcut.data[0]["test_id"]
        sonuc = supabase.table("rozet_testleri") \
            .update(payload) \
            .eq("test_id", test_id) \
            .execute()
    else:
        payload["satici_id"] = satici_id
        payload["durum"] = "taslak"
        sonuc = supabase.table("rozet_testleri").insert(payload).execute()

    if not sonuc.data:
        raise HTTPException(status_code=500, detail="Taslak kaydedilemedi")

    return {"mesaj": "Taslak kaydedildi", "test_id": sonuc.data[0]["test_id"]}


@app.delete("/satici/rozet/draft")
def rozet_taslak_sil(kullanici: dict = Depends(sadece_satici)):
    satici_id = kullanici["id"]

    mevcut = supabase.table("rozet_testleri") \
        .select("test_id") \
        .eq("satici_id", satici_id) \
        .eq("durum", "taslak") \
        .execute()

    if not mevcut.data:
        raise HTTPException(status_code=404, detail="Silinecek taslak bulunamadı")

    for row in mevcut.data:
        supabase.table("rozet_testleri").delete().eq("test_id", row["test_id"]).execute()

    return {"mesaj": "Taslak silindi"}


@app.post("/satici/rozet/tamamla")
def rozet_tamamla(veri: RozetTamamla, kullanici: dict = Depends(sadece_satici)):
    satici_id = kullanici["id"]
    simdi = datetime.now(timezone.utc)
    gecerlilik = simdi + timedelta(days=180)

    rozet_id = _rozet_id_olustur(veri.sektor)

    mevcut = supabase.table("rozet_testleri") \
        .select("test_id") \
        .eq("satici_id", satici_id) \
        .eq("durum", "taslak") \
        .order("olusturma_tarihi", desc=True) \
        .limit(1) \
        .execute()

    kirilim_listesi = [m.model_dump() for m in veri.kirilim]

    payload = {
        "durum": "tamamlandi",
        "cevaplar": veri.cevaplar,
        "sektor": veri.sektor,
        "skor": veri.skor,
        "tier": veri.tier,
        "guven_skoru": veri.guven_skoru,
        "kirilim": kirilim_listesi,
        "rozet_id": rozet_id,
        "kazanim_tarihi": simdi.isoformat(),
        "gecerlilik_sonu": gecerlilik.isoformat(),
        "tamamlanma_tarihi": simdi.isoformat(),
        "guncelleme_tarihi": simdi.isoformat(),
    }

    if mevcut.data:
        test_id = mevcut.data[0]["test_id"]
        sonuc = supabase.table("rozet_testleri") \
            .update(payload) \
            .eq("test_id", test_id) \
            .execute()
    else:
        payload["satici_id"] = satici_id
        sonuc = supabase.table("rozet_testleri").insert(payload).execute()

    if not sonuc.data:
        raise HTTPException(status_code=500, detail="Rozet kaydedilemedi")

    test_id = sonuc.data[0]["test_id"]

    dosya_sorulari = [
        qid for qid, cevap in veri.cevaplar.items()
        if isinstance(cevap, dict) and cevap.get("type") == "file"
    ]
    for qid in dosya_sorulari:
        cevap = veri.cevaplar[qid]
        belge = {
            "test_id": test_id,
            "satici_id": satici_id,
            "soru_id": qid,
            "dosya_adi": cevap.get("name", ""),
            "dosya_boyutu": cevap.get("size"),
            "storage_yolu": cevap.get("path", ""),
            "mime_tipi": cevap.get("mime"),
        }
        supabase.table("rozet_belgeleri").upsert(belge, on_conflict="test_id,soru_id").execute()

    return {
        "mesaj": "Rozet tamamlandı",
        "rozet_id": rozet_id,
        "test_id": test_id,
        "tier": veri.tier,
        "skor": veri.skor,
        "gecerlilik_sonu": gecerlilik.isoformat(),
    }


@app.post("/satici/rozet/belge-analiz")
async def rozet_belge_analiz(
    dosya: UploadFile = File(...),
    kullanici: dict = Depends(sadece_satici),
):
    MAX_BOYUT = 50 * 1024 * 1024  # 50 MB
    content = await dosya.read()
    if len(content) > MAX_BOYUT:
        raise HTTPException(status_code=400, detail="Dosya 50 MB sınırını aşıyor")

    mime_type = dosya.content_type or ""
    if not mime_type:
        ad = (dosya.filename or "").lower()
        if ad.endswith(".pdf"):
            mime_type = "application/pdf"
        elif ad.endswith((".jpg", ".jpeg")):
            mime_type = "image/jpeg"
        elif ad.endswith(".png"):
            mime_type = "image/png"
        elif ad.endswith(".webp"):
            mime_type = "image/webp"

    sonuc = cagir_belge_analizi(content, mime_type)

    if sonuc.get("error") == "taranmis_pdf":
        raise HTTPException(
            status_code=422,
            detail="Taranmış PDF okunemiyor — lütfen belgeyi JPG veya PNG olarak yükleyin."
        )

    return sonuc


@app.post("/satici/rozet/esg-analiz")
async def rozet_esg_analiz(
    dosya: UploadFile = File(...),
    kullanici: dict = Depends(sadece_satici),
):
    satici_id = kullanici["id"]

    content = await dosya.read()
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=422, detail="Dosya boyutu 50 MB'ı aşmamalı")

    ad = (dosya.filename or "").lower()
    mime_type = dosya.content_type or ""
    if not mime_type or mime_type == "application/octet-stream":
        if ad.endswith(".pdf"):   mime_type = "application/pdf"
        elif ad.endswith((".jpg", ".jpeg")): mime_type = "image/jpeg"
        elif ad.endswith(".png"): mime_type = "image/png"

    sonuc = cagir_esg_analizi(content, mime_type)

    if not sonuc.get("is_esg_report"):
        raise HTTPException(status_code=422, detail="Yüklenen belge bir ESG veya sürdürülebilirlik raporu değil. Lütfen geçerli bir ESG raporu yükleyin.")

    ai_tier = 1  # Her değerlendirme Tier 1 ile başlar; belge yüklenerek yükseltilir
    ai_skor = max(40, min(100, int(sonuc.get("skor", 40))))
    ai_kirilim = sonuc.get("kirilim", [])

    ai_analiz = {
        "tier": ai_tier,
        "skor": ai_skor,
        "ozet": sonuc.get("ozet", ""),
        "guclu_yonler": sonuc.get("guclu_yonler", []),
        "zayif_yonler": sonuc.get("zayif_yonler", []),
        "oneriler": sonuc.get("oneriler", []),
        "yol_haritasi": sonuc.get("yol_haritasi", []),
        "kaynak": "esg_raporu",
    }

    rozet_id = _rozet_id_olustur("esg")
    simdi = datetime.now(timezone.utc)
    gecerlilik = simdi + timedelta(days=365)

    cevaplar = {
        "esg_raporu": {
            "type": "esg_upload",
            "name": dosya.filename or "rapor",
            "mime": mime_type,
        }
    }

    payload_db = {
        "durum": "tamamlandi",
        "cevaplar": cevaplar,
        "sektor": "esg",
        "skor": ai_skor,
        "tier": ai_tier,
        "guven_skoru": ai_skor,
        "kirilim": ai_kirilim,
        "rozet_id": rozet_id,
        "ai_analiz": ai_analiz,
        "kazanim_tarihi": simdi.isoformat(),
        "gecerlilik_sonu": gecerlilik.isoformat(),
        "tamamlanma_tarihi": simdi.isoformat(),
        "guncelleme_tarihi": simdi.isoformat(),
    }

    mevcut = supabase.table("rozet_testleri") \
        .select("test_id") \
        .eq("satici_id", satici_id) \
        .eq("durum", "taslak") \
        .order("olusturma_tarihi", desc=True) \
        .limit(1) \
        .execute()

    if mevcut.data:
        test_id = mevcut.data[0]["test_id"]
        sonuc_db = supabase.table("rozet_testleri").update(payload_db).eq("test_id", test_id).execute()
    else:
        payload_db["satici_id"] = satici_id
        sonuc_db = supabase.table("rozet_testleri").insert(payload_db).execute()

    if not sonuc_db.data:
        raise HTTPException(status_code=500, detail="Rozet kaydedilemedi")

    test_id = sonuc_db.data[0]["test_id"]

    return {
        "mesaj": "ESG raporu analizi tamamlandı",
        "rozet_id": rozet_id,
        "test_id": test_id,
        "tier": ai_tier,
        "skor": ai_skor,
        "kazanim_tarihi": simdi.isoformat(),
        "gecerlilik_sonu": gecerlilik.isoformat(),
        "ai": ai_analiz,
        "kirilim": ai_kirilim,
    }


@app.post("/satici/rozet/tier-yukselme")
async def rozet_tier_yukselme(
    dosya: UploadFile = File(...),
    kullanici: dict = Depends(sadece_satici),
):
    satici_id = kullanici["id"]

    # Aktif tamamlanmış rozeti bul
    mevcut = supabase.table("rozet_testleri") \
        .select("test_id, tier, rozet_id") \
        .eq("satici_id", satici_id) \
        .eq("durum", "tamamlandi") \
        .order("kazanim_tarihi", desc=True) \
        .limit(1) \
        .execute()

    if not mevcut.data:
        raise HTTPException(status_code=404, detail="Önce bir değerlendirme tamamlamalısınız.")

    rozet = mevcut.data[0]
    mevcut_tier = int(rozet["tier"])
    test_id = rozet["test_id"]

    if mevcut_tier >= 3:
        raise HTTPException(status_code=400, detail="Zaten en yüksek sertifikasyon seviyesindesiniz (Tier 3).")

    content = await dosya.read()
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=422, detail="Dosya boyutu 50 MB'ı aşmamalı")

    ad = (dosya.filename or "").lower()
    mime_type = dosya.content_type or ""
    if not mime_type or mime_type == "application/octet-stream":
        if ad.endswith(".pdf"):             mime_type = "application/pdf"
        elif ad.endswith((".jpg", ".jpeg")): mime_type = "image/jpeg"
        elif ad.endswith(".png"):            mime_type = "image/png"

    analiz = cagir_belge_analizi(content, mime_type)

    if analiz.get("error") == "taranmis_pdf":
        raise HTTPException(status_code=422, detail="Taranmış PDF okunamıyor. JPG veya PNG olarak deneyin.")

    if not analiz.get("is_valid_document"):
        return {
            "yukseltildi": False,
            "mevcut_tier": mevcut_tier,
            "mesaj": "Belge geçerli değil veya tanınamadı. Ekran görüntüsü yerine orijinal belgeyi yükleyin.",
            "analiz": analiz,
        }

    confidence = int(analiz.get("confidence_score", 0))
    if confidence < 75:
        return {
            "yukseltildi": False,
            "mevcut_tier": mevcut_tier,
            "mesaj": f"Belge yeterince güvenilir değil (güven skoru: {confidence}/100). Orijinal, yüksek kaliteli belge yükleyin.",
            "analiz": analiz,
        }

    if analiz.get("is_expired"):
        return {
            "yukseltildi": False,
            "mevcut_tier": mevcut_tier,
            "mesaj": "Belgenin geçerlilik süresi dolmuş. Güncel bir belge yükleyin.",
            "analiz": analiz,
        }

    estimated_tier = analiz.get("estimated_tier")
    if not estimated_tier:
        return {
            "yukseltildi": False,
            "mevcut_tier": mevcut_tier,
            "mesaj": "Belge tanındı ancak sertifikasyon tier'ı belirlenemedi.",
            "analiz": analiz,
        }

    hedef_tier = int(estimated_tier)
    if hedef_tier <= mevcut_tier:
        return {
            "yukseltildi": False,
            "mevcut_tier": mevcut_tier,
            "mesaj": f"Bu belge mevcut Tier {mevcut_tier} seviyenizden yüksek bir sertifikasyona karşılık gelmiyor.",
            "analiz": analiz,
        }

    yeni_tier = min(hedef_tier, 3)

    supabase.table("rozet_testleri") \
        .update({"tier": yeni_tier, "guncelleme_tarihi": datetime.now(timezone.utc).isoformat()}) \
        .eq("test_id", test_id) \
        .execute()

    belge = {
        "test_id": test_id,
        "satici_id": satici_id,
        "soru_id": f"tier{yeni_tier}_yukselme",
        "dosya_adi": dosya.filename or "",
        "dosya_boyutu": len(content),
        "storage_yolu": "",
        "mime_tipi": mime_type,
    }
    supabase.table("rozet_belgeleri").insert(belge).execute()

    return {
        "yukseltildi": True,
        "onceki_tier": mevcut_tier,
        "yeni_tier": yeni_tier,
        "mesaj": f"Tebrikler! Tier {yeni_tier} seviyesine yükseltildiniz.",
        "analiz": analiz,
    }


@app.post("/satici/rozet/aksiyon-acikla")
def rozet_aksiyon_acikla(veri: AksiyelAciklaRequest, kullanici: dict = Depends(sadece_satici)):
    prompt = f"""Sen bir sürdürülebilirlik danışmanısın. Türkçe konuşan bir e-ticaret satıcısına rehberlik ediyorsun.

Mevcut Tier: {veri.tier}
Aksiyon Adımı: {veri.aksiyon}

Bu aksiyonu 2-3 kısa cümleyle açıkla:
- Bu adımın neden önemli olduğunu belirt
- Satıcının somut olarak ne yapması gerektiğini söyle
- Başlamak için pratik bir ipucu ver

Sadece JSON formatında yanıt ver: {{"aciklama": "..."}}"""

    yanit = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {GEMINI_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": "google/gemini-2.0-flash-001",
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"},
            "max_tokens": 300,
        },
        timeout=20,
    )

    if not yanit.ok:
        raise HTTPException(status_code=502, detail="AI servisi yanıt vermedi")

    try:
        icerik = yanit.json()["choices"][0]["message"]["content"]
        veri_json = json.loads(icerik)
        return {"aciklama": veri_json.get("aciklama", "Açıklama üretilemedi.")}
    except Exception:
        raise HTTPException(status_code=502, detail="AI yanıtı işlenemedi")


@app.post("/satici/rozet/ai-analiz")
def rozet_ai_analiz(veri: AIAnalizTalep, kullanici: dict = Depends(sadece_satici)):
    satici_id = kullanici["id"]
    simdi = datetime.now(timezone.utc)
    gecerlilik = simdi + timedelta(days=180)

    ai_sonuc = cagir_gemini_analizi(veri.ozet_metin, veri.skor, veri.tier)
    ai_tier = 1  # Her değerlendirme Tier 1 ile başlar; belge yüklenerek yükseltilir
    ai_skor = max(0, min(100, int(ai_sonuc.get("skor", veri.skor))))
    ai_sonuc["tier"] = 1

    rozet_id = _rozet_id_olustur(veri.sektor)

    mevcut = supabase.table("rozet_testleri") \
        .select("test_id") \
        .eq("satici_id", satici_id) \
        .eq("durum", "taslak") \
        .order("olusturma_tarihi", desc=True) \
        .limit(1) \
        .execute()

    kirilim_listesi = [m.model_dump() for m in veri.kirilim]

    payload = {
        "durum": "tamamlandi",
        "cevaplar": veri.cevaplar,
        "sektor": veri.sektor,
        "skor": ai_skor,
        "tier": ai_tier,
        "guven_skoru": veri.guven_skoru,
        "kirilim": kirilim_listesi,
        "rozet_id": rozet_id,
        "ai_analiz": ai_sonuc,
        "kazanim_tarihi": simdi.isoformat(),
        "gecerlilik_sonu": gecerlilik.isoformat(),
        "tamamlanma_tarihi": simdi.isoformat(),
        "guncelleme_tarihi": simdi.isoformat(),
    }

    if mevcut.data:
        test_id = mevcut.data[0]["test_id"]
        sonuc = supabase.table("rozet_testleri") \
            .update(payload) \
            .eq("test_id", test_id) \
            .execute()
    else:
        payload["satici_id"] = satici_id
        sonuc = supabase.table("rozet_testleri").insert(payload).execute()

    if not sonuc.data:
        raise HTTPException(status_code=500, detail="Rozet kaydedilemedi")

    test_id = sonuc.data[0]["test_id"]

    dosya_sorulari = [
        qid for qid, cevap in veri.cevaplar.items()
        if isinstance(cevap, dict) and cevap.get("type") == "file"
    ]
    for qid in dosya_sorulari:
        cevap = veri.cevaplar[qid]
        belge = {
            "test_id": test_id,
            "satici_id": satici_id,
            "soru_id": qid,
            "dosya_adi": cevap.get("name", ""),
            "dosya_boyutu": cevap.get("size"),
            "storage_yolu": cevap.get("path", ""),
            "mime_tipi": cevap.get("mime"),
        }
        supabase.table("rozet_belgeleri").upsert(belge, on_conflict="test_id,soru_id").execute()

    return {
        "mesaj": "AI analizi tamamlandı",
        "rozet_id": rozet_id,
        "test_id": test_id,
        "tier": ai_tier,
        "skor": ai_skor,
        "gecerlilik_sonu": gecerlilik.isoformat(),
        "ai": ai_sonuc,
    }


@app.get("/satici/rozet/gecmis")
def rozet_gecmis(kullanici: dict = Depends(sadece_satici)):
    sonuc = supabase.table("rozet_testleri") \
        .select("test_id, durum, sektor, skor, tier, rozet_id, kazanim_tarihi, gecerlilik_sonu, tamamlanma_tarihi, olusturma_tarihi") \
        .eq("satici_id", kullanici["id"]) \
        .order("olusturma_tarihi", desc=True) \
        .execute()
    return {"gecmis": sonuc.data or []}


@app.post("/musteri/giris")
def musteri_giris(giris: GirisYap):
    sonuc = supabase.table("musteriler").select("*").eq("e_posta", giris.e_posta).execute()

    if not sonuc.data:
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı")

    musteri = sonuc.data[0]

    if not sifreyi_dogrula(giris.sifre, musteri["sifre"]):
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı")

    token = token_olustur(musteri["musteri_id"], musteri["e_posta"], "musteri")

    return {
        "access_token": token,
        "token_type": "bearer",
        "musteri": {
            "musteri_id": musteri["musteri_id"],
            "musteri_ad": musteri["musteri_ad"],
            "musteri_soyad": musteri["musteri_soyad"],
            "e_posta": musteri["e_posta"],
        }
    }
