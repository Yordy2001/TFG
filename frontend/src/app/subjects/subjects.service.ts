import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiResponse } from '../core/models/api-response.model';
import { AsignacionDocente, Asignatura } from '../core/models/domain.model';
import { API_BASE_URL } from '../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class SubjectsService {
  constructor(private readonly http: HttpClient) {}

  findAll() {
    return this.http.get<ApiResponse<Asignatura[]>>(`${API_BASE_URL}/subjects`).pipe(map((res) => res.data));
  }

  create(nombre: string) {
    return this.http
      .post<ApiResponse<Asignatura>>(`${API_BASE_URL}/subjects`, { nombre })
      .pipe(map((res) => res.data));
  }

  findAssignments(docenteId?: string) {
    const params: Record<string, string> = docenteId ? { docenteId } : {};
    return this.http
      .get<ApiResponse<AsignacionDocente[]>>(`${API_BASE_URL}/subjects/assignments/all`, { params })
      .pipe(map((res) => res.data));
  }
}
