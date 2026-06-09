#!/usr/bin/env python3
"""Build the SECTORIAL DE DEFENSA dataset from the latest FONAFE dataset.
Takes SIMA + FAME, creates SEMAN, integrates ONLY verified real facts
(is_real=true) as `sources` + `realFacts` per company, adjusts a few
illustrative datapoints with real values (flagged), and adds a root `mindef`
block. Series remain ILLUSTRATIVE except realFacts.
"""
import json, copy, os

SRC = "/Users/unimauro/Documents/Repos/observatorio-fonafe/frontend/public/data/latest/dataset.json"
OUT = "/Users/unimauro/Documents/Repos/observatorio-fonafe/frontend/public/data/defense/dataset.json"

src = json.load(open(SRC, encoding="utf-8"))
by_slug = {c["slug"]: c for c in src["companies"]}
sima = copy.deepcopy(by_slug["sima"])
fame = copy.deepcopy(by_slug["fame"])

# ---------------------------------------------------------------------------
# Helper to set a financial-year datapoint and flag it as real-adjusted
def set_fin(company, year, **fields):
    for f in company["financials"]:
        if f["year"] == year:
            f.update(fields)
            f["is_real_adjusted"] = True
            f["real_fields"] = sorted(list(fields.keys()))
            return
# ---------------------------------------------------------------------------

# ====================== SIMA ======================
# Real RUC (research): 20100003351 (latest had a placeholder/different RUC)
sima["ruc"] = "20100003351"
sima["ruc_is_real"] = True
sima["website"] = "https://www.sima.com.pe/"
sima["employees"] = 1569          # EMIS 2024 (confidence media)
sima["employees_is_real"] = True
sima["employees_year"] = 2024
sima["employees_source"] = "EMIS"
sima["description"] = ("Astillero del Estado peruano: reparacion, carena y construccion de buques "
    "de la Marina de Guerra del Peru, metalmecanica e I+D. Tres centros (Callao, Chimbote, "
    "Iquitos). Empresa FONAFE (100%) bajo el Sector Defensa. Ejecutor del programa de "
    "modernizacion naval (clase Makassar y fragatas HDF-3600 con HD Hyundai).")

# REAL datapoint: ingresos operativos ejecutados 2023 = S/1,818.7 M (FONAFE)
set_fin(sima, 2023, revenue=1818.7)

sima["sources"] = [
    {"name": "FONAFE - Perfil SIMA Peru S.A.", "url": "https://www.fonafe.gob.pe/empresasdelacorporacion/simaperusa", "status": "activo"},
    {"name": "FONAFE - Evaluacion Presupuestal y Financiera Ano 2023 (Informe Consolidado EPE y ESSALUD)", "url": "https://www.fonafe.gob.pe/pw_content/gestion/13/Doc/Informe%20Consolidado%20A%C3%B1o%202023%20EPE%20y%20ESSALUD%2006.05.2024-FIRMADO.pdf", "status": "activo"},
    {"name": "Memoria Anual 2024 SIMA-PERU S.A.", "url": "https://files.sima.com.pe/Transparencia/mapafonafesp/3200_SimaPeru_II_Memoria_Anual_2024.pdf", "status": "activo (PDF escaneado)"},
    {"name": "datosperu (SUNAT) - SIMA", "url": "https://www.datosperu.org/empresa-servicios-industriales-de-la-marina-sa-20100003351.php", "status": "activo"},
    {"name": "EMIS - Perfil SIMA Peru S.A.", "url": "https://www.emis.com/php/company-profile/PE/Sima_Peru_SA_es_3398606.html", "status": "activo (paywall parcial)"},
    {"name": "FONAFE - Perfil SIMA Iquitos S.R.L.", "url": "https://www.fonafe.gob.pe/empresasdelacorporacion/simaiquitossrl", "status": "activo"},
    {"name": "SIMA Peru - Sitio oficial", "url": "https://www.sima.com.pe/", "status": "activo"},
    {"name": "Defensa.com - Contrato G2G Peru-Corea (Hyundai)", "url": "https://www.defensa.com/peru/firma-hyundai-construccion-buque-multirol-opv-dos-buques-para", "status": "activo"},
    {"name": "Infodefensa - Corte primera chapa HDF-3600", "url": "https://www.infodefensa.com/texto-diario/mostrar/5675141/sima-peru-corta-primera-chapa-metal-fragata-multirol-hdf-3600", "status": "activo"},
    {"name": "Zona Militar - Entrega BAP Paita", "url": "https://www.zona-militar.com/2025/07/28/sima-entrego-a-la-marina-de-guerra-del-peru-al-buque-multiproposito-bap-paita/", "status": "activo"},
]
sima["realFacts"] = [
    {"metric": "RUC", "value": "20100003351", "year": 2025, "unit": "", "source_name": "FONAFE / datosperu (SUNAT)", "source_url": "https://www.fonafe.gob.pe/empresasdelacorporacion/simaperusa", "confidence": "alta"},
    {"metric": "Ano de fundacion", "value": "1950 (constituida como empresa estatal de derecho privado en 1982)", "year": 1950, "unit": "", "source_name": "FONAFE - Perfil SIMA Peru", "source_url": "https://www.fonafe.gob.pe/empresasdelacorporacion/simaperusa", "confidence": "alta"},
    {"metric": "Actividad economica principal (CIIU)", "value": "Construccion de buques y entidades flotantes (CIIU 3011)", "year": 2025, "unit": "", "source_name": "datosperu (SUNAT)", "source_url": "https://www.datosperu.org/empresa-servicios-industriales-de-la-marina-sa-20100003351.php", "confidence": "alta"},
    {"metric": "Ingresos operativos ejecutados", "value": "1818.7", "year": 2023, "unit": "millones de S/", "source_name": "FONAFE - Evaluacion Presupuestal y Financiera Ano 2023", "source_url": "https://www.fonafe.gob.pe/pw_content/gestion/13/Doc/Informe%20Consolidado%20A%C3%B1o%202023%20EPE%20y%20ESSALUD%2006.05.2024-FIRMADO.pdf", "confidence": "alta"},
    {"metric": "Meta de ingresos operativos (ejecucion 121%)", "value": "1503.2", "year": 2023, "unit": "millones de S/", "source_name": "FONAFE - Evaluacion Presupuestal y Financiera Ano 2023", "source_url": "https://www.fonafe.gob.pe/pw_content/gestion/13/Doc/Informe%20Consolidado%20A%C3%B1o%202023%20EPE%20y%20ESSALUD%2006.05.2024-FIRMADO.pdf", "confidence": "alta"},
    {"metric": "Crecimiento de activos", "value": "+159", "year": 2023, "unit": "% vs ano anterior", "source_name": "FONAFE - Evaluacion Presupuestal y Financiera Ano 2023", "source_url": "https://www.fonafe.gob.pe/pw_content/gestion/13/Doc/Informe%20Consolidado%20A%C3%B1o%202023%20EPE%20y%20ESSALUD%2006.05.2024-FIRMADO.pdf", "confidence": "alta"},
    {"metric": "Incremento de pasivos (ingresos diferidos por adelantos navales)", "value": "+1415", "year": 2023, "unit": "millones de S/", "source_name": "FONAFE - Evaluacion Presupuestal y Financiera Ano 2023", "source_url": "https://www.fonafe.gob.pe/pw_content/gestion/13/Doc/Informe%20Consolidado%20A%C3%B1o%202023%20EPE%20y%20ESSALUD%2006.05.2024-FIRMADO.pdf", "confidence": "alta"},
    {"metric": "ROE (rentabilidad sobre patrimonio)", "value": "7.78", "year": 2024, "unit": "% (meta 13.71%)", "source_name": "Memoria Anual 2024 SIMA-PERU S.A.", "source_url": "https://files.sima.com.pe/Transparencia/mapafonafesp/3200_SimaPeru_II_Memoria_Anual_2024.pdf", "confidence": "media"},
    {"metric": "ROA (rentabilidad sobre activos)", "value": "0.35", "year": 2024, "unit": "ratio (meta 0.90)", "source_name": "Memoria Anual 2024 SIMA-PERU S.A.", "source_url": "https://files.sima.com.pe/Transparencia/mapafonafesp/3200_SimaPeru_II_Memoria_Anual_2024.pdf", "confidence": "media"},
    {"metric": "Crecimiento de ingresos netos", "value": "+191.03", "year": 2024, "unit": "% vs 2023", "source_name": "EMIS - Perfil SIMA Peru S.A.", "source_url": "https://www.emis.com/php/company-profile/PE/Sima_Peru_SA_es_3398606.html", "confidence": "media"},
    {"metric": "Numero de trabajadores", "value": "1569", "year": 2024, "unit": "empleados", "source_name": "EMIS - Perfil SIMA Peru S.A.", "source_url": "https://www.emis.com/php/company-profile/PE/Sima_Peru_SA_es_3398606.html", "confidence": "media"},
    {"metric": "Numero de trabajadores", "value": "~1542", "year": 2025, "unit": "empleados", "source_name": "datosperu (SUNAT, nov-2025)", "source_url": "https://www.datosperu.org/empresa-servicios-industriales-de-la-marina-sa-20100003351.php", "confidence": "media"},
    {"metric": "Centros de operacion", "value": "3 (Callao, Chimbote, Iquitos)", "year": 2025, "unit": "centros", "source_name": "SIMA Peru - Sitio oficial", "source_url": "https://www.sima.com.pe/", "confidence": "alta"},
    {"metric": "Participacion de SIMA en pasivos consolidados FONAFE", "value": "2.6", "year": 2023, "unit": "% del total de pasivos FONAFE", "source_name": "FONAFE - Evaluacion Presupuestal y Financiera Ano 2023", "source_url": "https://www.fonafe.gob.pe/pw_content/gestion/13/Doc/Informe%20Consolidado%20A%C3%B1o%202023%20EPE%20y%20ESSALUD%2006.05.2024-FIRMADO.pdf", "confidence": "alta"},
    {"metric": "Filial SIMA Iquitos S.R.L.", "value": "RUC 20203866497; 100% SIMA; constituida 1993; ambito Loreto", "year": 2023, "unit": "", "source_name": "FONAFE - Perfil SIMA Iquitos", "source_url": "https://www.fonafe.gob.pe/empresasdelacorporacion/simaiquitossrl", "confidence": "alta"},
    {"metric": "Contrato G2G Peru-Corea (HD Hyundai): 1 fragata multirol + 1 OPV + 2 buques logisticos", "value": "462.9", "year": 2024, "unit": "millones de USD", "source_name": "Defensa.com", "source_url": "https://www.defensa.com/peru/firma-hyundai-construccion-buque-multirol-opv-dos-buques-para", "confidence": "media"},
    {"metric": "Entrega buque multiproposito BAP Paita (LPD-2, clase Makassar, 10,894 t)", "value": "Entregado 28-jul-2025 (2do de su clase)", "year": 2025, "unit": "", "source_name": "Zona Militar", "source_url": "https://www.zona-militar.com/2025/07/28/sima-entrego-a-la-marina-de-guerra-del-peru-al-buque-multiproposito-bap-paita/", "confidence": "alta"},
    {"metric": "Corte de primera chapa fragata multirol HDF-3600 (SIMA Callao, entrega prevista 2029)", "value": "17-nov-2025", "year": 2025, "unit": "", "source_name": "Infodefensa", "source_url": "https://www.infodefensa.com/texto-diario/mostrar/5675141/sima-peru-corta-primera-chapa-metal-fragata-multirol-hdf-3600", "confidence": "alta"},
]
# Real news (replace placeholder convenios)
sima["news"] = [
    {"date": "2024-04-18", "title": "Peru firma G2G con HD Hyundai: fragata multirol, OPV y 2 buques logisticos por USD 462.9 M (ejecucion en SIMA)", "url": "https://www.defensa.com/peru/firma-hyundai-construccion-buque-multirol-opv-dos-buques-para"},
    {"date": "2025-07-28", "title": "SIMA entrega a la MGP el buque multiproposito BAP Paita (2do clase Makassar)", "url": "https://www.zona-militar.com/2025/07/28/sima-entrego-a-la-marina-de-guerra-del-peru-al-buque-multiproposito-bap-paita/"},
    {"date": "2025-11-17", "title": "SIMA corta la primera chapa de acero de la fragata multirol HDF-3600 (entrega prevista 2029)", "url": "https://www.infodefensa.com/texto-diario/mostrar/5675141/sima-peru-corta-primera-chapa-metal-fragata-multirol-hdf-3600"},
    {"date": "2025-10-05", "title": "SIMA construira un Buque de Investigacion Pesquera y Oceanografica (asociacion con Corea del Sur)", "url": "https://www.zona-militar.com/2025/10/05/profundizando-su-asociacion-con-corea-del-sur-sima-construira-un-nuevo-buque-de-investigacion-pesquera-y-oceanografica-para-el-peru/"},
    {"date": "2025-12-21", "title": "SIMA y HHI inician co-desarrollo para la produccion de nuevos submarinos para la MGP", "url": "https://www.zona-militar.com/2025/12/21/sima-y-hhi-inician-el-co-desarrollo-para-la-produccion-de-nuevos-submarinos-para-la-marina-de-guerra-del-peru/"},
]
sima["caveats"] = ("La Memoria Anual 2024 (PDF en portal de transparencia) es escaneada; solo se "
    "confirmaron ratios (ROE 7.78%, ROA 0.35) por indexacion, confianza media. La cifra exacta mas "
    "solida (ingresos operativos S/1,818.7 M, ejecucion 121%) corresponde a 2023 (Informe Consolidado "
    "FONAFE), no 2024. El contrato G2G con Hyundai (USD 462.9 M) proviene de prensa de defensa, no de la "
    "fuente contractual primaria. El subgrupo 'resto de empresas' FONAFE 2024 reporto perdidas combinadas "
    "de -S/697 M, pero SIN desagregar SIMA; los ratios positivos sugieren utilidad neta positiva pero "
    "menor a la meta.")

