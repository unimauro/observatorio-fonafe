# -*- coding: utf-8 -*-
"""
Conciliación con el Observatorio de Defensa e Interior (FUENTE DE VERDAD para FFAA).

Para SIMA, FAME y SEMAN, este Observatorio NO inventa cifras: importa el dataset
publicado por https://unimauro.github.io/observatorio-defensa-interior/ y respeta su
convención de procedencia por año: real (con fuente) vs estimado (interpolación/aprox),
y "sin datos" cuando no hay serie. Así ambos tableros comparten una sola verdad.
"""
import json
import urllib.request

URL = "https://unimauro.github.io/observatorio-defensa-interior/data/latest/dataset.json"
AUTHORITATIVE = "https://unimauro.github.io/observatorio-defensa-interior/"
HEADERS = {"User-Agent": "ObservatorioEmpresasPublicas/0.1"}
SLUGS = {"sima", "fame", "seman"}


def _get(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def _index(series):
    """{year: {'value':v,'real':bool}} desde una lista de puntos."""
    out = {}
    for p in series or []:
        out[p["year"]] = {"value": p.get("value"), "real": bool(p.get("real"))}
    return out


def fetch():
    """Devuelve las empresas FFAA normalizadas a nuestro modelo, con flags de procedencia."""
    try:
        d = _get(URL)
    except Exception as e:  # noqa: BLE001
        print(f"[defensa] aviso: no se pudo importar ({e}); se omiten overrides")
        return []
    out = []
    for c in d.get("companies", []):
        if c.get("slug") not in SLUGS:
            continue
        s = c.get("series", {})
        ing, uti = _index(s.get("ingresos")), _index(s.get("utilidad_neta"))
        pat, act = _index(s.get("patrimonio")), _index(s.get("activos"))
        years = sorted(set(ing) | set(uti) | set(pat) | set(act))
        fin = []
        for y in years:
            fin.append(dict(
                year=y,
                revenue=ing.get(y, {}).get("value"), revenueReal=ing.get(y, {}).get("real"),
                netIncome=uti.get(y, {}).get("value"), netIncomeReal=uti.get(y, {}).get("real"),
                patrimonio=pat.get(y, {}).get("value"), activos=act.get(y, {}).get("value"),
                ebitda=None, investment=None, budget=None, budgetExecuted=None,
            ))
        out.append(dict(
            slug=c["slug"], name=c["name"], acronym=c["acronym"],
            sector="Industrial/Defensa", holding="FONAFE", rama=c.get("rama"),
            ruc=c.get("ruc", ""), website=c.get("web", "https://www.fonafe.gob.pe/"),
            employees=c.get("employees") or 0, description=c.get("description", ""),
            financials=fin, sources=c.get("sources", []),
            authoritativeSource=AUTHORITATIVE,
            provenanceNote="Datos del Observatorio de Defensa e Interior (fuente de verdad). "
                           "Años marcados como estimado no son oficiales; vacío = sin datos publicados.",
        ))
    print(f"[defensa] importadas {len(out)} empresas FFAA (fuente de verdad)")
    return out


if __name__ == "__main__":
    for c in fetch():
        print(c["acronym"], c["ruc"], "| años:", [f["year"] for f in c["financials"]])
