# claude-03-database.md

# Arquitectura de Base de Datos y Modelo del Dominio
## Sistema Inteligente para la Detección Temprana del Riesgo de Abandono Escolar

Versión: 1.0

---

# Objetivo

Este documento define la arquitectura de la base de datos utilizada por el sistema.

Debe servir como guía para:

- PostgreSQL
- Prisma ORM
- NestJS
- DBML
- Migraciones
- Seed de datos
- Relaciones entre entidades

El modelo aquí definido es el único autorizado para el MVP.

No crear tablas adicionales sin actualizar este documento.

---

# Arquitectura General

El sistema utiliza una base de datos relacional normalizada.

Motor:

- PostgreSQL 16+

ORM

- Prisma ORM

Modelo

- Code First utilizando Prisma Schema

Documentación

- DBML

Migraciones

- Prisma Migrate

---

# Principios del Modelo

El modelo debe cumplir:

✔ Tercera Forma Normal (3FN)

✔ Integridad referencial

✔ Baja redundancia

✔ Escalabilidad

✔ Arquitectura multicentro

✔ Auditoría

✔ Compatibilidad futura con IA

---

# Arquitectura Multicentro

Toda la información pertenece a un Centro Educativo.

Ningún usuario podrá acceder a información de otro centro.

La relación principal es:

```text
CentroEducativo

│

├── Usuarios

├── Cursos

├── Estudiantes

├── Asignaturas

├── Períodos Académicos

└── Configuración
```

Todas las consultas deberán filtrar siempre por:

```text
centro_id
```

---

# Organización del Dominio

El modelo se divide en seis módulos.

```text
Administración

Académico

Evaluación

Asistencia

Seguimiento

Riesgo
```

---

# Módulo Administración

Responsabilidad

Gestionar la institución.

Entidades

```text
CentroEducativo

Rol

Usuario
```

Relaciones

```text
CentroEducativo

1:N

Usuario

Rol

1:N

Usuario
```

---

# Módulo Académico

Responsabilidad

Representar la estructura académica.

Entidades

```text
Curso

Estudiante

Asignatura

Competencia

PeriodoAcademico

PeriodoEvaluativo

AsignacionDocente
```

Relaciones

```text
Curso

1:N

Estudiante

Asignatura

1:N

AsignacionDocente

Usuario (Docente)

1:N

AsignacionDocente
```

---

# Módulo Evaluación

Responsabilidad

Registrar todo el proceso académico.

Entidades

```text
ActividadEvaluacion

RegistroEvaluacion

ResultadoCompetenciaPeriodo

ResultadoArea

ObservacionPeriodo
```

Este módulo reemplaza el registro tradicional de notas finales.

Las notas finales siempre serán calculadas.

Nunca digitadas.

---

# Flujo Académico

```text
Asignatura

↓

Actividad

↓

Calificación

↓

AcademicEngine

↓

Resultado Competencia

↓

Resultado Área
```

---

# Módulo Asistencia

Responsabilidad

Registrar la asistencia diaria.

Entidad principal

```text
AsistenciaPeriodo
```

Campos importantes

- presente

- ausente

- tardanza

El porcentaje anual será calculado automáticamente.

---

# Módulo Seguimiento

Responsabilidad

Registrar el acompañamiento psicopedagógico.

Entidad

```text
SeguimientoOrientador
```

Información

- fecha

- motivo

- observaciones

- acciones

- próxima cita

- estado

Las observaciones son privadas.

---

# Módulo Riesgo

Responsabilidad

Almacenar el resultado del RiskEngine.

Entidades

```text
NivelRiesgo

Riesgo

HistorialRiesgo
```

Nunca eliminar registros históricos.

---

# Modelo del Dominio

```text
CentroEducativo

│

├── Usuario

│      └── Rol

│

├── Curso

│      └── Estudiante

│              ├── RegistroEvaluacion

│              ├── AsistenciaPeriodo

│              ├── SeguimientoOrientador

│              └── Riesgo

│

├── Asignatura

│      └── ActividadEvaluacion

│

└── PeriodoAcademico
```

Este modelo debe mantenerse igual al Diagrama de Clases aprobado.

---

# Entidades Oficiales

## CentroEducativo

Representa una institución educativa.

Datos

- código
- nombre
- teléfono
- distrito educativo
- regional
- provincia
- municipio
- director

---

## Rol

Controla permisos.

Valores iniciales

- Administrador

- Registro

- Director

- Docente

- Orientador

---

## Usuario

