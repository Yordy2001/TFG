import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { StudentsService } from '../../students.service';
import { CoursesService } from '../../../courses/courses.service';
import { Curso, Estudiante } from '../../../core/models/domain.model';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/auth.model';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';
import { ImportStudentsDialogComponent } from '../../components/import-students-dialog/import-students-dialog.component';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './student-list.component.html',
})
export class StudentListComponent {
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly students = signal<Estudiante[]>([]);
  readonly courses = signal<Curso[]>([]);
  readonly cursoFilter = signal<string>('');
  readonly deactivatingIds = signal<Set<string>>(new Set());

  readonly canManage = computed(() => {
    const role = this.authService.user()?.role;
    return role === Role.ADMINISTRADOR || role === Role.REGISTRO;
  });

  readonly filtered = computed(() => {
    const filter = this.cursoFilter();
    const students = this.students();
    return filter ? students.filter((s) => s.cursoId === filter) : students;
  });

  courseName(cursoId: string) {
    return this.courses().find((c) => c.id === cursoId)?.nombre ?? '—';
  }

  constructor(
    private readonly studentsService: StudentsService,
    private readonly coursesService: CoursesService,
    readonly authService: AuthService,
  ) {
    this.coursesService.findAll().subscribe((courses) => this.courses.set(courses));
    this.reload();
  }

  private reload() {
    this.studentsService.findAll().subscribe((students) => {
      this.students.set(students);
      this.loading.set(false);
    });
  }

  openImportDialog() {
    this.dialog
      .open(ImportStudentsDialogComponent, { width: '720px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe((importedAny) => {
        if (importedAny) this.reload();
      });
  }

  isDeactivating(id: string) {
    return this.deactivatingIds().has(id);
  }

  deactivate(student: Estudiante) {
    if (this.isDeactivating(student.id)) return;
    this.confirmDialog
      .confirm({
        title: 'Desactivar estudiante',
        message: `¿Confirma que desea desactivar a ${student.nombres} ${student.apellidos}? El estudiante dejará de aparecer como activo, pero su historial se conserva.`,
        confirmLabel: 'Desactivar',
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.deactivatingIds.update((set) => new Set(set).add(student.id));
        this.studentsService.deactivate(student.id).subscribe({
          next: () => {
            this.deactivatingIds.update((set) => {
              const next = new Set(set);
              next.delete(student.id);
              return next;
            });
            this.notification.success('Estudiante desactivado correctamente.');
            this.reload();
          },
          error: (err) => {
            this.deactivatingIds.update((set) => {
              const next = new Set(set);
              next.delete(student.id);
              return next;
            });
            this.notification.error(err?.error?.message ?? 'No se pudo desactivar al estudiante.');
          },
        });
      });
  }
}
