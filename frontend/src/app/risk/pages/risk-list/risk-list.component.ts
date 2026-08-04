import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RiskService } from '../../risk.service';
import { StudentsService } from '../../../students/students.service';
import { Estudiante, Riesgo } from '../../../core/models/domain.model';
import { RiskBadgeComponent } from '../../../shared/components/risk-badge/risk-badge.component';

@Component({
  selector: 'app-risk-list',
  standalone: true,
  imports: [RouterLink, RiskBadgeComponent],
  templateUrl: './risk-list.component.html',
})
export class RiskListComponent {
  readonly riesgos = signal<Riesgo[]>([]);
  readonly students = signal<Estudiante[]>([]);
  readonly loading = signal(true);

  readonly rows = computed(() =>
    [...this.riesgos()]
      .sort((a, b) => b.porcentaje - a.porcentaje)
      .map((r) => ({ riesgo: r, estudiante: this.students().find((s) => s.id === r.estudianteId) })),
  );

  constructor(
    private readonly riskService: RiskService,
    private readonly studentsService: StudentsService,
  ) {
    this.studentsService.findAll().subscribe((students) => this.students.set(students));
    this.riskService.list().subscribe((riesgos) => {
      this.riesgos.set(riesgos);
      this.loading.set(false);
    });
  }
}
