# Documento: informe_backtest (1).pdf

---

## Metadatos de Extracción

| Campo | Valor |
|-------|-------|
| **Archivo Original** | informe_backtest (1).pdf |
| **Total de Páginas** | 6 |
| **Páginas Analizadas** | 6 |
| **Fecha de Extracción** | 2026-05-20T03:23:27.017Z |

---

## Contenido del Documento

## Página 1 de 6

### ELEMENTO ALPHA
Análisis cuantitativo de fondos

# Backtesting & Stress Test

## Alianza Fondo Abierto vs CXC

**2017-01-01 → 2026-03-31**

---

**2026-05-15** 
*Confidencial*

---

## Página 2 de 6

Elemento Alpha • Análisis Cuantitativo de Fondos

# 1. Backtesting por episodios

Ocho episodios de estrés entre 2017 y 2023. Ret. Actual corresponde al Alianza Fondo Abierto; Ret. Sugerido al CXC. Cada ventana usa el primer y último día disponible del rango; el MaxDD se mide intra-episodio sobre la serie diaria. Declaramos ganador al fondo con diferencia mayor a **0,05 pp**.

| Episodio | Período | Días | Ret. Actual (%) | Ret. Sugerido (%) | Δ Ret. (pp) | MaxDD Actual (%) | MaxDD Sugerido (%) | Ganador |
|---|---|---|---|---|---|---|---|---|
| Ciclo Alzas FED | 2017-01-02 / 2018-12-31 | 728 | +9.40 | +14.62 | +5.22 | -0.02 | -0.01 | BMK Sugerido |
| COVID-19 Crash | 2020-02-19 / 2020-03-23 | 33 | -0.77 | -0.11 | +0.66 | -1.10 | -0.52 | BMK Sugerido |
| Recup. Post-COVID | 2020-03-23 / 2020-12-31 | 283 | +3.70 | +3.81 | +0.11 | -0.06 | -0.04 | BMK Sugerido |
| Caída TES Col. | 2021-02-01 / 2021-10-31 | 272 | -0.15 | +1.63 | +1.78 | -0.54 | -0.06 | BMK Sugerido |
| Inflación & Alzas 22 | 2022-01-03 / 2022-12-30 | 361 | +6.17 | +7.77 | +1.60 | -0.04 | -0.07 | BMK Sugerido |
| Cambio Gob. Col 22 | 2022-06-19 / 2022-11-30 | 164 | +3.57 | +4.46 | +0.89 | -0.04 | -0.03 | BMK Sugerido |
| Rally COLTES 23 | 2023-07-01 / 2023-12-29 | 181 | +6.29 | +5.70 | -0.59 | -0.22 | -0.06 | BMK Actual |
| Normaliz. Tasas 23 | 2023-01-02 / 2023-12-29 | 361 | +13.57 | +10.51 | -3.06 | -0.22 | -1.33 | BMK Actual |

**Tabla 1:** Retornos y drawdowns por episodio.

1

---

## Página 3 de 6

Elemento Alpha • Análisis Cuantitativo de Fondos

## 2. Contexto macroeconómico

Variación porcentual de los índices de mercado dentro de cada ventana, y promedios del CDS Colombia 5Y y la inflación a/a (año a año).

| Episodio | ΔCOLCAP (%) | ΔS&P500 (%) | ΔTRM (%) | ΔBrent (%) | ΔCTES (%) | CDS Col. (prom.) | IPC a/a (% prom.) |
|---|---|---|---|---|---|---|---|
| Ciclo Alzas FED | -1.48 | +11.97 | +8.30 | -5.32 | +16.21 | 121.1 | 3.88 |
| COVID-19 Crash | -44.69 | -27.45 | +19.96 | -54.22 | -12.24 | 177.4 | 3.69 |
| Recup. Post-COVID | +55.69 | +53.48 | -15.87 | +90.79 | +24.14 | 149.6 | 2.41 |
| Caída TES Col. | +1.88 | +20.58 | +6.26 | +47.42 | -7.77 | 134.8 | 2.98 |
| Inflación & Alzas 22 | -9.68 | -19.90 | +17.82 | +7.39 | -11.54 | 259.7 | 9.59 |
| Cambio Gob. Col 22 | -15.03 | +10.93 | +23.32 | -23.88 | -0.80 | 296.6 | 10.78 |
| Rally COLTES 23 | +5.43 | +7.18 | -8.51 | +2.86 | +6.78 | 213.1 | 11.15 |
| Normaliz. Tasas 23 | -5.86 | +24.73 | -20.54 | -6.16 | +29.97 | 246.0 | 12.08 |

