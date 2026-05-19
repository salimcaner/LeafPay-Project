import random
import string
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from ai.belge import cagir_belge_analizi
from ai.esg import cagir_esg_analizi
from ai.gemini import cagir_gemini_analizi, cagir_aksiyon_aciklama
from database import supabase
from dependencies import sadece_satici
from schemas import AIAnalizTalep, AksiyelAciklaRequest, RozetTaslakKayit, RozetTamamla

router = APIRouter()


def _rozet_id_olustur(sektor: Optional[str]) -> str:
    yil = datetime.now(timezone.utc).year
    prefix = (sektor or "gn")[:2].upper()
    rastgele = "".join(random.choices(string.digits, k=4))
    return f"LP-{prefix}-{yil}-{rastgele}"


@router.get("/satici/rozet")
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


@router.get("/satici/rozet/gecmis")
def rozet_gecmis(kullanici: dict = Depends(sadece_satici)):
    sonuc = supabase.table("rozet_testleri") \
        .select("test_id, durum, sektor, skor, tier, rozet_id, kazanim_tarihi, gecerlilik_sonu, tamamlanma_tarihi, olusturma_tarihi") \
        .eq("satici_id", kullanici["id"]) \
        .order("olusturma_tarihi", desc=True) \
        .execute()
    return {"gecmis": sonuc.data or []}


@router.post("/satici/rozet/draft")
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


@router.delete("/satici/rozet/draft")
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


@router.post("/satici/rozet/tamamla")
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


@router.post("/satici/rozet/belge-analiz")
async def rozet_belge_analiz(
    dosya: UploadFile = File(...),
    kullanici: dict = Depends(sadece_satici),
):
    MAX_BOYUT = 50 * 1024 * 1024
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


@router.post("/satici/rozet/esg-analiz")
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
        if ad.endswith(".pdf"):
            mime_type = "application/pdf"
        elif ad.endswith((".jpg", ".jpeg")):
            mime_type = "image/jpeg"
        elif ad.endswith(".png"):
            mime_type = "image/png"

    sonuc = cagir_esg_analizi(content, mime_type)

    if not sonuc.get("is_esg_report"):
        raise HTTPException(status_code=422, detail="Yüklenen belge bir ESG veya sürdürülebilirlik raporu değil. Lütfen geçerli bir ESG raporu yükleyin.")

    ai_tier = 1
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


@router.post("/satici/rozet/tier-yukselme")
async def rozet_tier_yukselme(
    dosya: UploadFile = File(...),
    kullanici: dict = Depends(sadece_satici),
):
    satici_id = kullanici["id"]

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
        if ad.endswith(".pdf"):
            mime_type = "application/pdf"
        elif ad.endswith((".jpg", ".jpeg")):
            mime_type = "image/jpeg"
        elif ad.endswith(".png"):
            mime_type = "image/png"

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


@router.post("/satici/rozet/aksiyon-acikla")
def rozet_aksiyon_acikla(veri: AksiyelAciklaRequest, kullanici: dict = Depends(sadece_satici)):
    aciklama = cagir_aksiyon_aciklama(veri.tier, veri.aksiyon)
    return {"aciklama": aciklama}


@router.post("/satici/rozet/ai-analiz")
def rozet_ai_analiz(veri: AIAnalizTalep, kullanici: dict = Depends(sadece_satici)):
    satici_id = kullanici["id"]
    simdi = datetime.now(timezone.utc)
    gecerlilik = simdi + timedelta(days=180)

    ai_sonuc = cagir_gemini_analizi(veri.ozet_metin, veri.skor, veri.tier)
    ai_tier = 1
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
