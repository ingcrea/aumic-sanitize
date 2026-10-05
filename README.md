# AUM-IC Sanitize (Anti-Entropy Forensic Engine Zero-Trust)

🌐 Navigation: 🇲🇽 [Leer en Español](README.es.md) | 📜 [Manifesto (EN)](MANIFEST.md) | 📖 [Changelog](BITACORA.md)

![Standard AUM-IC 7](https://img.shields.io/badge/Standard-AUM--IC_7-blue) ![nature Clean Architecture Standard](https://img.shields.io/badge/nature-Clean_Architecture_Standard-00bfa5) ![License AGPL/Commercial](https://img.shields.io/badge/License-AGPL%2FCommercial-orange) ![built by IngCrea](https://img.shields.io/badge/built_by-IngCrea-yellow)


**AUM-IC Sanitize** es una herramienta CLI de grado empresarial y un interceptor *Self-Healing* diseñado por **Ingeniería Creativa**. Su propósito absoluto es operar como el sistema inmunológico de repositorios masivos, erradicando entropía estructural, Mojibake y ataques Trojan Source.

## La Amenaza Invisible
Un simple "copiar y pegar" inyecta caracteres invisibles, rompe la tabla UTF-8 y genera cuellos de botella catastróficos. AUM-IC Sanitize escanea el código a nivel de byte y neutraliza estas amenazas sin alterar la lógica de negocio.

## Capacidades Avanzadas y Uso

### 1. Central Forense (Modo Interactivo)
Ejecutar el motor sin argumentos despliega el panel interactivo principal:
```bash
aumic-sanitize
```
Desde aquí puedes seleccionar visualmente si deseas Sanear, Auditar, Restaurar o Instalar el Git Hook.

### 2. Ataque Quirúrgico (Targeting)
Puedes dirigir el escáner a todo el proyecto o a objetivos específicos:
```bash
aumic-sanitize scan src/components/     # Escanea solo una carpeta
aumic-sanitize scan src/archivo.ts      # Escanea solo un archivo
```

### 3. Escaneo Diferencial (Delta Scan)
Para repositorios masivos, audita exclusivamente los archivos modificados frente al índice de Git:
```bash
aumic-sanitize scan --delta
```

### 4. Simulación y Auditoría (Dry-Run)
Analiza un objetivo sin alterar archivos en el disco duro:
```bash
aumic-sanitize audit [target]
```

### 5. Inteligencia Forense y Rollback Absoluto
Al finalizar una operación, se genera `aumic-history.json`. Puedes utilizarlo para revertir quirúrgicamente los archivos al milisegundo exacto antes del escaneo:
```bash
aumic-sanitize restore [target]
```

## Topología de Erradicación (Capa Genética)

### 1. Reconstrucción de Mojibake (Inmunidad Matemática)
Calcula mutaciones cruzando un Buffer latin1 contra utf8 para recuperar el estado original sin automutilarse.
### 2. Destructor de BOM y Trojan Source
Busca y destruye BOM Fantasma, espacios de ancho cero (NBSP) y Overrides Direccionales (BiDi).

### Tabla de Erradicación Genética (Firmas Soportadas)
| Mutación (Mojibake) | Curado (AUM-IC) | Descripción (Origen) |
| :--- | :--- | :--- |
| `&Atilde;&iexcl;` | `á` | Vocal minúscula |
| `&Atilde;&copy;` | `é` | Vocal minúscula |
| `&Atilde;&shy;` | `í` | Vocal minúscula |
| `&Atilde;&sup3;` | `ó` | Vocal minúscula |
| `&Atilde;&ordm;` | `ú` | Vocal minúscula |
| `&Atilde;&plusmn;` | `ñ` | Letra eñe |
| `&Atilde;&#129;` | `Á` | Vocal mayúscula |
| `&Atilde;&#137;` | `É` | Vocal mayúscula |
| `&Atilde;&#141;` | `Í` | Vocal mayúscula |
| `&Atilde; A` | `Í` | Anomalía de Windows (Capa 7) |
| `&Atilde;&#147;` | `Ó` | Vocal mayúscula |
| `&Atilde;&#154;` | `Ú` | Vocal mayúscula |
| `&Atilde;&#145;` | `Ñ` | Letra Eñe mayúscula |
| `&Atilde;&#156;` | `Ü` | Diéresis mayúscula |
| `&Acirc;&iquest;` | `¿` | Interrogación de apertura |
| `&Acirc;&iexcl;` | `¡` | Exclamación de apertura |
| `&acirc;&#128;&#156;` | `"` | Comilla tipográfica doble izq. |
| `&acirc;&#128;&#157;` | `"` | Comilla tipográfica doble der. |
| `&acirc;&#128;&#152;` | `'` | Comilla tipográfica simple izq. |
| `&acirc;&#128;&#153;` | `'` | Comilla tipográfica simple der. |
| `&acirc;&#128;&#148;` | `—` | Raya / Em dash |
| `&acirc;&#128;&#147;` | `–` | Guion / En dash |
| `&acirc;&#128;&#162;` | `•` | Viñeta / Bullet |
| `&acirc;&#128;&#166;` | `…` | Puntos suspensivos |
| `&iuml;&raquo;&iquest;` | *(Destruido)* | BOM Fantasma (`\uFEFF`) en medio del código |
| `&eth;&#159;...` | *(Restaurado)* | Heurística de Emojis truncados |
| `\u00A0` (NBSP) | ` ` (Espacio) | Espacio no separable (StackOverflow/Web) |
| `\u202A` a `\u202E` | *(Destruido)* | Ataques "Trojan Source" (BiDi Overrides) |
| `CRLF` | `LF` | Aplanadora POSIX (Windows -> Unix) |

### 3. El Erradicador de Producción (Motor AST)
Purgado inteligente de sentencias `console.log`, `debugger;` y bloques de `// TODO:`. Impulsado por `@babel/parser`, el motor analiza el Abstract Syntax Tree (AST) asegurando un purgado absoluto sin afectar comentarios ni formateo de código.


### 5. Hyper-Scale Optimization (Zero Friction)
The CLI is architected not to choke. It employs a heuristic filter that bypasses the mathematical parser if the code is clean, and reduces IPC (Inter-Process Communication) friction by 99% by sending files in mathematical blocks to the Worker Threads.

### 4. Multi-Threading Físico (Worker Pool)
Arquitectura asíncrona sobre `piscina`. El escaneo se distribuye sobre los núcleos físicos del procesador, reduciendo el cuello de botella I/O en repositorios de hiper-escala.

## ⚖️ Dual Licensing (Open Source & Enterprise)

**AUM-IC Sanitize** operates under a strategic Dual Licensing model:

1. **Community Edition (AGPL-3.0):** 100% free for personal use, freelancers, students, and Open Source projects. You are free to audit and sanitize your code without restrictions.
2. **Commercial License (Enterprise):** If your corporation or bank has strict *Compliance* policies that forbid the use of Copyleft licenses (AGPL) to avoid open-sourcing closed IP, **you must acquire a Private Commercial License**. This license exempts you from open-source clauses and shields your intellectual property.

To acquire commercial protection, contact the architecture desk at **[ingcrea.com](https://ingcrea.com)**.


---
*Created by Ingeniería Creativa under the AUM-IC 7:2026 Standard*