Tabla 2: Contexto macro por episodio.

## 3. Estadísticos generales

Retornos diarios anualizados con factor 365 (convención calendario; ambos fondos acumulan NAV todos los días). Sharpe calculado con tasa libre de riesgo igual a cero.

| Activo | Ret. medio anual. | Vol. anual. | Sharpe |
|---|---|---|---|
| Alianza FA | +5.53 % | 0.38 % | +14.63 |
| CXC | +6.92 % | 0.71 % | +9.74 |
| COLCAP | +7.50 % | 18.99 % | — |
| S&P 500 | +13.29 % | 18.49 % | — |
| TRM | +2.93 % | 12.28 % | — |
| CTES | +5.56 % | 7.66 % | — |
| Brent | +15.58 % | 38.82 % | — |

Tabla 3: Resumen 2017–Mar 2026.

| | Alianza | CXC | COLCAP | S&P 500 | CTES | TRM | Brent |
|---|---|---|---|---|---|---|---|
| Alianza | 1.00 | 0.25 | 0.03 | -0.08 | 0.14 | -0.15 | 0.01 |
| CXC | 0.25 | 1.00 | 0.02 | -0.04 | 0.01 | -0.04 | 0.00 |
| COLCAP | 0.03 | 0.02 | 1.00 | 0.42 | 0.20 | -0.01 | 0.31 |
| S&P 500 | -0.08 | -0.04 | 0.42 | 1.00 | 0.19 | 0.03 | 0.23 |
| CTES | 0.14 | 0.01 | 0.20 | 0.19 | 1.00 | -0.15 | 0.05 |
| TRM | -0.15 | -0.04 | -0.01 | 0.03 | -0.15 | 1.00 | 0.02 |
| Brent | 0.01 | 0.00 | 0.31 | 0.23 | 0.05 | 0.02 | 1.00 |

Tabla 4: Correlaciones diarias 2017–Mar 2026 (macro reindexado con forward-fill).

2

---

## Página 4 de 6

Elemento Alpha • Análisis Cuantitativo de Fondos

## 4. Figuras

### Retornos por episodio (%)

**Gráfico de barras agrupadas**

*   **Eje Y:** Retorno (%) desde +0.0% hasta +14.0% en incrementos de 2.0%.
*   **Eje X:** Episodios económicos e históricos.
*   **Leyenda:** Alianza Fondo Abierto (Azul medianoche), CXC Conservador (Morado).

| Episodio | Alianza Fondo Abierto (%) | CXC Conservador (%) |
| :--- | :--- | :--- |
| Ciclo Alzas FED 17-18 | **+9.4** | **+14.6** |
| COVID-19 Crash | **-0.8** | **-0.1** |
| Recup. Post-COVID | **+3.7** | **+3.8** |
| Caída TES Col. | **-0.2** | **+1.6** |
| Inflación & Alzas 22 | **+6.2** | **+7.8** |
| Cambio Gob. Col 22 | **+3.6** | **+4.5** |
| Rally COLTES 23 | **+6.3** | **+5.7** |
| Normaliz. Tasas 23 | **+13.6** | **+10.5** |

Figura 1: Retornos acumulados por episodio. Alianza Fondo Abierto en azul medianoche; CXC en morado.

3

---

## Página 5 de 6

Elemento Alpha • Análisis Cuantitativo de Fondos

