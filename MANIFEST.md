# AUM-IC SANITIZE: ADR (Architecture Decision Record)

🌐 Navigation: 🇲🇽 [Leer en Español](MANIFEST.es.md) | 🏠 [Back to Home](README.md)

![Standard AUM-IC 7:2026](https://img.shields.io/badge/Standard-AUM--IC_7%3A2026-blue) ![nature Clean Architecture Standard](https://img.shields.io/badge/nature-Clean_Architecture_Standard-00bfa5)

Architecture decisions and structural design log of the sanitization engine. Zero speculation. Documented logic to guarantee strict maintenance and evolution of the CLI core.

## 1. Forensic Persistence and Auditing
*   **Context:** A destructive script without a detailed logging system is an unacceptable risk in client monorepos.
*   **Decision:** State snapshot engine injection (`aumic-history.json`). The system maps structural entropy before mutating any bytes, allowing exact automated rollbacks.

## 2. Scanning Efficiency (Delta)
*   **Context:** Parsing an entire repository of thousands of files on every commit halts development pipelines.
*   **Decision:** Architecture based on *Targeting* and differential mode (`--delta`) anchored to the local Git index. The engine only reads and processes modified deltas.

## 3. Base Collision Prevention (Shielding)
*   **Context:** When scanning its own codebase, the CLI detected and deleted its own algorithmic signatures for malware and Mojibake detection (Self-Mutilation).
*   **Decision:** Refactored all internal search vectors using raw hexadecimals and isolated HTML entities. The engine bypasses its own source code by physical default.

## 4. AST (Abstract Syntax Tree) vs Regex
*   **Context:** Using regular expressions to hunt `console.log` calls destroyed legitimate text strings and generated critical false positives.
*   **Decision:** Replaced Regex with pure lexical analysis. Implemented `@babel/parser` and `magic-string`. The engine maps code into an AST tree and executes surgical mutilation exclusively on verified `CallExpression` nodes.

## 5. Concurrent Scalability (Worker Threads)
*   **Context:** Node.js collapses from I/O thread starvation when parsing massive files synchronously or asynchronously on a single thread.
*   **Decision:** Native Worker Pool integration (`piscina`). Heavy computational loads are delegated directly to physical processor cores, reducing scan times to the theoretical minimum.
