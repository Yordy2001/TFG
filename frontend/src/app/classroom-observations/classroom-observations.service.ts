import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiResponse } from '../core/models/api-response.model';
import { CategoriaObservacion, ObservacionAula } from '../core/models/domain.model';
import { API_BASE_URL } from '../core/config/api.config';

export interface CreateClassroomObservationPayload {
  estudianteId: string;
  asignaturaId?: string;
  fecha: string;
  categoria: CategoriaObservacion;
  descripcion: string;
}

@Injectable({ providedIn: 'root' })
export class ClassroomObservationsService {
  constructor(private readonly http: HttpClient) {}

  byStudent(estudianteId: string) {
    return this.http
      .get<ApiResponse<ObservacionAula[]>>(`${API_BASE_URL}/classroom-observations/students/${estudianteId}`)
      .pipe(map((res) => res.data));
  }

  create(payload: CreateClassroomObservationPayload) {
    return this.http
      .post<ApiResponse<ObservacionAula>>(`${API_BASE_URL}/classroom-observations`, payload)
      .pipe(map((res) => res.data));
  }

  remove(id: string) {
    return this.http
      .delete<ApiResponse<{ id: string }>>(`${API_BASE_URL}/classroom-observations/${id}`)
      .pipe(map((res) => res.data));
  }
}
