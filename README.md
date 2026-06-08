# 🏛️ Observatorio de Empresas Públicas del Perú

Plataforma pública de **transparencia, monitoreo y mejora de la gestión** de las empresas
estatales del Perú (holding **FONAFE** y otras). No solo muestra datos: los convierte en
**diagnóstico** y en **recomendaciones accionables** para una mejor gestión pública.

> **Dato → Transparencia → Diagnóstico → Recomendación → Seguimiento → Mejora.**

🔗 **Dashboard en vivo:** https://unimauro.github.io/observatorio-fonafe/
🗺️ **Roadmap:** [ROADMAP.md](ROADMAP.md) · 🏗️ **Arquitectura:** [ARCHITECTURE.md](ARCHITECTURE.md)

> ⚠️ **Datos ilustrativos.** Las cifras actuales son de **demostración** (marcadas como
> `ilustrativo`) mientras el ETL no carga los datos oficiales (FONAFE/MEF/OECE/SMV).
> No usar para análisis real todavía. Anti-overclaiming por diseño.

---

## ¿Qué hace?

- **Panel** con KPIs del portafolio: ingresos, utilidad, EBITDA, inversión, presupuesto, empleo, empresas en pérdida.
- **Gráficos** con granularidad **Año / Trimestre / Mes** (ECharts), rankings de rentabilidad, eficiencia y transparencia.
- **Fichas por empresa**: general, financieros, presupuesto, inversiones, contrataciones, directorio, indicadores, noticias, **diagnóstico y qué hacer**.
- **Contrataciones**: proveedores, montos y concentración (listo para datos reales OCDS/OECE).
- **Transparencia**: índice de cumplimiento de publicación (Ley 27806).
- **Decisiones · IA**: resumen ejecutivo automático, anomalías, recomendaciones y consultas en lenguaje natural (motor determinista, sin servidor).
- **Datos abiertos**: API estática (JSON) versionada + export CSV/Excel/JSON.
- **Modo día/noche**, responsive (desktop/tablet/móvil), paleta Perú (rojo/blanco/azul), SEO técnico.

## Arquitectura (resumen)

```
GitHub Pages (estático)  ←  Vite build  ←  frontend/ (React + TS + Tailwind + ECharts)
        ▲
        │ consume JSON
        │
frontend/public/data/  ←  ETL (Python, GitHub Actions programado)  ←  fuentes públicas
   ├─ latest/dataset.json        (versión vigente)        (FONAFE, MEF, OECE/SEACE, SMV)
   ├─ snapshots/<fecha>/...       (versionado histórico)
   └─ manifest.json              (versión + fuentes)

backend/ (FastAPI + PostgreSQL + Docker)  →  OPCIONAL, solo local/self-hosted.
   El sitio público NO lo necesita: GitHub Pages no ejecuta backend.
```

## Stack

- **Frontend:** React, TypeScript, Vite, TailwindCSS, componentes estilo shadcn, Apache ECharts.
- **Datos/ETL:** Python (requests) → JSON versionado. Fuente real prioritaria: **API OCDS del OECE**.
- **Backend (opcional):** FastAPI, PostgreSQL, SQLAlchemy, Docker, docker-compose.
- **CI/CD:** GitHub Actions (deploy a Pages + ETL programado).

## Desarrollo

### Frontend
```bash
cd frontend
npm install
npm run dev        # http://localhost:5173/observatorio-fonafe/
npm run build      # genera dist/ para GitHub Pages
```

### ETL (genera el dataset)
```bash
pip install -r etl/requirements.txt
python etl/build_dataset.py     # escribe frontend/public/data/{latest,snapshots,manifest}
```

### Backend (opcional, con Docker)
```bash
docker compose up --build       # API en http://localhost:8000/docs
```

## Datos y versionado

Cada corrida del ETL escribe un **snapshot fechado** y actualiza `latest/` y `manifest.json`.
El dashboard muestra la versión y la fecha de los datos, y la etiqueta `ilustrativo`
hasta que se carguen fuentes oficiales (ver [ROADMAP.md](ROADMAP.md), Fase 1).

## Licencia

Código: MIT. Datos abiertos: ODbL. Ver [LICENSE](LICENSE).

Autor: [Carlos Mauro Cárdenas](https://unimauro.github.io/) · Hecho con datos públicos, para el control ciudadano.
