import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LOCALIZED_ROUTES } from '../../core/i18n/localized-routes';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  readonly routes = LOCALIZED_ROUTES;
  readonly currentYear = new Date().getFullYear();
}
