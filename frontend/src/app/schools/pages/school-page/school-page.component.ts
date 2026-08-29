import { Component, inject, signal } from '@angular/core';
import { SchoolsService, CentroEducativo } from '../../schools.service';
import { TopBarComponent } from '../../../shared/components/top-bar/top-bar.component';

@Component({
  selector: 'app-school-page',
  standalone: true,
  imports: [TopBarComponent],
  templateUrl: './school-page.component.html',
})
export class SchoolPageComponent {
  private readonly schoolsService = inject(SchoolsService);

  readonly loading = signal(true);
  readonly centro = signal<CentroEducativo | null>(null);
  readonly error = signal<string | null>(null);

  constructor() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.schoolsService.findMine().subscribe({
      next: (centro) => {
        this.loading.set(false);
        this.centro.set(centro);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo cargar la información del centro educativo.');
      },
    });
  }
}
