-- CreateTable
CREATE TABLE "reportes_calidad_dato" (
    "id" TEXT NOT NULL,
    "centroId" TEXT NOT NULL,
    "generadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entidad" TEXT NOT NULL,
    "porcentajeCamposCompletos" DOUBLE PRECISION NOT NULL,
    "diasDesdeUltimaActualizacionPromedio" INTEGER NOT NULL,
    "inconsistenciasDetectadas" INTEGER NOT NULL,
    "detalleJson" JSONB NOT NULL,

    CONSTRAINT "reportes_calidad_dato_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reportes_calidad_dato_centroId_idx" ON "reportes_calidad_dato"("centroId");

-- CreateIndex
CREATE INDEX "reportes_calidad_dato_generadoEn_idx" ON "reportes_calidad_dato"("generadoEn");

-- AddForeignKey
ALTER TABLE "reportes_calidad_dato" ADD CONSTRAINT "reportes_calidad_dato_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "centros_educativos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