# ====================== FAME ======================
fame["name"] = "Fabrica de Armas y Municiones del Ejercito S.A.C."
fame["acronym"] = "FAME"
fame["ruc"] = "20522449271"        # real RUC (latest had placeholder)
fame["ruc_is_real"] = True
fame["website"] = "http://www.famesac.com/"
fame["employees"] = 73             # EMIS 2024
fame["employees_is_real"] = True
fame["employees_year"] = 2024
fame["employees_source"] = "EMIS"
fame["region"] = "Lima"
fame["description"] = ("Empresa estatal de derecho privado (S.A.C.) creada por Ley 29314 (2009; industria "
    "desde 1963). Fabrica, mantiene y comercializa armas y municiones para FF.AA., PNP y mercado civil. "
    "Sector Defensa (Ejercito), empresa FONAFE. Desde 2023 reactivo operaciones via joint ventures "
    "(fusiles ARAD de IWI/Israel, blindados Hyundai Rotem) bajo compra 'por encargo' (Ley 31684). "
    "Sede en la ex-Hacienda Nieveria (Huachipa-Lurigancho).")

# REAL datapoint: resultado neto acumulado a ago-2024 = -2.2 M (confianza baja)
set_fin(fame, 2024, netIncome=-2.2)

fame["sources"] = [
    {"name": "FONAFE - ficha FAME S.A.C.", "url": "https://www.fonafe.gob.pe/empresasdelacorporacion/famesac", "status": "activo"},
    {"name": "EMIS - perfil FAME S.A.C.", "url": "https://www.emis.com/php/company-profile/PE/Fabrica_De_Armas_Y_Municiones_Del_Ejercito_SAC_-_Fame_SAC_es_4149864.html", "status": "activo (paywall parcial)"},
    {"name": "ComexPeru - FONAFE bajo la lupa", "url": "https://www.comexperu.org.pe/articulo/fonafe-bajo-la-lupa-resultados-que-esconden-una-preocupante-realidad", "status": "activo (no se confirmo mencion textual de FAME)"},
    {"name": "Gestion - FAME potencial inversion USD 600 M", "url": "https://gestion.pe/economia/empresas/fame-invertira-us-600-millones-para-potenciar-industria-de-defensa-nacional-ejercito-municiones-fuerzas-armadas-ejercito-noticia/", "status": "activo"},
    {"name": "Infobae - apuesta industrial de FAME", "url": "https://www.infobae.com/peru/2025/06/24/la-apuesta-industrial-de-fame-para-reactivar-la-industria-de-defensa-peruana/", "status": "activo"},
    {"name": "Zona Militar - entrega 10,000 fusiles IWI ARAD 7", "url": "https://www.zona-militar.com/2024/12/21/fame-sac-concreto-la-entrega-de-los-10-000-nuevos-fusiles-iwi-arad-7-al-ejercito-del-peru/", "status": "activo"},
    {"name": "Defensa.com - FAME y Contraloria (fusiles ARAD 7)", "url": "https://www.defensa.com/peru/fame-sac-precisa-puntos-clave-informe-auditoria-contraloria-peru", "status": "activo"},
    {"name": "La Republica - blindados 8x8 K-808 pagados al contado", "url": "https://larepublica.pe/politica/actualidad/2025/03/13/ejercito-pago-al-cash-us60-millones-por-blindados-que-descalifico-en-2023-fame-ejercito-del-peru-contraloria-hnews-1016040", "status": "activo"},
    {"name": "La Republica - Mininter compra sin licitacion 31,045 pistolas via FAME", "url": "https://larepublica.pe/politica/2026/05/31/ministerio-del-interior-recurre-a-fame-para-comprar-sin-licitacion-31045-pistolas-1348872", "status": "activo"},
    {"name": "Ley N.º 29314 - Congreso del Peru", "url": "https://www2.congreso.gob.pe/sicr/cendocbib/con4_uibd.nsf/E2DDE0DA0F7B509D052579C7006845A3/$FILE/29314.pdf", "status": "activo"},
]
fame["realFacts"] = [
    {"metric": "RUC", "value": "20522449271", "year": 2026, "unit": "", "source_name": "FONAFE - ficha FAME S.A.C.", "source_url": "https://www.fonafe.gob.pe/empresasdelacorporacion/famesac", "confidence": "alta"},
    {"metric": "Numero de trabajadores", "value": "73", "year": 2024, "unit": "empleados", "source_name": "EMIS - perfil FAME S.A.C.", "source_url": "https://www.emis.com/php/company-profile/PE/Fabrica_De_Armas_Y_Municiones_Del_Ejercito_SAC_-_Fame_SAC_es_4149864.html", "confidence": "media"},
    {"metric": "Resultado neto (perdida acumulada a agosto)", "value": "-2.2", "year": 2024, "unit": "millones de S/", "source_name": "ComexPeru (via resultados FONAFE)", "source_url": "https://www.comexperu.org.pe/articulo/fonafe-bajo-la-lupa-resultados-que-esconden-una-preocupante-realidad", "confidence": "baja"},
    {"metric": "Crecimiento de ingresos netos", "value": "+2401.2", "year": 2024, "unit": "% interanual", "source_name": "EMIS - perfil FAME S.A.C.", "source_url": "https://www.emis.com/php/company-profile/PE/Fabrica_De_Armas_Y_Municiones_Del_Ejercito_SAC_-_Fame_SAC_es_4149864.html", "confidence": "media"},
    {"metric": "Crecimiento de activos totales", "value": "+32.11", "year": 2024, "unit": "%", "source_name": "EMIS - perfil FAME S.A.C.", "source_url": "https://www.emis.com/php/company-profile/PE/Fabrica_De_Armas_Y_Municiones_Del_Ejercito_SAC_-_Fame_SAC_es_4149864.html", "confidence": "media"},
    {"metric": "Plan de inversion anunciado (industria de defensa, a 10 anos)", "value": "600", "year": 2025, "unit": "millones de USD (potencial)", "source_name": "Gestion / El Peruano", "source_url": "https://gestion.pe/economia/empresas/fame-invertira-us-600-millones-para-potenciar-industria-de-defensa-nacional-ejercito-municiones-fuerzas-armadas-ejercito-noticia/", "confidence": "media"},
    {"metric": "Capacidad de produccion de municiones (planta proyectada)", "value": "hasta 20 millones", "year": 2025, "unit": "cartuchos/ano", "source_name": "Infobae", "source_url": "https://www.infobae.com/peru/2025/06/24/la-apuesta-industrial-de-fame-para-reactivar-la-industria-de-defensa-peruana/", "confidence": "media"},
    {"metric": "Fusiles ARAD-7 (7.62x51mm) entregados al Ejercito", "value": "10000", "year": 2024, "unit": "fusiles", "source_name": "Zona Militar", "source_url": "https://www.zona-militar.com/2024/12/21/fame-sac-concreto-la-entrega-de-los-10-000-nuevos-fusiles-iwi-arad-7-al-ejercito-del-peru/", "confidence": "alta"},
    {"metric": "Contrato 039-2023 EP/SMGE: 10,000 fusiles IWI ARAD 7", "value": "103.74", "year": 2023, "unit": "millones de S/ (~USD 27.3 M)", "source_name": "Defensa.com", "source_url": "https://www.defensa.com/peru/fame-sac-precisa-puntos-clave-informe-auditoria-contraloria-peru", "confidence": "media"},
    {"metric": "Adquisicion por encargo de 30 blindados 8x8 K-808 (Hyundai Rotem), pago al contado sin licitacion", "value": "60", "year": 2025, "unit": "millones de USD", "source_name": "La Republica / Contraloria", "source_url": "https://larepublica.pe/politica/actualidad/2025/03/13/ejercito-pago-al-cash-us60-millones-por-blindados-que-descalifico-en-2023-fame-ejercito-del-peru-contraloria-hnews-1016040", "confidence": "media"},
    {"metric": "Ano de constitucion como S.A.C.", "value": "2009 (Ley 29314; industria desde 1963)", "year": 2009, "unit": "", "source_name": "Ley N.º 29314 - Congreso del Peru", "source_url": "https://www2.congreso.gob.pe/sicr/cendocbib/con4_uibd.nsf/E2DDE0DA0F7B509D052579C7006845A3/$FILE/29314.pdf", "confidence": "alta"},
]
fame["news"] = [
    {"date": "2024-12-21", "title": "FAME concreto la entrega de 10,000 fusiles IWI ARAD 7 al Ejercito del Peru", "url": "https://www.zona-militar.com/2024/12/21/fame-sac-concreto-la-entrega-de-los-10-000-nuevos-fusiles-iwi-arad-7-al-ejercito-del-peru/"},
    {"date": "2024-07-03", "title": "Contraloria (Informe 018-2024) cuestiona la compra de 10,000 fusiles ARAD 7 y la seleccion de IWI", "url": "https://www.defensa.com/peru/fame-sac-precisa-puntos-clave-informe-auditoria-contraloria-peru"},
    {"date": "2025-03-13", "title": "El Ejercito pago al contado USD 60 M por blindados 8x8 K-808 encargados a FAME sin licitacion", "url": "https://larepublica.pe/politica/actualidad/2025/03/13/ejercito-pago-al-cash-us60-millones-por-blindados-que-descalifico-en-2023-fame-ejercito-del-peru-contraloria-hnews-1016040"},
    {"date": "2025-06-24", "title": "FAME anuncia potencial de inversion de USD 600 M en la industria de defensa", "url": "https://gestion.pe/economia/empresas/fame-invertira-us-600-millones-para-potenciar-industria-de-defensa-nacional-ejercito-municiones-fuerzas-armadas-ejercito-noticia/"},
    {"date": "2026-05-31", "title": "Mininter recurre a FAME para comprar sin licitacion 31,045 pistolas (IWI)", "url": "https://larepublica.pe/politica/2026/05/31/ministerio-del-interior-recurre-a-fame-para-comprar-sin-licitacion-31045-pistolas-1348872"},
]
fame["caveats"] = ("No se accedio a los EE.FF. oficiales auditados de FAME (gob.pe/fame HTTP 418; dashboards "
    "FONAFE dinamicos). La perdida de S/-2.2 M (a ago-2024) viene de un snippet atribuido a ComexPeru pero "
    "NO se confirmo en el HTML del articulo (confianza baja). 73 empleados (2024) es dato EMIS (comercial). "
    "Los crecimientos de EMIS son % sin montos absolutos (paywall). El plan de USD 600 M es un anuncio/"
    "potencial a 10 anos. Varios contratos (ARAD-7, blindados, pistolas) estan bajo investigacion de "
    "Contraloria/Fiscalia por compra 'por encargo' sin licitacion (Ley 31684).")
