# AUM-IC SANITIZE: ADR (Architecture Decision Record)

🌐 Navigation: 🇲🇽 [Leer en Español](MANIFEST.es.md) | 🏠 [Back to Home](README.md)

![Standard AUM-IC 7:2026](https://img.shields.io/badge/Standard-AUM--IC_7%3A2026-blue) ![nature Clean Architecture Standard](https://img.shields.io/badge/nature-Clean_Architecture_Standard-00bfa5)

Architecture decisions and structural design log of the sanitization engine. Zero speculation. Documented logic to guarantee strict maintenance and controlled evolution of the CLI core.

---

## 1. Forensic Persistence (aumic-history.json)
- **Context:** A destructive script without detailed state logs is an unacceptable risk in client monorepos.
- **Decision:** State snapshot engine. The system maps structural entropy before mutating any byte, allowing exact file-by-file forensic callbacks (rollbacks).

## 2. Binary Blocking (Short-Circuit I/O)
- **Context:** If the engine encounters `.pdf`, `.docx`, `.xlsx` files or images, the fallback pipeline (`PLAIN`) will corrupt the binary by injecting replacement bytes. Additionally, loading heavy images into RAM crashes the heap.
- **Decision:** Layer 0 structural filter. A whitelist ignores compiled binary extensions instantly in 0 milliseconds, aborting the disk read (`fs.readFile`). Maximum speed and binary safety guaranteed.

## 3. Scanning Efficiency (Delta Scan)
- **Decision:** Differential mode (`--delta`) anchored to the local Git index.

## 4. LanguageProfiler — Universal 22-Language Classifier
- **Decision:** `LanguageProfiler.ts` module with 22 categories. Data export files (`.csv`, `.tsv`) are processed safely under the `PLAIN` profile.

## 5. Triple Pipeline — AST / StringRegex / Global
- **Decision:** AST for JS/TS, StringRegex for standard languages, Global for Plaintext/CSV.

## 6. Vector Decoupling and Heuristic Engine (MojibakeEngine)
- **Context:** A global replacement dictionary generated cross-false positives.
- **Decision:** Inference engine (`MojibakeEngine`). Fragments corruption into 4 matrices and applies hierarchical cleaning via `Scoring`. `HTML_ENTITIES` are exclusively injected into `PHP` and `MARKUP`.

## 7. Minification Detection
- **Decision:** 4-signal heuristic system. Block Eradicator and SmartQuotes on minified files.

## 8. Smart Quote Neutralization
- **Decision:** Single smart quote rule prohibited globally. Languages using `'` as syntax delimiters have `smartQuoteMode: disabled`.

## 9. Concurrent Scalability (Worker Threads)
- **Decision:** Native Worker Pool (`piscina`).
