import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  template: `
    <header class="card mb-6 flex items-center justify-between">
      <div>
        <p class="text-xs font-medium text-slate-400">{{ eyebrow() }}</p>
        <h1 class="text-lg font-semibold text-slate-900">{{ title() }}</h1>
      </div>

      <div class="flex items-center gap-4">
        <a
          routerLink="/profile"
          class="flex items-center gap-2 border-l border-slate-200 pl-4 hover:opacity-80"
          title="Ver mi perfil"
        >
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#003366] text-xs font-semibold text-white">
            {{ initials() }}
          </div>
          <div class="hidden text-left leading-tight md:block">
            <p class="text-xs font-semibold text-slate-700">
              {{ authService.user()?.nombres }} {{ authService.user()?.apellidos }}
            </p>
            <p class="text-[11px] text-slate-400">{{ authService.user()?.role }}</p>
          </div>
        </a>
      </div>
    </header>
  `,
})
export class TopBarComponent {
  title = input('');
  eyebrow = input('Sistema de Alerta Temprana');

  constructor(readonly authService: AuthService) {}

  initials() {
    const user = this.authService.user();
    if (!user) return '';
    return `${user.nombres?.[0] ?? ''}${user.apellidos?.[0] ?? ''}`.toUpperCase();
  }
}
