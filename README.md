# AUM-IC Sanitize (Repository Standardization & Validation)

🌐 Navigation: 🇲🇽 [Leer en Español](README.es.md) | 📜 [Manifesto](MANIFEST.md) | 📖 [Changelog](BITACORA.md)

![Standard AUM-IC 7:2026](https://img.shields.io/badge/Standard-AUM--IC_7%3A2026-blue) ![nature Clean Architecture Standard](https://img.shields.io/badge/nature-Clean_Architecture_Standard-00bfa5) ![License AGPL/Commercial](https://img.shields.io/badge/License-AGPL%2FCommercial-orange) ![built by Ingeniería Creativa](https://img.shields.io/badge/built_by-Ingenier%C3%ADa_Creativa-yellow) ![0 CVE Vulnerabilities](https://img.shields.io/badge/Vulnerabilities-0_CVE-success)

**AUM-IC Sanitize** is the corporate source code quality control tool developed by **Ingeniería Creativa**. It operates as a specialized CLI and Git Hook for coding standardization (Mojibake resolution), line-ending normalization (CRLF/LF), and Trojan Source mitigation.

Designed to integrate seamlessly into CI/CD pipelines and enterprise-level deployments, the system dynamically evaluates **22 language profiles** to apply syntax-accurate corrections, consistently respecting the structural conventions of each technology.

---

## 🛡️ Corporate Security and Zero-Trust Architecture

In production environments, modifying code through global heuristics is an unacceptable risk. AUM-IC Sanitize implements a **Zero-Trust** model:

1. **Rollback Mechanism:** Before executing any disk write, the system registers the previous state in `aumic-history.json`. In the event of an integration conflict, the `aumic-sanitize restore` command reverts the repository to its exact original state, ensuring complete data integrity.
2. **Binary Validation (Short-Circuit):** The engine automatically discards the reading of compiled binaries and multimedia files (`.pdf`, `.docx`, `.xlsx`, `.zip`, `.png`, etc.) during indexing, optimizing performance and removing the risk of asset corruption.
3. **AST Resolution (Abstract Syntax Tree):** For critical languages (JavaScript, TypeScript, React), formatting corrections do not rely on conventional regular expressions. The tool utilizes syntax tree analysis to limit replacements strictly to literals and comments, safeguarding software logic.
4. **Audited Dependencies:** The CLI operates with **0 known vulnerabilities (0 CVE)** in its dependency tree, ensuring reliability within corporate infrastructures.

---

*(See the Spanish README or the Manifesto for full technical coverage matrices).*
