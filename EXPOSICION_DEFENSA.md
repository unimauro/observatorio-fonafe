# Exposición — Tablero de Inteligencia Financiera del Sector Defensa

**Audiencia:** Área Financiera del Ministerio de Defensa del Perú (MINDEF)
**Expositor:** Carlos Cárdenas Fernández
**Formato:** Google Meet · 15 minutos · reunión de venta/descubrimiento
**Producto:** Tablero de inteligencia financiera del sector Defensa (SIMA, FAME, SEMAN) construido sobre el **Observatorio de Empresas Públicas** (FONAFE)
**Dashboard demo (referencia):** https://unimauro.github.io/observatorio-fonafe/

---

## ⚠️ Encuadre honesto (regla de oro de toda la reunión)

> **No vendemos un análisis terminado de SUS finanzas.** Esos números los tienen ustedes, mejor que nadie.
> **Vendemos EL MOTOR:** un tablero que, cargado con sus EE.FF. reales, entrega KPIs, ejecución presupuestal, rankings, detección de anomalías, índice de transparencia y analítica de contrataciones OCDS reales — en una sola pantalla, versionado y auditable.
> En la demo de hoy, **toda cifra de demostración está marcada `ilustrativo`**. Las cifras verificadas se muestran **siempre con su fuente y enlace**. Cero overclaiming: si un dato no se pudo confirmar, lo decimos.

**Frase de seguridad para repetir cuando haga falta:** *"Hoy les muestro el envase y el mecanismo, no el contenido. El contenido lo ponen ustedes, y yo garantizo que el motor lo convierta en decisión."*

---

## (a) Guion minuto a minuto (15 min)

