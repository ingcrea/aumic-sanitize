# AUM-IC SANITIZE: ADR (Architecture Decision Record)

🌐 Navigation: 🇲🇽 [Leer en Español](MANIFEST.es.md) | 🏠 [Back to Home](README.md)

![Standard AUM-IC 7:2026](https://img.shields.io/badge/Standard-AUM--IC_7%3A2026-blue) ![nature Clean Architecture Standard](https://img.shields.io/badge/nature-Clean_Architecture_Standard-00bfa5)

Architecture decisions and structural design log of the sanitization engine. Zero speculation. Documented logic to guarantee strict maintenance and controlled evolution of the CLI core.

---

## 1. Forensic Persistence (aumic-history.json)
- **Context:** A destructive script without detailed state logs is an unacceptable risk in client monorepos.
- **Decision:** State snapshot engine. The system maps structural entropy before mutating any byte, allowing exact file-by-file rollbacks.

## 2. Scanning Efficiency (Delta Scan)
- **Context:** Parsing an entire repository on every commit halts development pipelines.
- **Decision:** Differential mode (`--delta`) anchored to the local Git index. The engine only reads and processes staged files.

## 3. LanguageProfiler — Universal 22-Language Classifier
- **Context:** A tool that applies the same sanitization rules globally across all files generates catastrophic collisions. A safe replacement in Markdown is lethal inside a Rust `char` literal or a Go `rune` literal.
- **Decision:** `LanguageProfiler.ts` module with 22 categories that maps extension + filename to a `LanguageProfile`. Each profile explicitly defines: assigned pipeline, smart quote mode, permissions for eradicator, CRLF, and NBSP.

## 4. Triple Pipeline — AST / StringRegex / Global
- **Context:** Languages with available parsers enable precision impossible with regex. Those without require intermediate strategies. Plain text files have no restrictions.
- **Decision:**
  - **AST (Babel):** JS, TS, JSX, TSX, Astro. Operates exclusively on `StringLiteral`, `TemplateLiteral.quasis`, and `Comment` nodes. Mutations are applied with `MagicString.overwrite()` preserving Source Maps.
  - **StringRegex:** PHP, Python, Ruby, C#, Java, Kotlin, Dart, HTML, XML, Vue, Svelte. Regex tuned to each language's string delimiters. Never operates outside a detected string.
  - **Global:** CSS, YAML, TOML, Markdown, ENV. Unrestricted regex — no language syntax to break.

## 5. Minification Detection
- **Context:** Applying `smartQuotes` or `eradicator` on a minified bundle generates unpredictable semantic collisions and destroys the bundle's character map.
- **Decision:** 4-signal heuristic system (name `.min.`, line ratio, max line length, byte density). With ≥ 2 active signals, the file only receives byte-level operations (Mojibake + Zero-Width). Eradicator and SmartQuotes are blocked by the profile.

## 6. Smart Quote Neutralization — The Bug That Broke WordPress
- **Context:** The `smartQuotes` rule ran `content.replace(/[‘’]/g, "'")` globally without semantic context. It intercepted curved apostrophes (`isn’t`) inside JS strings delimited by single quotes, closing the string prematurely → `SyntaxError: missing ) after argument list` across 1,647 files.
- **Decision:** The single smart quote rule (`‘’`) is **prohibited** in Global mode. It only activates when the engine operates inside an isolated AST node (`ast-only` mode) or inside a string recognized by the language's regex (`string-regex` mode). Languages that use `'` as a syntax delimiter (Go runes, Rust chars, SQL, Shell, C/C++) have `smartQuoteMode: disabled` permanently.

## 7. Self-Mutation Prevention
- **Context:** When scanning its own source code, the CLI detected and erased its own Mojibake detection signatures (the detector ate itself).
- **Decision:** All internal search vectors use raw hexadecimals and isolated HTML entities. The engine excludes its own `src/` directory by default when executed from its own root.

## 8. Concurrent Scalability (Worker Threads)
- **Context:** Node.js collapses from I/O starvation when processing thousands of files on a single thread.
- **Decision:** Native Worker Pool (`piscina`). Computational load is delegated directly to physical CPU cores, reducing scan times to the theoretical minimum.

## 9. Automatic Fallback (AST → StringRegex)
- **Context:** If Babel cannot parse a JS/TS file because the code was already syntactically broken before the engine ran, the process fails with an unhandled exception.
- **Decision:** The AST pipeline wraps the parse in a `try/catch`. On failure, it automatically redirects to the conservative `StringRegex` processor. The engine never blocks, never aborts.
