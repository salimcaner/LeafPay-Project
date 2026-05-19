import json
import os

import requests
from fastapi import HTTPException

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

_OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
_MODEL = "google/gemini-2.0-flash-001"


def openrouter_cagir(
    message_content,
    *,
    temperature: float = 0.3,
    timeout: int = 90,
    max_tokens: int | None = None,
) -> dict:
    """OpenRouter üzerinden Gemini'ye istek atar ve JSON dict döndürür.

    HTTP veya parse hatalarını olduğu gibi fırlatır — çağıran katman yönetir.
    """
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="AI servisi yapılandırılmamış")

    headers = {
        "Authorization": f"Bearer {GEMINI_API_KEY}",
        "Content-Type": "application/json",
    }
    body: dict = {
        "model": _MODEL,
        "messages": [{"role": "user", "content": message_content}],
        "response_format": {"type": "json_object"},
        "temperature": temperature,
    }
    if max_tokens is not None:
        body["max_tokens"] = max_tokens

    resp = requests.post(_OPENROUTER_URL, json=body, headers=headers, timeout=timeout)
    resp.raise_for_status()
    return json.loads(resp.json()["choices"][0]["message"]["content"])
