import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiResponse } from '../core/models/api-response.model';
import { HistorialRiesgo, Riesgo } from '../core/models/domain.model';
import { API_BASE_URL } from '../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class RiskService {
  constructor(private readonly http: HttpClient) {}

  list() {
    return this.http.get<ApiResponse<Riesgo[]>>(`${API_BASE_URL}/risk`).pipe(map((res) => res.data));
  }

  current(estudianteId: string) {
    return this.http
      .get<ApiResponse<Riesgo>>(`${API_BASE_URL}/risk/students/${estudianteId}`)
      .pipe(map((res) => res.data));
  }

  history(estudianteId: string) {
    return this.http
      .get<ApiResponse<HistorialRiesgo[]>>(`${API_BASE_URL}/risk/students/${estudianteId}/history`)
      .pipe(map((res) => res.data));
  }

  applyAdjustment(estudianteId: string, ajuste: number) {
    return this.http
      .post<ApiResponse<Riesgo>>(`${API_BASE_URL}/risk/adjustment`, { estudianteId, ajuste })
      .pipe(map((res) => res.data));
  }
}
