import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiResponse } from '../core/models/api-response.model';
import { API_BASE_URL } from '../core/config/api.config';

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
}

@Injectable({ providedIn: 'root' })
export class SchoolsService {
  constructor(private readonly http: HttpClient) {}

  findMine() {
    return this.http.get<ApiResponse<CentroEducativo>>(`${API_BASE_URL}/schools/me`).pipe(map((res) => res.data));
  }
}