## Máximo Drawdown por episodio (%)

**Gráfico de barras agrupadas:**
El gráfico compara el Máximo Drawdown (en porcentaje) de dos fondos durante diferentes episodios de mercado.

*   **Eje Y:** Máx. Drawdown (%) [0.00% a -1.20%]
*   **Eje X:** Episodios de mercado
*   **Leyenda:**
    *   Azul oscuro: Alianza Fondo Abierto
    *   Morado claro: CXC Conservador

**Datos aproximados observados en el gráfico:**

| Episodio | Alianza Fondo Abierto | CXC Conservador |
| :--- | :--- | :--- |
| Ciclo Alzas FED 17-18 | ~ -0.01% | ~ -0.01% |
| COVID-19 Crash | ~ -1.10% | ~ -0.52% |
| Recup. Post-COVID | ~ -0.06% | ~ -0.04% |
| Caída TES Col. | ~ -0.54% | ~ -0.05% |
| Inflación & Alzas 22 | ~ -0.03% | ~ -0.07% |
| Cambio Gob. Col 22 | ~ -0.03% | ~ -0.02% |
| Rally COLTES 23 | ~ -0.22% | ~ -0.06% |
| Normaliz. Tasas 23 | ~ -0.22% | ~ -1.33% |

**Figura 2:** Máximo Drawdown por episodio.

4

---

## Página 6 de 6

Elemento Alpha • Análisis Cuantitativo de Fondos

## Evolución NAV normalizado · Alianza Fondo Abierto vs CXC

**Gráfico de líneas con áreas sombreadas**

El gráfico muestra la evolución del NAV (Net Asset Value) normalizado para dos fondos, comparando su rendimiento desde 2017 hasta una proyección o registro cercano a 2026. El gráfico incluye bandas verticales sombreadas que representan episodios macroeconómicos o de mercado específicos.

### Leyenda del Gráfico
*   **Línea azul oscuro:** Alianza Fondo Abierto
*   **Línea morada clara:** CXC (Fondo Cash Conservador)

### Ejes
*   **Eje Y:** NAV normalizado (base 100 = 2-ene-2017). Rango visible de 100 a 180, con marcas en 100, 120, 140, 160 y 180.
*   **Eje X:** Años, desde 2017 hasta 2026. Marcas en 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025 y 2026.

### Episodios (Bandas Sombreadas)
1.  **Ciclo Alzas FED 17-18** (Banda sombreada entre 2017 y 2019)
2.  **COVID-19 Crash** (Banda estrecha a principios de 2020)
3.  **Recup. Post-COVID** (Banda desde mediados de 2020 hasta principios de 2021)
4.  **Caída TES Col.** (Banda durante la mayor parte de 2021)
5.  **Inflación & Alzas 22** (Banda a mediados de 2022)
6.  **Cambio Gob. Col 22** (Banda a finales de 2022)
7.  **Rally COLTES 23** (Banda a finales de 2023, marcada junto con el episodio 8)
8.  **Normaliz. Tasas 23** (Banda a mediados/finales de 2023)
*(Nota: En el gráfico, los círculos 8 y 7 aparecen en ese orden dentro de la última franja sombreada).*

### Datos Observados (Aproximaciones visuales de la tendencia)
*   **2017:** Ambos fondos inician en **100**.
*   **2018:** Alianza Fondo Abierto ~**105** | CXC ~**108**
*   **2019:** Alianza Fondo Abierto ~**110** | CXC ~**115**
*   **2020 (Pre-Crash):** Alianza Fondo Abierto ~**114** | CXC ~**122**
*   **2020 (Post-Crash):** Leve caída en ambos, Alianza ~**113**, CXC ~**121**
*   **2021:** Alianza Fondo Abierto se estanca en ~**117** | CXC continúa subiendo a ~**127**
*   **2022:** Alianza Fondo Abierto se mantiene plano ~**117** | CXC sube a ~**130**
*   **2023:** Alianza Fondo Abierto retoma crecimiento ~**125** | CXC acelera a ~**140**
*   **2024:** Alianza Fondo Abierto ~**142** | CXC ~**155**
*   **2025:** Alianza Fondo Abierto ~**153** | CXC ~**172**
*   **2026:** Alianza Fondo Abierto ~**165** | CXC ~**190**

