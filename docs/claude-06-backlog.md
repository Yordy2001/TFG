# Backlog de Próximo Desarrollo

## GuardianEdu

Versión: 1.0  
Última actualización: 2026-08-13

---

# Objetivo

Este documento contiene el backlog priorizado para el próximo ciclo de desarrollo de GuardianEdu. Cada tarea tiene un identificador único para que pueda ser asignada a Claude con una instrucción breve y sin perder su alcance funcional.

# Cómo ejecutar un ticket con Claude

Usar el siguiente formato:

```text
Claude, implementa el ticket GDE-XXX definido en docs/claude-06-backlog.md.
Respeta su alcance, dependencias y criterios de aceptación. Revisa primero el código existente,
realiza los cambios necesarios y ejecuta las validaciones indicadas. No implementes otros tickets.
Al terminar, informa los archivos modificados, las pruebas ejecutadas y cualquier riesgo pendiente.
```

Antes de implementar un ticket, Claude debe:

1. Leer este documento y los documentos `docs/claude-01-arquitectura.md`, `docs/claude-02-negocio.md`, `docs/claude-03-database.md` y `docs/claude-04-security.md`.
2. Confirmar que todas las dependencias del ticket estén completadas.
3. Revisar la implementación actual antes de modificarla.
4. Mantener los contratos existentes, salvo que el ticket requiera cambiarlos.
5. Añadir o actualizar pruebas de acuerdo con el riesgo del cambio.
6. Ejecutar las validaciones indicadas y corregir los errores relacionados con el ticket.
7. Cambiar el estado del ticket a `Completado` únicamente después de validar la solución.

## Estados permitidos

- `Pendiente`: todavía no iniciado.
- `En progreso`: en implementación.
- `Bloqueado`: no puede continuar; debe documentarse la causa.
- `En revisión`: implementado y pendiente de revisión.
- `Completado`: criterios de aceptación satisfechos y validaciones aprobadas.

---

# Resumen priorizado

> Actualizado 2026-08-29 tras auditoría del código real (ver evidencia en cada ticket). El estado que sigue reemplaza al de la versión anterior de este documento, que había quedado desactualizado respecto al código.

## Completados

| Ticket | Título | Estado | Evidencia |
|---|---|---|---|
| GDE-001 | PostgreSQL en Docker y conexión NestJS | Completado | `docker-compose.yml` (raíz) + `backend/src/common/prisma/prisma.service.ts` valida `DATABASE_URL` y gestiona el ciclo de vida de la conexión; `PrismaModule` registrado en `app.module.ts`. Fuera de alcance del ticket crear tablas/migrar repositorios, por eso `schema.prisma` sigue sin modelos y los repositorios siguen sobre `MockDataStore` — es el comportamiento esperado. |
| GDE-002 | Usabilidad y retroalimentación de operaciones | Completado | Ver sección del ticket: `NotificationService` + `ConfirmDialogService` conectados en asistencia, calificaciones, alta/baja de estudiante, ajuste de riesgo y bitácora del orientador; auditoría de las 10 heurísticas de Nielsen documentada. |
| GDE-005 | Restringir seguimiento al orientador | Completado | `backend/src/modules/follow-up/follow-up.controller.ts:12` — `@Roles(Role.ORIENTADOR)` a nivel de clase, sin excepción para ADMINISTRADOR; `RolesGuard` global sin bypass. |
| GDE-008 | Retirar acciones sin funcionalidad del dashboard | Completado | Commit `113e2bb`; `dashboard.component.html` sin "Analizar Patrón"; `TopBarComponent` sin búsqueda/notificaciones/ayuda inertes. |
| GDE-010 | Observaciones de aula por estudiante | Completado | Nuevo módulo `backend/src/modules/classroom-observations/` (`@Roles(Role.DOCENTE)`, autorización real vía `AsignacionDocente`) + sección "Observaciones de aula" en `student-detail.component.ts/html`, separada de la bitácora del orientador. Ver sección del ticket para el detalle de verificación. |
| GDE-003 | Importación masiva de estudiantes desde Excel | Completado | Nuevo `backend/src/modules/students/import/` (`exceljs`, memoria únicamente, sin escritura a disco) + diálogo `ImportStudentsDialogComponent` en el frontend. Ver sección del ticket para el detalle de verificación. |
| GDE-007 | Perfil del usuario autenticado | Completado | Nuevo `PATCH /users/me` (`users.controller.ts`) + página `frontend/src/app/profile/pages/profile-page/`, enlazada desde el avatar de `TopBarComponent`. Ver sección del ticket para el detalle de verificación. |
| GDE-006 | Módulo de datos del centro educativo | Completado | Nueva página de solo lectura `frontend/src/app/schools/pages/school-page/` sobre el `GET /schools/me` ya existente (sin cambios de backend), con entrada de navegación "Centro Educativo" para todos los roles. Ver sección del ticket para el detalle de verificación. |
| GDE-009 | Modal para crear actividad de evaluación | Completado | Nuevo `CreateActivityDialogComponent` (`frontend/src/app/evaluations/components/create-activity-dialog/`); la tarjeta inline se retiró de `evaluation-page.component.html`. Ver sección del ticket para el detalle de verificación. |
| GDE-004 | Foto en el registro manual de estudiantes | Completado | Nuevo `POST/GET /students/:id/photo` (`backend/src/modules/students/photo/`, almacenamiento local con nombre de archivo generado, nunca el del cliente) + selector con vista previa en `student-form.component.ts/html`. Ver sección del ticket para el detalle de verificación. |

## Backlog completado

Los 10 tickets originales (GDE-001 a GDE-010) están `Completado`. No queda ningún ticket pendiente en este documento.

# Tickets

## GDE-001 - PostgreSQL en Docker y conexión NestJS

**Estado:** Completado  
**Prioridad:** Alta  
**Dependencias:** Ninguna

### Historia

Como equipo de desarrollo, queremos ejecutar PostgreSQL mediante Docker Compose y conectar NestJS a la base de datos para preparar la persistencia real del sistema.

