from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional

from database import supabase
from dependencies import sadece_satici, sadece_musteri
from schemas import SaticiKayit, MusteriKayit, GirisYap
from security import sifreyi_hashle, sifreyi_dogrula, token_olustur

router = APIRouter()


@router.post("/satici/kayit")
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


@router.post("/musteri/kayit")
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


@router.post("/satici/giris")
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


@router.post("/musteri/giris")
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


@router.get("/satici/profil")
def satici_profil(kullanici: dict = Depends(sadece_satici)):
    sonuc = supabase.table("saticilar").select("*").eq("account_id", kullanici["id"]).execute()
    if not sonuc.data:
        raise HTTPException(status_code=404, detail="Satıcı bulunamadı")
    profil = sonuc.data[0]
    del profil["sifre"]
    return profil


@router.get("/musteri/profil")
def musteri_profil(kullanici: dict = Depends(sadece_musteri)):
    sonuc = supabase.table("musteriler").select("*").eq("musteri_id", kullanici["id"]).execute()
    if not sonuc.data:
        raise HTTPException(status_code=404, detail="Müşteri bulunamadı")
    profil = sonuc.data[0]
    del profil["sifre"]
    return profil


@router.get("/satici/webhook-logs")
def satici_webhook_logs(kullanici: dict = Depends(sadece_satici)):
    sonuc = supabase.table("webhook_logs") \
        .select("*") \
        .eq("satici_id", kullanici["id"]) \
        .order("created_at", desc=True) \
        .limit(50) \
        .execute()
    return {"logs": sonuc.data}