### Texto Inferior
**Figura 3:** NAV base 100 al 2-ene-2017. Bandas sombreadas marcan los ocho episodios.

5

---


---

## Información Detallada por Página

### Página 1

**Título Inferido:** Backtesting & Stress Test

#### Elementos Visuales

**Elemento 1 (otro):**
- *Descripción:* Diseño de fondo de la portada de la presentación. Consiste en una mitad superior de color azul oscuro con un polígono diagonal en la esquina superior derecha en tonos morados, y una mitad inferior de color blanco.
- *Metadata Visual:* Diseño geométrico corporativo
- *Datos Observados:* No aplica

#### Texto Original (OCR)

`
ELEMENTO ALPHA
Análisis cuantitativo de fondos

Backtesting & Stress Test

Alianza Fondo Abierto vs CXC

2017-01-01 → 2026-03-31

2026-05-15
Confidencial
`

### Página 2

**Título Inferido:** 1. Backtesting por episodios

#### Elementos Visuales

**Elemento 1 (tabla):**
- *Descripción:* Tabla comparativa de retornos y drawdowns máximos (MaxDD) entre un fondo actual y uno sugerido a través de 8 episodios históricos de estrés financiero entre 2017 y 2023. Muestra el ganador de cada episodio basado en una diferencia de retorno mayor a 0,05 puntos porcentuales.
- *Metadata Visual:* Columnas: Episodio, Período (fechas de inicio y fin), Días, Ret. Actual (%), Ret. Sugerido (%), Δ Ret. (pp), MaxDD Actual (%), MaxDD Sugerido (%), Ganador. Los valores positivos están en color verde y los negativos en color rojo.
- *Datos Observados:* Ciclo Alzas FED: 728 días, Ret. Actual +9.40%, Ret. Sugerido +14.62%, Δ Ret. +5.22 pp, MaxDD Actual -0.02%, MaxDD Sugerido -0.01%, Ganador BMK Sugerido. COVID-19 Crash: 33 días, Ret. Actual -0.77%, Ret. Sugerido -0.11%, Δ Ret. +0.66 pp, MaxDD Actual -1.10%, MaxDD Sugerido -0.52%, Ganador BMK Sugerido. Recup. Post-COVID: 283 días, Ret. Actual +3.70%, Ret. Sugerido +3.81%, Δ Ret. +0.11 pp, MaxDD Actual -0.06%, MaxDD Sugerido -0.04%, Ganador BMK Sugerido. Caída TES Col.: 272 días, Ret. Actual -0.15%, Ret. Sugerido +1.63%, Δ Ret. +1.78 pp, MaxDD Actual -0.54%, MaxDD Sugerido -0.06%, Ganador BMK Sugerido. Inflación & Alzas 22: 361 días, Ret. Actual +6.17%, Ret. Sugerido +7.77%, Δ Ret. +1.60 pp, MaxDD Actual -0.04%, MaxDD Sugerido -0.07%, Ganador BMK Sugerido. Cambio Gob. Col 22: 164 días, Ret. Actual +3.57%, Ret. Sugerido +4.46%, Δ Ret. +0.89 pp, MaxDD Actual -0.04%, MaxDD Sugerido -0.03%, Ganador BMK Sugerido. Rally COLTES 23: 181 días, Ret. Actual +6.29%, Ret. Sugerido +5.70%, Δ Ret. -0.59 pp, MaxDD Actual -0.22%, MaxDD Sugerido -0.06%, Ganador BMK Actual. Normaliz. Tasas 23: 361 días, Ret. Actual +13.57%, Ret. Sugerido +10.51%, Δ Ret. -3.06 pp, MaxDD Actual -0.22%, MaxDD Sugerido -1.33%, Ganador BMK Actual.