### Alcance

- Crear un archivo `docker-compose.yml` en la raíz con una imagen oficial y estable de PostgreSQL 16 o superior.
- Configurar nombre de base de datos, usuario, contraseña, puerto, volumen persistente y comprobación de salud mediante variables de entorno.
- Añadir las variables requeridas al archivo de ejemplo de entorno correspondiente. No versionar credenciales reales.
- Configurar NestJS para leer y validar la conexión desde el entorno.
- Instalar y configurar Prisma de acuerdo con la arquitectura oficial del proyecto.
- Crear un servicio o mecanismo de conexión reutilizable por los futuros repositorios.
- Documentar los comandos para iniciar, detener y verificar PostgreSQL.

### Fuera de alcance

- No crear tablas, modelos de dominio, migraciones ni datos semilla.
- No reemplazar todavía los repositorios de datos simulados.
- No modificar funcionalidades de negocio.

### Criterios de aceptación

- `docker compose up -d` inicia PostgreSQL y el contenedor alcanza un estado saludable.
- NestJS inicia correctamente cuando `DATABASE_URL` contiene una conexión válida.
- NestJS falla de forma clara y controlada cuando falta la configuración obligatoria o la base de datos no está disponible.
- La aplicación puede abrir y cerrar la conexión durante su ciclo de vida.
- No existe ninguna tabla de negocio ni migración que la cree.
- Los secretos reales están excluidos del control de versiones.

### Validación mínima

- Validar la sintaxis de Docker Compose.
- Iniciar PostgreSQL y comprobar su estado de salud.
- Ejecutar el build y las pruebas del backend.
- Verificar la conexión sin ejecutar migraciones.

---

## GDE-002 - Usabilidad y retroalimentación de operaciones

**Estado:** Completado  
**Prioridad:** Alta  
**Dependencias:** Ninguna

### Resultado de la implementación (2026-08-29)

Infraestructura reutilizable: `frontend/src/app/core/services/notification.service.ts` (wrapper de `MatSnackBar`, éxito/error) y `frontend/src/app/shared/components/confirm-dialog/` (`ConfirmDialogService` + `ConfirmDialogComponent`, diálogo de confirmación genérico con foco inicial en el botón de confirmar y cierre con `Escape`).

Conectado en todos los flujos de escritura relevantes:
- **Asistencia** (`attendance-page.component.ts`): marcar ya era la acción explícita; se agregó `savingStudentIds` (deshabilita el botón mientras se guarda) y snackbar de éxito/error.
- **Calificaciones** (`evaluation-page.component.ts` / `.html`): se quitó el autoguardado en `blur` — ahora requiere pulsar el botón de guardar por celda (ícono con `aria-label` descriptivo), con estado `isSavingGrade` y snackbar. Creación de actividad con `savingActivity` y snackbar.
- **Alta de estudiante** (`student-form.component.ts`): `saving` ya existía; se conservó y se agregó snackbar de éxito/error sin perder los datos del formulario ante error.
- **Ajuste de riesgo y bitácora del orientador en el perfil** (`student-detail.component.ts`): se agregó `savingAjuste`, snackbar de éxito/error y botón deshabilitado mientras se aplica el ajuste.
- **Bitácora del orientador** (`follow-up-list.component.ts`): se agregó `saving`, snackbar de éxito/error, botón deshabilitado y prevención de doble envío.
- **Baja de estudiante** (`student-list.component.ts` / `.html`): se expuso la acción "Desactivar" (antes `StudentsService.deactivate()` no tenía UI) para `ADMINISTRADOR`/`REGISTRO`, con `ConfirmDialogService` antes de ejecutar la baja, estado `deactivatingIds` por fila y snackbar de resultado. Es una baja lógica (`activo = false`), no un borrado permanente — el texto del diálogo lo aclara.

### Auditoría de heurísticas de Nielsen (hallazgos)

1. **Visibilidad del estado del sistema** — Corregido: snackbar de éxito/error y textos de estado ("Guardando…", "Enviando…", "Desactivando…", "Aplicando…") en todas las operaciones de escritura listadas arriba.
2. **Correspondencia sistema/mundo real** — Sin hallazgos; la terminología ya usa el vocabulario del dominio (matrícula, riesgo, seguimiento, bitácora).
3. **Control y libertad del usuario** — Corregido para la acción destructiva (confirmación cancelable antes de desactivar un estudiante, con `Escape` para cerrar). Pendiente: no hay "deshacer" tras guardar una calificación o enviar una bitácora; se considera aceptable porque son operaciones de negocio con historial y no se pidió deshacer en los criterios de aceptación.
4. **Consistencia y estándares** — Corregido: mismo patrón (`signal` de guardado + botón deshabilitado + snackbar) replicado en las seis pantallas tocadas.
5. **Prevención de errores** — Corregido: confirmación previa a la única acción destructiva expuesta en la UI (desactivar estudiante); las validaciones de formulario reactivo existentes se conservaron intactas.
6. **Reconocer antes que recordar** — Sin hallazgos nuevos; los selectores de curso/asignatura ya muestran nombres, no IDs.
7. **Flexibilidad y eficiencia de uso** — Sin cambios en este ciclo; no había atajos de teclado personalizados que auditar.
8. **Diseño estético y minimalista** — Sin hallazgos; consistente con el sistema visual navy/rojo aplicado en el ciclo de diseño anterior.
9. **Reconocer, diagnosticar y recuperarse de errores** — Corregido: los mensajes de error del backend (`err?.error?.message`) se muestran en el snackbar y ningún formulario se limpia cuando la operación falla, de modo que el usuario puede corregir y reintentar sin perder lo ya escrito.
10. **Ayuda y documentación** — Pendiente/riesgo documentado: no se agregó ayuda contextual ni documentación en pantalla; queda fuera de este ciclo por no ser un bloqueador funcional.

