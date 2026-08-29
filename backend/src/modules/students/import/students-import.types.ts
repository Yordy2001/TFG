export type ImportRowStatus = 'valida' | 'advertencia' | 'error';

export interface ImportRowResult {
  fila: number;
  matricula: string;
  nombres: string;
  apellidos: string;
  sexo: string;
  fechaNacimiento: string;
  cursoNombre: string;
  cursoId: string | null;
  estado: ImportRowStatus;
  errores: string[];
  advertencias: string[];
}

export interface ImportReport {
  totalFilas: number;
  validas: number;
  conAdvertencias: number;
  invalidas: number;
  filas: ImportRowResult[];
}

export interface ImportConfirmSummary {
  total: number;
  importados: number;
  rechazados: number;
  detalle: ImportRowResult[];
}

export const IMPORT_REQUIRED_HEADERS = [
  'Matrícula',
  'Nombres',
  'Apellidos',
  'Sexo',
  'Fecha de nacimiento',
  'Curso',
] as const;
