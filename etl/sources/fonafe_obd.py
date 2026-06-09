# -*- coding: utf-8 -*-
"""
Cliente del Observatorio Digital de FONAFE — indicadores REALES con META y % de alcance.

Backend (API JSON abierta, sin auth) detrás de https://observatoriodigital.fonafe.gob.pe/
    https://fonafe-back-7bj3htmjnq-uc.a.run.app/api

Lo valioso (que ellos NO ofrecen como descarga y nosotros sí): cada indicador trae
ValorIndicador + ValorMeta + ValorAlcance (cumplimiento %), mensual 2021–2026, por sector.

Endpoints usados:
  /Reporte01/Get_Indicador                                  -> catálogo de indicadores
  /Dashboard/indicadores-financieras?indicador=ID&anio=Y&mes=0   -> serie mensual (bloque "Evolutivo por mes")

Cachea en etl/cache/fonafe_indicators.json (versionado). Riesgo: backend interno, podría cambiar;
por eso guardamos el snapshot.
"""
import json
import os
import time
import urllib.request

API = "https://fonafe-back-7bj3htmjnq-uc.a.run.app/api"
HEADERS = {"User-Agent": "ObservatorioEmpresasPublicas/0.1 (+https://unimauro.github.io/observatorio-fonafe/)"}
TIMEOUT = 30
CACHE = os.path.join(os.path.dirname(__file__), "..", "cache", "fonafe_indicators.json")

# Indicadores de mayor valor para decisión (id -> nombre). Solo financieras (sector-level fiable).
INDICATORS = {4: "ROE", 3: "ROA", 5: "Margen Neto", 11: "EBITDA", 14: "Utilidad Neta",
              1: "Liquidez", 2: "Solvencia", 6: "Endeudamiento"}
YEARS = [2024, 2025, 2026]


def _get(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return json.load(r)


def _unwrap(j):
    try:
        return j["data"]["Result"] or []
    except Exception:  # noqa: BLE001
        return []


def fetch_indicator_units():
    rows = _unwrap(_get(f"{API}/Reporte01/Get_Indicador"))
    return {r["IdIndicador"]: r.get("Unidad", "") for r in rows}


SECTORS = ["Distribuidoras de Electricidad", "Generadoras de Electricidad",
           "Transportes y Comunicaciones", "Saneamiento", "Hidrocarburos y Remediación",
           "Servicios y Producción", "Salud", "Defensa"]


def _collect(rows, out, seen, units_by_name, comp_out=None, comp_seen=None):
    """Sector-level 'Evolutivo por mes' -> out; per-empresa 'Avance Por Empresa' -> comp_out."""
    for r in rows or []:
        if r.get("ValorIndicador") is None:
            continue
        name = r.get("IndicadorNombre", "")
        bloque = r.get("Bloque")
        empresa = r.get("Empresa")
        if bloque == "Evolutivo por mes" and not empresa:
            key = (name, r.get("Sector", ""), r.get("IdFecha"))
            if key in seen:
                continue
            seen.add(key)
            out.append(dict(
                indicator=name, unit=units_by_name.get(name, ""),
                sector=r.get("Sector", ""), year=r.get("Anio"),
                idFecha=r.get("IdFecha"), month=r.get("Mes", ""),
                value=r.get("ValorIndicador"), meta=r.get("ValorMeta"), alcance=r.get("ValorAlcance"),
            ))
        elif bloque == "Avance Por Empresa" and empresa and comp_out is not None:
            key = (empresa, name)
            if key in comp_seen:
                continue
            comp_seen.add(key)
            comp_out.append(dict(
                empresa=empresa, indicator=name, unit=units_by_name.get(name, ""),
                sector=r.get("Sector", ""), year=r.get("Anio"), idFecha=r.get("IdFecha"),
                month=r.get("Mes", ""), value=r.get("ValorIndicador"),
                meta=r.get("ValorMeta"), alcance=r.get("ValorAlcance"),
            ))


def fetch():
    """Serie mensual sector-level (valor/meta/alcance): Finanzas vía 'financieras',
    resto de sectores vía 'no-financieras' (barrido por id)."""
    cat = _unwrap(_get(f"{API}/Reporte01/Get_Indicador"))
    units_by_name = {}
    for c in cat:
        units_by_name[c.get("Nombre", "")] = c.get("Unidad", "")
        if c.get("NombreNoFinanciera"):
            units_by_name[c["NombreNoFinanciera"]] = c.get("UnidadNoFinanciera", "")
    out, seen, comp, comp_seen = [], set(), [], set()
    # Finanzas (endpoint financieras, por indicador conocido)
    for iid in INDICATORS:
        for y in YEARS:
            try:
                _collect(_unwrap(_get(f"{API}/Dashboard/indicadores-financieras?indicador={iid}&anio={y}&mes=12")), out, seen, units_by_name, comp, comp_seen)
            except Exception:  # noqa: BLE001
                pass
            time.sleep(0.05)
    # Resto de sectores (endpoint no-financieras, barrido de ids)
    for sec in SECTORS:
        secq = sec.replace(" ", "%20")
        for iid in range(1, 16):
            for y in YEARS:
                try:
                    _collect(_unwrap(_get(f"{API}/Dashboard/indicadores-no-financieras?sector={secq}&indicador={iid}&anio={y}&mes=12")), out, seen, units_by_name, comp, comp_seen)
                except Exception:  # noqa: BLE001
                    pass
                time.sleep(0.03)
    print(f"[fonafe] sector: {len(out)} puntos · empresa: {len(comp)} puntos ({len(set(c['empresa'] for c in comp))} empresas)")
    return out, comp


CACHE_COMP = os.path.join(os.path.dirname(__file__), "..", "cache", "fonafe_companies.json")


def update_cache():
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    data, comp = fetch()
    if data:
        json.dump(data, open(CACHE, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    if comp:
        json.dump(comp, open(CACHE_COMP, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"[fonafe] caché: {len(data)} sector · {len(comp)} empresa")
    return data, comp


def load_cache():
    return json.load(open(CACHE, encoding="utf-8")) if os.path.exists(CACHE) else []


def load_company_cache():
    return json.load(open(CACHE_COMP, encoding="utf-8")) if os.path.exists(CACHE_COMP) else []


if __name__ == "__main__":
    update_cache()