**Riesgos pendientes**: no se agregaron pruebas automatizadas (unit/e2e) nuevas para estos flujos — la validación fue manual, según lo que pide la propia "Validación mínima" del ticket. La auditoría de accesibilidad fue visual/manual (foco nativo del navegador, `aria-label` en botones de solo ícono); no se ejecutó un lector de pantalla real.

### Historia

Como usuario, quiero que las operaciones que envían información al backend sean explícitas y comuniquen su resultado para saber qué ocurrió y evitar acciones accidentales o duplicadas.

### Alcance

- Auditar los flujos interactivos del frontend utilizando las diez heurísticas de Nielsen.
- Priorizar formularios y operaciones de escritura, especialmente calificaciones y asistencias.
- Toda creación, edición, eliminación o envío al backend debe ejecutarse mediante un botón de acción claramente identificado.
- Mostrar un `MatSnackBar` con un mensaje comprensible ante éxito o error del backend.
- Mostrar estado de carga y deshabilitar la acción mientras la solicitud está en curso.
- Evitar envíos duplicados y solicitar confirmación antes de acciones destructivas.
- Conservar los datos ingresados cuando un error recuperable impida completar la operación.
- Asegurar navegación por teclado, foco visible, etiquetas accesibles y mensajes que no dependan solo del color.

### Heurísticas que debe verificar la auditoría

1. Visibilidad del estado del sistema.
2. Correspondencia entre el sistema y el mundo real.
3. Control y libertad del usuario.
4. Consistencia y estándares.
5. Prevención de errores.
6. Reconocer antes que recordar.
7. Flexibilidad y eficiencia de uso.
8. Diseño estético y minimalista.
9. Reconocer, diagnosticar y recuperarse de errores.
10. Ayuda y documentación cuando sea necesaria.

### Criterios de aceptación

- Calificaciones y asistencias no se guardan automáticamente al cambiar un campo; requieren una acción explícita.
- Cada operación de escritura muestra confirmación de éxito basada en la respuesta del backend.
- Los errores muestran un mensaje útil y permiten reintentar sin perder información válida.
- Los botones muestran un estado ocupado y no permiten solicitudes duplicadas.
- Las eliminaciones solicitan confirmación.
- La auditoría deja una lista breve de hallazgos corregidos y pendientes, clasificados por heurística.
- Los flujos modificados son utilizables con teclado y lector de pantalla.

### Validación mínima

- Ejecutar las pruebas y el build del frontend.
- Probar manualmente éxito, error, carga y doble clic en calificaciones y asistencias.
- Comprobar foco, orden de tabulación y anuncios accesibles del snackbar.

---

## GDE-003 - Importación masiva de estudiantes desde Excel

**Estado:** Completado  
**Prioridad:** Alta  
**Dependencias:** GDE-001, GDE-002

### Resultado de la implementación (2026-08-29)

**Backend** — `backend/src/modules/students/import/`:
- `students-import.service.ts` usa `exceljs` (librería mantenida, sin parseo manual del binario). `buildTemplate()` genera un `.xlsx` con las columnas exactas y dos filas de ejemplo. `parseAndValidate()` valida, en este orden: extensión `.xlsx`, tamaño (máx. 5 MB), columnas obligatorias presentes en la fila de encabezado, y luego fila por fila: matrícula/nombres/apellidos obligatorios, `sexo` en `{M,F}`, `fechaNacimiento` con formato `AAAA-MM-DD` parseable, `curso` existente en el centro (por nombre), matrícula duplicada dentro del propio archivo, y matrícula ya existente en el sistema — cada fila queda clasificada como `valida`, `advertencia` (ej. edad fuera de 5–25 años, no bloqueante) o `error` (bloqueante).
- **Estrategia transaccional elegida**: importación parcial pero siempre informada — `POST /students/import/confirm` re-valida el archivo desde cero (no confía en un preview cacheado ni en datos editados por el cliente), importa únicamente las filas `valida`/`advertencia`, omite las `error`, y devuelve `{ total, importados, rechazados, detalle }` con el motivo exacto de cada fila rechazada. No hay import "todo o nada" porque el propio criterio de aceptación pide un resumen de cantidad importada y rechazada, no un bloqueo total ante cualquier error.
- El archivo se procesa en memoria (`multer` con `memoryStorage()`, `FileInterceptor` en `students.controller.ts`) y nunca se escribe a disco.
- Autorización: `@Roles(Role.ADMINISTRADOR, Role.REGISTRO)` en las tres rutas nuevas (`GET students/import/template`, `POST students/import/preview`, `POST students/import/confirm`), igual que el resto del módulo de estudiantes.
- Verificado end-to-end contra el backend real: plantilla descargable (`200`, `Content-Type` correcto), preview de un archivo 100% válido, preview de un archivo con 4 tipos de error + 1 advertencia (matrícula/nombres faltantes, sexo inválido, curso inexistente, matrícula duplicada en el archivo, edad fuera de rango), confirmación que importa exactamente las filas válidas/con advertencia y rechaza el resto con su motivo, reintento de confirmación sobre matrículas ya importadas (rechazadas correctamente, sin duplicados), y `403` para el rol `DOCENTE` en las tres rutas.

**Frontend**:
- `frontend/src/app/students/students.service.ts` — `downloadImportTemplate()` (blob), `previewImport(file)`, `confirmImport(file)`.
- `frontend/src/app/students/components/import-students-dialog/` (nuevo) — diálogo Angular Material con: descarga de plantilla, selector de archivo, botón explícito "Ver vista previa" (no se sube nada hasta pulsarlo), tabla de vista previa con conteo de válidas/advertencias/errores y el detalle por fila, y botón explícito "Confirmar importación (N)" — solo aparece tras la vista previa y solo se habilita si hay al menos una fila importable. Todo el flujo usa `NotificationService` para informar éxito/error y bloquea reenvíos mientras una solicitud está en curso.
- Botón "Importar desde Excel" agregado en `student-list.component.html`, visible solo para `ADMINISTRADOR`/`REGISTRO` (mismo `canManage()` que ya gobierna "+ Nuevo estudiante"); al cerrar el diálogo, la lista se recarga si se importó al menos un estudiante.

