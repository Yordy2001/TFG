-- AlterEnum
ALTER TYPE "EstadoSeguimiento" ADD VALUE 'PENDIENTE_INTERVENCION';

-- AlterTable
ALTER TABLE "seguimientos_orientador" ADD COLUMN     "apoyoFamiliarPercibido" INTEGER,
ADD COLUMN     "distanciaHogarEscuelaKm" DECIMAL(5,2),
ADD COLUMN     "factorAjusteOrientador" DECIMAL(5,2),
ADD COLUMN     "problemasFamiliaresReportados" BOOLEAN,
ADD COLUMN     "senalesPreviasAbandono" BOOLEAN,
ADD COLUMN     "situacionEconomicaFamiliar" INTEGER,
ADD COLUMN     "trabajaDurantePeriodoEscolar" BOOLEAN;

-- CreateTable
CREATE TABLE "historial_estado_seguimiento" (
    "id" TEXT NOT NULL,
    "centroId" TEXT NOT NULL,
    "seguimientoId" TEXT NOT NULL,
    "estado" "EstadoSeguimiento" NOT NULL,
    "cambiadoPorId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_estado_seguimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "historial_estado_seguimiento_seguimientoId_idx" ON "historial_estado_seguimiento"("seguimientoId");

-- CreateIndex
CREATE INDEX "historial_estado_seguimiento_centroId_idx" ON "historial_estado_seguimiento"("centroId");

-- AddForeignKey
ALTER TABLE "historial_estado_seguimiento" ADD CONSTRAINT "historial_estado_seguimiento_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "centros_educativos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estado_seguimiento" ADD CONSTRAINT "historial_estado_seguimiento_seguimientoId_fkey" FOREIGN KEY ("seguimientoId") REFERENCES "seguimientos_orientador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estado_seguimiento" ADD CONSTRAINT "historial_estado_seguimiento_cambiadoPorId_fkey" FOREIGN KEY ("cambiadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
