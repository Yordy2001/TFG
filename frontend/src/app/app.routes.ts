import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Role } from './core/models/auth.model';

export const routes: Routes = [
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./students/pages/student-list/student-list.component').then((m) => m.StudentListComponent),
      },
      {
        path: 'students/new',
        loadComponent: () =>
          import('./students/pages/student-form/student-form.component').then((m) => m.StudentFormComponent),
        canActivate: [roleGuard([Role.ADMINISTRADOR, Role.REGISTRO])],
      },
      {
        path: 'students/:id',
        loadComponent: () =>
          import('./students/pages/student-detail/student-detail.component').then((m) => m.StudentDetailComponent),
      },
      {
        path: 'courses',
        loadComponent: () =>
          import('./courses/pages/course-list/course-list.component').then((m) => m.CourseListComponent),
      },
      {
        path: 'subjects',
        loadComponent: () =>
          import('./subjects/pages/subject-list/subject-list.component').then((m) => m.SubjectListComponent),
      },
      {
        path: 'evaluations',
        loadComponent: () =>
          import('./evaluations/pages/evaluation-page/evaluation-page.component').then(
            (m) => m.EvaluationPageComponent,
          ),
        canActivate: [roleGuard([Role.DOCENTE, Role.ADMINISTRADOR])],
      },
      {
        path: 'attendance',
        loadComponent: () =>
          import('./attendance/pages/attendance-page/attendance-page.component').then(
            (m) => m.AttendancePageComponent,
          ),
        canActivate: [roleGuard([Role.DOCENTE, Role.ADMINISTRADOR])],
      },
      {
        path: 'risk',
        loadComponent: () => import('./risk/pages/risk-list/risk-list.component').then((m) => m.RiskListComponent),
      },
      {
        path: 'follow-up',
        loadComponent: () =>
          import('./follow-up/pages/follow-up-list/follow-up-list.component').then(
            (m) => m.FollowUpListComponent,
          ),
        canActivate: [roleGuard([Role.ORIENTADOR])],
      },
      {
        path: 'users',
        loadComponent: () => import('./users/pages/user-list/user-list.component').then((m) => m.UserListComponent),
        canActivate: [roleGuard([Role.ADMINISTRADOR])],
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./profile/pages/profile-page/profile-page.component').then((m) => m.ProfilePageComponent),
      },
      {
        path: 'school',
        loadComponent: () =>
          import('./schools/pages/school-page/school-page.component').then((m) => m.SchoolPageComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