# Update placeholder anomaly/recommendation norms to reflect real context
fame["anomalies"] = [
    {"type": "recurring_losses", "severity": "alta", "description": "Resultado neto negativo reportado (perdida acumulada -S/2.2 M a ago-2024, confianza baja)."},
    {"type": "procurement_under_audit", "severity": "alta", "description": "Contratos de armamento (ARAD-7, blindados K-808, pistolas) bajo investigacion de Contraloria y Fiscalia por compra 'por encargo' sin licitacion (Ley 31684)."},
    {"type": "low_transparency", "severity": "media", "description": "EE.FF. oficiales auditados no accesibles publicamente (portal gob.pe/fame devuelve HTTP 418)."},
]

# ====================== SEMAN (nueva) ======================
seman = {
    "slug": "seman",
    "name": "Servicio de Mantenimiento del Peru S.A.C.",
    "acronym": "SEMAN",
    "sector": "Industrial/Defensa",
    "holding": "FONAFE",
    "region": "Lima",
    "ruc": "20608861549",
    "ruc_is_real": True,
    "website": "https://www.seman.com.pe",
    "employees": 0,            # no publicado oficialmente
    "employees_is_real": False,
    "description": ("Empresa estatal de derecho privado (S.A.C.) del Sector Defensa, creada por Ley 30469 "
        "sobre la base del Servicio de Mantenimiento de la FAP. Organizacion MRO (mantenimiento, reparacion "
        "y overhaul) de aeronaves, motores y sistemas aeronauticos civiles, comerciales, policiales y "
        "militares; fabricacion de partes aeronauticas. Opera desde la Base Aerea Las Palmas (Surco). "
        "Empresa FONAFE (con 2 directores representantes de FONAFE). Inicio operaciones en enero de 2022."),
    "directors": [{"role": "Presidente del Directorio", "name": "—"}],
    # Financials: 2022 y 2023 con cifras REALES (EE.FF. auditados, en S/ millones).
    # Resto de anios ILUSTRATIVOS para completar la serie del tablero.
    "financials": [
        {"year": 2015, "revenue": 0.0, "netIncome": 0.0, "ebitda": 0.0, "investment": 0.0, "budget": 0.0, "budgetExecuted": 0.0, "note": "pre-operacion (empresa inicio 2022)"},
        {"year": 2016, "revenue": 0.0, "netIncome": 0.0, "ebitda": 0.0, "investment": 0.0, "budget": 0.0, "budgetExecuted": 0.0, "note": "pre-operacion"},
        {"year": 2017, "revenue": 0.0, "netIncome": 0.0, "ebitda": 0.0, "investment": 0.0, "budget": 0.0, "budgetExecuted": 0.0, "note": "pre-operacion"},
        {"year": 2018, "revenue": 0.0, "netIncome": 0.0, "ebitda": 0.0, "investment": 0.0, "budget": 0.0, "budgetExecuted": 0.0, "note": "pre-operacion"},
        {"year": 2019, "revenue": 0.0, "netIncome": 0.0, "ebitda": 0.0, "investment": 0.0, "budget": 0.0, "budgetExecuted": 0.0, "note": "pre-operacion"},
        {"year": 2020, "revenue": 0.0, "netIncome": 0.0, "ebitda": 0.0, "investment": 0.0, "budget": 0.0, "budgetExecuted": 0.0, "note": "pre-operacion"},
        {"year": 2021, "revenue": 0.0, "netIncome": 0.0, "ebitda": 0.0, "investment": 0.0, "budget": 0.0, "budgetExecuted": 0.0, "note": "pre-operacion (inscrita nov-2021)"},
        # 2022 REAL: ventas 13,146,746 ; utilidad neta 2,964,763 (EE.FF. auditados)
        {"year": 2022, "revenue": 13.15, "netIncome": 2.96, "ebitda": 0.0, "investment": 0.0, "budget": 0.0, "budgetExecuted": 0.0, "is_real_adjusted": True, "real_fields": ["revenue", "netIncome"]},
        # 2023 REAL: ventas 32,098,571 ; utilidad neta 3,362,450 ; utilidad operativa 4,992,164
        {"year": 2023, "revenue": 32.10, "netIncome": 3.36, "ebitda": 4.99, "investment": 0.0, "budget": 0.0, "budgetExecuted": 0.0, "is_real_adjusted": True, "real_fields": ["revenue", "netIncome", "ebitda_proxy_utilidad_operativa"]},
        # 2024-2025 ILUSTRATIVO (no hay EE.FF. publicados; solo ROE 27.43% AF-2024 conocido)
        {"year": 2024, "revenue": 35.0, "netIncome": 3.7, "ebitda": 5.4, "investment": 0.0, "budget": 0.0, "budgetExecuted": 0.0, "note": "ilustrativo (sin EE.FF. publicados; solo ROE 27.43% AF-2024)"},
        {"year": 2025, "revenue": 36.5, "netIncome": 3.9, "ebitda": 5.6, "investment": 0.0, "budget": 0.0, "budgetExecuted": 0.0, "note": "ilustrativo"},
    ],
    "periodic": {"quarterly": [], "monthly": []},
    "news": [
        {"date": "2024-07-03", "title": "SEMAN Peru y KAI firman acuerdo para producir ~250 partes estructurales del caza FA-50", "url": "https://www.seman.com.pe/en/blog/el-seman-peru-sac-y-korea-aerospace-industries-firman-acuerdo-comercial-internacional-para-la-implementacion-de-la-linea-de-produccion-de-piezas-aeronauticas-de-la-aeronave-fa-50/"},
        {"date": "2024-11-15", "title": "Peru y Corea del Sur firman MoU para que SEMAN fabrique piezas del caza KF-21 Boramae", "url": "https://www.defensemirror.com/news/38213/Peruvian_Firm_SEMAN_to_Manufacture_Parts_for_S_Korean_KF_21_Jet"},
        {"date": "2025-03-04", "title": "SEMAN alcanza 3er lugar (ROE 27.43%) entre 32 empresas FONAFE en el Ranking de Rentabilidad AF-2024", "url": "https://www.defensa.com/peru/seman-peru-consolida-como-empresas-publicas-pais-mas-rentables"},
        {"date": "2025-05-15", "title": "SEMAN expone sus capacidades MRO en SITDEF 2025 (Boeing, Dash 8, Embraer E175, C-130/L-100)", "url": "https://www.defensa.com/peru/seguridad-calidad-precision-mantenimiento-aeronautico-seman-peru"},
    ],
    "metrics": {
        "netMargin": round(3.36 / 32.10 * 100, 1),   # 2023 real ~10.5%
        "revenuePerEmployee": 0.0,                     # empleados no publicados
        "transparencyScore": 60,
        "budgetExecution": 0.0,
    },
    "transparency": {"score": 60, "financials": True, "memoria": False, "directory": True, "budget": False},
    "anomalies": [],
    "recommendations": [
        {"category": "Transparencia", "priority": "media", "action": "Publicar EE.FF. auditados 2024 y 2025, memoria anual y presupuesto/POI en el Portal de Transparencia Estandar.", "norma": "Ley 27806 (Transparencia y Acceso a la Informacion Publica)"},
    ],
    "sources": [
        {"name": "Informe financiero auditado SEMAN 2023 (gob.pe)", "url": "https://cdn.www.gob.pe/uploads/document/file/6165091/5438966-informe-financiero-seman-2023_16_feb_2024-pdf.crdownload?v=1712702225", "status": "activo"},
        {"name": "FONAFE - ficha SEMAN Peru S.A.C.", "url": "https://www.fonafe.gob.pe/empresasdelacorporacion/semanperusac", "status": "activo"},
        {"name": "El Peruano - Ley N.º 30469 (creacion de SEMAN)", "url": "https://busquedas.elperuano.pe/normaslegales/ley-de-creacion-del-servicio-de-mantenimiento-del-peru-sac-ley-n-30469-1395655-1/", "status": "activo"},
        {"name": "Defensa.com - SEMAN 3er lugar ranking rentabilidad FONAFE AF-2024", "url": "https://www.defensa.com/peru/seman-peru-consolida-como-empresas-publicas-pais-mas-rentables", "status": "activo"},
        {"name": "Defensa.com - Capacidades MRO de SEMAN (SITDEF 2025)", "url": "https://www.defensa.com/peru/seguridad-calidad-precision-mantenimiento-aeronautico-seman-peru", "status": "activo"},
        {"name": "SEMAN - Acuerdo con KAI (FA-50)", "url": "https://www.seman.com.pe/en/blog/el-seman-peru-sac-y-korea-aerospace-industries-firman-acuerdo-comercial-internacional-para-la-implementacion-de-la-linea-de-produccion-de-piezas-aeronauticas-de-la-aeronave-fa-50/", "status": "activo"},
        {"name": "Defense Mirror - SEMAN/KF-21", "url": "https://www.defensemirror.com/news/38213/Peruvian_Firm_SEMAN_to_Manufacture_Parts_for_S_Korean_KF_21_Jet", "status": "activo"},
        {"name": "datosperu - SEMAN", "url": "https://www.datosperu.org/empresa-servicio-de-mantenimiento-del-peru-sociedad-anonima-cerrada-seman-peru-sac-20608861549.php", "status": "activo (fuente secundaria; validar RUC en SUNAT)"},
    ],
    "realFacts": [
        {"metric": "Naturaleza juridica", "value": "Empresa estatal de derecho privado (S.A.C.), Sector Defensa; Ley 30469, D. Leg. 1031 y Ley 26887", "year": 2023, "unit": "", "source_name": "Informe financiero auditado SEMAN 2023", "source_url": "https://cdn.www.gob.pe/uploads/document/file/6165091/5438966-informe-financiero-seman-2023_16_feb_2024-pdf.crdownload?v=1712702225", "confidence": "alta"},
        {"metric": "RUC", "value": "20608861549", "year": 2025, "unit": "", "source_name": "FONAFE - ficha SEMAN", "source_url": "https://www.fonafe.gob.pe/empresasdelacorporacion/semanperusac", "confidence": "alta"},
        {"metric": "Ley de creacion", "value": "Ley N.º 30469 (publicada 22-jun-2016)", "year": 2016, "unit": "", "source_name": "El Peruano - Normas Legales", "source_url": "https://busquedas.elperuano.pe/normaslegales/ley-de-creacion-del-servicio-de-mantenimiento-del-peru-sac-ley-n-30469-1395655-1/", "confidence": "alta"},
        {"metric": "Constitucion / inicio de operaciones", "value": "Constituida 30-may-2018; inscrita 26-nov-2021 (partida 14846708); operaciones desde enero 2022", "year": 2021, "unit": "", "source_name": "Informe financiero auditado SEMAN 2023", "source_url": "https://cdn.www.gob.pe/uploads/document/file/6165091/5438966-informe-financiero-seman-2023_16_feb_2024-pdf.crdownload?v=1712702225", "confidence": "alta"},
        {"metric": "Ventas netas (ingresos)", "value": "32098571", "year": 2023, "unit": "S/", "source_name": "Estado de resultados auditado SEMAN 2023", "source_url": "https://cdn.www.gob.pe/uploads/document/file/6165091/5438966-informe-financiero-seman-2023_16_feb_2024-pdf.crdownload?v=1712702225", "confidence": "alta"},
        {"metric": "Ventas netas (ingresos)", "value": "13146746", "year": 2022, "unit": "S/", "source_name": "Estado de resultados auditado SEMAN 2023 (comparativo)", "source_url": "https://cdn.www.gob.pe/uploads/document/file/6165091/5438966-informe-financiero-seman-2023_16_feb_2024-pdf.crdownload?v=1712702225", "confidence": "alta"},
        {"metric": "Ganancia neta (utilidad)", "value": "3362450", "year": 2023, "unit": "S/", "source_name": "Estado de resultados auditado SEMAN 2023", "source_url": "https://cdn.www.gob.pe/uploads/document/file/6165091/5438966-informe-financiero-seman-2023_16_feb_2024-pdf.crdownload?v=1712702225", "confidence": "alta"},
        {"metric": "Ganancia neta (utilidad)", "value": "2964763", "year": 2022, "unit": "S/", "source_name": "Estado de resultados auditado SEMAN 2023 (comparativo)", "source_url": "https://cdn.www.gob.pe/uploads/document/file/6165091/5438966-informe-financiero-seman-2023_16_feb_2024-pdf.crdownload?v=1712702225", "confidence": "alta"},
        {"metric": "Utilidad operativa", "value": "4992164", "year": 2023, "unit": "S/", "source_name": "Estado de resultados auditado SEMAN 2023", "source_url": "https://cdn.www.gob.pe/uploads/document/file/6165091/5438966-informe-financiero-seman-2023_16_feb_2024-pdf.crdownload?v=1712702225", "confidence": "alta"},
        {"metric": "Total patrimonio", "value": "17220620", "year": 2023, "unit": "S/", "source_name": "Estado de situacion financiera auditado SEMAN 2023", "source_url": "https://cdn.www.gob.pe/uploads/document/file/6165091/5438966-informe-financiero-seman-2023_16_feb_2024-pdf.crdownload?v=1712702225", "confidence": "alta"},
        {"metric": "Total activos", "value": "22880998", "year": 2023, "unit": "S/", "source_name": "Estado de situacion financiera auditado SEMAN 2023", "source_url": "https://cdn.www.gob.pe/uploads/document/file/6165091/5438966-informe-financiero-seman-2023_16_feb_2024-pdf.crdownload?v=1712702225", "confidence": "alta"},
        {"metric": "Total pasivos", "value": "5660378", "year": 2023, "unit": "S/", "source_name": "Estado de situacion financiera auditado SEMAN 2023", "source_url": "https://cdn.www.gob.pe/uploads/document/file/6165091/5438966-informe-financiero-seman-2023_16_feb_2024-pdf.crdownload?v=1712702225", "confidence": "alta"},
        {"metric": "ROE (Ranking de Rentabilidad AF-2024 FONAFE)", "value": "27.43", "year": 2024, "unit": "% - 3er lugar entre 32 empresas FONAFE", "source_name": "Defensa.com / FONAFE", "source_url": "https://www.defensa.com/peru/seman-peru-consolida-como-empresas-publicas-pais-mas-rentables", "confidence": "alta"},
        {"metric": "Aeronaves comerciales Boeing atendidas", "value": "20", "year": 2024, "unit": "aeronaves", "source_name": "Defensa.com - SITDEF 2025", "source_url": "https://www.defensa.com/peru/seguridad-calidad-precision-mantenimiento-aeronautico-seman-peru", "confidence": "media"},
    ],
    "caveats": ("Las cifras financieras 2022-2023 provienen del informe auditado SEMAN 2023 (CDN gob.pe), la "
        "fuente mas confiable; no hay EE.FF. auditados 2024/2025 publicados, por lo que esos anios de la serie "
        "son ILUSTRATIVOS (solo se conoce el ROE 27.43% del ranking FONAFE AF-2024). En el dataset las ventas/"
        "utilidad 2022-2023 se expresan en S/ millones (13.15/2.96 y 32.10/3.36); el campo ebitda 2023 usa la "
        "utilidad operativa real (4.99 M) como proxy. El numero de trabajadores no esta publicado. Los acuerdos "
        "con KAI (FA-50/KF-21) y De Havilland no tienen montos publicos. El RUC conviene validarlo en SUNAT."),
}

