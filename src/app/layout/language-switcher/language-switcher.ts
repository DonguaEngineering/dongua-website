import { Component, inject, LOCALE_ID } from '@angular/core';
import { Router } from '@angular/router';

import {
  LOCALIZED_ROUTE_PATHS,
  RouteKey,
  SupportedLocale,
} from '../../core/i18n/route-locales';

@Component({
  selector: 'app-language-switcher',
  imports: [],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss',
})
export class LanguageSwitcher {
  private readonly router = inject(Router);

  readonly currentLocale =
    inject(LOCALE_ID).split('-')[0] as SupportedLocale;

  getLanguageUrl(targetLocale: SupportedLocale): string {
    const currentPath = this.router.url
      .split('?')[0]
      .split('#')[0]
      .replace(/^\/|\/$/g, '');

    const routeKey =
      (Object.keys(
        LOCALIZED_ROUTE_PATHS[this.currentLocale],
      ) as RouteKey[]).find(
        (key) =>
          LOCALIZED_ROUTE_PATHS[this.currentLocale][key] === currentPath,
      ) ?? 'home';

    const targetPath =
      LOCALIZED_ROUTE_PATHS[targetLocale][routeKey];

    return targetPath
      ? `/${targetLocale}/${targetPath}`
      : `/${targetLocale}/`;
  }
}
