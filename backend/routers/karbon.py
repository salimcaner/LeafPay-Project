import io

import openpyxl
import xlrd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from ai.client import GEMINI_API_KEY, openrouter_cagir
from ai.prompts import karbon_cikart_prompt
from database import supabase
from dependencies import sadece_satici

router = APIRouter()

_FAKTORLER = {
    "electricity": {"faktor": 0.42,  "label": "Elektrik",     "color": "#1D9E75"},
    "gas":         {"faktor": 2.0,   "label": "Dogalgaz",     "color": "#0F6A4F"},
    "fuel":        {"faktor": 2.31,  "label": "Arac yakiti",  "color": "#085041"},
    "cargo":       {"faktor": 0.12,  "label": "Kargo",        "color": "#4FB893"},
    "plastic":     {"faktor": 6.0,   "label": "Plastik amb.", "color": "#EF9F27"},
    "cardboard":   {"faktor": 1.1,   "label": "Karton amb.",  "color": "#F5B656"},
}


def _excel_xlsx_oku(content: bytes) -> str:
    wb = openpyxl.load_workbook(io.BytesIO(content), data_only=True, read_only=True)
    lines = []
    for sheet in wb.worksheets:
        lines.append(f"--- Sayfa: {sheet.title} ---")
        for row in sheet.iter_rows(values_only=True):
            vals = [str(v) if v is not None else "" for v in row]
            if any(v.strip() for v in vals):
                lines.append("\t".join(vals))
    wb.close()
    return "\n".join(lines)


def _excel_xls_oku(content: bytes) -> str:
    wb = xlrd.open_workbook(file_contents=content)
    lines = []
    for sheet in wb.sheets():
        lines.append(f"--- Sayfa: {sheet.name} ---")
        for row_idx in range(sheet.nrows):
            vals = [str(sheet.cell_value(row_idx, col)) for col in range(sheet.ncols)]
            if any(v.strip() for v in vals):
                lines.append("\t".join(vals))
    return "\n".join(lines)


def _dosyadan_metin_cikart(content: bytes, mime_type: str, filename: str) -> str:
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    print(f"[karbon] Dosya: ad={filename!r}, ext={ext!r}, mime={mime_type!r}, boyut={len(content)}")

    if ext in ("xlsx", "xls") or "spreadsheet" in mime_type or "excel" in mime_type:
        if ext == "xls" or "vnd.ms-excel" in mime_type:
            try:
                result = _excel_xls_oku(content)
                print(f"[karbon] XLS parse OK: {len(result)} karakter")
                return result
            except Exception as e:
                print(f"[karbon] XLS parse hatasi: {e}")
                return ""
        else:
            try:
                result = _excel_xlsx_oku(content)
                print(f"[karbon] XLSX parse OK: {len(result)} karakter")
                return result
            except Exception as e:
                print(f"[karbon] XLSX parse hatasi: {e}")
                # openpyxl .xls dosyasını reddedebilir, xlrd ile tekrar dene
                try:
                    result = _excel_xls_oku(content)
                    print(f"[karbon] XLS fallback OK: {len(result)} karakter")
                    return result
                except Exception as e2:
                    print(f"[karbon] XLS fallback hatasi: {e2}")
                    return ""
    if ext == "csv" or "csv" in mime_type:
        try:
            return content.decode("utf-8", errors="ignore")
        except Exception:
            return ""
    if ext == "pdf" or "pdf" in mime_type:
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(content))
            return "\n".join(p.extract_text() or "" for p in reader.pages)
        except Exception:
            return ""
    try:
        return content.decode("utf-8", errors="ignore")[:12000]
    except Exception:
        return ""


