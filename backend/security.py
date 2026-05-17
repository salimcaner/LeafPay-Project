from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "leafpay-demo-secret-key-change-in-prod"
ALGORITHM = "HS256"
TOKEN_GECERLILIK_GUN = 7


def sifreyi_hashle(sifre: str):
    return pwd_context.hash(sifre)


def sifreyi_dogrula(duz_sifre: str, hashli_sifre: str):
    return pwd_context.verify(duz_sifre, hashli_sifre)


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