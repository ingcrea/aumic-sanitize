# AUM-IC SANITIZE: ADR (Architecture Decision Record)

🌐 Navegación: 🇺🇸 [Read in English](MANIFEST.md) | 🏠 [Volver al Inicio](README.es.md)

![Standard AUM-IC 7:2026](https://img.shields.io/badge/Standard-AUM--IC_7%3A2026-blue) ![nature Clean Architecture Standard](https://img.shields.io/badge/nature-Clean_Architecture_Standard-00bfa5)

Bitácora de decisiones arquitectónicas y diseño estructural del motor de sanitización. Cero especulación. Lógica documentada para garantizar el mantenimiento riguroso y la evolución del núcleo del CLI.

## 1. Persistencia Forense y Auditoría
*   **Contexto:** Un script destructivo sin un sistema de logs detallado es un riesgo inaceptable en monorepos de clientes.
*   **Decisión:** Se inyectó un motor de instantáneas de estado (`aumic-history.json`). El sistema mapea la entropía estructural antes de mutar cualquier byte, permitiendo un rollback exacto.

## 2. Eficiencia de Escaneo (Delta)
*   **Contexto:** Analizar un repositorio completo de miles de archivos en cada commit paraliza las pipelines de desarrollo.
*   **Decisión:** Arquitectura basada en *Targeting* y modo diferencial (`--delta`) anclado al índice local de Git. El motor solo lee y procesa los deltas modificados.

## 3. Prevención de Colisiones Base (Blindaje)
*   **Contexto:** Al escanear su propio código base, el CLI detectaba y borraba sus propias firmas algorítmicas de detección de malware y Mojibake (Automutilación).
*   **Decisión:** Refactorización de todos los vectores de búsqueda internos usando hexadecimales crudos y entidades HTML aisladas. El motor ignora su propio código fuente por defecto físico.

## 4. AST (Abstract Syntax Tree) vs Regex
*   **Contexto:** Usar expresiones regulares para cazar llamadas de `console.log` destruía cadenas de texto legítimas y generaba falsos positivos críticos.
*   **Decisión:** Sustitución de Regex por análisis léxico puro. Se implementó `@babel/parser` y `magic-string`. El motor mapea el código a un árbol AST y ejecuta una mutilación quirúrgica exclusivamente sobre los nodos `CallExpression` comprobados.

## 5. Escalabilidad Concurrente (Worker Threads)
*   **Contexto:** Node.js colapsa por inanición de I/O (Thread Starvation) al procesar archivos masivos de manera síncrona o asíncrona estándar en un solo hilo.
*   **Decisión:** Integración de un Worker Pool nativo (`piscina`). Se delega la carga computacional pesada directamente a los núcleos físicos del procesador, reduciendo los tiempos de barrido al mínimo teórico posible.
