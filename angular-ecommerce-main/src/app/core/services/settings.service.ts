import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WhatsappSetting {
  whatsappNumber: string;
  updatedAt: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/settings`;

  private readonly whatsappSubject = new BehaviorSubject<string>('');
  readonly whatsappNumber$ = this.whatsappSubject.asObservable();

  getWhatsapp(): Observable<WhatsappSetting> {
    return this.http.get<WhatsappSetting>(`${this.baseUrl}/whatsapp`).pipe(
      tap((setting) => {
        this.whatsappSubject.next(setting.whatsappNumber ?? '');
      }),
    );
  }

  updateWhatsapp(whatsappNumber: string): Observable<WhatsappSetting> {
    return this.http
      .put<WhatsappSetting>(`${this.baseUrl}/whatsapp`, {
        whatsappNumber,
      })
      .pipe(
        tap((setting) => {
          this.whatsappSubject.next(setting.whatsappNumber ?? '');
        }),
      );
  }

  /** Carga el número si aún no está en memoria */
  ensureWhatsappLoaded(): void {
    if (this.whatsappSubject.value) return;
    this.getWhatsapp().subscribe({ error: () => undefined });
  }
}
