import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiResponse } from '../core/models/api-response.model';
import { DashboardOverview } from '../core/models/domain.model';
import { API_BASE_URL } from '../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly http: HttpClient) {}

  overview() {
    return this.http
      .get<ApiResponse<DashboardOverview>>(`${API_BASE_URL}/dashboard/overview`)
      .pipe(map((res) => res.data));
  }
}
