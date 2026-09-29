# Resumen de pruebas automatizadas

Fecha de ejecución: 2026-09-26
Entorno: Node.js v22.13.1 · PostgreSQL 16 (contenedor `guardianedu-postgres`)

Las salidas completas de cada ejecución están en esta misma carpeta:

- [`unit-coverage.txt`](./unit-coverage.txt) — pruebas unitarias con cobertura.
- [`e2e.txt`](./e2e.txt) — pruebas end-to-end contra la BD de desarrollo.
- [`npm-audit-backend.txt`](./npm-audit-backend.txt) / [`.json`](./npm-audit-backend.json) — auditoría de dependencias del backend.
- [`npm-audit-frontend.txt`](./npm-audit-frontend.txt) / [`.json`](./npm-audit-frontend.json) — auditoría de dependencias del frontend.

## 1. Pruebas unitarias (Jest, Prisma simulado)

Archivos:
- `backend/src/common/engines/risk-engine.service.spec.ts`
- `backend/src/common/engines/academic-engine.service.spec.ts`

| Métrica | Valor |
|---|---|
| Total de pruebas | 21 |
| Aprobadas | 21 |
| Fallidas | 0 |

Cobertura del motor de riesgo (`risk-engine.service.ts`): **100 % líneas, 100 % sentencias, 100 % funciones, 62.5 % ramas.**
Cobertura de `academic-engine.service.ts`: 75.86 % líneas (sin cubrir `promedioPonderadoAsignacion`, método no usado por el motor de riesgo).

### Casos de prueba (CP) del motor de riesgo

Los 14 casos solicitados coinciden exactamente con la salida del código actual (no se modificó ninguna regla, peso ni umbral):

| CP | Entrada | IRR sistema | Nivel | Resultado |
|---|---|---|---|---|
| CP-01 | 8×100, 0 % inasist., 0 inc. | 0 | Bajo | ✅ |
| CP-02 | 8×85, 5 %, 0 | 7 | Bajo | ✅ |
| CP-03 | 8×0, 100 %, 4 | 90 | Alto | ✅ |
| CP-04 | 4×30 y 4×70, 80 %, 0 | 49 | Bajo | ✅ |
| CP-05 | 4×26 y 4×70, 80 %, 0 | 50 | Medio | ✅ |
| CP-06 | 8×7, 80 %, 3 | 79 | Medio | ✅ |
| CP-07 | 8×5, 80 %, 3 | 80 | Alto | ✅ |
| CP-08 | 8×100, 0 %, 6 | 10 | Bajo | ✅ |
| CP-09 | 6 presentes, 3 tardanzas, 1 aus. justificada | inasistencia 0 % | — | ✅ |
| CP-10 | 8×100, 40 %, 0 | 12 | Bajo | ✅ |
| CP-11 | promedios 70 y 69, 0 %, 0 | 18 | Bajo | ✅ |
| CP-12 | 8×40, 60 %, 4, ajuste +20 | sistema 64 → final 84 | Alto | ✅ |
| CP-13 | CP-03 con ajuste +20 | final 100 (clamp) | Alto | ✅ |
| CP-14 | CP-02 con ajuste −20 | final 0 (clamp) | Bajo | ✅ |

## 2. Pruebas end-to-end (Jest + Supertest, BD real)

Archivo: `backend/test/app.e2e-spec.ts`

| Métrica | Valor |
|---|---|
| Total de pruebas | 6 |
| Aprobadas | 6 |
| Fallidas | 0 |

Casos: login válido (200) e inválido (401); DOCENTE denegado (403) en `GET /api/v1/follow-up/recent` y `POST /api/v1/risk/adjustment`; ORIENTADOR con ajuste fuera de rango → 400; registrar calificación (`POST /api/v1/evaluations/grades`) crea una fila en `historial_riesgo`.

### Corrección de configuración

`uuid@14` y `@nestjs/schedule@12` son paquetes **ESM puros** sin build CommonJS, lo que impedía compilar la prueba e2e bajo Jest. Se resolvió **solo con configuración de pruebas** (sin tocar el código de producción) mediante shims CommonJS mapeados en `test/jest-e2e.json` (`test/uuid-cjs-shim.js` y `test/nestjs-schedule-cjs-shim.js`).

## 3. Auditoría de dependencias (`npm audit`)

| Proyecto | Crítica | Alta | Moderada | Baja | Total |
|---|---|---|---|---|---|
| Backend | 0 | 8 | 13 | 0 | **21** |
| Frontend | 0 | 2 | 11 | 0 | **13** |

Paquetes con severidad alta — Backend: `@nestjs/platform-express`, `@nestjs/swagger`, `@prisma/config`, `deepmerge-ts`, `fast-uri`, `js-yaml`, `multer`, `prisma`. Frontend: `fast-uri`, `nanoid`.

No se detectaron vulnerabilidades críticas en ninguno de los dos proyectos.
