# -*- coding: utf-8 -*-
"""
Indicadores REALES de las EPS de saneamiento — Benchmarking Regulatorio de SUNASS.

Fuente: PDF anual del Benchmarking Regulatorio de las EPS (gob.pe/SUNASS). Contiene el
IGPSS (Índice Global de la Prestación de Servicios de Saneamiento) y 6 sub-índices por EPS:
acceso, calidad, sostenibilidad financiera, gobernabilidad, gestión de riesgo y ambiental.

Como el parseo de PDF es frágil, la extracción se hace UNA vez y se cachea en
etl/cache/sunass_eps.json (versionado). build_dataset.py lee la caché; el Action no parsea PDF.

Refrescar manualmente:  python3 etl/sources/sunass.py
"""
import json
import os
import re
import unicodedata
import urllib.request

PDF_URL = "https://cdn.www.gob.pe/uploads/document/file/8591665/7109489-benchmarking-regulatorio-de-las-eps-2025.pdf"
DATA_YEAR = 2024  # el Benchmarking 2025 reporta datos del ejercicio 2024
SOURCE = {"name": "Benchmarking Regulatorio de las EPS 2025 — SUNASS",
          "url": "https://www.gob.pe/institucion/sunass/informes-publicaciones/7109489-benchmarking-regulatorio-de-las-eps-2025"}
CACHE = os.path.join(os.path.dirname(__file__), "..", "cache", "sunass_eps.json")

# palabra clave del nombre SUNASS -> slug nuestro
NAME2SLUG = {
    "SEDAPAR": "sedapar", "SEDALIB": "sedalib", "EPSEL": "epsel", "GRAU": "eps-grau",
    "SEDACUSCO": "sedacusco", "SEDACAJ": "sedacaj", "EPSASA": "epsasa", "EMAPICA": "emapica",
    "SEDAM HUANCAYO": "sedam-huancayo", "TACNA": "eps-tacna", "SEDA HUANUCO": "seda-huanuco",
    "EMAPA SAN MARTIN": "emapa-sanmartin", "EMSAPUNO": "emsapuno", "SEDALORETO": "eps-loreto",
    "EMAPACOP": "emapacop", "EMAPAT": "emapat", "MOQUEGUA": "eps-moquegua", "EMUSAP": "emusap-amazonas",
}


def _norm(s):
    return "".join(c for c in unicodedata.normalize("NFD", s or "") if unicodedata.category(c) != "Mn").upper()


def _num(x):
    try:
        return float(re.sub(r"[^0-9.]", "", (x or "").replace(",", "")))
    except Exception:  # noqa: BLE001
        return None


def extract(pdf_path):
    import pdfplumber
    out = {}
    with pdfplumber.open(pdf_path) as pdf:
        for pi in range(88, min(98, len(pdf.pages))):
            for tb in pdf.pages[pi].extract_tables():
                for row in tb:
                    if not row or len(row) < 9:
                        continue
                    name = (row[1] or "").strip()
                    if "S.A" not in name.upper():
                        continue
                    n = _norm(name)
                    slug = next((s for k, s in NAME2SLUG.items() if k in n), None)
                    if not slug or slug in out:
                        continue
                    igpss = _num(row[8])
                    if igpss is None:
                        continue
                    out[slug] = dict(
                        epsName=name, year=DATA_YEAR,
                        igpss=igpss, acceso=_num(row[2]), calidad=_num(row[3]),
                        sostFinanciera=_num(row[4]), gobernabilidad=_num(row[5]),
                        gestionRiesgo=_num(row[6]), sostAmbiental=_num(row[7]),
                    )
    return out


def update_cache():
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    tmp = "/tmp/_sunass_bm.pdf"
    req = urllib.request.Request(PDF_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=120) as r, open(tmp, "wb") as f:
        f.write(r.read())
    data = extract(tmp)
    json.dump(data, open(CACHE, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"[sunass] {len(data)} EPS con IGPSS real -> caché")
    return data


def load_cache():
    return json.load(open(CACHE, encoding="utf-8")) if os.path.exists(CACHE) else {}


if __name__ == "__main__":
    d = update_cache()
    for slug, v in sorted(d.items()):
        print(f"  {slug:18s} IGPSS {v['igpss']}")
