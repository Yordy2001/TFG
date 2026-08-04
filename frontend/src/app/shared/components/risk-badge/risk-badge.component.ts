import { Component, input } from '@angular/core';
import { NivelRiesgo } from '../../../core/models/domain.model';

@Component({
  selector: 'app-risk-badge',
  standalone: true,
  template: `<span class="risk-badge" [class]="'risk-badge--' + nivel().toLowerCase()">{{ label() }}</span>`,
})
export class RiskBadgeComponent {
  nivel = input.required<NivelRiesgo>();

  label() {
    const map: Record<NivelRiesgo, string> = {
      [NivelRiesgo.BAJO]: 'Riesgo bajo',
      [NivelRiesgo.MEDIO]: 'Riesgo medio',
      [NivelRiesgo.ALTO]: 'Riesgo alto',
    };
    return map[this.nivel()];
  }
}
