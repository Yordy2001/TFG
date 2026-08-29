import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, of, switchMap, tap } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { AuthUser, LoginResponse } from '../models/auth.model';
import { API_BASE_URL } from '../config/api.config';

const REFRESH_STORAGE_KEY = 'refresh_token';

/**
 * Access token lives only in memory (never localStorage) per the security
 * architecture doc. Refresh token is kept in localStorage for the MVP to
 * allow session survival across reloads; this is documented as a known
 * simplification, not a production-grade pattern.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly accessToken = signal<string | null>(null);
  private readonly currentUser = signal<AuthUser | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this.accessToken());

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  getAccessToken(): string | null {
    return this.accessToken();
  }

  /** Reflects self-service profile edits (GDE-007) in the cached user, e.g. so the top bar updates immediately. */
  updateCurrentUser(patch: Partial<AuthUser>) {
    const current = this.currentUser();
    if (!current) return;
    this.currentUser.set({ ...current, ...patch });
  }

  login(email: string, password: string) {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${API_BASE_URL}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          this.accessToken.set(res.data.accessToken);
          this.currentUser.set(res.data.user);
          localStorage.setItem(REFRESH_STORAGE_KEY, res.data.refreshToken);
        }),
      );
  }

  /** Attempts to restore a session from the stored refresh token (e.g. after a page reload). */
  restoreSession() {
    const refreshToken = localStorage.getItem(REFRESH_STORAGE_KEY);
    if (!refreshToken) {
      return of(null);
    }
    return this.http
      .post<ApiResponse<{ accessToken: string; refreshToken: string }>>(`${API_BASE_URL}/auth/refresh`, {
        refreshToken,
      })
      .pipe(
        tap((res) => this.accessToken.set(res.data.accessToken)),
        tap((res) => localStorage.setItem(REFRESH_STORAGE_KEY, res.data.refreshToken)),
        switchMap(() => this.http.get<ApiResponse<{ id: string; nombres: string; apellidos: string; email: string; rol: string; centroId: string }>>(`${API_BASE_URL}/users/me`)),
        tap((res) =>
          this.currentUser.set({
            id: res.data.id,
            nombres: res.data.nombres,
            apellidos: res.data.apellidos,
            email: res.data.email,
            role: res.data.rol as AuthUser['role'],
            centroId: res.data.centroId,
          }),
        ),
        catchError(() => {
          localStorage.removeItem(REFRESH_STORAGE_KEY);
          return of(null);
        }),
      );
  }

  logout() {
    const refreshToken = localStorage.getItem(REFRESH_STORAGE_KEY);
    localStorage.removeItem(REFRESH_STORAGE_KEY);
    this.accessToken.set(null);
    this.currentUser.set(null);
    if (refreshToken) {
      this.http.post(`${API_BASE_URL}/auth/logout`, { refreshToken }).subscribe();
    }
    this.router.navigate(['/auth/login']);
  }
}
