import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/auth.model';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles?: Role[];
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  private readonly allNav: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Estudiantes', path: '/students', icon: 'groups' },
    { label: 'Cursos', path: '/courses', icon: 'school' },
    { label: 'Asignaturas', path: '/subjects', icon: 'menu_book' },
    {
      label: 'Evaluaciones',
      path: '/evaluations',
      icon: 'edit_note',
      roles: [Role.DOCENTE, Role.ADMINISTRADOR],
    },
    {
      label: 'Asistencia',
      path: '/attendance',
      icon: 'event_available',
      roles: [Role.DOCENTE, Role.ADMINISTRADOR],
    },
    { label: 'Riesgo', path: '/risk', icon: 'warning' },
    {
      label: 'Seguimiento',
      path: '/follow-up',
      icon: 'psychology',
      roles: [Role.ORIENTADOR],
    },
    { label: 'Usuarios', path: '/users', icon: 'manage_accounts', roles: [Role.ADMINISTRADOR] },
    { label: 'Centro Educativo', path: '/school', icon: 'apartment' },
  ];

  constructor(readonly authService: AuthService) {}

  readonly nav = computed(() => {
    const role = this.authService.user()?.role;
    return this.allNav.filter((item) => !item.roles || (role && item.roles.includes(role)));
  });

  logout() {
    this.authService.logout();
  }

  initials() {
    const user = this.authService.user();
    if (!user) return '';
    return `${user.nombres?.[0] ?? ''}${user.apellidos?.[0] ?? ''}`.toUpperCase();
  }
}
