import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LanguageSwitcher } from '../language-switcher/language-switcher'

import { LOCALIZED_ROUTES} from '../../core/i18n/localized-routes';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, LanguageSwitcher],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  readonly routes = LOCALIZED_ROUTES;
}