#### Texto Original (OCR)

`
Elemento Alpha • Análisis Cuantitativo de Fondos

1. Backtesting por episodios

Ocho episodios de estrés entre 2017 y 2023. Ret. Actual corresponde al Alianza Fondo Abierto; Ret. Sugerido al CXC. Cada ventana usa el primer y último día disponible del rango; el MaxDD se mide intra-episodio sobre la serie diaria. Declaramos ganador al fondo con diferencia mayor a 0,05 pp.

Tabla 1: Retornos y drawdowns por episodio.

1
`

### Página 3

**Título Inferido:** Contexto macroeconómico y Estadísticos generales

#### Elementos Visuales

**Elemento 1 (tabla):**
- *Descripción:* Tabla que muestra la variación porcentual de diferentes índices de mercado (COLCAP, S&P500, TRM, Brent, CTES) y los promedios del CDS Colombia 5Y y la inflación anual durante distintos episodios macroeconómicos.
- *Metadata Visual:* Columnas: Episodio, ΔCOLCAP (%), ΔS&P500 (%), ΔTRM (%), ΔBrent (%), ΔCTES (%), CDS Col. (prom.), IPC a/a (% prom.). Filas: 8 episodios macroeconómicos.
- *Datos Observados:* Ciclo Alzas FED: COLCAP -1.48%, S&P500 +11.97%, TRM +8.30%, Brent -5.32%, CTES +16.21%, CDS 121.1, IPC 3.88. COVID-19 Crash: COLCAP -44.69%, S&P500 -27.45%, TRM +19.96%, Brent -54.22%, CTES -12.24%, CDS 177.4, IPC 3.69. Recup. Post-COVID: COLCAP +55.69%, S&P500 +53.48%, TRM -15.87%, Brent +90.79%, CTES +24.14%, CDS 149.6, IPC 2.41. Caída TES Col.: COLCAP +1.88%, S&P500 +20.58%, TRM +6.26%, Brent +47.42%, CTES -7.77%, CDS 134.8, IPC 2.98. Inflación & Alzas 22: COLCAP -9.68%, S&P500 -19.90%, TRM +17.82%, Brent +7.39%, CTES -11.54%, CDS 259.7, IPC 9.59. Cambio Gob. Col 22: COLCAP -15.03%, S&P500 +10.93%, TRM +23.32%, Brent -23.88%, CTES -0.80%, CDS 296.6, IPC 10.78. Rally COLTES 23: COLCAP +5.43%, S&P500 +7.18%, TRM -8.51%, Brent +2.86%, CTES +6.78%, CDS 213.1, IPC 11.15. Normaliz. Tasas 23: COLCAP -5.86%, S&P500 +24.73%, TRM -20.54%, Brent -6.16%, CTES +29.97%, CDS 246.0, IPC 12.08.

**Elemento 2 (tabla):**
- *Descripción:* Tabla que resume los estadísticos generales (retorno medio anual, volatilidad anual y ratio de Sharpe) para diferentes activos y fondos entre 2017 y marzo de 2026.
- *Metadata Visual:* Columnas: Activo, Ret. medio anual., Vol. anual., Sharpe. Filas: Alianza FA, CXC, COLCAP, S&P 500, TRM, CTES, Brent.
- *Datos Observados:* Alianza FA: Ret. medio anual +5.53%, Vol. anual 0.38%, Sharpe +14.63. CXC: Ret. medio anual +6.92%, Vol. anual 0.71%, Sharpe +9.74. COLCAP: Ret. medio anual +7.50%, Vol. anual 18.99%, Sharpe n/a. S&P 500: Ret. medio anual +13.29%, Vol. anual 18.49%, Sharpe n/a. TRM: Ret. medio anual +2.93%, Vol. anual 12.28%, Sharpe n/a. CTES: Ret. medio anual +5.56%, Vol. anual 7.66%, Sharpe n/a. Brent: Ret. medio anual +15.58%, Vol. anual 38.82%, Sharpe n/a.

