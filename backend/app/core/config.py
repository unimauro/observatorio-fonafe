# -*- coding: utf-8 -*-
"""Configuración central (12-factor: vía variables de entorno)."""
import os

DATASET_PATH = os.getenv(
    "DATASET_PATH",
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "frontend", "public", "data", "latest", "dataset.json"),
)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://observatorio:observatorio@db:5432/observatorio")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
API_TITLE = "Observatorio de Empresas Públicas del Perú — API"
API_VERSION = "0.1.0"
