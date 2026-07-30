import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export type UserRole = 'admin' | 'user';

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

interface MeResponse {
  user: AuthUser;
}

const TOKEN_KEY = 'alaba_auth_token';
const USER_KEY = 'alaba_auth_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = environment.apiUrl;

  private readonly userSubject = new BehaviorSubject<AuthUser | null>(
    this.readStoredUser(),
  );

  readonly user$ = this.userSubject.asObservable();
  readonly isAdmin$ = this.user$.pipe(map((u) => u?.role === 'admin'));
  readonly isLoggedIn$ = this.user$.pipe(map((u) => !!u));

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  get currentUser(): AuthUser | null {
    return this.userSubject.value;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.token);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          this.userSubject.next(res.user);
        }),
      );
  }

  /** Valida el token guardado contra el backend (opcional al iniciar). */
  restoreSession(): Observable<AuthUser | null> {
    const token = this.token;
    if (!token) {
      this.clearSession();
      return of(null);
    }

    return this.http.get<MeResponse>(`${this.apiUrl}/auth/me`).pipe(
      tap((res) => {
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        this.userSubject.next(res.user);
      }),
      map((res) => res.user),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
    );
  }

  logout(navigateToLogin = false): void {
    this.clearSession();
    if (navigateToLogin) {
      void this.router.navigate(['/login']);
    }
  }

  changePassword(
    currentPassword: string,
    newPassword: string,
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/auth/change-password`,
      { currentPassword, newPassword },
    );
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser && !!this.token;
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSubject.next(null);
  }

  private readStoredUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      const user = JSON.parse(raw) as AuthUser;
      if (!user?.id || !user?.username || !user?.role) return null;
      if (!localStorage.getItem(TOKEN_KEY)) return null;
      return user;
    } catch {
      return null;
    }
  }
}