**Elemento 3 (tabla):**
- *Descripción:* Matriz de correlaciones diarias entre diferentes activos (Alianza, CXC, COLCAP, S&P 500, CTES, TRM, Brent) para el periodo 2017 a marzo de 2026.
- *Metadata Visual:* Matriz simétrica de 7x7. Columnas y filas: Alianza, CXC, COLCAP, S&P 500, CTES, TRM, Brent. Diagonal principal con valor 1.00.
- *Datos Observados:* Correlaciones de Alianza: CXC 0.25, COLCAP 0.03, S&P 500 -0.08, CTES 0.14, TRM -0.15, Brent 0.01. Correlaciones de CXC: Alianza 0.25, COLCAP 0.02, S&P 500 -0.04, CTES 0.01, TRM -0.04, Brent 0.00. Correlaciones de COLCAP: Alianza 0.03, CXC 0.02, S&P 500 0.42, CTES 0.20, TRM -0.01, Brent 0.31. Correlaciones de S&P 500: Alianza -0.08, CXC -0.04, COLCAP 0.42, CTES 0.19, TRM 0.03, Brent 0.23. Correlaciones de CTES: Alianza 0.14, CXC 0.01, COLCAP 0.20, S&P 500 0.19, TRM -0.15, Brent 0.05. Correlaciones de TRM: Alianza -0.15, CXC -0.04, COLCAP -0.01, S&P 500 0.03, CTES -0.15, Brent 0.02. Correlaciones de Brent: Alianza 0.01, CXC 0.00, COLCAP 0.31, S&P 500 0.23, CTES 0.05, TRM 0.02.

#### Texto Original (OCR)

`
Elemento Alpha • Análisis Cuantitativo de Fondos

2. Contexto macroeconómico

Variación porcentual de los índices de mercado dentro de cada ventana, y promedios del CDS Colombia 5Y y la inflación a/a (año a año).

Episodio ΔCOLCAP (%) ΔS&P500 (%) ΔTRM (%) ΔBrent (%) ΔCTES (%) CDS Col. (prom.) IPC a/a (% prom.)
Ciclo Alzas FED -1.48 +11.97 +8.30 -5.32 +16.21 121.1 3.88
COVID-19 Crash -44.69 -27.45 +19.96 -54.22 -12.24 177.4 3.69
Recup. Post-COVID +55.69 +53.48 -15.87 +90.79 +24.14 149.6 2.41
Caída TES Col. +1.88 +20.58 +6.26 +47.42 -7.77 134.8 2.98
Inflación & Alzas 22 -9.68 -19.90 +17.82 +7.39 -11.54 259.7 9.59
Cambio Gob. Col 22 -15.03 +10.93 +23.32 -23.88 -0.80 296.6 10.78
Rally COLTES 23 +5.43 +7.18 -8.51 +2.86 +6.78 213.1 11.15
Normaliz. Tasas 23 -5.86 +24.73 -20.54 -6.16 +29.97 246.0 12.08

Tabla 2: Contexto macro por episodio.

3. Estadísticos generales

Retornos diarios anualizados con factor 365 (convención calendario; ambos fondos acumulan NAV todos los días). Sharpe calculado con tasa libre de riesgo igual a cero.

Activo Ret. medio anual. Vol. anual. Sharpe
Alianza FA +5.53 % 0.38 % +14.63
CXC +6.92 % 0.71 % +9.74
COLCAP +7.50 % 18.99 % —
S&P 500 +13.29 % 18.49 % —
TRM +2.93 % 12.28 % —
CTES +5.56 % 7.66 % —
Brent +15.58 % 38.82 % —

Tabla 3: Resumen 2017–Mar 2026.

Alianza CXC COLCAP S&P 500 CTES TRM Brent
Alianza 1.00 0.25 0.03 -0.08 0.14 -0.15 0.01
CXC 0.25 1.00 0.02 -0.04 0.01 -0.04 0.00
COLCAP 0.03 0.02 1.00 0.42 0.20 -0.01 0.31
S&P 500 -0.08 -0.04 0.42 1.00 0.19 0.03 0.23
CTES 0.14 0.01 0.20 0.19 1.00 -0.15 0.05
TRM -0.15 -0.04 -0.01 0.03 -0.15 1.00 0.02
Brent 0.01 0.00 0.31 0.23 0.05 0.02 1.00

Tabla 4: Correlaciones diarias 2017–Mar 2026 (macro reindexado con forward-fill).

2
`

