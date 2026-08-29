# GuardianEDU

Sistema inteligente para la detección temprana del riesgo de abandono escolar. Permite a un centro educativo registrar información académica, de asistencia y psicopedagógica de sus estudiantes, y calcula automáticamente un porcentaje de riesgo de abandono para apoyar la toma de decisiones del cuerpo docente y de orientación.

> Proyecto monográfico universitario. MVP centrado en las funcionalidades esenciales del flujo académico y de riesgo.

## Contenido

- [¿Qué hace el sistema?](#qué-hace-el-sistema)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos previos](#requisitos-previos)
- [Cómo levantar el proyecto](#cómo-levantar-el-proyecto)
- [Scripts disponibles](#scripts-disponibles)
- [Documentación](#documentación)

## Qué hace el sistema

- Gestión multicentro de estudiantes, cursos y asignaturas.
- Registro continuo de actividades de evaluación y calificaciones ponderadas (nunca notas finales sueltas).
- Registro diario de asistencia con cálculo automático de porcentajes.
- Seguimiento psicopedagógico privado a cargo del rol Orientador.
- Dos motores de negocio independientes:
  - **AcademicEngine**: promedios, competencias, asistencia y situación académica.
  - **RiskEngine**: cálculo del porcentaje de riesgo de abandono y su clasificación (bajo / medio / alto).
- Dashboard institucional con indicadores en tiempo real (sin datos precalculados).
- Control de acceso por roles: Administrador, Registro, Director, Docente y Orientador.

## Arquitectura

Arquitectura multicapa clásica, con el backend como único responsable de las reglas de negocio:

```
Angular (SPA)
   ↓ REST API (/api/v1)
NestJS Controllers
   ↓
Services (reglas de negocio)
   ↓
Repositories
   ↓
Prisma ORM
   ↓
PostgreSQL
```

El frontend nunca calcula reglas de negocio; solo consume y muestra datos. Toda entidad pertenece a un centro educativo (aislamiento multicentro). Detalle completo en [docs/claude-01-arquitectura.md](docs/claude-01-arquitectura.md).

## Tecnologías

**Frontend**
- Angular 20 + TypeScript
- Angular Material + Tailwind CSS
- Angular Signals / Reactive Forms / Angular Router
- ng-apexcharts
- Jasmine + Karma (testing)

**Backend**
- Node.js + NestJS + TypeScript
- Prisma ORM
- JWT (autenticación) + bcrypt (hash de contraseñas)
- class-validator / class-transformer
- Swagger (documentación de API)
- Pino (logging)
- Jest (testing)

**Base de datos**
- PostgreSQL 16
- Prisma Migrate + Prisma Seed
- UUID v4, timezone UTC

**Infraestructura**
- Docker Compose (PostgreSQL)

## Estructura del repositorio

```
app/
├── backend/          # API REST (NestJS + Prisma)
├── frontend/          # SPA (Angular)
├── docs/              # Documentación de arquitectura, negocio, BD y seguridad
└── docker-compose.yml # Servicio de PostgreSQL
```

## Requisitos previos

- Node.js LTS (18+)
- npm
- Docker y Docker Compose (para levantar PostgreSQL)
- Angular CLI (`npm i -g @angular/cli`) opcional, ya está como devDependency del frontend

## Cómo levantar el proyecto

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd app
```

### 2. Levantar la base de datos

```bash
docker compose up -d
```

Esto inicia PostgreSQL 16 en `localhost:5432` con las credenciales por defecto (`guardianedu` / `guardianedu`). Puedes sobrescribirlas con las variables de entorno `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_PORT`.

### 3. Backend

```bash
cd backend
npm install
```

Crea un archivo `.env` (puedes basarte en `.env.example`):

```env
DATABASE_URL="postgresql://guardianedu:guardianedu@localhost:5432/guardianedu?schema=public"
PORT=3000
CORS_ORIGIN=http://localhost:4200
JWT_SECRET=change-me
```

Ejecuta las migraciones y (opcionalmente) el seed:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Levanta el servidor en modo desarrollo:

```bash
npm run start:dev
```

La API queda disponible en `http://localhost:3000/api/v1` y la documentación Swagger en `http://localhost:3000/api/docs`.

### 4. Frontend

```bash
cd frontend
npm install
npm start
```

La aplicación queda disponible en `http://localhost:4200`.

## Scripts disponibles

**Backend** (`backend/`)

| Script | Descripción |
|---|---|
| `npm run start:dev` | Levanta la API en modo watch |
| `npm run build` | Compila el proyecto |
| `npm run start:prod` | Ejecuta la build compilada |
| `npm run prisma:generate` | Genera el cliente de Prisma |
| `npm run prisma:migrate` | Aplica migraciones en desarrollo |
| `npm run prisma:seed` | Ejecuta el seed de la base de datos |
| `npm test` / `npm run test:e2e` | Pruebas unitarias / end-to-end |
| `npm run lint` | Linter con autofix |

**Frontend** (`frontend/`)

| Script | Descripción |
|---|---|
| `npm start` | Levanta la app con `ng serve` |
| `npm run build` | Build de producción |
| `npm run watch` | Build en modo watch (desarrollo) |
| `npm test` | Pruebas unitarias (Karma/Jasmine) |

## Documentación

Documentación técnica y de negocio ampliada en [docs/](docs/):

- [Arquitectura técnica](docs/claude-01-arquitectura.md)
- [Reglas de negocio y requisitos funcionales](docs/claude-02-negocio.md)
- [Modelo de base de datos](docs/claude-03-database.md)
- [Seguridad](docs/claude-04-security.md)
- [Backlog](docs/claude-06-backlog.md)
