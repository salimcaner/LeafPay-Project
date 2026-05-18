from pydantic import BaseModel, EmailStr, field_validator
from typing import Any, Dict, List, Optional

class GirisYap(BaseModel):
    e_posta: EmailStr
    sifre: str

class SaticiKayit(BaseModel):
    sirket_adi: str
    vergi_no: str
    yetkili_ad: str
    yetkili_soyad: str
    e_posta: EmailStr
    sifre: str
    telefon_no: str
    sirket_turu: str
    sektor: str

    @field_validator("sifre")
    @classmethod
    def sifre_uzunluk(cls, v):
        if len(v) < 8:
            raise ValueError("Şifre en az 8 karakter olmalıdır")
        return v

class WebhookPayload(BaseModel):
    product_id: str
    option: str
    user_email: str
    order_id: str
    vera_points: int


class RozetTaslakKayit(BaseModel):
    cevaplar: Dict[str, Any]
    aktif_bolum_idx: int = 0
    sektor: Optional[str] = None


class RozetKirilimMaddesi(BaseModel):
    id: str
    title: str
    score: int
    max: int
    pct: int


class RozetTamamla(BaseModel):
    cevaplar: Dict[str, Any]
    skor: int
    tier: int
    guven_skoru: Optional[int] = None
    kirilim: List[RozetKirilimMaddesi]
    sektor: Optional[str] = None


class MusteriKayit(BaseModel):
    musteri_ad: str
    musteri_soyad: str
    e_posta: EmailStr
    sifre: str
    telefon_no: str

    @field_validator("sifre")
    @classmethod
    def sifre_uzunluk(cls, v):
        if len(v) < 8:
            raise ValueError("Şifre en az 8 karakter olmalıdır")
        return v