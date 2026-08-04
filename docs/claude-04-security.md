# claude-04-security.md

# Arquitectura de Seguridad
## Sistema Inteligente para la Detección Temprana del Riesgo de Abandono Escolar

Versión: 1.0

---

# Objetivo

Este documento define la arquitectura de seguridad oficial del sistema.

Toda implementación realizada en NestJS, Angular y PostgreSQL deberá cumplir las reglas descritas aquí.

El objetivo es proteger la información académica y psicopedagógica de los estudiantes, garantizar la autenticación de los usuarios y controlar el acceso a los recursos según el rol asignado.

Este documento está alineado con el alcance del MVP y no introduce funcionalidades distintas a las definidas en los diagramas UML y en la arquitectura del proyecto.

---

# Principios de Seguridad

El sistema deberá cumplir los siguientes principios:

- Confidencialidad
- Integridad
- Disponibilidad
- Autenticidad
- Trazabilidad
- Mínimo privilegio
- Defensa en profundidad

Toda decisión de implementación deberá respetar estos principios.

---

# Arquitectura General

```text
Angular

↓

HTTPS

↓

NestJS

↓

Authentication

↓

Authorization

↓

Business Logic

↓

Prisma ORM

↓

PostgreSQL
```

Ningún cliente tendrá acceso directo a la base de datos.

Toda comunicación deberá realizarse mediante la API REST.

---

# Protocolo de Comunicación

Todo el tráfico utilizará:

HTTPS

No permitir conexiones HTTP en producción.

---

# Autenticación

El sistema utilizará:

JWT (JSON Web Token)

Implementado mediante:

Passport + passport-jwt

Framework:

NestJS

---

# Flujo de Autenticación

```text
Usuario

↓

Login

↓

Validación de credenciales

↓

Generación JWT

↓

Respuesta

↓

Angular almacena Token

↓

Peticiones autenticadas

↓

Validación JWT

↓

Acceso al recurso
```

---

# Inicio de Sesión

El usuario iniciará sesión mediante:

- correo electrónico
- contraseña

No utilizar nombre de usuario.

---

# Contraseñas

Nunca almacenar contraseñas en texto plano.

Utilizar:

bcrypt

Costo recomendado:

12 rounds

Nunca implementar algoritmos inseguros como:

- MD5
- SHA1
- Base64

---

# JWT

El token contendrá únicamente la información necesaria.

Ejemplo

```json
{
  "sub": "uuid",
  "email": "usuario@centro.edu.do",
  "role": "DOCENTE",
  "centroId": "uuid"
}
```

No incluir:

- contraseña
- nombres completos
- información académica
- datos personales del estudiante

---

# Tiempo de Vida del Token

Access Token

15 minutos

Refresh Token

7 días

Durante el MVP el Refresh Token puede almacenarse en base de datos para facilitar la revocación.

---

# Renovación del Token

Flujo

```text
Login

↓

Access Token

↓

Expira

↓

Refresh Token

↓

Nuevo Access Token
```

No solicitar credenciales nuevamente mientras el Refresh Token sea válido.

---

# Almacenamiento del Token

Frontend (Angular)

Preferencia:

Cookie HttpOnly + Secure

Si durante el MVP se utiliza almacenamiento en memoria para simplificar el desarrollo, deberá documentarse claramente y evitar el uso de `localStorage` para información sensible.

---

# OAuth 2.1

Aunque el MVP utiliza autenticación propia mediante JWT, la arquitectura deberá ser compatible con OAuth 2.1.

Esto permitirá incorporar en futuras versiones:

- Google
- Microsoft
- MINERD (si existiera integración)
- Directorios institucionales

No implementar OAuth en el MVP.

Únicamente mantener la arquitectura preparada.

---

# Authorization

Modelo:

RBAC

(Role Based Access Control)

---

# Roles Oficiales

Administrador

Registro

Director

Docente

Orientador

No crear permisos dinámicos en esta versión.

Los permisos estarán definidos por rol.

---

# Permisos por Rol

## Administrador

Acceso completo.

---

## Registro

Puede:

- registrar estudiantes
- editar estudiantes
- cambiar curso
- actualizar datos

No puede:

- registrar calificaciones
- registrar asistencia
- consultar seguimiento psicopedagógico
- modificar riesgo

---

## Director

Puede consultar:

- dashboard
- estudiantes
- cursos
- asistencia
- calificaciones
- riesgo

No puede leer observaciones privadas del orientador.

---

## Docente

Puede:

- registrar actividades
- registrar asistencia
- registrar calificaciones

Solo sobre las asignaciones docentes registradas.

---

## Orientador

Puede:

- consultar riesgo
- registrar seguimiento
- actualizar estado
- programar próxima cita
- aplicar ajuste profesional

No puede modificar información académica.

---

# Guards

