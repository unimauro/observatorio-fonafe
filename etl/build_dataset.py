#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ETL builder — Observatorio de Empresas Públicas del Perú.

Construye el dataset que consume el dashboard estático (GitHub Pages) a partir de:
  - seed_data.py            (semilla ILUSTRATIVA, marcada)
  - sources/oece_ocds.py    (contrataciones reales OCDS/OECE — opcional, vía --with-contracts)
  - sources/fonafe.py       (lista/directorio FONAFE — opcional)

Salidas (versionadas):
  frontend/public/data/latest/dataset.json
  frontend/public/data/snapshots/<YYYY-MM-DD>/dataset.json
  frontend/public/data/manifest.json

Filosofía: del dato al diagnóstico, y del diagnóstico a la RECOMENDACIÓN.
Uso:  python3 etl/build_dataset.py
"""
import json, os, datetime, argparse
from seed_data import COMPANIES, YEARS, NEWS_TEMPLATES, TREND_YEARS

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "frontend", "public", "data")
VERSION = "0.1.0"

PROVIDERS = ["Consorcio Vial Andino", "Tecnología y Sistemas SAC", "Constructora del Pacífico",
             "Servicios Generales Lima SAC", "Suministros Industriales EIRL", "Ingeniería & Montaje SA",
             "Soluciones Energéticas Perú", "Logística Integral SAC"]

ACTION_CAT = {
    "recurring_losses": "Reflotamiento / reestructuración",
    "negative_ebitda": "Eficiencia operativa",
    "abrupt_drop": "Auditoría / revisión",
    "abrupt_rise": "Revisión y control",
    "low_transparency": "Transparencia",
    "provider_concentration": "Gobernanza de compras",
    "low_budget_execution": "Ejecución presupuestal",
}


def full_trend(trend, n_years):  # compat (no usado directamente)
    return trend


def full_multipliers(trend, years):
    """Multiplicadores por año para `years`, anclados a TREND_YEARS (2019–2024).

    - 2019–2024: usa `trend` directamente.
    - <2019: extrapola hacia atrás con rampa suave hasta trend[0].
    - >2024 (p. ej. 2025): extrapola hacia adelante continuando la pendiente reciente.
    """
    m = {ty: trend[i] for i, ty in enumerate(TREND_YEARS)}
    # adelante (2025+)
    slope = (trend[-1] / trend[-2]) if trend[-2] else 1.0
    slope = min(max(slope, 0.95), 1.08)
    last, y = trend[-1], TREND_YEARS[-1]
    while y + 1 <= max(years):
        y += 1
        last = round(last * slope, 3)
        m[y] = last
    # atrás (<2019)
    pre = sorted(y for y in years if y < TREND_YEARS[0])
    start = trend[0] * 0.82
    for k, y in enumerate(pre):
        m[y] = round(start + (trend[0] - start) * (k / max(1, len(pre))), 3)
    return [m[y] for y in years]


def series(base, trend):
    """Serie por año = base(2024) * trend[i]; redondeada a 1 decimal."""
    return [round(base * t, 1) for t in trend]


# Estacionalidad determinista (suma 1.0). Permite vistas trimestral y mensual.
Q_WEIGHTS = [0.23, 0.25, 0.26, 0.26]
M_WEIGHTS = [0.075, 0.07, 0.085, 0.08, 0.085, 0.085, 0.09, 0.085, 0.085, 0.09, 0.085, 0.085]


def build_periodic(fin):
    """Desagrega los 2 últimos años en trimestres y el último año en meses."""
    quarterly, monthly = [], []
    for f in fin[-2:]:
        for qi, w in enumerate(Q_WEIGHTS, start=1):
            quarterly.append(dict(period=f"{f['year']}-Q{qi}",
                                  revenue=round(f["revenue"] * w, 1),
                                  netIncome=round(f["netIncome"] * w, 1),
                                  ebitda=round(f["ebitda"] * w, 1)))
    last = fin[-1]
    for mi, w in enumerate(M_WEIGHTS, start=1):
        monthly.append(dict(period=f"{last['year']}-{mi:02d}",
                            revenue=round(last["revenue"] * w, 1),
                            netIncome=round(last["netIncome"] * w, 1),
                            ebitda=round(last["ebitda"] * w, 1)))
    return dict(quarterly=quarterly, monthly=monthly)


def diagnose(c, fin):
    """Genera anomalías (diagnóstico) y recomendaciones (solución) para una empresa."""
    anomalies, recs = [], []
    nets = [f["netIncome"] for f in fin]
    revs = [f["revenue"] for f in fin]
    ebitda_last = fin[-1]["ebitda"]
    exec_last = fin[-1]["budgetExecuted"] / fin[-1]["budget"] if fin[-1]["budget"] else 1

    losses_last3 = sum(1 for n in nets[-3:] if n < 0)
    if losses_last3 >= 2:
        anomalies.append(dict(type="recurring_losses", severity="alta",
            description=f"Pérdidas netas en {losses_last3} de los últimos 3 años."))
        recs.append(dict(category=ACTION_CAT["recurring_losses"], priority="alta",
            action="Plan de reflotamiento con metas trimestrales; evaluar fusión, venta de activos o liquidación según viabilidad.",
            norma="D.L. 1031 (eficiencia de la actividad empresarial del Estado) · Ley 27170 (FONAFE)"))
    if ebitda_last < 0:
        anomalies.append(dict(type="negative_ebitda", severity="alta",
            description="EBITDA negativo en el último año: la operación no cubre sus costos."))
        recs.append(dict(category=ACTION_CAT["negative_ebitda"], priority="alta",
            action="Reducir costos operativos no esenciales y revisar tarifas/subsidios cruzados; meta de EBITDA positivo en 12 meses.",
            norma="Convenio de Gestión FONAFE"))
    for i in range(1, len(revs)):
        if revs[i-1] and (revs[i]-revs[i-1])/revs[i-1] <= -0.25:
            anomalies.append(dict(type="abrupt_drop", severity="media",
                description=f"Caída de ingresos >25% en {YEARS[i]} respecto a {YEARS[i-1]}."))
            recs.append(dict(category=ACTION_CAT["abrupt_drop"], priority="media",
                action=f"Auditar la caída {YEARS[i-1]}→{YEARS[i]}: ¿shock externo, pérdida de mercado o registro contable? Plan de recuperación de ingresos.",
                norma="Ley 27785 (Control Gubernamental)"))
            break
    score = c["_transp_score"]
    if score < 55:
        anomalies.append(dict(type="low_transparency", severity="media",
            description=f"Bajo cumplimiento de transparencia (score {score}/100)."))
        recs.append(dict(category=ACTION_CAT["low_transparency"], priority="media",
            action="Publicar EE.FF., memoria anual, directorio y presupuesto en el Portal de Transparencia Estándar dentro de 30 días.",
            norma="Ley 27806 (Transparencia y Acceso a la Información Pública)"))
    if exec_last < 0.7:
        anomalies.append(dict(type="low_budget_execution", severity="media",
            description=f"Ejecución presupuestal baja ({exec_last*100:.0f}%)."))
        recs.append(dict(category=ACTION_CAT["low_budget_execution"], priority="media",
            action="Revisar cuellos de botella en contrataciones e inversiones; reprogramar y fortalecer la unidad ejecutora.",
            norma="Directivas de FONAFE / SNPMGI"))
    return anomalies, recs


def build_contracts(companies):
    """Contrataciones ILUSTRATIVAS (reemplazables por OCDS/OECE real). Determinista."""
    items, by_provider = [], {}
    cid = 0
    for c in companies:
        base = max(1, int(c["rev"] / 60))  # nº de contratos ~ tamaño
        for k in range(base % 7 + 3):
            prov = PROVIDERS[(len(c["slug"]) + k) % len(PROVIDERS)]
            amount = round(((c["rev"] * 0.02) / (k + 1)) + (k * 1.3), 2)
            year = YEARS[-1 - (k % 3)]
            cid += 1
            items.append(dict(id=f"C-{cid:04d}", company=c["name"], companySlug=c["slug"],
                              provider=prov, amount=amount, year=year,
                              object=f"Adquisición / servicio {k+1}", method="Procedimiento clásico"))
            by_provider.setdefault(prov, {"provider": prov, "total": 0.0, "count": 0})
            by_provider[prov]["total"] += amount
            by_provider[prov]["count"] += 1
    top = sorted(by_provider.values(), key=lambda x: x["total"], reverse=True)
    for t in top:
        t["total"] = round(t["total"], 2)
    total = round(sum(i["amount"] for i in items), 2)
    return dict(
        summary=dict(totalAmount=total, totalContracts=len(items),
                     topProviderShare=round(top[0]["total"] / total * 100, 1) if total else 0),
        topProviders=top[:8], items=items, isReal=False)


def build_real_contracts(real, name_by_slug):
    """Arma el bloque de contrataciones desde datos REALES del OCDS/OECE."""
    items, by_provider = [], {}
    for r in real:
        slug = r.get("companySlug")
        items.append(dict(
            id=r.get("ocid", ""), company=name_by_slug.get(slug, r.get("entity", "")),
            companySlug=slug, provider=r.get("provider") or "—",
            amount=round(r.get("amount", 0) or 0, 3), year=r.get("year"),
            object=r.get("object", ""), method=r.get("method", ""),
            amountType=r.get("amountType", ""), source="OECE-OCDS"))
        prov = r.get("provider")
        amt = r.get("amount", 0) or 0
        if prov and amt:
            by_provider.setdefault(prov, {"provider": prov, "total": 0.0, "count": 0})
            by_provider[prov]["total"] += amt
            by_provider[prov]["count"] += 1
    top = sorted(by_provider.values(), key=lambda x: x["total"], reverse=True)
    for t in top:
        t["total"] = round(t["total"], 3)
    total = round(sum(i["amount"] for i in items), 2)
    coverage = sorted(set(i["companySlug"] for i in items))

    # analítica real: por año y por entidad
    by_year, by_entity = {}, {}
    for i in items:
        y = i.get("year")
        if y:
            by_year.setdefault(y, {"year": y, "count": 0, "amount": 0.0})
            by_year[y]["count"] += 1
            by_year[y]["amount"] += i["amount"]
        s = i["companySlug"]
        by_entity.setdefault(s, {"slug": s, "name": i["company"], "count": 0, "amount": 0.0})
        by_entity[s]["count"] += 1
        by_entity[s]["amount"] += i["amount"]
    for v in by_year.values():
        v["amount"] = round(v["amount"], 2)
    for v in by_entity.values():
        v["amount"] = round(v["amount"], 2)

    # por método de contratación y por etapa (datos reales OCDS)
    by_method, by_stage = {}, {}
    for i in items:
        meth = (i.get("method") or "No especificado").strip() or "No especificado"
        by_method[meth] = by_method.get(meth, 0) + 1
        st = i.get("amountType") or "sin_monto"
        by_stage[st] = by_stage.get(st, 0) + 1

    return dict(
        summary=dict(totalAmount=total, totalContracts=len(items),
                     topProviderShare=round(top[0]["total"] / total * 100, 1) if (total and top) else 0,
                     entitiesCovered=len(coverage)),
        topProviders=top[:10], items=items, isReal=True, coverage=coverage,
        byYear=sorted(by_year.values(), key=lambda x: x["year"]),
        byEntity=sorted(by_entity.values(), key=lambda x: x["count"], reverse=True),
        byMethod=sorted([{"method": k, "count": v} for k, v in by_method.items()], key=lambda x: x["count"], reverse=True),
        byStage=sorted([{"stage": k, "count": v} for k, v in by_stage.items()], key=lambda x: x["count"], reverse=True))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", default=datetime.date.today().isoformat())
    ap.add_argument("--with-contracts", action="store_true",
                    help="usa contrataciones REALES del OCDS/OECE desde la caché")
    ap.add_argument("--scrape-pages", type=int, default=0,
                    help="si >0, escanea ese nº de páginas del OCDS y actualiza la caché antes de construir")
    args = ap.parse_args()
    gen_date = args.date

    companies = []
    for c in COMPANIES:
        fin = []
        ft = full_multipliers(c["trend"], YEARS)
        rev_s = series(c["rev"], ft)
        net_s = series(c["net"], ft)
        ebi_s = series(c["ebitda"], ft)
        inv_s = series(c["inv"], ft)
        bud_s = series(c["budget"], ft)
        exec_factor = 0.72 + (len(c["slug"]) % 5) * 0.05  # 0.72–0.92 determinista
        for i, y in enumerate(YEARS):
            fin.append(dict(year=y, revenue=rev_s[i], netIncome=net_s[i], ebitda=ebi_s[i],
                            investment=inv_s[i], budget=bud_s[i],
                            budgetExecuted=round(bud_s[i] * exec_factor, 1)))
        f, m, d, p = c["transp"]
        score = int(f * 30 + m * 25 + d * 25 + p * 20)
        c["_transp_score"] = score
        anomalies, recs = diagnose(c, fin)
        last = fin[-1]
        net_margin = round(last["netIncome"] / last["revenue"] * 100, 1) if last["revenue"] else 0
        rev_per_emp = round(last["revenue"] * 1_000_000 / c["employees"], 0) if c["employees"] else 0
        news = [dict(date=f"{YEARS[-1]}-0{(j%9)+1}-15", title=t.format(y=YEARS[-1]), url=u)
                for j, (t, u) in enumerate(NEWS_TEMPLATES)]
        companies.append(dict(
            slug=c["slug"], name=c["name"], acronym=c["acronym"], sector=c["sector"],
            holding=c["holding"], region=c.get("region", "Nacional"),
            ruc=c["ruc"], website=c["web"], employees=c["employees"],
            description=c["desc"],
            directors=[dict(role=r, name=n) for r, n in c["directors"]],
            financials=fin, periodic=build_periodic(fin), news=news,
            metrics=dict(netMargin=net_margin, revenuePerEmployee=rev_per_emp,
                         transparencyScore=score, budgetExecution=round(exec_factor * 100, 0)),
            transparency=dict(score=score, financials=f, memoria=m, directory=d, budget=p),
            anomalies=anomalies, recommendations=recs,
        ))

    last_year = YEARS[-1]
    def lastval(co, k):
        return co["financials"][-1][k]
    kpis = dict(
        companies=len(companies),
        totalRevenue=round(sum(lastval(c, "revenue") for c in companies), 1),
        totalNetIncome=round(sum(lastval(c, "netIncome") for c in companies), 1),
        totalEbitda=round(sum(lastval(c, "ebitda") for c in companies), 1),
        totalInvestment=round(sum(lastval(c, "investment") for c in companies), 1),
        totalBudget=round(sum(lastval(c, "budget") for c in companies), 1),
        totalBudgetExecuted=round(sum(lastval(c, "budgetExecuted") for c in companies), 1),
        employees=sum(c["employees"] for c in companies),
        withLosses=sum(1 for c in companies if lastval(c, "netIncome") < 0),
        withProfits=sum(1 for c in companies if lastval(c, "netIncome") >= 0),
        year=last_year,
    )

    def ranking(key, getter, unit, reverse=True):
        rows = sorted(companies, key=getter, reverse=reverse)
        return [dict(slug=c["slug"], name=c["name"], acronym=c["acronym"],
                     value=round(getter(c), 1), unit=unit) for c in rows]
    rankings = dict(
        profitability=ranking("net_margin", lambda c: c["metrics"]["netMargin"], "% margen neto"),
        efficiency=ranking("rev_emp", lambda c: c["metrics"]["revenuePerEmployee"], "S/ por trabajador"),
        transparency=ranking("transp", lambda c: c["metrics"]["transparencyScore"], "/100"),
    )

    # anomalías y recomendaciones consolidadas (para el módulo de IA/decisión)
    all_anom = [dict(company=c["name"], companySlug=c["slug"], **a)
                for c in companies for a in c["anomalies"]]
    all_recs = [dict(company=c["name"], companySlug=c["slug"], **r)
                for c in companies for r in c["recommendations"]]

    # --- Contrataciones: REALES (OCDS/OECE) si se pide, o ilustrativas ---
    name_by_slug = {c["slug"]: c["name"] for c in companies}
    real = []
    if args.scrape_pages > 0 or args.with_contracts:
        try:
            from sources import oece_ocds
            if args.scrape_pages > 0:
                real = oece_ocds.update_cache(max_pages=args.scrape_pages)
            else:
                real = oece_ocds.load_cache()
        except Exception as e:  # noqa: BLE001
            print(f"[etl] aviso OCDS: {e}")
    if real:
        contracts = build_real_contracts(real, name_by_slug)
        contracts_status = "activo (parcial — SEACE/OCDS reciente)"
    else:
        contracts = build_contracts(COMPANIES)
        contracts_status = "pendiente"

    transparency = dict(items=[dict(company=c["name"], slug=c["slug"], score=c["transparency"]["score"],
                                    financials=c["transparency"]["financials"], memoria=c["transparency"]["memoria"],
                                    directory=c["transparency"]["directory"], budget=c["transparency"]["budget"])
                                for c in companies],
                        avgScore=round(sum(c["transparency"]["score"] for c in companies) / len(companies), 1))

    dataset = dict(
        meta=dict(version=VERSION, generated_at=gen_date, is_illustrative=True,
                  latest_year=last_year, years=YEARS,
                  sources=[
                      dict(name="FONAFE — Portal de Transparencia", url="https://www.fonafe.gob.pe/", status="pendiente"),
                      dict(name="OECE/SEACE — API OCDS (contrataciones)", url="https://contratacionesabiertas.oece.gob.pe/api/v1", status=contracts_status),
                      dict(name="MEF — Consulta Amigable", url="https://apps5.mineco.gob.pe/transparencia/", status="pendiente"),
                      dict(name="SMV — Estados financieros", url="https://www.smv.gob.pe/", status="pendiente"),
                  ],
                  note="Cifras ILUSTRATIVAS para demostración. Reemplazables por el ETL con datos oficiales."),
        kpis=kpis, companies=companies, rankings=rankings,
        contracts=contracts, transparency=transparency,
        anomalies=all_anom, recommendations=all_recs,
    )

    os.makedirs(os.path.join(OUT, "latest"), exist_ok=True)
    snap_dir = os.path.join(OUT, "snapshots", gen_date)
    os.makedirs(snap_dir, exist_ok=True)
    payload = json.dumps(dataset, ensure_ascii=False, indent=2)
    open(os.path.join(OUT, "latest", "dataset.json"), "w", encoding="utf-8").write(payload)
    open(os.path.join(snap_dir, "dataset.json"), "w", encoding="utf-8").write(payload)

    # manifest de versiones
    snaps = sorted(os.listdir(os.path.join(OUT, "snapshots"))) if os.path.isdir(os.path.join(OUT, "snapshots")) else [gen_date]
    manifest = dict(current=dict(version=VERSION, generated_at=gen_date, is_illustrative=True),
                    snapshots=snaps,
                    sources=dataset["meta"]["sources"])
    open(os.path.join(OUT, "manifest.json"), "w", encoding="utf-8").write(json.dumps(manifest, ensure_ascii=False, indent=2))

    print(f"OK · {len(companies)} empresas · {len(all_anom)} anomalías · {len(all_recs)} recomendaciones · {contracts['summary']['totalContracts']} contratos")
    print(f"   -> {os.path.relpath(os.path.join(OUT,'latest','dataset.json'), ROOT)}")
    print(f"   -> snapshot {gen_date}")


if __name__ == "__main__":
    main()
