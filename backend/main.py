from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from schemas import SaticiKayit, MusteriKayit, GirisYap, WebhookPayload
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


@app.get("/satici/webhook-logs")
def satici_webhook_logs(kullanici: dict = Depends(sadece_satici)):
    sonuc = supabase.table("webhook_logs") \
        .select("*") \
        .eq("satici_id", kullanici["id"]) \
        .order("created_at", desc=True) \
        .limit(50) \
        .execute()
    return {"logs": sonuc.data}


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
