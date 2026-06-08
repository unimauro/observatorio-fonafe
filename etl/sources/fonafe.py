# -*- coding: utf-8 -*-
"""
Scraper FONAFE (esqueleto) — lista de empresas, sector, directorio y memorias.

Fuentes objetivo (Fase 1 del roadmap):
  - Portal FONAFE: https://www.fonafe.gob.pe/  (empresas del holding)
  - Portal de Transparencia Estándar (PTE) de cada empresa: directorio, EE.FF., presupuesto
  - SMV (https://www.smv.gob.pe/) para empresas que reportan estados financieros

Se deja como esqueleto con la firma esperada por build_dataset.py; el HTML de los
portales cambia con frecuencia, por eso el parseo concreto se itera en la Fase 1.
"""
import requests

HEADERS = {"User-Agent": "ObservatorioEmpresasPublicas/0.1 (+https://unimauro.github.io/observatorio-fonafe/)"}
TIMEOUT = 30


def fetch_companies():
    """Devuelve la lista de empresas del holding FONAFE.

    TODO Fase 1: parsear el directorio oficial. Por ahora retorna [] para que el ETL
    use la semilla de seed_data.py sin romperse.
    """
    return []


def fetch_company_profile(slug_or_ruc: str):
    """Perfil de una empresa: directorio, web, memorias, EE.FF. (TODO Fase 1)."""
    return None


if __name__ == "__main__":
    print("FONAFE scraper — esqueleto. Implementar parseo en Fase 1.")
