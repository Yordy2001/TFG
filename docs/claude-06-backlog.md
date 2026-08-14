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

| Orden | Ticket | Título | Prioridad | Dependencias | Estado |
|---:|---|---|---|---|---|
| 1 | GDE-001 | PostgreSQL en Docker y conexión NestJS | Alta | Ninguna | Pendiente |
| 2 | GDE-002 | Usabilidad y retroalimentación de operaciones | Alta | Ninguna | Pendiente |
| 3 | GDE-003 | Importación masiva de estudiantes desde Excel | Alta | GDE-001, GDE-002 | Pendiente |
| 4 | GDE-004 | Foto en el registro manual de estudiantes | Media | GDE-002 | Pendiente |
| 5 | GDE-005 | Restringir seguimiento al orientador | Alta | Ninguna | Pendiente |
| 6 | GDE-006 | Módulo de datos del centro educativo | Media | GDE-001 | Pendiente |
| 7 | GDE-007 | Perfil del usuario autenticado | Media | GDE-002 | Pendiente |
| 8 | GDE-008 | Retirar acciones sin funcionalidad del dashboard | Media | Ninguna | Pendiente |
| 9 | GDE-009 | Modal para crear actividad de evaluación | Media | GDE-002 | Pendiente |
| 10 | GDE-010 | Observaciones de aula por estudiante | Alta | GDE-001, GDE-002 | Pendiente |

---

# Tickets

## GDE-001 - PostgreSQL en Docker y conexión NestJS

**Estado:** Pendiente  
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

**Estado:** Pendiente  
**Prioridad:** Alta  
**Dependencias:** Ninguna

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

**Estado:** Pendiente  
**Prioridad:** Alta  
**Dependencias:** GDE-001, GDE-002

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

**Estado:** Pendiente  
**Prioridad:** Media  
**Dependencias:** GDE-002

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

**Estado:** Pendiente  
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

**Estado:** Pendiente  
**Prioridad:** Media  
**Dependencias:** GDE-001

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

**Estado:** Pendiente  
**Prioridad:** Media  
**Dependencias:** GDE-002

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

**Estado:** Pendiente  
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

**Estado:** Pendiente  
**Prioridad:** Media  
**Dependencias:** GDE-002

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

**Estado:** Pendiente  
**Prioridad:** Alta  
**Dependencias:** GDE-001, GDE-002

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
