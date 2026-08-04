# claude-02-negocio.md

# Reglas de Negocio y Requisitos Funcionales
## Sistema Inteligente para la Detección Temprana del Riesgo de Abandono Escolar

Versión: 1.0

---

# Objetivo

Este documento define las reglas de negocio oficiales del sistema.

Todas las funcionalidades implementadas por el backend (NestJS), frontend (Angular) y base de datos (PostgreSQL) deberán respetar estas reglas.

No modificar ninguna regla sin actualizar este documento.

---

# Objetivo del MVP

El sistema permitirá a un centro educativo registrar información académica y psicopedagógica de los estudiantes para calcular automáticamente el porcentaje de riesgo de abandono escolar.

El sistema NO pretende reemplazar al orientador.

El porcentaje calculado representa un indicador de apoyo para la toma de decisiones.

---

# Alcance del MVP

El MVP incluirá únicamente:

- Login
- Gestión de estudiantes
- Gestión de cursos
- Gestión de asignaturas
- Registro de actividades
- Registro de calificaciones
- Registro de asistencia
- Seguimiento psicopedagógico
- Dashboard
- Cálculo automático del riesgo

No implementar:

- Reportes PDF
- Exportación Excel
- Machine Learning
- Notificaciones por correo
- Aplicación móvil
- API pública

Estas funcionalidades quedan como futuras versiones.

---

# Actores del Sistema

## Administrador

Responsabilidades

- Administrar centros educativos.
- Administrar usuarios.
- Administrar roles.
- Configurar el sistema.

Puede acceder a todos los módulos.

---

## Registro

Responsabilidades

Registrar:

- estudiantes
- inscripciones
- cambios de curso
- actualización de datos personales

No puede:

- registrar calificaciones
- registrar asistencia
- modificar riesgo
- acceder al seguimiento psicopedagógico

---

## Director

Puede consultar:

- dashboard
- estudiantes
- cursos
- asistencia
- calificaciones
- riesgo

No puede visualizar observaciones privadas del orientador.

---

## Docente

Puede registrar únicamente:

- actividades
- calificaciones
- asistencia

Solo sobre los cursos que tenga asignados.

Nunca podrá editar información de otros docentes.

---

## Orientador

Puede:

- consultar riesgo
- registrar seguimiento
- programar próxima cita
- modificar estado del seguimiento
- aplicar ajuste profesional al riesgo

No puede modificar:

- calificaciones
- asistencia
- actividades

---

# Flujo General del Sistema

```text
Inicio de sesión

↓

Dashboard

↓

Docente registra información

↓

AcademicEngine

↓

Indicadores Académicos

↓

RiskEngine

↓

Nuevo porcentaje

↓

Dashboard actualizado

↓

Orientador interviene

↓

Historial de seguimiento
```

---

# Gestión de Estudiantes

Cada estudiante pertenece obligatoriamente a:

- un centro educativo
- un curso

Información mínima obligatoria

- matrícula
- nombres
- apellidos
- sexo
- fecha de nacimiento
- curso

La matrícula debe ser única dentro del sistema.

---

# Gestión Académica

El sistema NO almacenará únicamente notas finales.

El docente registrará actividades de evaluación durante todo el período.

Ejemplo

```text
Práctica

10 %

Tarea

15 %

Examen

30 %

Proyecto

20 %

Exposición

25 %
```

Cada actividad posee un peso.

La suma de todas las actividades del período deberá ser exactamente:

100 %

No permitir guardar actividades cuyo peso acumulado exceda el 100 %.

---

# Competencias

Cada asignatura evalúa tres competencias oficiales.

Competencia 1

Comunicativa

Competencia 2

Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Científica y Tecnológica

Competencia 3

Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud

Cada actividad deberá asociarse a una competencia.

---

# AcademicEngine

Este motor calcula automáticamente:

- promedio por actividad
- promedio por competencia
- promedio por período
- promedio del área
- asistencia anual
- situación académica

Nunca calcula riesgo.

---

# Cálculo del Promedio

El sistema utilizará promedio ponderado.

Ejemplo

```text
Actividad A

20 %

Nota

90

Resultado

18

Actividad B

30 %

Nota

80

Resultado

24

Actividad C

50 %

Nota

100

Resultado

50

Total

92
```

Todo cálculo deberá realizarse automáticamente.

Nunca solicitar al usuario introducir promedios manualmente.

---

# Asistencia

El docente registrará diariamente.

Información

- presente
- ausente
- tardanza

