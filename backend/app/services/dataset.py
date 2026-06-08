# -*- coding: utf-8 -*-
"""Capa de aplicación: acceso al dataset (hoy JSON; mañana repositorio Postgres)."""
import json
import functools
from ..core.config import DATASET_PATH


@functools.lru_cache(maxsize=1)
def load_dataset() -> dict:
    with open(DATASET_PATH, encoding="utf-8") as f:
        return json.load(f)


def companies() -> list:
    return load_dataset()["companies"]


def company(slug: str):
    return next((c for c in companies() if c["slug"] == slug), None)
