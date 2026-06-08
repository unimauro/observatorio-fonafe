# -*- coding: utf-8 -*-
"""Capa de presentación (API REST). Sirve el mismo dataset que el frontend estático."""
from fastapi import APIRouter, HTTPException, Query
from ..services import dataset as ds

router = APIRouter()


@router.get("/meta")
def get_meta():
    return ds.load_dataset()["meta"]


@router.get("/companies")
def get_companies(sector: str | None = Query(default=None)):
    items = ds.companies()
    if sector:
        items = [c for c in items if c["sector"].lower() == sector.lower()]
    return [{k: c[k] for k in ("slug", "name", "acronym", "sector", "holding", "ruc", "metrics")} for c in items]


@router.get("/companies/{slug}")
def get_company(slug: str):
    c = ds.company(slug)
    if not c:
        raise HTTPException(status_code=404, detail="empresa no encontrada")
    return c


@router.get("/financials")
def get_financials(slug: str | None = None):
    items = ds.companies()
    if slug:
        c = ds.company(slug)
        if not c:
            raise HTTPException(status_code=404, detail="empresa no encontrada")
        return {"slug": slug, "financials": c["financials"], "periodic": c["periodic"]}
    return [{"slug": c["slug"], "financials": c["financials"]} for c in items]


@router.get("/contracts")
def get_contracts(company: str | None = None):
    data = ds.load_dataset()["contracts"]
    if company:
        return [i for i in data["items"] if i["companySlug"] == company]
    return data


@router.get("/rankings")
def get_rankings():
    return ds.load_dataset()["rankings"]


@router.get("/transparency")
def get_transparency():
    return ds.load_dataset()["transparency"]
