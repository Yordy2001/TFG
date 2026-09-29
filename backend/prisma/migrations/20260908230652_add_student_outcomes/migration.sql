-- CreateEnum
CREATE TYPE "EstadoFinalPeriodo" AS ENUM ('ACTIVO', 'ABANDONO', 'TRASLADO', 'EGRESADO', 'FALLECIDO');

-- CreateEnum
CREATE TYPE "FuenteConfirmacion" AS ENUM ('SIGERD', 'REGISTRO_MANUAL_CENTRO', 'ORIENTADOR');

-- CreateTable
CREATE TABLE "desenlaces_estudiante" (
    "id" TEXT NOT NULL,
    "centroId" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "periodoAcademicoId" TEXT NOT NULL,
    "estadoFinalPeriodo" "EstadoFinalPeriodo" NOT NULL,
    "fechaEvento" DATE,
    "motivoRegistradoSalida" TEXT,
    "fuenteConfirmacion" "FuenteConfirmacion" NOT NULL,
    "confirmadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "desenlaces_estudiante_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "desenlaces_estudiante_centroId_idx" ON "desenlaces_estudiante"("centroId");

-- CreateIndex
CREATE UNIQUE INDEX "desenlaces_estudiante_estudianteId_periodoAcademicoId_key" ON "desenlaces_estudiante"("estudianteId", "periodoAcademicoId");

-- AddForeignKey
ALTER TABLE "desenlaces_estudiante" ADD CONSTRAINT "desenlaces_estudiante_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "centros_educativos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "desenlaces_estudiante" ADD CONSTRAINT "desenlaces_estudiante_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "estudiantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "desenlaces_estudiante" ADD CONSTRAINT "desenlaces_estudiante_periodoAcademicoId_fkey" FOREIGN KEY ("periodoAcademicoId") REFERENCES "periodos_academicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "desenlaces_estudiante" ADD CONSTRAINT "desenlaces_estudiante_confirmadoPorId_fkey" FOREIGN KEY ("confirmadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
