# AUM-IC SANITIZE: ADR (Architecture Decision Record)

🌐 Navegación: 🇺🇸 [Read in English](MANIFEST.md) | 🏠 [Volver al Inicio](README.es.md)

![Standard AUM-IC 7:2026](https://img.shields.io/badge/Standard-AUM--IC_7%3A2026-blue) ![nature Clean Architecture Standard](https://img.shields.io/badge/nature-Clean_Architecture_Standard-00bfa5)

Registro de decisiones arquitectónicas y diseño estructural del motor de sanitización. Sin especulación. Lógica documentada para garantizar mantenimiento riguroso y evolución controlada del núcleo del CLI.

---

## 1. Persistencia Forense (aumic-history.json)
- **Contexto:** Un script destructivo sin logs de estado detallados es un riesgo inaceptable en monorepos de clientes.
- **Decisión:** Motor de instantáneas de estado. El sistema mapea la entropía estructural antes de mutar cualquier byte, permitiendo rollback exacto archivo por archivo.

## 2. Eficiencia de Escaneo (Delta Scan)
- **Contexto:** Analizar un repositorio completo en cada commit paraliza las pipelines de desarrollo.
- **Decisión:** Modo diferencial (`--delta`) anclado al índice local de Git. El motor solo lee y procesa los archivos en staging.

## 3. LanguageProfiler — Clasificador Universal de 22 Lenguajes
- **Contexto:** Una herramienta que aplica las mismas reglas de sanitización globalmente sobre todos los archivos genera colisiones catastróficas. Un reemplazo seguro en Markdown es letal dentro de un `char` literal de Rust o dentro de un `rune` literal de Go.
- **Decisión:** Módulo `LanguageProfiler.ts` con 22 categorías que mapea extensión + nombre de archivo a un `LanguageProfile`. Cada perfil define explícitamente: pipeline asignado, modo de smart quotes, permisos para eradicator, CRLF y NBSP.

## 4. Triple Pipeline — AST / StringRegex / Global
- **Contexto:** Los lenguajes con parsers disponibles permiten una precisión imposible con regex. Los que no, requieren estrategias intermedias. Los archivos de texto plano no tienen restricciones.
- **Decisión:**
  - **AST (Babel):** JS, TS, JSX, TSX, Astro. Opera exclusivamente sobre nodos `StringLiteral`, `TemplateLiteral.quasis` y `Comment`. Las mutaciones se aplican con `MagicString.overwrite()` preservando Source Maps.
  - **StringRegex:** PHP, Python, Ruby, C#, Java, Kotlin, Dart, HTML, XML, Vue, Svelte. Regex ajustado a los delimitadores de strings de cada lenguaje. Nunca opera fuera de un string detectado.
  - **Global:** CSS, YAML, TOML, Markdown, ENV. Regex sin restricciones — no hay sintaxis de lenguaje que romper.

## 5. Detección de Minificación
- **Contexto:** Aplicar `smartQuotes` o `eradicator` sobre un bundle minificado genera colisiones semánticas impredecibles y destruye el mapa de caracteres del bundle.
- **Decisión:** Sistema heurístico de 4 señales (nombre `.min.`, ratio de líneas, longitud máxima de línea, densidad de bytes). Con ≥ 2 señales activas, el archivo solo recibe operaciones byte-level (Mojibake + Zero-Width). Eradicator y SmartQuotes quedan bloqueados por el perfil.

## 6. Neutralización de Smart Quotes — El Bug que Rompió WordPress
- **Contexto:** La regla `smartQuotes` ejecutaba `content.replace(/[‘’]/g, "'")` sobre el archivo completo sin contexto semántico. Interceptó apóstrofes curvos (`isn’t`) dentro de strings JS delimitados por comillas simples, cerrando el string prematuramente → `SyntaxError: missing ) after argument list` en 1,647 archivos.
- **Decisión:** La regla de smart quotes simples (`‘’`) está **prohibida** en modo Global. Solo se activa cuando el motor opera dentro de un nodo AST aislado (modo `ast-only`) o dentro de un string reconocido por el regex del lenguaje (modo `string-regex`). Los lenguajes que usan `'` como delimitador de sintaxis (Go runes, Rust chars, SQL, Shell, C/C++) tienen `smartQuoteMode: disabled` de forma permanente.

## 7. Prevención de Automutilación
- **Contexto:** Al escanear su propio código fuente, el CLI detectaba y eliminaba sus propias firmas de detección de Mojibake (el detector se comía a sí mismo).
- **Decisión:** Todos los vectores de búsqueda internos usan hexadecimales crudos y entidades HTML aisladas. El motor excluye su propio directorio `src/` por defecto cuando se ejecuta desde su propia raíz.

## 8. Escalabilidad Concurrente (Worker Threads)
- **Contexto:** Node.js colapsa por inanición de I/O al procesar miles de archivos en un solo hilo.
- **Decisión:** Worker Pool nativo (`piscina`). La carga computacional se delega a los núcleos físicos del procesador, reduciendo los tiempos de barrido al mínimo teórico posible.

## 9. Fallback Automático (AST → StringRegex)
- **Contexto:** Si Babel no puede parsear un archivo JS/TS porque el código ya estaba sintácticamente roto antes de ejecutar el motor, el proceso falla con una excepción no controlada.
- **Decisión:** El pipeline AST envuelve el parse en un `try/catch`. En caso de fallo, redirige automáticamente al procesador `StringRegex` conservador. El motor nunca bloquea, nunca aborta.
