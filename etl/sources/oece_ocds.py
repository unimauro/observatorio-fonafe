# -*- coding: utf-8 -*-
"""
Cliente de la API OCDS del OECE (ex-OSCE) — contrataciones REALES del Estado peruano.

    Base: https://contratacionesabiertas.oece.gob.pe/api/v1/releases  (OCDS 1.1)

Hallazgos verificados (jun-2026):
  - Es un feed paginado de TODO el Estado, lo más reciente primero (20 releases/página, link `next`).
  - NO admite filtros server-side (?buyer=, ?ocid= se ignoran). Hay que paginar y filtrar en cliente.
  - El RUC de la entidad está en parties[].additionalIdentifiers (scheme "PE-RUC").
  - El monto está en awards[].value (adjudicado) o, si aún en convocatoria, tender.value / planning.budget.

Estrategia: escanear las páginas recientes, quedarse con las contrataciones cuyas entidades
sean empresas del portafolio (match por palabra clave del nombre) y acumular por OCID (dedupe)
en una caché versionada (etl/cache/oece_contracts.json). Cada corrida amplía la cobertura.
"""
import json
import os
import time
import urllib.request

BASE = "https://contratacionesabiertas.oece.gob.pe/api/v1/releases"
HEADERS = {"User-Agent": "ObservatorioEmpresasPublicas/0.1 (+https://unimauro.github.io/observatorio-fonafe/)"}
TIMEOUT = 30
CACHE = os.path.join(os.path.dirname(__file__), "..", "cache", "oece_contracts.json")

# Palabras clave del NOMBRE de la entidad -> slug de empresa. Más específicas primero.
NAME_TO_SLUG = [
    ("BANCO DE LA NACION", "banco-nacion"), ("BANCO DE LA NACIÓN", "banco-nacion"),
    ("FINANCIERA DE DESARROLLO", "cofide"), ("COFIDE", "cofide"),
    ("BANCO AGROPECUARIO", "agrobanco"), ("AGROBANCO", "agrobanco"),
    ("MIVIVIENDA", "fondo-mivivienda"),
    ("BANCO DE MATERIALES", "banmat"), ("BANMAT", "banmat"),
    ("ELECTRICIDAD DEL PERU", "electroperu"), ("ELECTRICIDAD DEL PERÚ", "electroperu"), ("ELECTROPERU", "electroperu"),
    ("MACHUPICCHU", "egemsa"), ("EGEMSA", "egemsa"),
    ("GENERACION ELECTRICA DE AREQUIPA", "egasa"), ("EGASA", "egasa"),
    ("GENERACION ELECTRICA DEL SUR", "egesur"), ("EGESUR", "egesur"),
    ("SAN GABRIEL", "san-gabriel"),
    ("NOR OESTE", "enosa"), ("NOROESTE", "enosa"), ("ELECTRONOROESTE", "enosa"),
    ("ELECTRONORTE", "ensa"),
    ("ELECTRO ORIENTE", "electro-oriente"), ("ELECTROORIENTE", "electro-oriente"),
    ("SUR ESTE", "electro-sur-este"), ("SURESTE", "electro-sur-este"),
    ("ELECTRO PUNO", "electro-puno"), ("ELECTROPUNO", "electro-puno"),
    ("ELECTRO UCAYALI", "electro-ucayali"), ("ELECTROUCAYALI", "electro-ucayali"),
    ("ELECTRICA DEL SUR OESTE", "seal"), ("SUR OESTE", "seal"),
    ("ELECTROSUR", "electrosur"), ("ELECTRO SUR S", "electrosur"),
    ("DEL CENTRO", "electrocentro"), ("ELECTROCENTRO", "electrocentro"),
    ("HIDRANDINA", "hidrandina"),
    ("ADINELSA", "adinelsa"),
    ("AEROPUERTOS Y AVIACION", "corpac"), ("CORPAC", "corpac"),
    ("NACIONAL DE PUERTOS", "enapu"), ("ENAPU", "enapu"),
    ("SERVICIOS POSTALES", "serpost"), ("SERPOST", "serpost"),
    ("AGUA POTABLE Y ALCANTARILLADO DE LIMA", "sedapal"), ("SEDAPAL", "sedapal"),
    ("SERVICIOS INDUSTRIALES DE LA MARINA", "sima"),
    ("FABRICA DE ARMAS", "fame"), ("FAME", "fame"),
    ("PETROLEOS DEL PERU", "petroperu"), ("PETRÓLEOS DEL PERÚ", "petroperu"), ("PETROPERU", "petroperu"),
    ("EDITORA PERU", "editora-peru"), ("EDITORA PERÚ", "editora-peru"),
    ("ACTIVOS MINEROS", "amsac"), ("AMSAC", "amsac"),
    ("NACIONAL DE LA COCA", "enaco"), ("ENACO", "enaco"),
    ("SERVICIOS INTEGRADOS DE LIMPIEZA", "silsa"), ("SILSA", "silsa"),
    ("VIGILANCIA CIUDADANA", "esvicsac"), ("ESVICSAC", "esvicsac"),
    # --- EPS de saneamiento (una por región) ---
    ("AGUA POTABLE Y ALCANTARILLADO DE AREQUIPA", "sedapar"), ("SEDAPAR", "sedapar"),
    ("SEDALIB", "sedalib"),
    ("EPSEL", "epsel"),
    ("EPS GRAU", "eps-grau"),
    ("SEDACUSCO", "sedacusco"), ("SEDA CUSCO", "sedacusco"),
    ("SEDACAJ", "sedacaj"),
    ("EPSASA", "epsasa"),
    ("EMAPICA", "emapica"),
    ("SEDAM HUANCAYO", "sedam-huancayo"), ("SEDAM", "sedam-huancayo"),
    ("EPS TACNA", "eps-tacna"),
    ("SEDA HUANUCO", "seda-huanuco"), ("SEDA HUÁNUCO", "seda-huanuco"),
    ("EMAPA SAN MARTIN", "emapa-sanmartin"), ("EMAPA SAN MARTÍN", "emapa-sanmartin"),
    ("EMSAPUNO", "emsapuno"), ("EMSA PUNO", "emsapuno"),
    ("EPS LORETO", "eps-loreto"), ("SEDALORETO", "eps-loreto"),
    ("EMAPACOP", "emapacop"),
    ("EMAPAT", "emapat"),
    ("EPS MOQUEGUA", "eps-moquegua"),
    ("EMUSAP", "emusap-amazonas"),
]


