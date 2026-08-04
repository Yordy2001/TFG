# claude-01-arquitectura.md

# Arquitectura Técnica del MVP
## Sistema Inteligente para la Detección Temprana del Riesgo de Abandono Escolar

Versión: 1.0

---

# Objetivo

Este documento define la arquitectura técnica oficial del proyecto y servirá como contexto para cualquier IA encargada del desarrollo del sistema.

Todas las decisiones descritas aquí deben respetarse durante la implementación.

No modificar la arquitectura sin actualizar previamente este documento.

---

# Objetivo del Sistema

Desarrollar una plataforma web que permita a los centros educativos registrar información académica de los estudiantes y calcular automáticamente el riesgo de abandono escolar mediante reglas de negocio.

El sistema corresponde a un MVP (Minimum Viable Product), por lo tanto solamente implementará las funcionalidades esenciales.

No desarrollar funcionalidades fuera del alcance definido.

---

# Tecnologías Oficiales

## Frontend

Framework

- Angular 20+

Lenguaje

- TypeScript

Estilos

- Tailwind CSS
- Angular Material

Estado

- Angular Signals
- RxJS únicamente cuando sea necesario

Formularios

- Reactive Forms

Routing

- Angular Router

Autenticación

- JWT

Gráficas

- ng-apexcharts

Iconos

- Heroicons

Cliente HTTP

- HttpClient

Testing

- Jasmine
- Karma

---

## Backend

Runtime

- Node.js LTS

Framework

- NestJS

Lenguaje

- TypeScript

ORM

- Prisma ORM

Autenticación

- JWT

Hash

- bcrypt

Validaciones

- class-validator
- class-transformer

Documentación API

- Swagger

Logs

- Pino

Testing

- Jest

---

## Base de Datos

Motor

- PostgreSQL 16+

Migraciones

- Prisma Migrate

Seed

- Prisma Seed

UUID

- UUID v4

Timezone

UTC

---

# Arquitectura General

El sistema utilizará una arquitectura multicapa.

```text
Angular

↓

REST API

↓

NestJS

↓

Services

↓

Repositories (Prisma)

↓

PostgreSQL
```

Nunca acceder directamente desde los controladores hacia Prisma.

Toda consulta deberá pasar por:

Controller

↓

Service

↓

Repository

↓

Database

---

# Arquitectura del Frontend

El frontend deberá organizarse mediante Feature Modules.

```text
src/

app/

core/

shared/

layout/

auth/

dashboard/

students/

courses/

subjects/

evaluations/

attendance/

risk/

follow-up/

users/

settings/
```

---

# Responsabilidad de cada carpeta

## core

Contendrá únicamente componentes globales.

Ejemplo

- Guards
- Interceptors
- Layout principal
- Servicios globales

---

## shared

Componentes reutilizables.

Ejemplo

Buttons

Inputs

Tables

Dialogs

Cards

Badges

Paginator

Loader

---

## auth

Todo lo relacionado con autenticación.

- Login
- Logout
- Recuperación futura

---

## dashboard

Panel principal.

Indicadores.

Gráficas.

Estadísticas.

---

## students

CRUD completo de estudiantes.

---

## courses

Gestión de cursos.

---

## evaluations

Registro académico.

Actividades.

Calificaciones.

Competencias.

---

## attendance

Registro diario de asistencia.

---

## follow-up

Seguimiento psicopedagógico.

Solo accesible para Orientador.

---

## risk

Visualización del porcentaje de riesgo.

Semáforo.

Historial.

---

## users

Administración de usuarios.

---

# Arquitectura Backend

Se utilizará arquitectura modular propia de NestJS.

```text
src/

modules/

auth/

users/

roles/

schools/

courses/

students/

subjects/

evaluations/

attendance/

follow-up/

risk/

dashboard/

common/

config/

prisma/

main.ts
```

Cada módulo deberá contener:

```text
controller

service

repository

dto

entities

guards

decorators

interfaces
```

---

# Principios SOLID

Todo el backend debe respetar:

S

Responsabilidad única.

Cada clase hace una sola cosa.

O

Abierto para extensión.

Cerrado para modificación.

L

Sustitución de Liskov.

I

Interfaces pequeñas.

D

Inyección de dependencias.

NestJS ya proporciona Dependency Injection.

---

# Patrón Repository

