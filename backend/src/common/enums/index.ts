export * from './role.enum';

export enum NivelRiesgo {
  BAJO = 'BAJO',
  MEDIO = 'MEDIO',
  ALTO = 'ALTO',
}

export enum EstadoAsistencia {
  PRESENTE = 'PRESENTE',
  AUSENTE = 'AUSENTE',
  TARDANZA = 'TARDANZA',
}

export enum EstadoSeguimiento {
  ABIERTO = 'ABIERTO',
  EN_PROCESO = 'EN_PROCESO',
  CERRADO = 'CERRADO',
}

export enum Competencia {
  C1_COMUNICATIVA = 'C1_COMUNICATIVA',
  C2_LOGICO_CIENTIFICA = 'C2_LOGICO_CIENTIFICA',
  C3_ETICA_CIUDADANA = 'C3_ETICA_CIUDADANA',
}

export enum PeriodoEvaluativo {
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3',
  P4 = 'P4',
}

export enum Sexo {
  M = 'M',
  F = 'F',
}

export enum CategoriaObservacion {
  INCIDENTE = 'INCIDENTE',
  ACTITUD_POSITIVA = 'ACTITUD_POSITIVA',
  CONVIVENCIA = 'CONVIVENCIA',
  OBSERVACION_ACADEMICA = 'OBSERVACION_ACADEMICA',
}