# ====================== Ensamble del dataset de defensa ======================
companies = [sima, fame, seman]

# KPIs (anio 2025, sobre la serie del tablero — incluye puntos ilustrativos)
def fin_year(c, y):
    for f in c["financials"]:
        if f["year"] == y:
            return f
    return None

YEAR = 2025
kpis = {
    "companies": len(companies),
    "totalRevenue": round(sum(fin_year(c, YEAR)["revenue"] for c in companies), 2),
    "totalNetIncome": round(sum(fin_year(c, YEAR)["netIncome"] for c in companies), 2),
    "totalEbitda": round(sum(fin_year(c, YEAR)["ebitda"] for c in companies), 2),
    "totalInvestment": round(sum(fin_year(c, YEAR)["investment"] for c in companies), 2),
    "totalBudget": round(sum(fin_year(c, YEAR)["budget"] for c in companies), 2),
    "totalBudgetExecuted": round(sum(fin_year(c, YEAR)["budgetExecuted"] for c in companies), 2),
    "employees": sum(c["employees"] for c in companies),
    "withLosses": sum(1 for c in companies if fin_year(c, YEAR)["netIncome"] < 0),
    "withProfits": sum(1 for c in companies if fin_year(c, YEAR)["netIncome"] >= 0),
    "year": YEAR,
}

