import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const next = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  if (!next || !confirm) return null;
  return next === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  submitting = false;
  errorMessage = '';
  successMessage = '';

  readonly username = this.auth.currentUser?.username ?? '';

  readonly form = this.fb.nonNullable.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );

  ngOnInit(): void {
    if (!this.auth.isLoggedIn) {
      void this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/cuenta/clave' },
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      if (this.form.get('newPassword')?.invalid) {
        this.errorMessage = 'La clave no cumple con los requisitos';
        this.successMessage = '';
      } else if (this.form.hasError('mismatch')) {
        this.errorMessage = 'Las claves no coinciden';
        this.successMessage = '';
      }
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    const { currentPassword, newPassword } = this.form.getRawValue();

    this.auth.changePassword(currentPassword, newPassword).subscribe({
      next: (res) => {
        this.submitting = false;
        this.successMessage = res.message || 'Contraseña actualizada';
        this.form.reset();
      },
      error: (err) => {
        this.submitting = false;
        const details = err?.error?.details?.newPassword;
        if (Array.isArray(details) && details.length > 0) {
          this.errorMessage = 'La clave no cumple con los requisitos';
          return;
        }
        this.errorMessage =
          err?.error?.error ??
          'No se pudo cambiar la contraseña. Intenta de nuevo.';
      },
    });
  }
}