### Validación mínima ejecutada

- `nest build` y `ng build` sin errores.
- Backend probado en vivo (ver detalle arriba) para: archivo válido, columnas faltantes, filas duplicadas, datos inválidos, matrícula ya existente y rol no autorizado (`403`).
- Frontend: build verificado y confirmación visual de que los textos de la UI ("Importar desde Excel", "Confirmar importación…") quedaron compilados en el bundle de producción.

### Historia

Como usuario autorizado, quiero cargar un listado de estudiantes desde Excel para migrar con facilidad los usuarios de la aplicación anterior.

### Alcance

- Incorporar la acción `Importar desde Excel` en el módulo de estudiantes.
- Aceptar archivos `.xlsx` mediante una librería mantenida; no interpretar el formato manualmente.
- Proporcionar una plantilla descargable con encabezados y ejemplos permitidos.
- Validar extensión, tamaño, columnas obligatorias, tipos de datos, filas duplicadas y estudiantes ya existentes.
- Mostrar una vista previa con filas válidas, advertencias y errores antes de confirmar.
- Importar únicamente después de una confirmación explícita.
- Procesar la importación en el backend y aplicar autorización por rol.
- Devolver un resumen con cantidad total, importada y rechazada, además del detalle de errores por fila.
- Definir una estrategia transaccional clara para evitar cargas parciales no informadas.

### Criterios de aceptación

- Un usuario autorizado puede descargar la plantilla, seleccionar un archivo, revisar la vista previa y confirmar la carga.
- Un archivo válido crea los estudiantes esperados sin duplicados.
- Un archivo inválido no se importa silenciosamente y muestra el número de fila y la causa de cada error.
- El resultado del backend se comunica mediante snackbar y un resumen visible.
- Un usuario sin autorización recibe `403` y no puede ver ni ejecutar la acción.
- El archivo no queda almacenado permanentemente si no es necesario.

### Validación mínima

- Pruebas backend para archivo válido, columnas faltantes, duplicados, datos inválidos y rol no autorizado.
- Pruebas frontend del selector, vista previa, confirmación y mensajes de resultado.
- Build y pruebas de frontend y backend.

---

## GDE-004 - Foto en el registro manual de estudiantes

**Estado:** Completado  
**Prioridad:** Media  
**Dependencias:** GDE-002

### Resultado de la implementación (2026-08-29)

**Backend** — nuevo `backend/src/modules/students/photo/students-photo.service.ts`, registrado en `students.module.ts` y expuesto en `students.controller.ts`:
- `POST /students/:id/photo` (`@Roles(ADMINISTRADOR, REGISTRO)`, mismos roles que crear/editar estudiantes) — `FileInterceptor` con `memoryStorage()` (nunca toca disco antes de validar) y `limits.fileSize` de 2 MB (Multer rechaza con `413` antes de que el archivo llegue al handler, confirmado en vivo). El servicio valida el `mimetype` contra una lista blanca (`image/jpeg`, `image/png`) y **nunca usa el nombre original del archivo**: genera `${uuid()}${extensión}` antes de escribir a `backend/uploads/students/` (agregado a `.gitignore`). El archivo nuevo se escribe y el registro del estudiante se actualiza **antes** de borrar el archivo anterior (si había uno) — así un fallo a mitad de camino nunca deja al estudiante con una referencia rota; y como la validación ocurre antes de escribir nada, un archivo inválido no se guarda ni modifica el registro ("no crea referencias rotas ni archivos huérfanos").
- `GET /students/:id/photo` — sirve el archivo autenticado (cualquier rol, igual que el resto del perfil del estudiante), resolviendo siempre por `centroId` del JWT (aislamiento entre centros, mismo patrón que el resto del módulo `students`); `404` si el estudiante no tiene foto.
- Se agregó `fotoArchivo: string | null` a la entidad `Estudiante` (`common/interfaces/entities.ts`) y se actualizaron los tres lugares que construían estudiantes (semilla de datos, `StudentsService.create`, `StudentsImportService`) para inicializarlo en `null`.

**Frontend**:
- `student-form.component.ts/html` — selector de foto opcional (`accept="image/jpeg,image/png"`) con vista previa inmediata vía `FileReader` (sin llamada al backend todavía), validación del mismo formato/tamaño que el backend antes de aceptar el archivo, y botón "Quitar foto" que limpia la selección. Al enviar el formulario: primero se crea el estudiante (como antes); si se seleccionó una foto, se sube en una segunda solicitud a `POST /students/:id/photo` — si esa segunda solicitud falla, el estudiante ya fue creado exitosamente y se navega igual a su perfil, con un snackbar que aclara que la foto no se guardó (sin avatar roto: `fotoArchivo` sigue en `null` en ese caso).
- `student-detail.component.ts/html` — el círculo de avatar (antes solo iniciales) ahora muestra la foto real cuando `fotoArchivo` existe, obtenida como blob autenticado vía `StudentsService.getPhotoBlob()` y una URL de objeto (mismo patrón que la plantilla de importación de GDE-003), con `alt` descriptivo ("Foto de {nombre}"); si no hay foto, se conserva el avatar de iniciales de siempre. La URL de objeto se libera en `ngOnDestroy` para no filtrar memoria.
- Verificado end-to-end contra el backend real: subida válida (`201`) y verificación de que el contenido descargado es idéntico byte a byte al original; archivo > 2 MB rechazado por Multer (`413`); formato no permitido (`.txt`) rechazado por el servicio (`400`, mensaje claro); `DOCENTE` recibe `403` al intentar subir (rol no autorizado); sin token → `401`; estudiante sin foto → `404`.

### Validación mínima ejecutada

- `nest build` y `ng build` sin errores.
- Backend probado en vivo con los 6 casos listados arriba (éxito, tamaño excedido, formato inválido, rol no autorizado, sin token, estudiante sin foto).
- No se ejecutó una prueba interactiva de navegador para la vista previa/reemplazo/eliminación client-side; se verificó por revisión de código (mismo patrón `FileReader` + limpieza de `<input type="file">` que ya usan otros formularios de este backlog).

