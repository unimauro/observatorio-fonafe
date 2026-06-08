# 🏗️ Arquitectura — Observatorio de Empresas Públicas del Perú

## Principio rector

El **sitio público es estático** (GitHub Pages) y se alimenta de **JSON versionado** que produce
un **ETL en Python** (corre en GitHub Actions). El backend FastAPI es **opcional** para entornos
con servidor. Esto mantiene el costo en cero y la trazabilidad de los datos alta.

```
Fuentes públicas ──► ETL (Python) ──► JSON versionado ──► Frontend (Vite/React) ──► GitHub Pages
 FONAFE/MEF/OECE      build_dataset      public/data/         dashboard estático       (CDN gratis)
 (scraping, Fase 1)   + diagnóstico       latest + snapshots
                       + recomendación
            (opcional, local) backend FastAPI + PostgreSQL ◄── mismo JSON / o DB
```

## Estructura de carpetas

```
observatorio-fonafe/
├─ frontend/                 # SPA estática (GitHub Pages)
│  ├─ src/
│  │  ├─ components/         # UI (shadcn-style), Chart (ECharts), Layout, Kpi, theme
│  │  ├─ pages/              # Dashboard, Companies, CompanyDetail, Contracts,
│  │  │                      #   Transparency, Decisions (IA), OpenData
│  │  ├─ lib/                # utils, format (S/), export (CSV/JSON)
│  │  ├─ data.tsx            # carga del dataset (fetch JSON)
│  │  └─ types.ts            # contrato de datos (TS)
│  └─ public/
│     └─ data/               # dataset que sirve GitHub Pages
│        ├─ latest/dataset.json
│        ├─ snapshots/<fecha>/dataset.json
│        └─ manifest.json
├─ etl/                      # pipeline de datos (Python)
│  ├─ seed_data.py           # semilla ILUSTRATIVA (empresas + base financiera)
│  ├─ build_dataset.py       # KPIs, rankings, anomalías, RECOMENDACIONES, versionado
│  └─ sources/               # clientes de scraping
│     ├─ oece_ocds.py        # API OCDS del OECE (contrataciones reales)
│     └─ fonafe.py           # FONAFE (lista/directorio) — esqueleto Fase 1
├─ backend/                  # API FastAPI (OPCIONAL, local/Docker)
│  └─ app/
│     ├─ main.py             # app FastAPI
│     ├─ core/config.py      # config 12-factor (env)
│     ├─ api/routers.py      # /api/companies, /financials, /contracts, /rankings, /transparency
│     ├─ services/dataset.py # capa de aplicación (lee JSON; futuro: repos Postgres)
│     └─ db/models.py        # modelos SQLAlchemy (Postgres) — Fase 1+
├─ .github/workflows/
│  ├─ deploy-pages.yml       # build + deploy del dashboard
│  └─ etl.yml                # ETL programado (scraping) + commit de datos
├─ docker-compose.yml        # api + postgres (local)
├─ ROADMAP.md
└─ README.md
```

## Capas (Clean Architecture / DDD aplicado al ETL+API)

- **Dominio / datos:** el contrato del dataset (`frontend/src/types.ts` ⇄ ETL ⇄ modelos ORM).
- **Aplicación:** `etl/build_dataset.py` (reglas de diagnóstico y recomendación) y `backend/app/services`.
- **Infraestructura:** fuentes (`etl/sources`), persistencia (`backend/app/db`), salida JSON.
- **Presentación:** frontend (React) y API (FastAPI). Ambas consumen el mismo modelo.

## Flujo de datos (contrato)

`dataset.json` = `{ meta, kpis, companies[], rankings, contracts, transparency, anomalies[], recommendations[] }`.
Cada `company` incluye `financials[]` (anual), `periodic{quarterly[],monthly[]}`, `metrics`,
`transparency`, `anomalies[]` y `recommendations[]`. El frontend solo renderiza; la inteligencia
(KPIs, rankings, anomalías, recomendaciones) se computa en el ETL para que la "API" estática sea completa.

## Decisiones

- **HashRouter** en el frontend: rutas robustas en GitHub Pages (sin 404 en refresh).
- **Tema vía CSS variables** + clase `dark`: contraste cuidado en claro y oscuro.
- **Versionado de datos** por snapshots fechados: la gestión pública se evalúa por evolución.
- **Anti-overclaiming:** todo dato no oficial se marca `is_illustrative`.
