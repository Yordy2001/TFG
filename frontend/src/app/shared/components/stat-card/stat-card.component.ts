import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

type Tone = 'neutral' | 'danger' | 'warning' | 'success';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div [class]="cardClass()">
      <div>
        <p class="text-xs font-medium text-slate-500">{{ label() }}</p>
        <p class="mt-1 text-2xl font-semibold" [class]="valueClass()">{{ value() }}</p>
        @if (hint()) {
          <p class="mt-1 text-xs text-slate-400">{{ hint() }}</p>
        }
      </div>
      @if (icon()) {
        <div [class]="iconWrapClass()">
          <mat-icon class="!h-5 !w-5 !text-[20px]">{{ icon() }}</mat-icon>
        </div>
      }
    </div>
  `,
})
export class StatCardComponent {
  label = input.required<string>();
  value = input.required<string | number>();
  hint = input<string | null>(null);
  icon = input<string | null>(null);
  tone = input<Tone>('neutral');

  private readonly toneMap: Record<Tone, { card: string; value: string; icon: string }> = {
    neutral: { card: 'card', value: 'text-slate-900', icon: 'bg-slate-100 text-[#003366]' },
    danger: {
      card: 'card ring-2 ring-[#d92d20] bg-[#fee4e2]',
      value: 'text-[#d92d20]',
      icon: 'bg-white text-[#d92d20]',
    },
    warning: { card: 'card', value: 'text-amber-600', icon: 'bg-amber-100 text-amber-600' },
    success: { card: 'card', value: 'text-green-600', icon: 'bg-green-100 text-green-600' },
  };

  cardClass = computed(() => `${this.toneMap[this.tone()].card} flex items-start justify-between`);
  valueClass = computed(() => this.toneMap[this.tone()].value);
  iconWrapClass = computed(
    () => `flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${this.toneMap[this.tone()].icon}`,
  );
}
