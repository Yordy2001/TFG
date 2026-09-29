# GuardianEdu — Backlog Técnico: Preparación del Dataset (Fase 1 / MVP)

Alcance: cambios de base de datos y backend requeridos en el MVP actual para que el dataset generado sea utilizable en el futuro. No incluye ML, entrenamiento ni Fase 2.

---

## 1. Tabla `student_outcomes`

**Funcionalidad:** Registrar el desenlace real y verificado de cada estudiante por periodo académico, de forma independiente al Risk Engine.

**Schema:**
```
id_estudiante_hash        string (FK)
periodo_academico         string
estado_final_periodo      enum(activo, abandono, traslado, egresado, fallecido)
fecha_evento              date, nullable
motivo_registrado_salida  enum cerrado, nullable
fuente_confirmacion       enum(SIGERD, registro_manual_centro, orientador)
```

**Criterios de aceptación:**
- [ ] Tabla creada en PostgreSQL (3FN), independiente de `risk_scores`.
- [ ] Endpoint/formulario para que un rol administrativo confirme el estado final de un estudiante por periodo.
- [ ] `estado_final_periodo` no puede ser nulo al cerrar un periodo académico.
- [ ] `fecha_evento` y `motivo_registrado_salida` obligatorios si `estado_final_periodo != activo`.
- [ ] No existe ningún proceso automático que copie `riesgo_calculado_pct` en esta tabla.

---

## 2. Historial longitudinal (académico y asistencia)

**Funcionalidad:** Conservar el detalle por periodo/asignatura y por día, no solo agregados de presentación (promedio, % asistencia mensual).

**Schema — `academic_history`:**
```
id_estudiante_hash              string (FK)
periodo_academico               string
asignatura_id                   string
calificacion                    decimal
reprobo_asignatura              boolean
numero_veces_repitencia_acumulada  integer
```

**Schema — `attendance_history`:**
```
id_estudiante_hash   string (FK)
fecha                date
estado_asistencia    enum(presente, ausente, tardanza, ausencia_justificada)
```

**Criterios de aceptación:**
- [ ] Cada registro de calificación se guarda por asignatura y periodo (no solo el promedio final).
- [ ] Cada registro de asistencia se guarda por día (no solo el corte mensual mostrado en UI).
- [ ] Job programado calcula y almacena derivados: `porcentaje_asistencia_mensual`, `racha_maxima_ausencias_consecutivas`.
- [ ] Los agregados de UI (dashboard, perfil de estudiante) leen de estas tablas sin eliminar el detalle histórico.

---

## 3. Codificación de la bitácora del orientador (`psychosocial_followup`)

**Funcionalidad:** Extender el formulario reactivo de "nueva entrada confidencial" para capturar campos cerrados además del texto libre actual.

**Schema:**
```
id_estudiante_hash                 string (FK)
fecha_sesion                       date
situacion_economica_familiar       enum ordinal (1-5)
apoyo_familiar_percibido           enum ordinal (1-5)
trabaja_durante_periodo_escolar    boolean
distancia_hogar_escuela_km         decimal
problemas_familiares_reportados    boolean
senales_previas_abandono           boolean
factor_ajuste_orientador           decimal
estado_seguimiento                 enum(abierto, en_seguimiento, pendiente_intervencion, cerrado)
notas_libres                       text (campo ya existente, se conserva sin cambios)
```

**Criterios de aceptación:**
- [ ] Formulario Angular actualizado con controles (select/radio/slider) para cada campo codificado.
- [ ] Ningún campo codificado permite texto libre.
- [ ] `factor_ajuste_orientador` se guarda como campo independiente, no mezclado en el cálculo final de riesgo.
- [ ] `notas_libres` se mantiene con las mismas reglas de confidencialidad/mínimo privilegio ya implementadas.
- [ ] `estado_seguimiento` se guarda con histórico de cambios, no solo el estado actual.

---

## 4. Versionado del Risk Engine (`risk_scores`)

**Funcionalidad:** Registrar qué versión de los pesos del motor de reglas generó cada score histórico.

**Schema:**
```
id_estudiante_hash          string (FK)
fecha_calculo               timestamp
riesgo_calculado_pct        decimal
nivel_riesgo                enum(bajo, medio, alto)
version_reglas_risk_engine  string (semver)
```

**Criterios de aceptación:**
- [ ] Campo `version_reglas_risk_engine` obligatorio en el 100% de los registros nuevos.
- [ ] Cualquier cambio de pesos/reglas incrementa la versión antes de recalcular.
- [ ] Los scores históricos existentes no se sobrescriben al cambiar de versión.

---

## 5. Anonimización de identidad

**Funcionalidad:** Separar la identidad real del estudiante de los datos usados para análisis.

**Criterios de aceptación:**
- [ ] Existe tabla/esquema separado que mapea identidad real (nombre, matrícula/RNE) a `id_estudiante_hash`.
- [ ] El hash usa un salt gestionado de forma segura, no derivable desde la matrícula.
- [ ] Ninguna de las tablas de la sección 1–4 contiene nombre o matrícula en claro.
- [ ] El acceso al esquema de mapeo identidad↔hash está restringido por rol (principio de mínimo privilegio).

---

## 6. Job de validación de calidad de dato

**Funcionalidad:** Generar métricas de completitud e inconsistencia por estudiante/registro.

**Criterios de aceptación:**
- [ ] Job programado (semanal) calcula `porcentaje_campos_completos_por_registro`.
- [ ] Job calcula `dias_desde_ultima_actualizacion_por_estudiante`.
- [ ] Job detecta inconsistencias (ej. `reprobo_asignatura = false` con `calificacion` bajo nota mínima) y las reporta.
- [ ] Resultado exportable (endpoint o archivo) para revisión del equipo, sin exponer datos identificables.

---

## Definition of Done (cierre de esta fase)

- [ ] Las 6 secciones anteriores están implementadas y desplegadas en producción.
- [ ] Ningún dato identificable (nombre, matrícula/RNE) existe fuera del esquema de mapeo controlado.
- [ ] Existe documentación de consentimiento institucional para el uso secundario de estos datos, archivada junto al proyecto.