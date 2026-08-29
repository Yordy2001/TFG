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
import { SubjectsService } from '../../../subjects/subjects.service';
import { ClassroomObservationsService } from '../../../classroom-observations/classroom-observations.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';
import { Role } from '../../../core/models/auth.model';
import {
  CategoriaObservacion,
  Curso,
  Estudiante,
  HistorialRiesgo,
  ObservacionAula,
  Riesgo,
  SeguimientoOrientador,
} from '../../../core/models/domain.model';
import { RiskBadgeComponent } from '../../../shared/components/risk-badge/risk-badge.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { TopBarComponent } from '../../../shared/components/top-bar/top-bar.component';

const CATEGORIA_LABELS: Record<CategoriaObservacion, string> = {
  [CategoriaObservacion.INCIDENTE]: 'Incidente',
  [CategoriaObservacion.ACTITUD_POSITIVA]: 'Actitud positiva',
  [CategoriaObservacion.CONVIVENCIA]: 'Convivencia',
  [CategoriaObservacion.OBSERVACION_ACADEMICA]: 'Observación académica',
};

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
  readonly savingAjuste = signal(false);

  readonly observaciones = signal<ObservacionAula[]>([]);
  readonly canRecordObservation = signal(false);
  readonly docenteAsignaturas = signal<{ id: string; nombre: string }[]>([]);
  readonly observationCategoria = signal<CategoriaObservacion>(CategoriaObservacion.OBSERVACION_ACADEMICA);
  readonly observationFecha = signal(new Date().toISOString().slice(0, 10));
  readonly observationAsignaturaId = signal('');
  readonly observationDescripcion = signal('');
  readonly savingObservation = signal(false);
  readonly deletingObservationIds = signal<Set<string>>(new Set());
  readonly categorias = Object.values(CategoriaObservacion);

  readonly isOrientador = computed(() => this.authService.user()?.role === Role.ORIENTADOR);
  readonly isDocente = computed(() => this.authService.user()?.role === Role.DOCENTE);
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
    private readonly subjectsService: SubjectsService,
    private readonly classroomObservationsService: ClassroomObservationsService,
    private readonly notification: NotificationService,
    private readonly confirmDialog: ConfirmDialogService,
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

      if (this.isDocente()) {
        this.loadClassroomObservations(student.cursoId);
      }
    });

    this.riskService.current(this.estudianteId).subscribe((r) => this.riesgo.set(r));
    this.riskService.history(this.estudianteId).subscribe((h) => this.historial.set(h));
    this.attendanceService.summary(this.estudianteId).subscribe((a) => this.attendance.set(a));

    if (this.authService.user()?.role === Role.ORIENTADOR) {
      this.followUpService.byStudent(this.estudianteId).subscribe((s) => this.seguimientos.set(s));
    }
  }

  private loadClassroomObservations(cursoId: string) {
    this.classroomObservationsService.byStudent(this.estudianteId).subscribe({
      next: (obs) => {
        this.observaciones.set(obs);
        this.canRecordObservation.set(true);
      },
      error: () => this.canRecordObservation.set(false),
    });

    const docenteId = this.authService.user()?.id;
    this.subjectsService.findAssignments(docenteId).subscribe((asignaciones) => {
      const asignaturaIds = new Set(
        asignaciones.filter((a) => a.cursoId === cursoId).map((a) => a.asignaturaId),
      );
      this.subjectsService.findAll().subscribe((subjects) => {
        this.docenteAsignaturas.set(subjects.filter((s) => asignaturaIds.has(s.id)));
      });
    });
  }

  categoriaLabel(categoria: CategoriaObservacion) {
    return CATEGORIA_LABELS[categoria];
  }

  isOwnObservation(observacion: ObservacionAula) {
    return observacion.docenteId === this.authService.user()?.id;
  }

  isDeletingObservation(id: string) {
    return this.deletingObservationIds().has(id);
  }

  createObservation() {
    if (this.savingObservation() || !this.observationDescripcion().trim()) return;
    this.savingObservation.set(true);
    this.classroomObservationsService
      .create({
        estudianteId: this.estudianteId,
        asignaturaId: this.observationAsignaturaId() || undefined,
        fecha: this.observationFecha(),
        categoria: this.observationCategoria(),
        descripcion: this.observationDescripcion(),
      })
      .subscribe({
        next: (obs) => {
          this.savingObservation.set(false);
          this.notification.success('Observación de aula registrada correctamente.');
          this.observaciones.update((list) => [obs, ...list]);
          this.observationDescripcion.set('');
        },
        error: (err) => {
          this.savingObservation.set(false);
          this.notification.error(err?.error?.message ?? 'No se pudo registrar la observación.');
        },
      });
  }

  deleteObservation(observacion: ObservacionAula) {
    if (this.isDeletingObservation(observacion.id)) return;
    this.confirmDialog
      .confirm({
        title: 'Eliminar observación de aula',
        message: 'Esta observación se eliminará permanentemente. ¿Desea continuar?',
        confirmLabel: 'Eliminar',
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.deletingObservationIds.update((set) => new Set(set).add(observacion.id));
        this.classroomObservationsService.remove(observacion.id).subscribe({
          next: () => {
            this.deletingObservationIds.update((set) => {
              const next = new Set(set);
              next.delete(observacion.id);
              return next;
            });
            this.observaciones.update((list) => list.filter((o) => o.id !== observacion.id));
            this.notification.success('Observación eliminada correctamente.');
          },
          error: (err) => {
            this.deletingObservationIds.update((set) => {
              const next = new Set(set);
              next.delete(observacion.id);
              return next;
            });
            this.notification.error(err?.error?.message ?? 'No se pudo eliminar la observación.');
          },
        });
      });
  }

  applyAdjustment() {
    if (this.savingAjuste()) return;
    this.ajusteMessage.set(null);
    this.savingAjuste.set(true);
    this.riskService.applyAdjustment(this.estudianteId, this.ajuste()).subscribe({
      next: (r) => {
        this.savingAjuste.set(false);
        this.riesgo.set(r);
        this.riskService.history(this.estudianteId).subscribe((h) => this.historial.set(h));
        this.ajusteMessage.set('Ajuste aplicado correctamente.');
        this.notification.success('Ajuste de riesgo aplicado correctamente.');
        this.ajuste.set(0);
      },
      error: (err) => {
        this.savingAjuste.set(false);
        const message = err?.error?.message ?? 'No se pudo aplicar el ajuste.';
        this.ajusteMessage.set(message);
        this.notification.error(message);
      },
    });
  }
}