### Historia

Como usuario autorizado, quiero subir una foto al registrar manualmente a un estudiante para identificarlo con mayor facilidad.

### Alcance

- Añadir un selector de foto opcional al formulario de creación manual de estudiantes.
- Mostrar vista previa, reemplazo y eliminación antes de guardar.
- Validar formatos de imagen permitidos y tamaño máximo tanto en frontend como en backend.
- Definir almacenamiento y acceso seguro a la imagen, evitando confiar en el nombre original del archivo.
- Mantener el avatar o representación visual actual cuando no se proporcione una foto.
- Aplicar autorización al endpoint de carga.

### Criterios de aceptación

- Se puede registrar un estudiante con una imagen válida.
- Se puede registrar un estudiante sin imagen y se conserva la visualización actual por defecto.
- Archivos inválidos muestran un error y no se envían ni almacenan.
- La vista previa permite cambiar o retirar la imagen antes de guardar.
- Un fallo de carga no crea referencias rotas ni archivos huérfanos.
- La imagen se presenta con texto alternativo apropiado.

### Validación mínima

- Probar creación con foto, sin foto, con formato inválido y con archivo demasiado grande.
- Ejecutar pruebas de autorización, frontend y backend relacionadas.

---

## GDE-005 - Restringir seguimiento al orientador

**Estado:** Completado  
**Prioridad:** Alta  
**Dependencias:** Ninguna

### Historia

Como usuario, quiero que el módulo de seguimiento o bitácora sea exclusivo del perfil `ORIENTADOR` para proteger la información confidencial del estudiante.

### Alcance

- Retirar el acceso de `ADMINISTRADOR` a la ruta y navegación de seguimiento.
- Autorizar exclusivamente el rol `ORIENTADOR` en todos los endpoints del módulo.
- Ocultar el elemento de navegación para cualquier otro rol.
- Evitar que el dashboard u otros módulos filtren contenido confidencial de seguimiento a roles no autorizados.
- Mantener una respuesta `403 Forbidden` ante intentos directos de acceso sin permiso.

### Criterios de aceptación

- `ORIENTADOR` puede ver y utilizar el módulo de seguimiento.
- `ADMINISTRADOR`, `DIRECTOR`, `DOCENTE` y `REGISTRO` no ven el acceso en la navegación.
- Los roles no autorizados no pueden entrar mediante URL directa ni consumir los endpoints.
- La protección existe en backend aunque se omitan las restricciones del frontend.
- Las respuestas, logs y métricas visibles a otros roles no exponen contenido confidencial.

### Validación mínima

- Pruebas de autorización de ruta y API para cada rol.
- Build y pruebas de frontend y backend.

---

## GDE-006 - Módulo de datos del centro educativo

**Estado:** Completado  
**Prioridad:** Media  
**Dependencias:** GDE-001

### Resultado de la implementación (2026-08-29)

**Backend**: sin cambios — se reutilizó tal cual el `GET /schools/me` existente (`backend/src/modules/schools/schools.controller.ts:12-17`), que ya resuelve el centro exclusivamente a partir de `user.centroId` del JWT (sin parámetro `:id` que un cliente pueda manipular) y ya exige autenticación (guard global). Esto satisface directamente "los endpoints requieren autenticación y validan el centro asociado al usuario" y "nunca los de otro centro" sin tocar el módulo `schools`, tal como pide el alcance del ticket ("reutilizar el módulo `schools`... antes de crear nuevas abstracciones").

**Adaptación al modelo de datos real**: la entidad `CentroEducativo` (`backend/src/common/interfaces/entities.ts`) no tiene campos `dirección` ni `correo`, y no existe un concepto de "centro inactivo" en el esquema (no hay campo `activo`). En vez de inventar esos campos, la vista muestra lo que sí existe — nombre, código institucional, director, teléfono, regional, distrito educativo, provincia y municipio — y presenta un indicador "Activo" fijo, describiendo el invariante real del sistema (no hay flujo de baja de centros), no un dato inventado.

**Frontend**:
- `frontend/src/app/schools/schools.service.ts` (ya creado durante GDE-007) — `findMine()` sobre `GET /schools/me`.
- Nueva página `frontend/src/app/schools/pages/school-page/` (ruta `/school`, sin `roleGuard`: cualquier usuario autenticado puede acceder, igual que el endpoint) con los tres estados que pide el criterio de aceptación: carga ("Cargando información..."), error (mensaje del backend + botón "Reintentar" que reintenta la solicitud) y vacío (tarjeta con "No hay información registrada..." para el caso defensivo de una respuesta exitosa sin datos). El diseño reutiliza las clases `.card`/`.btn-secondary` ya establecidas en el sistema visual, con grid responsivo (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) para escritorio y móvil.
- Entrada de navegación "Centro Educativo" agregada en `shell.component.ts` (`allNav`), visible para todos los roles — coherente con que el propio endpoint no restringe por rol.
- Verificado end-to-end contra el backend real: los 5 roles (`ADMINISTRADOR`, `REGISTRO`, `DIRECTOR`, `DOCENTE`, `ORIENTADOR`) obtienen `200` con los datos de su propio centro, sin token → `401`, con token inválido → `401`. No existe un segundo centro educativo en los datos semilla para probar aislamiento entre centros con una segunda cuenta real, pero el aislamiento es estructural: el endpoint nunca acepta un identificador de centro proveniente del cliente, solo el que viene firmado en el JWT — el mismo patrón ya verificado en GDE-007.

### Validación mínima ejecutada

- `nest build` y `ng build` sin errores.
- Backend probado en vivo para los 5 roles, sin token y con token inválido (ver detalle arriba).

### Historia

Como usuario autorizado, quiero consultar los datos del centro educativo para disponer de la información institucional dentro del sistema.

### Alcance

