import { Component, computed, signal } from '@angular/core';
import { NgApexchartsModule, ApexChart, ApexNonAxisChartSeries, ApexAxisChartSeries, ApexXAxis } from 'ng-apexcharts';
import { RouterLink } from '@angular/router';
import { DashboardService } from './dashboard.service';
import { DashboardOverview, NivelRiesgo } from '../core/models/domain.model';
import { RiskBadgeComponent } from '../shared/components/risk-badge/risk-badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgApexchartsModule, RouterLink, RiskBadgeComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  readonly loading = signal(true);
  readonly overview = signal<DashboardOverview | null>(null);

  readonly riskLevels = NivelRiesgo;

  readonly riskPieSeries = computed<ApexNonAxisChartSeries>(() => {
    const data = this.overview()?.riesgoPorNivel;
    return data ? [data.BAJO, data.MEDIO, data.ALTO] : [0, 0, 0];
  });

  readonly riskPieChart: ApexChart = { type: 'donut', height: 260 };
  readonly riskPieLabels = ['Riesgo bajo', 'Riesgo medio', 'Riesgo alto'];
  readonly riskPieColors = ['#22c55e', '#eab308', '#ef4444'];

  readonly cursoBarSeries = computed<ApexAxisChartSeries>(() => [
    { name: 'Estudiantes', data: this.overview()?.distribucionCurso.map((c) => c.total) ?? [] },
  ]);
  readonly cursoBarChart: ApexChart = { type: 'bar', height: 260 };
  readonly cursoBarXAxis = computed<ApexXAxis>(() => ({
    categories: this.overview()?.distribucionCurso.map((c) => c.nombre) ?? [],
  }));

  constructor(private readonly dashboardService: DashboardService) {
    this.dashboardService.overview().subscribe((data) => {
      this.overview.set(data);
      this.loading.set(false);
    });
  }
}
