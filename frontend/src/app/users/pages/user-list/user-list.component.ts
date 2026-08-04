import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UsersService, UserRecord } from '../../users.service';
import { Role } from '../../../core/models/auth.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-list.component.html',
})
export class UserListComponent {
  private readonly usersService = inject(UsersService);
  private readonly fb = inject(FormBuilder);

  readonly users = signal<UserRecord[]>([]);
  readonly loading = signal(true);
  readonly showForm = signal(false);
  readonly roles = Object.values(Role);

  readonly form = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rol: [Role.DOCENTE, Validators.required],
  });

  constructor() {
    this.load();
  }

  private load() {
    this.usersService.findAll().subscribe((users) => {
      this.users.set(users);
      this.loading.set(false);
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.usersService.create(this.form.getRawValue() as any).subscribe(() => {
      this.form.reset({ rol: Role.DOCENTE });
      this.showForm.set(false);
      this.load();
    });
  }

  toggleActive(user: UserRecord) {
    this.usersService.setActive(user.id, !user.activo).subscribe(() => this.load());
  }
}