Representa cualquier persona autenticada.

Nunca crear tablas:

Administrador

Director

Docente

Orientador

Todos son Usuario + Rol.

---

## Curso

Representa una sección académica.

Ejemplo

```text
3ro A

4to B

5to C
```

---

## Estudiante

Representa al alumno.

Debe contener:

- matrícula

- nombres

- apellidos

- sexo

- fecha nacimiento

- curso

- centro

---

## Asignatura

Representa una materia.

Ejemplos

- Matemática

- Ciencias

- Lengua Española

---

## Competencia

Catálogo oficial.

Competencias

C1

Comunicativa

C2

Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Científica y Tecnológica

C3

Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud

---

## PeriodoAcademico

Representa un año escolar.

Ejemplo

2026-2027

---

## PeriodoEvaluativo

Catálogo.

Valores

P1

P2

P3

P4

---

## AsignacionDocente

Relaciona

Docente

↓

Curso

↓

Asignatura

↓

Periodo Académico

---

## ActividadEvaluacion

Representa una evaluación.

Ejemplos

- práctica

- proyecto

- examen

- exposición

- tarea

Campos

- nombre

- competencia

- porcentaje

- fecha

---

## RegistroEvaluacion

Representa la nota obtenida por un estudiante en una actividad.

No almacenar promedios.

---

## ResultadoCompetenciaPeriodo

Resultado calculado automáticamente.

No editable.

---

## ResultadoArea

Resultado final por asignatura.

Generado por AcademicEngine.

---

## ObservacionPeriodo

Observaciones cualitativas.

Una por período.

---

## AsistenciaPeriodo

Contiene

- presentes

- ausencias

- tardanzas

Los porcentajes son calculados automáticamente.

---

## SeguimientoOrientador

Contiene

- motivo

- observaciones

- acciones

- estado

- próxima cita

Visible únicamente para el orientador.

---

## Riesgo

Resultado actual.

Campos

- porcentaje

- nivel

- fecha cálculo

---

## HistorialRiesgo

Auditoría.

Cada cambio genera un nuevo registro.

Nunca actualizar.

Siempre insertar.

---

# Cardinalidades

CentroEducativo

1:N

Usuario

CentroEducativo

1:N

Curso

CentroEducativo

1:N

Estudiante

Curso

1:N

Estudiante

Asignatura

1:N

ActividadEvaluacion

ActividadEvaluacion

1:N

RegistroEvaluacion

Estudiante

1:N

RegistroEvaluacion

Estudiante

1:N

SeguimientoOrientador

Estudiante

1:N

HistorialRiesgo

---

# Claves Primarias

Todas las entidades principales utilizarán

UUID

Catálogos

SMALLINT

---

# Auditoría

Todas las tablas transaccionales deberán incluir

```text
created_at

updated_at
```

Opcional para futuras versiones

```text
deleted_at
```

No implementar Soft Delete en el MVP.

---

# Índices

Crear índices para

- matrícula

- correo

- código del centro

- curso

- asignatura

- docente

- estudiante

- fecha

No indexar columnas de baja selectividad.

---

# Integridad Referencial

No permitir

Eliminar estudiante con historial.

Eliminar curso con estudiantes.

Eliminar asignatura con actividades.

Eliminar docente con asignaciones.

Eliminar centro educativo con información relacionada.

---

# Convenciones

Tablas

snake_case

Campos

snake_case

PK

id

FK

tabla_id

Booleanos

activo

Eliminado

No usar prefijos

tbl_

cat_

sys_

---

# Prisma

Cada tabla deberá generar:

Model

Repository

DTO

Mapper (si aplica)

Service

Controller

No acceder a Prisma directamente desde los controladores.

---

# DBML

El archivo DBML deberá ser la representación exacta del modelo definido en este documento.

No deben existir diferencias entre:

- Prisma Schema
- DBML
- PostgreSQL
- Diagrama ERD

Los cuatro artefactos deben mantenerse sincronizados.

---

# Resultado esperado

La base de datos deberá permitir:

✔ Arquitectura multicentro.

✔ Gestión por roles.

✔ Registro completo del proceso académico.

✔ Registro diario de asistencia.

✔ Seguimiento psicopedagógico confidencial.

✔ Cálculo automático mediante AcademicEngine.

✔ Cálculo del riesgo mediante RiskEngine.

✔ Historial completo de modificaciones.

✔ Modelo normalizado en 3FN.

✔ Escalabilidad sin modificar la estructura principal del dominio.