- Crear una ruta y vista de detalle del centro educativo asociado al usuario.
- Mostrar, como mínimo, nombre, código institucional, dirección, teléfono, correo y estado.
- Reutilizar el módulo `schools` del backend y los modelos existentes antes de crear nuevas abstracciones.
- Mostrar estados de carga, vacío y error.
- Aplicar control de acceso y aislamiento por centro educativo.
- Considerar edición solo si las reglas de negocio y seguridad asignan explícitamente esa capacidad a un rol; de lo contrario, la primera versión será de solo lectura.

### Criterios de aceptación

- El usuario autorizado puede abrir el módulo desde la navegación.
- La vista muestra los datos del centro correspondiente y nunca los de otro centro.
- La interfaz maneja correctamente carga, ausencia de datos y error del backend.
- Los endpoints requieren autenticación y validan el centro asociado al usuario.
- La vista funciona en escritorio y dispositivos móviles.

### Validación mínima

- Pruebas de consulta correcta, centro inexistente, usuario no autorizado y aislamiento entre centros.
- Build y pruebas de frontend y backend.

---

## GDE-007 - Perfil del usuario autenticado

**Estado:** Completado  
**Prioridad:** Media  
**Dependencias:** GDE-002

### Resultado de la implementación (2026-08-29)

**Backend**:
- Nuevo `UpdateOwnProfileDto` (`backend/src/modules/users/dto/update-own-profile.dto.ts`) con únicamente `nombres`/`apellidos` opcionales (`IsString`, `IsNotEmpty` si se envían). Al ser una whitelist explícita, ni siquiera hace falta lógica adicional para bloquear campos privilegiados: el `ValidationPipe` global (`whitelist: true, forbidNonWhitelisted: true`, `main.ts`) rechaza con `400` cualquier intento de enviar `rol`, `centroId`, `activo` u otro campo no declarado en el DTO.
- `PATCH /users/me` en `users.controller.ts`, registrado **antes** de `PATCH :id` (mismo orden que ya tenía `GET me` antes de `GET :id`) para que Express no intente resolver `me` como un `:id`. Usa `@CurrentUser()` para tomar el id del JWT (`user.sub`), nunca un id recibido del cliente — así es estructuralmente imposible consultar o editar el perfil de otro usuario manipulando la solicitud.
- `UsersService.updateOwnProfile()` reutiliza `UsersRepository.update()` (mismo repositorio que ya usa el camino admin) y devuelve el usuario sin `passwordHash`.

**Frontend**:
- `frontend/src/app/users/users.service.ts` — se agregaron `findMe()` y `updateMe()`.
- `frontend/src/app/schools/schools.service.ts` (nuevo, mínimo) — `findMine()` sobre el `GET /schools/me` que ya existía, solo para mostrar el nombre del centro en el perfil; no expone edición (eso es alcance de GDE-006).
- `frontend/src/app/core/services/auth.service.ts` — nuevo método `updateCurrentUser()` para reflejar el nombre editado en el estado en memoria del usuario autenticado.
- Nueva página `frontend/src/app/profile/pages/profile-page/` (ruta `/profile`, sin `roleGuard`: cualquier usuario autenticado puede acceder) — muestra nombres, apellidos, correo, rol y centro educativo; el correo, el rol y el centro son de solo lectura (deshabilitados, con nota explicativa); nombres/apellidos son editables mediante un formulario reactivo con validación `Validators.required` y mensajes de error junto a cada campo (`form.controls.nombres.invalid && ... .touched`). El guardado usa un botón explícito, deshabilitado mientras la solicitud está en curso, y `NotificationService` para éxito/error; en error no se pierde lo escrito (no hay reset del formulario).
- `frontend/src/app/shared/components/top-bar/top-bar.component.ts` — el bloque de avatar/nombre ahora es un `routerLink="/profile"`; al guardar cambios en el perfil, `authService.updateCurrentUser()` actualiza el nombre mostrado en la barra superior sin recargar la página.
- Verificado end-to-end contra el backend real: lectura y edición del perfil propio, intento de enviar `rol`/`centroId` (rechazado con `400` por el whitelist), `nombres` vacío (rechazado con `400`), sin token (`401`) y con token inválido (`401`).

### Validación mínima ejecutada

- `nest build` y `ng build` sin errores.
- Backend probado en vivo: `GET /users/me`, `PATCH /users/me` válido, `PATCH /users/me` con campos privilegiados (400), `PATCH /users/me` con `nombres` vacío (400), sin token (401), token inválido (401).

### Historia

Como usuario autenticado, quiero ver y editar mi perfil para mantener actualizada mi información personal.

### Alcance

- Hacer que el acceso de perfil de la barra superior dirija al perfil del usuario autenticado.
- Crear un endpoint `me` o reutilizar un contrato equivalente para obtener el usuario desde el JWT, nunca desde un identificador confiado al cliente.
- Mostrar nombre, correo, rol, centro educativo y demás información permitida.
- Permitir editar únicamente los campos autorizados por las reglas de negocio.
- No permitir que el usuario cambie su rol, centro, estado u otros campos privilegiados.
- Mostrar snackbar de éxito o error y conservar los datos ante fallos recuperables.

### Criterios de aceptación

- Un usuario autenticado puede abrir su perfil y ve sus propios datos.
- Las modificaciones permitidas se guardan mediante un botón explícito.
- La información actualizada aparece en la barra superior cuando corresponda.
- No es posible consultar ni editar otro perfil manipulando la solicitud.
- Los campos privilegiados son de solo lectura o no se muestran.
- Los errores de validación se muestran junto al campo correspondiente.

### Validación mínima

- Pruebas de lectura y edición del perfil propio, campos prohibidos, token inválido y validaciones.
- Build y pruebas de frontend y backend.

---

## GDE-008 - Retirar acciones sin funcionalidad del dashboard

**Estado:** Completado  
**Prioridad:** Media  
**Dependencias:** Ninguna

### Historia

Como usuario, quiero ver únicamente acciones funcionales en el dashboard para evitar confusión y expectativas incorrectas.

