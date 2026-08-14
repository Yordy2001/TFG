import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { StudentsService } from '../../students.service';
import { CoursesService } from '../../../courses/courses.service';
import { RiskService } from '../../../risk/risk.service';
import { EvaluationsService, AsignaturaResultado } from '../../../evaluations/evaluations.service';
import { AttendanceService, AttendanceSummary } from '../../../attendance/attendance.service';
import { FollowUpService } from '../../../follow-up/follow-up.service';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/auth.model';
import { Curso, Estudiante, HistorialRiesgo, Riesgo, SeguimientoOrientador } from '../../../core/models/domain.model';
import { RiskBadgeComponent } from '../../../shared/components/risk-badge/risk-badge.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { TopBarComponent } from '../../../shared/components/top-bar/top-bar.component';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [FormsModule, DatePipe, RiskBadgeComponent, StatCardComponent, TopBarComponent, MatIconModule],
  templateUrl: './student-detail.component.html',
})
export class StudentDetailComponent {
  readonly student = signal<Estudiante | null>(null);
  readonly course = signal<Curso | null>(null);
  readonly riesgo = signal<Riesgo | null>(null);
  readonly historial = signal<HistorialRiesgo[]>([]);
  readonly resultados = signal<AsignaturaResultado[]>([]);
  readonly promedioGeneral = signal(0);
  readonly attendance = signal<AttendanceSummary | null>(null);
  readonly seguimientos = signal<SeguimientoOrientador[]>([]);
  readonly ajuste = signal(0);
  readonly ajusteMessage = signal<string | null>(null);

  readonly isOrientador = computed(() => this.authService.user()?.role === Role.ORIENTADOR);
  readonly canSeeAcademic = computed(() => this.authService.user()?.role !== Role.ORIENTADOR);

  private readonly estudianteId: string;

  constructor(
    route: ActivatedRoute,
    private readonly studentsService: StudentsService,
    private readonly coursesService: CoursesService,
    private readonly riskService: RiskService,
    private readonly evaluationsService: EvaluationsService,
    private readonly attendanceService: AttendanceService,
    private readonly followUpService: FollowUpService,
    readonly authService: AuthService,
  ) {
    this.estudianteId = route.snapshot.paramMap.get('id')!;
    this.load();
  }

  private load() {
    this.studentsService.findOne(this.estudianteId).subscribe((student) => {
      this.student.set(student);
      this.coursesService.findAll().subscribe((courses) => {
        this.course.set(courses.find((c) => c.id === student.cursoId) ?? null);
      });

      this.evaluationsService.resultadosEstudiante(this.estudianteId, student.cursoId).subscribe((res) => {
        this.resultados.set(res.asignaturas);
        this.promedioGeneral.set(res.promedioGeneral);
      });
    });

    this.riskService.current(this.estudianteId).subscribe((r) => this.riesgo.set(r));
    this.riskService.history(this.estudianteId).subscribe((h) => this.historial.set(h));
    this.attendanceService.summary(this.estudianteId).subscribe((a) => this.attendance.set(a));

    if (this.authService.user()?.role === Role.ORIENTADOR || this.authService.user()?.role === Role.ADMINISTRADOR) {
      this.followUpService.byStudent(this.estudianteId).subscribe((s) => this.seguimientos.set(s));
    }
  }

  applyAdjustment() {
    this.ajusteMessage.set(null);
    this.riskService.applyAdjustment(this.estudianteId, this.ajuste()).subscribe({
      next: (r) => {
        this.riesgo.set(r);
        this.riskService.history(this.estudianteId).subscribe((h) => this.historial.set(h));
        this.ajusteMessage.set('Ajuste aplicado correctamente.');
        this.ajuste.set(0);
      },
      error: () => this.ajusteMessage.set('No se pudo aplicar el ajuste.'),
    });
  }
}
