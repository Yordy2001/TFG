/*
  Warnings:

  - You are about to alter the column `porcentajeAsistenciaMensual` on the `agregados_asistencia_mensual` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `DoublePrecision`.
  - You are about to alter the column `calificacion` on the `historial_academico` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `DoublePrecision`.
  - You are about to alter the column `distanciaHogarEscuelaKm` on the `seguimientos_orientador` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `DoublePrecision`.
  - You are about to alter the column `factorAjusteOrientador` on the `seguimientos_orientador` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "agregados_asistencia_mensual" ALTER COLUMN "porcentajeAsistenciaMensual" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "historial_academico" ALTER COLUMN "calificacion" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "seguimientos_orientador" ALTER COLUMN "distanciaHogarEscuelaKm" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "factorAjusteOrientador" SET DATA TYPE DOUBLE PRECISION;
