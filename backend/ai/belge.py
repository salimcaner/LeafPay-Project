import base64
import io

from ai.client import openrouter_cagir
from ai.prompts import BELGE_ANALIZ_PROMPT

_HATA_DONUSU = {
    "is_valid_document": False,
    "document_type": None,
    "company_name": None,
    "issue_date": None,
    "expiry_date": None,
    "is_expired": None,
    "verification_code": None,
    "issuing_body": None,
    "estimated_tier": None,
    "confidence_score": 0,
}

_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


def _pdf_metni_cikart(content: bytes) -> str:
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(content))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception:
        return ""


def cagir_belge_analizi(content: bytes, mime_type: str) -> dict:
    from ai.client import GEMINI_API_KEY
    if not GEMINI_API_KEY:
        return _HATA_DONUSU

    if mime_type in _IMAGE_TYPES:
        b64 = base64.b64encode(content).decode()
        message_content = [
            {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{b64}"}},
            {"type": "text", "text": BELGE_ANALIZ_PROMPT},
        ]
    elif mime_type == "application/pdf":
        metin = _pdf_metni_cikart(content)
        if not metin or len(metin.strip()) < 30:
            return {**_HATA_DONUSU, "error": "taranmis_pdf"}
        message_content = [{"type": "text", "text": f"{BELGE_ANALIZ_PROMPT}\n\nBELGE METNİ:\n{metin[:4000]}"}]
    else:
        return _HATA_DONUSU

    try:
        result = openrouter_cagir(message_content, temperature=0.1, timeout=40)
        if result.get("estimated_tier") is not None:
            result["estimated_tier"] = max(2, min(3, int(result["estimated_tier"])))
        result["confidence_score"] = max(0, min(100, int(result.get("confidence_score", 0))))
        return result
    except Exception as e:
        print(f"[BELGE] Hata: {e}")
        return _HATA_DONUSU
