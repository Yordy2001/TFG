-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMINISTRADOR', 'REGISTRO', 'DIRECTOR', 'DOCENTE', 'ORIENTADOR');

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "NivelRiesgo" AS ENUM ('BAJO', 'MEDIO', 'ALTO');

-- CreateEnum
CREATE TYPE "EstadoAsistencia" AS ENUM ('PRESENTE', 'AUSENTE', 'TARDANZA');

-- CreateEnum
CREATE TYPE "EstadoSeguimiento" AS ENUM ('ABIERTO', 'EN_PROCESO', 'CERRADO');

-- CreateEnum
CREATE TYPE "Competencia" AS ENUM ('C1_COMUNICATIVA', 'C2_LOGICO_CIENTIFICA', 'C3_ETICA_CIUDADANA');

-- CreateEnum
CREATE TYPE "PeriodoEvaluativo" AS ENUM ('P1', 'P2', 'P3', 'P4');

-- CreateEnum
CREATE TYPE "CategoriaObservacion" AS ENUM ('INCIDENTE', 'ACTITUD_POSITIVA', 'CONVIVENCIA', 'OBSERVACION_ACADEMICA');

-- CreateTable
CREATE TABLE "centros_educativos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "distritoEducativo" TEXT NOT NULL,
    "regional" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "director" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "centros_educativos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "centroId" TEXT NOT NULL,
    "rol" "Role" NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cursos" (
    "id" TEXT NOT NULL,
    "centroId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "gradoNivel" TEXT NOT NULL,
    "seccion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estudiantes" (
    "id" TEXT NOT NULL,
    "centroId" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "sexo" "Sexo" NOT NULL,
    "fechaNacimiento" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "incidentesDisciplinarios" INTEGER NOT NULL DEFAULT 0,
    "fotoArchivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estudiantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaturas" (
    "id" TEXT NOT NULL,
    "centroId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asignaturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periodos_academicos" (
    "id" TEXT NOT NULL,
    "centroId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "periodos_academicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaciones_docentes" (
    "id" TEXT NOT NULL,
    "centroId" TEXT NOT NULL,
    "docenteId" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "asignaturaId" TEXT NOT NULL,
    "periodoAcademicoId" TEXT NOT NULL,

    CONSTRAINT "asignaciones_docentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actividades_evaluacion" (
    "id" TEXT NOT NULL,
    "centroId" TEXT NOT NULL,
    "asignacionDocenteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "competencia" "Competencia" NOT NULL,
    "porcentaje" INTEGER NOT NULL,
    "periodoEvaluativo" "PeriodoEvaluativo" NOT NULL,
    "fecha" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actividades_evaluacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_evaluacion" (
    "id" TEXT NOT NULL,
    "centroId" TEXT NOT NULL,
    "actividadId" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registros_evaluacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencias" (
    "id" TEXT NOT NULL,
    "centroId" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "asignacionDocenteId" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "estado" "EstadoAsistencia" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seguimientos_orientador" (
    "id" TEXT NOT NULL,
    "centroId" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "orientadorId" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "observaciones" TEXT NOT NULL,
    "acciones" TEXT NOT NULL,
    "proximaCita" TEXT,
    "estado" "EstadoSeguimiento" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seguimientos_orientador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "riesgos" (
    "id" TEXT NOT NULL,
    "centroId" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "porcentaje" INTEGER NOT NULL,
    "nivel" "NivelRiesgo" NOT NULL,
    "fechaCalculo" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "riesgos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_riesgo" (
    "id" TEXT NOT NULL,
    "centroId" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "porcentajeOriginal" INTEGER NOT NULL,
    "ajusteAplicado" INTEGER NOT NULL,
    "porcentajeFinal" INTEGER NOT NULL,
    "nivel" "NivelRiesgo" NOT NULL,
    "usuarioId" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "historial_riesgo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "observaciones_aula" (
    "id" TEXT NOT NULL,
    "centroId" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "asignaturaId" TEXT,
    "docenteId" TEXT NOT NULL,
    "categoria" "CategoriaObservacion" NOT NULL,
    "fecha" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "observaciones_aula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "centros_educativos_codigo_key" ON "centros_educativos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_centroId_idx" ON "usuarios"("centroId");

-- CreateIndex
CREATE INDEX "cursos_centroId_idx" ON "cursos"("centroId");

-- CreateIndex
CREATE UNIQUE INDEX "estudiantes_matricula_key" ON "estudiantes"("matricula");

-- CreateIndex
CREATE INDEX "estudiantes_centroId_idx" ON "estudiantes"("centroId");

-- CreateIndex
CREATE INDEX "estudiantes_cursoId_idx" ON "estudiantes"("cursoId");

-- CreateIndex
CREATE INDEX "asignaturas_centroId_idx" ON "asignaturas"("centroId");

-- CreateIndex
CREATE INDEX "periodos_academicos_centroId_idx" ON "periodos_academicos"("centroId");

-- CreateIndex
CREATE INDEX "asignaciones_docentes_centroId_idx" ON "asignaciones_docentes"("centroId");

-- CreateIndex
CREATE INDEX "asignaciones_docentes_docenteId_idx" ON "asignaciones_docentes"("docenteId");

-- CreateIndex
CREATE INDEX "asignaciones_docentes_cursoId_idx" ON "asignaciones_docentes"("cursoId");

-- CreateIndex
CREATE INDEX "actividades_evaluacion_centroId_idx" ON "actividades_evaluacion"("centroId");

-- CreateIndex
CREATE INDEX "actividades_evaluacion_asignacionDocenteId_idx" ON "actividades_evaluacion"("asignacionDocenteId");

-- CreateIndex
CREATE INDEX "registros_evaluacion_centroId_idx" ON "registros_evaluacion"("centroId");

-- CreateIndex
CREATE INDEX "registros_evaluacion_actividadId_idx" ON "registros_evaluacion"("actividadId");

-- CreateIndex
CREATE INDEX "registros_evaluacion_estudianteId_idx" ON "registros_evaluacion"("estudianteId");

-- CreateIndex
CREATE INDEX "asistencias_centroId_idx" ON "asistencias"("centroId");

-- CreateIndex
CREATE INDEX "asistencias_estudianteId_idx" ON "asistencias"("estudianteId");

-- CreateIndex
CREATE INDEX "asistencias_asignacionDocenteId_idx" ON "asistencias"("asignacionDocenteId");

-- CreateIndex
CREATE INDEX "seguimientos_orientador_centroId_idx" ON "seguimientos_orientador"("centroId");

-- CreateIndex
CREATE INDEX "seguimientos_orientador_estudianteId_idx" ON "seguimientos_orientador"("estudianteId");

-- CreateIndex
CREATE INDEX "riesgos_centroId_idx" ON "riesgos"("centroId");

-- CreateIndex
CREATE INDEX "riesgos_estudianteId_idx" ON "riesgos"("estudianteId");

-- CreateIndex
CREATE INDEX "historial_riesgo_centroId_idx" ON "historial_riesgo"("centroId");

-- CreateIndex
CREATE INDEX "historial_riesgo_estudianteId_idx" ON "historial_riesgo"("estudianteId");

-- CreateIndex
CREATE INDEX "observaciones_aula_centroId_idx" ON "observaciones_aula"("centroId");

-- CreateIndex
CREATE INDEX "observaciones_aula_estudianteId_idx" ON "observaciones_aula"("estudianteId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_usuarioId_idx" ON "refresh_tokens"("usuarioId");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "centros_educativos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cursos" ADD CONSTRAINT "cursos_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "centros_educativos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estudiantes" ADD CONSTRAINT "estudiantes_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "centros_educativos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estudiantes" ADD CONSTRAINT "estudiantes_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaturas" ADD CONSTRAINT "asignaturas_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "centros_educativos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodos_academicos" ADD CONSTRAINT "periodos_academicos_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "centros_educativos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_docentes" ADD CONSTRAINT "asignaciones_docentes_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "centros_educativos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_docentes" ADD CONSTRAINT "asignaciones_docentes_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_docentes" ADD CONSTRAINT "asignaciones_docentes_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_docentes" ADD CONSTRAINT "asignaciones_docentes_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "asignaturas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_docentes" ADD CONSTRAINT "asignaciones_docentes_periodoAcademicoId_fkey" FOREIGN KEY ("periodoAcademicoId") REFERENCES "periodos_academicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades_evaluacion" ADD CONSTRAINT "actividades_evaluacion_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "centros_educativos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades_evaluacion" ADD CONSTRAINT "actividades_evaluacion_asignacionDocenteId_fkey" FOREIGN KEY ("asignacionDocenteId") REFERENCES "asignaciones_docentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_evaluacion" ADD CONSTRAINT "registros_evaluacion_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "centros_educativos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_evaluacion" ADD CONSTRAINT "registros_evaluacion_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "actividades_evaluacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_evaluacion" ADD CONSTRAINT "registros_evaluacion_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "estudiantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "centros_educativos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "estudiantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_asignacionDocenteId_fkey" FOREIGN KEY ("asignacionDocenteId") REFERENCES "asignaciones_docentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguimientos_orientador" ADD CONSTRAINT "seguimientos_orientador_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "centros_educativos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguimientos_orientador" ADD CONSTRAINT "seguimientos_orientador_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "estudiantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguimientos_orientador" ADD CONSTRAINT "seguimientos_orientador_orientadorId_fkey" FOREIGN KEY ("orientadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riesgos" ADD CONSTRAINT "riesgos_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "centros_educativos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riesgos" ADD CONSTRAINT "riesgos_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "estudiantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_riesgo" ADD CONSTRAINT "historial_riesgo_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "centros_educativos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_riesgo" ADD CONSTRAINT "historial_riesgo_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "estudiantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observaciones_aula" ADD CONSTRAINT "observaciones_aula_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "centros_educativos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observaciones_aula" ADD CONSTRAINT "observaciones_aula_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "estudiantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observaciones_aula" ADD CONSTRAINT "observaciones_aula_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observaciones_aula" ADD CONSTRAINT "observaciones_aula_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "asignaturas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observaciones_aula" ADD CONSTRAINT "observaciones_aula_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
