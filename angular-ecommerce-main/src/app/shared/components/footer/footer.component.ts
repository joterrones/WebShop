import { Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { SettingsService } from '../../../core/services/settings.service';
import {
  formatWhatsappDisplay,
  whatsappChatUrl,
  whatsappDigits,
} from '../../utils/whatsapp.util';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.component.html',
})
export class FooterComponent implements OnInit {
  private readonly settingsService = inject(SettingsService);

  readonly currentYear = new Date().getFullYear();

  readonly socialUrls: Record<string, string> = {
    instagram: 'https://www.instagram.com/',
    tiktok: 'https://www.tiktok.com/',
    youtube: 'https://www.youtube.com/',
    facebook: 'https://www.facebook.com/',
  };

  readonly whatsappHref = toSignal(
    this.settingsService.whatsappNumber$.pipe(
      map((n) => whatsappChatUrl(n, 'Hola ALABA Sport')),
    ),
    { initialValue: '' },
  );

  readonly whatsappDisplay = toSignal(
    this.settingsService.whatsappNumber$.pipe(
      map((n) => formatWhatsappDisplay(n)),
    ),
    { initialValue: '' },
  );

  readonly hasWhatsapp = toSignal(
    this.settingsService.whatsappNumber$.pipe(
      map((n) => whatsappDigits(n).length > 0),
    ),
    { initialValue: false },
  );

  ngOnInit(): void {
    this.settingsService.ensureWhatsappLoaded();
  }

  socialHref(id: string): string {
    if (id === 'whatsapp') {
      return this.whatsappHref() || '#';
    }
    return this.socialUrls[id] ?? '#';
  }

  socialDisabled(id: string): boolean {
    return id === 'whatsapp' && !this.hasWhatsapp();
  }
}
