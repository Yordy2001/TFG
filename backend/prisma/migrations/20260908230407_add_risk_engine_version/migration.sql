-- AlterTable
ALTER TABLE "historial_riesgo" ADD COLUMN     "versionReglasRiskEngine" TEXT NOT NULL DEFAULT '1.0.0';

-- AlterTable
ALTER TABLE "riesgos" ADD COLUMN     "versionReglasRiskEngine" TEXT NOT NULL DEFAULT '1.0.0';