# Rankings (scoped a las 3 empresas)
def rank_rows(metric_fn, unit, reverse=True):
    rows = [{"slug": c["slug"], "name": c["name"], "acronym": c["acronym"], "value": metric_fn(c), "unit": unit} for c in companies]
    return sorted(rows, key=lambda r: r["value"], reverse=reverse)

rankings = {
    "profitability": rank_rows(lambda c: c["metrics"]["netMargin"], "% margen neto"),
    "efficiency": rank_rows(lambda c: round(c["metrics"]["revenuePerEmployee"] / 1e6, 2) if c["metrics"]["revenuePerEmployee"] else 0.0, "S/ M ingreso/empleado"),
    "transparency": rank_rows(lambda c: c["transparency"]["score"], "score transparencia"),
}

# Contratos REALES recopilados (no ilustrativos)
contracts_items = [
    {"id": "SIMA-G2G-HYUNDAI-2024", "company": "Servicios Industriales de la Marina", "companySlug": "sima", "provider": "HD Hyundai Heavy Industries (Corea) / MGP", "amount": 462.9, "year": 2024, "object": "G2G: 1 fragata multirol + 1 OPV + 2 buques logisticos", "method": "Gobierno a Gobierno", "amountType": "USD millones", "source": "https://www.defensa.com/peru/firma-hyundai-construccion-buque-multirol-opv-dos-buques-para"},
    {"id": "SIMA-PUENTE-PERU-2024", "company": "Servicios Industriales de la Marina", "companySlug": "sima", "provider": "Gobierno Regional (metalmecanica)", "amount": 23.0, "year": 2024, "object": "Fabricacion del Puente Peru", "method": "Encargo", "amountType": "S/ millones", "source": "https://files.sima.com.pe/Transparencia/mapafonafesp/3200_SimaPeru_II_Memoria_Anual_2024.pdf"},
    {"id": "SIMA-COLISEO-PUNO-2024", "company": "Servicios Industriales de la Marina", "companySlug": "sima", "provider": "Gobierno Regional de Puno", "amount": 10.5, "year": 2024, "object": "Fabricacion, montaje y techado del Coliseo de Puno", "method": "Encargo", "amountType": "S/ millones", "source": "https://files.sima.com.pe/Transparencia/mapafonafesp/3200_SimaPeru_II_Memoria_Anual_2024.pdf"},
    {"id": "SIMA-PUENTE-YARAJA-2024", "company": "Servicios Industriales de la Marina", "companySlug": "sima", "provider": "Gobierno Regional de Puno", "amount": 5.4, "year": 2024, "object": "Fabricacion del Puente Yaraja", "method": "Encargo", "amountType": "S/ millones", "source": "https://files.sima.com.pe/Transparencia/mapafonafesp/3200_SimaPeru_II_Memoria_Anual_2024.pdf"},
    {"id": "FAME-ARAD7-039-2023", "company": "Fabrica de Armas y Municiones del Ejercito S.A.C.", "companySlug": "fame", "provider": "Israel Weapon Industries (IWI) / Ejercito del Peru", "amount": 103.74, "year": 2023, "object": "10,000 fusiles IWI ARAD 7 (7.62x51mm) - Contrato 039-2023 EP/SMGE", "method": "Encargo (Ley 31684) - bajo auditoria Contraloria", "amountType": "S/ millones", "source": "https://www.defensa.com/peru/fame-sac-precisa-puntos-clave-informe-auditoria-contraloria-peru"},
    {"id": "FAME-K808-2025", "company": "Fabrica de Armas y Municiones del Ejercito S.A.C.", "companySlug": "fame", "provider": "Hyundai Rotem (Corea) / Ejercito del Peru", "amount": 60.0, "year": 2025, "object": "30 vehiculos blindados 8x8 K-808 (pago al contado, sin licitacion)", "method": "Encargo (Ley 31684) - cuestionado", "amountType": "USD millones", "source": "https://larepublica.pe/politica/actualidad/2025/03/13/ejercito-pago-al-cash-us60-millones-por-blindados-que-descalifico-en-2023-fame-ejercito-del-peru-contraloria-hnews-1016040"},
    {"id": "FAME-9MM-EXPORT-2021", "company": "Fabrica de Armas y Municiones del Ejercito S.A.C.", "companySlug": "fame", "provider": "Quasar/K7 AMMO (Indiana) y Rockwell Defense (Virginia), EEUU", "amount": 1.14, "year": 2021, "object": "Exportacion de 4 millones de cartuchos 9x19mm al mercado de EEUU", "method": "Exportacion", "amountType": "USD millones", "source": "https://www.defensa.com/peru/municion-9-mm-peruana-fame-para-mercado-norteamericano"},
    {"id": "SEMAN-KAI-FA50-2024", "company": "Servicio de Mantenimiento del Peru S.A.C.", "companySlug": "seman", "provider": "Korea Aerospace Industries (KAI)", "amount": None, "year": 2024, "object": "Linea de produccion de ~250 partes estructurales del caza FA-50", "method": "Acuerdo comercial internacional", "amountType": "no publicado", "source": "https://www.seman.com.pe/en/blog/el-seman-peru-sac-y-korea-aerospace-industries-firman-acuerdo-comercial-internacional-para-la-implementacion-de-la-linea-de-produccion-de-piezas-aeronauticas-de-la-aeronave-fa-50/"},
    {"id": "SEMAN-KAI-KF21-2024", "company": "Servicio de Mantenimiento del Peru S.A.C.", "companySlug": "seman", "provider": "Korea Aerospace Industries (KAI)", "amount": None, "year": 2024, "object": "MoU para fabricacion local de piezas del caza KF-21 Boramae", "method": "Memorando de entendimiento", "amountType": "no publicado", "source": "https://www.defensemirror.com/news/38213/Peruvian_Firm_SEMAN_to_Manufacture_Parts_for_S_Korean_KF_21_Jet"},
    {"id": "SEMAN-GOL-737-2024", "company": "Servicio de Mantenimiento del Peru S.A.C.", "companySlug": "seman", "provider": "Gol Linhas Aereas (Brasil)", "amount": None, "year": 2024, "object": "Inspeccion mayor (Check C) a flota Boeing 737-800 (13 aeronaves)", "method": "Servicio MRO", "amountType": "no publicado", "source": "https://peru21.pe/peru/empresa-estatal-seman-peru-reparara-y-dara-mantenimiento-a-aviones-boeing-de-aerolinea-brasilena-noticia/"},
]
known_amounts = [i for i in contracts_items if i["amount"] is not None]
total_amount = round(sum(i["amount"] for i in known_amounts), 2)
prov_totals = {}
for i in known_amounts:
    prov_totals[i["provider"]] = prov_totals.get(i["provider"], 0) + i["amount"]
