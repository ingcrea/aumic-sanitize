# AUM-IC Sanitize (Anti-Entropy Forensic Engine)

🌐 Navigation: 🇲🇽 [Leer en Español](README.es.md) | 📜 [Manifesto](MANIFEST.md) | 📖 [Changelog](BITACORA.md)

![Standard AUM-IC 7:2026](https://img.shields.io/badge/Standard-AUM--IC_7%3A2026-blue) ![nature Clean Architecture Standard](https://img.shields.io/badge/nature-Clean_Architecture_Standard-00bfa5) ![License AGPL/Commercial](https://img.shields.io/badge/License-AGPL%2FCommercial-orange) ![built by Ingeniería Creativa](https://img.shields.io/badge/built_by-Ingenier%C3%ADa_Creativa-yellow)

**AUM-IC Sanitize** is a native CLI and forensic Git Hook validator. Not a linter. A byte-level tracking engine that purges UTF-8 corruption (Mojibake), mixed line endings, Trojan Source injections, and dead debugging traces before they hit production.

---

## 🛡️ Competitive Advantages & Safety (Zero-Trust)

Unlike common Regex scripts that destroy code when processing massive databases, AUM-IC Sanitize was designed with a strict **Zero-Trust** doctrine toward its own replacement engine.

1. **Forensic Rollback (Emergency Callback):** 
   The system **never** mutates a file's entropy without first generating a snapshot. Every change is recorded in a local manifest called `aumic-history.json`. If sanitization interferes with business logic, running `aumic-sanitize restore` will invoke a forensic callback that reverts the repository to its exact previous state in milliseconds. No data loss, no catastrophes.
2. **Binary Protection (Short-Circuit I/O):**
   Compiled files (`.pdf`, `.docx`, `.xlsx`, `.zip`) and media (images, audio, fonts) are protected by a *short-circuit* barrier. The engine identifies and skips them in 0 milliseconds, preventing memory reads. This guarantees zero corruption in binary deliverables and instantaneous scan times in heavy static directories.
3. **AST Surgery (Abstract Syntax Tree):**
   In critical ecosystems (JavaScript, TypeScript, React, Astro), repairs are executed by injecting a syntax tree. The engine is incapable of breaking the code structure because mutations occur exclusively inside string nodes.

---

## 🔬 L7 Forensic Inference (Mojibake Matrices)

Instead of replacing characters blindly, the engine classifies corruption into 4 matrix vectors and executes heuristic scoring to deduce the origin of the damage before mutating bytes:

1. **LATIN1**: Standard damage (ISO-8859-1 to UTF-8).
2. **DOUBLE_UTF8**: Double encoding corruption (e.g., UTF-8 text served as Latin1 and re-saved as UTF-8).
3. **CP1252_PUNCTUATION**: Layer 7 anomalies (Windows clipboard quotes and dashes).
4. **HTML_ENTITIES**: Erroneous conversion from bytes to entities (e.g., `&Atilde;&plusmn;`).

### Vector Distribution by Language

| Language Profile | LATIN1 | CP1252 (Punct) | DOUBLE_UTF8 | HTML_ENTITIES |
|---|:---:|:---:|:---:|:---:|
| **PHP** (`.php`, `.phtml`) | ✅ | ✅ | ✅ | ✅ |
| **MARKUP** (`.html`, `.svg`) | ✅ | ✅ | ✅ | ✅ |
| **AST** (JS, TS, React, Astro) | ✅ | ✅ | ✅ | ❌ |
| **DATA** (JSON, YAML, CSV) | ✅ | ✅ | ✅ | ❌ |
| **Desktop / Mobile / Scripts** | ✅ | ✅ | ✅ | ❌ |

---

## Universal Language Coverage

### 📄 Data & Configuration (Data Pipelines)
| Format | Extensions | Pipeline | Notes |
|---|---|---|---|
| **Exported DBs** | `.csv` `.tsv` | Global | **Specialized**: Flawless purge for CSVs exported from Excel |
| JSON | `.json` `.jsonc` | Byte-level regex | Smart quotes **disabled** |
| YAML / TOML | `.yaml` `.yml` `.toml` | Global | Safe |
| Text / Markdown | `.txt` `.md` | Global | Raw plain text operations |

*(See full language coverage tables in the Spanish README or the Manifesto).*

---

## Minification Detection

The engine evaluates 4 heuristic signals per file. If ≥ 2 activate, the file is classified as **minified** and `smartQuotes` + `eradicator` rules are automatically blocked:
- Filename contains `.min.`
- File has ≤ 3 lines with > 500 total characters
- Longest line exceeds 500 characters
- Line-break ratio < 0.2% of total bytes

---

## Usage

### 1. Interactive Panel
```bash
aumic-sanitize
```

### 2. Forensic Rollback (Emergency Callback)
```bash
aumic-sanitize restore
```
