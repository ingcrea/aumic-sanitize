# AUM-IC SANITIZER: Architecture Decision Record (ADR)

🌐 Navigation: 🇲🇽 [Leer en Español](MANIFEST.es.md) | 🏠 [Back to Home](README.md)

![Standard AUM-IC 7:2026](https://img.shields.io/badge/Standard-AUM--IC_7%3A2026-blue) ![nature Clean Architecture Standard](https://img.shields.io/badge/nature-Clean_Architecture_Standard-00bfa5) ![0 CVE Vulnerabilities](https://img.shields.io/badge/Vulnerabilities-0_CVE-success)

Formal document registering the structural design of the CLI. This manifesto details the architectural logic implemented to guarantee long-term maintenance and alignment with the operational standards of Ingeniería Creativa.

---

## 1. Modification Registry (aumic-history.json)
- **Context:** Executing text modification tools without a recovery log is a critical risk in enterprise repositories.
- **Decision:** Implementation of a snapshot system. The CLI stores the previous state of modified files, providing a native, transaction-based recovery mechanism (Rollback).

## 2. Binary Asset Exclusion (Short-Circuit)
- **Context:** Processing compiled files or media through text validation routines results in binary corruption and excessive RAM consumption.
- **Decision:** Injection of a validation barrier at the indexing layer. Compiled file extensions are excluded before any disk access occurs.

## 3. Continuous Integration Optimization (Delta Scan)
- **Context:** Exhaustively scanning a massive historical repository slows down local deployment workflows.
- **Decision:** Enablement of a differential mode (`--delta`) linked to the Git version control state, processing exclusively files marked for commit (Staging).

## 4. Technological Classifier (LanguageProfiler)
- **Context:** A generic approach to sanitization generates syntactic conflicts between different programming languages.
- **Decision:** Creation of the `LanguageProfiler.ts` module supporting 22 technical profiles. It assigns formal processing rules based on each extension's conventions (e.g., disabling typographical rules in SQL and `.csv` databases).

## 5. Multi-Pipeline Architecture (AST / StringRegex / Global)
- **Decision:** 
  - **AST (Babel):** Implemented in the JS/TS ecosystem for safe manipulation of literal nodes using `MagicString.overwrite()`.
  - **StringRegex:** Applied to traditional languages (PHP, C#, Java), focusing review exclusively on string chains.
  - **Global:** For declarative formats (CSS, YAML, CSV) and raw plaintext.

## 6. Encoding Resolution Matrices (MojibakeEngine)
- **Context:** Global character correction (Mojibake) caused unwanted mutations in formats that support HTML entities (e.g., JSON).
- **Decision:** Development of the `MojibakeEngine`, which categorizes corruption into specific vectors and executes a hierarchical correction based on density analysis (Scoring), restricting entity resolution exclusively to web environments (PHP and MARKUP).

## 7. Minified File Protection
- **Decision:** Implementation of technical heuristics (naming validation and character ratio). Confirming minification disables invasive policies to ensure the structural integrity of production bundles.

## 8. Thread Scaling (Worker Threads)
- **Decision:** Adoption of the `piscina` library for native distribution of computational tasks across multi-core architectures, drastically reducing bottlenecks caused by massive I/O operations.

## 9. Infrastructure Contract (Configuration as Code)
- **Context:** In multidisciplinary teams, executing validations with disparate local configurations causes operational friction and false positives in CI/CD.
- **Decision:** Implementation of a governance model based on `aumic.config.json`. This file acts as the Single Source of Truth, enabling modular deactivation of heuristics (e.g., intentional log preservation by disabling the eradicator module) and the exclusion of static paths. By versioning it in the repository, it guarantees absolute predictability during deployment.
