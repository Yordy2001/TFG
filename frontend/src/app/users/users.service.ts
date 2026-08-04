import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiResponse } from '../core/models/api-response.model';
import { Role } from '../core/models/auth.model';
import { API_BASE_URL } from '../core/config/api.config';

export interface UserRecord {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  rol: Role;
  activo: boolean;
}

export interface CreateUserPayload {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  rol: Role;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private readonly http: HttpClient) {}

  findAll() {
    return this.http.get<ApiResponse<UserRecord[]>>(`${API_BASE_URL}/users`).pipe(map((res) => res.data));
  }

  create(payload: CreateUserPayload) {
    return this.http.post<ApiResponse<UserRecord>>(`${API_BASE_URL}/users`, payload).pipe(map((res) => res.data));
  }

  setActive(id: string, activo: boolean) {
    return this.http
      .patch<ApiResponse<UserRecord>>(`${API_BASE_URL}/users/${id}`, { activo })
      .pipe(map((res) => res.data));
  }
}
