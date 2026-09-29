-- AlterEnum
ALTER TYPE "EstadoAsistencia" ADD VALUE 'AUSENCIA_JUSTIFICADA';

-- CreateTable
CREATE TABLE "historial_academico" (
    "id" TEXT NOT NULL,
    "centroId" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "asignaturaId" TEXT NOT NULL,
    "periodoEvaluativo" "PeriodoEvaluativo" NOT NULL,
    "calificacion" DECIMAL(5,2) NOT NULL,
    "reprobo" BOOLEAN NOT NULL,
    "numeroVecesRepitenciaAcumulada" INTEGER NOT NULL DEFAULT 0,
    "calculadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_academico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agregados_asistencia_mensual" (
    "id" TEXT NOT NULL,
    "centroId" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "anioMes" TEXT NOT NULL,
    "porcentajeAsistenciaMensual" DECIMAL(5,2) NOT NULL,
    "rachaMaximaAusenciasConsecutivas" INTEGER NOT NULL,
    "calculadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agregados_asistencia_mensual_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "historial_academico_centroId_idx" ON "historial_academico"("centroId");

-- CreateIndex
CREATE UNIQUE INDEX "historial_academico_estudianteId_asignaturaId_periodoEvalua_key" ON "historial_academico"("estudianteId", "asignaturaId", "periodoEvaluativo");

-- CreateIndex
CREATE INDEX "agregados_asistencia_mensual_centroId_idx" ON "agregados_asistencia_mensual"("centroId");

-- CreateIndex
CREATE UNIQUE INDEX "agregados_asistencia_mensual_estudianteId_anioMes_key" ON "agregados_asistencia_mensual"("estudianteId", "anioMes");

-- AddForeignKey
ALTER TABLE "historial_academico" ADD CONSTRAINT "historial_academico_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "centros_educativos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_academico" ADD CONSTRAINT "historial_academico_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "estudiantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_academico" ADD CONSTRAINT "historial_academico_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "asignaturas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agregados_asistencia_mensual" ADD CONSTRAINT "agregados_asistencia_mensual_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "centros_educativos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agregados_asistencia_mensual" ADD CONSTRAINT "agregados_asistencia_mensual_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "estudiantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
