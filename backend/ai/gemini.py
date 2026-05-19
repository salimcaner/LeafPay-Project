from fastapi import HTTPException

from ai.client import openrouter_cagir
from ai.prompts import aksiyon_acikla_prompt, test_analiz_prompt


def cagir_gemini_analizi(ozet_metin: str, skor: int, tier: int) -> dict:
    fallback = {
        "tier": tier,
        "skor": skor,
        "ozet": "AI analizi tamamlandı.",
        "guclu_yonler": [],
        "zayif_yonler": [],
        "oneriler": [],
    }

    from ai.client import GEMINI_API_KEY
    if not GEMINI_API_KEY:
        return fallback

    prompt = test_analiz_prompt(ozet_metin, skor, tier)
    try:
        result = openrouter_cagir(prompt, temperature=0.3, timeout=30)
        result["tier"] = max(0, min(3, int(result.get("tier", tier))))
        result["skor"] = max(0, min(100, int(result.get("skor", skor))))
        return result
    except Exception as e:
        print(f"[GEMINI] Hata: {e}")
        return fallback


def cagir_aksiyon_aciklama(tier: int, aksiyon: str) -> str:
    prompt = aksiyon_acikla_prompt(tier, aksiyon)
    try:
        result = openrouter_cagir(prompt, temperature=0.3, timeout=30)
        return result.get("aciklama", "Açıklama üretilemedi.")
    except Exception:
        raise HTTPException(status_code=502, detail="AI servisi yanıt vermedi")