top_providers = sorted([{"provider": p, "total": round(t, 2), "count": sum(1 for i in known_amounts if i["provider"] == p)} for p, t in prov_totals.items()], key=lambda x: x["total"], reverse=True)
by_year_map = {}
for i in contracts_items:
    by_year_map.setdefault(i["year"], {"count": 0, "amount": 0.0})
    by_year_map[i["year"]]["count"] += 1
    if i["amount"]: by_year_map[i["year"]]["amount"] += i["amount"]
by_year = [{"year": y, "count": v["count"], "amount": round(v["amount"], 2)} for y, v in sorted(by_year_map.items())]
by_entity = []
for c in companies:
    items = [i for i in contracts_items if i["companySlug"] == c["slug"]]
    by_entity.append({"slug": c["slug"], "name": c["name"], "count": len(items), "amount": round(sum(i["amount"] for i in items if i["amount"]), 2)})

contracts = {
    "summary": {"totalAmount": total_amount, "totalContracts": len(contracts_items), "topProviderShare": round(top_providers[0]["total"] / total_amount * 100, 1) if total_amount else 0.0, "entitiesCovered": 3},
    "topProviders": top_providers,
    "items": contracts_items,
    "isReal": True,
    "coverage": ["sima", "fame", "seman"],
    "byYear": by_year,
    "byEntity": by_entity,
    "byMethod": [{"method": m, "count": sum(1 for i in contracts_items if i["method"] == m)} for m in sorted(set(i["method"] for i in contracts_items))],
    "byStage": [],
    "note": ("Contratos/acuerdos REALES recopilados de fuentes oficiales y prensa especializada de defensa. "
             "Montos mezclan S/ y USD (ver amountType); totalAmount sumado nominalmente solo como referencia, "
             "NO es un agregado homogeneo. Varios contratos de FAME estan bajo investigacion (Contraloria/Fiscalia)."),
}

# Transparencia (scoped)
transp_items = [{"company": c["name"], "slug": c["slug"], "score": c["transparency"]["score"], "financials": c["transparency"]["financials"], "memoria": c["transparency"]["memoria"], "directory": c["transparency"]["directory"], "budget": c["transparency"]["budget"]} for c in companies]
transparency = {"items": transp_items, "avgScore": round(sum(t["score"] for t in transp_items) / len(transp_items), 1)}

# Anomalias y recomendaciones agregadas (de cada empresa + sector)
anomalies = []
for c in companies:
    for a in c.get("anomalies", []):
        a2 = dict(a); a2["company"] = c["name"]; a2["companySlug"] = c["slug"]; anomalies.append(a2)
recommendations = []
for c in companies:
    for r in c.get("recommendations", []):
        r2 = dict(r); r2["company"] = c["name"]; r2["companySlug"] = c["slug"]; recommendations.append(r2)

