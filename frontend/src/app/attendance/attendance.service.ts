import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiResponse } from '../core/models/api-response.model';
import { EstadoAsistencia } from '../core/models/domain.model';
import { API_BASE_URL } from '../core/config/api.config';

export interface AttendanceSummary {
  historial: { id: string; fecha: string; estado: EstadoAsistencia }[];
  asistencia: number;
  ausencias: number;
  tardanzas: number;
}

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  constructor(private readonly http: HttpClient) {}

  register(estudianteId: string, asignacionDocenteId: string, fecha: string, estado: EstadoAsistencia) {
    return this.http
      .post<ApiResponse<unknown>>(`${API_BASE_URL}/attendance`, { estudianteId, asignacionDocenteId, fecha, estado })
      .pipe(map((res) => res.data));
  }

  summary(estudianteId: string) {
    return this.http
      .get<ApiResponse<AttendanceSummary>>(`${API_BASE_URL}/attendance/students/${estudianteId}`)
      .pipe(map((res) => res.data));
  }
}
