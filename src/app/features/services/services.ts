import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LOCALIZED_ROUTES } from '../../core/i18n/localized-routes';

@Component({
  selector: 'app-services',
  imports: [RouterLink],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services {
  readonly routes = LOCALIZED_ROUTES;
}