# ====================== Bloque MINDEF (raiz) ======================
mindef = {
    "entity": "Ministerio de Defensa del Peru (MINDEF)",
    "acronym": "MINDEF",
    "ruc": "20131367938",
    "website": "https://www.gob.pe/mindef",
    "headquarters": "Av. De la Peruanidad s/n, Jesus Maria, Lima",
    "overview": ("El MINDEF es el organismo rector del Sector Defensa: conduce, formula y supervisa la politica "
        "de seguridad y defensa nacional y agrupa a las Fuerzas Armadas (Ejercito, Marina de Guerra y Fuerza "
        "Aerea). El Viceministerio de Recursos para la Defensa, via la Direccion General de Recursos Materiales, "
        "promueve el fortalecimiento de la industria de defensa. El brazo empresarial del sector son tres "
        "empresas estatales de derecho privado de la Corporacion FONAFE adscritas al Sector Defensa: SIMA-Peru "
        "(naval, Marina), FAME (armas y municiones, Ejercito) y SEMAN (MRO aeronautico, FAP). El presupuesto del "
        "sector es mayoritariamente rigido (salarios y pensiones), con grandes inversiones via endeudamiento."),
    "relationship": ("El MINDEF NO esta bajo FONAFE (es ministerio); pero SIMA, FAME y SEMAN si pertenecen a la "
        "Corporacion FONAFE y operan conforme a la politica del Sector Defensa. Sus directorios combinan oficiales "
        "de cada instituto armado, del MINDEF y representantes de FONAFE. Tienen autonomia administrativa, tecnica, "
        "economica y financiera y orientan su actividad prioritariamente al sostenimiento de las FF.AA."),
    "budget": [
        {"metric": "PIA Sector Defensa", "value": 8893.1, "unit": "millones de S/", "year": 2025, "confidence": "alta", "source_name": "defensa.com / TVPeru", "source_url": "https://www.defensa.com/peru/presentado-proyecto-presupuesto-defensa-peru-para-2025"},
        {"metric": "Incremento PIA 2025 vs 2024", "value": 2.8, "unit": "%", "year": 2025, "confidence": "alta", "source_name": "TVPeru", "source_url": "https://www.tvperu.gob.pe/noticias/politica/presupuesto-2025-ministerio-de-defensa-se-propone-fortalecer-las-capacidades-operativas-de-las-ff-aa"},
        {"metric": "PIM Sector Defensa (aprox.)", "value": 9781.0, "unit": "millones de S/ (~USD 2,849 M)", "year": 2025, "confidence": "media", "source_name": "Ojo-Publico (a precisar en MEF Consulta Amigable)", "source_url": "https://ojo-publico.com/politica/presupuesto-defensa-aumento-mas-s2300-millones-este-ano"},
        {"metric": "PIA proyecto Sector Defensa", "value": 9658.7, "unit": "millones de S/ (~USD 2,548.5 M)", "year": 2026, "confidence": "alta", "source_name": "defensa.com", "source_url": "https://www.defensa.com/peru/proyecto-presupuesto-defensa-peru-para-2026-crece-cerca-14-2025"},
        {"metric": "Incremento PIA 2026 vs 2025", "value": 13.8, "unit": "%", "year": 2026, "confidence": "alta", "source_name": "defensa.com", "source_url": "https://www.defensa.com/peru/proyecto-presupuesto-defensa-peru-para-2026-crece-cerca-14-2025"},
        {"metric": "Participacion del Sector Defensa en el Presupuesto Nacional", "value": 3.75, "unit": "%", "year": 2026, "confidence": "alta", "source_name": "defensa.com", "source_url": "https://www.defensa.com/peru/proyecto-presupuesto-defensa-peru-para-2026-crece-cerca-14-2025"},
        {"metric": "Estructura del gasto 2026: salarios", "value": 53.34, "unit": "%", "year": 2026, "confidence": "media", "source_name": "defensa.com", "source_url": "https://www.defensa.com/peru/proyecto-presupuesto-defensa-peru-para-2026-crece-cerca-14-2025"},
        {"metric": "Estructura del gasto 2026: pensiones/prestaciones", "value": 16.45, "unit": "%", "year": 2026, "confidence": "media", "source_name": "defensa.com", "source_url": "https://www.defensa.com/peru/proyecto-presupuesto-defensa-peru-para-2026-crece-cerca-14-2025"},
        {"metric": "Estructura del gasto 2026: bienes y servicios", "value": 20.87, "unit": "%", "year": 2026, "confidence": "media", "source_name": "defensa.com", "source_url": "https://www.defensa.com/peru/proyecto-presupuesto-defensa-peru-para-2026-crece-cerca-14-2025"},
        {"metric": "Ejecucion presupuestal Sector Defensa (meta de cierre)", "value": 99.0, "unit": "% (avance 77.9% reportado)", "year": 2025, "confidence": "media", "source_name": "infodefensa", "source_url": "https://www.infodefensa.com/texto-diario/mostrar/5464152/sector-defensa-peru-preve-alcanzar-ano-nivel-ejecucion-presupuestal-entre-98-99"},
        {"metric": "Programa nuevo avion de combate FAP (24 cazas multirol, endeudamiento)", "value": 2000.0, "unit": "millones de USD", "year": 2026, "confidence": "alta", "source_name": "defensa.com", "source_url": "https://www.defensa.com/peru/proyecto-presupuesto-defensa-peru-para-2026-crece-cerca-14-2025"},
        {"metric": "Operaciones de endeudamiento interno para la Marina (incluye construcciones navales via SIMA US$62.9 M)", "value": 523.9, "unit": "millones de USD", "year": 2026, "confidence": "media", "source_name": "defensa.com", "source_url": "https://www.defensa.com/peru/proyecto-presupuesto-defensa-peru-para-2026-crece-cerca-14-2025"},
        {"metric": "Resultado economico agregado de empresas no financieras de FONAFE", "value": 1098.0, "unit": "millones de S/ (utilidad neta consolidada)", "year": 2024, "confidence": "media", "source_name": "ComexPeru (sobre datos FONAFE)", "source_url": "https://www.comexperu.org.pe/articulo/fonafe-bajo-la-lupa-resultados-que-esconden-una-preocupante-realidad"},
        {"metric": "Perdidas combinadas del subgrupo 'resto de empresas' FONAFE (incluye SIMA, NO desagregado)", "value": -697.0, "unit": "millones de S/", "year": 2024, "confidence": "baja", "source_name": "ComexPeru (sobre datos FONAFE)", "source_url": "https://www.comexperu.org.pe/articulo/fonafe-bajo-la-lupa-resultados-que-esconden-una-preocupante-realidad"},
    ],
    "empresas": [
        {"slug": "sima", "acronym": "SIMA", "ruc": "20100003351", "instituto": "Marina de Guerra del Peru", "rubro": "Industria naval / astillero"},
        {"slug": "fame", "acronym": "FAME", "ruc": "20522449271", "instituto": "Ejercito del Peru", "rubro": "Armas y municiones"},
        {"slug": "seman", "acronym": "SEMAN", "ruc": "20608861549", "instituto": "Fuerza Aerea del Peru", "rubro": "MRO aeronautico"},
    ],
    "news": [
        {"date": "2025-09-01", "title": "Proyecto de presupuesto de Defensa 2026 crece ~14% (compra de 24 aviones de combate)", "url": "https://www.defensa.com/peru/proyecto-presupuesto-defensa-peru-para-2026-crece-cerca-14-2025"},
        {"date": "2024-06-01", "title": "FAME anuncia inversion de USD 600 M en la industria de defensa", "url": "https://www.tvperu.gob.pe/noticias/nacionales/ejercito-del-peru-fame-anuncia-inversion-de-600-millones-de-dolares-en-la-industria-de-defensa"},
        {"date": "2024-01-01", "title": "SIMA, FAME y SEMAN: las tres empresas que dan musculo a la industria de defensa peruana", "url": "https://www.infodefensa.com/texto-diario/mostrar/5290594/sima-fame-seman-tres-empresas-dan-musculo-industria-defensa-peruana"},
        {"date": "2025-01-01", "title": "Presupuesto de Defensa aumento en mas de S/2,300 M de lo planificado (PIA vs PIM)", "url": "https://ojo-publico.com/politica/presupuesto-defensa-aumento-mas-s2300-millones-este-ano"},
        {"date": "2025-01-01", "title": "Corporacion FONAFE: resultados empresariales 2024 (utilidades y EBITDA +12%)", "url": "https://www.fonafe.gob.pe/nuestraorganizacion/noticias/098c3834-7429-445e-97d4-f0374f6786a6"},
    ],
    "sources": [
        {"name": "defensa.com - Proyecto de presupuesto Defensa 2026", "url": "https://www.defensa.com/peru/proyecto-presupuesto-defensa-peru-para-2026-crece-cerca-14-2025", "status": "activo"},
        {"name": "defensa.com - Proyecto de presupuesto Defensa 2025", "url": "https://www.defensa.com/peru/presentado-proyecto-presupuesto-defensa-peru-para-2025", "status": "activo"},
        {"name": "TVPeru - Presupuesto 2025 MINDEF", "url": "https://www.tvperu.gob.pe/noticias/politica/presupuesto-2025-ministerio-de-defensa-se-propone-fortalecer-las-capacidades-operativas-de-las-ff-aa", "status": "activo"},
        {"name": "Ojo-Publico - Presupuesto Defensa PIA vs PIM", "url": "https://ojo-publico.com/politica/presupuesto-defensa-aumento-mas-s2300-millones-este-ano", "status": "activo"},
        {"name": "infodefensa - SIMA, FAME, SEMAN industria de defensa", "url": "https://www.infodefensa.com/texto-diario/mostrar/5290594/sima-fame-seman-tres-empresas-dan-musculo-industria-defensa-peruana", "status": "activo"},
        {"name": "FONAFE - Resultados empresariales 2024", "url": "https://www.fonafe.gob.pe/nuestraorganizacion/noticias/098c3834-7429-445e-97d4-f0374f6786a6", "status": "activo"},
        {"name": "ComexPeru - FONAFE bajo la lupa", "url": "https://www.comexperu.org.pe/articulo/fonafe-bajo-la-lupa-resultados-que-esconden-una-preocupante-realidad", "status": "activo"},
        {"name": "OECE Contrataciones Abiertas - proveedor FAME", "url": "https://contratacionesabiertas.osce.gob.pe/proveedor/PE-RUC-20522449271", "status": "activo"},
    ],
    "caveats": ("Las cifras presupuestales (PIA 2025 S/8,893.1 M, PIA 2026 S/9,658.7 M, estructura % del gasto) "
        "provienen de medios especializados que citan las presentaciones del ministro al Congreso; no se leyo "
        "directamente el PDF oficial del Congreso ni MEF Consulta Amigable (PDFs comprimidos / FONAFE con error "
        "SSL). PIM 2025, ejecucion oficial y EE.FF. individuales de las empresas deben confirmarse en MEF Consulta "
        "Amigable. La perdida de -S/697 M es del subgrupo 'resto de empresas' FONAFE, NO exclusiva de SIMA. Tipo "
        "de cambio ~3.79 segun la fuente."),
    "is_illustrative": False,
    "note": "Bloque MINDEF: contexto sectorial con hechos REALES verificados (presupuesto, relacion MINDEF-FONAFE-empresas). No contiene series ilustrativas.",
}