def _match_slug(buyer_name: str):
    up = (buyer_name or "").upper()
    # 'SIMA' como palabra suelta para no chocar con otras
    if "SIMA" in up.split() or "SERVICIOS INDUSTRIALES DE LA MARINA" in up:
        return "sima"
    for kw, slug in NAME_TO_SLUG:
        if kw in up:
            return slug
    return None


def _get(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return json.load(r)


def _ruc(rel):
    for p in rel.get("parties", []) or []:
        for ai in p.get("additionalIdentifiers", []) or []:
            if ai.get("scheme") == "PE-RUC":
                return ai.get("id")
    return ""


def _amount(rel):
    """Devuelve (monto_MM, tipo, proveedor) usando el mejor dato disponible."""
    awards = rel.get("awards", []) or []
    for a in awards:
        v = (a.get("value") or {}).get("amount")
        if v:
            sup = (a.get("suppliers") or [{}])
            return round(v / 1_000_000, 4), "adjudicado", (sup[0].get("name") if sup else "")
    t = rel.get("tender", {}) or {}
    v = (t.get("value") or {}).get("amount")
    if v:
        return round(v / 1_000_000, 4), "convocatoria", ""
    pb = ((rel.get("planning", {}) or {}).get("budget", {}) or {}).get("amount", {}) or {}
    if pb.get("amount"):
        return round(pb["amount"] / 1_000_000, 4), "presupuesto", ""
    return 0.0, "sin_monto", ""


def normalize(rel):
    buyer = (rel.get("buyer") or {}).get("name", "") or ""
    slug = _match_slug(buyer)
    if not slug:
        return None
    amount, atype, provider = _amount(rel)
    date = rel.get("date", "") or ""
    t = rel.get("tender", {}) or {}
    return dict(
        ocid=rel.get("ocid", ""), companySlug=slug, entity=buyer, ruc=_ruc(rel),
        provider=provider, amount=amount, amountType=atype,
        year=(int(date[:4]) if date[:4].isdigit() else None),
        object=t.get("title", "") or "", method=t.get("procurementMethodDetails", "") or "",
        source="OECE-OCDS",
    )


def scan_recent(max_pages=120, sleep=0.15, start_page=1):
    """Pagina el feed (desde start_page) y devuelve contratos del portafolio."""
    out, url, pages = [], BASE + f"?page={start_page}", 0
    while url and pages < max_pages:
        try:
            d = _get(url)
        except Exception as e:  # noqa: BLE001
            print(f"[oece] aviso página {pages+1}: {e}")
            break
        pages += 1
        for rel in d.get("releases", []):
            rec = normalize(rel)
            if rec:
                out.append(rec)
        url = (d.get("links") or {}).get("next")
        if sleep:
            time.sleep(sleep)
    print(f"[oece] {pages} páginas escaneadas, {len(out)} contratos del portafolio")
    return out


def update_cache(max_pages=120, start_page=1):
    """Acumula (dedupe por ocid) en la caché versionada. Devuelve la lista total."""
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    existing = {}
    if os.path.exists(CACHE):
        for r in json.load(open(CACHE, encoding="utf-8")):
            existing[r["ocid"]] = r
    before = len(existing)
    for rec in scan_recent(max_pages=max_pages, start_page=start_page):
        existing[rec["ocid"]] = rec
    data = list(existing.values())
    json.dump(data, open(CACHE, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"[oece] caché: {before} -> {len(data)} contratos (+{len(data)-before} nuevos)")
    return data


def load_cache():
    if os.path.exists(CACHE):
        return json.load(open(CACHE, encoding="utf-8"))
    return []


if __name__ == "__main__":
    import sys
    pages = int(sys.argv[1]) if len(sys.argv) > 1 else 120
    start = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    update_cache(max_pages=pages, start_page=start)
