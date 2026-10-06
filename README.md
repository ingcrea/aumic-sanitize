# AUM-IC Sanitize (Anti-Entropy Forensic Engine)

🌐 Navigation: 🇲🇽 [Leer en Español](README.es.md) | 📜 [Manifesto](MANIFEST.md) | 📖 [Changelog](BITACORA.md)

![Standard AUM-IC 7:2026](https://img.shields.io/badge/Standard-AUM--IC_7%3A2026-blue) ![nature Clean Architecture Standard](https://img.shields.io/badge/nature-Clean_Architecture_Standard-00bfa5) ![License AGPL/Commercial](https://img.shields.io/badge/License-AGPL%2FCommercial-orange) ![built by Ingeniería Creativa](https://img.shields.io/badge/built_by-Ingenier%C3%ADa_Creativa-yellow)

**AUM-IC Sanitize** is a native CLI and forensic Git Hook validator. Not a linter. A byte-level tracking engine that purges UTF-8 corruption (Mojibake), mixed line endings, Trojan Source injections, and dead debugging traces before they hit production.

The engine classifies each file into one of its **22 language profiles** before processing it, adapting rules to the exact syntax of each technology. A PHP file, a Swift component, and a minified CSS bundle receive radically different treatment.

---

## Universal Language Coverage

### 🌐 Web
| Language / Framework | Extensions | Pipeline | Notes |
|---|---|---|---|
| JavaScript | `.js` `.mjs` `.cjs` | AST (Babel) | Smart quotes only inside strings/comments |
| TypeScript | `.ts` | AST (Babel + TS) | Same |
| React / JSX | `.jsx` `.tsx` | AST (Babel + JSX) | Same |
| Astro | `.astro` | AST (Babel + TS) | Frontmatter and scripts treated as TS |
| Vue | `.vue` | StringRegex | Script + template blocks |
| Svelte | `.svelte` | StringRegex | Script + template blocks |
| PHP | `.php` `.phtml` | StringRegex | Heredocs and isolated strings; eradicator disabled |
| HTML | `.html` `.htm` `.xhtml` | StringRegex | Attribute values only |
| CSS | `.css` `.scss` `.sass` `.less` `.styl` | Global | Minified: byte-level only |
| SVG | `.svg` | StringRegex | Presentation attributes |

### 🖥️ Desktop & Backend
| Language | Extensions | Pipeline | Notes |
|---|---|---|---|
| Python | `.py` `.pyw` `.pyi` | StringRegex | Triple-quotes included |
| Ruby | `.rb` `.rake` `.erb` | StringRegex | `#{}` interpolation respected |
| Go | `.go` | Byte-level regex | Smart quotes disabled (rune literals use `'`) |
| Rust | `.rs` | Byte-level regex | Smart quotes disabled (char literals use `'`) |
| C# / .NET | `.cs` `.csx` | StringRegex | Verbatim strings `@"..."` included |
| Java | `.java` `.groovy` | StringRegex | Standard strings |
| C / C++ | `.c` `.h` `.cpp` `.hpp` | Byte-level regex | Smart quotes disabled (char literals) |
| SQL | `.sql` | Byte-level regex | Smart quotes disabled (`"` are identifiers) |
| Shell / Scripts | `.sh` `.bash` `.zsh` `.ps1` `.bat` | Byte-level regex | Smart quotes disabled |

### 📱 Mobile
| Platform | Language / Extension | Pipeline | Notes |
|---|---|---|---|
| iOS / macOS | Swift (`.swift`) | Byte-level regex | Raw strings `#"..."#` and interpolation respected |
| Android | Kotlin (`.kt` `.kts`) | StringRegex | Triple-quoted strings included |
| Android (legacy) | Java (`.java`) | StringRegex | Same |
| Flutter | Dart (`.dart`) | StringRegex | Single, double, and triple-quoted strings |
| React Native | JS / TS / JSX / TSX | AST (Babel) | Same pipeline as web |

### 📄 Data & Configuration
| Format | Extensions | Pipeline | Notes |
|---|---|---|---|
| JSON | `.json` `.jsonc` | Byte-level regex | Smart quotes **disabled** (`'` is invalid JSON) |
| YAML | `.yaml` `.yml` | Global | Safe |
| TOML | `.toml` | Global | Safe |
| XML / Plist / XIB | `.xml` `.plist` `.xib` | StringRegex | Attribute values only |
| Environment vars | `.env` | Global | Safe |
| Markdown | `.md` `.mdx` `.rst` | Global | Safe |
| Plain text | `.txt` `.csv` `.log` | Global | Safe |

---

## Minification Detection

The engine evaluates 4 heuristic signals per file. If ≥ 2 activate, the file is classified as **minified** and `smartQuotes` + `eradicator` rules are automatically blocked:

- Filename contains `.min.` (e.g., `jquery.min.js`)
- File has ≤ 3 lines with > 500 total characters
- Longest line exceeds 500 characters
- Line-break ratio < 0.2% of total bytes

Minified files only receive **byte-level** operations (Mojibake + Zero-Width). Code semantics remain intact.

---

## Usage

### 1. Interactive Panel
Standard execution. Deploys the main interface:
```bash
aumic-sanitize
```

### 2. Explicit Targeting
Direct execution on specific paths (bypasses the interactive menu):
```bash
aumic-sanitize scan src/components/
aumic-sanitize scan src/index.ts
```

### 3. Delta Scan (Git Integration)
Audits exclusively staged files. Optimized for pre-commit hook use:
```bash
aumic-sanitize scan --delta
```

### 4. Git Hook (Sentinel Mode)
Anchors the engine to the local repository lifecycle. Blocks commits with entropy anomalies:
```bash
aumic-sanitize hook-install
```

### 5. Audit Only (No writes)
Inspects without modifying any file. Useful for CI/CD pipelines:
```bash
aumic-sanitize scan --audit
```

### 6. Forensic Rollback
Restores files to their previous state using the `aumic-history.json` snapshot:
```bash
aumic-sanitize restore
aumic-sanitize restore src/index.ts
```
