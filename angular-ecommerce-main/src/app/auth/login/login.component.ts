import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  submitting = false;
  errorMessage = '';

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  ngOnInit(): void {
    if (this.auth.isLoggedIn) {
      void this.router.navigateByUrl(this.returnUrl());
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    const { username, password } = this.form.getRawValue();

    this.auth.login(username.trim(), password).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.user.role === 'admin') {
          void this.router.navigateByUrl(this.returnUrl());
          return;
        }
        void this.router.navigateByUrl('/cuenta/clave');
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage =
          err?.error?.error ?? 'No se pudo iniciar sesión. Intenta de nuevo.';
      },
    });
  }

  private returnUrl(): string {
    const url = this.route.snapshot.queryParamMap.get('returnUrl');
    if (url && url.startsWith('/') && !url.startsWith('//')) {
      return url;
    }
    return this.auth.isAdmin ? '/admin/pedidos' : '/cuenta/clave';
  }
}