@router.post("/satici/karbon/dosya-analiz")
async def karbon_dosya_analiz(
    dosya: UploadFile = File(...),
    kullanici: dict = Depends(sadece_satici),
):
    content = await dosya.read()
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Dosya 50MB'den büyük olamaz")

    mime_type = dosya.content_type or "application/octet-stream"
    filename = dosya.filename or ""
    file_text = _dosyadan_metin_cikart(content, mime_type, filename)

    if not file_text.strip():
        print(f"[karbon] Dosya içeriği bos geldi: ext={filename.rsplit('.', 1)[-1] if '.' in filename else 'yok'!r}")
        raise HTTPException(
            status_code=422,
            detail="Dosya içeriği okunamadı. .xlsx veya .csv formatında, veri içeren bir dosya yükleyin."
        )

    # Alan adı eşleştirme: AI farklı isimler döndürürse bunları bizim alanlara çevir
    _ALAN_MAP = {
        "travel": "cargo", "seyahat": "cargo", "nakliye": "cargo", "lojistik": "cargo",
        "paper_cardboard": "cardboard", "paper": "cardboard", "karton": "cardboard", "kagit": "cardboard",
        "benzin": "fuel", "motorin": "fuel", "yakit": "fuel",
        "elektrik": "electricity", "dogalgaz": "gas",
        "plastik": "plastic",
    }

    try:
        ham = openrouter_cagir(karbon_cikart_prompt(file_text), temperature=0.1, timeout=60)
        print(f"[karbon] Ham veriler: {ham}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI servisi yanıt vermedi: {str(e)}")

    # AI "aylar" nested yapısı döndürdüyse ayların ortalamasını al
    if "aylar" in ham and isinstance(ham["aylar"], dict):
        aylar = ham["aylar"]
        n = len(aylar)
        if n > 0:
            toplam_dict: dict = {}
            for ay_veri in aylar.values():
                if isinstance(ay_veri, dict):
                    for k, v in ay_veri.items():
                        toplam_dict[k] = toplam_dict.get(k, 0.0) + float(v or 0)
            ham = {k: round(v / n, 2) for k, v in toplam_dict.items()}
            ham["veri_kalitesi"] = ham.pop("veri_kalitesi", "orta") if "veri_kalitesi" in ham else "orta"
        ham.setdefault("veri_kalitesi", "orta")
        ham.setdefault("ozet", "")
        print(f"[karbon] Aylar ortalaması alındı ({n} ay): {ham}")

    # Farklı alan adlarını bizim adlara çevir
    for eski, yeni in _ALAN_MAP.items():
        if eski in ham and yeni not in ham:
            ham[yeni] = ham.pop(eski)

    breakdown = []
    toplam = 0.0
    for key, meta in _FAKTORLER.items():
        miktar = float(ham.get(key) or 0)
        co2 = round(miktar * meta["faktor"], 2)
        toplam += co2
        breakdown.append({"key": key, "label": meta["label"], "co2": co2, "color": meta["color"]})
    breakdown.sort(key=lambda x: x["co2"], reverse=True)
    toplam = round(toplam, 2)

    sonuc = {
        "toplam": toplam,
        "breakdown": breakdown,
        "ozet": str(ham.get("ozet", "")),
        "veri_kalitesi": str(ham.get("veri_kalitesi", "orta")),
        "uyari": None,
    }

    try:
        supabase.table("karbon_analizleri").insert({
            "satici_id": kullanici["id"],
            "toplam": sonuc["toplam"],
            "breakdown": sonuc["breakdown"],
            "ozet": sonuc["ozet"],
            "veri_kalitesi": sonuc["veri_kalitesi"],
        }).execute()
    except Exception:
        pass

    print(f"[karbon] Sonuc: toplam={toplam}, breakdown={breakdown}")
    return sonuc


@router.get("/satici/karbon/son-analiz")
def karbon_son_analiz(kullanici: dict = Depends(sadece_satici)):
    sonuc = supabase.table("karbon_analizleri") \
        .select("toplam, breakdown, ozet, veri_kalitesi, olusturulma") \
        .eq("satici_id", kullanici["id"]) \
        .order("olusturulma", desc=True) \
        .limit(1) \
        .execute()
    if not sonuc.data:
        return {"analiz": None}
    row = sonuc.data[0]
    return {
        "analiz": {
            "total": float(row["toplam"]),
            "breakdown": row["breakdown"],
            "ozet": row["ozet"],
            "veri_kalitesi": row["veri_kalitesi"],
            "olusturulma": row["olusturulma"],
        }
    }