Nunca utilizar Prisma directamente desde Services.

Incorrecto

```ts
this.prisma.student.findMany()
```

Correcto

```text
Controller

↓

StudentService

↓

StudentRepository

↓

Prisma
```

---

# Patrón Service

Los Services contienen únicamente lógica de negocio.

Nunca SQL.

Nunca HTTP.

Nunca UI.

---

# Motores del Sistema

Existen dos motores independientes.

## AcademicEngine

Responsable de:

- promedio
- competencias
- asistencia
- recuperación
- promoción

No calcula riesgo.

---

## RiskEngine

Responsable de:

- riesgo

- porcentaje

- clasificación

- semáforo

No calcula promedios.

Nunca mezclar ambos motores.

---

# Flujo General

```text
Login

↓

Dashboard

↓

Docente registra

↓

Calificaciones

↓

AcademicEngine

↓

Indicadores

↓

RiskEngine

↓

Riesgo

↓

Dashboard actualizado
```

---

# Arquitectura Multicentro

Todas las entidades pertenecen a un Centro Educativo.

Nunca realizar consultas sin filtrar por centro.

Ejemplo

Incorrecto

```sql
SELECT * FROM estudiante;
```

Correcto

```sql
SELECT *

FROM estudiante

WHERE centro_id = ?
```

Todos los módulos deberán respetar este aislamiento.

---

# Roles Oficiales

Administrador

Control total.

---

Registro

Gestiona estudiantes.

No registra notas.

---

Director

Consulta toda la información.

No modifica seguimiento.

---

Docente

Registra:

- actividades

- asistencia

- calificaciones

---

Orientador

Accede únicamente a:

seguimiento

riesgo

observaciones

---

# Arquitectura REST

Todos los endpoints deberán utilizar:

```text
/api/v1/
```

Ejemplo

```
/api/v1/auth

/api/v1/students

/api/v1/risk

/api/v1/evaluations
```

Versionar desde el inicio.

---

# Convenciones

URLs

plural

Correcto

/students

Incorrecto

/student

---

Métodos

GET

POST

PUT

PATCH

DELETE

---

Responses

Siempre JSON.

Ejemplo

```json
{
  "success": true,
  "message": "Student created",
  "data": {}
}
```

---

Errores

Formato único.

```json
{
  "success": false,
  "status": 400,
  "message": "Validation error",
  "errors": []
}
```

---

# Estrategia de Desarrollo

Orden obligatorio.

1 Login

↓

2 Roles

↓

3 Centro educativo

↓

4 Usuarios

↓

5 Cursos

↓

6 Estudiantes

↓

7 Asignaturas

↓

8 Actividades

↓

9 Calificaciones

↓

10 AcademicEngine

↓

11 RiskEngine

↓

12 Dashboard

↓

13 Seguimiento

---

# Reglas para IA

Siempre generar código limpio.

No duplicar lógica.

No generar consultas SQL manuales.

Utilizar Prisma.

Utilizar DTO.

Utilizar ValidationPipe.

Utilizar Guards.

Utilizar Repository.

Aplicar principios SOLID.

Aplicar Clean Architecture cuando sea posible.

Mantener tipado estricto de TypeScript.

No utilizar `any`.

No generar código obsoleto.

Utilizar Angular Signals en lugar de patrones antiguos cuando sea posible.

---

# Escalabilidad

Aunque el sistema corresponde a un MVP, deberá quedar preparado para:

- Machine Learning
- Notificaciones por correo
- API externa del MINERD
- Aplicación móvil
- Multiidioma
- Auditoría completa
- Reportes PDF
- Exportación Excel

Estas funcionalidades no deben implementarse ahora, pero la arquitectura no debe impedir su incorporación futura.

---

# Resultado esperado

Al finalizar el desarrollo, el sistema deberá proporcionar:

- Autenticación segura por roles.
- Gestión multicentro.
- Registro académico conforme al modelo de evaluación.
- Registro de asistencia.
- Seguimiento psicopedagógico confidencial.
- Cálculo automático del rendimiento académico.
- Cálculo automático del riesgo de abandono.
- Dashboard con indicadores y semáforo de riesgo.
- API REST documentada con Swagger.
- Base de datos normalizada y preparada para crecimiento.
- Código modular, mantenible y alineado con buenas prácticas de ingeniería de software.