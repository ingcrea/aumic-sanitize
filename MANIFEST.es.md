# MANIFEST (Decisiones de Arquitectura y Evolución Forense)

🌐 Navegación: 🇺🇸 [Read in English](MANIFEST.md) | 🏠 [Volver al Inicio](README.es.md)

![Standard AUM-IC 7](https://img.shields.io/badge/Standard-AUM--IC_7-blue) ![nature Clean Architecture Standard](https://img.shields.io/badge/nature-Clean_Architecture_Standard-00bfa5)


Este manifiesto documenta las decisiones de diseño arquitectónico y la evolución estructural de **AUM-IC Sanitize**.

## 1. Inteligencia Forense y Transparencia (aumic-history.json)
*   **Problema:** Operar un escáner masivo sin un log centralizado es una caja negra inaceptable.
*   **Resolución:** Se inyectó un motor de estado que capta la entropía de los archivos antes de su alteración, permitiendo inspección y reversión algorítmica perfecta.

## 2. Targeting y Restauración Quirúrgica (Rollback)
*   **Resolución:** La arquitectura paramétrica (`[target]`) aísla la carga de escaneo o de rollback (`restore`) a la carpeta o archivo exacto sin afectar el entorno periférico.

## 3. La Paradoja de Automutilación (Inmunidad Matemática)
*   **Resolución:** Se purgaron las cadenas estáticas usando Blindaje Unicode (Hexadecimales) en el código y Entidades HTML puras en la documentación, permitiendo al CLI auditarse a sí mismo.

## 4. Anomalías Tipográficas y Vulnerabilidades (Capa 7)
*   **Resolución:** Destrucción incondicional de control BiDi (Trojan Source) y BOM fantasma (`&iuml;&raquo;&iquest;`).

## 5. Erradicación Basada en AST (Precisión Matemática)
*   **Problema:** El uso de Regex para eliminar `console.log` provocaba falsos positivos si la sentencia estaba dentro de un string o comentario.
*   **Resolución:** Implementación de analizador léxico (`@babel/parser` + `magic-string`). El código se mapea a un AST y los nodos `CallExpression` se mutilan usando sus coordenadas exactas, logrando precisión quirúrgica.

## 6. Concurrencia Física (Worker Threads)
*   **Problema:** Node.js es single-thread, provocando estrangulamiento de I/O en repositorios de miles de archivos.
*   **Resolución:** Integración de un Worker Pool nativo (`piscina`) para balanceo de carga paralelo, dividiendo los Buffers matemáticos entre los núcleos físicos del CPU.

## 7. Escaneo Diferencial (Delta Scan)
*   **Resolución:** Acoplamiento directo con el CLI de `git` (`--delta`) para ignorar archivos estáticos y auditar exclusivamente nodos modificados o untracked, optimizando pipelines de CI/CD.

## 8. Optimización Heurística Pre-AST
*   **Problema:** Inicializar Babel AST por cada archivo JS/TS generaba un overhead inaceptable de CPU, incluso en archivos limpios.
*   **Resolución:** Inyección de un filtro rápido de string (`content.includes('console.')`). El motor solo invoca al parser matemático si existe una alta probabilidad de infección.

## 9. Reducción de Fricción IPC (Chunking)
*   **Problema:** Enviar 3,000 archivos uno por uno al Worker Pool generaba 3,000 mensajes cruzando la frontera de Node.js (IPC Friciton).
*   **Resolución:** Algoritmo de Lotes. El motor ahora particiona los arrays de archivos matemáticamente según la cantidad de núcleos físicos (`concurrency`) y envía un único gran mensaje por hilo, reduciendo la fricción IPC en un 99%.


---
*Creado por Ingeniería Creativa bajo el Estándar AUM-IC 7:2026*
