# 🛣️ Roadmap — Observatorio de Empresas Públicas del Perú

> **Tesis del proyecto:** no basta con *mostrar* datos. El Observatorio debe ayudar a
> **mejorar la gestión pública integral**: detectar el problema → **diagnosticar** la causa →
> **recomendar qué hacer para solucionarlo** → **monitorear** que mejore.
>
> El ciclo que automatizamos es: **Dato → Transparencia → Diagnóstico → Recomendación → Seguimiento → Mejora.**

---

## Principios

1. **Datos públicos primero.** Todo se alimenta de fuentes oficiales abiertas (FONAFE, MEF, OECE/SEACE, SMV, INEI). Mientras no haya dato real, se marca **`ilustrativo`** sin excepción (anti-overclaiming).
2. **Estático y barato.** El sitio vive en **GitHub Pages**. El scraping/ETL corre en **GitHub Actions** y publica **JSON versionado**. Sin servidor que pagar.
3. **Versionado de datos.** Cada corrida del ETL deja un **snapshot fechado** + `manifest.json`. La gestión pública se evalúa por su evolución, no por una foto.
4. **Accionable.** Cada hallazgo termina en una **recomendación concreta** y un responsable/normativa asociada. El objetivo no es señalar, es **solucionar**.
5. **Abierto.** API estática (JSON) + export CSV/Excel/JSON/PDF para que cualquiera reaud­ite.

---

## Fase 0 — Cimientos (EN CURSO)
**Meta:** que el dashboard exista, sea bonito, responsive y con datos de ejemplo marcados.
- [x] Estructura del repo (frontend GH Pages + ETL Python + backend FastAPI opcional + Docker + docs).
- [x] Dataset semilla **ilustrativo** versionado (`data/latest/dataset.json` + snapshots).
- [x] Dashboard React/TS/Vite/Tailwind/ECharts: KPIs, gráficos, fichas de empresa, modo día/noche, responsive.
- [x] Deploy automático a GitHub Pages vía GitHub Actions.
- [x] SEO técnico (OG, Twitter, sitemap, JSON-LD).

## Fase 1 — Transparencia con datos reales (scraping)
**Meta:** reemplazar la semilla por dato oficial, con trazabilidad.
- [ ] **Contrataciones reales** vía **API OCDS del OECE** (`contratacionesabiertas.oece.gob.pe/api/v1`) por RUC de cada empresa.
- [ ] **Empresas FONAFE**: lista, sector, directorio y memorias desde `fonafe.gob.pe` y portales de transparencia (PTE).
- [ ] **Estados financieros**: extracción de EE.FF. (FONAFE consolida; SMV para las que cotizan) → normalización.
- [ ] **Presupuesto**: ejecución desde **Consulta Amigable del MEF**.
- [ ] ETL programado (Action semanal) + snapshots fechados + `manifest.json` con fuente y fecha de cada campo.

## Fase 2 — Diagnóstico (¿qué está mal?)
**Meta:** convertir datos en señales de salud de la gestión.
- [ ] **Semáforos de salud**: financiera (rentabilidad, liquidez, endeudamiento), operativa y de gobernanza.
- [ ] **Detección de anomalías** por reglas: caídas/subidas abruptas, sobrecostos, pérdidas recurrentes, concentración de proveedores, fraccionamiento de contratos.
- [ ] **Rankings** de rentabilidad, eficiencia y transparencia con metodología pública y documentada.
- [ ] **Scoring de transparencia** (¿publican EE.FF., memorias, directorio, presupuesto a tiempo?).

## Fase 3 — Recomendación (¿qué hacer para solucionarlo?)
**Meta:** que cada problema tenga una salida concreta. *Este es el corazón del proyecto.*
- [ ] **Motor de recomendaciones** por empresa: dado un hallazgo, propone acción (p. ej. *"3 años de pérdidas en X → plan de reflotamiento / evaluación de fusión o liquidación según D.L. 1031"*).
- [ ] **Benchmarking**: comparar cada empresa con pares del mismo sector y mejores prácticas OCDE.
- [ ] **Resúmenes ejecutivos automáticos** (IA): hallazgos, riesgos y recomendaciones en lenguaje claro.
- [ ] **Chat ciudadano** sobre los datos ("¿qué empresa perdió más?", "¿qué proveedor concentra contratos?").
- [ ] **Vínculo normativo**: cada recomendación citada con la norma aplicable (Ley FONAFE 27170, D.L. 1031, Ley de Transparencia 27806).

## Fase 4 — Gestión integral & rendición de cuentas
**Meta:** herramienta de decisión y de control ciudadano.
- [ ] **Tablero para decisores**: seguimiento de metas (Convenios de Gestión FONAFE), alertas tempranas.
- [ ] **Simulador de política**: impacto fiscal de reflotar/fusionar/liquidar empresas; "juega a ser director".
- [ ] **Comparador** multi-empresa y multi-año; fichas compartibles para prensa y sociedad civil.
- [ ] **Índice de Gobernanza** del portafolio estatal (estilo scorecards OCDE de SOEs).
- [ ] **API pública** documentada + datasets descargables para periodistas, academia y auditoría.

## Fase 5 — Escala
- [ ] Más allá de FONAFE: gobiernos regionales/locales y sus empresas, mancomunidades.
- [ ] Histórico profundo (2005–presente) y datos en streaming desde las APIs oficiales.
- [ ] Alertas por email/WhatsApp ante anomalías (reusar motor de otros proyectos del autor).

---

## ¿Cómo mejora esto la gestión pública integral?

| Problema público | Qué hace el Observatorio | Resultado |
|---|---|---|
| Datos dispersos e ilegibles | Centraliza, normaliza y versiona | Información comparable y auditable |
| Empresas que pierden plata en silencio | Semáforos + anomalías | Alerta temprana, no sorpresa al cierre |
| Contrataciones opacas | Cruce con OCDS/SEACE | Detección de concentración y sobrecostos |
| Decisiones sin evidencia | Benchmarking + simulador | Política basada en datos |
| Baja rendición de cuentas | API abierta + fichas + export | Control ciudadano y de prensa |
| Hallazgos sin salida | Motor de recomendaciones + normativa | **Del diagnóstico a la solución** |

> El éxito no se mide en gráficos publicados, sino en **decisiones de gestión mejor informadas y empresas estatales más sanas**.
