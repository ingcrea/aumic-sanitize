# AUM-IC Sanitize (Motor Forense Anti-Entropía)

🌐 Navegación: 🇺🇸 [Read in English](README.md) | 📜 [Manifiesto](MANIFEST.es.md) | 📖 [Bitácora](BITACORA.md)

![Standard AUM-IC 7:2026](https://img.shields.io/badge/Standard-AUM--IC_7%3A2026-blue) ![nature Clean Architecture Standard](https://img.shields.io/badge/nature-Clean_Architecture_Standard-00bfa5) ![License AGPL/Comercial](https://img.shields.io/badge/License-AGPL%2FComercial-orange) ![built by Ingeniería Creativa](https://img.shields.io/badge/built_by-Ingenier%C3%ADa_Creativa-yellow) ![0 CVE Vulnerabilities](https://img.shields.io/badge/Vulnerabilities-0_CVE-success)

**AUM-IC Sanitize** es un CLI nativo y Git Hook de validación forense. No es un linter. Es un motor de rastreo a nivel de byte que purga corrupción UTF-8 (Mojibake), secuencias de salto de línea mixtas, inyecciones de Trojan Source y rastros de depuración muertos antes de que toquen producción.

El motor clasifica cada archivo en uno de sus **22 perfiles de lenguaje** antes de procesarlo, adaptando las reglas a la sintaxis exacta de cada tecnología. Un archivo PHP, un componente Swift y un bundle CSS minificado reciben tratamientos radicalmente distintos.

---

## 🛡️ Ventajas Competitivas y Seguridad (Zero-Trust)

A diferencia de los scripts de Regex comunes que destruyen código al procesar bases de datos masivas, AUM-IC Sanitize fue diseñado con una doctrina estricta de **cero confianza (Zero-Trust)** hacia su propio motor de reemplazo.

1. **Rollback Forense (Callback de Emergencia):** 
   El sistema **jamás** muta la entropía de un archivo sin generar antes un *snapshot*. Todo cambio queda grabado en un manifiesto local llamado `aumic-history.json`. Si la sanitización interfiere con la lógica de negocio, ejecutar `aumic-sanitize restore` invocará un callback forense que revierte el repositorio a su estado idéntico previo en milisegundos. Sin pérdida de datos, sin catástrofes.
2. **Protección Binaria (Short-Circuit I/O):**
   Archivos compilados (`.pdf`, `.docx`, `.xlsx`, `.zip`) y media (imágenes, audio, fuentes) están protegidos por una barrera *short-circuit*. El motor los identifica y los salta en 0 milisegundos, evitando su lectura en memoria. Esto garantiza cero corrupción en entregables binarios y tiempos de escaneo inmediatos en directorios estáticos pesados (ej. `uploads/`).
3. **Cirugía AST (Abstract Syntax Tree):**
   En ecosistemas críticos (JavaScript, TypeScript, React, Astro), las reparaciones se ejecutan inyectando un árbol sintáctico. El motor es incapaz de romper la estructura del código porque las mutaciones ocurren exclusivamente en los nodos de strings.

---

## 🔬 Análisis Forense L7 (Matrices de Mojibake)

En lugar de reemplazar caracteres a ciegas, el motor clasifica la corrupción en 4 vectores matriciales y ejecuta un análisis heurístico (Scoring) para deducir el origen del daño antes de mutar los bytes:

1. **LATIN1**: Daño estándar (ISO-8859-1 a UTF-8).
2. **DOUBLE_UTF8**: Corrupción de doble codificación (Ej. texto UTF-8 servido como Latin1 y re-guardado como UTF-8).
3. **CP1252_PUNCTUATION**: Anomalías de la Capa 7 (Comillas y rayas del portapapeles de Windows).
4. **HTML_ENTITIES**: Conversión errónea de bytes a entidades (Ej. `&Atilde;&plusmn;`).

### Distribución Vectorial por Lenguaje
Para evitar colisiones semánticas, los vectores se habilitan estrictamente según el perfil del lenguaje:

| Perfil de Lenguaje | LATIN1 | CP1252 (Punt) | DOUBLE_UTF8 | HTML_ENTITIES |
|---|:---:|:---:|:---:|:---:|
| **PHP** (`.php`, `.phtml`) | ✅ | ✅ | ✅ | ✅ |
| **MARKUP** (`.html`, `.svg`) | ✅ | ✅ | ✅ | ✅ |
| **AST** (JS, TS, React, Astro) | ✅ | ✅ | ✅ | ❌ |
| **DATA** (JSON, YAML, CSV) | ✅ | ✅ | ✅ | ❌ |
| **Desktop / Mobile / Scripts** | ✅ | ✅ | ✅ | ❌ |

---

## Cobertura Universal de Lenguajes

### 🌐 Web
| Lenguaje / Framework | Extensiones | Pipeline | Notas |
|---|---|---|---|
| JavaScript | `.js` `.mjs` `.cjs` | AST (Babel) | Smart quotes solo dentro de strings/comentarios |
| TypeScript | `.ts` | AST (Babel + TS) | Ídem |
| React / JSX | `.jsx` `.tsx` | AST (Babel + JSX) | Ídem |
| Astro | `.astro` | AST (Babel + TS) | Frontmatter y scripts tratados como TS |
| Vue | `.vue` | StringRegex | Bloques script + template |
| Svelte | `.svelte` | StringRegex | Bloques script + template |
| PHP | `.php` `.phtml` | StringRegex | Heredocs y strings aislados; eradicator desactivado |
| HTML | `.html` `.htm` `.xhtml` | StringRegex | Solo valores de atributos |
| CSS | `.css` `.scss` `.sass` `.less` `.styl` | Global | Minificados: solo byte-level |

### 🖥️ Desktop & Backend
| Lenguaje | Extensiones | Pipeline | Notas |
|---|---|---|---|
| Python | `.py` `.pyw` `.pyi` | StringRegex | Triple-quotes incluidas |
| Go | `.go` | Regex byte-level | Smart quotes desactivadas (rune literals con `'`) |
| Rust | `.rs` | Regex byte-level | Smart quotes desactivadas (char literals con `'`) |
| C# / .NET | `.cs` `.csx` | StringRegex | Verbatim strings `@"..."` incluidas |
| Java / Kotlin | `.java` `.kt` | StringRegex | Strings estándar y triples soportados |
| C / C++ | `.c` `.h` `.cpp` `.hpp` | Regex byte-level | Smart quotes desactivadas (char literals) |

### 📄 Datos & Configuración (Data Pipelines)
| Formato | Extensiones | Pipeline | Notas |
|---|---|---|---|
| **Bases Exportadas** | `.csv` `.tsv` | Global | **Especializado**: Purga perfecta para CSV exportados desde Excel |
| JSON | `.json` `.jsonc` | Regex byte-level | Smart quotes **desactivadas** |
| YAML / TOML | `.yaml` `.yml` `.toml` | Global | Safe |
| Texto / Markdown | `.txt` `.md` | Global | Operaciones sobre texto plano bruto |

---

## Detección de Minificación

El motor evalúa 4 señales heurísticas por archivo. Si se activan ≥ 2, el archivo se clasifica como **minificado** y se bloquean automáticamente las reglas `smartQuotes` y `eradicator` para evitar destrucción del sourcemap:

- El nombre contiene `.min.` (ej: `jquery.min.js`)
- El archivo tiene ≤ 3 líneas con > 500 caracteres de total
- La línea más larga supera 500 caracteres
- El ratio de saltos de línea < 0.2% del total de bytes

---

## Uso y Ejecución

### 1. Panel Interactivo
Ejecución estándar. Despliega la interfaz principal:
```bash
aumic-sanitize
```

### 2. Targeting Explícito
Ejecución directa sobre rutas específicas (bypassea el menú interactivo):
```bash
aumic-sanitize scan src/components/
```

### 3. Delta Scan (Integración Git)
Audita exclusivamente los archivos en staging. Optimizado para pre-commit hook:
```bash
aumic-sanitize scan --delta
```

### 4. Rollback Forense (Callback de Emergencia)
Restaura archivos al estado previo usando el snapshot `aumic-history.json`:
```bash
aumic-sanitize restore
aumic-sanitize restore src/index.ts
```