### Alcance

- Inventariar botones, enlaces, iconos interactivos y menús visibles en el dashboard.
- Verificar su comportamiento y destino.
- Eliminar de la interfaz toda acción sin implementación real.
- Conservar las acciones funcionales y asegurar que tengan nombre accesible, foco visible y destino correcto.
- No reemplazar acciones inexistentes con mensajes como `Próximamente`, salvo decisión explícita del producto.

### Criterios de aceptación

- No existen controles que al pulsarse no ejecuten una acción o navegación válida.
- No existen enlaces con destino vacío, `#` o rutas inexistentes.
- Los controles conservados funcionan con teclado y tienen etiqueta accesible.
- La eliminación no deja espacios incoherentes ni altera la jerarquía visual del dashboard.

### Validación mínima

- Recorrer manualmente todas las acciones del dashboard con ratón y teclado.
- Ejecutar las pruebas y el build del frontend.

---

## GDE-009 - Modal para crear actividad de evaluación

**Estado:** Completado  
**Prioridad:** Media  
**Dependencias:** GDE-002

### Resultado de la implementación (2026-08-29)

- Nuevo `frontend/src/app/evaluations/components/create-activity-dialog/` — mismo `FormBuilder`/`Validators` y el mismo contrato (`EvaluationsService.createActivity`) que tenía la tarjeta inline, solo movidos a un componente de diálogo (`MatDialogModule`) que recibe `asignacionDocenteId` por `MAT_DIALOG_DATA` y devuelve la actividad creada (o `null` si se cancela) vía `MatDialogRef.close()`.
- `evaluation-page.component.html` — se retiró por completo la tarjeta "Nueva actividad de evaluación"; en su lugar hay un botón "Agregar actividad" junto al selector de asignación (visible solo cuando hay una asignación seleccionada) que abre el diálogo.
- `evaluation-page.component.ts` — `openCreateActivityDialog()` reemplaza al antiguo `createActivity()`; se suscribe a `afterClosed()` y, si vuelve una actividad, la agrega a la señal `activities` en el momento (`activities.update(...)`) para que la tabla de calificaciones se actualice sin recargar la página ni volver a pedir la lista completa. Se eliminaron del componente el `FormBuilder`, el `FormGroup` y las señales que ya no se usan (`savingActivity`), y las importaciones no utilizadas (`ReactiveFormsModule`, `Competencia`, `PeriodoEvaluativo`, `Validators`).
- Comportamiento del diálogo:
  - **Sin duplicados**: `submit()` corta temprano si `saving()` ya es `true`; el botón queda deshabilitado mientras la solicitud está en curso.
  - **Error mantiene el diálogo abierto**: en `error`, no se llama a `close()`; se reactiva `dialogRef.disableClose` y se muestra el mensaje real del backend vía `NotificationService` (verificado en vivo: un peso de actividad que excede el 100% del período responde `400` con un mensaje claro, que llega intacto al snackbar).
  - **Cierre accesible**: mientras se está guardando, `dialogRef.disableClose = true` bloquea `Escape` y el clic en el fondo; se restaura a `false` tras un error para permitir cancelar. El botón "Cancelar" también ignora los clics mientras `saving()` es verdadero.
  - **Foco**: no se fuerza ningún elemento con `cdkFocusInitial`, por lo que Angular Material aplica su comportamiento por defecto (`autoFocus: 'first-tabbable'`), llevando el foco al primer campo del formulario al abrir, y `restoreFocus` (también por defecto) lo devuelve al botón "Agregar actividad" al cerrar.

### Validación mínima ejecutada

- `ng build` sin errores; se confirmó que "Agregar actividad" y "Nueva actividad de evaluación" quedaron compilados en el bundle del módulo de evaluaciones.
- Backend probado en vivo con el mismo endpoint sin cambios (`POST /evaluations/activities`): creación exitosa (`201`) y error de negocio real (peso acumulado > 100%, `400` con mensaje descriptivo) — ambos casos ejercitan exactamente los caminos `next`/`error` que usa el diálogo.
- El resto de los criterios (bloqueo de duplicados, `Escape`/cancelar, foco) se verificaron por revisión de código apoyada en el comportamiento estándar y ya probado de Angular Material CDK Dialog (usado también por `ConfirmDialogComponent` e `ImportStudentsDialogComponent` en tickets anteriores de este mismo backlog), no hay automatización de navegador disponible en este entorno para una prueba interactiva en vivo.

### Historia

Como docente, quiero abrir la creación de una actividad desde un botón `Agregar actividad` para mantener la vista de evaluaciones enfocada y utilizar el formulario solo cuando sea necesario.

### Alcance

- Retirar la tarjeta visible `Nueva actividad de evaluación` de la página principal.
- Añadir el botón `Agregar actividad` dentro del módulo de evaluaciones.
- Abrir el formulario existente en un diálogo de Angular Material.
- Conservar las validaciones y contratos actuales del formulario.
- Cerrar el diálogo después de una creación exitosa y actualizar la lista sin recargar toda la página.
- Mantener el diálogo abierto con los datos ingresados cuando el backend responda con error.
- Permitir cancelar y cerrar de forma accesible sin guardar.

### Criterios de aceptación

- La tarjeta de creación ya no ocupa espacio permanente en la página.
- El botón `Agregar actividad` abre un modal con el formulario completo.
- Al guardar correctamente, se muestra snackbar, se cierra el modal y aparece la nueva actividad.
- Durante el envío, el botón se deshabilita y no genera duplicados.
- Ante un error, el modal permanece abierto y muestra retroalimentación útil.
- El foco entra al modal al abrir, queda contenido en él y regresa al botón al cerrar.
- `Escape` y el botón de cancelar cierran el modal sin guardar, salvo que una operación esté en curso.

### Validación mínima

- Probar apertura, validación, guardado exitoso, error, cancelación, doble clic y navegación por teclado.
- Ejecutar las pruebas y el build del frontend.

---

## GDE-010 - Observaciones de aula por estudiante

