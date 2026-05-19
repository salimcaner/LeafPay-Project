import base64
import io
from datetime import datetime, timezone

from fastapi import HTTPException

from ai.client import openrouter_cagir
from ai.prompts import ESG_ANALIZ_PROMPT


def _pdf_metni_cikart(content: bytes) -> str:
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(content))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception:
        return ""


def _pdf_sayfalari_goruntu_olarak(content: bytes, max_sayfa: int = 30, dpi: int = 72) -> list:
    """Taranmış PDF sayfalarını PNG görüntüsü olarak render eder (pymupdf).

    PDF max_sayfa'dan azsa hepsi gönderilir; fazlaysa raporu baştan sona
    temsil edecek şekilde eşit aralıklı örnekleme yapılır.
    """
    try:
        import fitz  # pymupdf
        doc = fitz.open(stream=content, filetype="pdf")
        toplam = len(doc)

        if toplam <= max_sayfa:
            indeksler = list(range(toplam))
        else:
            indeksler = sorted({round(i * (toplam - 1) / (max_sayfa - 1)) for i in range(max_sayfa)})

        mat = fitz.Matrix(dpi / 72, dpi / 72)
        gorseller = []
        for i in indeksler:
            pix = doc[i].get_pixmap(matrix=mat)
            gorseller.append(pix.tobytes("png"))
        doc.close()
        print(f"[ESG] {toplam} sayfalı PDF'den {len(gorseller)} sayfa örneklendi (DPI={dpi})")
        return gorseller
    except Exception as e:
        print(f"[ESG] PDF sayfa render hatası: {e}")
        return []


def cagir_esg_analizi(content: bytes, mime_type: str) -> dict:
    bugun = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    sistem_prompt = ESG_ANALIZ_PROMPT.format(bugun=bugun)

    IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}

    if mime_type in IMAGE_TYPES:
        b64 = base64.b64encode(content).decode()
        message_content = [
            {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{b64}"}},
            {"type": "text", "text": sistem_prompt},
        ]
    elif mime_type == "application/pdf":
        metin = _pdf_metni_cikart(content)
        metin_uzunluk = len(metin.strip()) if metin else 0
        print(f"[ESG] PDF metin uzunluğu: {metin_uzunluk}")
        if metin_uzunluk >= 50:
            message_content = [{"type": "text", "text": f"{sistem_prompt}\n\n--- ESG RAPORU İÇERİĞİ ---\n{metin[:18000]}"}]
        else:
            print("[ESG] Taranmış PDF, sayfa render başlıyor...")
            gorseller = _pdf_sayfalari_goruntu_olarak(content)
            if not gorseller:
                raise HTTPException(status_code=422, detail="Taranan PDF işlenemedi. Lütfen JPG/PNG olarak yükleyin.")
            print(f"[ESG] {len(gorseller)} sayfa Gemini'ye gönderiliyor...")
            message_content = [{"type": "text", "text": sistem_prompt + "\n\n[NOT: Aşağıdaki görseller taranmış bir ESG raporunun sayfalarıdır.]"}]
            for gorsel in gorseller:
                b64 = base64.b64encode(gorsel).decode()
                message_content.append({"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}})
    else:
        raise HTTPException(status_code=422, detail="Desteklenmeyen dosya türü. PDF, JPG veya PNG yükleyin.")

    try:
        return openrouter_cagir(message_content, temperature=0.3, timeout=90)
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ESG] Hata: {e}")
        raise HTTPException(status_code=502, detail="AI servisi yanıt vermedi. Lütfen tekrar deneyin.")