El sistema calculará automáticamente:

- porcentaje de asistencia
- porcentaje de ausencias

Nunca solicitar porcentajes manuales.

---

# Seguimiento Psicopedagógico

El orientador podrá registrar

- fecha
- motivo
- observaciones
- acciones realizadas
- próxima cita
- estado

Las observaciones serán privadas.

Solo el orientador podrá leerlas.

---

# Ajuste Profesional

El orientador podrá aplicar un ajuste al riesgo.

Ejemplo

```text
Sistema

72 %

Orientador

+8 %

Resultado

80 %
```

El historial deberá conservar:

- riesgo original
- ajuste aplicado
- riesgo final
- usuario
- fecha

Nunca sobrescribir información histórica.

---

# RiskEngine

El motor utilizará reglas de negocio.

Variables

Promedio académico

35 %

Asistencia

30 %

Bajo rendimiento por asignatura

15 %

Incidentes disciplinarios

10 %

Ajuste profesional

10 %

Total

100 %

---

# Clasificación del Riesgo

0 - 49 %

RIESGO BAJO

Color

Verde

---

50 - 79 %

RIESGO MEDIO

Color

Amarillo

---

80 - 100 %

RIESGO ALTO

Color

Rojo

---

# Dashboard

Mostrar

Cantidad total de estudiantes

↓

Cantidad por nivel de riesgo

↓

Distribución por sexo

↓

Distribución por curso

↓

Estudiantes con mayor riesgo

↓

Últimos seguimientos registrados

↓

Alertas pendientes

---

# Historial

El sistema nunca eliminará:

- seguimientos
- cambios de riesgo
- calificaciones
- actividades

Solo podrá desactivar registros cuando corresponda.

---

# Reglas de Integridad

No permitir:

Eliminar curso con estudiantes.

Eliminar asignatura con actividades.

Eliminar estudiante con historial.

Eliminar usuario con registros asociados.

---

# Restricciones

Un estudiante pertenece a un único curso.

Un curso pertenece a un único centro.

Un docente puede impartir varias asignaturas.

Una asignatura puede impartirse en varios cursos.

Una actividad pertenece a una sola asignación docente.

Una calificación pertenece a una actividad y un estudiante.

---

# Casos de Uso Críticos

Caso 1

Registrar actividad.

Resultado esperado

Actividad creada.

---

Caso 2

Registrar calificación.

Resultado esperado

AcademicEngine recalcula automáticamente.

---

Caso 3

Registrar asistencia.

Resultado esperado

Nuevo porcentaje de asistencia.

---

Caso 4

Actualizar indicadores.

Resultado esperado

RiskEngine recalcula porcentaje.

---

Caso 5

Registrar seguimiento.

Resultado esperado

Historial actualizado.

---

# Reglas del Dashboard

Toda la información deberá obtenerse en tiempo real.

No almacenar estadísticas.

Calcular mediante consultas agregadas.

---

# Reglas para IA

Nunca calcular información en Angular.

Toda regla de negocio pertenece al backend.

Angular solo muestra información.

NestJS ejecuta todas las reglas.

PostgreSQL únicamente almacena datos.

No duplicar cálculos.

No almacenar datos derivados si pueden calcularse nuevamente.

Utilizar transacciones para operaciones críticas.

Registrar auditoría cuando cambie el riesgo.

Mantener todas las reglas encapsuladas dentro de:

AcademicEngine

RiskEngine

Nunca distribuir lógica entre controladores.

---

# Preparación para Machine Learning

El sistema deberá almacenar suficiente información para entrenar un modelo en el futuro.

Guardar:

- historial académico
- historial de asistencia
- historial disciplinario
- historial psicopedagógico
- evolución del riesgo

No implementar modelos predictivos en esta versión.

---

# Resultado esperado

El MVP deberá permitir:

✔ Gestión multicentro.

✔ Gestión de usuarios por roles.

✔ Registro continuo de actividades.

✔ Registro de calificaciones ponderadas.

✔ Registro diario de asistencia.

✔ Seguimiento psicopedagógico privado.

✔ Cálculo automático del rendimiento académico.

✔ Cálculo automático del riesgo de abandono.

✔ Dashboard institucional con indicadores en tiempo real.

✔ Historial completo de cambios y seguimiento.

El sistema debe estar preparado para evolucionar hacia una plataforma inteligente basada en aprendizaje automático sin requerir cambios estructurales en la arquitectura ni en el modelo de datos.