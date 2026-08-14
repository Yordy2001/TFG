import { Component, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [FormsModule, MatIconModule],
  template: `
    <header class="card mb-6 flex items-center justify-between">
      <div>
        <p class="text-xs font-medium text-slate-400">{{ eyebrow() }}</p>
        <h1 class="text-lg font-semibold text-slate-900">{{ title() }}</h1>
      </div>

      <div class="flex items-center gap-4">
        <div class="relative hidden sm:block">
          <mat-icon class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 !h-4 !w-4 !text-[16px] text-slate-400"
            >search</mat-icon
          >
          <input
            type="search"
            [ngModel]="query()"
            (ngModelChange)="query.set($event)"
            placeholder="Buscar estudiante o reporte..."
            class="w-64 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm placeholder:text-slate-400 focus:border-[#003366] focus:outline-none focus:ring-1 focus:ring-[#003366]"
          />
        </div>

        <button type="button" class="text-slate-400 hover:text-[#003366]" aria-label="Notificaciones">
          <mat-icon class="!h-5 !w-5 !text-[20px]">notifications</mat-icon>
        </button>
        <button type="button" class="text-slate-400 hover:text-[#003366]" aria-label="Ayuda">
          <mat-icon class="!h-5 !w-5 !text-[20px]">help_outline</mat-icon>
        </button>

        <div class="flex items-center gap-2 border-l border-slate-200 pl-4">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#003366] text-xs font-semibold text-white">
            {{ initials() }}
          </div>
          <div class="hidden text-left leading-tight md:block">
            <p class="text-xs font-semibold text-slate-700">
              {{ authService.user()?.nombres }} {{ authService.user()?.apellidos }}
            </p>
            <p class="text-[11px] text-slate-400">{{ authService.user()?.role }}</p>
          </div>
        </div>
      </div>
    </header>
  `,
})
export class TopBarComponent {
  title = input('');
  eyebrow = input('Sistema de Alerta Temprana');

  readonly query = signal('');

  constructor(readonly authService: AuthService) {}

  initials() {
    const user = this.authService.user();
    if (!user) return '';
    return `${user.nombres?.[0] ?? ''}${user.apellidos?.[0] ?? ''}`.toUpperCase();
  }
}
