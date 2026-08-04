import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiResponse } from '../core/models/api-response.model';
import { EstadoSeguimiento, SeguimientoOrientador } from '../core/models/domain.model';
import { API_BASE_URL } from '../core/config/api.config';

export interface CreateFollowUpPayload {
  estudianteId: string;
  fecha: string;
  motivo: string;
  observaciones: string;
  acciones: string;
  proximaCita?: string;
}

@Injectable({ providedIn: 'root' })
export class FollowUpService {
  constructor(private readonly http: HttpClient) {}

  byStudent(estudianteId: string) {
    return this.http
      .get<ApiResponse<SeguimientoOrientador[]>>(`${API_BASE_URL}/follow-up/students/${estudianteId}`)
      .pipe(map((res) => res.data));
  }

  create(payload: CreateFollowUpPayload) {
    return this.http
      .post<ApiResponse<SeguimientoOrientador>>(`${API_BASE_URL}/follow-up`, payload)
      .pipe(map((res) => res.data));
  }

  updateEstado(id: string, estado: EstadoSeguimiento) {
    return this.http
      .patch<ApiResponse<SeguimientoOrientador>>(`${API_BASE_URL}/follow-up/${id}`, { estado })
      .pipe(map((res) => res.data));
  }
}
