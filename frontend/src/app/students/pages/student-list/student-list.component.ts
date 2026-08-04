import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentsService } from '../../students.service';
import { CoursesService } from '../../../courses/courses.service';
import { Curso, Estudiante } from '../../../core/models/domain.model';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/auth.model';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './student-list.component.html',
})
export class StudentListComponent {
  readonly loading = signal(true);
  readonly students = signal<Estudiante[]>([]);
  readonly courses = signal<Curso[]>([]);
  readonly cursoFilter = signal<string>('');

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
    this.studentsService.findAll().subscribe((students) => {
      this.students.set(students);
      this.loading.set(false);
    });
  }
}
