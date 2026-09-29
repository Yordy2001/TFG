-- CreateTable
CREATE TABLE "identidad_estudiante_mapping" (
    "id" TEXT NOT NULL,
    "centroId" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "estudianteHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "identidad_estudiante_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "identidad_estudiante_mapping_estudianteId_key" ON "identidad_estudiante_mapping"("estudianteId");

-- CreateIndex
CREATE UNIQUE INDEX "identidad_estudiante_mapping_estudianteHash_key" ON "identidad_estudiante_mapping"("estudianteHash");

-- CreateIndex
CREATE INDEX "identidad_estudiante_mapping_centroId_idx" ON "identidad_estudiante_mapping"("centroId");

-- AddForeignKey
ALTER TABLE "identidad_estudiante_mapping" ADD CONSTRAINT "identidad_estudiante_mapping_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "centros_educativos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identidad_estudiante_mapping" ADD CONSTRAINT "identidad_estudiante_mapping_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "estudiantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
