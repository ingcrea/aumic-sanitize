# AUM-IC Sanitize (Anti-Entropy Forensic Engine)

🌐 Navigation: 🇲🇽 [Leer en Español](README.es.md) | 📜 [Manifesto (EN)](MANIFEST.md) | 📖 [Changelog](BITACORA.md)

![Standard AUM-IC 7:2026](https://img.shields.io/badge/Standard-AUM--IC_7%3A2026-blue) ![nature Clean Architecture Standard](https://img.shields.io/badge/nature-Clean_Architecture_Standard-00bfa5) ![License AGPL/Commercial](https://img.shields.io/badge/License-AGPL%2FCommercial-orange) ![built by Ingeniería Creativa](https://img.shields.io/badge/built_by-Ingenier%C3%ADa_Creativa-yellow)

**AUM-IC Sanitize** is a native CLI and Git Hook validation engine. It is not just a linter. It is a byte-level forensic tracker. Its function is to purge UTF-8 corruption (Mojibake), mixed line endings, Trojan Source injections, and dead debugging trails before they hit production.

## The Problem
Code mutates when interacting with different operating systems, misconfigured IDEs, and network transfers. This injects hidden BOMs, breaks encoding tables, and accumulates trash in commits. The result: CI/CD bottlenecks and silent code injection vulnerabilities.

## Usage and Execution

### 1. Interactive CLI
Standard execution. Deploys the main interface:
```bash
aumic-sanitize
```

### 2. Explicit Targeting
Direct execution on specific paths (bypasses the interactive menu). Supports exact files or entire directories:
```bash
aumic-sanitize scan src/components/
aumic-sanitize scan src/index.ts
```

### 3. Delta Scan (Git Integration)
Audits exclusively files in the staging area (modified Git index). Architecturally optimized to act as a pre-commit hook without penalizing upload times:
```bash
aumic-sanitize scan --delta
```

### 4. Git Hook (Sentinel Mode)
Anchors the engine directly to your local repository lifecycle. Strictly and automatically blocks any commit containing entropy anomalies:
```bash
aumic-sanitize hook-install
```
