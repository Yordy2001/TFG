import { Role } from '../enums/role.enum';
import {
  CategoriaObservacion,
  Competencia,
  EstadoAsistencia,
  EstadoSeguimiento,
  NivelRiesgo,
  PeriodoEvaluativo,
  Sexo,
} from '../enums';

export interface CentroEducativo {
  id: string;
  codigo: string;
  nombre: string;
  telefono: string;
  distritoEducativo: string;
  regional: string;
  provincia: string;
  municipio: string;
  director: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Usuario {
  id: string;
  centroId: string;
  rol: Role;
  nombres: string;
  apellidos: string;
  email: string;
  passwordHash: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Curso {
  id: string;
  centroId: string;
  nombre: string;
  gradoNivel: string;
  seccion: string;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface Asignatura {
  id: string;
  centroId: string;
  nombre: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PeriodoAcademico {
  id: string;
  centroId: string;
  nombre: string; // e.g. 2026-2027
  activo: boolean;
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
  centroId: string;
  asignacionDocenteId: string;
  nombre: string;
  competencia: Competencia;
  porcentaje: number;
  periodoEvaluativo: PeriodoEvaluativo;
  fecha: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegistroEvaluacion {
  id: string;
  centroId: string;
  actividadId: string;
  estudianteId: string;
  nota: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AsistenciaRegistro {
  id: string;
  centroId: string;
  estudianteId: string;
  asignacionDocenteId: string;
  fecha: string;
  estado: EstadoAsistencia;
  createdAt: Date;
}

export interface SeguimientoOrientador {
  id: string;
  centroId: string;
  estudianteId: string;
  orientadorId: string;
  fecha: string;
  motivo: string;
  observaciones: string;
  acciones: string;
  proximaCita: string | null;
  estado: EstadoSeguimiento;
  createdAt: Date;
  updatedAt: Date;
}

export interface Riesgo {
  id: string;
  centroId: string;
  estudianteId: string;
  porcentaje: number;
  nivel: NivelRiesgo;
  fechaCalculo: Date;
}

export interface HistorialRiesgo {
  id: string;
  centroId: string;
  estudianteId: string;
  porcentajeOriginal: number;
  ajusteAplicado: number;
  porcentajeFinal: number;
  nivel: NivelRiesgo;
  usuarioId: string | null;
  fecha: Date;
}

export interface ObservacionAula {
  id: string;
  centroId: string;
  estudianteId: string;
  cursoId: string;
  asignaturaId: string | null;
  docenteId: string;
  categoria: CategoriaObservacion;
  fecha: string;
  descripcion: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshTokenRecord {
  id: string;
  usuarioId: string;
  token: string;
  expiresAt: Date;
  revoked: boolean;
}
