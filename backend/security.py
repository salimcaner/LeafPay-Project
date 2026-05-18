import bcrypt as _bcrypt
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone

SECRET_KEY = "leafpay-demo-secret-key-change-in-prod"
ALGORITHM = "HS256"
TOKEN_GECERLILIK_GUN = 7


def sifreyi_hashle(sifre: str) -> str:
    return _bcrypt.hashpw(sifre.encode("utf-8"), _bcrypt.gensalt()).decode("utf-8")


def sifreyi_dogrula(duz_sifre: str, hashli_sifre: str) -> bool:
    try:
        return _bcrypt.checkpw(duz_sifre.encode("utf-8"), hashli_sifre.encode("utf-8"))
    except Exception:
        return False


def token_olustur(id: int, e_posta: str, rol: str) -> str:
    payload = {
        "id": id,
        "e_posta": e_posta,
        "rol": rol,
        "exp": datetime.now(timezone.utc) + timedelta(days=TOKEN_GECERLILIK_GUN),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def token_dogrula(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as e:
        raise ValueError(f"Geçersiz token: {str(e)}")