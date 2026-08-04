import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiResponse } from '../core/models/api-response.model';
import { ActividadEvaluacion, Competencia, PeriodoEvaluativo } from '../core/models/domain.model';
import { API_BASE_URL } from '../core/config/api.config';

export interface CreateActivityPayload {
  asignacionDocenteId: string;
  nombre: string;
  competencia: Competencia;
  porcentaje: number;
  periodoEvaluativo: PeriodoEvaluativo;
  fecha: string;
}

export interface AsignaturaResultado {
  asignaturaId: string;
  asignaturaNombre: string;
  promedioPeriodo: number;
  competencias: { competencia: string; promedio: number }[];
}

@Injectable({ providedIn: 'root' })
export class EvaluationsService {
  constructor(private readonly http: HttpClient) {}

  activitiesByAssignment(asignacionDocenteId: string) {
    return this.http
      .get<ApiResponse<ActividadEvaluacion[]>>(`${API_BASE_URL}/evaluations/activities`, {
        params: { asignacionDocenteId },
      })
      .pipe(map((res) => res.data));
  }

  createActivity(payload: CreateActivityPayload) {
    return this.http
      .post<ApiResponse<ActividadEvaluacion>>(`${API_BASE_URL}/evaluations/activities`, payload)
      .pipe(map((res) => res.data));
  }

  registerGrade(actividadId: string, estudianteId: string, nota: number) {
    return this.http
      .post<ApiResponse<unknown>>(`${API_BASE_URL}/evaluations/grades`, { actividadId, estudianteId, nota })
      .pipe(map((res) => res.data));
  }

  resultadosEstudiante(estudianteId: string, cursoId: string) {
    return this.http
      .get<ApiResponse<{ asignaturas: AsignaturaResultado[]; promedioGeneral: number }>>(
        `${API_BASE_URL}/evaluations/students/${estudianteId}/results`,
        { params: { cursoId } },
      )
      .pipe(map((res) => res.data));
  }
}
