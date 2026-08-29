export * from './role.enum';

// Re-exported from the Prisma-generated client so the same enum type flows through
// DTOs, class-validator, and Prisma queries without nominal-typing mismatches.
export {
  NivelRiesgo,
  EstadoAsistencia,
  EstadoSeguimiento,
  Competencia,
  PeriodoEvaluativo,
  Sexo,
  CategoriaObservacion,
} from '@prisma/client';
