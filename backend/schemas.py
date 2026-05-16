from pydantic import BaseModel, EmailStr, field_validator

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