import os
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import supabase
from routers import auth, rozet, karbon
from schemas import WebhookPayload

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(rozet.router)
app.include_router(karbon.router)


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


_frontend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend")
if os.path.isdir(_frontend_dir):
    app.mount("/", StaticFiles(directory=_frontend_dir, html=True), name="frontend")