### 0:00 – 1:00 · Apertura (1')
- Saludo breve y agradecimiento por el tiempo del Área Financiera.
- Una sola frase de propósito: *"Vengo a mostrarles un motor que convierte sus estados financieros y su ejecución presupuestal en decisiones, no a venderles un diagnóstico que ustedes ya conocen."*
- Encuadre honesto explícito: *"Lo que verán hoy tiene cifras ilustrativas marcadas como tales; el valor real aparece cuando carguemos SUS datos."*
- Promesa de agenda: contexto del sector (3'), demo del tablero (6'), el bot de IA (2'), cómo trabajaríamos juntos (2'), cierre (1').

### 1:00 – 4:00 · Problema / contexto del sector (3')
- **El sector Defensa maneja cifras grandes y crecientes.** PIA 2026 proyectado **S/ 9,658.7 millones**, +13.8% vs 2025, **3.75% del presupuesto nacional** (fuente: defensa.com). El presupuesto es **rígido**: 53.3% salarios, 16.5% pensiones, 20.9% bienes y servicios (2026). Eso deja poco margen y exige control fino del gasto que sí es maniobrable.
- **Tres empresas con realidades muy distintas bajo un mismo sector:**
  - **SIMA-Perú** (naval): ingresos operativos **S/ 1,818.7 M en 2023, ejecución del 121%** sobre la meta (FONAFE). Activos +159% y pasivos +S/1,415 M por adelantos de la MGP. Pero **ROE 2024 cayó a 7.78%** (meta 13.71%). Programa de fragatas HDF-3600 y G2G Hyundai por **USD 462.9 M**.
  - **FAME** (armas/municiones): reactivada desde 2023, ingresos +2,401% interanual (base baja), pero **pérdida acumulada ≈ S/ -2.2 M a ago-2024** y **contratos bajo observación de Contraloría y Fiscalía** (fusiles ARAD-7, blindados K-808).
  - **SEMAN** (aeronáutico/MRO): **3er lugar entre 32 empresas FONAFE por rentabilidad, ROE 27.43% (AF-2024)**. Ventas crecieron de **S/ 13.1 M (2022) a S/ 32.1 M (2023)**, utilidad **S/ 3.36 M**.
- **El dolor real:** la información existe pero está **dispersa y desincronizada** — memorias anuales escaneadas (la de SIMA 2024 no es legible por máquina), informes consolidados FONAFE, MEF Consulta Amigable, portales de transparencia, prensa especializada. **No hay una sola pantalla que las una, las compare y dispare alertas.**
- Cierre del bloque: *"Ustedes no tienen un problema de datos; tienen un problema de consolidación, comparabilidad y velocidad para detectar lo que se sale de norma."*

### 4:00 – 10:00 · Demo del tablero (6')
*(Compartir pantalla con el dashboard live; recordar que las cifras visibles son ilustrativas.)*
- **Panel del portafolio (1'):** KPIs del sector en una vista — ingresos, utilidad, EBITDA, inversión, ejecución presupuestal, empleo, empresas en pérdida. *"Imaginen esto con SIMA, FAME y SEMAN reales, lado a lado."*
- **Ficha por empresa (1.5'):** abrir SIMA. Pestañas: general, financieros, presupuesto, inversiones, contrataciones, directorio, indicadores, noticias, y **'diagnóstico y qué hacer'**. Mostrar cómo cada dato lleva su **fuente con enlace** y su nivel de confianza (alta/media/baja).
- **Ejecución presupuestal (1'):** PIA vs PIM vs devengado, con semáforos. Caso real para anclar: el sector apuntó a **98-99% de ejecución en 2025** — el tablero muestra el avance y alerta sobre rezagos antes del cierre.
- **Rankings (0.5'):** rentabilidad, eficiencia, transparencia. *"SEMAN es 3.° de 32 en FONAFE; el tablero lo posiciona automáticamente y explica por qué."*
- **Detección de anomalías (1'):** variaciones fuera de rango, ej. activos +159% o ROE -43% interanual en SIMA; el motor las marca para que el analista no las tenga que cazar a mano.
- **Contrataciones OCDS reales (1'):** este módulo **no es ilustrativo** — consume la API OCDS del OECE (ex-OSCE). Proveedores, montos, concentración por contraparte. Útil para el contexto de los contratos cuestionados de FAME (modalidad "por encargo" sin licitación, Ley 31684).

### 10:00 – 12:00 · El bot de IA (2')
- *"El tablero incluye un asistente de IA que responde en lenguaje natural sobre los datos cargados."* Ejemplos de preguntas: *"¿Qué empresa del sector tuvo la mayor caída de ROE el último año?"*, *"Resúmeme la ejecución presupuestal de SIMA y dónde hay rezago"*, *"Lista los contratos OCDS de FAME por encima de S/ 1 M."*
- **Honestidad técnica:** en la demo pública el motor es **determinista, sin servidor** (corre sobre el JSON, no inventa). En la versión para ustedes puede conectarse a un LLM **dentro de su perímetro** para resúmenes ejecutivos y redacción de hallazgos.
- **Genera:** resumen ejecutivo automático, lista de anomalías, recomendaciones accionables. *"No reemplaza al analista; le quita la parte mecánica y le deja la de criterio."*

### 12:00 – 14:00 · Modelo de trabajo y siguientes pasos (2')
- **Arquitectura sin fricción y soberana:** sitio **estático** (no necesita servidor expuesto); los datos son **JSON versionado** alimentado por un **ETL en Python**. Opción de **backend FastAPI/Postgres solo local/self-hosted** si quieren todo dentro de su red. **Los datos sensibles nunca salen de su infraestructura.**
- **Versionado y auditoría:** cada carga queda como *snapshot* con fecha y manifiesto de fuentes. Trazabilidad total: quién, qué dato, de qué fuente, cuándo.
- **Propuesta:** un **piloto acotado** con datos reales de **una** de las tres empresas (sugiero SEMAN, porque tiene EE.FF. auditados 2023 públicos y limpios) para demostrar valor en semanas, no meses.

### 14:00 – 15:00 · Cierre (1')
- Recapitulación en una frase: *"El motor existe y funciona; lo único que falta para que sea de ustedes son sus números."*
- Pedido concreto: *"¿Me autorizan un piloto de 3-4 semanas con datos de una empresa y un punto de contacto técnico?"*
- Agradecimiento y disponibilidad para enviar la propuesta escrita ese mismo día.

---

## (b) Notas del expositor / frases clave

- **Anti-overclaiming como ventaja de venta, no como disculpa:** *"Si ven una cifra sin fuente, desconfíen. En este tablero, cada número o tiene enlace o dice 'ilustrativo'."* Esto genera confianza en un área financiera entrenada para auditar.
- **No competir con su conocimiento:** nunca decir "les voy a mostrar cómo están sus finanzas". Decir: *"ustedes saben sus finanzas; yo les doy la lente para verlas todas juntas y en movimiento."*
- **Anclar siempre en cifras reales citables** (SEMAN ROE 27.43%, SIMA ejecución 121% 2023, PIA Defensa 2026 S/ 9,658.7 M) — demuestran que se hizo la tarea y que el motor se nutre de fuentes verificables.
- **Ante un dato que no se confirmó** (ej. utilidad neta exacta de SIMA 2024, EE.FF. de FAME), decirlo: *"ese dato la fuente pública no lo desagrega; con su acceso interno lo cargamos directo."* Convierte una limitación en argumento de por qué necesitan el piloto.
- **Distinguir lo ilustrativo de lo real en vivo:** repetir al cambiar de módulo. El de **contrataciones OCDS es real** — úsenlo como prueba de que el motor ya consume fuentes oficiales hoy.
- **Tono:** rigor técnico + voz de servicio público. El objetivo es transparencia y mejor gestión del gasto, no vender humo.
- **Cuidado político:** los contratos de FAME están bajo investigación (Contraloría/Fiscalía). Mencionarlos como **ejemplo de por qué la trazabilidad y la analítica de contrataciones importan**, nunca como acusación. Neutralidad total.
- **Si el Meet falla:** tener capturas del dashboard como respaldo y el enlace live listo para que lo abran ellos.

---

## (c) Diapositivas sugeridas (8-10)

**1. Portada**
- Tablero de Inteligencia Financiera del Sector Defensa
- SIMA · FAME · SEMAN — sobre el Observatorio de Empresas Públicas
- Carlos Cárdenas Fernández · [fecha] · MINDEF – Área Financiera

**2. Encuadre honesto**
- No vendemos un análisis de sus finanzas: vendemos el MOTOR
- Cifras demo = `ilustrativo`; cifras verificadas = con fuente y enlace
- Sus datos no salen de su infraestructura

**3. El sector en números (real)**
- PIA Defensa 2026: S/ 9,658.7 M (+13.8%, 3.75% del presupuesto nacional)
- Gasto rígido: 53.3% salarios, 16.5% pensiones, 20.9% bienes/servicios
- Meta de ejecución 2025: 98-99%
- *Fuente: defensa.com / infodefensa (presentaciones al Congreso)*

**4. Tres empresas, tres realidades (real)**
- SIMA: ingresos S/ 1,818.7 M (2023), ejecución 121%; ROE 2024 7.78% (meta 13.71%)
- FAME: reactivada 2023, pérdida ≈ S/ -2.2 M (ago-2024); contratos en observación
- SEMAN: 3.° de 32 FONAFE, ROE 27.43%; ventas S/13.1 M→S/32.1 M (2022→2023)
- *Fuentes: FONAFE, EMIS, EE.FF. auditados SEMAN, ComexPerú*

**5. El problema: datos dispersos**
- Memorias escaneadas no legibles por máquina (SIMA 2024)
- Informes FONAFE + MEF + transparencia + prensa, sin una sola vista
- No hay consolidación, comparabilidad ni alertas automáticas

**6. El tablero (demo)**
- Panel portafolio: KPIs en una pantalla
- Ficha por empresa: financieros, presupuesto, contrataciones, diagnóstico
- Ejecución presupuestal con semáforos (PIA/PIM/devengado)
- *(captura del dashboard live)*

**7. Detección de anomalías y rankings**
- Marca variaciones fuera de rango (ej. SIMA activos +159%, ROE -43%)
- Rankings de rentabilidad, eficiencia y transparencia (Ley 27806)
- Contrataciones OCDS **reales** (API OECE) — no ilustrativo

**8. El bot de IA**
- Preguntas en lenguaje natural sobre los datos cargados
- Resumen ejecutivo + anomalías + recomendaciones
- Demo pública: determinista sin servidor / versión interna: LLM en su perímetro

**9. Modelo de trabajo (soberano)**
- Estático + JSON versionado + ETL Python; backend opcional self-hosted
- Snapshots con fecha y manifiesto de fuentes = auditoría total
- Datos sensibles nunca salen de su red

**10. Siguientes pasos**
- Piloto 3-4 semanas con datos reales de UNA empresa (sugerido: SEMAN)
- Entregable: tablero funcional + informe de hallazgos
- ¿Autorización y punto de contacto técnico?

---

## (d) Preguntas difíciles del financiero y cómo responderlas

**1. "¿Para qué necesito esto si yo ya tengo mis estados financieros y mi SIAF?"**
> *"Exacto, los datos son suyos. Lo que no tienen es una capa que los consolide entre las tres empresas, los compare contra metas y rankings FONAFE, y dispare alertas automáticas antes del cierre. El SIAF registra; este motor interpreta y prioriza. Son complementarios."*

**2. "¿Dónde viven mis datos? ¿Esto es seguro?"**
> *"El sitio es estático y los datos viven donde ustedes decidan: pueden correr todo el ETL y el backend FastAPI dentro de su red, sin exponer nada a internet. La versión pública que ven es solo la vitrina con datos ilustrativos. Sus EE.FF. reales nunca tocan un servidor externo si no lo autorizan."*

**3. "Las cifras que muestran, ¿de dónde salen? ¿Son inventadas?"**
> *"Las marcadas 'ilustrativo' son de demostración, lo decimos explícitamente. Las verificadas llevan su fuente y enlace: FONAFE, EE.FF. auditados, MEF, OECE. El módulo de contrataciones ya consume la API OCDS real del OECE hoy. Nuestra premisa es anti-overclaiming: si un dato no se pudo confirmar, no lo afirmamos."*

**4. "¿No es esto solo un dashboard bonito? ¿Qué tiene de inteligencia?"**
> *"La inteligencia está en tres capas: detección de anomalías (variaciones fuera de rango sin que el analista las busque), rankings y diagnósticos automáticos con recomendaciones, y un asistente que responde en lenguaje natural y redacta el resumen ejecutivo. El gráfico es la punta; debajo hay un motor de reglas y, si quieren, un LLM."*

**5. "El bot de IA, ¿va a alucinar cifras?"**
> *"En la demo el motor es determinista: solo lee el JSON cargado, no genera números nuevos. En la versión interna, si conectan un LLM, lo configuramos para citar siempre la cifra de origen y operar sobre sus datos, dentro de su perímetro. La IA redacta y resume; no inventa el dato."*

**6. "¿Cuánto cuesta y cuánto demora?"**
> *"Propongo empezar con un piloto acotado de 3-4 semanas sobre una sola empresa, a costo de piloto, para que vean valor antes de comprometerse al despliegue completo. El alcance y precio del piloto se los envío hoy mismo por escrito. La inversión grande la deciden después de ver resultados."*

**7. "¿Y el soporte, la actualización de datos, la dependencia de un proveedor?"**
> *"El ETL está versionado y documentado; el código puede quedar en su poder. No quedan atrapados: el formato de datos es JSON abierto y exportable a CSV/Excel. El soporte se define en el contrato, pero el diseño busca que ustedes sean autónomos."*

**8. "Algunos de los contratos que muestran están bajo investigación. ¿No es delicado?"**
> *"Por eso mismo importa. No emitimos juicios: mostramos los datos públicos OCDS con su fuente. Una herramienta así, usada internamente, les ayuda a detectar concentración o modalidades atípicas temprano y a documentar trazabilidad, que es justo lo que un órgano de control valora."*

**9. "¿Por qué SEMAN para el piloto y no SIMA, que es la grande?"**
> *"Porque SEMAN tiene EE.FF. auditados 2023 públicos y limpios, lo que nos deja probar el motor rápido y sin fricción de acceso. SIMA es el premio mayor, pero su memoria 2024 está escaneada y sus cifras desagregadas requieren su acceso interno. Empezamos por donde el valor se demuestra más rápido; luego escalamos a las tres."*

**10. "¿Qué pasa si cambia la gestión o el directorio?"**
> *"El tablero es institucional, no personal: vive sobre datos y reglas, no sobre criterios de una persona. El versionado garantiza continuidad y los snapshots dejan memoria histórica que sobrevive a los cambios de gestión."*

---

## (e) Propuesta comercial de siguientes pasos (piloto con datos reales)

### Objetivo del piloto
Demostrar, con **datos reales de una empresa del sector** (recomendado: **SEMAN Perú S.A.C.**, por contar con EE.FF. auditados 2023 públicos), que el tablero entrega KPIs, ejecución presupuestal, rankings, anomalías y analítica de contrataciones de forma utilizable por el Área Financiera.

### Alcance (3-4 semanas)
1. **Semana 1 — Ingesta y modelado.** Carga de EE.FF. reales (situación financiera, resultados) y ejecución presupuestal de la empresa piloto al ETL; mapeo a la estructura del Observatorio. Conexión del módulo de contrataciones a la API OCDS real del OECE para esa empresa.
2. **Semana 2 — Tablero y reglas.** Ficha completa de la empresa, KPIs, semáforos de ejecución, posición en ranking FONAFE, reglas de anomalías calibradas a sus rangos.
3. **Semana 3 — IA y hallazgos.** Resumen ejecutivo automático, lista de anomalías, recomendaciones; asistente de consultas en lenguaje natural sobre los datos cargados.
4. **Semana 4 — Validación y entrega.** Sesión de revisión con el Área Financiera, ajustes, y **informe de hallazgos** + tablero funcional desplegado en el entorno acordado (self-hosted o estático interno).

### Modalidad y soberanía de datos
- Todo el procesamiento puede ejecutarse **dentro de la infraestructura del MINDEF** (ETL Python + backend FastAPI/Postgres local). Los datos sensibles **no salen de su red**.
- Entregables versionados con **manifiesto de fuentes y snapshots fechados** (auditoría completa).

### Entregables
- Tablero funcional de la empresa piloto (KPIs, presupuesto, rankings, anomalías, contrataciones OCDS reales).
- Asistente de IA operativo sobre los datos cargados.
- Informe ejecutivo de hallazgos y recomendaciones.
- Código ETL documentado (transferible al MINDEF).

### Requisitos del MINDEF para arrancar
- Autorización formal del piloto.
- **Un punto de contacto técnico** (acceso a EE.FF. y datos de ejecución de la empresa piloto).
- Definición del entorno de despliegue (interno/self-hosted o estático).

### Escalamiento posterior
- Extender a **las tres empresas** (SIMA, FAME, SEMAN) y al consolidado del sector.
- Conectores en vivo a MEF Consulta Amigable y portales de transparencia.
- Soporte, capacitación y actualización programada del ETL (a definir en contrato).

### Costo
- **Piloto a costo acotado** (propuesta económica escrita se remite el mismo día de la reunión). La inversión de despliegue completo se decide tras validar resultados del piloto.

---

*Documento de preparación interno. Todas las cifras "reales" citadas llevan fuente verificable; las del dashboard demo están marcadas `ilustrativo`. Premisa: anti-overclaiming, transparencia y mejor gestión del gasto público.*
