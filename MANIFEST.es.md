# AUM-IC SANITIZE: ADR (Architecture Decision Record)

🌐 Navegación: 🇺🇸 [Read in English](MANIFEST.md) | 🏠 [Volver al Inicio](README.es.md)

![Standard AUM-IC 7:2026](https://img.shields.io/badge/Standard-AUM--IC_7%3A2026-blue) ![nature Clean Architecture Standard](https://img.shields.io/badge/nature-Clean_Architecture_Standard-00bfa5)

Registro de decisiones arquitectónicas y diseño estructural del motor de sanitización. Sin especulación. Lógica documentada para garantizar mantenimiento riguroso y evolución controlada del núcleo del CLI.

---

## 1. Persistencia Forense (aumic-history.json)
- **Contexto:** Un script destructivo sin logs de estado detallados es un riesgo inaceptable en monorepos de clientes.
- **Decisión:** Motor de instantáneas de estado. El sistema mapea la entropía estructural antes de mutar cualquier byte, permitiendo rollback (callback forense) exacto archivo por archivo.

## 2. Bloqueo Binario (Short-Circuit I/O)
- **Contexto:** Si el motor topa con archivos `.pdf`, `.docx`, `.xlsx` o imágenes, el pipeline de fallback (`PLAIN`) corromperá el binario al inyectar bytes de reemplazo. Además, leer en RAM imágenes pesadas colapsa el heap.
- **Decisión:** Filtro estructural en capa 0. Una lista blanca de excepciones ignora instantáneamente extensiones binarias compiladas en 0 milisegundos, abortando la lectura de disco (`fs.readFile`). Velocidad máxima y seguridad del binario garantizada.

## 3. Eficiencia de Escaneo (Delta Scan)
- **Decisión:** Modo diferencial (`--delta`) anclado al índice local de Git. El motor solo lee y procesa los archivos en staging.

## 4. LanguageProfiler — Clasificador Universal de 22 Lenguajes
- **Decisión:** Módulo `LanguageProfiler.ts` con 22 categorías. Cada perfil define explícitamente: pipeline asignado, modo de smart quotes, permisos para eradicator, CRLF y NBSP. Los archivos de datos exportados (`.csv`, `.tsv`) se procesan bajo el perfil `PLAIN` para máxima seguridad estructural.

## 5. Triple Pipeline — AST / StringRegex / Global
- **Decisión:**
  - **AST (Babel):** JS, TS, JSX, TSX, Astro. Mutaciones inyectadas vía AST con `MagicString.overwrite()`.
  - **StringRegex:** PHP, Python, C#, HTML, etc.
  - **Global:** CSS, YAML, CSV.

## 6. Desacoplamiento Vectorial y Motor Heurístico (MojibakeEngine)
- **Contexto:** Un diccionario global de reemplazo generaba falsos positivos cruzados. Por ejemplo, limpiar entidades HTML corruptas dentro de un archivo JSON rompía cadenas legítimas que contenían `&copy;`.
- **Decisión:** Se inyectó un motor de inferencia (`MojibakeEngine`). El motor fragmenta la corrupción en 4 matrices (LATIN1, DOUBLE_UTF8, CP1252_PUNCTUATION, HTML_ENTITIES). Aplica limpieza jerárquica vía `Scoring`, inyectando `HTML_ENTITIES` única y exclusivamente en perfiles `PHP` y `MARKUP`.

## 7. Detección de Minificación
- **Decisión:** Sistema heurístico de 4 señales (`.min.`, ratio, longitud). Con ≥ 2 activas, se bloquean Eradicator y SmartQuotes.

## 8. Neutralización de Smart Quotes (El Bug de WordPress)
- **Decisión:** La regla de smart quotes simples está prohibida en modo Global. Los lenguajes que usan `'` como delimitador de sintaxis (Go, Rust, SQL) tienen `smartQuoteMode: disabled` de forma permanente.

## 9. Escalabilidad Concurrente (Worker Threads)
- **Decisión:** Worker Pool nativo (`piscina`).
