export enum Sexo {
  M = 'M',
  F = 'F',
}

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

export enum CategoriaObservacion {
  INCIDENTE = 'INCIDENTE',
  ACTITUD_POSITIVA = 'ACTITUD_POSITIVA',
  CONVIVENCIA = 'CONVIVENCIA',
  OBSERVACION_ACADEMICA = 'OBSERVACION_ACADEMICA',
}

export interface Curso {
  id: string;
  centroId: string;
  nombre: string;
  gradoNivel: string;
  seccion: string;
}

export interface Estudiante {
  id: string;
  centroId: string;
  cursoId: string;
  matricula: string;
  nombres: string;
  apellidos: string;
  sexo: Sexo;
  fechaNacimiento: string;
  activo: boolean;
  incidentesDisciplinarios: number;
  fotoArchivo: string | null;
}

export interface Asignatura {
  id: string;
  centroId: string;
  nombre: string;
}

export interface AsignacionDocente {
  id: string;
  centroId: string;
  docenteId: string;
  cursoId: string;
  asignaturaId: string;
  periodoAcademicoId: string;
}

export interface ActividadEvaluacion {
  id: string;
  asignacionDocenteId: string;
  nombre: string;
  competencia: Competencia;
  porcentaje: number;
  periodoEvaluativo: PeriodoEvaluativo;
  fecha: string;
}

export interface Riesgo {
  id: string;
  estudianteId: string;
  porcentaje: number;
  nivel: NivelRiesgo;
  fechaCalculo: string;
}

export interface HistorialRiesgo {
  id: string;
  estudianteId: string;
  porcentajeOriginal: number;
  ajusteAplicado: number;
  porcentajeFinal: number;
  nivel: NivelRiesgo;
  usuarioId: string | null;
  fecha: string;
}

export interface SeguimientoOrientador {
  id: string;
  estudianteId: string;
  orientadorId: string;
  fecha: string;
  motivo: string;
  observaciones: string;
  acciones: string;
  proximaCita: string | null;
  estado: EstadoSeguimiento;
}

export interface ObservacionAula {
  id: string;
  estudianteId: string;
  cursoId: string;
  asignaturaId: string | null;
  docenteId: string;
  categoria: CategoriaObservacion;
  fecha: string;
  descripcion: string;
  createdAt: string;
}

export interface DashboardOverview {
  totalEstudiantes: number;
  riesgoPorNivel: Record<NivelRiesgo, number>;
  distribucionSexo: Record<Sexo, number>;
  distribucionCurso: { cursoId: string; nombre: string; total: number }[];
  mayorRiesgo: {
    estudianteId: string;
    nombres: string;
    apellidos: string;
    matricula: string;
    porcentaje: number;
    nivel: NivelRiesgo;
  }[];
  ultimosSeguimientos: { id: string; estudianteId: string; fecha: string; estado: EstadoSeguimiento }[];
  alertasPendientes: number;
}