### Página 4

**Título Inferido:** 4. Figuras - Retornos por episodio (%)

#### Elementos Visuales

**Elemento 1 (grafico):**
- *Descripción:* Gráfico de barras agrupadas que compara los retornos porcentuales acumulados de dos fondos de inversión ('Alianza Fondo Abierto' y 'CXC Conservador') a través de ocho episodios económicos e históricos específicos.
- *Metadata Visual:* Título: 'Retornos por episodio (%)'. Eje Y: 'Retorno (%)' con escala de +0.0% a +14.0% en incrementos de 2.0%. Eje X: Categorías de episodios ('Ciclo Alzas FED 17-18', 'COVID-19 Crash', 'Recup. Post-COVID', 'Caída TES Col.', 'Inflación & Alzas 22', 'Cambio Gob. Col 22', 'Rally COLTES 23', 'Normaliz. Tasas 23'). Leyenda: Cuadro azul medianoche = Alianza Fondo Abierto, Cuadro morado = CXC Conservador. Etiquetas de datos sobre cada barra.
- *Datos Observados:* Ciclo Alzas FED 17-18: Alianza +9.4%, CXC +14.6%. COVID-19 Crash: Alianza -0.8%, CXC -0.1%. Recup. Post-COVID: Alianza +3.7%, CXC +3.8%. Caída TES Col.: Alianza -0.2%, CXC +1.6%. Inflación & Alzas 22: Alianza +6.2%, CXC +7.8%. Cambio Gob. Col 22: Alianza +3.6%, CXC +4.5%. Rally COLTES 23: Alianza +6.3%, CXC +5.7%. Normaliz. Tasas 23: Alianza +13.6%, CXC +10.5%.

#### Texto Original (OCR)

`
Elemento Alpha • Análisis Cuantitativo de Fondos
4. Figuras
Retornos por episodio (%)
Alianza Fondo Abierto
CXC Conservador
Retorno (%)
+14.0%
+12.0%
+10.0%
+8.0%
+6.0%
+4.0%
+2.0%
+0.0%
+14.6
+9.4
-0.8
-0.1
+3.7
+3.8
-0.2
+1.6
+6.2
+7.8
+3.6
+4.5
+6.3
+5.7
+13.6
+10.5
Ciclo Alzas FED 17-18
COVID-19 Crash
Recup. Post-COVID
Caída TES Col.
Inflación & Alzas 22
Cambio Gob. Col 22
Rally COLTES 23
Normaliz. Tasas 23
Figura 1: Retornos acumulados por episodio. Alianza Fondo Abierto en azul medianoche; CXC en morado.
3
`

### Página 5

**Título Inferido:** Máximo Drawdown por episodio (%)

#### Elementos Visuales