# ====================== Meta ======================
# Consolidar TODAS las URLs reales recopiladas
all_sources = []
seen = set()
def add_src(s):
    key = s["url"]
    if key not in seen:
        seen.add(key); all_sources.append({"name": s["name"], "url": s["url"], "status": s.get("status", "activo")})
for c in companies:
    for s in c.get("sources", []):
        add_src(s)
for s in mindef["sources"]:
    add_src(s)
# extra fuentes citadas en contratos/news no listadas
for extra in [
    {"name": "Zona Militar - SIMA-HHI co-desarrollo submarinos", "url": "https://www.zona-militar.com/2025/12/21/sima-y-hhi-inician-el-co-desarrollo-para-la-produccion-de-nuevos-submarinos-para-la-marina-de-guerra-del-peru/"},
    {"name": "Zona Militar - SIMA buque de investigacion pesquera", "url": "https://www.zona-militar.com/2025/10/05/profundizando-su-asociacion-con-corea-del-sur-sima-construira-un-nuevo-buque-de-investigacion-pesquera-y-oceanografica-para-el-peru/"},
    {"name": "Defensa.com - municion 9mm FAME para EEUU", "url": "https://www.defensa.com/peru/municion-9-mm-peruana-fame-para-mercado-norteamericano"},
    {"name": "Defensa.com - FAME podria proveer fusiles ARAD-5 a la PNP", "url": "https://www.defensa.com/peru/fame-podria-proveer-mas-7-000-fusiles-iwi-arad-5-policia-peru"},
    {"name": "Defensa.com - FAME rechaza cuestionamientos ARAD-7/blindados", "url": "https://www.defensa.com/peru/fame-rechaza-cuestionamientos-adquisicion-fusiles-arad-7-8x8"},
    {"name": "Infobae - Fiscalia investiga compra de 10,000 fusiles", "url": "https://www.infobae.com/peru/2024/02/27/fiscalia-investiga-compra-de-10000-fusiles-del-ejercito-ante-irregularidades-que-implican-al-comandante-general/"},
    {"name": "Defensa.com - FAME niega vinculacion con trafico (es FAMESA)", "url": "https://www.defensa.com/peru/fabrica-armas-municiones-ejercito-peru-niega-vinculacion-trafico"},
    {"name": "Peru21 - SEMAN reparara aviones Boeing de aerolinea brasilena", "url": "https://peru21.pe/peru/empresa-estatal-seman-peru-reparara-y-dara-mantenimiento-a-aviones-boeing-de-aerolinea-brasilena-noticia/"},
    {"name": "Defensa.com - entrevista gerente SEMAN (FIDAE 2024, De Havilland)", "url": "https://www.defensa.com/fidae-2024/entrevistamos-coronel-fap-sandro-bravo-gerente-ejecutivo-seman"},
    {"name": "TVPeru - FAME anuncia inversion USD 600 M", "url": "https://www.tvperu.gob.pe/noticias/nacionales/ejercito-del-peru-fame-anuncia-inversion-de-600-millones-de-dolares-en-la-industria-de-defensa"},
    {"name": "infodefensa - ejecucion presupuestal Defensa 98-99%", "url": "https://www.infodefensa.com/texto-diario/mostrar/5464152/sector-defensa-peru-preve-alcanzar-ano-nivel-ejecucion-presupuestal-entre-98-99"},
    {"name": "MEF - Consulta Amigable (verificacion pendiente)", "url": "https://apps5.mineco.gob.pe/transparencia/"},
]:
    add_src(extra)

meta = {
    "version": "0.1.0-defense",
    "generated_at": "2026-06-09",
    "is_illustrative": True,
    "latest_year": 2025,
    "years": [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
    "sources": all_sources,
    "note": ("Dataset SECTORIAL DE DEFENSA (SIMA, FAME, SEMAN bajo el MINDEF/FONAFE). Las SERIES financieras "
        "anuales/trimestrales/mensuales son ILUSTRATIVAS (heredadas/generadas para demostracion) SALVO los "
        "puntos marcados con is_real_adjusted=true y, sobre todo, los hechos verificados en cada empresa "
        "(campos `realFacts`, con is_real implicito=true, fuente y nivel de confianza). Datapoints reales ya "
        "integrados: SIMA ingresos 2023 = S/1,818.7 M; SEMAN ventas 2022/2023 = S/13.15/32.10 M y utilidad "
        "2022/2023 = S/2.96/3.36 M; FAME resultado neto 2024 = -S/2.2 M (confianza baja). El bloque raiz "
        "`mindef` contiene SOLO hechos reales (presupuesto del sector y relacion MINDEF-FONAFE-empresas). "
        "Para cifras financieras individuales completas y auditadas, consultar MEF Consulta Amigable, los "
        "portales de transparencia de cada empresa y FONAFE."),
    "real_datapoints": [
        {"company": "sima", "metric": "revenue", "year": 2023, "value": 1818.7, "unit": "S/ M", "source": "FONAFE Eval. Presup. 2023"},
        {"company": "seman", "metric": "revenue", "year": 2022, "value": 13.15, "unit": "S/ M", "source": "EE.FF. auditado SEMAN 2023"},
        {"company": "seman", "metric": "revenue", "year": 2023, "value": 32.10, "unit": "S/ M", "source": "EE.FF. auditado SEMAN 2023"},
        {"company": "seman", "metric": "netIncome", "year": 2022, "value": 2.96, "unit": "S/ M", "source": "EE.FF. auditado SEMAN 2023"},
        {"company": "seman", "metric": "netIncome", "year": 2023, "value": 3.36, "unit": "S/ M", "source": "EE.FF. auditado SEMAN 2023"},
        {"company": "seman", "metric": "ebitda(proxy=utilidad operativa)", "year": 2023, "value": 4.99, "unit": "S/ M", "source": "EE.FF. auditado SEMAN 2023"},
        {"company": "fame", "metric": "netIncome", "year": 2024, "value": -2.2, "unit": "S/ M (acum. ago, confianza baja)", "source": "ComexPeru / FONAFE"},
    ],
}

dataset = {
    "meta": meta,
    "kpis": kpis,
    "companies": companies,
    "rankings": rankings,
    "contracts": contracts,
    "transparency": transparency,
    "anomalies": anomalies,
    "recommendations": recommendations,
    "mindef": mindef,
}

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(dataset, f, ensure_ascii=False, indent=2)

# Validate
json.load(open(OUT, encoding="utf-8"))
print("OK ->", OUT)
print("companies:", [c["slug"] for c in companies])
print("meta.sources:", len(all_sources))
print("kpis:", json.dumps(kpis, ensure_ascii=False))
print("realFacts counts:", {c["slug"]: len(c["realFacts"]) for c in companies})
print("contracts.totalContracts:", contracts["summary"]["totalContracts"])
