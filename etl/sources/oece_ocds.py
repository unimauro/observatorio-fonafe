# -*- coding: utf-8 -*-
"""
Cliente de la API OCDS del OECE (ex-OSCE) — contrataciones del Estado peruano.

Estándar OCDS (Open Contracting Data Standard). Base:
    https://contratacionesabiertas.oece.gob.pe/api/v1

Permite traer los procesos de contratación de CADA empresa estatal por RUC.
Este cliente es la base de la Fase 1 del roadmap (contrataciones REALES).
Se invoca desde el Action programado; build_dataset.py lo usará con --with-contracts.
"""
import requests

BASE = "https://contratacionesabiertas.oece.gob.pe/api/v1"
HEADERS = {"User-Agent": "ObservatorioEmpresasPublicas/0.1 (+https://unimauro.github.io/observatorio-fonafe/)"}
TIMEOUT = 30


def fetch_releases_by_ruc(ruc: str, page: int = 1):
    """Devuelve releases OCDS donde la entidad contratante coincide con el RUC dado.

    Nota: el endpoint y parámetros exactos pueden variar; ajustar según el catálogo
    publicado del OECE. Se deja parametrizado para iterar sin reescribir el ETL.
    """
    try:
        r = requests.get(f"{BASE}/releases", params={"buyer.id": ruc, "page": page},
                         headers=HEADERS, timeout=TIMEOUT)
        r.raise_for_status()
        return r.json()
    except Exception as e:  # noqa: BLE001
        print(f"[oece] aviso: no se pudo consultar RUC {ruc}: {e}")
        return None


def normalize(releases_json):
    """Aplana releases OCDS a la forma que consume el dashboard."""
    out = []
    if not releases_json:
        return out
    for rel in releases_json.get("releases", []):
        for award in rel.get("awards", []) or []:
            for s in award.get("suppliers", []) or []:
                value = (award.get("value") or {}).get("amount", 0)
                out.append(dict(
                    id=rel.get("ocid", ""),
                    provider=s.get("name", "—"),
                    amount=round((value or 0) / 1_000_000, 3),  # a S/ MM
                    year=(rel.get("date", "")[:4] or None),
                    object=(rel.get("tender", {}) or {}).get("title", ""),
                    method=(rel.get("tender", {}) or {}).get("procurementMethodDetails", ""),
                ))
    return out


if __name__ == "__main__":
    # smoke test manual
    data = fetch_releases_by_ruc("20100030595")  # Banco de la Nación
    print("releases:", len(normalize(data)))