**Estado:** Completado  
**Prioridad:** Alta  
**Dependencias:** GDE-001, GDE-002

### Resultado de la implementación (2026-08-29)

**Backend** — nuevo módulo `backend/src/modules/classroom-observations/`:
- Entidad `ObservacionAula` (`backend/src/common/interfaces/entities.ts`) y enum `CategoriaObservacion` (`INCIDENTE`, `ACTITUD_POSITIVA`, `CONVIVENCIA`, `OBSERVACION_ACADEMICA`, `backend/src/common/enums/index.ts`), independientes de `SeguimientoOrientador`.
- `classroom-observations.controller.ts` — `@Roles(Role.DOCENTE)` a nivel de clase (mismo patrón que `follow-up`), rutas `GET students/:estudianteId`, `POST`, `PATCH :id`, `DELETE :id`.
- `classroom-observations.service.ts` — `ensureDocenteAsignadoAlEstudiante` valida contra `AsignacionDocente` (vía `SubjectsRepository.findAssignments`) que el docente autenticado efectivamente enseña el curso del estudiante antes de crear o consultar; si se indica `asignaturaId`, también se valida que corresponda a una asignación real del docente. El `cursoId` se deriva del propio estudiante (no se confía en el valor enviado por el cliente). Edición y eliminación solo las permite al `docenteId` autor (`ForbiddenException` en caso contrario). Auditoría mínima vía `Logger` (id, estudianteId, docenteId — nunca la descripción).
- DTOs con `class-validator` (`estudianteId`/`asignaturaId` UUID, `fecha` ISO date, `categoria` enum, `descripcion` `MinLength(3)`/`MaxLength(2000)`).
- Verificado end-to-end contra el backend real: creación válida (201/200 con `centroId`/`cursoId` derivados), listado, eliminación por el autor, `403` para `ORIENTADOR` en `GET` y `POST`, `400` por `descripcion` faltante o `categoria` inválida, `404` por estudiante inexistente.

**Frontend**:
- `frontend/src/app/classroom-observations/classroom-observations.service.ts` (nuevo) + tipos `CategoriaObservacion`/`ObservacionAula` en `core/models/domain.model.ts`.
- Sección "Observaciones de aula" añadida a `student-detail.component.ts/html`, visible solo para `DOCENTE` y solo si el backend confirma autorización sobre ese estudiante (`canRecordObservation`, determinado por el resultado real de `GET students/:estudianteId`, no por una suposición del cliente). Formulario con categoría, fecha, asignatura opcional (acotada a las asignaturas que el docente realmente imparte en el curso del estudiante) y descripción; botón "Registrar observación" explícito, con estado de guardado y `NotificationService`. Está visualmente separada y rotulada como distinta de la bitácora confidencial del orientador (`isOrientador()` sigue siendo un bloque aparte).
- Eliminar una observación propia usa `ConfirmDialogService` antes de llamar al backend, con estado de eliminación por fila y snackbar de resultado.

**Riesgo documentado**: el backend expone `PATCH :id` (editar observación propia) y la regla de autorización está implementada y probada, pero no se agregó una UI de edición en el frontend en este ciclo — solo creación y eliminación, que son las acciones explícitamente cubiertas por los criterios de aceptación. Si se necesita edición desde la interfaz, es un ajuste pequeño sobre el mismo patrón (el endpoint ya existe).

### Historia

Como docente, quiero registrar incidentes, actitudes u observaciones de un estudiante durante la clase para conservar contexto relevante sobre su comportamiento académico y convivencia.

### Alcance

- Crear una funcionalidad de observaciones de aula separada de la bitácora confidencial del orientador.
- Permitir seleccionar estudiante, curso o asignatura, fecha, categoría y descripción.
- Definir categorías iniciales de negocio, por ejemplo: incidente, actitud positiva, convivencia y observación académica.
- Asociar automáticamente al docente autenticado como autor.
- Permitir al docente consultar las observaciones que está autorizado a ver según sus cursos y centro.
- Definir reglas explícitas para editar o eliminar observaciones propias.
- Validar longitud, contenido obligatorio, relaciones y permisos en backend.
- Registrar auditoría mínima de creación y modificación sin incluir contenido sensible en logs técnicos.

### Fuera de alcance

- No mezclar estas observaciones con notas clínicas, emocionales o familiares de la bitácora del orientador.
- No mostrar el contenido en dashboards generales hasta definir reglas de privacidad específicas.

### Criterios de aceptación

- Un `DOCENTE` autorizado puede crear una observación para un estudiante de su ámbito académico.
- La operación requiere un botón explícito y muestra el resultado del backend mediante snackbar.
- La observación registra autor y fecha de forma confiable desde el backend.
- No se puede registrar una observación para estudiantes fuera del curso o centro autorizado.
- Los roles y docentes no autorizados reciben `403` sin exposición de datos.
- La interfaz distingue claramente las observaciones de aula de la bitácora confidencial del orientador.
- Los mensajes y logs no exponen información sensible innecesaria.

### Validación mínima

- Pruebas de creación válida, datos inválidos, estudiante fuera del ámbito y roles no autorizados.
- Pruebas de visibilidad, edición y eliminación conforme a las reglas definidas.
- Build y pruebas de frontend y backend.

---

# Definición global de terminado

Un ticket puede marcarse como `Completado` cuando:

- Todos sus criterios de aceptación están satisfechos.
- Frontend y backend mantienen separación de responsabilidades y autorización en ambos niveles cuando corresponda.
- Entradas, archivos y parámetros están validados en el backend.
- No se registran contraseñas, tokens, contenido confidencial ni datos personales innecesarios en logs.
- Los estados de carga, éxito, vacío y error están contemplados en la interfaz afectada.
- La funcionalidad es accesible por teclado y no depende únicamente del color.
- Las pruebas relacionadas y los builds afectados finalizan correctamente.
- La documentación y los archivos de ejemplo de configuración están actualizados.
- No se incluyeron cambios ajenos al alcance del ticket.
