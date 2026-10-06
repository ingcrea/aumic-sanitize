# AUM-IC SANITIZE: Registro de Decisiones Arquitectónicas (ADR)

🌐 Navegación: 🇺🇸 [Read in English](MANIFEST.md) | 🏠 [Volver al Inicio](README.es.md)

![Standard AUM-IC 7:2026](https://img.shields.io/badge/Standard-AUM--IC_7%3A2026-blue) ![nature Clean Architecture Standard](https://img.shields.io/badge/nature-Clean_Architecture_Standard-00bfa5) ![0 CVE Vulnerabilities](https://img.shields.io/badge/Vulnerabilities-0_CVE-success)

Documento formal para el registro del diseño estructural del CLI. Este manifiesto detalla la lógica arquitectónica implementada para garantizar el mantenimiento a largo plazo y la alineación con los estándares operativos de Ingeniería Creativa.

---

## 1. Registro de Modificaciones (aumic-history.json)
- **Contexto:** La ejecución de herramientas de modificación de texto sin un log de recuperación es un riesgo crítico en repositorios empresariales.
- **Decisión:** Implementación de un sistema de instantáneas (snapshot). El CLI almacena el estado previo de los archivos modificados, proveyendo un mecanismo nativo de recuperación (Rollback) por transacción.

## 2. Exclusión de Assets Binarios (Short-Circuit)
- **Contexto:** Procesar archivos compilados o media mediante rutinas de validación de texto resulta en la corrupción del binario y un consumo excesivo de memoria RAM.
- **Decisión:** Inyección de una barrera de validación en la capa de indexación. Las extensiones de archivos compilados son excluidas antes del acceso al disco.

## 3. Optimización de Integración Continua (Delta Scan)
- **Contexto:** La revisión exhaustiva de un repositorio histórico completo ralentiza el flujo de despliegue local.
- **Decisión:** Habilitación de un modo diferencial (`--delta`) vinculado al estado de control de versiones de Git, procesando exclusivamente los archivos marcados para commit (Staging).

## 4. Clasificador Tecnológico (LanguageProfiler)
- **Contexto:** Un enfoque genérico para la sanitización genera conflictos sintácticos entre distintos lenguajes de programación.
- **Decisión:** Creación del módulo `LanguageProfiler.ts` con soporte para 22 perfiles técnicos. Asigna reglas formales de procesamiento según las convenciones de cada extensión (p.ej., desactivando reglas tipográficas en SQL y bases de datos `.csv`).

## 5. Arquitectura Multi-Pipeline (AST / StringRegex / Global)
- **Decisión:** 
  - **AST (Babel):** Implementado en el ecosistema JS/TS para manipulación segura de nodos literales mediante `MagicString.overwrite()`.
  - **StringRegex:** Aplicado a lenguajes tradicionales (PHP, C#, Java) enfocando la revisión exclusivamente en cadenas de texto.
  - **Global:** Para formatos declarativos (CSS, YAML, CSV) y texto plano bruto.

## 6. Matrices de Resolución de Codificación (MojibakeEngine)
- **Contexto:** La corrección global de caracteres (Mojibake) provocaba mutaciones no deseadas en formatos que admiten entidades HTML (ej. JSON).
- **Decisión:** Desarrollo del motor `MojibakeEngine`, el cual categoriza la corrupción en vectores específicos y ejecuta una corrección jerárquica basada en un análisis de densidad (Scoring), restringiendo la resolución de entidades a entornos web (PHP y MARKUP).

## 7. Protección de Archivos Minificados
- **Decisión:** Implementación de heurística técnica (validación de nomenclatura y ratio de caracteres). La confirmación de minificación inactiva políticas invasivas para asegurar la integridad estructural de los bundles.

## 8. Escalamiento de Hilos (Worker Threads)
- **Decisión:** Adopción de la librería `piscina` para la distribución nativa de tareas computacionales en arquitecturas de múltiples núcleos, reduciendo los cuellos de botella por operaciones de I/O masivas.
