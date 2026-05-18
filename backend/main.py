import random
import string
from datetime import datetime, timezone, timedelta

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from schemas import SaticiKayit, MusteriKayit, GirisYap, WebhookPayload, RozetTaslakKayit, RozetTamamla
from typing import Optional
from database import supabase
from security import sifreyi_hashle, sifreyi_dogrula, token_olustur, token_dogrula

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
