# AUM-IC Sanitize (Motor Forense Anti-Entropía)

🌐 Navegación: 🇺🇸 [Read in English](README.md) | 📜 [Manifiesto (ES)](MANIFEST.es.md) | 📖 [Bitácora](BITACORA.md)

![Standard AUM-IC 7:2026](https://img.shields.io/badge/Standard-AUM--IC_7%3A2026-blue) ![nature Clean Architecture Standard](https://img.shields.io/badge/nature-Clean_Architecture_Standard-00bfa5) ![License AGPL/Comercial](https://img.shields.io/badge/License-AGPL%2FComercial-orange) ![built by Ingeniería Creativa](https://img.shields.io/badge/built_by-Ingenier%C3%ADa_Creativa-yellow)

**AUM-IC Sanitize** es un CLI nativo y Git Hook de validación. No es un simple linter. Es un motor de rastreo forense a nivel de byte. Su función es purgar corrupción UTF-8 (Mojibake), secuencias de salto de línea mixtas, inyecciones de Trojan Source y rastros de depuración muertos antes de que toquen el código de producción.

## El Problema
El código muta al interactuar con distintos sistemas operativos, IDEs mal configurados y transferencias de red. Esto inyecta BOMs ocultos, rompe las tablas de codificación y acumula basura en los commits. El resultado: cuellos de botella en CI/CD y vulnerabilidades de inyección de código silenciosas.

## Uso y Ejecución

### 1. Panel Interactivo
Ejecución estándar. Despliega la interfaz principal:
```bash
aumic-sanitize
```

### 2. Targeting Explícito
Ejecución directa sobre rutas específicas (bypassea el menú interactivo). Soporta archivos puntuales o directorios completos:
```bash
aumic-sanitize scan src/components/
aumic-sanitize scan src/index.ts
```

### 3. Delta Scan (Integración Git)
Audita exclusivamente los archivos en estado de staging (el índice modificado de Git). Optimizado arquitectónicamente para inyectarse como pre-commit hook sin penalizar el tiempo de subida:
```bash
aumic-sanitize scan --delta
```

### 4. Git Hook (Sentinel Mode)
Ancla el motor directamente al ciclo de vida de tu repositorio local. Bloquea de manera dura y automática cualquier commit que contenga anomalías de entropía:
```bash
aumic-sanitize hook-install
```
