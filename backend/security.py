import os
import bcrypt
from jose import jwt
from datetime import datetime, timedelta, timezone

SECRET_KEY = os.getenv("SECRET_KEY", "leafpay-super-gizli-anahtar-2024")
ALGORITHM = "HS256"
TOKEN_SURE_DAKIKA = 60 * 24  # 24 saat

def sifreyi_hashle(sifre: str) -> str:
    return bcrypt.hashpw(sifre.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def sifreyi_dogrula(sifre: str, hashli_sifre: str) -> bool:
    return bcrypt.checkpw(sifre.encode("utf-8"), hashli_sifre.encode("utf-8"))

def token_olustur(kullanici_id: int, e_posta: str, rol: str) -> str:
    bitis = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_SURE_DAKIKA)
    veri = {"sub": e_posta, "id": kullanici_id, "rol": rol, "exp": bitis}
    return jwt.encode(veri, SECRET_KEY, algorithm=ALGORITHM)

def token_dogrula(token: str) -> dict:
    try:
        veri = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return veri
    except jwt.ExpiredSignatureError:
        raise ValueError("Token süresi dolmuş")
    except jwt.JWTError:
        raise ValueError("Geçersiz token")
