# Documento de Requisitos del Proyecto (PRD): GuardianEdu

## 1. Visión General del Proyecto
**GuardianEdu** es una plataforma web institucional diseñada para la detección temprana y prevención del abandono escolar. El sistema permite a profesores, rectores y orientadores identificar patrones de riesgo de manera proactiva a través del monitoreo de asistencia, calificaciones y observaciones cualitativas.

## 2. Objetivos Estratégicos
*   **Detección Temprana:** Identificar automáticamente a estudiantes con alta probabilidad de deserción.
*   **Eficiencia Operativa:** Reducir la carga administrativa de los docentes mediante interfaces de registro rápidas.
*   **Seguridad y Confidencialidad:** Proteger la información sensible y confidencial de los estudiantes.
*   **Acción Oportuna:** Facilitar la comunicación entre docentes y orientadores para intervenciones inmediatas.

## 3. Perfiles de Usuario (Personas)
1.  **Docente:** Registra asistencias y calificaciones; recibe alertas sobre el rendimiento de su clase.
2.  **Orientador / Psicólogo:** Gestiona la bitácora confidencial, realiza seguimiento emocional y propone intervenciones.
3.  **Administrador / Rector:** Supervisa métricas generales del centro y gestiona el acceso al sistema.

## 4. Alcance del Producto (Pantallas)

### 4.1. Gestión de Acceso (Login)
*   Autenticación mediante credenciales institucionales.
*   Recuperación de contraseña y soporte técnico.

### 4.2. Panel de Control (Dashboard)
*   Vista general de métricas clave (Estudiantes matriculados, Alerta de Alto Riesgo).
*   Sección de "Atención Inmediata" priorizada por IA/patrones de datos.
*   Historial de intervenciones recientes.

### 4.3. Perfil del Estudiante
*   Información demográfica y de contacto.
*   **Tarjeta de Estado de Riesgo:** Visualización clara (Bajo, Medio, Alto) con indicadores críticos.
*   Línea de tiempo de eventos y alertas recientes.

### 4.4. Registro de Calificaciones
*   Tabla dinámica para ingreso de notas por periodo/semestre.
*   Indicadores visuales de rendimiento (Aprobado, En Riesgo, Excelente).
*   Exportación de reportes académicos.

### 4.5. Control de Asistencia
*   Checklist interactivo de marcaje rápido.
*   Categorización: Presente, Atraso, Inasistencia Justificada/Injustificada.
*   Resumen diario de asistencia grupal.

### 4.6. Bitácora del Orientador
*   Entradas confidenciales con editor de texto enriquecido.
*   Categorización de observaciones (Académico, Familiar, Emocional).
*   Historial cronológico de seguimiento.

## 5. Especificaciones de Diseño (Sistema Visual "Institutional Guardian")
*   **Paleta de Colores:** 
    *   Primario: Azul Ultramar (`#003366`) - Autoridad y seriedad.
    *   Acento/Alerta: Rojo Bermellón - Criticidad.
    *   Fondos: Blanco y Grises Claros - Claridad visual.
*   **Tipografía:** Inter (Sans-serif) para máxima legibilidad en datos tabulares.
*   **Componentes:** Navegación lateral fija (Sidebar), Barra superior con búsqueda global y perfil de usuario.

## 6. Requisitos Técnicos
*   **Arquitectura:** HTML5 semántico con Layouts basados en CSS Grid y Flexbox.
*   **Responsividad:** Optimizado para Desktop (laptops institucionales) y tablets.
*   **Accesibilidad:** Cumplimiento de estándares WCAG (alto contraste, estados :focus).
*   **Frameworks:** CSS nativo (sin dependencias externas pesadas para asegurar rendimiento).
