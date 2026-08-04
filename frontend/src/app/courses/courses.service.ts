import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiResponse } from '../core/models/api-response.model';
import { Curso } from '../core/models/domain.model';
import { API_BASE_URL } from '../core/config/api.config';

export type CreateCoursePayload = Omit<Curso, 'id' | 'centroId'>;

@Injectable({ providedIn: 'root' })
export class CoursesService {
  constructor(private readonly http: HttpClient) {}

  findAll() {
    return this.http.get<ApiResponse<Curso[]>>(`${API_BASE_URL}/courses`).pipe(map((res) => res.data));
  }

  create(payload: CreateCoursePayload) {
    return this.http.post<ApiResponse<Curso>>(`${API_BASE_URL}/courses`, payload).pipe(map((res) => res.data));
  }
}
