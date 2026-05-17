import os
from dotenv import load_dotenv
from supabase import create_client, Client

# .env dosyasındaki değişkenleri yüklüyoruz
load_dotenv()

API_URL: str = os.getenv("SUPABASE_URL")
API_KEY: str = os.getenv("SUPABASE_KEY")

# Supabase istemcisini oluşturuyoruz (İşte main.py'nin aradığı değişken bu satırda)
supabase: Client = create_client(API_URL, API_KEY)