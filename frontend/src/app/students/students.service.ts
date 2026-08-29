import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiResponse } from '../core/models/api-response.model';
import { Estudiante } from '../core/models/domain.model';
import { API_BASE_URL } from '../core/config/api.config';

export type CreateStudentPayload = Omit<Estudiante, 'id' | 'centroId' | 'activo' | 'incidentesDisciplinarios'>;

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

export interface ImportPreviewResult {
  totalFilas: number;
  validas: number;
  conAdvertencias: number;
  invalidas: number;
  filas: ImportRowResult[];
}

export interface ImportConfirmResult {
  total: number;
  importados: number;
  rechazados: number;
  detalle: ImportRowResult[];
}

@Injectable({ providedIn: 'root' })
export class StudentsService {
  constructor(private readonly http: HttpClient) {}

  findAll(cursoId?: string) {
    const params: Record<string, string> = cursoId ? { cursoId } : {};
    return this.http
      .get<ApiResponse<Estudiante[]>>(`${API_BASE_URL}/students`, { params })
      .pipe(map((res) => res.data));
  }

  findOne(id: string) {
    return this.http.get<ApiResponse<Estudiante>>(`${API_BASE_URL}/students/${id}`).pipe(map((res) => res.data));
  }

  create(payload: CreateStudentPayload) {
    return this.http.post<ApiResponse<Estudiante>>(`${API_BASE_URL}/students`, payload).pipe(map((res) => res.data));
  }

  update(id: string, payload: Partial<CreateStudentPayload>) {
    return this.http
      .patch<ApiResponse<Estudiante>>(`${API_BASE_URL}/students/${id}`, payload)
      .pipe(map((res) => res.data));
  }

  deactivate(id: string) {
    return this.http.delete<ApiResponse<Estudiante>>(`${API_BASE_URL}/students/${id}`).pipe(map((res) => res.data));
  }

  downloadImportTemplate() {
    return this.http.get(`${API_BASE_URL}/students/import/template`, { responseType: 'blob' });
  }

  previewImport(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<ApiResponse<ImportPreviewResult>>(`${API_BASE_URL}/students/import/preview`, formData)
      .pipe(map((res) => res.data));
  }

  confirmImport(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<ApiResponse<ImportConfirmResult>>(`${API_BASE_URL}/students/import/confirm`, formData)
      .pipe(map((res) => res.data));
  }
}
