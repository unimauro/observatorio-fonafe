# -*- coding: utf-8 -*-
"""
API FastAPI del Observatorio de Empresas Públicas del Perú.

⚠️  OPCIONAL — solo para entornos con servidor (local / Docker / VPS).
    El sitio público vive en GitHub Pages y NO usa esta API: consume el JSON
    estático generado por el ETL. Esta API existe para integraciones server-side
    y para cuando se conecte una base PostgreSQL real (ver backend/app/db).
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import API_TITLE, API_VERSION, CORS_ORIGINS
from .api.routers import router

app = FastAPI(title=API_TITLE, version=API_VERSION,
              description="API REST sobre datos de empresas estatales del Perú (FONAFE). Opcional/local.")
app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS, allow_methods=["*"], allow_headers=["*"])
app.include_router(router, prefix="/api")


@app.get("/")
def root():
    return {"name": API_TITLE, "version": API_VERSION, "docs": "/docs",
            "note": "El sitio público es estático (GitHub Pages). Esta API es opcional."}
