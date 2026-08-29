-- DropIndex
DROP INDEX "registros_evaluacion_actividadId_idx";

-- DropIndex
DROP INDEX "registros_evaluacion_estudianteId_idx";

-- DropIndex
DROP INDEX "riesgos_estudianteId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "registros_evaluacion_actividadId_estudianteId_key" ON "registros_evaluacion"("actividadId", "estudianteId");

-- CreateIndex
CREATE UNIQUE INDEX "riesgos_estudianteId_key" ON "riesgos"("estudianteId");
