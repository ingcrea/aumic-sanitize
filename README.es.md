# AUM-IC Sanitizer (Estandarización y Validación de Repositorios)

🌐 Navegación: 🇺🇸 [Read in English](README.md) | 📜 [Manifiesto](MANIFEST.es.md)

![Standard AUM-IC 7:2026](https://img.shields.io/badge/Standard-AUM--IC_7%3A2026-blue) ![nature Clean Architecture Standard](https://img.shields.io/badge/nature-Clean_Architecture_Standard-00bfa5) ![License AGPL/Comercial](https://img.shields.io/badge/License-AGPL%2FComercial-orange) ![built by Ingeniería Creativa](https://img.shields.io/badge/built_by-Ingenier%C3%ADa_Creativa-yellow) ![0 CVE Vulnerabilities](https://img.shields.io/badge/Vulnerabilities-0_CVE-success)

**AUM-IC Sanitizer** es la herramienta corporativa de **Ingeniería Creativa** para el control de calidad en código fuente. Opera como un CLI y Git Hook especializado en estandarización de codificación (resolución de Mojibake), normalización de saltos de línea (CRLF/LF) y mitigación de inyecciones de código (Trojan Source).

Diseñado para integrarse en pipelines CI/CD y despliegues de alto nivel, el sistema evalúa dinámicamente **22 perfiles de lenguaje** para aplicar correcciones con precisión sintáctica, respetando siempre las convenciones estructurales de cada tecnología.

---

## 🛡️ Seguridad Corporativa y Arquitectura Zero-Trust

En entornos de producción, la modificación de código mediante heurísticas globales es un riesgo inaceptable. AUM-IC Sanitizer implementa un modelo **Zero-Trust**:

1. **Mecanismo de Rollback:** Antes de ejecutar cualquier escritura en disco, el sistema registra el estado previo en `aumic-history.json`. En caso de presentarse un conflicto de integración, el comando `aumic-sanitizer restore` revierte el repositorio a su estado original, asegurando la integridad de los datos.
2. **Validación Binaria (Short-Circuit):** El motor descarta automáticamente la lectura de binarios compilados y archivos multimedia (`.pdf`, `.docx`, `.xlsx`, `.zip`, `.png`, etc.) en tiempo de indexación, optimizando el rendimiento y eliminando el riesgo de corromper assets.
3. **Resolución AST (Abstract Syntax Tree):** Para lenguajes críticos (JavaScript, TypeScript, React), la corrección de formato no se basa en expresiones regulares convencionales. Utiliza análisis de árbol sintáctico para limitar los reemplazos exclusivamente a literales y comentarios, protegiendo la lógica del software.
4. **Dependencias Auditadas:** El CLI opera con **0 vulnerabilidades (0 CVE)** en su árbol de dependencias, garantizando su fiabilidad en infraestructuras corporativas.

---

## 🔬 Matrices de Corrección de Codificación (Mojibake)

La herramienta clasifica las anomalías de codificación en 4 vectores estructurales para aplicar correcciones focalizadas:

1. **LATIN1**: Discrepancias estándar de ISO-8859-1 a UTF-8.
2. **DOUBLE_UTF8**: Anomalías generadas por procesos de doble codificación.
3. **CP1252_PUNCTUATION**: Caracteres tipográficos originados por herramientas ofimáticas (portapapeles de Windows).
4. **HTML_ENTITIES**: Conversiones directas de codificación a entidades.

### Distribución Vectorial por Perfil
Para prevenir falsos positivos, la habilitación de los vectores depende del perfil del lenguaje:

| Perfil de Lenguaje | LATIN1 | CP1252 (Punt) | DOUBLE_UTF8 | HTML_ENTITIES |
|---|:---:|:---:|:---:|:---:|
| **PHP** (`.php`, `.phtml`) | ✅ | ✅ | ✅ | ✅ |
| **MARKUP** (`.html`, `.svg`) | ✅ | ✅ | ✅ | ✅ |
| **AST** (JS, TS, React, Astro) | ✅ | ✅ | ✅ | ❌ |
| **DATA** (JSON, YAML, CSV) | ✅ | ✅ | ✅ | ❌ |
| **Desktop / Mobile / Scripts** | ✅ | ✅ | ✅ | ❌ |

---

## Cobertura Estructural de Lenguajes

### 🌐 Web
| Lenguaje / Framework | Pipeline | Observaciones |
|---|---|---|
| JavaScript / TypeScript / React | AST (Babel) | Corrección habilitada únicamente dentro de strings y comentarios. |
| Astro | AST (Babel + TS) | Los metadatos (Frontmatter) se procesan como TypeScript. |
| Vue / Svelte | StringRegex | Análisis limitado a bloques de script y template. |
| PHP | StringRegex | Manejo específico para literales y sintaxis heredoc. |
| HTML | StringRegex | Resolución limitada a valores de atributos. |
| CSS | Global | Los archivos minificados reciben procesamiento restringido. |

### 🖥️ Desktop, Backend & Mobile
| Lenguaje | Pipeline | Observaciones |
|---|---|---|
| Python / Ruby | StringRegex | Soporte integral para literales multilínea y de interpolación. |
| Go / Rust / C / C++ | Regex byte-level | Reglas de comillas tipográficas (Smart Quotes) inhabilitadas por sintaxis del lenguaje. |
| C# / Java / Kotlin / Dart | StringRegex | Soporte para literales estándar y verbatim. |
| Swift | Regex byte-level | Tratamiento específico para raw strings e interpolaciones. |
| Shell / Scripts | Regex byte-level | Smart quotes inhabilitadas. |
| SQL | Regex byte-level | Identificadores estructurales preservados. |

### 📄 Infraestructura y Datos (Data Pipelines)
| Formato | Pipeline | Observaciones |
|---|---|---|
| **Bases de Datos** (`.csv`, `.tsv`) | Global | Perfil optimizado para la resolución de bases exportadas desde ofimática. |
| JSON (`.json`) | Regex byte-level | Smart quotes inhabilitadas. |
| YAML / TOML | Global | Operaciones seguras sobre formato declarativo. |
| XML / Plist | StringRegex | Limitado a propiedades y valores. |

---

## Análisis de Minificación

El sistema evalúa 4 métricas técnicas por archivo. Si dos o más umbrales coinciden, el archivo se cataloga como **minificado**, inhabilitando automáticamente las reglas invasivas (`smartQuotes` y limpieza de comentarios) para preservar el sourcemap original:

- El nombre del archivo incluye `.min.`
- Total de líneas ≤ 3 con peso superior a 500 caracteres
- Longitud máxima de una línea > 500 caracteres
- Ratio de saltos de línea inferior al 0.2% del volumen total

---


---

## ⚙️ Gobernanza y Configuración (Configuration as Code)

Para garantizar que todos los desarrolladores y pipelines de CI/CD operen bajo el mismo estándar, la herramienta permite declarar un contrato de infraestructura. Ejecutar `aumic-sanitizer init` genera el archivo `aumic.config.json` en la raíz del proyecto:

```json
{
  "ignore": [
    "node_modules",
    "dist",
    "build",
    ".git",
    "wp-content/uploads"
  ],
  "rules": {
    "mojibake": true,
    "zeroWidth": true,
    "crlf": true,
    "eradicator": true,
    "smartQuotes": true
  }
}
```

Este archivo actúa como la **única fuente de verdad**. Permite excluir directorios pesados y desactivar módulos invasivos (por ejemplo, apagar `eradicator` si el proyecto requiere preservar logs en consola por diseño).

## 🚀 Instalación y Despliegue

La herramienta está distribuida en el registro global de NPM. Puede ser ejecutada "al vuelo" en entornos efímeros (Pipelines CI/CD) o instalada de forma global en estaciones de trabajo.

### 1. Ejecución Al Vuelo (NPM Exec)
No requiere instalación permanente. Es la directiva estándar para flujos de automatización (GitHub Actions, GitLab CI):
```bash
# Generar el contrato de infraestructura
npx @ingcrea/aumic-sanitizer init

# Ejecutar escáner destructivo en la ruta actual
npx @ingcrea/aumic-sanitizer scan

# Escanear un directorio específico (Ej. WordPress)
npx @ingcrea/aumic-sanitizer scan src/components/
```

### 2. Instalación Global (Estaciones de Trabajo)
Para uso diario, habilita el acceso instantáneo al menú interactivo y a comandos directos:
```bash
npm install -g @ingcrea/aumic-sanitizer

# Desplegar panel de gestión visual
aumic-sanitizer
```

### 3. Integración Pre-Commit (Delta Scan)
Para validación en tiempo de desarrollo. Evalúa exclusivamente los archivos modificados en el índice de Git (Staging):
```bash
aumic-sanitizer scan --delta
```

### 4. Recuperación de Estado (Rollback Forense)
En caso de fallo de integración o daño accidental, revierte los bytes al estado idéntico antes de la última transacción:
```bash
npx @ingcrea/aumic-sanitizer restore
# o si está instalado globalmente:
aumic-sanitizer restore
```

---

## 🏢 Soporte Corporativo

AUM-IC Sanitizer es mantenido por el equipo de ingeniería de **[Ingeniería Creativa](https://ingcrea.com)**.

Para implementaciones empresariales, auditorías de seguridad personalizadas o soporte técnico avanzado:
📧 **Contacto Directo:** [contacto@ingcrea.com](mailto:contacto@ingcrea.com)
