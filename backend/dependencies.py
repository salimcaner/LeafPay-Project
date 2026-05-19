from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from security import token_dogrula

bearer = HTTPBearer()


def aktif_kullanici(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    try:
        return token_dogrula(credentials.credentials)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


def sadece_satici(kullanici: dict = Depends(aktif_kullanici)) -> dict:
    if kullanici.get("rol") != "satici":
        raise HTTPException(status_code=403, detail="Bu işlem için satıcı girişi gerekli")
    return kullanici


def sadece_musteri(kullanici: dict = Depends(aktif_kullanici)) -> dict:
    if kullanici.get("rol") != "musteri":
        raise HTTPException(status_code=403, detail="Bu işlem için müşteri girişi gerekli")
    return kullanici
