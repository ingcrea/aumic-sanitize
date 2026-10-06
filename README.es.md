# AUM-IC Sanitize (Motor Forense Anti-Entropía)

🌐 Navegación: 🇺🇸 [Read in English](README.md) | 📜 [Manifiesto](MANIFEST.es.md) | 📖 [Bitácora](BITACORA.md)

![Standard AUM-IC 7:2026](https://img.shields.io/badge/Standard-AUM--IC_7%3A2026-blue) ![nature Clean Architecture Standard](https://img.shields.io/badge/nature-Clean_Architecture_Standard-00bfa5) ![License AGPL/Comercial](https://img.shields.io/badge/License-AGPL%2FComercial-orange) ![built by Ingeniería Creativa](https://img.shields.io/badge/built_by-Ingenier%C3%ADa_Creativa-yellow)

**AUM-IC Sanitize** es un CLI nativo y Git Hook de validación forense. No es un linter. Es un motor de rastreo a nivel de byte que purga corrupción UTF-8 (Mojibake), secuencias de salto de línea mixtas, inyecciones de Trojan Source y rastros de depuración muertos antes de que toquen producción.

El motor clasifica cada archivo en uno de sus **22 perfiles de lenguaje** antes de procesarlo, adaptando las reglas a la sintaxis exacta de cada tecnología. Un archivo PHP, un componente Swift y un bundle CSS minificado reciben tratamientos radicalmente distintos.

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
| SVG | `.svg` | StringRegex | Atributos de presentación |

### 🖥️ Desktop & Backend
| Lenguaje | Extensiones | Pipeline | Notas |
|---|---|---|---|
| Python | `.py` `.pyw` `.pyi` | StringRegex | Triple-quotes incluidas |
| Ruby | `.rb` `.rake` `.erb` | StringRegex | Interpolación `#{}` respetada |
| Go | `.go` | Regex byte-level | Smart quotes desactivadas (rune literals con `'`) |
| Rust | `.rs` | Regex byte-level | Smart quotes desactivadas (char literals con `'`) |
| C# / .NET | `.cs` `.csx` | StringRegex | Verbatim strings `@"..."` incluidas |
| Java | `.java` `.groovy` | StringRegex | Strings estándar |
| C / C++ | `.c` `.h` `.cpp` `.hpp` | Regex byte-level | Smart quotes desactivadas (char literals) |
| SQL | `.sql` | Regex byte-level | Smart quotes desactivadas (identificadores con `"`) |
| Shell / Scripts | `.sh` `.bash` `.zsh` `.ps1` `.bat` | Regex byte-level | Smart quotes desactivadas |

### 📱 Mobile
| Plataforma | Lenguaje / Extensión | Pipeline | Notas |
|---|---|---|---|
| iOS / macOS | Swift (`.swift`) | Regex byte-level | Raw strings `#"..."#` y string interpolation respetados |
| Android | Kotlin (`.kt` `.kts`) | StringRegex | Triple-quoted strings incluidas |
| Android (legacy) | Java (`.java`) | StringRegex | Ídem |
| Flutter | Dart (`.dart`) | StringRegex | Strings simples, dobles y triple-quoted |
| React Native | JS / TS / JSX / TSX | AST (Babel) | Mismo pipeline que web |

### 📄 Datos & Configuración
| Formato | Extensiones | Pipeline | Notas |
|---|---|---|---|
| JSON | `.json` `.jsonc` | Regex byte-level | Smart quotes **desactivadas** (las `'` son JSON inválido) |
| YAML | `.yaml` `.yml` | Global | Safe |
| TOML | `.toml` | Global | Safe |
| XML / Plist / XIB | `.xml` `.plist` `.xib` | StringRegex | Solo valores de atributos |
| Variables de entorno | `.env` | Global | Safe |
| Markdown | `.md` `.mdx` `.rst` | Global | Safe |
| Texto plano | `.txt` `.csv` `.log` | Global | Safe |

---

## Detección de Minificación

El motor evalúa 4 señales heurísticas por archivo. Si se activan ≥ 2, el archivo se clasifica como **minificado** y se bloquean automáticamente las reglas `smartQuotes` y `eradicator`:

- El nombre contiene `.min.` (ej: `jquery.min.js`)
- El archivo tiene ≤ 3 líneas con > 500 caracteres de total
- La línea más larga supera 500 caracteres
- El ratio de saltos de línea < 0.2% del total de bytes

Los archivos minificados solo reciben operaciones **byte-level** (Mojibake + Zero-Width). La semántica del código queda intacta.

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
aumic-sanitize scan src/index.ts
```

### 3. Delta Scan (Integración Git)
Audita exclusivamente los archivos en staging. Optimizado para pre-commit hook:
```bash
aumic-sanitize scan --delta
```

### 4. Git Hook (Sentinel Mode)
Ancla el motor al ciclo de vida del repositorio local. Bloquea commits con anomalías:
```bash
aumic-sanitize hook-install
```

### 5. Solo Auditoría (Sin escritura)
Inspecciona sin modificar ningún archivo. Útil para CI/CD:
```bash
aumic-sanitize scan --audit
```

### 6. Rollback Forense
Restaura archivos al estado previo usando el snapshot `aumic-history.json`:
```bash
aumic-sanitize restore
aumic-sanitize restore src/index.ts
```