Todos los endpoints protegidos utilizarán Guards de NestJS.

Ejemplo

```text
JwtAuthGuard

↓

RolesGuard

↓

Controller
```

Nunca acceder a un endpoint protegido sin autenticación.

---

# Decoradores

Utilizar decoradores personalizados.

Ejemplo

```ts
@Roles('DOCENTE')
```

y

```ts
@CurrentUser()
```

Evitar repetir lógica de extracción del usuario autenticado.

---

# Validaciones

Todos los DTO deberán utilizar:

- class-validator
- class-transformer

No aceptar datos sin validar.

Ejemplos

- correo válido
- UUID válido
- fechas válidas
- porcentajes entre 0 y 100
- cadenas con longitud controlada

---

# Validación del Centro Educativo

Cada solicitud deberá validar que el usuario pertenece al mismo centro educativo de la información solicitada.

Ejemplo

Incorrecto

```text
GET /students/uuid
```

Correcto

```text
GET /students/uuid

↓

Validar

student.centro_id == user.centroId
```

Esta regla es obligatoria.

---

# Protección del Seguimiento Psicopedagógico

Las observaciones del orientador son confidenciales.

Solo el orientador podrá consultar:

- observaciones
- acciones realizadas
- notas internas

Director y docente solo visualizarán el porcentaje de riesgo y el estado del seguimiento cuando corresponda.

---

# Protección de Endpoints

Todos los módulos deberán requerir autenticación, excepto:

```text
POST /auth/login
```

No exponer endpoints públicos adicionales en el MVP.

---

# Rate Limiting

Aplicar limitación de solicitudes al módulo de autenticación.

Ejemplo recomendado

5 intentos por minuto por dirección IP.

El resto de la API puede mantener una configuración más permisiva durante el MVP.

---

# Manejo de Errores

Nunca retornar:

- stack trace
- consultas SQL
- rutas internas
- información sensible

Formato recomendado

```json
{
  "success": false,
  "status": 403,
  "message": "Access denied"
}
```

---

# Auditoría

Registrar como mínimo:

- inicio de sesión
- cierre de sesión
- cambio de contraseña (si se implementa)
- creación de usuarios
- modificación de estudiantes
- actualización del riesgo
- creación de seguimiento

No es necesario implementar un módulo completo de auditoría en el MVP.

Basta con conservar el historial funcional ya definido (por ejemplo, `HistorialRiesgo`).

---

# CORS

Permitir únicamente el dominio del frontend.

Ejemplo

```text
https://app.midominio.com
```

No utilizar:

```text
*
```

en producción.

---

# Variables de Entorno

Nunca almacenar secretos en el código fuente.

Utilizar variables de entorno para:

- JWT_SECRET
- DATABASE_URL
- BCRYPT_ROUNDS
- PORT
- CORS_ORIGIN

---

# Protección frente a OWASP Top 10

El desarrollo deberá minimizar los riesgos más comunes:

- Control de acceso incorrecto.
- Fallos criptográficos.
- Inyección SQL (mitigada mediante Prisma).
- Configuración insegura.
- Componentes vulnerables.
- Autenticación deficiente.

El uso de Prisma ORM elimina la necesidad de construir consultas SQL manuales.

---

# Registros (Logging)

Utilizar Pino como proveedor de logs.

Registrar:

- errores
- advertencias
- autenticaciones
- eventos críticos

No registrar:

- contraseñas
- tokens
- información psicopedagógica

---

# Copias de Seguridad

El MVP deberá contemplar una estrategia de respaldo de PostgreSQL.

Frecuencia recomendada:

Diaria.

La automatización del respaldo queda fuera del alcance del MVP, pero deberá documentarse para futuras versiones.

---

# Reglas para IA

Nunca generar endpoints sin autenticación, excepto el login.

Nunca omitir validaciones de DTO.

Nunca acceder directamente a Prisma desde un Controller.

Nunca almacenar contraseñas sin hash.

Nunca confiar en datos enviados por el cliente para determinar permisos.

Toda autorización debe realizarse en el backend.

Angular únicamente mostrará u ocultará opciones de interfaz según el rol, pero la validación definitiva siempre pertenecerá a NestJS.

Mantener separación clara entre:

- Authentication
- Authorization
- Business Logic

---

# Resultado esperado

La implementación deberá proporcionar:

✔ Autenticación mediante JWT.

✔ Arquitectura preparada para OAuth 2.1.

✔ Control de acceso basado en roles (RBAC).

✔ Protección por centro educativo (multitenancy lógico).

✔ Validación estricta de datos.

✔ Protección de la información psicopedagógica.

✔ Endpoints protegidos mediante Guards.

✔ Compatibilidad con NestJS, Prisma y PostgreSQL.

✔ Arquitectura consistente con el MVP y con los diagramas UML definidos para el proyecto.