**Elemento 1 (grafico):**
- *Descripción:* Gráfico de barras agrupadas que compara el Máximo Drawdown (en porcentaje) de dos fondos ('Alianza Fondo Abierto' y 'CXC Conservador') a través de 8 episodios históricos o de mercado.
- *Metadata Visual:* Eje Y: 'Máx. Drawdown (%)' desde 0.00% hasta -1.20% (con incrementos de -0.20%). Eje X: Episodios (Ciclo Alzas FED 17-18, COVID-19 Crash, Recup. Post-COVID, Caída TES Col., Inflación & Alzas 22, Cambio Gob. Col 22, Rally COLTES 23, Normaliz. Tasas 23). Leyenda: Azul oscuro = Alianza Fondo Abierto, Morado claro = CXC Conservador.
- *Datos Observados:* Valores aproximados leídos del gráfico: 1) Ciclo Alzas FED 17-18: Alianza ~ -0.01%, CXC ~ -0.01%. 2) COVID-19 Crash: Alianza ~ -1.10%, CXC ~ -0.52%. 3) Recup. Post-COVID: Alianza ~ -0.06%, CXC ~ -0.04%. 4) Caída TES Col.: Alianza ~ -0.54%, CXC ~ -0.05%. 5) Inflación & Alzas 22: Alianza ~ -0.03%, CXC ~ -0.07%. 6) Cambio Gob. Col 22: Alianza ~ -0.03%, CXC ~ -0.02%. 7) Rally COLTES 23: Alianza ~ -0.22%, CXC ~ -0.06%. 8) Normaliz. Tasas 23: Alianza ~ -0.22%, CXC ~ -1.33% (supera el límite inferior del eje).

#### Texto Original (OCR)

`
Elemento Alpha • Análisis Cuantitativo de Fondos

Máximo Drawdown por episodio (%)

Máx. Drawdown (%)
0.00%
-0.20%
-0.40%
-0.60%
-0.80%
-1.00%
-1.20%

Alianza Fondo Abierto
CXC Conservador

Ciclo Alzas FED 17-18
COVID-19 Crash
Recup. Post-COVID
Caída TES Col.
Inflación & Alzas 22
Cambio Gob. Col 22
Rally COLTES 23
Normaliz. Tasas 23

Figura 2: Máximo Drawdown por episodio.

4
`

### Página 6

**Título Inferido:** Evolución NAV normalizado · Alianza Fondo Abierto vs CXC

#### Elementos Visuales

**Elemento 1 (grafico):**
- *Descripción:* Gráfico de líneas que compara el crecimiento del NAV normalizado (base 100) de 'Alianza Fondo Abierto' frente a 'CXC (Fondo Cash Conservador)' a lo largo del tiempo (2017-2026). Incluye 8 bandas verticales sombreadas que indican episodios clave del mercado (ej. COVID-19, Caída TES, Inflación).
- *Metadata Visual:* Eje Y: 'NAV normalizado (base 100 = 2-ene-2017)' con rango de 100 a 180. Eje X: Años de 2017 a 2026. Leyenda: Línea azul oscuro = Alianza Fondo Abierto, Línea morada = CXC (Fondo Cash Conservador). Marcadores de episodios del 1 al 8 en el gráfico y explicados en la parte inferior.
- *Datos Observados:* Valores aproximados por año: 2017 (Ambos: 100), 2018 (Alianza: 105, CXC: 108), 2019 (Alianza: 110, CXC: 115), 2020 (Alianza: 114, CXC: 122), 2021 (Alianza: 117, CXC: 127), 2022 (Alianza: 117, CXC: 130), 2023 (Alianza: 125, CXC: 140), 2024 (Alianza: 142, CXC: 155), 2025 (Alianza: 153, CXC: 172), 2026 (Alianza: 165, CXC: 190).

#### Texto Original (OCR)

`
Elemento Alpha • Análisis Cuantitativo de Fondos

Evolución NAV normalizado · Alianza Fondo Abierto vs CXC

Alianza Fondo Abierto
CXC (Fondo Cash Conservador)

NAV normalizado (base 100 = 2-ene-2017)
180
160
140
120
100

2017
2018
2019
2020
2021
2022
2023
2024
2025
2026

2
3
4
5
6
8
7

Episodios
1 Ciclo Alzas FED 17-18
2 COVID-19 Crash
3 Recup. Post-COVID
4 Caída TES Col.
5 Inflación & Alzas 22
6 Cambio Gob. Col 22
7 Rally COLTES 23
8 Normaliz. Tasas 23

Figura 3: NAV base 100 al 2-ene-2017. Bandas sombreadas marcan los ocho episodios.

5
`

